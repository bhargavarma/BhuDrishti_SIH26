import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  FileText,
  Loader2,
  Upload,
  X,
} from "lucide-react";

import {
  preprocessDocument,
  uploadDocument,
} from "../services/api";

import "./UploadPage.css";
import WorkflowNav from "../components/WorkflowNav";


// ==================================================
// Upload Page
// ==================================================

export default function UploadPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [isUploading, setIsUploading] =
    useState(false);

  const [status, setStatus] =
    useState<string>("");

  const [documentId, setDocumentId] =
    useState<string>("");

  const [error, setError] =
    useState<string>("");

  const [isDragging, setIsDragging] = useState(false);


  // ==================================================
  // File Selection
  // ==================================================

  function handleFileSelect(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    selectFile(file);
  }

  function selectFile(file: File | undefined) {
    if (!file) return;
    const extension = file.name.toLowerCase().split(".").pop();
    if (!extension || !["pdf", "jpg", "jpeg", "png", "tiff", "tif"].includes(extension)) {
      setError("Choose a PDF, JPG, JPEG, PNG, or TIFF land record.");
      return;
    }
    setError("");
    setStatus("");
    setDocumentId("");
    setSelectedFile(file);
  }


  // ==================================================
  // Remove File
  // ==================================================

  function removeFile() {
    setSelectedFile(null);
    setStatus("");
    setDocumentId("");
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }


  // ==================================================
  // Upload + Preprocess
  // ==================================================

  async function handleUpload() {
    if (!selectedFile) {
      setError("Please select a land record document first.");
      return;
    }

    setIsUploading(true);
    setError("");
    setStatus("Uploading document...");
    setDocumentId("");

    try {
      // ----------------------------------------------
      // Upload
      // ----------------------------------------------

      const uploadResult =
        await uploadDocument(selectedFile);

      setDocumentId(
        uploadResult.document_id,
      );

      setStatus("Preparing document pages for AI processing...");
      await preprocessDocument(uploadResult.document_id);

      setStatus(
        "Document uploaded and preprocessed successfully.",
      );
      navigate(`/processing/${uploadResult.document_id}`);

    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Something went wrong while processing the document.",
      );

      setStatus("");

    } finally {
      setIsUploading(false);
    }
  }


  // ==================================================
  // Render
  // ==================================================

  return (
    <main className="upload-page">
      <div className="upload-shell">
        <WorkflowNav />

        {/* Header */}

        <div className="upload-header">

          <div className="upload-mark">
            <FileText size={28} />
          </div>

          <p className="upload-kicker">BHUDRISHTI / DOCUMENT INTAKE</p>
          <h1>
            Upload Land Record
          </h1>

          <p>
            Upload a scanned land record to begin AI-powered
            digitization and validation.
          </p>

        </div>


        {/* Upload Card */}

        <section className="upload-card">

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.tiff,.tif"
            onChange={handleFileSelect}
            className="hidden"
          />


          {/* Drop Area */}

          {!selectedFile && (
            <div
              className={`drop-zone ${isDragging ? "is-dragging" : ""}`}
              onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(event) => { event.preventDefault(); setIsDragging(false); selectFile(event.dataTransfer.files[0]); }}
            >

              <div className="drop-icon">
                <Upload
                  size={30}
                  className="text-slate-700"
                />
              </div>

              <h2>
                Choose a land record
              </h2>

              <p>
                PDF, JPG, JPEG, PNG, TIFF or TIF · up to 25 MB
              </p>
              <button type="button" className="browse-button" onClick={() => fileInputRef.current?.click()}>
                Browse Files
              </button>
              <span className="drop-hint">or drag and drop your record here</span>
            </div>
          )}


          {/* Selected File */}

          {selectedFile && (

            <div className="selected-file">

              <div className="flex items-center justify-between gap-4">

                <div className="file-summary">

                  <div className="file-icon">
                    <FileText
                      size={24}
                      className="text-slate-700"
                    />
                  </div>

                  <div className="file-copy">

                    <p>
                      {selectedFile.name}
                    </p>

                    <p className="file-meta">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)}
                      {" MB"}
                    </p>

                  </div>

                </div>


                {!isUploading && (

                  <button
                    type="button"
                    onClick={removeFile}
                    className="remove-button"
                    aria-label="Remove selected file"
                  >
                    <X size={20} />
                  </button>

                )}

              </div>

            </div>
          )}


          {/* Upload Button */}

          {selectedFile && (

            <button
              type="button"
              onClick={handleUpload}
              disabled={isUploading}
              className="upload-button"
            >

              {isUploading ? (
                <>
                  <Loader2
                    size={20}
                    className="animate-spin"
                  />

                  Uploading & preparing...
                </>
              ) : (
                <>
                  <Upload size={20} />

                  Upload & Process
                </>
              )}

            </button>
          )}


          {/* Status */}

          {status && (

            <div className="upload-status success-status">

              {isUploading ? (
                <Loader2
                  size={20}
                  className="mt-0.5 shrink-0 animate-spin text-emerald-700"
                />
              ) : (
                <CheckCircle2
                  size={20}
                  className="mt-0.5 shrink-0 text-emerald-700"
                />
              )}

              <div>

                  <p>
                  {status}
                </p>

                {documentId && (
                  <p className="status-id">
                    Document ID: {documentId}
                  </p>
                )}

              </div>

            </div>
          )}


          {/* Error */}

          {error && (

            <div className="upload-status error-status" role="alert">
              {error}
            </div>

          )}

        </section>


        {/* Workflow Indicator */}

        <div className="workflow-preview">

          {[
            "Upload",
            "Preprocess",
            "OCR",
            "Extract",
            "Validate",
          ].map((step, index) => (

            <div
              key={step}
              className="workflow-step"
            >

              <div className="workflow-number">
                {index + 1}
              </div>

              <p>
                {step}
              </p>

            </div>

          ))}

        </div>

      </div>
    </main>
  );
}