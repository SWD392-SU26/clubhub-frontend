import { apiRequest } from "./http";
import type {
  ProposalDetail,
  ProposalsResult,
  ProposalSummary,
  ProposalStatus,
  ReviewProposalRequest,
  SubmitProposalRequest,
} from "../types/proposal";

function toQuery(params: Record<string, string | number | undefined>) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export const proposalApi = {
  submitProposal(payload: SubmitProposalRequest) {
    return apiRequest<ProposalSummary>("/api/proposals", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  resubmitProposal(id: string, payload: SubmitProposalRequest) {
    return apiRequest<ProposalSummary>(`/api/proposals/${id}/resubmit`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  getMyProposals() {
    return apiRequest<ProposalSummary[]>("/api/proposals/my");
  },

  getProposalById(id: string) {
    return apiRequest<ProposalDetail>(`/api/proposals/${id}`);
  },

  getAllProposals(params: {
    status?: ProposalStatus | "";
    page?: number;
    pageSize?: number;
  } = {}) {
    return apiRequest<ProposalsResult>(
      `/api/proposals${toQuery({
        status: params.status,
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 10,
      })}`,
    );
  },

  reviewProposal(id: string, payload: ReviewProposalRequest) {
    return apiRequest<boolean>(`/api/proposals/${id}/review`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
};
