import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
// @ts-expect-error pdf-parse type mismatch
import pdf from "pdf-parse";
import axios from "axios";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 1. Supabase Client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase credentials missing");
    }
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 2. Upload to Storage
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from("resumes")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json({ error: "Failed to upload to storage" }, { status: 500 });
    }

    const { data: { publicUrl } } = supabase.storage
      .from("resumes")
      .getPublicUrl(fileName);

    // 3. Extract text via pdf-parse
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
      // Basic support or placeholder for DOCX
      extractedText = "DOCX extraction placeholder (requires additional libraries)";
    }

    // 4. POST to Worker
    const workerUrl = process.env.WORKER_URL || "http://worker:3002";
    
    try {
      console.log(`Forwarding job to worker at ${workerUrl}/jobs`);
      await axios.post(`${workerUrl}/jobs`, {
        job: "parse_resume",
        text: extractedText,
        file_url: publicUrl,
      });
    } catch (workerError) {
      // Log but don't fail the response if the worker is just busy or unreachable
      // as long as the file is safely stored.
      console.error("Worker connection error:", workerError instanceof Error ? workerError.message : workerError);
    }

    return NextResponse.json({ queued: true });
  } catch (error) {
    console.error("[upload-api] Error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Internal Server Error" }, { status: 500 });
  }
}
