import type { ClubCategory } from "./club";

export type ProposalStatus =
  | "Pending"
  | "Approved"
  | "Rejected"
  | "NeedsRevision";

export type ProposalSummary = {
  id: string;
  clubName: string;
  category: ClubCategory | string;
  description?: string | null;
  mission?: string | null;
  status: ProposalStatus | string;
  founderInfo: string;
  founderStudentCode: string;
  contactEmail: string;
  rejectionReason?: string | null;
  submittedAt: string;
  reviewedAt?: string | null;
};

export type ProposalDetail = ProposalSummary & {
  reason?: string | null;
  activityPlan?: string | null;
  founderIdCardUrl?: string | null;
  contactPhone?: string | null;
  advisor?: string | null;
  logoUrl?: string | null;
  proposalFileUrl?: string | null;
  notes?: string | null;
  submitterName: string;
};

export type SubmitProposalRequest = {
  clubName: string;
  category: ClubCategory;
  description?: string;
  mission?: string;
  reason?: string;
  activityPlan?: string;
  founderInfo: string;
  founderStudentCode: string;
  founderIdCardUrl?: string;
  contactEmail: string;
  contactPhone?: string;
  advisor?: string;
  logoUrl?: string;
  proposalFileUrl?: string;
  notes?: string;
};
