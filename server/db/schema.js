const Database = require('better-sqlite3');
const path = require('path');

function initializeDatabase() {
  const db = new Database(path.join(__dirname, 'talentos.db'));
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS candidates (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      email TEXT UNIQUE,
      phone TEXT,
      location TEXT,
      linkedin_url TEXT,
      github_url TEXT,
      portfolio_url TEXT,
      summary TEXT,
      seniority_level TEXT DEFAULT 'Mid',
      years_experience REAL DEFAULT 0,
      avatar_url TEXT,
      cover_letter TEXT,
      source TEXT DEFAULT 'Upload',
      status TEXT DEFAULT 'Active',
      ghost_status INTEGER DEFAULT 0,
      ghost_days INTEGER DEFAULT 0,
      last_response_date TEXT,
      passive_pool INTEGER DEFAULT 0,
      confidence_score REAL DEFAULT 0.85,
      culture_fit_score REAL DEFAULT 0,
      salary_min INTEGER DEFAULT 0,
      salary_max INTEGER DEFAULT 0,
      salary_currency TEXT DEFAULT 'USD',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS candidate_skills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      candidate_id TEXT NOT NULL,
      skill_name TEXT NOT NULL,
      category TEXT DEFAULT 'Other',
      proficiency_level INTEGER DEFAULT 3,
      FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS work_experience (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      candidate_id TEXT NOT NULL,
      company_name TEXT NOT NULL,
      role TEXT NOT NULL,
      start_date TEXT,
      end_date TEXT,
      description TEXT,
      is_current INTEGER DEFAULT 0,
      FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS education (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      candidate_id TEXT NOT NULL,
      institution TEXT NOT NULL,
      degree TEXT NOT NULL,
      field_of_study TEXT,
      start_year INTEGER,
      end_year INTEGER,
      FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS certifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      candidate_id TEXT NOT NULL,
      name TEXT NOT NULL,
      issuer TEXT,
      year INTEGER,
      FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      department TEXT,
      location TEXT,
      type TEXT DEFAULT 'Full-time',
      salary_min INTEGER,
      salary_max INTEGER,
      description TEXT,
      requirements TEXT,
      status TEXT DEFAULT 'Open',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS pipeline_stages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      job_id TEXT NOT NULL,
      name TEXT NOT NULL,
      position INTEGER DEFAULT 0,
      color TEXT DEFAULT '#3b82f6',
      FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS applications (
      id TEXT PRIMARY KEY,
      candidate_id TEXT NOT NULL,
      job_id TEXT NOT NULL,
      stage_id INTEGER,
      score REAL DEFAULT 0,
      ai_summary TEXT,
      ai_pros TEXT,
      ai_cons TEXT,
      status TEXT DEFAULT 'Active',
      applied_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
      FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
      FOREIGN KEY (stage_id) REFERENCES pipeline_stages(id)
    );

    CREATE TABLE IF NOT EXISTS sources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      candidate_id TEXT NOT NULL,
      type TEXT NOT NULL,
      details TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      candidate_id TEXT NOT NULL,
      author TEXT DEFAULT 'Recruiter',
      content TEXT NOT NULL,
      type TEXT DEFAULT 'note',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS activity_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      candidate_id TEXT,
      job_id TEXT,
      action TEXT NOT NULL,
      details TEXT,
      actor TEXT DEFAULT 'System',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS email_threads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      candidate_id TEXT,
      subject TEXT,
      from_email TEXT,
      body_preview TEXT,
      has_attachment INTEGER DEFAULT 0,
      status TEXT DEFAULT 'Unprocessed',
      received_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS duplicate_groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      primary_candidate_id TEXT NOT NULL,
      duplicate_candidate_id TEXT NOT NULL,
      similarity_score REAL DEFAULT 0,
      status TEXT DEFAULT 'Pending',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (primary_candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
      FOREIGN KEY (duplicate_candidate_id) REFERENCES candidates(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS search_queries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      query TEXT NOT NULL,
      filters TEXT,
      result_count INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS passive_pool (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      candidate_id TEXT NOT NULL,
      original_job_id TEXT,
      original_score REAL DEFAULT 0,
      reason TEXT,
      added_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS company_values (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      value_name TEXT NOT NULL,
      description TEXT,
      weight REAL DEFAULT 1.0
    );

    CREATE TABLE IF NOT EXISTS talent_radar (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      candidate_id TEXT NOT NULL,
      technical_depth REAL DEFAULT 50,
      communication REAL DEFAULT 50,
      leadership REAL DEFAULT 50,
      domain_knowledge REAL DEFAULT 50,
      cultural_fit REAL DEFAULT 50,
      growth_trajectory REAL DEFAULT 50,
      FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_candidate_skills_candidate ON candidate_skills(candidate_id);
    CREATE INDEX IF NOT EXISTS idx_applications_candidate ON applications(candidate_id);
    CREATE INDEX IF NOT EXISTS idx_applications_job ON applications(job_id);
    CREATE INDEX IF NOT EXISTS idx_activity_log_candidate ON activity_log(candidate_id);
    CREATE INDEX IF NOT EXISTS idx_work_experience_candidate ON work_experience(candidate_id);
  `);

  return db;
}

module.exports = { initializeDatabase };
