// ==================================================
// BhuDrishti frontend API service
// ==================================================

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";


// ==================================================
// Types
// ==================================================

export interface UploadResponse {
  success: boolean;
  message: string;
  document_id: string;
  filename: string;
  file_path: string;
}

export interface OCRPage {
  page_number: number;
  image_path: string;
  text: string;
  confidence: number;
}

export interface OCRResponse {
  success: boolean;
  message: string;
  document_id: string;
  pages: OCRPage[];
}

export interface LandRecordFields {
  owner_name?: string;
  father_name?: string;
  district?: string;
  mandal?: string;
  village?: string;
  survey_number?: string;
  khata_number?: string;
  record_number?: string;
  land_area?: string;
  land_type?: string;
}

export interface ValidationResponse {
  success: boolean;
  message: string;
  document_id: string;
  fields: LandRecordFields;
  validation: Record<string, unknown>;
  ocr_confidence: {
    page_number: number;
    confidence: number;
  }[];
}

export interface ReviewResponse {
  success: boolean;
  message: string;
  review: Record<string, unknown>;
}

export interface ApprovedRecord {
  owner?: {
    name: string | null;
    father_name: string | null;
  };
  location?: {
    district: string | null;
    mandal: string | null;
    village: string | null;
  };
  land?: {
    survey_number: string | null;
    khata_number: string | null;
    record_number: string | null;
    area: string | null;
    type: string | null;
  };
}

export interface ApprovedRecordResponse {
  id?: string;
  success: boolean;
  message: string;
  document_id: string;
  record_status: string;
  record: ApprovedRecord;
  verification: {
    status: string | null;
    score: number | null;
    reviewer: string | null;
    reviewer_comment: string | null;
    verified_at: string | null;
  };
}

export interface GISRecord {
  record_id: string;
  document_id: string;
  owner?: string | null;
  father_name?: string | null;
  survey_number?: string | null;
  khata_number?: string | null;
  record_number?: string | null;
  village?: string | null;
  mandal?: string | null;
  district?: string | null;
  land_area?: string | null;
  land_type?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  parcel_geojson?: { type: string; coordinates: number[][][] } | null;
  is_demo_location?: boolean;
  status?: string | null;
  validation_score?: number | null;
}


// ==================================================
// Generic API helper
// ==================================================

async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    options,
  );

  if (!response.ok) {
    let errorMessage = "API request failed.";

    try {
      const errorData = await response.json();

      if (typeof errorData.detail === "string") {
        errorMessage = errorData.detail;
      }
    } catch {
      // Keep default error message.
    }

    throw new Error(errorMessage);
  }

  return response.json();
}


// ==================================================
// Health Check
// ==================================================

export async function checkBackendHealth() {
  return apiRequest<{
    status: string;
    service: string;
  }>("/api/health");
}


// ==================================================
// Upload Document
// ==================================================

export async function uploadDocument(
  file: File,
): Promise<UploadResponse> {
  const formData = new FormData();

  formData.append("file", file);

  return apiRequest<UploadResponse>(
    "/api/documents/upload",
    {
      method: "POST",
      body: formData,
    },
  );
}


// ==================================================
// Preprocess Document
// ==================================================

export async function preprocessDocument(
  documentId: string,
) {
  return apiRequest<{
    success: boolean;
    message: string;
    document_id: string;
    processed_pages: string[];
  }>(
    `/api/documents/${documentId}/preprocess`,
    {
      method: "POST",
    },
  );
}


// ==================================================
// OCR
// ==================================================

export async function runOCR(
  documentId: string,
): Promise<OCRResponse> {
  return apiRequest<OCRResponse>(
    `/api/documents/${documentId}/ocr`,
    {
      method: "POST",
    },
  );
}


// ==================================================
// Extraction + Validation
// ==================================================

export async function extractDocumentFields(
  documentId: string,
): Promise<ValidationResponse> {
  return apiRequest<ValidationResponse>(
    `/api/documents/${documentId}/extract`,
    {
      method: "POST",
    },
  );
}


// ==================================================
// Validation
// ==================================================

export async function validateDocument(
  documentId: string,
) {
  return apiRequest<ValidationResponse>(
    `/api/documents/${documentId}/validate`,
    {
      method: "POST",
    },
  );
}


// ==================================================
// Human Review
// ==================================================

export async function getDocumentReview(
  documentId: string,
): Promise<ReviewResponse> {
  return apiRequest<ReviewResponse>(
    `/api/documents/${documentId}/review`,
  );
}


export async function createDocumentReview(
  documentId: string,
): Promise<ReviewResponse> {
  return apiRequest<ReviewResponse>(
    `/api/documents/${documentId}/review`,
    {
      method: "POST",
    },
  );
}


export async function updateDocumentReview(
  documentId: string,
  data: {
    status: "pending" | "approved" | "rejected";
    fields?: LandRecordFields;
    reviewer?: string;
    comment?: string;
  },
): Promise<ReviewResponse> {
  return apiRequest<ReviewResponse>(
    `/api/documents/${documentId}/review`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    },
  );
}


// ==================================================
// Approved Digital Record
// ==================================================

export async function getApprovedRecord(
  documentId: string,
): Promise<ApprovedRecordResponse> {
  return apiRequest<ApprovedRecordResponse>(
    `/api/documents/${documentId}/record`,
  );
}


// ==================================================
// Database Records
// ==================================================

export async function getAllRecords() {
  const response = await apiRequest<{
    success: boolean;
    count: number;
    records: Array<{ id?: string; document_id?: string; owner?: ApprovedRecord['owner']; location?: ApprovedRecord['location']; land?: ApprovedRecord['land']; verification?: ApprovedRecordResponse['verification'] }>;
  }>("/api/records");
  return {
    ...response,
    records: response.records.map((record) => ({
      success: true,
      message: 'Record loaded.',
      id: record.id,
      document_id: record.document_id || '',
      record_status: record.verification?.status || 'approved',
      record: { owner: record.owner, location: record.location, land: record.land },
      verification: record.verification || { status: null, score: null, reviewer: null, reviewer_comment: null, verified_at: null },
    } satisfies ApprovedRecordResponse)),
  };
}


export async function getRecordById(
  recordId: string,
): Promise<ApprovedRecordResponse> {
  const response = await apiRequest<{ success: boolean; record: { id?: string; document_id?: string; owner?: ApprovedRecord['owner']; location?: ApprovedRecord['location']; land?: ApprovedRecord['land']; verification?: ApprovedRecordResponse['verification'] } }>(`/api/records/${recordId}`)
  return { success: response.success, message: 'Record loaded.', id: response.record.id, document_id: response.record.document_id || recordId, record_status: response.record.verification?.status || 'approved', record: { owner: response.record.owner, location: response.record.location, land: response.record.land }, verification: response.record.verification || { status: null, score: null, reviewer: null, reviewer_comment: null, verified_at: null } } satisfies ApprovedRecordResponse
}

export async function getGISRecords() {
  return apiRequest<{ success: boolean; count: number; records: GISRecord[] }>('/api/gis/records')
}


// ==================================================
// Integration Export
// ==================================================

export async function exportApprovedRecord(
  documentId: string,
) {
  return apiRequest(
    `/api/documents/${documentId}/export`,
  );
}
