import {
  CalendarDays,
  CheckCircle2,
  MessageSquare,
  Pencil,
  PlusCircle,
  QrCode,
  Star,
  Trophy,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { clubApi } from "../api/clubApi";
import { activityApi } from "../api/activityApi";
import { eventApi } from "../api/eventApi";
import { feedbackApi } from "../api/feedbackApi";
import { membershipApi } from "../api/membershipApi";
import { pointApi } from "../api/pointApi";
import { getPrimaryAdminMembership } from "../clubPermissions";
import {
  DataTable,
  EmptyState,
  FilterBar,
  PageTitle,
  SectionCard,
  StatCard,
  StatusBadge,
} from "../components";
import type { ClubDetail, ClubRole, MyMembership } from "../types/club";
import type { ClubMember, FeedbackSummary, MembershipRequest } from "../types/admin";
import type { ActivityDetailDto, ActivityDto, ActivityStatus } from "../types/activity";
import type { EventDto, EventRegistration } from "../types/event";
import type { MemberPoint } from "../types/point";
import { getProfileDisplayName, useCurrentProfile } from "../useCurrentProfile";

const dateTime = (value?: string | null) =>
  value
    ? new Intl.DateTimeFormat("vi-VN", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(value))
    : "—";

const toDateTimeLocalValue = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const timezoneOffset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
};

function ErrorNotice({ message }: { message: string }) {
  return (
    <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
      {message}
    </div>
  );
}

function SuccessNotice({ message }: { message: string }) {
  return (
    <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
      {message}
    </div>
  );
}

function LoadingState() {
  return <div className="card p-6 text-sm font-semibold text-muted">Đang tải dữ liệu...</div>;
}

function useAdminClub() {
  const [membership, setMembership] = useState<MyMembership | null>(null);
  const [club, setClub] = useState<ClubDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const memberships = await membershipApi.getMyMemberships();
        const current = getPrimaryAdminMembership(memberships);
        if (!current) throw new Error("Tài khoản chưa quản trị CLB nào.");
        const detail = await clubApi.getClubById(current.clubId);
        if (!ignore) {
          setMembership(current);
          setClub(detail);
        }
      } catch (err) {
        if (!ignore) setError(err instanceof Error ? err.message : "Không thể tải CLB quản trị.");
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  return { membership, club, setClub, clubId: membership?.clubId ?? "", loading, error };
}

function useClubMembers(clubId: string) {
  const [members, setMembers] = useState<ClubMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const reload = async () => {
    if (!clubId) return;
    setLoading(true);
    try {
      const result = await membershipApi.getMembers(clubId);
      setMembers(result.items);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải thành viên.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void reload();
  }, [clubId]);
  return { members, loading, error, reload };
}

function useClubEvents(clubId: string) {
  const [events, setEvents] = useState<EventDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const reload = async () => {
    if (!clubId) return;
    setLoading(true);
    try {
      const result = await eventApi.getClubEvents(clubId, 1, 100);
      setEvents(result.items);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải sự kiện.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void reload();
  }, [clubId]);
  return { events, loading, error, reload };
}

function useClubActivities(clubId: string) {
  const [activities, setActivities] = useState<ActivityDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const reload = async () => {
    if (!clubId) return;
    setLoading(true);
    try {
      const result = await activityApi.getClubActivities(clubId, 1, 100);
      setActivities(result.items);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải hoạt động.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void reload();
  }, [clubId]);
  return { activities, loading, error, reload };
}

export function ClubAdminDashboard() {
  const profile = useCurrentProfile();
  const admin = useAdminClub();
  const memberData = useClubMembers(admin.clubId);
  const eventData = useClubEvents(admin.clubId);
  const [pending, setPending] = useState(0);

  useEffect(() => {
    if (admin.clubId)
      membershipApi.getPendingRequests(admin.clubId).then((x) => setPending(x.totalCount)).catch(() => setPending(0));
  }, [admin.clubId]);

  const upcoming = eventData.events.filter((e) => new Date(e.endTime) >= new Date());
  return (
    <main className="page-shell">
      <PageTitle
        eyebrow="CLUB ADMIN"
        title={`Chào ${getProfileDisplayName(profile)}!`}
        description={admin.club ? `Bạn đang quản trị ${admin.club.name}.` : "Không gian quản trị câu lạc bộ."}
      />
      {admin.error && <ErrorNotice message={admin.error} />}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Tổng thành viên" value={String(memberData.members.length)} icon={Users} tone="green" />
        <StatCard label="Sự kiện" value={String(eventData.events.length)} icon={CalendarDays} tone="blue" />
        <StatCard label="Yêu cầu chờ duyệt" value={String(pending)} icon={UserPlus} />
        <StatCard label="Sự kiện sắp tới" value={String(upcoming.length)} icon={Trophy} tone="slate" />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <SectionCard title="Sự kiện sắp tới">
          {upcoming.length ? upcoming.slice(0, 5).map((event) => (
            <Link key={event.id} to={`/club-admin/events/${event.id}`} className="mb-3 block rounded-xl border p-4 hover:bg-primary-soft">
              <div className="font-bold">{event.name}</div>
              <div className="text-sm text-muted">{dateTime(event.startTime)} · {event.registeredCount}/{event.capacity ?? "∞"}</div>
            </Link>
          )) : <EmptyState title="Chưa có sự kiện sắp tới" description="Tạo sự kiện mới để bắt đầu hoạt động." />}
        </SectionCard>
        <SectionCard title="Lối tắt quản trị">
          <div className="grid gap-3 sm:grid-cols-2">
            <Link className="btn-secondary" to="/club-admin/join-requests">Duyệt yêu cầu</Link>
            <Link className="btn-secondary" to="/club-admin/events/new">Tạo sự kiện</Link>
            <Link className="btn-secondary" to="/club-admin/check-in">Check-in</Link>
            <Link className="btn-secondary" to="/club-admin/feedback">Xem feedback</Link>
          </div>
        </SectionCard>
      </div>
    </main>
  );
}

export function MembersPage() {
  const admin = useAdminClub();
  const data = useClubMembers(admin.clubId);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const filtered = data.members.filter((m) => `${m.fullName} ${m.studentCode ?? ""}`.toLowerCase().includes(query.toLowerCase()));

  async function changeRole(member: ClubMember, role: ClubRole) {
    try {
      await membershipApi.assignRole(admin.clubId, member.userId, role);
      setMessage(`Đã cập nhật vai trò của ${member.fullName}.`);
      await data.reload();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Không thể cập nhật vai trò.");
    }
  }

  return (
    <main className="page-shell">
      <PageTitle title="Danh sách thành viên" description={admin.club?.name} />
      {(admin.error || data.error) && <ErrorNotice message={admin.error || data.error} />}
      {message && <SuccessNotice message={message} />}
      <FilterBar placeholder="Tìm theo tên hoặc MSSV..." value={query} onChange={setQuery} />
      {data.loading ? <LoadingState /> : (
        <section className="card overflow-hidden">
          <DataTable columns={["Họ và tên", "MSSV", "Vai trò", "Ngày tham gia", "Thao tác"]} rows={filtered.map((m) => [
            m.fullName,
            m.studentCode ?? "—",
            <select className="input min-w-40" value={m.roleInClub} onChange={(e) => void changeRole(m, e.target.value as ClubRole)} disabled={m.roleInClub === "President"}>
              <option value="Member">Thành viên</option><option value="VicePresident">Phó chủ nhiệm</option><option value="ClubAdmin">Quản trị CLB</option><option value="President">Chủ nhiệm</option>
            </select>,
            dateTime(m.joinedAt),
            <Link to={`/club-admin/members/${m.userId}`} className="btn-ghost">Chi tiết</Link>,
          ])} />
        </section>
      )}
    </main>
  );
}

export function MemberDetailPage() {
  const { id = "" } = useParams();
  const admin = useAdminClub();
  const data = useClubMembers(admin.clubId);
  const navigate = useNavigate();
  const member = data.members.find((m) => m.userId === id);
  const [points, setPoints] = useState<MemberPoint | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    if (admin.clubId) pointApi.getLeaderboard(admin.clubId, 1, 100).then((x) => setPoints(x.items.find((p) => p.userId === id) ?? null)).catch(() => setPoints(null));
  }, [admin.clubId, id]);

  async function remove() {
    if (!member || !confirm(`Xóa ${member.fullName} khỏi CLB?`)) return;
    try {
      await membershipApi.removeMember(admin.clubId, member.userId);
      navigate("/club-admin/members");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể xóa thành viên.");
    }
  }

  return <main className="page-shell">
    <PageTitle title={member?.fullName ?? "Chi tiết thành viên"} eyebrow={member?.studentCode ?? ""} />
    {error && <ErrorNotice message={error} />}
    {data.loading ? <LoadingState /> : !member ? <EmptyState title="Không tìm thấy thành viên" description="Thành viên không còn thuộc CLB này." /> : (
      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Thông tin thành viên">
          <p className="text-muted">Vai trò: {member.roleInClub}</p><p className="mt-2 text-muted">Ngày tham gia: {dateTime(member.joinedAt)}</p><p className="mt-2 text-muted">Tổng điểm: {points?.totalPoints ?? 0}</p><p className="mt-2 text-muted">Xếp hạng: {points?.rank ?? "—"}</p>
          {member.roleInClub !== "President" && <button onClick={() => void remove()} className="btn-ghost mt-5 text-red-600">Xóa khỏi CLB</button>}
        </SectionCard>
        <SectionCard title="Theo dõi tham gia"><p className="text-sm text-muted">Trang này phục vụ chức năng quản lý thành viên trong design. Lịch sử tham gia sự kiện chi tiết theo từng thành viên cần backend cung cấp thêm endpoint riêng.</p></SectionCard>
      </div>
    )}
  </main>;
}

export function ClubJoinRequestsAdminPage() {
  const admin = useAdminClub();
  const [requests, setRequests] = useState<MembershipRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = async () => {
    if (!admin.clubId) return;
    setLoading(true);
    try { setRequests((await membershipApi.getPendingRequests(admin.clubId)).items); setError(""); }
    catch (err) { setError(err instanceof Error ? err.message : "Không thể tải yêu cầu."); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, [admin.clubId]);
  async function review(request: MembershipRequest, approved: boolean) {
    const reason = approved ? undefined : prompt("Lý do từ chối:") ?? undefined;
    if (!approved && !reason) return;
    try { await membershipApi.reviewRequest(admin.clubId, request.id, approved, reason); await load(); }
    catch (err) { setError(err instanceof Error ? err.message : "Không thể xử lý yêu cầu."); }
  }
  return <main className="page-shell">
    <PageTitle title="Yêu cầu tham gia" description="Duyệt hoặc từ chối đơn tham gia CLB." />
    {(admin.error || error) && <ErrorNotice message={admin.error || error} />}
    {loading ? <LoadingState /> : requests.length === 0 ? <EmptyState title="Không có yêu cầu chờ duyệt" description="Các yêu cầu mới sẽ xuất hiện tại đây." /> : <section className="card overflow-hidden"><DataTable columns={["Họ và tên", "MSSV", "Ngày gửi", "Lý do", "Thao tác"]} rows={requests.map((r) => [r.fullName, r.studentCode ?? "—", dateTime(r.requestedAt), r.joinReason || "Không cung cấp", <div className="flex gap-2"><button title="Duyệt" onClick={() => void review(r, true)} className="btn-ghost text-emerald-600"><CheckCircle2 /></button><button title="Từ chối" onClick={() => void review(r, false)} className="btn-ghost text-red-600"><XCircle /></button></div>])} /></section>}
  </main>;
}

function activityPayloadFromForm(form: FormData) {
  const text = (key: string) => String(form.get(key) ?? "").trim();
  const number = (key: string) => {
    const value = Number(form.get(key));
    return Number.isFinite(value) && value > 0 ? value : undefined;
  };
  const date = (key: string) => {
    const value = text(key);
    return value ? new Date(value).toISOString() : undefined;
  };

  return {
    title: text("title"),
    type: text("type"),
    description: text("description") || undefined,
    location: text("location") || undefined,
    imageUrl: text("imageUrl") || undefined,
    startTime: date("startTime")!,
    endTime: date("endTime")!,
    registrationDeadline: date("registrationDeadline"),
    capacity: number("capacity"),
    checkInPoints: number("checkInPoints"),
  };
}

export function ActivitiesManagementPage() {
  const admin = useAdminClub();
  const data = useClubActivities(admin.clubId);
  const [query, setQuery] = useState("");
  const activities = data.activities.filter((activity) =>
    `${activity.title} ${activity.type} ${activity.location ?? ""}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );

  return (
    <main className="page-shell">
      <PageTitle
        title="Quản lý hoạt động"
        description={admin.club?.name}
        actions={
          <Link to="/club-admin/activities/new" className="btn-primary">
            <PlusCircle className="h-4 w-4" />
            Tạo hoạt động mới
          </Link>
        }
      />
      {(admin.error || data.error) && <ErrorNotice message={admin.error || data.error} />}
      <FilterBar
        placeholder="Tìm theo tên, loại hoặc địa điểm..."
        value={query}
        onChange={setQuery}
      />
      {data.loading ? (
        <LoadingState />
      ) : activities.length === 0 ? (
        <EmptyState title="Chưa có hoạt động" description="Tạo hoạt động đầu tiên cho CLB." />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {activities.map((activity) => (
            <article className="card p-5" key={activity.id}>
              <div className="flex items-center justify-between gap-3">
                <StatusBadge status={activity.status} />
                <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary">
                  {activity.type}
                </span>
              </div>
              <h3 className="mt-4 font-bold">{activity.title}</h3>
              <p className="mt-2 text-sm text-muted">
                {dateTime(activity.startTime)} · {activity.location ?? "Chưa có địa điểm"}
              </p>
              <p className="mt-2 text-sm text-muted">
                {activity.registeredCount}/{activity.capacity ?? "∞"} người đăng ký
              </p>
              <Link className="btn-secondary mt-5 w-full" to={`/club-admin/activities/${activity.id}`}>
                Chi tiết
              </Link>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

export function ActivityAdminDetailPage() {
  const { id = "" } = useParams();
  const [activity, setActivity] = useState<ActivityDetailDto | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = async () => {
    try {
      setActivity(await activityApi.getActivityById(id));
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải hoạt động.");
    }
  };

  useEffect(() => {
    void load();
  }, [id]);

  async function checkIn(userId: string) {
    try {
      await activityApi.checkIn(id, userId);
      setMessage("Check-in hoạt động thành công.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể check-in.");
    }
  }

  async function cancel() {
    if (!activity || !confirm(`Hủy hoạt động "${activity.title}"?`)) return;
    try {
      await activityApi.cancel(activity.id);
      setMessage("Đã hủy hoạt động.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể hủy hoạt động.");
    }
  }

  return (
    <main className="page-shell">
      <PageTitle
        title={activity?.title ?? "Chi tiết hoạt động"}
        description={activity ? `${activity.type} · ${dateTime(activity.startTime)}` : ""}
        actions={
          activity && (
            <>
              <Link to={`/club-admin/activities/${activity.id}/edit`} className="btn-secondary">
                <Pencil className="h-4 w-4" />
                Sửa hoạt động
              </Link>
              <button onClick={() => void cancel()} className="btn-ghost text-red-600">
                <XCircle className="h-4 w-4" />
                Hủy hoạt động
              </button>
            </>
          )
        }
      />
      {error && <ErrorNotice message={error} />}
      {message && <SuccessNotice message={message} />}
      {!activity ? (
        <LoadingState />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-4">
            <StatCard label="Đã đăng ký" value={`${activity.registeredCount}/${activity.capacity ?? "∞"}`} icon={Users} />
            <StatCard label="Đã check-in" value={String(activity.checkedInCount)} icon={CheckCircle2} tone="green" />
            <StatCard label="Điểm check-in" value={String(activity.checkInPoints)} icon={Trophy} tone="blue" />
            <StatCard label="Trạng thái" value={activity.status} icon={CalendarDays} tone="slate" />
          </div>
          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
            <SectionCard title="Thông tin hoạt động">
              <p className="text-sm text-muted">{activity.description || "Chưa có mô tả."}</p>
              <div className="mt-5 grid gap-3 text-sm text-muted">
                <p><span className="font-semibold text-ink">Bắt đầu:</span> {dateTime(activity.startTime)}</p>
                <p><span className="font-semibold text-ink">Kết thúc:</span> {dateTime(activity.endTime)}</p>
                <p><span className="font-semibold text-ink">Hạn đăng ký:</span> {dateTime(activity.registrationDeadline)}</p>
                <p><span className="font-semibold text-ink">Địa điểm:</span> {activity.location ?? "Chưa cập nhật"}</p>
                <p><span className="font-semibold text-ink">Người tạo:</span> {activity.creatorName ?? "—"}</p>
              </div>
            </SectionCard>
            <SectionCard title="Danh sách đăng ký">
              {activity.registrants?.length ? (
                <DataTable
                  columns={["Thành viên", "MSSV", "Ghi chú", "Trạng thái", "Thao tác"]}
                  rows={activity.registrants.map((registrant) => [
                    registrant.fullName,
                    registrant.studentCode ?? "—",
                    registrant.note ?? "—",
                    registrant.isCheckedIn ? `Đã check-in · ${dateTime(registrant.checkInTime)}` : "Chưa check-in",
                    registrant.isCheckedIn ? (
                      <span className="text-sm font-semibold text-emerald-600">Hoàn tất</span>
                    ) : (
                      <button onClick={() => void checkIn(registrant.userId)} className="btn-secondary">
                        Check-in
                      </button>
                    ),
                  ])}
                />
              ) : (
                <EmptyState title="Chưa có người đăng ký" description="Danh sách người đăng ký sẽ hiển thị ở đây." />
              )}
            </SectionCard>
          </div>
        </>
      )}
    </main>
  );
}

export function CreateActivityPage() {
  const admin = useAdminClub();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setSaving(true);
    try {
      const created = await activityApi.create(admin.clubId, activityPayloadFromForm(form));
      navigate(`/club-admin/activities/${created.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tạo hoạt động.");
      setSaving(false);
    }
  }

  return (
    <main className="page-shell max-w-5xl">
      <PageTitle title="Tạo hoạt động mới" description={admin.club?.name} />
      {(admin.error || error) && <ErrorNotice message={admin.error || error} />}
      <ActivityForm submitLabel={saving ? "Đang tạo..." : "Tạo hoạt động"} disabled={saving || !admin.clubId} onSubmit={submit} />
    </main>
  );
}

export function EditActivityPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [activity, setActivity] = useState<ActivityDetailDto | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    activityApi.getActivityById(id).then(setActivity).catch((err) => setError(err instanceof Error ? err.message : "Không thể tải hoạt động."));
  }, [id]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setSaving(true);
    try {
      const updated = await activityApi.update(id, {
        ...activityPayloadFromForm(form),
        status: String(form.get("status")) as ActivityStatus,
      });
      navigate(`/club-admin/activities/${updated.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể cập nhật hoạt động.");
      setSaving(false);
    }
  }

  return (
    <main className="page-shell max-w-5xl">
      <PageTitle title="Sửa hoạt động" description={activity?.title ?? ""} />
      {error && <ErrorNotice message={error} />}
      {!activity ? (
        <LoadingState />
      ) : (
        <ActivityForm activity={activity} submitLabel={saving ? "Đang lưu..." : "Lưu thay đổi"} disabled={saving} onSubmit={submit} />
      )}
    </main>
  );
}

function ActivityForm({
  activity,
  submitLabel,
  disabled,
  onSubmit,
}: {
  activity?: ActivityDetailDto | null;
  submitLabel: string;
  disabled?: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="card grid gap-5 p-6 sm:grid-cols-2">
      <label className="sm:col-span-2">
        <span className="label">Tên hoạt động *</span>
        <input name="title" className="input" required maxLength={200} defaultValue={activity?.title ?? ""} />
      </label>
      <label>
        <span className="label">Loại hoạt động *</span>
        <input name="type" className="input" required maxLength={100} defaultValue={activity?.type ?? "Sinh hoạt"} />
      </label>
      <label>
        <span className="label">Địa điểm</span>
        <input name="location" className="input" defaultValue={activity?.location ?? ""} />
      </label>
      <label>
        <span className="label">Bắt đầu *</span>
        <input name="startTime" className="input" type="datetime-local" required defaultValue={toDateTimeLocalValue(activity?.startTime)} />
      </label>
      <label>
        <span className="label">Kết thúc *</span>
        <input name="endTime" className="input" type="datetime-local" required defaultValue={toDateTimeLocalValue(activity?.endTime)} />
      </label>
      <label>
        <span className="label">Hạn đăng ký</span>
        <input name="registrationDeadline" className="input" type="datetime-local" defaultValue={toDateTimeLocalValue(activity?.registrationDeadline)} />
      </label>
      <label>
        <span className="label">Sức chứa</span>
        <input name="capacity" className="input" type="number" min="1" defaultValue={activity?.capacity ?? ""} />
      </label>
      <label>
        <span className="label">Điểm check-in</span>
        <input name="checkInPoints" className="input" type="number" min="1" defaultValue={activity?.checkInPoints ?? 10} />
      </label>
      {activity && (
        <label>
          <span className="label">Trạng thái</span>
          <select name="status" className="input" defaultValue={activity.status}>
            <option value="Upcoming">Upcoming</option>
            <option value="InProgress">InProgress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </label>
      )}
      <label className="sm:col-span-2">
        <span className="label">Ảnh minh họa URL</span>
        <input name="imageUrl" className="input" defaultValue={activity?.imageUrl ?? ""} />
      </label>
      <label className="sm:col-span-2">
        <span className="label">Mô tả</span>
        <textarea name="description" className="input h-40 py-3" defaultValue={activity?.description ?? ""} />
      </label>
      <div className="sm:col-span-2 flex justify-end gap-2">
        <Link to={activity ? `/club-admin/activities/${activity.id}` : "/club-admin/activities"} className="btn-secondary">Hủy</Link>
        <button disabled={disabled} className="btn-primary">{submitLabel}</button>
      </div>
    </form>
  );
}

export function EventsManagementPage() {
  const admin = useAdminClub();
  const data = useClubEvents(admin.clubId);
  const [query, setQuery] = useState("");
  const events = data.events.filter((e) => e.name.toLowerCase().includes(query.toLowerCase()));
  return <main className="page-shell">
    <PageTitle title="Quản lý sự kiện" description={admin.club?.name} actions={<Link to="/club-admin/events/new" className="btn-primary"><PlusCircle className="h-4 w-4" />Tạo sự kiện mới</Link>} />
    {(admin.error || data.error) && <ErrorNotice message={admin.error || data.error} />}
    <FilterBar placeholder="Tìm kiếm tên sự kiện..." value={query} onChange={setQuery} />
    {data.loading ? <LoadingState /> : events.length === 0 ? <EmptyState title="Chưa có sự kiện" description="Tạo sự kiện đầu tiên cho CLB." /> : <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{events.map((e) => <article className="card p-5" key={e.id}><StatusBadge status={e.status} /><h3 className="mt-3 font-bold">{e.name}</h3><p className="text-sm text-muted">{dateTime(e.startTime)} · {e.location ?? "Chưa có địa điểm"}</p><p className="mt-2 text-sm text-muted">{e.registeredCount}/{e.capacity ?? "∞"} người đăng ký</p><Link className="btn-secondary mt-5 w-full" to={`/club-admin/events/${e.id}`}>Chi tiết</Link></article>)}</div>}
  </main>;
}

export function EventAdminDetailPage() {
  const { id = "" } = useParams();
  const [event, setEvent] = useState<EventDto | null>(null);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [feedback, setFeedback] = useState<FeedbackSummary | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    Promise.all([eventApi.getEventById(id), eventApi.getRegistrations(id), feedbackApi.getEventFeedback(id).catch(() => null)])
      .then(([e, r, f]) => { setEvent(e); setRegistrations(r.items); setFeedback(f); })
      .catch((err) => setError(err instanceof Error ? err.message : "Không thể tải sự kiện."));
  }, [id]);
  return <main className="page-shell">
    <PageTitle title={event?.name ?? "Chi tiết sự kiện"} description={event ? `${dateTime(event.startTime)} · ${event.location ?? "Chưa có địa điểm"}` : ""} actions={event && <><Link to={`/club-admin/events/${event.id}/edit`} className="btn-secondary"><Pencil className="h-4 w-4" />Sửa sự kiện</Link><Link to="/club-admin/check-in" className="btn-secondary"><QrCode className="h-4 w-4" />Check-in</Link><Link to={`/club-admin/events/${event.id}/cancel`} className="btn-ghost text-red-600"><XCircle className="h-4 w-4" />Hủy sự kiện</Link></>} />
    {error && <ErrorNotice message={error} />}
    {!event ? <LoadingState /> : <><div className="grid gap-4 sm:grid-cols-3"><StatCard label="Đã đăng ký" value={`${event.registeredCount}/${event.capacity ?? "∞"}`} icon={Users} /><StatCard label="Đã check-in" value={String(registrations.filter((r) => r.isCheckedIn).length)} icon={CheckCircle2} tone="green" /><StatCard label="Đánh giá" value={feedback ? `${feedback.averageRating}/5` : "—"} icon={Star} tone="blue" /></div><SectionCard title="Danh sách đăng ký" className="mt-6"><DataTable columns={["Mã đăng ký", "Ngày đăng ký", "Trạng thái", "Thời gian check-in"]} rows={registrations.map((r) => [r.id.slice(0, 8), dateTime(r.registeredAt), <StatusBadge status={r.isCheckedIn ? "CHECKED IN" : "REGISTERED"} />, dateTime(r.checkInTime)])} /></SectionCard></>}
  </main>;
}

export function CreateEventPage() {
  const admin = useAdminClub();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setSaving(true);
    try {
      const created = await eventApi.create(admin.clubId, { name: String(form.get("name")), description: String(form.get("description")), location: String(form.get("location")), startTime: new Date(String(form.get("startTime"))).toISOString(), endTime: new Date(String(form.get("endTime"))).toISOString(), capacity: Number(form.get("capacity")) || undefined });
      navigate(`/club-admin/events/${created.id}`);
    } catch (err) { setError(err instanceof Error ? err.message : "Không thể tạo sự kiện."); setSaving(false); }
  }
  return <main className="page-shell max-w-5xl"><PageTitle title="Tạo sự kiện mới" description={admin.club?.name} />{(admin.error || error) && <ErrorNotice message={admin.error || error} />}<form onSubmit={submit} className="card grid gap-5 p-6 sm:grid-cols-2"><label className="sm:col-span-2"><span className="label">Tên sự kiện *</span><input name="name" className="input" required maxLength={200} /></label><label><span className="label">Bắt đầu *</span><input name="startTime" className="input" type="datetime-local" required /></label><label><span className="label">Kết thúc *</span><input name="endTime" className="input" type="datetime-local" required /></label><label><span className="label">Địa điểm</span><input name="location" className="input" /></label><label><span className="label">Sức chứa</span><input name="capacity" className="input" type="number" min="1" /></label><label className="sm:col-span-2"><span className="label">Mô tả</span><textarea name="description" className="input h-40 py-3" /></label><div className="sm:col-span-2 flex justify-end gap-2"><Link to="/club-admin/events" className="btn-secondary">Hủy</Link><button disabled={saving || !admin.clubId} className="btn-primary">{saving ? "Đang tạo..." : "Đăng sự kiện"}</button></div></form></main>;
}

export function EditEventPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<EventDto | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    eventApi.getEventById(id).then(setEvent).catch((err) => setError(err instanceof Error ? err.message : "Không thể tải sự kiện."));
  }, [id]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setSaving(true);
    try {
      const updated = await eventApi.update(id, {
        name: String(form.get("name")),
        description: String(form.get("description")),
        location: String(form.get("location")),
        startTime: new Date(String(form.get("startTime"))).toISOString(),
        endTime: new Date(String(form.get("endTime"))).toISOString(),
        capacity: Number(form.get("capacity")) || undefined,
      });
      navigate(`/club-admin/events/${updated.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể cập nhật sự kiện.");
      setSaving(false);
    }
  }

  return <main className="page-shell max-w-5xl"><PageTitle title="Sửa sự kiện" description={event?.name ?? ""} />{error && <ErrorNotice message={error} />}{!event ? <LoadingState /> : <form onSubmit={submit} className="card grid gap-5 p-6 sm:grid-cols-2"><label className="sm:col-span-2"><span className="label">Tên sự kiện *</span><input name="name" className="input" required maxLength={200} defaultValue={event.name} /></label><label><span className="label">Bắt đầu *</span><input name="startTime" className="input" type="datetime-local" required defaultValue={toDateTimeLocalValue(event.startTime)} /></label><label><span className="label">Kết thúc *</span><input name="endTime" className="input" type="datetime-local" required defaultValue={toDateTimeLocalValue(event.endTime)} /></label><label><span className="label">Địa điểm</span><input name="location" className="input" defaultValue={event.location ?? ""} /></label><label><span className="label">Sức chứa</span><input name="capacity" className="input" type="number" min="1" defaultValue={event.capacity ?? ""} /></label><label className="sm:col-span-2"><span className="label">Mô tả</span><textarea name="description" className="input h-40 py-3" defaultValue={event.description ?? ""} /></label><div className="sm:col-span-2 flex justify-end gap-2"><Link to={`/club-admin/events/${event.id}`} className="btn-secondary">Hủy</Link><button disabled={saving} className="btn-primary">{saving ? "Đang lưu..." : "Lưu thay đổi"}</button></div></form>}</main>;
}

export function CancelEventPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<EventDto | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { eventApi.getEventById(id).then(setEvent).catch((e) => setError(e.message)); }, [id]);
  async function cancel() { if (!confirm("Bạn chắc chắn muốn hủy sự kiện này?")) return; try { await eventApi.cancel(id); navigate("/club-admin/events"); } catch (err) { setError(err instanceof Error ? err.message : "Không thể hủy sự kiện."); } }
  return <main className="page-shell max-w-4xl"><PageTitle title="Hủy sự kiện" description={event?.name} />{error && <ErrorNotice message={error} />}<section className="card p-6"><p className="text-muted">Backend hiện lưu trạng thái hủy nhưng chưa hỗ trợ gửi lý do hoặc thông báo tự động đến người đăng ký.</p><div className="mt-6 flex justify-end gap-2"><Link to={`/club-admin/events/${id}`} className="btn-secondary">Quay lại</Link><button onClick={() => void cancel()} className="btn-primary bg-red-600 hover:bg-red-700">Xác nhận hủy</button></div></section></main>;
}

export function CheckInPage() {
  const admin = useAdminClub();
  const members = useClubMembers(admin.clubId);
  const events = useClubEvents(admin.clubId);
  const [eventId, setEventId] = useState("");
  const [userId, setUserId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  async function checkIn() { if (!eventId || !userId) return setError("Vui lòng chọn sự kiện và thành viên."); try { await eventApi.checkIn(eventId, userId); setMessage("Check-in thành công và đã cộng 10 điểm."); setError(""); } catch (err) { setError(err instanceof Error ? err.message : "Check-in thất bại."); setMessage(""); } }
  return <main className="page-shell"><PageTitle title="Điểm danh sự kiện" description="Chọn sự kiện và thành viên đã đăng ký để check-in." />{error && <ErrorNotice message={error} />}{message && <SuccessNotice message={message} />}<div className="grid gap-6 lg:grid-cols-2"><SectionCard title="Check-in thủ công"><QrCode className="mb-5 h-16 w-16 text-primary" /><label><span className="label">Sự kiện</span><select className="input" value={eventId} onChange={(e) => setEventId(e.target.value)}><option value="">Chọn sự kiện</option>{events.events.filter((e) => e.status !== "Cancelled").map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}</select></label><label className="mt-4 block"><span className="label">Thành viên</span><select className="input" value={userId} onChange={(e) => setUserId(e.target.value)}><option value="">Chọn thành viên</option>{members.members.map((m) => <option key={m.userId} value={m.userId}>{m.fullName} ({m.studentCode ?? "không MSSV"})</option>)}</select></label><button onClick={() => void checkIn()} className="btn-primary mt-5 w-full">Xác nhận check-in</button></SectionCard><SectionCard title="Lưu ý"><p className="text-muted">Thành viên phải đăng ký sự kiện trước. Backend sẽ ngăn check-in trùng và tự động cộng 10 điểm khi thành công.</p><p className="mt-3 text-sm text-muted">Quét QR chưa được backend cung cấp token/endpoint nên chưa thể bật an toàn trên frontend.</p></SectionCard></div></main>;
}

export function FeedbackManagementPage() {
  const admin = useAdminClub();
  const events = useClubEvents(admin.clubId);
  const [summaries, setSummaries] = useState<Record<string, FeedbackSummary>>({});
  useEffect(() => { if (events.events.length) Promise.all(events.events.map(async (e) => [e.id, await feedbackApi.getEventFeedback(e.id)] as const)).then((pairs) => setSummaries(Object.fromEntries(pairs))).catch(() => setSummaries({})); }, [events.events]);
  const all = Object.entries(summaries).flatMap(([eventId, summary]) => summary.items.map((item) => ({ ...item, eventId })));
  const average = all.length ? all.reduce((sum, x) => sum + x.rating, 0) / all.length : 0;
  return <main className="page-shell"><PageTitle title="Phân tích phản hồi" description="Rating và nhận xét sau sự kiện." /><div className="grid gap-4 sm:grid-cols-2"><StatCard label="Đánh giá trung bình" value={`${average.toFixed(1)}/5`} icon={Star} /><StatCard label="Tổng feedback" value={String(all.length)} icon={MessageSquare} tone="blue" /></div><SectionCard title="Danh sách phản hồi" className="mt-6">{all.length ? <DataTable columns={["Sự kiện", "Người gửi", "Rating", "Nhận xét", "Ngày gửi"]} rows={all.map((f) => [events.events.find((e) => e.id === f.eventId)?.name ?? "—", f.userFullName, `${f.rating}/5`, f.comment ?? "—", dateTime(f.createdAt)])} /> : <EmptyState title="Chưa có phản hồi" description="Feedback của các sự kiện sẽ xuất hiện tại đây." />}</SectionCard></main>;
}
