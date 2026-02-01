import { NextResponse } from "next/server";

const FASTAPI_URL =
  process.env.FLASK_PARSER_URL ||
  "https://makpr016-parse-api.hf.space/api";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are allowed" },
        { status: 400 },
      );
    }

    const apiFormData = new FormData();
    apiFormData.append("file", file);

    const response = await fetch(`${FASTAPI_URL}/api/upload`, {
      method: "POST",
      body: apiFormData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Upload failed");
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      documentId: data.document_id,
      filename: file.name,
      size: file.size,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error.message || "Upload failed" },
      { status: 500 },
    );
  }
}
