import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Palette,
  Search,
  ShieldCheck,
  Users,
  Filter,
  Star,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { getAccessToken } from "../api/authStorage";
import { clubApi } from "../api/clubApi";
import { membershipApi } from "../api/membershipApi";
import { eventApi } from "../api/eventApi";
import { feedbackApi } from "../api/feedbackApi";
import type {
  ClubCategory,
  ClubDetail,
  ClubSummary,
  MyMembership,
} from "../types/club";
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
import type { EventDto, EventRegistration } from "../types/event";
import type { FeedbackSummary } from "../types/feedback";

const fallbackClubImage =
  "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1200&q=80";

type ClubTileData = {
  id: string;
  name: string;
  category: string;
  description?: string | null;
  logoUrl?: string | null;
  coverImageUrl?: string | null;
  image?: string;
  memberCount?: number;
  members?: number;
};

const clubCategoryOptions: Array<{
  label: string;
  value?: ClubCategory;
}> = [
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

function getClubImage(club: ClubTileData) {
  return club.coverImageUrl || club.logoUrl || club.image || fallbackClubImage;
}

function isGuid(value?: string) {
  return Boolean(
    value?.match(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    ),
  );
}

function clubSummaryToDetail(club: ClubSummary): ClubDetail {
  return {
    ...club,
    officers: [],
  };
}

async function getClubDetailFallback(id?: string) {
  if (!id || !isGuid(id)) return null;

  const publicClubs = await clubApi
    .getClubs({ page: 1, pageSize: 100 })
    .catch(() => null);
  const publicClub = publicClubs?.items.find((club) => club.id === id);

  if (publicClub) return clubSummaryToDetail(publicClub);

  if (!getAccessToken()) return null;

  const myClubs = await clubApi.getMyClubs(1, 100).catch(() => null);
  const myClub = myClubs?.items.find((club) => club.id === id);

  return myClub ? clubSummaryToDetail(myClub) : null;
}

function ClubTile({ club }: { club: ClubTileData }) {
  const memberCount = club.memberCount ?? club.members ?? 0;

  return (
    <article className="card overflow-hidden transition hover:-translate-y-1 hover:shadow-lift">
      <img
        src={getClubImage(club)}
        alt={club.name}
        className="h-44 w-full object-cover"
      />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <StatusBadge status={club.category} />
            <h3 className="mt-3 text-lg font-bold">{club.name}</h3>
            <p className="mt-2 line-clamp-2 text-sm text-muted">
              {club.description}
            </p>
          </div>
        </div>
        <div className="mt-5 flex items-center justify-between border-t pt-4 text-sm">
          <span className="text-muted">{memberCount} thành viên</span>
          <Link className="font-bold text-primary" to={`/clubs/${club.id}`}>
            Chi tiết
          </Link>
        </div>
      </div>
    </article>
  );
}

function PublicEventCard({
  event,
  compact = false,
}: {
  event: EventDto;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <Link
        to={`/events/${event.id}`}
        className="card flex gap-4 p-5 transition hover:-translate-y-0.5 hover:shadow-lift"
      >
        <div className="grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-primary-soft text-center text-sm font-extrabold text-primary">
          {formatEventDate(event.startTime).slice(0, 2)}
          <span className="block text-[10px]">
            THÁNG {formatEventDate(event.startTime).slice(3, 5)}
          </span>
        </div>
        <div className="min-w-0">
          <h3 className="line-clamp-2 font-bold">{event.name}</h3>
          <p className="mt-1 text-sm text-muted">
            {event.location || "Chưa cập nhật"} ·{" "}
            {formatEventTimeRange(event.startTime, event.endTime)}
          </p>
          <p className="mt-1 text-xs font-semibold text-primary">
            {event.clubName}
          </p>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/events/${event.id}`}
      className="card overflow-hidden transition hover:-translate-y-1 hover:shadow-lift"
    >
      <img
        src={images.students}
        className="h-44 w-full object-cover"
        alt={event.name}
      />
      <div className="p-5">
        <StatusBadge status={event.status} />
        <h3 className="mt-3 text-lg font-bold">{event.name}</h3>
        <p className="mt-2 text-sm text-muted">{event.clubName}</p>
        <div className="mt-4 flex justify-between gap-4 text-sm text-muted">
          <span>{formatEventDate(event.startTime)}</span>
          <span>
            {event.capacity
              ? `${event.registeredCount}/${event.capacity}`
              : "Không giới hạn"}
          </span>
        </div>
      </div>
    </Link>
  );
}

export function HomePage() {
  const [featuredClubs, setFeaturedClubs] = useState<ClubSummary[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<EventDto[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function loadLandingData() {
      setEventsLoading(true);

      const [clubResult, eventResult] = await Promise.all([
        clubApi.getClubs({ page: 1, pageSize: 3 }).catch(() => null),
        eventApi.getPublicUpcomingEvents(3).catch(() => []),
      ]);

      if (!ignore) {
        setFeaturedClubs(clubResult?.items ?? []);
        setUpcomingEvents(eventResult);
        setEventsLoading(false);
      }
    }

    loadLandingData();

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <main>
      <section className="hero-grid overflow-hidden bg-white">
        <div className="mx-auto grid min-h-[620px] max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <div className="eyebrow">ClubHub 2026</div>
            <h1 className="mt-4 text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
              Kết nối đam mê,
              <br />
              <span className="text-primary">kiến tạo tương lai.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-muted">
              Nền tảng quản lý câu lạc bộ sinh viên giúp bạn tìm cộng đồng phù
              hợp, theo dõi sự kiện và phát triển kỹ năng.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <div className="flex h-12 flex-1 items-center gap-3 rounded-xl border bg-white px-4 shadow-sm">
                <Search className="h-5 w-5 text-muted" />
                <input
                  className="w-full outline-none"
                  placeholder="Bạn muốn tham gia CLB nào?"
                />
              </div>
              <Link to="/clubs" className="btn-primary">
                Tìm kiếm ngay <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-6 flex items-center gap-3 text-sm text-muted">
              <div className="flex -space-x-3">
                <span className="h-10 w-10 rounded-full border-4 border-white bg-primary-soft" />
                <span className="h-10 w-10 rounded-full border-4 border-white bg-sky-100" />
                <span className="h-10 w-10 rounded-full border-4 border-white bg-emerald-100" />
              </div>
              Hơn 5.000 sinh viên đã tham gia mạng lưới
            </div>
          </div>
          <div className="relative">
            <img
              src={images.campus}
              alt="Sinh viên ClubHub"
              className="h-[500px] w-full rounded-[2rem] object-cover shadow-lift"
            />
            <div className="card absolute -bottom-6 -left-5 max-w-xs p-5">
              <div className="flex gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
                  <CheckCircle2 />
                </span>
                <div>
                  <div className="font-bold">Hoạt động sôi nổi</div>
                  <div className="text-sm text-muted">
                    120+ CLB và hơn 300 sự kiện mỗi năm
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="page-shell py-20">
        <div className="text-center">
          <div className="eyebrow">Tại sao chọn ClubHub?</div>
          <h2 className="mt-2 text-3xl font-extrabold">
            Nền tảng toàn diện cho sinh viên
          </h2>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            [
              Search,
              "Khám phá câu lạc bộ",
              "Bộ lọc thông minh giúp tìm cộng đồng phù hợp.",
            ],
            [
              CalendarDays,
              "Tham gia sự kiện",
              "Đăng ký và theo dõi lịch hoạt động dễ dàng.",
            ],
            [
              ShieldCheck,
              "Quản lý minh bạch",
              "Công cụ vận hành dành cho quản trị viên.",
            ],
          ].map(([Icon, title, text]) => (
            <div key={String(title)} className="card p-7">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary-soft text-primary">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-xl font-bold">{String(title)}</h3>
              <p className="mt-2 leading-7 text-muted">{String(text)}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="bg-white py-20">
        <div className="page-shell">
          <PageTitle
            eyebrow="Cộng đồng nổi bật"
            title="Câu lạc bộ dành cho bạn"
            actions={
              <Link to="/clubs" className="btn-secondary">
                Xem tất cả
              </Link>
            }
          />
          {featuredClubs.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-3">
              {featuredClubs.map((club) => (
                <ClubTile key={club.id} club={club} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Chưa có câu lạc bộ nổi bật"
              description="Các câu lạc bộ đang hoạt động sẽ xuất hiện tại đây khi được công bố."
            />
          )}
        </div>
      </section>
      <section className="page-shell py-20">
        <PageTitle
          eyebrow="Đừng bỏ lỡ"
          title="Sự kiện sắp tới"
          actions={
            <Link to="/events" className="btn-secondary">
              Tất cả sự kiện
            </Link>
          }
        />
        {eventsLoading ? (
          <p className="rounded-xl bg-white px-4 py-3 text-sm text-muted">
            Đang tải sự kiện sắp tới...
          </p>
        ) : upcomingEvents.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-3">
            {upcomingEvents.map((event) => (
              <PublicEventCard key={event.id} event={event} compact />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Chưa có sự kiện sắp tới"
            description="Các sự kiện đã mở đăng ký sẽ xuất hiện tại đây khi câu lạc bộ công bố lịch mới."
          />
        )}
      </section>
    </main>
  );
}
export function StyleGuidePage() {
  return (
    <main className="page-shell">
      <PageTitle
        eyebrow="Design system"
        title="Bảng chỉ dẫn phong cách"
        description="Tone FPT: cam là màu chính, trắng là nền/card, xanh dương cho thông tin và xanh lá cho trạng thái tích cực."
      />
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="section-title">Màu sắc</h2>
          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              ["FPT Orange", "#F37021", "bg-fpt-orange"],
              ["FPT Blue", "#005BAA", "bg-fpt-blue"],
              ["FPT Green", "#46B946", "bg-fpt-green"],
              ["White", "#FFFFFF", "bg-white"],
            ].map(([name, hex, klass]) => (
              <div key={name}>
                <div className={`h-24 rounded-xl border ${klass}`} />
                <div className="mt-2 font-bold">{name}</div>
                <div className="text-xs text-muted">{hex}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="card p-6">
          <h2 className="section-title">Typography</h2>
          <div className="mt-5 space-y-4">
            <div className="text-4xl font-extrabold">Tiêu đề lớn</div>
            <div className="text-2xl font-bold">Tiêu đề khu vực</div>
            <p className="leading-7 text-muted">
              Nội dung sử dụng Inter, độ tương phản cao và nhịp dọc thoáng.
            </p>
          </div>
        </div>
        <div className="card p-6">
          <h2 className="section-title">Buttons & Badges</h2>
          <div className="mt-5 flex flex-wrap gap-3">
            <button className="btn-primary">Primary</button>
            <button className="btn-secondary">Secondary</button>
            <button className="btn-info">Info</button>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <StatusBadge status="Approved" />
            <StatusBadge status="Pending" />
            <StatusBadge status="Need Revision" />
            <StatusBadge status="Rejected" />
          </div>
        </div>
        <div className="card p-6">
          <h2 className="section-title">Form</h2>
          <div className="mt-5 grid gap-4">
            <input className="input" placeholder="Họ và tên" />
            <select className="input">
              <option>Chọn loại câu lạc bộ</option>
            </select>
            <textarea className="input h-28 py-3" placeholder="Mô tả" />
          </div>
        </div>
      </section>
      <section className="mt-6 card p-6">
        <h2 className="section-title">Trạng thái dùng chung</h2>
        <div className="mt-5">
          <EmptyState />
        </div>
      </section>
    </main>
  );
}
export function ClubsExplorePage() {
  const [clubList, setClubList] = useState<ClubSummary[]>([]);
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    ClubCategory | undefined
  >();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchText.trim());
    }, 350);

    return () => window.clearTimeout(timer);
  }, [searchText]);

  useEffect(() => {
    let ignore = false;

    async function loadClubs() {
      setLoading(true);
      setError("");

      try {
        const result = await clubApi.getClubs({
          category: selectedCategory,
          searchTerm: debouncedSearch || undefined,
          page: 1,
          pageSize: 12,
        });
        if (!ignore) {
          setClubList(result.items);
        }
      } catch (err) {
        if (!ignore) {
          setError(
            err instanceof Error
              ? err.message
              : "Không tải được danh sách CLB.",
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadClubs();

    return () => {
      ignore = true;
    };
  }, [debouncedSearch, selectedCategory]);

  return (
    <main className="page-shell">
      <PageTitle
        eyebrow="Public / Student"
        title="Khám phá câu lạc bộ"
        description="Tìm kiếm, lọc lĩnh vực và gửi yêu cầu tham gia CLB."
      />
      <FilterBar
        placeholder="Tìm kiếm tên CLB hoặc từ khóa..."
        value={searchText}
        onChange={setSearchText}
        onSearch={() => setDebouncedSearch(searchText.trim())}
        actions={clubCategoryOptions.map((option) => (
          <button
            key={option.label}
            type="button"
            onClick={() => setSelectedCategory(option.value)}
            className={
              selectedCategory === option.value
                ? "btn-primary"
                : "btn-secondary"
            }
          >
            {option.label}
          </button>
        ))}
      />
      {loading && (
        <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-muted">
          Đang tải danh sách câu lạc bộ...
        </p>
      )}
      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {error}
        </p>
      )}
      {!loading && !error && clubList.length === 0 && (
        <EmptyState
          title="Chưa tìm thấy câu lạc bộ phù hợp"
          description="Thử đổi từ khóa tìm kiếm hoặc chọn lĩnh vực khác để khám phá thêm."
        />
      )}
      {!loading && !error && clubList.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {clubList.map((club) => (
            <ClubTile key={club.id} club={club} />
          ))}
        </div>
      )}
    </main>
  );
}
export function ClubDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [club, setClub] = useState<ClubDetail | null>(null);
  const [currentMembership, setCurrentMembership] =
    useState<MyMembership | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [joining, setJoining] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [joinReason, setJoinReason] = useState("");
  const [joinReasonError, setJoinReasonError] = useState("");
  const [joinMessage, setJoinMessage] = useState("");
  const [joinSuccess, setJoinSuccess] = useState(false);
  const [upcomingEvents, setUpcomingEvents] = useState<EventDto[]>([]);
  const [showAllUpcomingEvents, setShowAllUpcomingEvents] = useState(false);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadClubDetail() {
      if (!id) {
        setError("Không tìm thấy mã câu lạc bộ.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        if (!isGuid(id)) {
          throw new Error("Câu lạc bộ không tồn tại hoặc đã bị ẩn.");
        }

        const data = await clubApi.getClubById(id);
        const memberships = getAccessToken()
          ? await membershipApi.getMyMemberships().catch(() => [])
          : [];

        if (!ignore) {
          setClub(data);
          setCurrentMembership(
            memberships.find((membership) => membership.clubId === data.id) ??
              null,
          );
        }
      } catch (err) {
        if (!ignore) {
          const fallbackClub = await getClubDetailFallback(id);

          if (fallbackClub) {
            const memberships = getAccessToken()
              ? await membershipApi.getMyMemberships().catch(() => [])
              : [];

            if (ignore) return;

            setClub(fallbackClub);
            setCurrentMembership(null);
            setCurrentMembership(
              memberships.find(
                (membership) => membership.clubId === fallbackClub.id,
              ) ?? null,
            );
            setError("");
          } else {
            setError(
              err instanceof Error ? err.message : "Không tải được CLB.",
            );
          }
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadClubDetail();

    return () => {
      ignore = true;
    };
  }, [id]);

  useEffect(() => {
    let ignore = false;

    async function loadClubEvents() {
      if (!club?.id || !isGuid(club.id)) {
        setUpcomingEvents([]);
        setShowAllUpcomingEvents(false);
        setEventsError("");
        return;
      }

      setEventsLoading(true);
      setEventsError("");

      try {
        const result = await eventApi.getClubEvents(club.id, 1, 20);

        if (!ignore) {
          setUpcomingEvents(result.items);
          setShowAllUpcomingEvents(false);
        }
      } catch (err) {
        if (!ignore) {
          setUpcomingEvents([]);
          setShowAllUpcomingEvents(false);
          setEventsError(
            err instanceof Error
              ? err.message
              : "Không tải được sự kiện của CLB.",
          );
        }
      } finally {
        if (!ignore) {
          setEventsLoading(false);
        }
      }
    }

    loadClubEvents();

    return () => {
      ignore = true;
    };
  }, [club?.id]);

  const openJoinDialog = () => {
    if (!club) return;

    if (!getAccessToken()) {
      navigate("/login", {
        state: {
          from: location.pathname,
          message: "Vui lòng đăng nhập để gửi yêu cầu tham gia CLB.",
        },
      });
      return;
    }

    if (currentMembership?.status === "Pending") {
      setJoinSuccess(true);
      setJoinMessage(
        "Bạn đã gửi yêu cầu tham gia CLB này. Vui lòng chờ duyệt.",
      );
      return;
    }

    if (currentMembership?.status === "Approved") {
      setJoinSuccess(true);
      setJoinMessage("Bạn đã là thành viên của CLB này.");
      return;
    }

    setJoinDialogOpen(true);
    setJoinReason("");
    setJoinReasonError("");
    setJoinMessage("");
    setJoinSuccess(false);
  };

  const closeJoinDialog = () => {
    if (joining) return;

    setJoinDialogOpen(false);
    setJoinReason("");
    setJoinReasonError("");
  };

  const joinClub = async () => {
    if (!club) return;

    const reason = joinReason.trim();

    if (!reason) {
      setJoinReasonError("Vui lòng nhập lý do tham gia CLB.");
      return;
    }

    setJoining(true);
    setJoinMessage("");
    setJoinSuccess(false);
    setJoinReasonError("");

    try {
      await membershipApi.joinClub(club.id, reason);
      setCurrentMembership({
        clubId: club.id,
        clubName: club.name,
        clubLogo: club.logoUrl,
        roleInClub: "Member",
        status: "Pending",
        requestedAt: new Date().toISOString(),
        joinedAt: null,
      });
      setJoinSuccess(true);
      setJoinMessage("Đã gửi yêu cầu tham gia. Vui lòng chờ duyệt.");
      setJoinDialogOpen(false);
      setJoinReason("");
    } catch (err) {
      setJoinSuccess(false);
      setJoinMessage(
        err instanceof Error ? err.message : "Gửi yêu cầu tham gia thất bại.",
      );
    } finally {
      setJoining(false);
    }
  };

  const openLeaveDialog = () => {
    if (!club || currentMembership?.status !== "Approved") return;

    setLeaveDialogOpen(true);
    setJoinMessage("");
    setJoinSuccess(false);
  };

  const closeLeaveDialog = () => {
    if (leaving) return;

    setLeaveDialogOpen(false);
  };

  const leaveClub = async () => {
    if (!club || currentMembership?.status !== "Approved") return;

    setLeaving(true);
    setJoinMessage("");
    setJoinSuccess(false);

    try {
      await membershipApi.leaveClub(club.id);
      setCurrentMembership({
        ...currentMembership,
        status: "Left",
      });
      setLeaveDialogOpen(false);
      setJoinSuccess(true);
      setJoinMessage(`Bạn đã rời ${club.name}.`);
    } catch (err) {
      setJoinSuccess(false);
      setJoinMessage(err instanceof Error ? err.message : "Không thể rời CLB.");
    } finally {
      setLeaving(false);
    }
  };

  const joinButtonLabel =
    club && !isGuid(club.id)
      ? "Đang xem thông tin"
      : currentMembership?.status === "Pending"
        ? "Đã gửi yêu cầu"
        : currentMembership?.status === "Approved"
          ? "Đã là thành viên"
          : joining
            ? "Đang gửi..."
            : "Gửi yêu cầu tham gia";
  const joinButtonDisabled =
    Boolean(club && !isGuid(club.id)) ||
    joining ||
    currentMembership?.status === "Pending" ||
    currentMembership?.status === "Approved";
  const officers = club?.officers ?? [];
  const activeUpcomingEvents = upcomingEvents.filter(
    (event) => !["Completed", "Cancelled"].includes(event.status),
  );
  const visibleUpcomingEvents = showAllUpcomingEvents
    ? activeUpcomingEvents
    : activeUpcomingEvents.slice(0, 3);
  const hiddenUpcomingEventCount = Math.max(activeUpcomingEvents.length - 3, 0);

  if (loading) {
    return (
      <main className="page-shell">
        <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-muted">
          Đang tải thông tin câu lạc bộ...
        </p>
      </main>
    );
  }

  if (error || !club) {
    return (
      <main className="page-shell">
        <EmptyState
          title="Không tải được câu lạc bộ"
          description={error || "Câu lạc bộ không tồn tại hoặc đã bị ẩn."}
        />
      </main>
    );
  }

  return (
    <main className="page-shell">
      <section className="card overflow-hidden">
        <img
          src={getClubImage(club)}
          className="h-72 w-full object-cover"
          alt={club.name}
        />
        <div className="p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <StatusBadge status={club.category} />
              <h1 className="mt-3 text-4xl font-extrabold">{club.name}</h1>
              <p className="mt-2 max-w-3xl text-muted">{club.description}</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              {currentMembership?.status === "Approved" && (
                <Link to="/my-clubs" className="btn-secondary">
                  Câu lạc bộ của tôi
                </Link>
              )}
              <button
                disabled={joinButtonDisabled}
                onClick={openJoinDialog}
                className={
                  currentMembership?.status === "Approved"
                    ? "btn-secondary opacity-80"
                    : "btn-primary"
                }
              >
                {joinButtonLabel}
              </button>
              {currentMembership?.status === "Approved" && (
                <button
                  type="button"
                  onClick={openLeaveDialog}
                  disabled={leaving}
                  className="rounded-2xl border border-red-200 bg-red-50 px-5 py-3 font-bold text-red-600 transition hover:border-red-300 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {leaving ? "Đang rời..." : "Rời CLB"}
                </button>
              )}
            </div>
          </div>
          {joinMessage && (
            <p
              className={`mt-5 rounded-xl px-4 py-3 text-sm font-medium ${
                joinSuccess
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-red-50 text-red-600"
              }`}
            >
              {joinMessage}
            </p>
          )}
        </div>
      </section>
      {leaveDialogOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lift">
            <h2 className="text-xl font-extrabold">Rời {club.name}?</h2>
            <p className="mt-2 text-sm text-muted">
              Sau khi rời CLB, bạn sẽ cần gửi yêu cầu tham gia lại nếu muốn quay
              lại trong tương lai.
            </p>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                className="btn-secondary"
                onClick={closeLeaveDialog}
                disabled={leaving}
              >
                Hủy
              </button>
              <button
                type="button"
                className="rounded-2xl border border-red-200 bg-red-50 px-5 py-3 font-bold text-red-600 transition hover:border-red-300 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={leaveClub}
                disabled={leaving}
              >
                {leaving ? "Đang rời..." : "Xác nhận rời CLB"}
              </button>
            </div>
          </div>
        </div>
      )}
      {joinDialogOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-lift">
            <h2 className="text-xl font-extrabold">Tham gia {club.name}</h2>
            <p className="mt-2 text-sm text-muted">
              Chia sẻ ngắn gọn lý do bạn muốn tham gia để ban điều hành CLB có
              thêm thông tin khi duyệt yêu cầu.
            </p>
            <label className="mt-5 block">
              <span className="label">Lý do tham gia</span>
              <textarea
                className="input h-32 py-3"
                value={joinReason}
                onChange={(event) => {
                  setJoinReason(event.target.value);
                  setJoinReasonError("");
                }}
                placeholder="Ví dụ: Em muốn học hỏi, tham gia hoạt động và đóng góp cho CLB..."
              />
            </label>
            {joinReasonError && (
              <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {joinReasonError}
              </p>
            )}
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                className="btn-secondary"
                onClick={closeJoinDialog}
                disabled={joining}
              >
                Hủy
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={joinClub}
                disabled={joining}
              >
                {joining ? "Đang gửi..." : "Gửi yêu cầu"}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_.8fr]">
        <div className="space-y-6">
          <SectionCard title="Sứ mệnh">
            <p className="leading-7 text-muted">
              {club.description ||
                "Thông tin mô tả câu lạc bộ sẽ được cập nhật sau."}
            </p>
          </SectionCard>
          <SectionCard title="Sự kiện sắp tới">
            {eventsLoading && (
              <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-muted">
                Đang tải sự kiện của CLB...
              </p>
            )}
            {!eventsLoading && eventsError && (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {eventsError}
              </p>
            )}
            {!eventsLoading &&
              !eventsError &&
              activeUpcomingEvents.length === 0 && (
                <EmptyState
                  title="Chưa có sự kiện sắp tới"
                  description="Các sự kiện mới của CLB sẽ xuất hiện tại đây."
                />
              )}
            {!eventsLoading &&
              !eventsError &&
              visibleUpcomingEvents.map((event) => (
                <Link
                  key={event.id}
                  to={`/events/${event.id}`}
                  className="mb-3 block rounded-xl border p-4 hover:bg-primary-soft"
                >
                  <div className="font-bold">{event.name}</div>
                  <div className="mt-1 text-sm text-muted">
                    {formatEventDate(event.startTime)} ·{" "}
                    {formatEventTimeRange(event.startTime, event.endTime)}
                  </div>
                  <div className="mt-1 text-sm text-muted">
                    {event.location || "Chưa cập nhật địa điểm"}
                  </div>
                </Link>
              ))}
            {!eventsLoading && !eventsError && hiddenUpcomingEventCount > 0 && (
              <button
                type="button"
                onClick={() => setShowAllUpcomingEvents((current) => !current)}
                className="btn-secondary mt-2 w-full"
              >
                {showAllUpcomingEvents
                  ? "Thu gọn"
                  : `Xem thêm ${hiddenUpcomingEventCount} sự kiện`}
              </button>
            )}
          </SectionCard>
        </div>
        <aside className="space-y-6">
          <SectionCard title="Ban điều hành">
            {officers.length > 0 ? (
              <div className="space-y-3">
                {officers.map((officer) => (
                  <div
                    key={`${officer.userId}-${officer.roleInClub}`}
                    className="rounded-xl border p-4"
                  >
                    <div className="font-bold">{officer.fullName}</div>
                    <StatusBadge status={officer.roleInClub} />
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="Chưa có ban điều hành"
                description="Danh sách ban điều hành sẽ được cập nhật sau."
              />
            )}
          </SectionCard>
          <SectionCard title="Thông tin liên hệ">
            <p className="text-muted">clubhub@university.edu.vn</p>
            <p className="text-muted">fb.com/clubhub.official</p>
          </SectionCard>
        </aside>
      </div>
    </main>
  );
}
function membersPreview() {
  return [
    {
      name: "Nguyễn Văn A",
      code: "SE180001",
      role: "President",
      status: "ACTIVE",
    },
    { name: "Trần Thị B", code: "SE180112", role: "Member", status: "ACTIVE" },
    { name: "Lê Minh C", code: "SE181230", role: "Member", status: "PENDING" },
  ];
}
export function EventsExplorePage() {
  const [eventList, setEventList] = useState<EventDto[]>([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadEvents() {
      setLoading(true);
      setError("");

      try {
        const data = await eventApi.getPublicUpcomingEvents(100);

        if (!ignore) {
          setEventList(data);
        }
      } catch (err) {
        if (!ignore) {
          setEventList([]);
          setError(
            err instanceof Error
              ? err.message
              : "Không tải được danh sách sự kiện.",
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadEvents();

    return () => {
      ignore = true;
    };
  }, []);

  const normalizedSearch = searchText.trim().toLowerCase();
  const filteredEvents = normalizedSearch
    ? eventList.filter((event) =>
        [event.name, event.clubName, event.location]
          .filter(Boolean)
          .some((value) => value?.toLowerCase().includes(normalizedSearch)),
      )
    : eventList;

  return (
    <main className="page-shell">
      <PageTitle
        eyebrow="Events"
        title="Khám phá sự kiện"
        description="Theo dõi sự kiện đang diễn ra, sắp diễn ra và đăng ký tham gia."
      />
      <FilterBar
        placeholder="Tìm kiếm sự kiện..."
        value={searchText}
        onChange={setSearchText}
        actions={
          <>
            <button className="btn-secondary">
              <Filter className="h-4 w-4" />
              Bộ lọc
            </button>
          </>
        }
      />
      {error && (
        <p className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {error}
        </p>
      )}
      {loading && (
        <p className="rounded-xl bg-white px-4 py-3 text-sm text-muted">
          Đang tải sự kiện công khai...
        </p>
      )}
      {!loading && filteredEvents.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-3">
          {filteredEvents.map((event) => (
            <PublicEventCard key={event.id} event={event} />
          ))}
        </div>
      )}
      {!loading && filteredEvents.length === 0 && (
        <>
          <EmptyState
            title={
              searchText.trim()
                ? "Không tìm thấy sự kiện phù hợp"
                : "Chưa có sự kiện công khai"
            }
            description={
              searchText.trim()
                ? "Hãy thử tìm bằng tên sự kiện, câu lạc bộ hoặc địa điểm khác."
                : "Các sự kiện đang mở đăng ký sẽ xuất hiện tại đây khi câu lạc bộ công bố lịch mới."
            }
          />
          <Link to="/clubs" className="btn-primary mt-5 w-fit">
            Khám phá câu lạc bộ
          </Link>
        </>
      )}
    </main>
  );
}
function formatEventDate(value?: string | null) {
  if (!value) return "--";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatEventTimeRange(start?: string | null, end?: string | null) {
  const startDate = start ? new Date(start) : null;
  const endDate = end ? new Date(end) : null;

  if (!startDate || Number.isNaN(startDate.getTime())) {
    return "Chưa cập nhật";
  }

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

function getEventActionLabel(status?: string | null) {
  if (status === "Draft") return "Chưa mở đăng ký";
  if (status === "Ongoing") return "Đang diễn ra";
  if (status === "Completed") return "Đã kết thúc";
  if (status === "Cancelled") return "Đã hủy";
  return "Không nhận đăng ký";
}

export function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [event, setEvent] = useState<EventDto | null>(null);
  const [myRegistration, setMyRegistration] =
    useState<EventRegistration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [registering, setRegistering] = useState(false);
  const [loadingRegistration, setLoadingRegistration] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [feedbackSummary, setFeedbackSummary] =
    useState<FeedbackSummary | null>(null);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  const loadMyRegistration = async (eventId: string) => {
    if (!getAccessToken()) return null;

    const registrations = await eventApi.getMyEvents().catch(() => []);

    return registrations.find((item) => item.eventId === eventId) ?? null;
  };

  useEffect(() => {
    let ignore = false;

    async function loadEvent() {
      if (!id) {
        setError("Không tìm thấy mã sự kiện.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setLoadingRegistration(Boolean(getAccessToken()));
      setError("");
      setMessage("");
      setFeedbackMessage("");
      setMyRegistration(null);
      setFeedbackSummary(null);

      try {
        const data = await eventApi.getEventById(id);

        if (data.status === "Draft") {
          if (!ignore) {
            setEvent(null);
            setError("Sự kiện này chưa được công khai.");
          }
          return;
        }

        const registration = await loadMyRegistration(data.id);
        const feedback = getAccessToken()
          ? await feedbackApi.getEventFeedback(data.id).catch(() => null)
          : null;

        if (!ignore) {
          setEvent(data);
          setMyRegistration(registration);
          setFeedbackSummary(feedback);
        }
      } catch (err) {
        if (!ignore) {
          setError(
            err instanceof Error ? err.message : "Không tải được sự kiện.",
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
          setLoadingRegistration(false);
        }
      }
    }

    loadEvent();

    return () => {
      ignore = true;
    };
  }, [id]);

  const registerEvent = async () => {
    if (!event) return;

    if (!getAccessToken()) {
      navigate("/login", {
        state: {
          from: location.pathname,
          message: "Vui lòng đăng nhập để đăng ký sự kiện.",
        },
      });
      return;
    }

    setRegistering(true);
    setMessage("");
    setSuccess(false);

    try {
      await eventApi.register(event.id);

      setEvent((current) =>
        current
          ? {
              ...current,
              registeredCount: current.registeredCount + 1,
            }
          : current,
      );

      const syncedRegistration = await loadMyRegistration(event.id);

      setMyRegistration(
        syncedRegistration ?? {
          id: "temporary-registration",
          eventId: event.id,
          eventName: event.name,
          isCheckedIn: false,
          registeredAt: new Date().toISOString(),
        },
      );

      setSuccess(true);
      setMessage("Đăng ký sự kiện thành công.");
    } catch (err) {
      setSuccess(false);
      setMessage(
        err instanceof Error ? err.message : "Đăng ký sự kiện thất bại.",
      );
    } finally {
      setRegistering(false);
    }
  };

  const cancelRegistration = async () => {
    if (!event || !myRegistration || myRegistration.isCheckedIn) return;

    setRegistering(true);
    setMessage("");
    setSuccess(false);

    try {
      await eventApi.cancelRegistration(event.id);

      setEvent((current) =>
        current
          ? {
              ...current,
              registeredCount: Math.max(0, current.registeredCount - 1),
            }
          : current,
      );

      const syncedRegistration = await loadMyRegistration(event.id);

      setMyRegistration(syncedRegistration);
      setSuccess(true);
      setMessage("Đã hủy đăng ký sự kiện.");
    } catch (err) {
      setSuccess(false);
      setMessage(err instanceof Error ? err.message : "Hủy đăng ký thất bại.");
    } finally {
      setRegistering(false);
    }
  };

  const submitFeedback = async () => {
    if (!event) return;

    setFeedbackSubmitting(true);
    setFeedbackMessage("");
    setFeedbackSuccess(false);

    try {
      await feedbackApi.submitFeedback(event.id, {
        rating: feedbackRating,
        comment: feedbackComment.trim() || null,
      });

      const feedback = await feedbackApi.getEventFeedback(event.id);

      setFeedbackSummary(feedback);
      setFeedbackComment("");
      setFeedbackRating(5);
      setFeedbackSuccess(true);
      setFeedbackMessage("Đã gửi feedback cho sự kiện.");
    } catch (err) {
      setFeedbackSuccess(false);
      setFeedbackMessage(
        err instanceof Error ? err.message : "Gửi feedback thất bại.",
      );
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="page-shell">
        <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-muted">
          Đang tải thông tin sự kiện...
        </p>
      </main>
    );
  }

  if (error || !event) {
    return (
      <main className="page-shell">
        <EmptyState
          title="Không tải được sự kiện"
          description={error || "Sự kiện không tồn tại hoặc đã bị ẩn."}
        />
      </main>
    );
  }

  const isLoggedIn = Boolean(getAccessToken());
  const isRegistered = Boolean(myRegistration);
  const isCheckedIn = Boolean(myRegistration?.isCheckedIn);
  const acceptsRegistration = event.status === "Published";
  const isFull = Boolean(
    event.capacity && event.registeredCount >= event.capacity,
  );
  const canRegister =
    isLoggedIn && acceptsRegistration && !isRegistered && !isFull;
  const canCancel = acceptsRegistration && isRegistered && !isCheckedIn;
  const canSubmitFeedback =
    isLoggedIn && isRegistered && isCheckedIn && event.status === "Completed";
  const registerButtonText = loadingRegistration
    ? "Đang kiểm tra..."
    : isFull
      ? "Đã đủ số lượng"
      : !acceptsRegistration
        ? getEventActionLabel(event.status)
        : !isLoggedIn
          ? "Đăng nhập để đăng ký"
          : "Đăng ký tham gia";

  return (
    <main className="page-shell">
      <PageTitle
        eyebrow="Chi tiết sự kiện"
        title={event.name}
        description={`${event.clubName} · ${
          event.location || "Chưa cập nhật địa điểm"
        } · ${formatEventDate(event.startTime)} ${formatEventTimeRange(
          event.startTime,
          event.endTime,
        )}`}
        actions={
          isRegistered ? (
            <>
              <button className="btn-secondary" disabled>
                {isCheckedIn ? "Đã check-in" : "Đã đăng ký"}
              </button>
              {canCancel && (
                <button
                  onClick={cancelRegistration}
                  disabled={registering}
                  className="btn-ghost text-red-600"
                >
                  {registering ? "Đang hủy..." : "Hủy đăng ký"}
                </button>
              )}
            </>
          ) : (
            <button
              onClick={registerEvent}
              disabled={
                registering ||
                loadingRegistration ||
                !acceptsRegistration ||
                isFull ||
                (isLoggedIn && !canRegister)
              }
              className="btn-primary"
            >
              {registering ? "Đang đăng ký..." : registerButtonText}
            </button>
          )
        }
      />

      {message && (
        <p
          className={`mb-5 rounded-xl px-4 py-3 text-sm font-medium ${
            success
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-600"
          }`}
        >
          {message}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.4fr_.8fr]">
        <SectionCard title="Về sự kiện">
          <p className="leading-7 text-muted">
            {event.description || "Thông tin sự kiện sẽ được cập nhật sau."}
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <StatCard
              label="Người đăng ký"
              value={`${event.registeredCount}`}
              icon={Users}
            />
            <StatCard
              label="Sức chứa"
              value={event.capacity ? `${event.capacity}` : "--"}
              icon={CalendarDays}
              tone="blue"
            />
            <StatCard
              label="Trạng thái"
              value={event.status}
              icon={Star}
              tone="green"
            />
          </div>
        </SectionCard>

        <SectionCard title="Thời gian & địa điểm">
          <div className="space-y-4 text-sm text-muted">
            <div>
              <div className="font-bold text-ink">Ngày diễn ra</div>
              <div>{formatEventDate(event.startTime)}</div>
            </div>

            <div>
              <div className="font-bold text-ink">Thời gian</div>
              <div>{formatEventTimeRange(event.startTime, event.endTime)}</div>
            </div>

            <div>
              <div className="font-bold text-ink">Địa điểm</div>
              <div>{event.location || "Chưa cập nhật"}</div>
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[.9fr_1.1fr]">
        <SectionCard title="Feedback sự kiện">
          {feedbackSummary && feedbackSummary.totalCount > 0 ? (
            <div className="space-y-4">
              <div className="rounded-xl bg-primary-soft p-4">
                <div className="text-sm font-semibold text-muted">
                  Điểm đánh giá trung bình
                </div>
                <div className="mt-1 text-3xl font-extrabold text-primary">
                  {feedbackSummary.averageRating.toFixed(1)}/5
                </div>
                <div className="mt-1 text-sm text-muted">
                  {feedbackSummary.totalCount} lượt feedback
                </div>
              </div>
              {feedbackSummary.items.slice(0, 3).map((feedback) => (
                <div key={feedback.id} className="rounded-xl border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-bold">{feedback.userFullName}</div>
                    <div className="text-sm font-bold text-primary">
                      {feedback.rating}/5
                    </div>
                  </div>
                  {feedback.comment && (
                    <p className="mt-2 text-sm text-muted">
                      {feedback.comment}
                    </p>
                  )}
                  <div className="mt-2 text-xs text-muted">
                    {formatEventDate(feedback.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Chưa có feedback"
              description="Feedback từ người tham gia sẽ xuất hiện sau khi sự kiện kết thúc."
            />
          )}
        </SectionCard>

        <SectionCard title="Gửi feedback">
          {canSubmitFeedback ? (
            <div className="space-y-4">
              <label className="block">
                <span className="label">Đánh giá</span>
                <select
                  className="input"
                  value={feedbackRating}
                  onChange={(event) =>
                    setFeedbackRating(Number(event.target.value))
                  }
                >
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <option key={rating} value={rating}>
                      {rating} sao
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="label">Nhận xét</span>
                <textarea
                  className="input h-32 py-3"
                  value={feedbackComment}
                  onChange={(event) => setFeedbackComment(event.target.value)}
                  placeholder="Chia sẻ cảm nhận của bạn về sự kiện..."
                />
              </label>
              {feedbackMessage && (
                <p
                  className={`rounded-xl px-4 py-3 text-sm font-medium ${
                    feedbackSuccess
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-red-50 text-red-600"
                  }`}
                >
                  {feedbackMessage}
                </p>
              )}
              <button
                type="button"
                className="btn-primary w-full"
                onClick={submitFeedback}
                disabled={feedbackSubmitting}
              >
                {feedbackSubmitting ? "Đang gửi..." : "Gửi feedback"}
              </button>
            </div>
          ) : (
            <EmptyState
              title="Chưa thể gửi feedback"
              description="Bạn cần đăng ký, check-in và chờ sự kiện hoàn thành để gửi feedback."
            />
          )}
        </SectionCard>
      </div>
    </main>
  );
}
export function SharedStatesPage() {
  return (
    <main className="page-shell">
      <PageTitle
        title="Trạng thái hệ thống & thành phần dùng chung"
        description="Loading, empty, error, confirmation modal và feedback theo Stitch."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Loading">
          <div className="space-y-3">
            <div className="h-28 animate-pulse rounded-xl bg-slate-100" />
            <button className="btn-primary" disabled>
              Đang xử lý...
            </button>
          </div>
        </SectionCard>
        <SectionCard title="Empty states">
          <EmptyState
            title="Chưa tham gia CLB"
            description="Hãy khám phá và gửi yêu cầu tham gia câu lạc bộ đầu tiên."
          />
        </SectionCard>
        <SectionCard title="Confirmation">
          <div className="rounded-2xl border p-5">
            <h3 className="font-bold">Phê duyệt đề xuất?</h3>
            <p className="mt-2 text-sm text-muted">
              Hành động này sẽ tạo CLB chính thức và gán quyền quản trị cho
              người sáng lập.
            </p>
            <div className="mt-5 flex gap-2">
              <button className="btn-secondary">Hủy</button>
              <button className="btn-primary">Xác nhận</button>
            </div>
          </div>
        </SectionCard>
        <SectionCard title="Error page">
          <div className="rounded-2xl bg-red-50 p-6 text-red-700">
            <h3 className="font-bold">Không thể tải dữ liệu</h3>
            <p className="mt-1 text-sm">
              Vui lòng thử lại hoặc báo lỗi cho quản trị viên.
            </p>
            <button className="btn-secondary mt-4">Thử lại</button>
          </div>
        </SectionCard>
      </div>
    </main>
  );
}
