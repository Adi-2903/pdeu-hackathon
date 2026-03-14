"""
TalentOS AI Service v2.0 — Groq + FAISS + Resume Generation + ATS Scoring
Uses Groq (Llama 3.3 70B) for generation, sentence-transformers for local
embeddings, FAISS for semantic search, Jinja2 for resume templates.
"""

import os, json, time, uuid, random, re, math
import numpy as np
import faiss
from pathlib import Path
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from typing import Optional
from jinja2 import Environment, FileSystemLoader

# ──────────────────────────────────────────────
#  Configuration
# ──────────────────────────────────────────────
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
GROQ_MODEL = "llama-3.3-70b-versatile"
EMBEDDING_DIM = 384  # MiniLM output dimension
BASE_DIR = Path(__file__).parent
DATA_FILE = BASE_DIR / "candidates_store.json"
FAISS_INDEX_FILE = BASE_DIR / "faiss_index.bin"
NODE_DB_FILE = BASE_DIR.parent / "data.json"  # Main app DB

# ──────────────────────────────────────────────
#  App Setup
# ──────────────────────────────────────────────
app = FastAPI(title="TalentOS AI Service", version="2.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

# ──────────────────────────────────────────────
#  Lazy-loaded Models (avoid slow startup)
# ──────────────────────────────────────────────
_groq_client = None
_embed_model = None

def get_groq():
    global _groq_client
    if _groq_client is None:
        from groq import Groq
        _groq_client = Groq(api_key=GROQ_API_KEY)
        print("[AI] Groq client initialized")
    return _groq_client

def get_embedder():
    global _embed_model
    if _embed_model is None:
        from sentence_transformers import SentenceTransformer
        _embed_model = SentenceTransformer("all-MiniLM-L6-v2")
        print("[AI] Embedding model loaded (all-MiniLM-L6-v2)")
    return _embed_model

# ──────────────────────────────────────────────
#  Template Engine
# ──────────────────────────────────────────────
jinja_env = Environment(loader=FileSystemLoader(str(BASE_DIR / "templates")))

# ──────────────────────────────────────────────
#  In-Memory State
# ──────────────────────────────────────────────
candidates_store: list[dict] = []
faiss_index: faiss.IndexFlatIP = None

def initialize():
    global candidates_store, faiss_index
    if DATA_FILE.exists():
        candidates_store = json.loads(DATA_FILE.read_text(encoding="utf-8"))
        print(f"[AI] Loaded {len(candidates_store)} candidates from disk.")
    if FAISS_INDEX_FILE.exists() and len(candidates_store) > 0:
        faiss_index = faiss.read_index(str(FAISS_INDEX_FILE))
        print(f"[AI] Loaded FAISS index ({faiss_index.ntotal} vectors)")
    else:
        faiss_index = faiss.IndexFlatIP(EMBEDDING_DIM)

def persist():
    DATA_FILE.write_text(json.dumps(candidates_store, indent=2), encoding="utf-8")
    if faiss_index and faiss_index.ntotal > 0:
        faiss.write_index(faiss_index, str(FAISS_INDEX_FILE))

# ──────────────────────────────────────────────
#  Pydantic Models
# ──────────────────────────────────────────────
class GenerateRequest(BaseModel):
    count: int = 50
    domain: Optional[str] = None

class SearchRequest(BaseModel):
    query: str
    top_k: int = 20

class ATSRequest(BaseModel):
    candidate_id: str
    job_description: Optional[str] = "Senior Full Stack Engineer with expertise in React, Node.js, Python, AWS, and agile methodologies."

# ──────────────────────────────────────────────
#  Helpers
# ──────────────────────────────────────────────
def candidate_to_text(c: dict) -> str:
    parts = [
        f"{c.get('full_name','')} — {c.get('current_role','')} at {c.get('current_company','')}",
        f"Location: {c.get('location','')}",
        f"Experience: {c.get('years_of_experience',0)} years | Seniority: {c.get('seniority_level','')}",
        f"Skills: {', '.join(c.get('skills',[]))}",
        f"Education: {c.get('education','')}",
        f"Summary: {c.get('summary','')}",
    ]
    return "\n".join(parts)

def sync_to_node_db(new_candidates: list[dict]):
    """Write generated candidates into the Node.js main data.json for full app sync."""
    try:
        if NODE_DB_FILE.exists():
            db = json.loads(NODE_DB_FILE.read_text(encoding="utf-8"))
        else:
            db = {"candidates": [], "candidate_skills": [], "work_experience": [], "education": [],
                  "certifications": [], "jobs": [], "pipeline_stages": [], "applications": [],
                  "sources": [], "notes": [], "activity_log": [], "email_threads": [],
                  "duplicate_groups": [], "search_queries": [], "passive_pool": [],
                  "company_values": [], "interview_feedback": [], "talent_radar_scores": []}

        now = time.strftime("%Y-%m-%dT%H:%M:%SZ")
        for c in new_candidates:
            cid = c["id"]
            # Add candidate record
            db_candidate = {
                "id": cid, "full_name": c.get("full_name",""), "email": c.get("email",""),
                "phone": c.get("phone",""), "location": c.get("location",""),
                "summary": c.get("summary",""), "seniority_level": c.get("seniority_level",""),
                "years_of_experience": c.get("years_of_experience",0),
                "current_role": c.get("current_role",""), "current_company": c.get("current_company",""),
                "source": c.get("source","LinkedIn"), "status": c.get("status","Active"),
                "overall_score": c.get("overall_score",75), "ghost_status": 0, "in_passive_pool": 0,
                "resume_text": c.get("summary",""), "cover_letter": "", "avatar_url": None,
                "ats_score": c.get("ats_score", random.randint(60,95)),
                "created_at": now, "updated_at": now,
            }
            db["candidates"].append(db_candidate)

            # Add skills
            for skill in c.get("skills", []):
                db["candidate_skills"].append({
                    "id": str(uuid.uuid4()), "candidate_id": cid,
                    "skill_name": skill, "category": "Technical",
                    "proficiency_level": random.randint(3,5),
                })

            # Add work experience
            for exp in c.get("work_experience", []):
                db.setdefault("work_experience", []).append({
                    "id": str(uuid.uuid4()), "candidate_id": cid,
                    "company": exp.get("company",""), "title": exp.get("title",""),
                    "start_date": exp.get("start_date",""), "end_date": exp.get("end_date",""),
                    "description": exp.get("description",""),
                })

            # Add education
            for edu in c.get("education_list", []):
                db.setdefault("education", []).append({
                    "id": str(uuid.uuid4()), "candidate_id": cid,
                    "institution": edu.get("institution",""), "degree": edu.get("degree",""),
                    "year": edu.get("year",""),
                })

            # Add certifications
            for cert in c.get("certifications", []):
                db.setdefault("certifications", []).append({
                    "id": str(uuid.uuid4()), "candidate_id": cid,
                    "name": cert.get("name",""), "issuer": cert.get("issuer",""),
                })

        NODE_DB_FILE.write_text(json.dumps(db, indent=2), encoding="utf-8")
        print(f"[AI] Synced {len(new_candidates)} candidates to Node.js data.json")
    except Exception as e:
        print(f"[AI] Warning: Could not sync to Node DB: {e}")

# ──────────────────────────────────────────────
#  Groq Generation
# ──────────────────────────────────────────────
GENERATION_PROMPT = """Generate exactly {count} realistic candidate profiles as a JSON array. Each must have:
- "full_name": diverse names (Indian, American, European, East Asian, Latin American)
- "current_role": realistic tech job title
- "current_company": well-known company
- "location": "City, Country"
- "years_of_experience": int 1-20
- "seniority_level": "Junior" | "Mid-Level" | "Senior" | "Lead" | "Director"
- "skills": array of 5-10 technical skills
- "education": "Degree — University"
- "email": realistic email
- "phone": phone with country code
- "source": "LinkedIn"
- "summary": 2-3 sentence professional summary
- "overall_score": int 60-98
- "work_experience": array of 2-3 objects with "company", "title", "start_date" (YYYY), "end_date" (YYYY or "Present"), "description" (1 sentence)
- "education_list": array of 1-2 objects with "institution", "degree", "year"
- "certifications": array of 0-2 objects with "name", "issuer"
{domain_instruction}
Return ONLY a valid JSON array. No markdown, no explanation."""

def generate_candidates_groq(count: int, domain: str = None) -> list[dict]:
    client = get_groq()
    domain_instruction = f'Focus on "{domain}" domain. Make skills/experience relevant.' if domain else ""
    batch_size = 15  # Groq handles smaller batches better
    all_candidates = []

    for i in range(0, count, batch_size):
        current = min(batch_size, count - i)
        prompt = GENERATION_PROMPT.format(count=current, domain_instruction=domain_instruction)

        try:
            resp = client.chat.completions.create(
                model=GROQ_MODEL,
                messages=[{"role": "user", "content": prompt}],
                temperature=1.0,
                max_tokens=8000,
            )
            text = resp.choices[0].message.content.strip()
            # Strip markdown fences
            if text.startswith("```"):
                text = re.sub(r'^```\w*\n?', '', text)
                text = re.sub(r'\n?```$', '', text)
                text = text.strip()

            batch = json.loads(text)
            for c in batch:
                c["id"] = str(uuid.uuid4())
                c["created_at"] = time.strftime("%Y-%m-%dT%H:%M:%SZ")
                c["status"] = random.choice(["New","Screening","Shortlisted","Interview"])
                c["pipeline_stage"] = random.choice(["Applied","Screening","Interview","Offer"])
                c["ats_score"] = random.randint(55, 95)
            all_candidates.extend(batch)
            print(f"[AI] Groq batch {i//batch_size+1}: {len(batch)} candidates")
        except Exception as e:
            print(f"[AI] Groq error batch {i//batch_size+1}: {e}")
            continue

        if i + batch_size < count:
            time.sleep(2)  # Groq rate limit spacing

    return all_candidates

# ──────────────────────────────────────────────
#  ATS Scoring
# ──────────────────────────────────────────────
def compute_ats_score(candidate: dict, job_description: str) -> dict:
    """Compute ATS compatibility score based on keyword matching and skills analysis."""
    jd_lower = job_description.lower()
    jd_words = set(re.findall(r'\b[a-zA-Z+#.]{2,}\b', jd_lower))

    candidate_text = candidate_to_text(candidate).lower()
    cand_words = set(re.findall(r'\b[a-zA-Z+#.]{2,}\b', candidate_text))

    skills = [s.lower() for s in candidate.get("skills", [])]
    jd_skills_found = [s for s in skills if s in jd_lower or any(s in w for w in jd_words)]
    
    # Score components
    keyword_overlap = len(jd_words & cand_words) / max(len(jd_words), 1)
    skills_match = len(jd_skills_found) / max(len(skills), 1)
    experience_score = min(candidate.get("years_of_experience", 0) / 10, 1.0)

    has_education = 1.0 if candidate.get("education") else 0.5
    has_certifications = 1.0 if candidate.get("certifications") else 0.7

    raw = (keyword_overlap * 30 + skills_match * 35 + experience_score * 15 + has_education * 10 + has_certifications * 10)
    final_score = max(25, min(98, int(raw)))

    matched_keywords = sorted(list(jd_words & cand_words))[:15]
    missing_keywords = sorted(list(jd_words - cand_words))[:10]

    return {
        "ats_score": final_score,
        "keyword_match": round(keyword_overlap * 100, 1),
        "skills_match": round(skills_match * 100, 1),
        "experience_score": round(experience_score * 100, 1),
        "matched_skills": jd_skills_found,
        "matched_keywords": matched_keywords,
        "missing_keywords": missing_keywords,
        "recommendations": [
            f"Add these missing keywords: {', '.join(missing_keywords[:5])}" if missing_keywords else "Great keyword coverage!",
            f"Skills alignment: {len(jd_skills_found)}/{len(skills)} match the JD" if skills else "Add more technical skills",
            "Consider adding relevant certifications" if not candidate.get("certifications") else "Certifications look good",
        ],
        "grade": "A" if final_score >= 85 else "B" if final_score >= 70 else "C" if final_score >= 55 else "D",
    }

# ──────────────────────────────────────────────
#  API Endpoints
# ──────────────────────────────────────────────
@app.get("/")
def health():
    return {"status": "ok", "service": "TalentOS AI v2.0 (Groq + FAISS)",
            "candidates": len(candidates_store), "vectors": faiss_index.ntotal if faiss_index else 0}

@app.post("/generate")
def generate_candidates(req: GenerateRequest):
    global candidates_store
    try:
        new = generate_candidates_groq(req.count, req.domain)
        candidates_store.extend(new)
        persist()
        sync_to_node_db(new)
        return {"status": "success", "generated": len(new), "total_candidates": len(candidates_store),
                "message": f"Generated {len(new)} candidates via Groq AI"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/embed")
def embed_candidates():
    global faiss_index
    if not candidates_store:
        return {"status": "success", "embedded": 0}

    model = get_embedder()
    texts = [candidate_to_text(c) for c in candidates_store]
    embeddings = model.encode(texts, show_progress_bar=True, batch_size=32)
    vectors = np.array(embeddings, dtype=np.float32)
    faiss.normalize_L2(vectors)

    faiss_index = faiss.IndexFlatIP(EMBEDDING_DIM)
    faiss_index.add(vectors)
    persist()

    return {"status": "success", "embedded": len(candidates_store), "total_vectors": faiss_index.ntotal}

@app.post("/search")
def semantic_search(req: SearchRequest):
    if not faiss_index or faiss_index.ntotal == 0:
        return {"status": "success", "results": [], "message": "No candidates indexed. Generate and embed first."}

    model = get_embedder()
    query_vec = model.encode([req.query])
    query_vec = np.array(query_vec, dtype=np.float32)
    faiss.normalize_L2(query_vec)

    k = min(req.top_k, faiss_index.ntotal)
    scores, indices = faiss_index.search(query_vec, k)

    results = []
    for score, idx in zip(scores[0], indices[0]):
        if idx < 0 or idx >= len(candidates_store):
            continue
        c = candidates_store[idx].copy()
        c["similarity_score"] = round(float(score) * 100, 1)
        c["match_reason"] = f"Semantic match ({c['similarity_score']}% relevance) — {c.get('summary','')[:100]}"
        results.append(c)

    return {"status": "success", "query": req.query, "results": results, "total_results": len(results)}

@app.get("/candidates")
def get_candidates(skip: int = 0, limit: int = 200):
    return {"status": "success", "candidates": candidates_store[skip:skip+limit],
            "total": len(candidates_store), "skip": skip, "limit": limit}

@app.delete("/candidates")
def clear_candidates():
    global candidates_store, faiss_index
    candidates_store = []
    faiss_index = faiss.IndexFlatIP(EMBEDDING_DIM)
    for f in [DATA_FILE, FAISS_INDEX_FILE]:
        if f.exists(): f.unlink()
    return {"status": "success", "message": "Cleared all candidates and index."}

@app.get("/generate-resume/{candidate_id}", response_class=HTMLResponse)
def generate_resume(candidate_id: str):
    c = next((x for x in candidates_store if x["id"] == candidate_id), None)
    if not c:
        raise HTTPException(404, "Candidate not found")

    skills_list = [{"name": s, "proficiency": random.randint(3,5)} for s in c.get("skills",[])]
    experiences = c.get("work_experience", [])
    education = c.get("education_list", [])
    certs = c.get("certifications", [])
    ats = c.get("ats_score", random.randint(60,90))

    template = jinja_env.get_template("resume.html")
    html = template.render(candidate=c, skills=skills_list, experiences=experiences,
                           education=education, certifications=certs, ats_score=ats)
    return HTMLResponse(content=html)

@app.post("/ats-score")
def ats_score(req: ATSRequest):
    c = next((x for x in candidates_store if x["id"] == req.candidate_id), None)
    if not c:
        raise HTTPException(404, "Candidate not found")

    result = compute_ats_score(c, req.job_description)
    # Update stored score
    c["ats_score"] = result["ats_score"]
    persist()
    return {"status": "success", "candidate_id": req.candidate_id, "candidate_name": c["full_name"], **result}

@app.get("/stats")
def get_stats():
    skills_count = {}
    locations, seniority = {}, {}
    total_ats = 0

    for c in candidates_store:
        for skill in c.get("skills", []):
            skills_count[skill] = skills_count.get(skill, 0) + 1
        loc = c.get("location", "Unknown")
        locations[loc] = locations.get(loc, 0) + 1
        sen = c.get("seniority_level", "Unknown")
        seniority[sen] = seniority.get(sen, 0) + 1
        total_ats += c.get("ats_score", 0)

    top_skills = sorted(skills_count.items(), key=lambda x: -x[1])[:20]

    return {
        "total_candidates": len(candidates_store),
        "total_vectors": faiss_index.ntotal if faiss_index else 0,
        "index_synced": (faiss_index.ntotal == len(candidates_store)) if faiss_index else False,
        "top_skills": [{"skill": s, "count": c} for s, c in top_skills],
        "locations": dict(sorted(locations.items(), key=lambda x: -x[1])[:10]),
        "seniority_distribution": seniority,
        "avg_ats_score": round(total_ats / max(len(candidates_store),1), 1),
    }

# ──────────────────────────────────────────────
#  Startup
# ──────────────────────────────────────────────
@app.on_event("startup")
def startup():
    initialize()
    print(f"[AI] Ready — {len(candidates_store)} candidates, {faiss_index.ntotal if faiss_index else 0} vectors")
    print(f"[AI] Groq key: {'set' if GROQ_API_KEY else 'NOT SET'}")
