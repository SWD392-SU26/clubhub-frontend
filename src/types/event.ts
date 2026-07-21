export type EventStatus =
  | "Draft"
  | "Published"
  | "Ongoing"
  | "Completed"
  | "Cancelled";

export type EventDto = {
  id: string;
  clubId: string;
  clubName: string;
  name: string;
  description?: string | null;
  location?: string | null;
  imageUrl?: string | null;
  startTime: string;
  endTime: string;
  capacity?: number | null;
  registeredCount: number;
  status: EventStatus | string;
  createdAt: string;
};

export type EventRegistration = {
  id: string;
  eventId: string;
  eventName: string;
  eventImageUrl?: string | null;
  isCheckedIn: boolean;
  checkInTime?: string | null;
  registeredAt: string;
};
