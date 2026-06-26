export type SubmitFeedbackRequest = {
  rating: number;
  comment?: string | null;
};

export type FeedbackDto = {
  id: string;
  userId: string;
  userFullName: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
};

export type FeedbackSummary = {
  averageRating: number;
  totalCount: number;
  items: FeedbackDto[];
};
