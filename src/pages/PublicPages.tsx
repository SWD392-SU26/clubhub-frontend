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
import type {
  ClubCategory,
  ClubDetail,
  ClubSummary,
  MyMembership,
} from "../types/club";
import { clubs, events } from "../data";
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

function getMockClubDetail(id?: string): ClubDetail | null {
  const mockClub = clubs.find((club) => club.id === id);

  if (!mockClub) return null;

  return {
    id: mockClub.id,
    name: mockClub.name,
    category: mockClub.category,
    description: mockClub.description,
    logoUrl: null,
    coverImageUrl: mockClub.image,
    status: mockClub.status,
    memberCount: mockClub.members,
    officers: [
      {
        userId: "mock-admin",
        fullName: mockClub.admin,
        avatarUrl: null,
        roleInClub: "ClubAdmin",
      },
    ],
    createdAt: new Date().toISOString(),
  };
}

function clubSummaryToDetail(club: ClubSummary): ClubDetail {
  return {
    ...club,
    officers: [],
  };
}

async function getClubDetailFallback(id?: string) {
  const mockClub = getMockClubDetail(id);

  if (mockClub) return mockClub;
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
export function HomePage() {
  const [featuredClubs, setFeaturedClubs] = useState<ClubSummary[]>([]);

  useEffect(() => {
    let ignore = false;

    async function loadFeaturedClubs() {
      try {
        const result = await clubApi.getClubs({ page: 1, pageSize: 3 });
        if (!ignore) {
          setFeaturedClubs(result.items);
        }
      } catch {
        if (!ignore) {
          setFeaturedClubs([]);
        }
      }
    }

    loadFeaturedClubs();

    return () => {
      ignore = true;
    };
  }, []);

  const visibleFeaturedClubs =
    featuredClubs.length > 0 ? featuredClubs : clubs.slice(0, 3);

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
          <div className="grid gap-6 md:grid-cols-3">
            {visibleFeaturedClubs.map((club) => (
              <ClubTile key={club.id} club={club} />
            ))}
          </div>
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
        <div className="grid gap-4 lg:grid-cols-3">
          {events.map((event) => (
            <Link
              to={`/events/${event.id}`}
              key={event.id}
              className="card flex gap-4 p-5 hover:shadow-lift"
            >
              <div className="grid h-16 w-16 place-items-center rounded-xl bg-primary-soft text-center text-sm font-extrabold text-primary">
                {event.date.split("/")[0]}
                <span className="block text-[10px]">
                  THÁNG {event.date.split("/")[1]}
                </span>
              </div>
              <div>
                <h3 className="font-bold">{event.title}</h3>
                <p className="mt-1 text-sm text-muted">
                  {event.location} · {event.time}
                </p>
              </div>
            </Link>
          ))}
        </div>
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
            err instanceof Error ? err.message : "Không tải được danh sách CLB.",
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
              selectedCategory === option.value ? "btn-primary" : "btn-secondary"
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
  const [joinMessage, setJoinMessage] = useState("");
  const [joinSuccess, setJoinSuccess] = useState(false);

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
          const mockClub = getMockClubDetail(id);

          if (!mockClub) {
            throw new Error("Câu lạc bộ không tồn tại hoặc đã bị ẩn.");
          }

          if (!ignore) {
            setClub(mockClub);
            setCurrentMembership(null);
          }

          return;
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
            setError(err instanceof Error ? err.message : "Không tải được CLB.");
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

  const joinClub = async () => {
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
      setJoinMessage("Bạn đã gửi yêu cầu tham gia CLB này. Vui lòng chờ duyệt.");
      return;
    }

    if (currentMembership?.status === "Approved") {
      setJoinSuccess(true);
      setJoinMessage("Bạn đã là thành viên của CLB này.");
      return;
    }

    setJoining(true);
    setJoinMessage("");
    setJoinSuccess(false);

    try {
      await membershipApi.joinClub(club.id);
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
    } catch (err) {
      setJoinSuccess(false);
      setJoinMessage(
        err instanceof Error ? err.message : "Gửi yêu cầu tham gia thất bại.",
      );
    } finally {
      setJoining(false);
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
            <button
              disabled={joinButtonDisabled}
              onClick={joinClub}
              className="btn-primary"
            >
              {joinButtonLabel}
            </button>
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
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_.8fr]">
        <div className="space-y-6">
          <SectionCard title="Sứ mệnh">
            <p className="leading-7 text-muted">
              {club.description ||
                "Thông tin mô tả câu lạc bộ sẽ được cập nhật sau."}
            </p>
          </SectionCard>
          <SectionCard title="Ban điều hành">
            {officers.length > 0 ? (
              <DataTable
                columns={["Tên thành viên", "Vai trò"]}
                rows={officers.map((officer) => [
                  officer.fullName,
                  <StatusBadge status={officer.roleInClub} />,
                ])}
              />
            ) : (
              <EmptyState
                title="Chưa có ban điều hành"
                description="Danh sách ban điều hành sẽ được cập nhật sau."
              />
            )}
          </SectionCard>
        </div>
        <aside className="space-y-6">
          <SectionCard title="Sự kiện sắp tới">
            {events.slice(0, 2).map((e) => (
              <Link
                key={e.id}
                to={`/events/${e.id}`}
                className="mb-3 block rounded-xl border p-4 hover:bg-primary-soft"
              >
                <div className="font-bold">{e.title}</div>
                <div className="text-sm text-muted">
                  {e.date} · {e.location}
                </div>
              </Link>
            ))}
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
  return (
    <main className="page-shell">
      <PageTitle
        eyebrow="Events"
        title="Khám phá sự kiện"
        description="Theo dõi sự kiện đang diễn ra, sắp diễn ra và đăng ký tham gia."
      />
      <FilterBar
        placeholder="Tìm kiếm sự kiện..."
        actions={
          <>
            <button className="btn-secondary">
              <Filter className="h-4 w-4" />
              Bộ lọc
            </button>
          </>
        }
      />
      <div className="grid gap-6 lg:grid-cols-3">
        {events.map((e) => (
          <Link
            to={`/events/${e.id}`}
            key={e.id}
            className="card overflow-hidden hover:shadow-lift"
          >
            <img
              src={images.students}
              className="h-44 w-full object-cover"
              alt=""
            />
            <div className="p-5">
              <StatusBadge status={e.status} />
              <h3 className="mt-3 text-lg font-bold">{e.title}</h3>
              <p className="mt-2 text-sm text-muted">{e.club}</p>
              <div className="mt-4 flex justify-between text-sm text-muted">
                <span>{e.date}</span>
                <span>
                  {e.registered}/{e.capacity}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
export function EventDetailPage() {
  const e = events[0];
  return (
    <main className="page-shell">
      <PageTitle
        eyebrow="Chi tiết sự kiện"
        title={e.title}
        description={`${e.club} · ${e.location} · ${e.date} ${e.time}`}
        actions={<button className="btn-primary">Đăng ký tham gia</button>}
      />
      <div className="grid gap-6 lg:grid-cols-[1.4fr_.8fr]">
        <SectionCard title="Về sự kiện">
          <p className="leading-7 text-muted">
            Sự kiện tập trung vào AI, portfolio và kỹ năng công nghệ cho sinh
            viên. Người tham gia cần đăng ký trước khi check-in.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <StatCard
              label="Người đăng ký"
              value={`${e.registered}`}
              icon={Users}
            />
            <StatCard
              label="Số điểm"
              value={`${e.points}`}
              icon={Star}
              tone="green"
            />
            <StatCard
              label="Sức chứa"
              value={`${e.capacity}`}
              icon={CalendarDays}
              tone="blue"
            />
          </div>
        </SectionCard>
        <SectionCard title="Lịch trình">
          <div className="space-y-4">
            {[
              "Check-in & Teabreak",
              "Keynote: Kỷ nguyên AI 2026",
              "Workshop: Xây dựng Portfolio",
              "Networking & Feedback",
            ].map((x, i) => (
              <div key={x} className="flex gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-primary-soft font-bold text-primary">
                  {i + 1}
                </div>
                <div>
                  <div className="font-bold">{x}</div>
                  <div className="text-sm text-muted">{8 + i * 2}:00</div>
                </div>
              </div>
            ))}
          </div>
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
