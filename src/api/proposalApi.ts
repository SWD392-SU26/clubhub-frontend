import { apiRequest } from "./http";
import type {
  ProposalDetail,
  ProposalSummary,
  SubmitProposalRequest,
} from "../types/proposal";

export const proposalApi = {
  submitProposal(payload: SubmitProposalRequest) {
    return apiRequest<ProposalSummary>("/api/proposals", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  getMyProposals() {
    return apiRequest<ProposalSummary[]>("/api/proposals/my");
  },

  getProposalById(id: string) {
    return apiRequest<ProposalDetail>(`/api/proposals/${id}`);
  },
};
