export type NotificationDto = {
  id: string;
  title: string;
  content: string;
  type?: string | null;
  isRead: boolean;
  createdAt: string;
};

export type UnreadCountDto = {
  count: number;
};
