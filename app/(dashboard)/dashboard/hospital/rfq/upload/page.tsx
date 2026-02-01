"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, Loader2, AlertCircle, Calendar } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const FASTAPI_URL =
  process.env.NEXT_PUBLIC_FASTAPI_URL || "http://localhost:5001";

export default function RFQUploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");
  const [uploading, setUploading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== "application/pdf") {
        setError("Please select a PDF file");
        return;
      }
      setFile(selectedFile);
      setError("");

      // Auto-populate title from filename if empty
      if (!title) {
        const fileName = selectedFile.name.replace(".pdf", "");
        setTitle(fileName);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file");
      return;
    }

    if (!title.trim()) {
      setError("Please enter a title");
      return;
    }

    if (!deadline) {
      setError("Please select a deadline");
      return;
    }

    try {
      setUploading(true);
      setError("");
      setUploadProgress(0);

      // Step 1: Upload to FastAPI
      const formData = new FormData();
      formData.append("file", file);

      setUploadProgress(20);

      const uploadResponse = await fetch(`${FASTAPI_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Upload failed");
      }

      const uploadData = await uploadResponse.json();
      const documentId = uploadData.document_id;

      setUploadProgress(40);

      // Step 2: Parse the PDF
      setParsing(true);
      const parseResponse = await fetch(
        `${FASTAPI_URL}/api/parse/${documentId}`,
        {
          method: "POST",
        },
      );

      if (!parseResponse.ok) {
        throw new Error("Parsing failed");
      }

      const parseData = await parseResponse.json();
      setUploadProgress(60);

      // Step 3: Save to database with title and deadline
      const saveResponse = await fetch("/api/rfq/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documentId,
          title,
          deadline,
          data: parseData.data,
        }),
      });

      if (!saveResponse.ok) {
        throw new Error("Failed to save RFQ");
      }

      const saveData = await saveResponse.json();
      setUploadProgress(100);

      // Redirect to review page
      setTimeout(() => {
        router.push(`/dashboard/hospital/rfq/${documentId}/review`);
      }, 500);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      setUploadProgress(0);
    } finally {
      setUploading(false);
      setParsing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Upload RFQ Document
        </h1>
        <p className="text-muted-foreground">
          Upload a PDF RFQ to extract requirements and send to vendors
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>RFQ Information</CardTitle>
          <CardDescription>
            Provide the basic details for this RFQ
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Title and Deadline Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">
                RFQ Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                placeholder="e.g., Medical Supplies Q1 2026"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={uploading || parsing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline">
                Submission Deadline <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="deadline"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  disabled={uploading || parsing}
                  min={new Date().toISOString().split("T")[0]}
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="file">
              PDF Document <span className="text-red-500">*</span>
            </Label>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <Input
                  id="file"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  disabled={uploading || parsing}
                  className="cursor-pointer"
                />
                {file && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>{file.name}</span>
                    <span className="text-xs">
                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                )}
              </div>

              {file && (
                <Button
                  onClick={handleUpload}
                  disabled={uploading || parsing}
                  className="w-full md:w-auto"
                  size="lg"
                >
                  {uploading || parsing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {parsing ? "Parsing Document..." : "Uploading..."}
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload & Process
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Processing...</span>
                <span className="font-medium">{uploadProgress}%</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Instructions Card */}
      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>
                Upload a PDF file containing the RFQ requirements and medicine
                list
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Provide a descriptive title to identify this RFQ</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Set the submission deadline for vendor responses</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>
                The system will automatically extract line items, requirements,
                and metadata
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>
                You can review and edit the extracted data before sending to
                vendors
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
