import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
// @ts-expect-error pdf-parse type mismatch
import pdf from "pdf-parse";
import axios from "axios";
import type { Database } from "@/types/database";
import { parseResume } from "@/frontend/lib/ai/resume-parser";

async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase credentials missing");
    }
    const supabase = createClient<Database>(supabaseUrl, supabaseKey);

    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from("resumes")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload to storage" },
        { status: 500 }
      );
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("resumes").getPublicUrl(fileName);

    let extractedText = "";
    if (file.type === "application/pdf") {
      try {
        const pdfData = await pdf(buffer);
        extractedText = pdfData.text;
      } catch (pdfError) {
        console.error("PDF extraction error:", pdfError);
        extractedText = "Error extracting text from PDF";
      }
    } else {
      extractedText = buffer.toString("utf8");
    }

    const workerUrl = process.env.WORKER_URL;

    if (workerUrl) {
      try {
        await axios.post(`${workerUrl.replace(/\/$/, "")}/jobs`, {
          job: "parse_resume",
          text: extractedText,
          file_url: publicUrl,
          source: "upload",
        });
      } catch (workerError) {
        console.error(
          "Worker connection error:",
          workerError instanceof Error ? workerError.message : workerError
        );
      }
    } else {
      try {
        const parsed = await parseResume(extractedText);
        await supabase.from("candidates").insert({
          email: parsed.email,
          full_name: parsed.name,
          phone: parsed.phone,
          location: parsed.location,
          experience_years: parsed.experience_years,
          skills: parsed.skills,
          sources: ["upload"],
          source: "resume_upload",
          is_duplicate: false,
        });
      } catch (e) {
        console.error("[ingest-upload] Inline parse error:", e);
      }
    }

    return NextResponse.json({ queued: true, filename: fileName });
  } catch (error) {
    console.error("[upload-api] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}

export const config = {
  runtime: "edge",
};

export default async function handler(req: NextRequest) {
  if (req.method === "POST") {
    return POST(req);
  }

  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}
