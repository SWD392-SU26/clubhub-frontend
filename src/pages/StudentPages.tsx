import {
  Activity,
  Bell,
  CalendarDays,
  Camera,
  CheckCircle2,
  ChevronRight,
  Edit3,
  LockKeyhole,
  Medal,
  Save,
  ShieldCheck,
  Sparkles,
  Star,
  UserRound,
  Users,
  PlusCircle,
  FileText,
  Send,
  XCircle,
} from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { authApi } from "../api/authApi";
import { clearAuthSession, getProfile, setProfile } from "../api/authStorage";
import { clubApi } from "../api/clubApi";
import { eventApi } from "../api/eventApi";
import { membershipApi } from "../api/membershipApi";
import { pointApi } from "../api/pointApi";
import type { UserProfile } from "../types/auth";
import type { ClubCategory, ClubSummary, MyMembership } from "../types/club";
import type { EventDto, EventRegistration } from "../types/event";
import type { MyPointSummary } from "../types/point";
import { clubs, events, members, proposals, auditLogs } from "../data";
import {
  DataTable,
  EmptyState,
  FilterBar,
  images,
  PageTitle,
  SectionCard,
  StatCard,
  StatusBadge,
} from "../components";
import { getProfileDisplayName, useCurrentProfile } from "../useCurrentProfile";

function getInitials(name?: string | null) {
  if (!name?.trim()) return "U";

  return name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function getAccountPaths(pathname: string) {
  if (pathname.startsWith("/club-admin")) {
    return {
      profile: "/club-admin/profile",
      edit: "/club-admin/profile/edit",
      security: "/club-admin/account/security",
    };
  }

  if (pathname.startsWith("/system-admin")) {
    return {
      profile: "/system-admin/profile",
      edit: "/system-admin/profile/edit",
      security: "/system-admin/account/security",
    };
  }

  return {
    profile: "/profile",
    edit: "/profile/edit",
    security: "/account/security",
  };
}

function getRoleLabel(profile?: UserProfile | null, pathname = "") {
  if (pathname.startsWith("/club-admin")) return "Club Admin";
  if (pathname.startsWith("/system-admin")) return "University Admin";
  if (profile?.systemRole === "UniversityAdmin") return "University Admin";
  return "Student";
}

function getClubImage(club: ClubSummary) {
  return club.coverImageUrl || club.logoUrl || images.code;
}

const clubCategoryOptions: Array<{ label: string; value?: ClubCategory }> = [
  { label: "Tất cả" },
  { label: "Học thuật", value: "Academic" },
  { label: "Công nghệ", value: "Technology" },
  { label: "Thể thao", value: "Sports" },
  { label: "Nghệ thuật", value: "Arts" },
  { label: "Tình nguyện", value: "Volunteer" },
  { label: "Kỹ năng", value: "SoftSkills" },
  { label: "Truyền thông", value: "Media" },
  { label: "Khởi nghiệp", value: "Entrepreneurship" },
];

const clubCategoryLabels: Record<string, string> = {
  Academic: "Học thuật",
  Technology: "Công nghệ",
  Sports: "Thể thao",
  Arts: "Nghệ thuật",
  Volunteer: "Tình nguyện",
  SoftSkills: "Kỹ năng",
  Media: "Truyền thông",
  Entrepreneurship: "Khởi nghiệp",
};

function getClubCategoryLabel(category?: string | null) {
  if (!category) return "Khác";

  return clubCategoryLabels[category] ?? category;
}

function getMembershipStatusLabel(membership?: MyMembership) {
  if (!membership) return "Có thể tham gia";

  if (membership.status === "Pending") return "Đang chờ duyệt";
  if (membership.status === "Approved") return "Đã tham gia";
  if (membership.status === "Rejected") return "Đã bị từ chối";
  if (membership.status === "Left") return "Đã rời CLB";

  return membership.status;
}

function isClubManager(membership?: MyMembership) {
  return (
    membership?.status === "Approved" &&
    ["ClubAdmin", "President", "VicePresident"].includes(membership.roleInClub)
  );
}

function formatShortDate(value?: string | null) {
  if (!value) return "--";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  });
}

function formatTimeRange(start?: string | null, end?: string | null) {
  const startDate = start ? new Date(start) : null;
  const endDate = end ? new Date(end) : null;

  if (!startDate || Number.isNaN(startDate.getTime())) return "Chưa cập nhật";

  const startTime = startDate.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (!endDate || Number.isNaN(endDate.getTime())) return startTime;

  const endTime = endDate.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${startTime} - ${endTime}`;
}

function getRankLabel(totalPoints: number) {
  if (totalPoints >= 800) return "Vàng";
  if (totalPoints >= 500) return "Bạc";
  if (totalPoints > 0) return "Đồng";
  return "Mới";
}

export function StudentDashboard() {
  const profile = useCurrentProfile();
  const displayName = getProfileDisplayName(profile);
  const [myClubs, setMyClubs] = useState<ClubSummary[]>([]);
  const [memberships, setMemberships] = useState<MyMembership[]>([]);
  const [myEvents, setMyEvents] = useState<EventRegistration[]>([]);
  const [clubEvents, setClubEvents] = useState<EventDto[]>([]);
  const [pointSummary, setPointSummary] = useState<MyPointSummary | null>(null);
  const [joinedClubCount, setJoinedClubCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadDashboard() {
      setLoading(true);
      setError("");

      try {
        const [clubResult, membershipResult, eventRegistrations] =
          await Promise.all([
            clubApi.getMyClubs(1, 4),
            membershipApi.getMyMemberships(),
            eventApi.getMyEvents().catch(() => []),
          ]);

        if (ignore) return;

        const approvedMemberships = membershipResult.filter(
          (membership) => membership.status === "Approved",
        );
        const primaryClubId =
          approvedMemberships[0]?.clubId ?? clubResult.items[0]?.id;

        setMyClubs(clubResult.items);
        setMemberships(membershipResult);
        setMyEvents(eventRegistrations);
        setJoinedClubCount(clubResult.totalCount);

        if (primaryClubId) {
          const [clubEventResult, points] = await Promise.all([
            eventApi.getClubEvents(primaryClubId, 1, 3).catch(() => null),
            pointApi.getMyPoints(primaryClubId).catch(() => null),
          ]);

          if (ignore) return;

          setClubEvents(clubEventResult?.items ?? []);
          setPointSummary(points);
        } else {
          setClubEvents([]);
          setPointSummary(null);
        }
      } catch (err) {
        if (!ignore) {
          setError(
            err instanceof Error
              ? err.message
              : "Không tải được dữ liệu tổng quan.",
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      ignore = true;
    };
  }, []);

  const pendingMembershipCount = memberships.filter(
    (membership) => membership.status === "Pending",
  ).length;
  const approvedMembershipCount = memberships.filter(
    (membership) => membership.status === "Approved",
  ).length;
  const totalPoints = pointSummary?.totalPoints ?? 0;
  const rankLabel = getRankLabel(totalPoints);
  const dashboardNotes = [
    pendingMembershipCount > 0
      ? `${pendingMembershipCount} yêu cầu tham gia CLB đang chờ duyệt.`
      : "",
    myEvents.length > 0 ? `Bạn đã đăng ký ${myEvents.length} sự kiện.` : "",
    approvedMembershipCount > 0
      ? `Bạn đang là thành viên của ${approvedMembershipCount} CLB.`
      : "",
  ].filter(Boolean);

  return (
    <main className="page-shell">
      <PageTitle
        eyebrow="STUDENT"
        title={`Chào ${displayName}!`}
        description={
          clubEvents.length > 0
            ? `Bạn có ${clubEvents.length} sự kiện câu lạc bộ để theo dõi.`
            : "Khám phá câu lạc bộ, sự kiện và điểm hoạt động của bạn."
        }
        actions={
          <>
            <Link to="/club-proposals/new/step-1" className="btn-secondary">
              <Sparkles className="h-4 w-4" />
              Đề xuất CLB
            </Link>
            <Link to="/events" className="btn-primary">
              <CalendarDays className="h-4 w-4" />
              Đăng ký sự kiện
            </Link>
          </>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="CLB đã tham gia"
          value={String(joinedClubCount).padStart(2, "0")}
          meta={
            pendingMembershipCount > 0
              ? `${pendingMembershipCount} đang chờ duyệt`
              : "Đã duyệt"
          }
          icon={Users}
        />
        <StatCard
          label="Sự kiện đã đăng ký"
          value={String(myEvents.length).padStart(2, "0")}
          meta={clubEvents.length > 0 ? "Có hoạt động CLB" : "Chưa có mới"}
          icon={CalendarDays}
          tone="blue"
        />
        <StatCard
          label="Điểm rèn luyện"
          value={String(totalPoints)}
          meta={pointSummary ? `Hạng ${pointSummary.rank}` : "Chưa có điểm"}
          icon={Medal}
          tone="green"
        />
        <StatCard
          label="Hạng sinh viên"
          value={rankLabel}
          meta={pointSummary?.clubName ?? "Theo CLB đầu tiên"}
          icon={Star}
          tone="slate"
        />
      </div>
      {error && (
        <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {error}
        </p>
      )}
      <div className="mt-7 grid gap-6 xl:grid-cols-[1.65fr_.75fr]">
        <div className="space-y-6">
          <SectionCard
            title="CLB đang tham gia"
            action={
              <Link to="/my-clubs" className="btn-ghost text-primary">
                Xem tất cả
              </Link>
            }
          >
            {loading && (
              <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-muted">
                Đang tải câu lạc bộ của bạn...
              </p>
            )}
            {!loading && myClubs.length === 0 && (
              <EmptyState
                title="Bạn chưa tham gia CLB nào"
                description="Hãy khám phá các câu lạc bộ phù hợp và gửi yêu cầu tham gia."
              />
            )}
            {!loading && myClubs.length > 0 && (
              <div className="grid gap-5 md:grid-cols-2">
                {myClubs.slice(0, 2).map((club) => {
                  const membership = memberships.find(
                    (item) => item.clubId === club.id,
                  );

                  return (
                    <Link
                      to={`/clubs/${club.id}`}
                      className="rounded-xl border p-4 transition hover:bg-primary-soft"
                      key={club.id}
                    >
                      <div className="flex gap-4">
                        <img
                          src={getClubImage(club)}
                          className="h-20 w-20 rounded-xl object-cover"
                        />
                        <div>
                          <h3 className="font-bold">{club.name}</h3>
                          <p className="text-sm text-muted">
                            {membership?.roleInClub ?? "Member"}
                          </p>
                          <div className="mt-3 text-sm text-muted">
                            {club.memberCount} thành viên · {club.category}
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </SectionCard>
          <SectionCard title="Sự kiện từ CLB của bạn">
            {loading && (
              <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-muted">
                Đang tải sự kiện...
              </p>
            )}
            {!loading && clubEvents.length === 0 && (
              <EmptyState
                title="Chưa có sự kiện để theo dõi"
                description="Các sự kiện từ CLB bạn tham gia sẽ xuất hiện tại đây."
              />
            )}
            {!loading &&
              clubEvents.map((event) => (
                <Link
                  to={`/events/${event.id}`}
                  key={event.id}
                  className="mb-3 flex items-center gap-4 rounded-xl border p-4 hover:bg-primary-soft"
                >
                  <div className="grid h-14 w-14 place-items-center rounded-xl bg-sky-100 font-extrabold text-sky-700">
                    {formatShortDate(event.startTime)}
                  </div>
                  <div>
                    <div className="font-bold">{event.name}</div>
                    <div className="mt-1 text-sm text-muted">
                      {event.location || event.clubName} ·{" "}
                      {formatTimeRange(event.startTime, event.endTime)}
                    </div>
                  </div>
                  <ChevronRight className="ml-auto text-muted" />
                </Link>
              ))}
          </SectionCard>
        </div>
        <aside className="space-y-6">
          <SectionCard
            title="Thông báo mới nhất"
            action={
              <span className="grid h-6 w-6 place-items-center rounded-full bg-primary text-xs font-bold text-white">
                {dashboardNotes.length}
              </span>
            }
          >
            {dashboardNotes.length > 0 ? (
              <div className="space-y-5">
                {dashboardNotes.map((note, index) => (
                  <div key={note} className="flex gap-3">
                    <span
                      className={`mt-1 h-2.5 w-2.5 rounded-full ${
                        index ? "bg-sky-500" : "bg-primary"
                      }`}
                    />
                    <div>
                      <div className="font-semibold leading-6">{note}</div>
                      <div className="mt-1 text-xs text-muted">
                        Cập nhật từ hoạt động của bạn
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="Chưa có cập nhật mới"
                description="Các cập nhật liên quan đến CLB và sự kiện của bạn sẽ xuất hiện tại đây."
              />
            )}
            <Link to="/notifications" className="btn-secondary mt-5 w-full">
              Xem tất cả thông báo
            </Link>
          </SectionCard>
          <div className="rounded-2xl bg-gradient-to-br from-primary to-primary-dark p-6 text-white shadow-card">
            <Sparkles />
            <h3 className="mt-4 text-xl font-bold">Bạn có ý tưởng mới?</h3>
            <p className="mt-2 text-sm text-indigo-50">
              Đề xuất thành lập CLB và nhận hỗ trợ từ nhà trường.
            </p>
            <Link
              to="/club-proposals/new/step-1"
              className="mt-5 inline-block font-bold"
            >
              Bắt đầu ngay →
            </Link>
          </div>
        </aside>
      </div>
    </main>
  );
}
export function ProfilePage() {
  const location = useLocation();
  const paths = getAccountPaths(location.pathname);
  const [profile, setProfileState] = useState<UserProfile | null>(() =>
    getProfile(),
  );
  const [loading, setLoading] = useState(!profile);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadProfile() {
      setLoading(true);
      setError("");

      try {
        const data = await authApi.getMe();
        if (ignore) return;

        setProfileState(data);
        setProfile(data);
      } catch (err) {
        if (ignore) return;

        setError(err instanceof Error ? err.message : "Không tải được hồ sơ.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadProfile();

    return () => {
      ignore = true;
    };
  }, []);

  const initials = getInitials(profile?.fullName || profile?.username);

  return (
    <main className="page-shell">
      <div className="relative overflow-hidden rounded-[2rem] border bg-white shadow-card">
        <img src={images.campus} alt="" className="h-64 w-full object-cover" />
        <div className="p-6 pt-20 sm:pl-52 sm:pt-6">
          <div className="absolute bottom-24 left-7 grid h-36 w-36 place-items-center overflow-hidden rounded-3xl border-4 border-white bg-ink text-4xl font-extrabold text-white sm:bottom-6">
            {profile?.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.fullName}
                className="h-full w-full object-cover"
              />
            ) : (
              initials
            )}
            <span className="absolute bottom-2 right-2 h-5 w-5 rounded-full border-4 border-white bg-emerald-500" />
          </div>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-2xl font-extrabold">
                {profile?.fullName || "Đang tải hồ sơ..."}
              </h1>
              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
                <span>@{profile?.username || "username"}</span>
                {profile?.studentCode && <span>{profile.studentCode}</span>}
                <span>{getRoleLabel(profile, location.pathname)}</span>
                {profile?.phone && <span>{profile.phone}</span>}
              </div>
            </div>
            <Link to={paths.edit} className="btn-primary">
              <Edit3 className="h-4 w-4" />
              Chỉnh sửa hồ sơ
            </Link>
          </div>
        </div>
      </div>
      {error && (
        <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {error}
        </p>
      )}
      {loading && !profile && (
        <p className="mt-5 rounded-xl bg-slate-50 px-4 py-3 text-sm text-muted">
          Đang tải thông tin hồ sơ...
        </p>
      )}
      <div className="mt-6 grid gap-6 lg:grid-cols-[.7fr_1.5fr]">
        <div className="space-y-6">
          <SectionCard title="Thông tin tài khoản">
            <div className="grid gap-3 text-sm">
              <div>
                <div className="font-semibold text-muted">Email</div>
                <div className="mt-1 font-bold">{profile?.email || "-"}</div>
              </div>
              <div>
                <div className="font-semibold text-muted">Mã số sinh viên</div>
                <div className="mt-1 font-bold">
                  {profile?.studentCode || "-"}
                </div>
              </div>
              <div>
                <div className="font-semibold text-muted">Số điện thoại</div>
                <div className="mt-1 font-bold">{profile?.phone || "-"}</div>
              </div>
            </div>
          </SectionCard>
          <SectionCard title="Vai trò hệ thống">
            <span className="status-info">
              {getRoleLabel(profile, location.pathname)}
            </span>
          </SectionCard>
        </div>
        <div className="space-y-6">
          <SectionCard title="Câu lạc bộ hiện tại">
            <div className="grid gap-4 sm:grid-cols-2">
              {clubs.slice(0, 2).map((c) => (
                <Link
                  to={`/clubs/${c.id}`}
                  className="rounded-xl border p-4 hover:bg-primary-soft"
                  key={c.id}
                >
                  <h3 className="font-bold">{c.name}</h3>
                  <p className="text-sm text-muted">{c.category}</p>
                </Link>
              ))}
            </div>
          </SectionCard>
          <SectionCard title="Hoạt động gần đây">
            <ActivityList />
          </SectionCard>
        </div>
      </div>
    </main>
  );
}
function ActivityList() {
  return (
    <div className="space-y-4">
      {auditLogs.slice(0, 3).map(([time, actor, text, status]) => (
        <div key={text} className="flex gap-4 rounded-xl bg-slate-50 p-4">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-primary-soft text-primary">
            <Activity className="h-5 w-5" />
          </span>
          <div>
            <div className="text-xs text-muted">
              {time} · {actor}
            </div>
            <div className="mt-1 font-semibold">{text}</div>
            <StatusBadge status={status} />
          </div>
        </div>
      ))}
    </div>
  );
}
export function EditProfilePage() {
  const location = useLocation();
  const paths = getAccountPaths(location.pathname);
  const [profile, setProfileState] = useState<UserProfile | null>(() =>
    getProfile(),
  );
  const [fullName, setFullName] = useState(profile?.fullName ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl ?? "");
  const [loading, setLoading] = useState(!profile);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadProfile() {
      setLoading(true);
      setError("");

      try {
        const data = await authApi.getMe();
        if (ignore) return;

        setProfileState(data);
        setFullName(data.fullName);
        setPhone(data.phone ?? "");
        setAvatarUrl(data.avatarUrl ?? "");
        setProfile(data);
      } catch (err) {
        if (ignore) return;

        setError(err instanceof Error ? err.message : "Không tải được hồ sơ.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadProfile();

    return () => {
      ignore = true;
    };
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();

    const normalizedPhone = phone.trim().replace(/\s+/g, "");

    if (!fullName.trim()) {
      setError("Vui lòng nhập họ và tên.");
      setSuccess("");
      return;
    }

    if (
      normalizedPhone &&
      !/^(0(3|5|7|8|9)\d{8}|\+84(3|5|7|8|9)\d{8})$/.test(normalizedPhone)
    ) {
      setError("Số điện thoại không hợp lệ.");
      setSuccess("");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const updated = await authApi.updateMe({
        fullName: fullName.trim(),
        phone: normalizedPhone || undefined,
        avatarUrl: avatarUrl.trim() || undefined,
      });

      setProfileState(updated);
      setFullName(updated.fullName);
      setPhone(updated.phone ?? "");
      setAvatarUrl(updated.avatarUrl ?? "");
      setProfile(updated);
      setSuccess("Cập nhật hồ sơ thành công.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cập nhật hồ sơ thất bại.");
    } finally {
      setSaving(false);
    }
  };

  const initials = getInitials(fullName || profile?.username);

  return (
    <main className="page-shell max-w-5xl">
      <PageTitle
        title="Chỉnh sửa hồ sơ"
        description="Cập nhật thông tin cá nhân và cách bạn xuất hiện trong cộng đồng ClubHub."
      />
      <form onSubmit={submit} className="space-y-6">
        <section className="card flex flex-col items-center gap-5 p-6 sm:flex-row">
          <div className="relative grid h-28 w-28 place-items-center overflow-hidden rounded-full bg-ink text-3xl font-bold text-white">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={fullName}
                className="h-full w-full object-cover"
              />
            ) : (
              initials
            )}
            <span className="absolute bottom-0 right-0 grid h-10 w-10 place-items-center rounded-full bg-primary text-white">
              <Camera className="h-5 w-5" />
            </span>
          </div>
          <div className="w-full">
            <h2 className="text-xl font-bold">Ảnh đại diện</h2>
            <p className="mt-1 text-sm text-muted">
              Dán URL ảnh đại diện. Sau này có thể thay bằng upload file.
            </p>
            <input
              className="input mt-4"
              placeholder="https://..."
              value={avatarUrl}
              onChange={(e) => {
                setAvatarUrl(e.target.value);
                setError("");
                setSuccess("");
              }}
            />
          </div>
        </section>
        <section className="card flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-soft text-primary">
              <LockKeyhole className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-ink">Đổi mật khẩu</h2>
              <p className="mt-1 text-sm text-muted">
                Cập nhật mật khẩu đăng nhập để bảo vệ tài khoản của bạn.
              </p>
            </div>
          </div>
          <Link to={paths.security} className="btn-secondary">
            Đổi mật khẩu
          </Link>
        </section>
        <section className="card grid gap-5 p-6 sm:grid-cols-2">
          <label>
            <span className="label">Họ và tên</span>
            <input
              className="input"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                setError("");
                setSuccess("");
              }}
            />
          </label>
          <label>
            <span className="label">MSSV</span>
            <input
              className="input bg-slate-100"
              value={profile?.studentCode ?? "-"}
              readOnly
            />
          </label>
          <label className="sm:col-span-2">
            <span className="label">Email sinh viên</span>
            <input
              className="input bg-slate-100"
              value={profile?.email ?? "-"}
              readOnly
            />
          </label>
          <label>
            <span className="label">Username</span>
            <input
              className="input bg-slate-100"
              value={profile?.username ?? "-"}
              readOnly
            />
          </label>
          <label>
            <span className="label">Vai trò hệ thống</span>
            <input
              className="input bg-slate-100"
              value={getRoleLabel(profile, location.pathname)}
              readOnly
            />
          </label>
          <label className="sm:col-span-2">
            <span className="label">Số điện thoại</span>
            <input
              className="input"
              placeholder="0900000000"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setError("");
                setSuccess("");
              }}
            />
          </label>
        </section>
        {loading && (
          <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-muted">
            Đang tải thông tin hồ sơ...
          </p>
        )}
        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {error}
          </p>
        )}
        {success && (
          <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {success}
          </p>
        )}
        <div className="flex justify-end gap-3">
          <Link to={paths.profile} className="btn-secondary">
            Hủy
          </Link>
          <button disabled={saving} className="btn-primary">
            <Save className="h-4 w-4" />
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </form>
    </main>
  );
}
export function AccountSecurityPage() {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const loginAgain = () => {
    clearAuthSession();
    sessionStorage.clear();
    navigate("/login", {
      replace: true,
      state: { message: "Vui lòng đăng nhập lại bằng mật khẩu mới." },
    });
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      setError("Vui lòng nhập mật khẩu hiện tại.");
      setSuccess("");
      return;
    }

    if (!newPassword) {
      setError("Vui lòng nhập mật khẩu mới.");
      setSuccess("");
      return;
    }

    if (newPassword.length < 6) {
      setError("Mật khẩu mới cần tối thiểu 6 ký tự.");
      setSuccess("");
      return;
    }

    if (!confirmPassword) {
      setError("Vui lòng xác nhận mật khẩu mới.");
      setSuccess("");
      return;
    }

    if (confirmPassword !== newPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      setSuccess("");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await authApi.changePassword({
        currentPassword,
        newPassword,
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess("Cập nhật mật khẩu thành công.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Cập nhật mật khẩu thất bại.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-shell">
      <PageTitle
        title="Bảo mật tài khoản"
        description="Quản lý mật khẩu và các thiết lập bảo vệ tài khoản."
      />
      <div className="grid gap-6">
        <SectionCard title="Đổi mật khẩu">
          <form onSubmit={submit} className="space-y-4">
            <label>
              <span className="label">Mật khẩu hiện tại</span>
              <input
                type="password"
                className="input"
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value);
                  clearMessages();
                }}
              />
            </label>
            <label>
              <span className="label">Mật khẩu mới</span>
              <input
                type="password"
                className="input"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  clearMessages();
                }}
              />
            </label>
            <label>
              <span className="label">Xác nhận mật khẩu mới</span>
              <input
                type="password"
                className="input"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  clearMessages();
                }}
              />
            </label>
            {error && (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {error}
              </p>
            )}
            <button disabled={loading} className="btn-primary">
              {loading ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
            </button>
          </form>
        </SectionCard>
        <section className="card border-red-200 bg-red-50 p-6">
          <h2 className="text-xl font-bold text-red-800">Khu vực nguy hiểm</h2>
          <p className="mt-2 text-sm text-red-700">
            Xóa tài khoản sẽ xóa dữ liệu cá nhân và lịch sử tham gia.
          </p>
          <button className="mt-5 rounded-xl border border-red-500 px-5 py-3 font-semibold text-red-700">
            Xóa tài khoản vĩnh viễn
          </button>
        </section>
      </div>
      {success && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-2xl">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h2 className="mt-4 text-xl font-bold text-ink">
              Đổi mật khẩu thành công
            </h2>
            <p className="mt-2 text-sm text-muted">{success}</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Link to="/dashboard" className="btn-secondary justify-center">
                Về trang chính
              </Link>
              <button
                type="button"
                onClick={loginAgain}
                className="btn-primary"
              >
                Đăng nhập lại
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
export function NotificationsPage() {
  const notes = [
    "Nhắc nhở: Cuộc họp Câu lạc bộ Tiếng Anh",
    "Bảo trì hệ thống định kỳ",
    "Nguyễn Minh Tú đã tham gia CLB Media",
    "Lỗi đăng ký hoạt động",
  ];
  return (
    <main className="page-shell">
      <PageTitle
        title="Trung tâm thông báo"
        description="Theo dõi cập nhật quan trọng từ hệ thống và các câu lạc bộ."
        actions={
          <button className="btn-secondary">
            <CheckCircle2 className="h-4 w-4" />
            Đánh dấu tất cả đã đọc
          </button>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="card h-fit p-4">
          <div className="grid gap-2">
            {[
              "Tất cả",
              "Chưa đọc",
              "Hệ thống",
              "Sự kiện",
              "Thành viên CLB",
            ].map((x, i) => (
              <button
                key={x}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left font-semibold ${i === 0 ? "bg-primary-soft text-primary" : "hover:bg-slate-100"}`}
              >
                <Bell className="h-4 w-4" />
                {x}
              </button>
            ))}
          </div>
        </aside>
        <section className="card overflow-hidden">
          {notes.map((title, i) => (
            <article key={title} className="flex gap-4 border-b p-5 sm:p-7">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
                <Bell />
              </span>
              <div>
                <h2 className="text-lg font-bold">{title}</h2>
                <p className="mt-1 text-muted">
                  Nội dung thông báo mẫu theo thiết kế Stitch.
                </p>
                <StatusBadge
                  status={i === 3 ? "WARNING" : i === 1 ? "SYSTEM" : "NEW"}
                />
              </div>
              <div className="ml-auto whitespace-nowrap text-xs text-muted">
                {i < 2 ? "2 giờ trước" : "Hôm qua"}
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
export function MyClubsPage() {
  const [clubList, setClubList] = useState<ClubSummary[]>([]);
  const [memberships, setMemberships] = useState<MyMembership[]>([]);
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    ClubCategory | undefined
  >();
  const [membershipFilter, setMembershipFilter] = useState<
    "all" | "approved" | "pending" | "available"
  >("all");
  const [loading, setLoading] = useState(true);
  const [joiningClubId, setJoiningClubId] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let ignore = false;

    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError("");

      try {
        const [clubResult, membershipResult] = await Promise.all([
          clubApi.getClubs({
            searchTerm: searchText.trim() || undefined,
            category: selectedCategory,
            page: 1,
            pageSize: 24,
          }),
          membershipApi.getMyMemberships(),
        ]);

        if (ignore) return;

        setClubList(clubResult.items);
        setMemberships(membershipResult);
      } catch (err) {
        if (!ignore) {
          setError(
            err instanceof Error
              ? err.message
              : "Không thể tải danh sách câu lạc bộ.",
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }, 250);

    return () => {
      ignore = true;
      window.clearTimeout(timer);
    };
  }, [searchText, selectedCategory]);

  const getMembership = (clubId: string) =>
    memberships.find((membership) => membership.clubId === clubId);

  const filteredClubs = clubList.filter((club) => {
    const membership = getMembership(club.id);

    if (membershipFilter === "approved") {
      return membership?.status === "Approved";
    }

    if (membershipFilter === "pending") {
      return membership?.status === "Pending";
    }

    if (membershipFilter === "available") {
      return !membership || ["Rejected", "Left"].includes(membership.status);
    }

    return true;
  });

  const approvedCount = memberships.filter(
    (membership) => membership.status === "Approved",
  ).length;
  const pendingCount = memberships.filter(
    (membership) => membership.status === "Pending",
  ).length;

  const joinClub = async (club: ClubSummary) => {
    setJoiningClubId(club.id);
    setError("");
    setSuccessMessage("");

    try {
      await membershipApi.joinClub(club.id);

      const nextMembership: MyMembership = {
        clubId: club.id,
        clubName: club.name,
        clubLogo: club.logoUrl,
        roleInClub: "Member",
        status: "Pending",
        requestedAt: new Date().toISOString(),
      };

      setMemberships((current) => {
        const exists = current.some(
          (membership) => membership.clubId === club.id,
        );

        if (exists) {
          return current.map((membership) =>
            membership.clubId === club.id ? nextMembership : membership,
          );
        }

        return [...current, nextMembership];
      });
      setSuccessMessage(`Đã gửi yêu cầu tham gia ${club.name}.`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Không thể gửi yêu cầu tham gia câu lạc bộ.",
      );
    } finally {
      setJoiningClubId("");
    }
  };

  const membershipFilterOptions: Array<{
    label: string;
    value: "all" | "approved" | "pending" | "available";
  }> = [
    { label: "Tất cả", value: "all" },
    { label: `Đã tham gia (${approvedCount})`, value: "approved" },
    { label: `Đang chờ (${pendingCount})`, value: "pending" },
    { label: "Có thể tham gia", value: "available" },
  ];

  return (
    <main className="page-shell">
      <PageTitle
        title="Câu lạc bộ"
        description="Khám phá câu lạc bộ, theo dõi trạng thái tham gia và gửi yêu cầu ngay tại đây."
        actions={
          <Link to="/club-proposals/new/step-1" className="btn-primary">
            <PlusCircle className="h-4 w-4" />
            Đề xuất CLB
          </Link>
        }
      />
      <FilterBar
        placeholder="Tìm kiếm câu lạc bộ..."
        value={searchText}
        onChange={setSearchText}
        actions={clubCategoryOptions.map((option) => (
          <button
            type="button"
            className={
              selectedCategory === option.value
                ? "btn-primary"
                : "btn-secondary"
            }
            key={option.label}
            onClick={() => setSelectedCategory(option.value)}
          >
            {option.label}
          </button>
        ))}
      />
      <div className="mt-4 flex flex-wrap gap-2">
        {membershipFilterOptions.map((option) => (
          <button
            type="button"
            key={option.value}
            onClick={() => setMembershipFilter(option.value)}
            className={
              membershipFilter === option.value
                ? "btn-primary"
                : "btn-secondary"
            }
          >
            {option.label}
          </button>
        ))}
      </div>
      {error && (
        <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {error}
        </p>
      )}
      {successMessage && (
        <p className="mt-5 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {successMessage}
        </p>
      )}
      {loading && (
        <p className="mt-6 rounded-xl bg-slate-50 px-4 py-3 text-sm text-muted">
          Đang tải danh sách câu lạc bộ...
        </p>
      )}
      {!loading && filteredClubs.length === 0 && (
        <section className="mt-6">
          <EmptyState
            title="Chưa tìm thấy câu lạc bộ phù hợp"
            description="Bạn có thể đổi bộ lọc, tìm bằng tên khác hoặc đề xuất thành lập CLB mới."
          />
        </section>
      )}
      {!loading && filteredClubs.length > 0 && (
        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredClubs.map((club) => {
            const membership = getMembership(club.id);
            const canJoin =
              !membership || ["Rejected", "Left"].includes(membership.status);
            const manager = isClubManager(membership);

            return (
              <article className="card overflow-hidden" key={club.id}>
                <img
                  src={getClubImage(club)}
                  alt={club.name}
                  className="h-40 w-full object-cover"
                />
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                      {getClubCategoryLabel(club.category)}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        membership?.status === "Approved"
                          ? "bg-emerald-50 text-emerald-700"
                          : membership?.status === "Pending"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-primary-soft text-primary"
                      }`}
                    >
                      {getMembershipStatusLabel(membership)}
                    </span>
                  </div>
                  <h3 className="mt-4 text-lg font-extrabold">{club.name}</h3>
                  <p className="mt-2 min-h-[3rem] text-sm text-muted">
                    {club.description || "Câu lạc bộ đang cập nhật mô tả."}
                  </p>
                  <div className="mt-4 flex items-center justify-between border-t pt-4 text-sm text-muted">
                    <span>{club.memberCount} thành viên</span>
                    {membership?.roleInClub && (
                      <span>{membership.roleInClub}</span>
                    )}
                  </div>
                  <div className="mt-5 grid gap-2 sm:grid-cols-2">
                    <Link
                      to={`/my-clubs/${club.id}`}
                      className="btn-secondary justify-center"
                    >
                      Chi tiết
                    </Link>
                    {manager ? (
                      <Link
                        to="/club-admin"
                        className="btn-primary justify-center"
                      >
                        Quản trị
                      </Link>
                    ) : canJoin ? (
                      <button
                        type="button"
                        onClick={() => joinClub(club)}
                        disabled={joiningClubId === club.id}
                        className="btn-primary justify-center"
                      >
                        {joiningClubId === club.id ? "Đang gửi..." : "Tham gia"}
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="btn-secondary justify-center opacity-70"
                      >
                        {membership?.status === "Pending"
                          ? "Đang chờ duyệt"
                          : "Đã tham gia"}
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
export function MyEventsPage() {
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadMyEvents() {
      setLoading(true);
      setError("");

      try {
        const data = await eventApi.getMyEvents();

        if (!ignore) {
          setRegistrations(data);
        }
      } catch (err) {
        if (!ignore) {
          setError(
            err instanceof Error
              ? err.message
              : "Không tải được sự kiện của bạn.",
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadMyEvents();

    return () => {
      ignore = true;
    };
  }, []);

  const cancelRegistration = async (eventId: string) => {
    setCancellingId(eventId);
    setError("");

    try {
      await eventApi.cancelRegistration(eventId);

      setRegistrations((current) =>
        current.filter((item) => item.eventId !== eventId),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hủy đăng ký thất bại.");
    } finally {
      setCancellingId("");
    }
  };

  return (
    <main className="page-shell">
      <PageTitle
        title="Sự kiện của tôi"
        description="Theo dõi các sự kiện bạn đã đăng ký và trạng thái check-in."
      />

      {error && (
        <p className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {error}
        </p>
      )}

      {loading && (
        <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-muted">
          Đang tải sự kiện của bạn...
        </p>
      )}

      {!loading && registrations.length === 0 && (
        <EmptyState
          title="Bạn chưa đăng ký sự kiện nào"
          description="Hãy khám phá các sự kiện từ câu lạc bộ và đăng ký tham gia."
        />
      )}

      {!loading && registrations.length > 0 && (
        <div className="grid gap-4">
          {registrations.map((registration) => (
            <section
              className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center"
              key={registration.id}
            >
              <div className="grid h-16 w-16 place-items-center rounded-xl bg-primary-soft text-center font-bold text-primary">
                {formatShortDate(registration.registeredAt)}
              </div>

              <div className="flex-1">
                <h3 className="font-bold">{registration.eventName}</h3>
                <p className="text-sm text-muted">
                  Đăng ký lúc {formatTimeRange(registration.registeredAt, null)}
                </p>
              </div>

              <StatusBadge
                status={registration.isCheckedIn ? "Đã check-in" : "Đã đăng ký"}
              />

              <Link
                to={`/events/${registration.eventId}`}
                className="btn-secondary"
              >
                Chi tiết
              </Link>

              {!registration.isCheckedIn && (
                <button
                  onClick={() => cancelRegistration(registration.eventId)}
                  disabled={cancellingId === registration.eventId}
                  className="btn-ghost text-red-600"
                >
                  {cancellingId === registration.eventId
                    ? "Đang hủy..."
                    : "Hủy đăng ký"}
                </button>
              )}
            </section>
          ))}
        </div>
      )}
    </main>
  );
}

export function JoinRequestsPage() {
  const [memberships, setMemberships] = useState<MyMembership[]>([]);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "Pending" | "Approved" | "Rejected" | "Left"
  >("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadMemberships() {
      setLoading(true);
      setError("");

      try {
        const data = await membershipApi.getMyMemberships();

        if (!ignore) {
          setMemberships(data);
        }
      } catch (err) {
        if (!ignore) {
          setError(
            err instanceof Error
              ? err.message
              : "Không tải được yêu cầu tham gia CLB.",
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadMemberships();

    return () => {
      ignore = true;
    };
  }, []);

  const filteredMemberships = memberships.filter((membership) => {
    const matchesSearch = membership.clubName
      .toLowerCase()
      .includes(searchText.trim().toLowerCase());
    const matchesStatus =
      statusFilter === "all" || membership.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const statusOptions: Array<{
    label: string;
    value: "all" | "Pending" | "Approved" | "Rejected" | "Left";
  }> = [
    { label: "Tất cả", value: "all" },
    { label: "Đang chờ", value: "Pending" },
    { label: "Đã duyệt", value: "Approved" },
    { label: "Đã từ chối", value: "Rejected" },
    { label: "Đã rời", value: "Left" },
  ];

  return (
    <main className="page-shell">
      <PageTitle
        title="Yêu cầu hội viên của tôi"
        description="Theo dõi trạng thái đơn tham gia CLB."
        actions={
          <Link to="/my-clubs" className="btn-primary">
            <PlusCircle className="h-4 w-4" />
            Tìm CLB mới
          </Link>
        }
      />
      <FilterBar
        placeholder="Tìm câu lạc bộ..."
        value={searchText}
        onChange={setSearchText}
        actions={statusOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setStatusFilter(option.value)}
            className={
              statusFilter === option.value ? "btn-primary" : "btn-secondary"
            }
          >
            {option.label}
          </button>
        ))}
      />

      {error && (
        <p className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {error}
        </p>
      )}

      {loading && (
        <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-muted">
          Đang tải yêu cầu tham gia CLB...
        </p>
      )}

      {!loading && filteredMemberships.length === 0 && (
        <EmptyState
          title="Chưa có yêu cầu phù hợp"
          description="Các yêu cầu tham gia CLB của bạn sẽ xuất hiện tại đây."
        />
      )}

      {!loading && filteredMemberships.length > 0 && (
        <section className="card overflow-hidden">
          <DataTable
            columns={["Tên câu lạc bộ", "Ngày gửi", "Vai trò", "Trạng thái"]}
            rows={filteredMemberships.map((membership) => [
              membership.clubName,
              formatShortDate(membership.requestedAt),
              membership.roleInClub,
              <StatusBadge status={getMembershipStatusLabel(membership)} />,
            ])}
          />
        </section>
      )}
    </main>
  );
}

export function ClubProposalsPage() {
  return (
    <main className="page-shell">
      <PageTitle
        title="Đề xuất của tôi"
        description="Quản lý hồ sơ đề xuất thành lập CLB."
        actions={
          <Link to="/club-proposals/new/step-1" className="btn-primary">
            <PlusCircle className="h-4 w-4" />
            Tạo đề xuất mới
          </Link>
        }
      />
      <FilterBar
        placeholder="Tìm kiếm tên câu lạc bộ..."
        actions={[
          "Tất cả",
          "Bản nháp",
          "Đã gửi",
          "Cần chỉnh sửa",
          "Đã duyệt",
        ].map((x) => (
          <button key={x} className="btn-secondary">
            {x}
          </button>
        ))}
      />
      <section className="card overflow-hidden">
        <DataTable
          columns={["Tên câu lạc bộ", "Ngày gửi", "Trạng thái", "Hành động"]}
          rows={proposals.map((p) => [
            p.name,
            p.date,
            <StatusBadge status={p.status} />,
            <Link to={`/club-proposals/${p.id}`} className="btn-ghost">
              Xem chi tiết
            </Link>,
          ])}
        />
      </section>
    </main>
  );
}
export function ClubProposalDetailPage() {
  const p = proposals[1];
  return (
    <main className="page-shell">
      <PageTitle
        eyebrow={p.status}
        title={p.name}
        description="Chi tiết hồ sơ đề xuất và phản hồi từ ban quản lý."
        actions={
          <>
            <button className="btn-secondary">
              <FileText className="h-4 w-4" />
              Chỉnh sửa và gửi lại
            </button>
            <button className="btn-ghost text-red-600">
              <XCircle className="h-4 w-4" />
              Hủy đề xuất
            </button>
          </>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[1.4fr_.8fr]">
        <SectionCard title="Thông tin đề xuất">
          <p className="leading-7 text-muted">
            Mô tả chi tiết, sứ mệnh, kế hoạch hoạt động, người sáng lập và tài
            liệu đính kèm.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <StatCard label="Điểm hồ sơ" value={`${p.score}`} icon={Star} />
            <StatCard
              label="Ngày gửi"
              value={p.date}
              icon={CalendarDays}
              tone="blue"
            />
            <StatCard
              label="Trạng thái"
              value={p.status}
              icon={ShieldCheck}
              tone="green"
            />
          </div>
        </SectionCard>
        <SectionCard title="Phản hồi từ Ban quản lý">
          <p className="text-muted">
            Cần bổ sung dự trù kinh phí và làm rõ kế hoạch tuyển thành viên
            trong học kỳ đầu.
          </p>
        </SectionCard>
      </div>
    </main>
  );
}
export function ProposalStepPage({ step }: { step: number }) {
  const titles = [
    "Thông tin cơ bản",
    "Tầm nhìn & Mục đích",
    "Thông tin người sáng lập",
    "Đính kèm tài liệu",
    "Kiểm tra & Gửi đề xuất",
  ];
  return (
    <main className="page-shell max-w-5xl">
      <PageTitle
        eyebrow={`Bước ${step}/5`}
        title={titles[step - 1]}
        description="Wizard đề xuất thành lập CLB theo thiết kế Stitch."
      />
      <section className="card p-6">
        <div className="mb-6 flex gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full ${i <= step ? "bg-primary" : "bg-slate-200"}`}
            />
          ))}
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {step === 1 && (
            <>
              <label>
                <span className="label">Tên câu lạc bộ *</span>
                <input
                  className="input"
                  placeholder="VD: Câu lạc bộ Mỹ thuật Sáng tạo"
                />
              </label>
              <label>
                <span className="label">Tên viết tắt *</span>
                <input className="input" placeholder="VD: CAC" />
              </label>
              <label>
                <span className="label">Lĩnh vực *</span>
                <select className="input">
                  <option>Công nghệ</option>
                  <option>Nghệ thuật</option>
                </select>
              </label>
              <label className="sm:col-span-2">
                <span className="label">Mô tả ngắn gọn *</span>
                <textarea className="input h-28 py-3" />
              </label>
            </>
          )}
          {step === 2 && (
            <>
              <label className="sm:col-span-2">
                <span className="label">Sứ mệnh *</span>
                <textarea className="input h-28 py-3" />
              </label>
              <label className="sm:col-span-2">
                <span className="label">Lý do thành lập *</span>
                <textarea className="input h-28 py-3" />
              </label>
              <label>
                <span className="label">Kế hoạch học kỳ 1</span>
                <textarea className="input h-28 py-3" />
              </label>
              <label>
                <span className="label">Kế hoạch học kỳ 2</span>
                <textarea className="input h-28 py-3" />
              </label>
            </>
          )}
          {step === 3 && (
            <>
              <label>
                <span className="label">Họ và tên *</span>
                <input className="input" />
              </label>
              <label>
                <span className="label">MSSV *</span>
                <input className="input" />
              </label>
              <label>
                <span className="label">Email sinh viên *</span>
                <input className="input" />
              </label>
              <label>
                <span className="label">Số điện thoại *</span>
                <input className="input" />
              </label>
            </>
          )}
          {step === 4 && (
            <>
              <div className="sm:col-span-2 rounded-2xl border border-dashed p-8 text-center">
                <FileText className="mx-auto text-primary" />
                <h3 className="mt-3 font-bold">
                  Tải logo và bản kế hoạch chi tiết
                </h3>
                <p className="text-sm text-muted">Hỗ trợ PNG, JPG, PDF, DOCX</p>
              </div>
            </>
          )}
          {step === 5 && (
            <>
              <SectionCard title="Tóm tắt hồ sơ">
                <p className="text-muted">
                  Kiểm tra thông tin chung, ban điều hành, kế hoạch hoạt động và
                  tài liệu đính kèm trước khi gửi.
                </p>
              </SectionCard>
            </>
          )}{" "}
        </div>
        <div className="mt-8 flex justify-between">
          <Link
            to={
              step > 1
                ? `/club-proposals/new/step-${step - 1}`
                : "/club-proposals"
            }
            className="btn-secondary"
          >
            Quay lại
          </Link>
          <Link
            to={
              step < 5
                ? `/club-proposals/new/step-${step + 1}`
                : "/club-proposals"
            }
            className="btn-primary"
          >
            {step < 5 ? "Tiếp theo" : "Gửi đề xuất"}
            <Send className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
export function PointsHistoryPage() {
  return (
    <main className="page-shell">
      <PageTitle
        title="Lịch sử điểm thành viên"
        description="Theo dõi điểm rèn luyện cá nhân trong CLB."
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Tổng điểm" value="850" icon={Medal} />
        <StatCard
          label="Check-in"
          value="+320"
          icon={CheckCircle2}
          tone="green"
        />
        <StatCard label="Feedback" value="+42" icon={Star} tone="blue" />
      </div>
      <section className="card mt-6 overflow-hidden">
        <DataTable
          columns={["Thời gian", "Hoạt động", "Số điểm", "Trạng thái"]}
          rows={auditLogs.map(([time, , text, status]) => [
            time,
            text,
            "+10",
            <StatusBadge status={status} />,
          ])}
        />
      </section>
    </main>
  );
}
