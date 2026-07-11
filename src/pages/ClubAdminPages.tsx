import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Eye,
  MessageSquare,
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
            <Link className="btn-secondary" to="/club-admin/settings">Cài đặt CLB</Link>
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
        <SectionCard title="Quản trị"><Link to="/club-admin/transfer" className="btn-secondary">Chuyển quyền chủ nhiệm</Link><p className="mt-4 text-sm text-muted">Lịch sử tham gia sự kiện theo từng thành viên chưa được backend cung cấp.</p></SectionCard>
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
    <PageTitle title={event?.name ?? "Chi tiết sự kiện"} description={event ? `${dateTime(event.startTime)} · ${event.location ?? "Chưa có địa điểm"}` : ""} actions={event && <><Link to="/club-admin/check-in" className="btn-secondary"><QrCode className="h-4 w-4" />Check-in</Link><Link to={`/club-admin/events/${event.id}/cancel`} className="btn-ghost text-red-600"><XCircle className="h-4 w-4" />Hủy sự kiện</Link></>} />
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

export function PointsManagementPage() {
  const admin = useAdminClub();
  const [points, setPoints] = useState<MemberPoint[]>([]);
  const [error, setError] = useState("");
  useEffect(() => { if (admin.clubId) pointApi.getLeaderboard(admin.clubId, 1, 100).then((x) => setPoints(x.items)).catch((e) => setError(e.message)); }, [admin.clubId]);
  return <main className="page-shell"><PageTitle title="Điểm thành viên" description="Bảng xếp hạng điểm thi đua của CLB." />{error && <ErrorNotice message={error} />}<SectionCard title="Bảng xếp hạng"><DataTable columns={["Hạng", "Thành viên", "Tổng điểm"]} rows={points.map((p) => [p.rank, p.fullName, p.totalPoints])} /></SectionCard><div className="mt-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">Backend chưa có API cộng/trừ điểm thủ công. Điểm hiện được tự động ghi nhận khi check-in và gửi feedback.</div></main>;
}

export function ClubStatisticsPage() {
  const admin = useAdminClub();
  const members = useClubMembers(admin.clubId);
  const events = useClubEvents(admin.clubId);
  const totalRegistrations = events.events.reduce((sum, e) => sum + e.registeredCount, 0);
  return <main className="page-shell"><PageTitle title={`Thống kê: ${admin.club?.name ?? "CLB"}`} /><div className="grid gap-4 sm:grid-cols-3"><StatCard label="Thành viên" value={String(members.members.length)} icon={Users} /><StatCard label="Sự kiện" value={String(events.events.length)} icon={CalendarDays} tone="blue" /><StatCard label="Lượt đăng ký" value={String(totalRegistrations)} icon={BarChart3} tone="green" /></div><SectionCard title="Tỷ lệ đăng ký theo sự kiện" className="mt-6"><div className="space-y-4">{events.events.map((e) => <div key={e.id}><div className="mb-1 flex justify-between text-sm"><span className="font-semibold">{e.name}</span><span>{e.registeredCount}/{e.capacity ?? "∞"}</span></div><div className="h-3 rounded-full bg-slate-100"><div className="h-3 rounded-full bg-primary" style={{ width: `${e.capacity ? Math.min(100, e.registeredCount / e.capacity * 100) : 0}%` }} /></div></div>)}</div></SectionCard></main>;
}

export function ClubAuditLogPage() {
  return <main className="page-shell"><PageTitle title="Nhật ký hoạt động CLB" /><EmptyState title="Backend chưa hỗ trợ nhật ký" description="Cần bổ sung Audit Log API trước khi màn hình này có thể hiển thị dữ liệu thật." /></main>;
}

export function ClubSettingsPage() {
  const admin = useAdminClub();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  async function save(e: FormEvent<HTMLFormElement>) { e.preventDefault(); const form = new FormData(e.currentTarget); try { const updated = await clubApi.updateClub(admin.clubId, { name: String(form.get("name")), description: String(form.get("description")), logoUrl: String(form.get("logoUrl")), coverImageUrl: String(form.get("coverImageUrl")) }); admin.setClub(updated); setMessage("Đã lưu thông tin CLB."); setError(""); } catch (err) { setError(err instanceof Error ? err.message : "Không thể lưu thay đổi."); } }
  return <main className="page-shell max-w-5xl"><PageTitle title="Cài đặt CLB" description="Cập nhật thông tin và nhận diện công khai." />{error && <ErrorNotice message={error} />}{message && <SuccessNotice message={message} />}{admin.loading ? <LoadingState /> : admin.club && <form onSubmit={save} className="card grid gap-5 p-6 sm:grid-cols-2"><label><span className="label">Tên CLB *</span><input name="name" className="input" defaultValue={admin.club.name} required /></label><label><span className="label">Danh mục</span><input className="input" value={admin.club.category} disabled /></label><label><span className="label">Logo URL</span><input name="logoUrl" className="input" defaultValue={admin.club.logoUrl ?? ""} /></label><label><span className="label">Ảnh bìa URL</span><input name="coverImageUrl" className="input" defaultValue={admin.club.coverImageUrl ?? ""} /></label><label className="sm:col-span-2"><span className="label">Mô tả</span><textarea name="description" className="input h-40 py-3" defaultValue={admin.club.description ?? ""} /></label><div className="sm:col-span-2 flex justify-end"><button className="btn-primary">Lưu thay đổi</button></div></form>}</main>;
}

export function TransferOwnershipPage() {
  const admin = useAdminClub();
  const data = useClubMembers(admin.clubId);
  const navigate = useNavigate();
  const [error, setError] = useState("");
  async function transfer(member: ClubMember) { if (!confirm(`Chuyển quyền chủ nhiệm cho ${member.fullName}? Hành động này không thể hoàn tác.`)) return; try { await membershipApi.transferAdmin(admin.clubId, member.userId); navigate("/dashboard"); } catch (err) { setError(err instanceof Error ? err.message : "Không thể chuyển quyền."); } }
  return <main className="page-shell max-w-4xl"><PageTitle title="Chuyển quyền chủ nhiệm" description="Chọn một thành viên đang hoạt động để nhận quyền chủ nhiệm CLB." />{error && <ErrorNotice message={error} />}<SectionCard title="Thành viên đủ điều kiện">{data.members.filter((m) => m.roleInClub !== "President").map((m) => <div key={m.userId} className="mb-3 flex items-center justify-between rounded-xl border p-4"><div><div className="font-bold">{m.fullName}</div><div className="text-sm text-muted">{m.studentCode ?? "Không có MSSV"} · {m.roleInClub}</div></div><button onClick={() => void transfer(m)} className="btn-secondary">Chọn</button></div>)}</SectionCard></main>;
}

export function ClubStatusPage() {
  const admin = useAdminClub();
  return <main className="page-shell"><PageTitle title="Trạng thái và hiển thị" /><div className="grid gap-6 lg:grid-cols-2"><SectionCard title="Trạng thái CLB">{admin.club && <StatusBadge status={admin.club.status} />}<p className="mt-3 text-muted">CLB ở trạng thái Active sẽ xuất hiện trên trang khám phá công khai.</p>{admin.club && <Link to={`/clubs/${admin.club.id}`} className="btn-secondary mt-5"><Eye className="h-4 w-4" />Xem trang công khai</Link>}</SectionCard><SectionCard title="Ngừng hoạt động"><p className="text-muted">Backend hiện chỉ cho University Admin ẩn, khóa hoặc xóa CLB. Club Admin chưa có API gửi yêu cầu ngừng hoạt động.</p></SectionCard></div></main>;
}
