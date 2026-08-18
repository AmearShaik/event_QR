export type NormalizedPaymentStatus = 'PAID' | 'NOT_PAID' | 'PARTIALLY_PAID';

export type RegistrationStatus = 'NOT_REGISTERED' | 'REGISTERED';

export type ScanStatus = 
  | 'SUCCESS'
  | 'DUPLICATE'
  | 'NOT_ELIGIBLE'
  | 'INVALID'
  | 'EVENT_INACTIVE'
  | 'QR_DISABLED'
  | 'WRONG_EVENT';

export interface CandidateDto {
  id: string;
  studentId: string;
  name: string;
  program: string;
  paymentStatus: string;
  normalizedPaymentStatus: NormalizedPaymentStatus;
  eligibilityStatus: boolean;
  registrationStatus: RegistrationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface EventDto {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface QrTokenDto {
  id: string;
  candidateId: string;
  eventId: string;
  token: string;
  isActive: boolean;
  createdAt: string;
}

export interface AttendanceDto {
  id: string;
  candidateId: string;
  eventId: string;
  qrTokenId: string;
  entryTime: string;
  status: string;
  candidate?: {
    studentId: string;
    name: string;
    program: string;
  };
  event?: {
    name: string;
  };
}

export interface UserDto {
  id: string;
  username: string;
  name: string;
  role: string;
}

export interface ScanRequest {
  token: string;
  eventId: string;
}

export interface ScanResponse {
  status: ScanStatus;
  message: string;
  reason?: string;
  candidate?: {
    studentId: string;
    name: string;
    program: string;
  };
  event?: string;
  entryTime?: string;
}

export interface ImportPreviewRow {
  rowNumber: number;
  studentId: string;
  name: string;
  program: string;
  paymentStatus: string;
  normalizedPaymentStatus: NormalizedPaymentStatus;
  eligibility: boolean;
  isValid: boolean;
  warning?: string;
  error?: string;
}

export interface ImportPreviewResponse {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  previewRows: ImportPreviewRow[];
  hasErrors: boolean;
}

export interface ImportConfirmResponse {
  totalRows: number;
  newCandidates: number;
  updatedCandidates: number;
  unchangedCandidates: number;
  rejectedRows: number;
  duplicateStudentIds: number;
}

export interface DashboardStats {
  totalCandidates: number;
  paidCandidates: number;
  notPaidCandidates: number;
  partiallyPaidCandidates: number;
  eligibleCandidates: number;
  notEligibleCandidates: number;
  qrGeneratedCount: number;
  attendanceCount: number;
  remainingEligible: number;
  attendanceRate: number;
}
