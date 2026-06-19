export type PointTransaction = {
  id: string;
  points: number;
  type: string;
  note?: string | null;
  createdAt: string;
};

export type MyPointSummary = {
  clubId: string;
  clubName: string;
  totalPoints: number;
  rank: number;
  recentTransactions: PointTransaction[];
};

export type MemberPoint = {
  userId: string;
  fullName: string;
  avatarUrl?: string | null;
  totalPoints: number;
  rank: number;
};
