import { apiRequest } from "./http";
import type {
  FeedbackSummary,
  SubmitFeedbackRequest,
  FeedbackDto,
} from "../types/feedback";

export const feedbackApi = {
  submitFeedback(eventId: string, payload: SubmitFeedbackRequest) {
    return apiRequest<FeedbackDto>(`/api/events/${eventId}/feedback`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  getEventFeedback(eventId: string) {
    return apiRequest<FeedbackSummary>(`/api/events/${eventId}/feedback`);
  },
};
