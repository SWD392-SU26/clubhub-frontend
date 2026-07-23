export type ActivityStatus =
  | "Upcoming"
  | "InProgress"
  | "Completed"
  | "Cancelled";

export type ActivityDto = {
  id: string;
  clubId: string;
  clubName: string;
  title: string;
  description?: string | null;
  type: string;
  location?: string | null;
  imageUrl?: string | null;
  startTime: string;
  endTime: string;
  registrationDeadline?: string | null;
  capacity?: number | null;
  registeredCount: number;
  status: ActivityStatus | string;
  creatorName?: string | null;
  createdAt: string;
};

export type ActivityDetailDto = ActivityDto & {
  checkedInCount: number;
  checkInPoints: number;
  updatedAt?: string | null;
  registrants?: ActivityRegistrantDto[] | null;
};

export type ActivityRegistrantDto = {
  registrationId: string;
  userId: string;
  fullName: string;
  avatarUrl?: string | null;
  studentCode?: string | null;
  isCheckedIn: boolean;
  checkInTime?: string | null;
  note?: string | null;
  registeredAt: string;
};

export type MyRegisteredActivityDto = {
  registrationId: string;
  activityId: string;
  clubId: string;
  clubName: string;
  title: string;
  type: string;
  location?: string | null;
  startTime: string;
  endTime: string;
  isCheckedIn: boolean;
  checkInTime?: string | null;
  status: ActivityStatus | string;
  registeredAt: string;
};

export type RegisterActivityRequest = {
  note?: string | null;
};

export type CreateActivityRequest = {
  title: string;
  description?: string;
  type: string;
  location?: string;
  imageUrl?: string;
  startTime: string;
  endTime: string;
  registrationDeadline?: string;
  capacity?: number;
  checkInPoints?: number;
};

export type UpdateActivityRequest = Partial<CreateActivityRequest> & {
  status?: ActivityStatus;
};
