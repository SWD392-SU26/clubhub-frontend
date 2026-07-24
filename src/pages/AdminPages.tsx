import {
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Download,
  Eye,
  FileCheck2,
  Filter,
  Lock,
  PlusCircle,
  Rocket,
  Search,
  TrendingUp,
  UserPlus,
  Users,
  XCircle,
  Edit3,
  Archive,
  Star,
  Upload,
  Send,
  QrCode,
  MessageSquare,
  Trophy,
  BarChart3,
  History,
  ShieldCheck,
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  ClipboardCheck,
  Mail,
  Phone,
  UserCog,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import type { ComponentType } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { adminApi } from "../api/adminApi";
import { clubApi } from "../api/clubApi";
import { membershipApi } from "../api/membershipApi";
import { proposalApi } from "../api/proposalApi";
import { storageApi } from "../api/storageApi";
import { getPrimaryAdminMembership } from "../clubPermissions";
import { auditLogs, clubs, events, members, proposals } from "../data";
import type {
  AdminClubCategory,
  AdminClubStatus,
  AdminClubSummary,
  AdminUserProfile,
  AdminUserRole,
  AdminUserStatus,
  AuditLogItem,
} from "../types/admin";
import type {
  ProposalDetail,
  ProposalStatus,
  ProposalSummary,
} from "../types/proposal";
import type { ClubDetail, ClubOfficer } from "../types/club";
import {
  DataTable,
  EmptyState,
  FilterBar,
  PageTitle,
  SectionCard,
  StatCard,
  StatusBadge,
} from "../components";
import { getProfileDisplayName, useCurrentProfile } from "../useCurrentProfile";

export function ClubAdminDashboard() {
  const profile = useCurrentProfile();
  const displayName = getProfileDisplayName(profile);
  const [adminClubName, setAdminClubName] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadAdminClub() {
      try {
        const memberships = await membershipApi.getMyMemberships();
        const adminMembership = getPrimaryAdminMembership(memberships);

        if (!ignore) {
          setAdminClubName(adminMembership?.clubName ?? "");
        }
      } catch {
        if (!ignore) {
          setAdminClubName("");
        }
      }
    }

    loadAdminClub();

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <main className="page-shell">
      <PageTitle
        eyebrow="CLUB_ADMIN"
        title={`Chào ${displayName}!`}
        description={
          adminClubName
            ? `Bạn đang quản trị ${adminClubName}.`
            : "Theo dõi thành viên, sự kiện và hoạt động vận hành."
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Tổng thành viên"
          value="156"
          meta="+12%"
          icon={Users}
          tone="green"
        />
        <StatCard
          label="Sự kiện đang chạy"
          value="03"
          meta="Tháng này"
          icon={Rocket}
          tone="blue"
        />
        <StatCard
          label="Yêu cầu mới"
          value="24"
          meta="Cần duyệt"
          icon={UserPlus}
        />
        <StatCard
          label="Quỹ CLB"
          value="12.45M"
          meta="VNĐ"
          icon={CircleDollarSign}
          tone="slate"
        />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_.7fr]">
        <SectionCard title="Mức độ tương tác">
          <div className="flex h-72 items-end justify-around gap-3 rounded-xl border bg-slate-50 px-4 pb-5 pt-8">
            {[62, 78, 55, 88, 72, 94].map((value, index) => (
              <div
                key={index}
                className="flex h-full flex-1 flex-col items-center justify-end gap-2"
              >
                <span className="text-xs font-semibold text-muted">
                  {value}%
                </span>
                <div
                  className={`w-full max-w-12 rounded-t-lg ${index === 5 ? "bg-emerald-500" : "bg-primary"}`}
                  style={{ height: `${value}%` }}
                />
                <span className="text-xs text-muted">T{index + 1}</span>
              </div>
            ))}
          </div>
        </SectionCard>
        <SectionCard title="Sự kiện sắp tới">
          {events.map((e) => (
            <Link
              to={`/club-admin/events/${e.id}`}
              className="mb-3 block rounded-xl border p-4 hover:bg-primary-soft"
              key={e.id}
            >
              <div className="font-bold">{e.title}</div>
              <div className="text-sm text-muted">
                {e.date} · {e.registered}/{e.capacity}
              </div>
            </Link>
          ))}
        </SectionCard>
      </div>
      <section className="card mt-6 overflow-hidden">
        <header className="flex items-center justify-between p-5">
          <h2 className="text-xl font-bold">Hoạt động gần đây</h2>
          <div className="flex gap-2">
            <button className="btn-ghost">
              <Filter />
            </button>
            <button className="btn-ghost">
              <Download />
            </button>
          </div>
        </header>
        <DataTable
          columns={["Thành viên", "Hoạt động", "Ngày thực hiện", "Trạng thái"]}
          rows={auditLogs.map(([time, actor, text, status]) => [
            actor,
            text,
            time,
            <StatusBadge status={status} />,
          ])}
        />
      </section>
    </main>
  );
}
export function MembersPage() {
  return (
    <main className="page-shell">
      <PageTitle
        title="Danh sách thành viên"
        actions={
          <>
            <button className="btn-secondary">
              <Download className="h-4 w-4" />
              Xuất Excel
            </button>
            <button className="btn-primary">
              <UserPlus className="h-4 w-4" />
              Thêm thành viên
            </button>
          </>
        }
      />
      <FilterBar
        placeholder="Tìm theo tên hoặc MSSV..."
        actions={
          <button className="btn-secondary">
            <Filter className="h-4 w-4" />
            Lọc dữ liệu
          </button>
        }
      />
      <section className="card overflow-hidden">
        <DataTable
          columns={[
            "Họ và tên",
            "MSSV",
            "Vai trò",
            "Điểm",
            "Trạng thái",
            "Thao tác",
          ]}
          rows={members.map((m) => [
            m.name,
            m.code,
            m.role,
            m.points,
            <StatusBadge status={m.status} />,
            <Link to={`/club-admin/members/${m.id}`} className="btn-ghost">
              Chi tiết
            </Link>,
          ])}
        />
      </section>
    </main>
  );
}
export function MemberDetailPage() {
  const m = members[0];
  return (
    <main className="page-shell">
      <PageTitle
        eyebrow={m.code}
        title={m.name}
        description="Chi tiết thành viên, lịch sử tham gia, điểm và hành động quản trị."
        actions={
          <>
            <button className="btn-secondary">
              <History className="h-4 w-4" />
              Lịch sử tham gia
            </button>
            <button className="btn-primary">
              <Trophy className="h-4 w-4" />
              Nhật ký điểm
            </button>
          </>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[.8fr_1.4fr]">
        <SectionCard title="Thông tin thành viên">
          <p className="text-muted">Vai trò: {m.role}</p>
          <p className="text-muted">Ngày tham gia: {m.joinedAt}</p>
          <p className="text-muted">Tổng điểm: {m.points}</p>
          <div className="mt-5 flex gap-2">
            <button className="btn-secondary">Chuyển giao quản lý</button>
            <button className="btn-ghost text-red-600">Xóa khỏi CLB</button>
          </div>
        </SectionCard>
        <SectionCard title="Sự kiện đã tham gia">
          <DataTable
            columns={["Sự kiện", "Ngày tham gia", "Vai trò", "Trạng thái"]}
            rows={events.map((e) => [
              e.title,
              e.date,
              "Người tham gia",
              <StatusBadge status="ATTENDED" />,
            ])}
          />
        </SectionCard>
      </div>
    </main>
  );
}
export function ClubJoinRequestsAdminPage() {
  return (
    <main className="page-shell">
      <PageTitle
        title="Yêu cầu tham gia"
        description="Duyệt hoặc từ chối đơn tham gia CLB."
        actions={
          <button className="btn-secondary">
            <Download className="h-4 w-4" />
            Xuất báo cáo
          </button>
        }
      />
      <FilterBar placeholder="Tìm theo tên hoặc MSSV..." />
      <section className="card overflow-hidden">
        <DataTable
          columns={[
            "Họ và tên",
            "MSSV",
            "Ngày gửi",
            "Lý do tham gia",
            "Thao tác",
          ]}
          rows={members.map((m) => [
            m.name,
            m.code,
            "12/03/2026",
            "Muốn tham gia hoạt động và học hỏi từ CLB.",
            <div className="flex gap-2">
              <button className="btn-ghost">
                <Eye />
              </button>
              <button className="btn-ghost text-emerald-600">
                <CheckCircle2 />
              </button>
              <button className="btn-ghost text-red-600">
                <XCircle />
              </button>
            </div>,
          ])}
        />
      </section>
    </main>
  );
}
export function EventsManagementPage() {
  return (
    <main className="page-shell">
      <PageTitle
        title="Quản lý sự kiện"
        actions={
          <Link to="/club-admin/events/new" className="btn-primary">
            <PlusCircle className="h-4 w-4" />
            Tạo sự kiện mới
          </Link>
        }
      />
      <FilterBar
        placeholder="Tìm kiếm tên sự kiện..."
        actions={[
          "Tất cả",
          "Bản nháp",
          "Đã đăng",
          "Đang diễn ra",
          "Đã kết thúc",
          "Đã hủy",
        ].map((x) => (
          <button className="btn-secondary" key={x}>
            {x}
          </button>
        ))}
      />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {events.map((e) => (
          <article className="card p-5" key={e.id}>
            <StatusBadge status={e.status} />
            <h3 className="mt-3 font-bold">{e.title}</h3>
            <p className="text-sm text-muted">
              {e.date} · {e.location}
            </p>
            <div className="mt-5 flex gap-2">
              <Link
                className="btn-secondary flex-1"
                to={`/club-admin/events/${e.id}`}
              >
                Chi tiết
              </Link>
              <button className="btn-ghost">
                <Edit3 />
              </button>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
export function EventAdminDetailPage() {
  const e = events[1];
  return (
    <main className="page-shell">
      <PageTitle
        title={e.title}
        description={`${e.date} · ${e.location}`}
        actions={
          <>
            <button className="btn-secondary">
              <Edit3 className="h-4 w-4" />
              Chỉnh sửa
            </button>
            <Link
              to="/club-admin/events/cancel"
              className="btn-ghost text-red-600"
            >
              <XCircle className="h-4 w-4" />
              Hủy sự kiện
            </Link>
          </>
        }
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Đã đăng ký"
          value={`${e.registered}/${e.capacity}`}
          icon={Users}
        />
        <StatCard
          label="Đã check-in"
          value="40"
          icon={CheckCircle2}
          tone="green"
        />
        <StatCard label="Đánh giá" value="4.8/5" icon={Star} tone="blue" />
      </div>
      <SectionCard title="Danh sách đăng ký" className="mt-6">
        <DataTable
          columns={[
            "Thành viên",
            "MSSV",
            "Ngày đăng ký",
            "Trạng thái",
            "Thao tác",
          ]}
          rows={members.map((m) => [
            m.name,
            m.code,
            e.date,
            <StatusBadge status={m.status} />,
            <button className="btn-ghost">Xóa</button>,
          ])}
        />
      </SectionCard>
    </main>
  );
}
export function CreateEventPage() {
  return (
    <main className="page-shell max-w-5xl">
      <PageTitle
        title="Tạo sự kiện mới"
        actions={
          <>
            <button className="btn-secondary">Lưu bản nháp</button>
            <button className="btn-primary">Đăng sự kiện</button>
          </>
        }
      />
      <section className="card grid gap-5 p-6 sm:grid-cols-2">
        <label>
          <span className="label">Tiêu đề sự kiện *</span>
          <input
            className="input"
            placeholder="Workshop Kỹ năng thuyết trình"
          />
        </label>
        <label>
          <span className="label">Danh mục *</span>
          <select className="input">
            <option>Workshop</option>
            <option>Talkshow</option>
          </select>
        </label>
        <label>
          <span className="label">Bắt đầu *</span>
          <input className="input" type="datetime-local" />
        </label>
        <label>
          <span className="label">Kết thúc *</span>
          <input className="input" type="datetime-local" />
        </label>
        <label className="sm:col-span-2">
          <span className="label">Địa điểm *</span>
          <input className="input" placeholder="Hội trường A5" />
        </label>
        <label className="sm:col-span-2">
          <span className="label">Mô tả chi tiết *</span>
          <textarea className="input h-40 py-3" />
        </label>
        <div className="sm:col-span-2 rounded-2xl border border-dashed p-8 text-center">
          <Upload className="mx-auto text-primary" />
          <h3 className="mt-3 font-bold">Ảnh bìa sự kiện</h3>
        </div>
      </section>
      <section className="mt-6 grid gap-4 md:grid-cols-2">
        <Link
          to="/club-admin/transfer"
          className="card flex items-start gap-4 p-5 transition hover:-translate-y-0.5 hover:shadow-lift"
        >
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-fpt-blue-soft text-fpt-blue">
            <UserPlus className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-ink">Chuyển giao quyền</h3>
            <p className="mt-1 text-sm leading-6 text-muted">
              Chọn thành viên đủ điều kiện để chuyển quyền quản lý CLB.
            </p>
          </div>
        </Link>
        <Link
          to="/club-admin/status"
          className="card flex items-start gap-4 p-5 transition hover:-translate-y-0.5 hover:shadow-lift"
        >
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-fpt-green-soft text-fpt-green-dark">
            <Eye className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-ink">Trạng thái hiển thị</h3>
            <p className="mt-1 text-sm leading-6 text-muted">
              Kiểm tra trạng thái công khai, ẩn hoặc yêu cầu ngừng hoạt động.
            </p>
          </div>
        </Link>
      </section>
    </main>
  );
}
export function CancelEventPage() {
  return (
    <main className="page-shell max-w-4xl">
      <PageTitle
        title="Hủy sự kiện"
        description="Xác nhận và gửi lý do hủy cho người đã đăng ký."
      />
      <section className="card p-6">
        <label>
          <span className="label">Lý do hủy *</span>
          <textarea
            className="input h-40 py-3"
            placeholder="Nhập lý do chi tiết..."
          />
        </label>
        <div className="mt-6 flex justify-end gap-2">
          <Link to="/club-admin/events" className="btn-secondary">
            Quay lại
          </Link>
          <button className="btn-primary bg-red-600 hover:bg-red-700">
            Xác nhận hủy
          </button>
        </div>
      </section>
    </main>
  );
}
export function CheckInPage() {
  return (
    <main className="page-shell">
      <PageTitle
        title="Điểm danh sự kiện"
        description="Quét mã QR hoặc nhập MSSV thủ công để check-in."
      />
      <div className="grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
        <SectionCard title="Quét mã Check-in">
          <div className="grid min-h-80 place-items-center rounded-2xl border border-dashed bg-slate-50">
            <div className="text-center">
              <QrCode className="mx-auto h-20 w-20 text-primary" />
              <p className="mt-3 font-bold">Đưa QR code vào khung quét</p>
            </div>
          </div>
          <label className="mt-5 block">
            <span className="label">Nhập MSSV thủ công</span>
            <input className="input" placeholder="Ví dụ: SE180001" />
          </label>
          <button className="btn-primary mt-4 w-full">Xác nhận</button>
        </SectionCard>
        <SectionCard title="Check-in gần đây">
          <DataTable
            columns={["Sinh viên", "MSSV", "Trạng thái"]}
            rows={members.map((m, i) => [
              m.name,
              m.code,
              <StatusBadge
                status={i === 2 ? "Chưa đăng ký" : "Check-in thành công"}
              />,
            ])}
          />
        </SectionCard>
      </div>
    </main>
  );
}
export function FeedbackManagementPage() {
  return (
    <main className="page-shell">
      <PageTitle
        title="Phân tích phản hồi"
        description="Theo dõi rating, nhận xét và xu hướng hài lòng sau sự kiện."
      />
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Đánh giá TB" value="4.8/5" icon={Star} />
        <StatCard
          label="Feedback"
          value="128"
          icon={MessageSquare}
          tone="blue"
        />
        <StatCard
          label="Tích cực"
          value="92%"
          icon={CheckCircle2}
          tone="green"
        />
        <StatCard label="Cần xử lý" value="6" icon={Filter} tone="red" />
      </div>
      <SectionCard title="Danh sách phản hồi" className="mt-6">
        <DataTable
          columns={["Sự kiện", "Người gửi", "Rating", "Nhận xét", "Trạng thái"]}
          rows={events.map((e, i) => [
            e.title,
            members[i]?.name ?? "Ẩn danh",
            "5★",
            "Tổ chức chuyên nghiệp, nội dung hữu ích.",
            <StatusBadge status="NEW" />,
          ])}
        />
      </SectionCard>
    </main>
  );
}
export function PointsManagementPage() {
  return (
    <main className="page-shell">
      <PageTitle
        title="Quản lý điểm thành viên"
        description="Cộng/trừ điểm thi đua, xem lịch sử giao dịch point."
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Tổng point" value="15.4k" icon={Trophy} />
        <StatCard
          label="Giao dịch tháng"
          value="320"
          icon={BarChart3}
          tone="blue"
        />
        <StatCard label="Top member" value="850" icon={Star} tone="green" />
      </div>
      <SectionCard title="Bảng điểm" className="mt-6">
        <DataTable
          columns={["Thành viên", "MSSV", "Điểm", "Hành động"]}
          rows={members.map((m) => [
            m.name,
            m.code,
            m.points,
            <div className="flex gap-2">
              <button className="btn-secondary">+ Điểm</button>
              <button className="btn-ghost">Trừ điểm</button>
            </div>,
          ])}
        />
      </SectionCard>
    </main>
  );
}
export function ClubStatisticsPage() {
  return (
    <main className="page-shell">
      <PageTitle
        title="Thống kê chi tiết: CLB IT"
        actions={
          <button className="btn-secondary">
            <Download className="h-4 w-4" />
            Xuất PDF
          </button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Thành viên mới" value="+124" icon={Users} />
        <StatCard label="Sự kiện" value="12" icon={CalendarDays} tone="blue" />
        <StatCard label="Rating" value="4.8/5" icon={Star} tone="green" />
        <StatCard label="Point" value="15.4k" icon={Trophy} tone="slate" />
      </div>
      <SectionCard
        title="Tăng trưởng thành viên & tham gia sự kiện"
        className="mt-6"
      >
        <div className="h-72 rounded-2xl bg-gradient-to-br from-primary-soft to-sky-100 p-6">
          <BarChart3 className="h-20 w-20 text-primary" />
        </div>
      </SectionCard>
    </main>
  );
}
export function ClubAuditLogPage() {
  return (
    <main className="page-shell">
      <PageTitle title="Nhật ký hoạt động CLB" />
      <FilterBar placeholder="Tìm kiếm hành động..." />
      <section className="card overflow-hidden">
        <DataTable
          columns={["Thời gian", "Tác nhân", "Hành động", "Trạng thái"]}
          rows={auditLogs.map(([time, actor, text, status]) => [
            time,
            actor,
            text,
            <StatusBadge status={status} />,
          ])}
        />
      </section>
    </main>
  );
}
export function ClubSettingsPage() {
  return (
    <main className="page-shell max-w-5xl">
      <PageTitle
        title="Club Settings"
        description="Cập nhật nhận diện, thông tin liên hệ và mô tả CLB."
      />
      <section className="card grid gap-5 p-6 sm:grid-cols-2">
        <label>
          <span className="label">Club Name *</span>
          <input className="input" defaultValue="CLB Guitar & Acoustic" />
        </label>
        <label>
          <span className="label">Category</span>
          <select className="input">
            <option>Nghệ thuật</option>
          </select>
        </label>
        <label>
          <span className="label">Public Email</span>
          <input className="input" defaultValue="guitar@clubhub.edu.vn" />
        </label>
        <label>
          <span className="label">Website</span>
          <input className="input" placeholder="https://" />
        </label>
        <label className="sm:col-span-2">
          <span className="label">Detailed Description</span>
          <textarea className="input h-40 py-3" />
        </label>
        <div className="sm:col-span-2 flex justify-end gap-2">
          <button className="btn-secondary">Discard Changes</button>
          <button className="btn-primary">Save Changes</button>
        </div>
      </section>
    </main>
  );
}
export function TransferOwnershipPage() {
  return (
    <main className="page-shell max-w-4xl">
      <PageTitle
        title="Transfer Club Ownership"
        description="Chuyển giao quyền quản lý cho thành viên đủ điều kiện."
      />
      <SectionCard title="Find Eligible Member">
        <FilterBar placeholder="Search by name or ID..." />
        {members.slice(0, 2).map((m) => (
          <div
            key={m.id}
            className="mb-3 flex items-center justify-between rounded-xl border p-4"
          >
            <div>
              <div className="font-bold">{m.name}</div>
              <div className="text-sm text-muted">{m.code}</div>
            </div>
            <button className="btn-secondary">Chọn</button>
          </div>
        ))}
        <div className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">
          Hành động này cần xác minh mật khẩu và không thể hoàn tác.
        </div>
      </SectionCard>
    </main>
  );
}
export function ClubStatusPage() {
  return (
    <main className="page-shell">
      <PageTitle title="Status & Visibility" />
      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Club Visibility">
          <StatusBadge status="ACTIVE" />
          <p className="mt-3 text-muted">
            CLB đang hiển thị công khai trên trang khám phá.
          </p>
          <button className="btn-secondary mt-5">Preview Public Profile</button>
        </SectionCard>
        <SectionCard title="Deactivate Club">
          <p className="text-muted">
            Gửi yêu cầu ngừng hoạt động đến phòng CTSV.
          </p>
          <button className="btn-primary mt-5 bg-red-600 hover:bg-red-700">
            Request Deactivation
          </button>
        </SectionCard>
      </div>
    </main>
  );
}

const ADMIN_ROLE_OPTIONS: Array<{
  value: AdminUserRole | "";
  label: string;
}> = [
  { value: "", label: "Tất cả vai trò" },
  { value: "Student", label: "Sinh viên" },
  { value: "ClubMember", label: "Thành viên câu lạc bộ" },
];

const USER_STATUS_OPTIONS: AdminUserStatus[] = [
  "Active",
  "Inactive",
  "Lock",
  "Deleted",
];

const CLUB_CATEGORY_OPTIONS: Array<{
  value: AdminClubCategory | "";
  label: string;
}> = [
  { value: "", label: "Tất cả danh mục" },
  { value: "Academic", label: "Học thuật" },
  { value: "Technology", label: "Công nghệ" },
  { value: "Sports", label: "Thể thao" },
  { value: "Arts", label: "Nghệ thuật" },
  { value: "Volunteer", label: "Tình nguyện" },
  { value: "SoftSkills", label: "Kỹ năng mềm" },
  { value: "Media", label: "Truyền thông" },
  { value: "Entrepreneurship", label: "Khởi nghiệp" },
];

const CLUB_STATUS_OPTIONS: AdminClubStatus[] = [
  "Active",
  "Inactive",
  "Lock",
  "Deleted",
];

const PROPOSAL_STATUS_OPTIONS: Array<{
  value: ProposalStatus | "";
  label: string;
}> = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "Pending", label: "Chờ duyệt" },
  { value: "Approved", label: "Đã duyệt" },
  { value: "Rejected", label: "Từ chối" },
  { value: "NeedsRevision", label: "Cần bổ sung" },
];

function formatAdminDate(value?: string | null) {
  if (!value) return "Chưa có";

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function formatAdminDateTime(value?: string | null) {
  if (!value) return "Chưa có";

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getImageFileName(file: File | null) {
  return file ? file.name : "Chưa chọn ảnh";
}

function getAdminUserName(user: AdminUserProfile) {
  return user.fullName || user.username || user.email;
}

function getClubAdminOptionLabel(user: AdminUserProfile) {
  const name = getAdminUserName(user);
  return `${name} - ${user.email}`;
}

function clubAdminMatchesSearch(user: AdminUserProfile, search: string) {
  const keyword = search.trim().toLowerCase();
  if (!keyword) return true;

  return [user.fullName, user.username, user.email]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(keyword));
}

type ClubOfficerDisplay = ClubOfficer & {
  email?: string;
};

function enrichClubOfficers(
  officers: ClubOfficer[] = [],
  clubAdmins: AdminUserProfile[] = [],
): ClubOfficerDisplay[] {
  const adminById = new Map(clubAdmins.map((user) => [user.id, user]));

  return officers.map((officer) => {
    const admin = adminById.get(officer.userId);

    return {
      ...officer,
      fullName: officer.fullName || admin?.fullName || admin?.username || "Chưa có tên",
      avatarUrl: officer.avatarUrl ?? admin?.avatarUrl,
      email: admin?.email,
    };
  });
}

function getRoleLabel(role: string) {
  const labels: Record<string, string> = {
    Student: "Sinh viên",
    ClubMember: "Thành viên câu lạc bộ",
    ClubAdmin: "Quản trị viên câu lạc bộ",
    UniversityAdmin: "Quản trị viên đại học",
  };

  return labels[role] ?? role;
}

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    Active: "Hoạt động",
    Inactive: "Không hoạt động",
    Lock: "Đã khóa",
    Deleted: "Đã xóa",
  };

  return labels[status] ?? status;
}

function getClubCategoryLabel(category: string) {
  return (
    CLUB_CATEGORY_OPTIONS.find((item) => item.value === category)?.label ??
    category
  );
}

function getProposalStatusLabel(status: string) {
  const labels: Record<string, string> = {
    Pending: "Chờ duyệt",
    Approved: "Đã duyệt",
    Rejected: "Từ chối",
    NeedsRevision: "Cần bổ sung",
  };

  return labels[status] ?? status;
}

function getAuditEntityLabel(entityType: string) {
  const labels: Record<string, string> = {
    Club: "Câu lạc bộ",
    ClubMember: "Thành viên CLB",
    Event: "Sự kiện",
    EventRegistration: "Đăng ký sự kiện",
    Proposal: "Hồ sơ CLB",
    ClubActivity: "Hoạt động CLB",
    ActivityRegistration: "Ghi nhận hoạt động",
  };

  return labels[entityType] ?? entityType;
}

function getAuditActionLabel(action: string) {
  const labels: Record<string, string> = {
    Submit: "Nộp hồ sơ",
    Update: "Cập nhật",
    Resubmit: "Nộp lại",
    Approve: "Duyệt",
    Reject: "Từ chối",
    RequestRevision: "Yêu cầu bổ sung",
    Create: "Tạo mới",
    CreateWithAdmin: "Tạo CLB chính thức",
    Hide: "Ẩn",
    Lock: "Khóa",
    Archive: "Lưu trữ",
    Reopen: "Mở lại",
    Dissolve: "Giải tán",
    HardDelete: "Xóa cứng",
    SoftDelete: "Xóa mềm",
    RequestJoin: "Gửi yêu cầu tham gia",
    CancelJoinRequest: "Hủy yêu cầu tham gia",
    ApproveJoin: "Duyệt thành viên",
    RejectJoin: "Từ chối thành viên",
    LeaveClub: "Rời CLB",
    RemoveMember: "Xóa thành viên",
    AssignRole: "Gán vai trò",
    TransferAdmin: "Chuyển quyền quản trị",
    NominateSuccessor: "Đề cử kế nhiệm",
    AcceptSuccession: "Nhận quyền kế nhiệm",
    RejectSuccession: "Từ chối kế nhiệm",
    Cancel: "Hủy",
    CancelEvent: "Hủy sự kiện",
    Register: "Đăng ký",
    CancelRegistration: "Hủy đăng ký",
    CheckIn: "Điểm danh",
  };

  return labels[action] ?? action;
}

function auditMatchesSearch(
  log: AuditLogItem,
  clubName: string,
  search: string,
) {
  const keyword = search.trim().toLowerCase();
  if (!keyword) return true;

  return [
    clubName,
    log.entityType,
    getAuditEntityLabel(log.entityType),
    log.action,
    getAuditActionLabel(log.action),
    log.performedByName,
    log.description,
  ]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(keyword));
}

function ProposalStatusBadge({ status }: { status: string }) {
  const cls =
    status === "Approved"
      ? "status-active"
      : status === "Pending" || status === "NeedsRevision"
        ? "status-pending"
        : "status-danger";

  return (
    <span className={`${cls} inline-flex whitespace-nowrap`}>
      {getProposalStatusLabel(status)}
    </span>
  );
}

function AdminRoleBadge({ role }: { role: string }) {
  return (
    <span className="status-info inline-flex whitespace-nowrap">
      {getRoleLabel(role)}
    </span>
  );
}

function AdminStatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const cls =
    normalized === "active"
      ? "status-active"
      : normalized === "inactive"
        ? "status-pending"
        : "status-danger";

  return (
    <span className={`${cls} inline-flex whitespace-nowrap`}>
      {getStatusLabel(status)}
    </span>
  );
}

function CompactStatCard({
  label,
  value,
  icon: Icon,
  tone = "primary",
}: {
  label: string;
  value: string;
  icon: ComponentType<{
    className?: string;
  }>;
  tone?: "primary" | "blue" | "green" | "slate" | "red";
}) {
  const tones = {
    primary: "bg-primary-soft text-primary",
    blue: "bg-fpt-blue-soft text-fpt-blue",
    green: "bg-fpt-green-soft text-fpt-green-dark",
    slate: "bg-slate-100 text-slate-600",
    red: "bg-red-50 text-red-700",
  };

  return (
    <div className="card flex items-center gap-4 p-4">
      <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${tones[tone]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold text-muted">{label}</div>
        <div className="text-2xl font-extrabold text-ink">{value}</div>
      </div>
    </div>
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function userMatchesSearch(user: AdminUserProfile, search: string) {
  const keyword = search.trim().toLowerCase();
  if (!keyword) return true;

  return [
    user.fullName,
    user.username,
    user.email,
    user.studentCode,
    user.phone,
    user.role,
    user.status,
  ]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(keyword));
}

function UserIdentity({ user }: { user: AdminUserProfile }) {
  const name = getAdminUserName(user);

  return (
    <div className="flex min-w-[180px] items-center gap-3">
      {user.avatarUrl ? (
        <img
          src={user.avatarUrl}
          alt={name}
          className="h-10 w-10 rounded-full object-cover"
        />
      ) : (
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-900 text-xs font-bold text-white">
          {getInitials(name)}
        </div>
      )}
      <div className="min-w-0">
        <div className="truncate font-bold text-ink">{user.username}</div>
      </div>
    </div>
  );
}

function UserStatusDialog({
  user,
  onClose,
  onConfirm,
  busy,
}: {
  user: AdminUserProfile;
  onClose: () => void;
  onConfirm: (status: AdminUserStatus) => void;
  busy: boolean;
}) {
  const [status, setStatus] = useState<AdminUserStatus>(
    (USER_STATUS_OPTIONS.includes(user.status as AdminUserStatus)
      ? user.status
      : "Active") as AdminUserStatus,
  );
  const deleting = status === "Deleted";

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4">
      <section className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <header className="border-b px-5 py-4">
          <h2 className="text-lg font-bold">Cập nhật trạng thái người dùng</h2>
          <p className="mt-1 text-sm text-muted">
            {getAdminUserName(user)} · {user.email}
          </p>
        </header>
        <div className="p-5">
          <label>
            <span className="label">Trạng thái mới</span>
            <select
              className="input"
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as AdminUserStatus)
              }
            >
              {USER_STATUS_OPTIONS.map((item) => (
                <option key={item} value={item}>
                  {getStatusLabel(item)}
                </option>
              ))}
            </select>
          </label>
          {deleting && (
            <div className="mt-4 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                Sau khi chuyển sang Đã xóa, tài khoản sẽ được ẩn khỏi danh sách
                hiện tại.
              </span>
            </div>
          )}
        </div>
        <footer className="flex justify-end gap-2 border-t px-5 py-4">
          <button className="btn-ghost" onClick={onClose} disabled={busy}>
            Hủy
          </button>
          <button
            className={deleting ? "btn-primary bg-red-600 hover:bg-red-700" : "btn-primary"}
            onClick={() => onConfirm(status)}
            disabled={busy}
          >
            {busy ? "Đang cập nhật..." : "Xác nhận"}
          </button>
        </footer>
      </section>
    </div>
  );
}

function AdminUsersTable({
  users,
  detailBasePath,
  onOpenStatus,
}: {
  users: AdminUserProfile[];
  detailBasePath: string;
  onOpenStatus: (user: AdminUserProfile) => void;
}) {
  if (users.length === 0) {
    return (
      <EmptyState
        title="Không có người dùng phù hợp"
        description="Thử đổi bộ lọc hoặc từ khóa tìm kiếm."
      />
    );
  }

  return (
    <section className="card overflow-hidden">
      <DataTable
        columns={[
          "Người dùng",
          "Email",
          "MSSV",
          "Vai trò",
          "Trạng thái",
          "Ngày tạo",
          "Thao tác",
        ]}
        rows={users.map((user) => [
          <UserIdentity user={user} />,
          <span className="font-medium">{user.email}</span>,
          user.studentCode || "Không có",
          <div className="min-w-max">
            <AdminRoleBadge role={user.role} />
          </div>,
          <div className="min-w-max">
            <AdminStatusBadge status={user.status} />
          </div>,
          formatAdminDate(user.createdAt),
          <div className="flex min-w-[220px] flex-nowrap items-center gap-2 whitespace-nowrap">
            <Link
              to={`${detailBasePath}/${user.id}`}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:border-primary hover:bg-primary-soft hover:text-primary"
            >
              <Eye className="h-4 w-4" />
              Chi tiết
            </Link>
            <button className="btn-secondary" onClick={() => onOpenStatus(user)}>
              <ShieldCheck className="h-4 w-4" />
              Trạng thái
            </button>
          </div>,
        ])}
      />
    </section>
  );
}

function ClubStatusDialog({
  club,
  onClose,
  onConfirm,
  busy,
}: {
  club: AdminClubSummary;
  onClose: () => void;
  onConfirm: (status: AdminClubStatus) => void;
  busy: boolean;
}) {
  const [status, setStatus] = useState<AdminClubStatus>(
    (CLUB_STATUS_OPTIONS.includes(club.status as AdminClubStatus)
      ? club.status
      : "Active") as AdminClubStatus,
  );

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4">
      <section className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <header className="border-b px-5 py-4">
          <h2 className="text-lg font-bold">Cập nhật trạng thái CLB</h2>
          <p className="mt-1 text-sm text-muted">{club.name}</p>
        </header>
        <div className="p-5">
          <label>
            <span className="label">Trạng thái mới</span>
            <select
              className="input"
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as AdminClubStatus)
              }
            >
              {CLUB_STATUS_OPTIONS.map((item) => (
                <option key={item} value={item}>
                  {getStatusLabel(item)}
                </option>
              ))}
            </select>
          </label>
        </div>
        <footer className="flex justify-end gap-2 border-t px-5 py-4">
          <button className="btn-ghost" onClick={onClose} disabled={busy}>
            Hủy
          </button>
          <button
            className="btn-primary"
            onClick={() => onConfirm(status)}
            disabled={busy}
          >
            {busy ? "Đang cập nhật..." : "Xác nhận"}
          </button>
        </footer>
      </section>
    </div>
  );
}

function ApproveProposalDialog({
  proposal,
  busy,
  onClose,
  onConfirm,
}: {
  proposal: ProposalDetail;
  busy: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4">
      <section className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <header className="border-b px-5 py-4">
          <h2 className="text-lg font-bold">Duyệt hồ sơ CLB</h2>
          <p className="mt-1 text-sm text-muted">{proposal.clubName}</p>
        </header>
        <div className="p-5 text-sm leading-6 text-slate-700">
          Bạn có chắc chắn muốn duyệt hồ sơ này không? Sau khi duyệt, hệ thống
          sẽ tạo CLB và nâng người nộp hồ sơ thành quản trị viên câu lạc bộ.
        </div>
        <footer className="flex justify-end gap-2 border-t px-5 py-4">
          <button className="btn-ghost" onClick={onClose} disabled={busy}>
            Hủy
          </button>
          <button className="btn-primary" onClick={onConfirm} disabled={busy}>
            {busy ? "Đang xử lý..." : "Duyệt hồ sơ"}
          </button>
        </footer>
      </section>
    </div>
  );
}

function RejectProposalDialog({
  proposal,
  busy,
  onClose,
  onConfirm,
}: {
  proposal: ProposalDetail;
  busy: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4">
      <section className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <header className="border-b px-5 py-4">
          <h2 className="text-lg font-bold">Từ chối hồ sơ CLB</h2>
          <p className="mt-1 text-sm text-muted">{proposal.clubName}</p>
        </header>
        <div className="p-5">
          <label>
            <span className="label">Lý do từ chối</span>
            <textarea
              className="input h-32 py-3"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Nhập lý do để người nộp hồ sơ biết cần điều chỉnh gì..."
            />
          </label>
        </div>
        <footer className="flex justify-end gap-2 border-t px-5 py-4">
          <button className="btn-ghost" onClick={onClose} disabled={busy}>
            Hủy
          </button>
          <button
            className="btn-primary bg-red-600 hover:bg-red-700"
            onClick={() => onConfirm(reason.trim())}
            disabled={busy || !reason.trim()}
          >
            {busy ? "Đang xử lý..." : "Từ chối hồ sơ"}
          </button>
        </footer>
      </section>
    </div>
  );
}

export function SystemAdminDashboard() {
  const profile = useCurrentProfile();
  const displayName = getProfileDisplayName(profile);
  const [userCount, setUserCount] = useState<number | null>(null);
  const [clubAdminCount, setClubAdminCount] = useState<number | null>(null);
  const [clubCount, setClubCount] = useState<number | null>(null);
  const [proposalQueueCount, setProposalQueueCount] = useState<number | null>(
    null,
  );
  const [proposalQueue, setProposalQueue] = useState<Array<
    ProposalSummary & {
      submitterName?: string;
    }
  >>([]);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [overviewError, setOverviewError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadOverview() {
      setOverviewLoading(true);
      setOverviewError("");

      try {
        const [
          usersResult,
          clubAdmins,
          clubsResult,
          pendingProposals,
          revisionProposals,
        ] = await Promise.all([
          adminApi.getUsers({ page: 1, pageSize: 200 }),
          adminApi.getClubAdmins(),
          adminApi.getClubs({ page: 1, pageSize: 1 }),
          proposalApi.getAllProposals({
            status: "Pending",
            page: 1,
            pageSize: 5,
          }),
          proposalApi.getAllProposals({
            status: "NeedsRevision",
            page: 1,
            pageSize: 5,
          }),
        ]);
        const queueCandidates = [
          ...pendingProposals.items,
          ...revisionProposals.items,
        ]
          .sort(
            (first, second) =>
              new Date(second.submittedAt).getTime() -
              new Date(first.submittedAt).getTime(),
          )
          .slice(0, 5);
        const hydratedQueue = await Promise.all(
          queueCandidates.map(async (proposal) => {
            try {
              const detail = await proposalApi.getProposalById(proposal.id);
              return { ...proposal, submitterName: detail.submitterName };
            } catch {
              return proposal;
            }
          }),
        );

        if (!ignore) {
          setUserCount(usersResult.totalCount);
          setClubAdminCount(clubAdmins.length);
          setClubCount(clubsResult.totalCount);
          setProposalQueueCount(
            pendingProposals.totalCount + revisionProposals.totalCount,
          );
          setProposalQueue(hydratedQueue);
        }
      } catch (err) {
        if (!ignore) {
          setUserCount(null);
          setClubAdminCount(null);
          setClubCount(null);
          setProposalQueueCount(null);
          setProposalQueue([]);
          setOverviewError(
            err instanceof Error
              ? err.message
              : "Không thể tải số liệu tổng quan.",
          );
        }
      } finally {
        if (!ignore) {
          setOverviewLoading(false);
        }
      }
    }

    loadOverview();

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <main className="page-shell">
      <PageTitle
        eyebrow="QUẢN TRỊ VIÊN ĐẠI HỌC"
        title="Bảng điều khiển quản trị"
        description={`Xin chào ${displayName}. Theo dõi người dùng, quản trị viên câu lạc bộ, câu lạc bộ và hồ sơ cần xử lý.`}
        actions={
          <>
            <Link to="/system-admin/users" className="btn-secondary">
              <Users className="h-4 w-4" />
              Danh sách người dùng
            </Link>
            <Link to="/system-admin/club-admins" className="btn-primary">
              <UserCog className="h-4 w-4" />
              Quản trị viên CLB
            </Link>
          </>
        }
      />
      {overviewError && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {overviewError}
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Tổng CLB"
          value={clubCount === null ? "--" : String(clubCount)}
          icon={FileCheck2}
        />
        <StatCard
          label="Người dùng"
          value={userCount === null ? "--" : String(userCount)}
          icon={Users}
          tone="blue"
        />
        <StatCard
          label="Quản trị viên CLB"
          value={clubAdminCount === null ? "--" : String(clubAdminCount)}
          icon={UserCog}
          tone="green"
        />
        <StatCard
          label="Hồ sơ cần xử lý"
          value={
            proposalQueueCount === null ? "--" : String(proposalQueueCount)
          }
          icon={ClipboardCheck}
          tone="red"
        />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
        <SectionCard
          title="Hàng đợi phê duyệt"
          action={
            <Link to="/system-admin/proposals" className="btn-ghost">
              Xem tất cả
            </Link>
          }
        >
          {overviewLoading ? (
            <EmptyState
              title="Đang tải hàng đợi"
              description="Các hồ sơ cần xử lý sẽ hiển thị ngay khi sẵn sàng."
            />
          ) : proposalQueue.length === 0 ? (
            <EmptyState
              title="Không có hồ sơ chờ xử lý"
              description="Các hồ sơ mới hoặc cần bổ sung sẽ xuất hiện tại đây."
            />
          ) : (
            <DataTable
              columns={[
                "Tên CLB",
                "Người nộp",
                "Ngày gửi",
                "Trạng thái",
                "Thao tác",
              ]}
              rows={proposalQueue.map((proposal) => [
                <span className="font-bold text-ink">
                  {proposal.clubName}
                </span>,
                proposal.submitterName || proposal.founderInfo,
                formatAdminDate(proposal.submittedAt),
                <ProposalStatusBadge status={proposal.status} />,
                <Link
                  className="btn-ghost"
                  to={`/system-admin/proposals/${proposal.id}`}
                >
                  Xem
                </Link>,
              ])}
            />
          )}
        </SectionCard>
        <SectionCard title="Lối tắt vận hành">
          <div className="grid gap-3">
            {[
              ["/system-admin/users", "Quản lý người dùng", "Lọc theo vai trò, xem chi tiết và đổi trạng thái."],
              ["/system-admin/club-admins", "Danh sách quản trị viên CLB", "Kiểm tra tài khoản đủ điều kiện quản trị câu lạc bộ."],
              ["/system-admin/clubs", "Quản lý CLB", "Theo dõi trạng thái vận hành của từng CLB."],
            ].map(([to, title, text]) => (
              <Link
                key={to}
                to={to}
                className="rounded-xl border bg-slate-50 p-4 transition hover:border-primary hover:bg-white"
              >
                <div className="font-bold text-ink">{title}</div>
                <div className="mt-1 text-sm text-muted">{text}</div>
              </Link>
            ))}
          </div>
        </SectionCard>
      </div>
    </main>
  );
}
export function SystemProposalsPage() {
  const [status, setStatus] = useState<ProposalStatus | "">("");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<Array<ProposalSummary & {
    submitterName?: string;
  }>>([]);
  const [pageInfo, setPageInfo] = useState<{
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadProposals() {
      setLoading(true);
      setError("");

      try {
        const result = await proposalApi.getAllProposals({
          status,
          page,
          pageSize: 10,
        });
        const hydrated = await Promise.all(
          result.items.map(async (proposal) => {
            try {
              const detail = await proposalApi.getProposalById(proposal.id);
              return { ...proposal, submitterName: detail.submitterName };
            } catch {
              return proposal;
            }
          }),
        );

        if (!ignore) {
          setItems(hydrated);
          setPageInfo({
            page: result.page,
            pageSize: result.pageSize,
            totalCount: result.totalCount,
            totalPages: result.totalPages,
            hasNext: result.hasNext,
            hasPrev: result.hasPrev,
          });
        }
      } catch (err) {
        if (!ignore) {
          setError(
            err instanceof Error
              ? err.message
              : "Không thể tải danh sách hồ sơ CLB.",
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadProposals();

    return () => {
      ignore = true;
    };
  }, [status, page]);

  const visibleItems = useMemo(
    () =>
      items.filter((proposal) => {
        const keyword = search.trim().toLowerCase();
        if (!keyword) return true;

        return [
          proposal.clubName,
          proposal.category,
          getClubCategoryLabel(proposal.category),
          proposal.submitterName,
          proposal.founderInfo,
          proposal.contactEmail,
          proposal.status,
          getProposalStatusLabel(proposal.status),
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(keyword));
      }),
    [items, search],
  );

  return (
    <main className="page-shell">
      <PageTitle
        title="Quản lý hồ sơ CLB"
        description="Theo dõi hồ sơ thành lập câu lạc bộ, xem chi tiết và xử lý duyệt hoặc từ chối."
      />
      <FilterBar
        placeholder="Tìm theo tên CLB, người nộp, email..."
        value={search}
        onChange={setSearch}
        actions={
          <select
            className="input w-full sm:w-48"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as ProposalStatus | "");
              setPage(1);
            }}
          >
            {PROPOSAL_STATUS_OPTIONS.map((item) => (
              <option key={item.value || "all"} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        }
      />

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <SectionCard title="Đang tải dữ liệu">
          <EmptyState
            title="Đang tải danh sách hồ sơ CLB"
            description="Dữ liệu sẽ hiển thị ngay khi sẵn sàng."
          />
        </SectionCard>
      ) : visibleItems.length === 0 ? (
        <EmptyState
          title="Không có hồ sơ phù hợp"
          description="Thử đổi bộ lọc hoặc từ khóa tìm kiếm."
        />
      ) : (
        <section className="card overflow-hidden">
          <DataTable
            columns={[
              "Tên CLB",
              "Danh mục",
              "Người nộp hồ sơ",
              "Email",
              "Ngày gửi",
              "Trạng thái",
              "Thao tác",
            ]}
            rows={visibleItems.map((proposal) => [
              <span className="font-bold text-ink">{proposal.clubName}</span>,
              getClubCategoryLabel(proposal.category),
              proposal.submitterName || proposal.founderInfo,
              proposal.contactEmail,
              formatAdminDate(proposal.submittedAt),
              <ProposalStatusBadge status={proposal.status} />,
              <Link
                to={`/system-admin/proposals/${proposal.id}`}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:border-primary hover:bg-primary-soft hover:text-primary"
              >
                <Eye className="h-4 w-4" />
                Chi tiết
              </Link>,
            ])}
          />
        </section>
      )}

      {pageInfo && visibleItems.length > 0 && (
        <div className="mt-5 flex flex-col gap-3 rounded-xl border bg-white px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
          <span className="text-muted">
            Trang {pageInfo.page}/{Math.max(pageInfo.totalPages, 1)} ·{" "}
            {visibleItems.length} hồ sơ đang hiển thị
          </span>
          <div className="flex gap-2">
            <button
              className="btn-secondary"
              disabled={!pageInfo.hasPrev || loading}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Trước
            </button>
            <button
              className="btn-secondary"
              disabled={!pageInfo.hasNext || loading}
              onClick={() => setPage((current) => current + 1)}
            >
              Sau
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
export function ProposalReviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [proposal, setProposal] = useState<ProposalDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reviewing, setReviewing] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function loadProposal() {
      if (!id) {
        setError("Thiếu mã hồ sơ.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const result = await proposalApi.getProposalById(id);
        if (!ignore) {
          setProposal(result);
        }
      } catch (err) {
        if (!ignore) {
          setError(
            err instanceof Error ? err.message : "Không thể tải chi tiết hồ sơ.",
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadProposal();

    return () => {
      ignore = true;
    };
  }, [id]);

  async function review(isApproved: boolean, rejectionReason?: string) {
    if (!proposal) return;

    setReviewing(true);
    setError("");

    try {
      await proposalApi.reviewProposal(proposal.id, {
        isApproved,
        rejectionReason: rejectionReason || undefined,
      });
      setProposal({
        ...proposal,
        status: isApproved ? "Approved" : "Rejected",
        rejectionReason: isApproved ? null : rejectionReason,
        reviewedAt: new Date().toISOString(),
      });
      setApproveOpen(false);
      setRejectOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể xử lý hồ sơ.");
    } finally {
      setReviewing(false);
    }
  }

  if (loading) {
    return (
      <main className="page-shell">
        <PageTitle title="Chi tiết hồ sơ CLB" />
        <SectionCard title="Đang tải">
          <EmptyState title="Đang tải thông tin hồ sơ" />
        </SectionCard>
      </main>
    );
  }

  if (!proposal) {
    return (
      <main className="page-shell">
        <PageTitle
          title="Không tìm thấy hồ sơ"
          actions={
            <button className="btn-secondary" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" />
              Quay lại
            </button>
          }
        />
        <SectionCard title="Thông báo">
          <EmptyState title={error || "Hồ sơ không tồn tại"} />
        </SectionCard>
      </main>
    );
  }

  const canReview =
    proposal.status === "Pending" || proposal.status === "NeedsRevision";

  return (
    <main className="page-shell">
      <PageTitle
        title={proposal.clubName}
        description={`${proposal.submitterName} · ${proposal.contactEmail}`}
        actions={
          <button className="btn-secondary" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </button>
        }
      />

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
        <SectionCard title="Thông tin hồ sơ">
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              ["Tên CLB", proposal.clubName],
              ["Danh mục", getClubCategoryLabel(proposal.category)],
              ["Người nộp hồ sơ", proposal.submitterName],
              ["Email", proposal.contactEmail],
              ["MSSV người sáng lập", proposal.founderStudentCode],
              ["Ngày gửi", formatAdminDate(proposal.submittedAt)],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border bg-slate-50 p-4">
                <div className="text-xs font-bold uppercase text-muted">
                  {label}
                </div>
                <div className="mt-1 font-semibold text-ink">{value}</div>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-xl border bg-slate-50 p-4">
            <div className="text-xs font-bold uppercase text-muted">
              Trạng thái
            </div>
            <div className="mt-2">
              <ProposalStatusBadge status={proposal.status} />
            </div>
          </div>
          {[
            ["Mô tả", proposal.description],
            ["Sứ mệnh", proposal.mission],
            ["Lý do thành lập", proposal.reason],
            ["Kế hoạch hoạt động", proposal.activityPlan],
          ].map(([label, value]) =>
            value ? (
              <div key={label} className="mt-5 rounded-xl border p-4">
                <div className="text-xs font-bold uppercase text-muted">
                  {label}
                </div>
                <p className="mt-2 whitespace-pre-line leading-7 text-slate-700">
                  {value}
                </p>
              </div>
            ) : null,
          )}
        </SectionCard>

        <SectionCard title="Liên hệ và tài liệu">
          <div className="space-y-3 text-sm">
            {[
              ["Người sáng lập", proposal.founderInfo],
              ["Số điện thoại", proposal.contactPhone || "Chưa cập nhật"],
              ["Cố vấn", proposal.advisor || "Chưa cập nhật"],
              ["Ghi chú", proposal.notes || "Không có"],
              [
                "Ngày xử lý",
                proposal.reviewedAt
                  ? formatAdminDate(proposal.reviewedAt)
                  : "Chưa xử lý",
              ],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex justify-between gap-3 rounded-xl bg-slate-50 p-3"
              >
                <span className="text-muted">{label}</span>
                <span className="min-w-0 truncate font-semibold">{value}</span>
              </div>
            ))}
          </div>
          {proposal.rejectionReason && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <div className="font-bold">Lý do từ chối / yêu cầu bổ sung</div>
              <p className="mt-2 leading-6">{proposal.rejectionReason}</p>
            </div>
          )}
          {proposal.logoUrl && (
            <div className="mt-5 rounded-xl border bg-white p-4">
              <div className="text-xs font-bold uppercase text-muted">
                Hình ảnh CLB
              </div>
              <img
                src={proposal.logoUrl}
                alt={proposal.clubName}
                className="mt-3 h-32 w-32 rounded-2xl object-cover"
              />
            </div>
          )}
          <div className="mt-5 grid gap-3">
            {proposal.logoUrl && (
              <a
                className="btn-secondary justify-center"
                href={proposal.logoUrl}
                target="_blank"
                rel="noreferrer"
              >
                <Eye className="h-4 w-4" />
                Xem logo
              </a>
            )}
            {proposal.founderIdCardUrl && (
              <a
                className="btn-secondary justify-center"
                href={proposal.founderIdCardUrl}
                target="_blank"
                rel="noreferrer"
              >
                <FileCheck2 className="h-4 w-4" />
                Xem giấy tờ người sáng lập
              </a>
            )}
            {proposal.proposalFileUrl && (
              <a
                className="btn-secondary justify-center"
                href={proposal.proposalFileUrl}
                target="_blank"
                rel="noreferrer"
              >
                <FileCheck2 className="h-4 w-4" />
                Xem file hồ sơ
              </a>
            )}
          </div>
        </SectionCard>
      </div>

      {canReview && (
        <section className="mt-6 flex flex-col justify-end gap-3 rounded-2xl border bg-white p-5 shadow-card sm:flex-row">
          <button
            className="btn-ghost text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={() => setRejectOpen(true)}
          >
            <XCircle className="h-4 w-4" />
            Từ chối
          </button>
          <button className="btn-primary" onClick={() => setApproveOpen(true)}>
            <CheckCircle2 className="h-4 w-4" />
            Duyệt hồ sơ
          </button>
        </section>
      )}

      {approveOpen && (
        <ApproveProposalDialog
          proposal={proposal}
          busy={reviewing}
          onClose={() => setApproveOpen(false)}
          onConfirm={() => review(true)}
        />
      )}

      {rejectOpen && (
        <RejectProposalDialog
          proposal={proposal}
          busy={reviewing}
          onClose={() => setRejectOpen(false)}
          onConfirm={(reason) => review(false, reason)}
        />
      )}
    </main>
  );
}
export function SystemClubsPage() {
  const [status, setStatus] = useState<AdminClubStatus | "">("");
  const [category, setCategory] = useState<AdminClubCategory | "">("");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [clubsResult, setClubsResult] = useState<{
    items: AdminClubSummary[];
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null>(null);
  const [clubOfficerMap, setClubOfficerMap] = useState<
    Record<string, ClubOfficerDisplay[]>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusClub, setStatusClub] = useState<AdminClubSummary | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function loadClubs() {
      setLoading(true);
      setError("");

      try {
        const [result, clubAdmins] = await Promise.all([
          adminApi.getClubs({
            status,
            clubcategories: category,
            page,
            pageSize: 10,
          }),
          adminApi.getClubAdmins(),
        ]);

        const details = await Promise.allSettled(
          result.items.map((club) => clubApi.getClubById(club.id)),
        );

        const nextOfficerMap = result.items.reduce<
          Record<string, ClubOfficerDisplay[]>
        >((map, club, index) => {
          const detail = details[index];
          map[club.id] =
            detail?.status === "fulfilled"
              ? enrichClubOfficers(detail.value.officers, clubAdmins)
              : [];

          return map;
        }, {});

        if (!ignore) {
          setClubsResult(result);
          setClubOfficerMap(nextOfficerMap);
        }
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
    }

    loadClubs();

    return () => {
      ignore = true;
    };
  }, [status, category, page]);

  const visibleClubs = useMemo(
    () =>
      (clubsResult?.items ?? []).filter((club) => {
        const keyword = search.trim().toLowerCase();
        if (!keyword) return true;

        return [
          club.name,
          club.category,
          getClubCategoryLabel(club.category),
          club.status,
          getStatusLabel(club.status),
          club.description,
          ...(clubOfficerMap[club.id] ?? []).flatMap((officer) => [
            officer.fullName,
            officer.email,
          ]),
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(keyword));
      }),
    [clubOfficerMap, clubsResult?.items, search],
  );

  async function handleStatusUpdate(nextStatus: AdminClubStatus) {
    if (!statusClub) return;

    setUpdating(true);
    try {
      await adminApi.updateClubStatus(statusClub.id, nextStatus);
      setClubsResult((current) => {
        if (!current) return current;

        return {
          ...current,
          items:
            nextStatus === "Deleted"
              ? current.items.filter((club) => club.id !== statusClub.id)
              : current.items.map((club) =>
                  club.id === statusClub.id
                    ? { ...club, status: nextStatus }
                    : club,
                ),
        };
      });
      setStatusClub(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Không thể cập nhật trạng thái CLB.",
      );
    } finally {
      setUpdating(false);
    }
  }

  return (
    <main className="page-shell">
      <PageTitle
        title="Quản lý Câu lạc bộ"
        description="Theo dõi danh sách CLB, danh mục hoạt động, số lượng thành viên và trạng thái vận hành."
        actions={
          <Link to="/system-admin/clubs/new" className="btn-primary">
            <PlusCircle className="h-4 w-4" />
            Tạo CLB chính thức
          </Link>
        }
      />
      <FilterBar
        placeholder="Tìm kiếm tên CLB, danh mục, trạng thái..."
        value={search}
        onChange={setSearch}
        actions={
          <>
            <select
              className="input w-full sm:w-48"
              value={category}
              onChange={(event) => {
                setCategory(event.target.value as AdminClubCategory | "");
                setPage(1);
              }}
            >
              {CLUB_CATEGORY_OPTIONS.map((item) => (
                <option key={item.value || "all"} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
            <select
              className="input w-full sm:w-44"
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as AdminClubStatus | "");
                setPage(1);
              }}
            >
              <option value="">Tất cả trạng thái</option>
              {CLUB_STATUS_OPTIONS.map((item) => (
                <option key={item} value={item}>
                  {getStatusLabel(item)}
                </option>
              ))}
            </select>
          </>
        }
      />

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <SectionCard title="Đang tải dữ liệu">
          <EmptyState
            title="Đang tải danh sách câu lạc bộ"
            description="Dữ liệu sẽ hiển thị ngay khi sẵn sàng."
          />
        </SectionCard>
      ) : visibleClubs.length === 0 ? (
        <EmptyState
          title="Không có câu lạc bộ phù hợp"
          description="Thử đổi bộ lọc hoặc từ khóa tìm kiếm."
        />
      ) : (
        <section className="card overflow-hidden">
          <DataTable
            columns={[
              "Tên CLB",
              "Danh mục",
              "Quản trị viên phụ trách",
              "Thành viên",
              "Trạng thái",
              "Thao tác",
            ]}
            rows={visibleClubs.map((club) => [
              <div className="min-w-[220px]">
                <div className="font-bold text-ink">{club.name}</div>
                {club.description && (
                  <div className="mt-1 line-clamp-1 text-xs text-muted">
                    {club.description}
                  </div>
                )}
              </div>,
              getClubCategoryLabel(club.category),
              <div className="min-w-[220px] space-y-2">
                {(clubOfficerMap[club.id] ?? []).length > 0 ? (
                  (clubOfficerMap[club.id] ?? []).map((officer) => (
                    <div key={officer.userId} className="min-w-0">
                      <div className="truncate font-semibold text-ink">
                        {officer.fullName}
                      </div>
                      <div className="truncate text-xs text-muted">
                        {officer.email || "Chưa có email"}
                      </div>
                    </div>
                  ))
                ) : (
                  <span className="text-sm text-muted">
                    Chưa có quản trị viên phụ trách
                  </span>
                )}
              </div>,
              String(club.memberCount ?? 0),
              <div className="min-w-max">
                <AdminStatusBadge status={club.status} />
              </div>,
              <div className="flex min-w-[220px] flex-nowrap items-center justify-center gap-2 whitespace-nowrap">
                <Link
                  to={`/system-admin/clubs/${club.id}`}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:border-primary hover:bg-primary-soft hover:text-primary"
                >
                  <Eye className="h-4 w-4" />
                  Chi tiết
                </Link>
                <button
                  className="btn-secondary"
                  onClick={() => setStatusClub(club)}
                >
                  <ShieldCheck className="h-4 w-4" />
                  Trạng thái
                </button>
              </div>,
            ])}
          />
        </section>
      )}

      {clubsResult && visibleClubs.length > 0 && (
        <div className="mt-5 flex flex-col gap-3 rounded-xl border bg-white px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
          <span className="text-muted">
            Trang {clubsResult.page}/{Math.max(clubsResult.totalPages, 1)} ·{" "}
            {visibleClubs.length} câu lạc bộ đang hiển thị
          </span>
          <div className="flex gap-2">
            <button
              className="btn-secondary"
              disabled={!clubsResult.hasPrev || loading}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Trước
            </button>
            <button
              className="btn-secondary"
              disabled={!clubsResult.hasNext || loading}
              onClick={() => setPage((current) => current + 1)}
            >
              Sau
            </button>
          </div>
        </div>
      )}

      {statusClub && (
        <ClubStatusDialog
          club={statusClub}
          busy={updating}
          onClose={() => setStatusClub(null)}
          onConfirm={handleStatusUpdate}
        />
      )}
    </main>
  );
}
export function OfficialClubCreatePage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [category, setCategory] = useState<AdminClubCategory>("Academic");
  const [clubAdminUserId, setClubAdminUserId] = useState("");
  const [clubAdminSearch, setClubAdminSearch] = useState("");
  const [clubAdmins, setClubAdmins] = useState<AdminUserProfile[]>([]);
  const [loadingClubAdmins, setLoadingClubAdmins] = useState(true);
  const [description, setDescription] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function loadClubAdmins() {
      setLoadingClubAdmins(true);

      try {
        const result = await adminApi.getClubAdmins();

        if (!ignore) {
          setClubAdmins(result.filter((user) => user.status !== "Deleted"));
        }
      } catch (err) {
        if (!ignore) {
          setError(
            err instanceof Error
              ? err.message
              : "Không thể tải danh sách quản trị viên câu lạc bộ.",
          );
        }
      } finally {
        if (!ignore) {
          setLoadingClubAdmins(false);
        }
      }
    }

    loadClubAdmins();

    return () => {
      ignore = true;
    };
  }, []);

  const visibleClubAdmins = useMemo(
    () =>
      clubAdmins
        .filter((user) => user.status === "Active")
        .filter((user) => clubAdminMatchesSearch(user, clubAdminSearch)),
    [clubAdmins, clubAdminSearch],
  );

  const selectedClubAdmin = clubAdmins.find(
    (user) => user.id === clubAdminUserId,
  );

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim()) {
      setError("Vui lòng nhập tên câu lạc bộ.");
      return;
    }

    if (!clubAdminUserId.trim()) {
      setError("Vui lòng chọn quản trị viên câu lạc bộ.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const [logoUpload, coverUpload] = await Promise.all([
        logoFile ? storageApi.uploadImage(logoFile, "clubs") : null,
        coverImageFile ? storageApi.uploadImage(coverImageFile, "clubs") : null,
      ]);

      await adminApi.createClub({
        name: name.trim(),
        category,
        description: description.trim() || undefined,
        logoUrl: logoUpload?.url,
        coverImageUrl: coverUpload?.url,
        clubAdminUserId: clubAdminUserId.trim(),
      });
      navigate("/system-admin/clubs");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tạo CLB.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="page-shell max-w-5xl">
      <PageTitle title="Tạo Câu Lạc Bộ Chính Thức" />
      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}
      <form onSubmit={submit} className="card grid gap-5 p-6 sm:grid-cols-2">
        <label>
          <span className="label">Tên Câu Lạc Bộ *</span>
          <input
            className="input"
            placeholder="CLB Sách và Những người bạn"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>
        <label>
          <span className="label">Danh mục *</span>
          <select
            className="input"
            value={category}
            onChange={(event) =>
              setCategory(event.target.value as AdminClubCategory)
            }
          >
            {CLUB_CATEGORY_OPTIONS.filter((item) => item.value).map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <div className="sm:col-span-2 grid gap-3">
          <label>
            <span className="label">Tìm quản trị viên câu lạc bộ</span>
            <input
              className="input"
              placeholder="Nhập tên, tên đăng nhập hoặc email"
              value={clubAdminSearch}
              onChange={(event) => setClubAdminSearch(event.target.value)}
            />
          </label>
          <label>
            <span className="label">Quản trị viên câu lạc bộ *</span>
            <select
              className="input"
              value={clubAdminUserId}
              disabled={loadingClubAdmins}
              onChange={(event) => setClubAdminUserId(event.target.value)}
            >
              <option value="">
                {loadingClubAdmins
                  ? "Đang tải danh sách..."
                  : "Chọn quản trị viên câu lạc bộ"}
              </option>
              {visibleClubAdmins.map((user) => (
                <option key={user.id} value={user.id}>
                  {getClubAdminOptionLabel(user)}
                </option>
              ))}
              {selectedClubAdmin &&
                !visibleClubAdmins.some(
                  (user) => user.id === selectedClubAdmin.id,
                ) && (
                  <option value={selectedClubAdmin.id}>
                    {getClubAdminOptionLabel(selectedClubAdmin)}
                  </option>
                )}
            </select>
          </label>
          {!loadingClubAdmins && visibleClubAdmins.length === 0 && (
            <p className="text-sm text-muted">
              Không tìm thấy quản trị viên câu lạc bộ phù hợp.
            </p>
          )}
        </div>
        <label className="sm:col-span-2">
          <span className="label">Mô tả tóm tắt</span>
          <textarea
            className="input h-32 py-3"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </label>
        <label>
          <span className="label">Logo</span>
          <input
            className="input h-auto py-3"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={(event) =>
              setLogoFile(event.target.files?.item(0) ?? null)
            }
          />
          <span className="mt-2 block truncate text-xs text-muted">
            {getImageFileName(logoFile)}
          </span>
        </label>
        <label>
          <span className="label">Ảnh bìa</span>
          <input
            className="input h-auto py-3"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={(event) =>
              setCoverImageFile(event.target.files?.item(0) ?? null)
            }
          />
          <span className="mt-2 block truncate text-xs text-muted">
            {getImageFileName(coverImageFile)}
          </span>
        </label>
        <div className="sm:col-span-2 flex justify-end gap-2">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate("/system-admin/clubs")}
          >
            Hủy bỏ
          </button>
          <button className="btn-primary" disabled={submitting}>
            {submitting ? "Đang xử lý..." : "Khởi tạo CLB ngay"}
          </button>
        </div>
      </form>
    </main>
  );
}
export function SystemClubDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [club, setClub] = useState<ClubDetail | null>(null);
  const [clubAdminProfiles, setClubAdminProfiles] = useState<
    AdminUserProfile[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusClub, setStatusClub] = useState<ClubDetail | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function loadClub() {
      if (!id) {
        setError("Thiếu mã câu lạc bộ.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const [result, clubAdmins] = await Promise.all([
          clubApi.getClubById(id),
          adminApi.getClubAdmins(),
        ]);

        if (!ignore) {
          setClub(result.status === "Deleted" ? null : result);
          setClubAdminProfiles(clubAdmins);
          if (result.status === "Deleted") {
            setError("Câu lạc bộ này đã bị xóa.");
          }
        }
      } catch (err) {
        if (!ignore) {
          setError(
            err instanceof Error
              ? err.message
              : "Không thể tải chi tiết câu lạc bộ.",
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadClub();

    return () => {
      ignore = true;
    };
  }, [id]);

  async function handleStatusUpdate(nextStatus: AdminClubStatus) {
    if (!statusClub) return;

    setUpdating(true);
    try {
      await adminApi.updateClubStatus(statusClub.id, nextStatus);

      if (nextStatus === "Deleted") {
        navigate("/system-admin/clubs");
        return;
      }

      setClub((current) =>
        current ? { ...current, status: nextStatus } : current,
      );
      setStatusClub(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Không thể cập nhật trạng thái CLB.",
      );
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <main className="page-shell">
        <SectionCard title="Đang tải dữ liệu">
          <EmptyState
            title="Đang tải chi tiết câu lạc bộ"
            description="Dữ liệu sẽ hiển thị ngay khi sẵn sàng."
          />
        </SectionCard>
      </main>
    );
  }

  if (!club) {
    return (
      <main className="page-shell">
        <button className="btn-secondary mb-5" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </button>
        <EmptyState
          title="Không tìm thấy câu lạc bộ"
          description={error || "Câu lạc bộ không tồn tại hoặc đã bị xóa."}
        />
      </main>
    );
  }

  const officers = enrichClubOfficers(club.officers, clubAdminProfiles);
  const members = club.members ?? [];

  return (
    <main className="page-shell">
      <PageTitle
        title={club.name}
        description="Theo dõi hồ sơ câu lạc bộ, quản trị viên phụ trách, thành viên và trạng thái vận hành."
        actions={
          <>
            <button className="btn-secondary" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" />
              Quay lại
            </button>
            <button
              className="btn-secondary"
              onClick={() => setStatusClub(club)}
            >
              <ShieldCheck className="h-4 w-4" />
              Trạng thái
            </button>
          </>
        }
      />
      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <StatCard
          label="Thành viên"
          value={String(club.memberCount ?? members.length)}
          icon={Users}
          tone="primary"
        />
        <StatCard
          label="Quản trị viên"
          value={String(officers.length)}
          icon={UserCog}
          tone="blue"
        />
        <StatCard
          label="Danh mục"
          value={getClubCategoryLabel(club.category)}
          icon={Archive}
          tone="green"
        />
        <StatCard
          label="Ngày tạo"
          value={formatAdminDate(club.createdAt)}
          icon={CalendarDays}
          tone="slate"
        />
      </div>
      <div className="grid gap-6 lg:grid-cols-[.9fr_1.2fr]">
        <SectionCard title="Hồ sơ câu lạc bộ">
          <div className="overflow-hidden rounded-xl border bg-slate-50">
            {club.coverImageUrl ? (
              <img
                src={club.coverImageUrl}
                alt={club.name}
                className="h-40 w-full object-cover"
              />
            ) : (
              <div className="flex h-40 items-center justify-center bg-primary-soft text-3xl font-extrabold text-primary">
                {getInitials(club.name)}
              </div>
            )}
          </div>
          <div className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between rounded-xl bg-slate-50 p-3">
              <span className="text-muted">Tên CLB</span>
              <span className="text-right font-semibold">{club.name}</span>
            </div>
            <div className="flex justify-between rounded-xl bg-slate-50 p-3">
              <span className="text-muted">Danh mục</span>
              <span className="font-semibold">
                {getClubCategoryLabel(club.category)}
              </span>
            </div>
            <div className="flex justify-between rounded-xl bg-slate-50 p-3">
              <span className="text-muted">Trạng thái</span>
              <AdminStatusBadge status={club.status} />
            </div>
          </div>
          {club.description && (
            <p className="mt-5 text-sm leading-6 text-muted">
              {club.description}
            </p>
          )}
        </SectionCard>
        <SectionCard title="Quản trị viên câu lạc bộ phụ trách">
          {officers.length === 0 ? (
            <EmptyState
              title="Chưa có quản trị viên phụ trách"
              description="Backend chưa trả về quản trị viên được gán cho câu lạc bộ này."
            />
          ) : (
            <div className="space-y-3">
              {officers.map((officer) => (
                <div
                  key={officer.userId}
                  className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 p-4"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    {officer.avatarUrl ? (
                      <img
                        src={officer.avatarUrl}
                        alt={officer.fullName}
                        className="h-11 w-11 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-soft text-sm font-bold text-primary">
                        {getInitials(officer.fullName)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="truncate font-bold text-ink">
                        {officer.fullName}
                      </div>
                      <div className="text-sm text-muted">
                        {officer.email || "Chưa có email"}
                      </div>
                      <div className="text-xs font-semibold text-muted">
                        {getRoleLabel(officer.roleInClub)}
                      </div>
                    </div>
                  </div>
                  <StatusBadge status="active" />
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
      <section className="mt-6">
        <SectionCard title="Danh sách thành viên">
          {members.length === 0 ? (
            <EmptyState
              title="Chưa có thành viên"
              description="Danh sách thành viên sẽ hiển thị khi có hồ sơ được duyệt."
            />
          ) : (
            <DataTable
              columns={["Thành viên", "MSSV", "Vai trò", "Ngày tham gia"]}
              rows={members.map((member) => [
                <div className="flex min-w-[220px] items-center gap-3">
                  {member.avatarUrl ? (
                    <img
                      src={member.avatarUrl}
                      alt={member.fullName}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-sm font-bold text-primary">
                      {getInitials(member.fullName)}
                    </div>
                  )}
                  <span className="font-semibold text-ink">
                    {member.fullName}
                  </span>
                </div>,
                member.studentCode || "Chưa có",
                getRoleLabel(member.roleInClub),
                formatAdminDate(member.joinedAt),
              ])}
            />
          )}
        </SectionCard>
      </section>
      {statusClub && (
        <ClubStatusDialog
          club={statusClub}
          busy={updating}
          onClose={() => setStatusClub(null)}
          onConfirm={handleStatusUpdate}
        />
      )}
    </main>
  );
}
export function UsersManagementPage() {
  const [role, setRole] = useState<AdminUserRole | "">("");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [usersResult, setUsersResult] = useState<{
    items: AdminUserProfile[];
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusUser, setStatusUser] = useState<AdminUserProfile | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function loadUsers() {
      setLoading(true);
      setError("");

      try {
        const result = await adminApi.getUsers({ role, page, pageSize: 20 });

        if (!ignore) {
          setUsersResult(result);
        }
      } catch (err) {
        if (!ignore) {
          setError(
            err instanceof Error
              ? err.message
              : "Không thể tải danh sách người dùng.",
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadUsers();

    return () => {
      ignore = true;
    };
  }, [role, page]);

  const visibleUsers = useMemo(
    () =>
      (usersResult?.items ?? [])
        .filter((user) => user.status !== "Deleted")
        .filter((user) => userMatchesSearch(user, search)),
    [usersResult?.items, search],
  );

  async function handleStatusUpdate(nextStatus: AdminUserStatus) {
    if (!statusUser) return;

    setUpdating(true);
    try {
      await adminApi.updateUserStatus(statusUser.id, nextStatus);
      setUsersResult((current) => {
        if (!current) return current;

        const items =
          nextStatus === "Deleted"
            ? current.items.filter((user) => user.id !== statusUser.id)
            : current.items.map((user) =>
                user.id === statusUser.id
                  ? { ...user, status: nextStatus }
                  : user,
              );

        return { ...current, items };
      });
      setStatusUser(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Không thể cập nhật trạng thái.",
      );
    } finally {
      setUpdating(false);
    }
  }

  return (
    <main className="page-shell">
      <PageTitle
        title="Quản lý người dùng"
        description="Theo dõi tài khoản sinh viên, thành viên và quản trị viên câu lạc bộ trong toàn hệ thống."
      />

      <FilterBar
        placeholder="Tìm theo tên, tên đăng nhập, email, MSSV..."
        value={search}
        onChange={setSearch}
        actions={
          <select
            className="input w-full sm:w-48"
            value={role}
            onChange={(event) => {
              setRole(event.target.value as AdminUserRole | "");
              setPage(1);
            }}
          >
            {ADMIN_ROLE_OPTIONS.map((item) => (
              <option key={item.value || "all"} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        }
      />

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <SectionCard title="Đang tải dữ liệu">
          <EmptyState
            title="Đang tải danh sách người dùng"
            description="Dữ liệu sẽ hiển thị ngay khi sẵn sàng."
          />
        </SectionCard>
      ) : (
        <AdminUsersTable
          users={visibleUsers}
          detailBasePath="/system-admin/users"
          onOpenStatus={setStatusUser}
        />
      )}

      {usersResult && (
        <div className="mt-5 flex flex-col gap-3 rounded-xl border bg-white px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
          <span className="text-muted">
            Trang {usersResult.page}/{Math.max(usersResult.totalPages, 1)} ·{" "}
            {visibleUsers.length} người dùng đang hiển thị
          </span>
          <div className="flex gap-2">
            <button
              className="btn-secondary"
              disabled={!usersResult.hasPrev || loading}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Trước
            </button>
            <button
              className="btn-secondary"
              disabled={!usersResult.hasNext || loading}
              onClick={() => setPage((current) => current + 1)}
            >
              Sau
            </button>
          </div>
        </div>
      )}

      {statusUser && (
        <UserStatusDialog
          user={statusUser}
          busy={updating}
          onClose={() => setStatusUser(null)}
          onConfirm={handleStatusUpdate}
        />
      )}
    </main>
  );
}
export function ClubAdminsPage() {
  const [clubAdmins, setClubAdmins] = useState<AdminUserProfile[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState<AdminClubCategory | "">("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusUser, setStatusUser] = useState<AdminUserProfile | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 350);

    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let ignore = false;

    async function loadClubAdmins() {
      setLoading(true);
      setError("");

      try {
        const result = await adminApi.getClubAdmins({
          category,
          searchTerm: debouncedSearch || undefined,
        });

        if (!ignore) {
          setClubAdmins(result.filter((user) => user.status !== "Deleted"));
        }
      } catch (err) {
        if (!ignore) {
          setError(
            err instanceof Error
              ? err.message
              : "Không thể tải danh sách quản trị viên câu lạc bộ.",
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadClubAdmins();

    return () => {
      ignore = true;
    };
  }, [category, debouncedSearch]);

  const visibleAdmins = clubAdmins;

  async function handleStatusUpdate(nextStatus: AdminUserStatus) {
    if (!statusUser) return;

    setUpdating(true);
    try {
      await adminApi.updateUserStatus(statusUser.id, nextStatus);
      setClubAdmins((current) =>
        nextStatus === "Deleted"
          ? current.filter((user) => user.id !== statusUser.id)
          : current.map((user) =>
              user.id === statusUser.id ? { ...user, status: nextStatus } : user,
            ),
      );
      setStatusUser(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Không thể cập nhật trạng thái.",
      );
    } finally {
      setUpdating(false);
    }
  }

  return (
    <main className="page-shell">
      <PageTitle
        title="Danh sách quản trị viên câu lạc bộ"
        description="Theo dõi các tài khoản đang phụ trách vận hành câu lạc bộ trong hệ thống."
      />

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <CompactStatCard
          label="Đang hoạt động"
          value={loading ? "--" : String(clubAdmins.length)}
          icon={UserCog}
        />
        <CompactStatCard
          label="Email xác thực"
          value={
            loading
              ? "--"
              : String(clubAdmins.filter((user) => user.isEmailVerified).length)
          }
          icon={BadgeCheck}
          tone="green"
        />
        <CompactStatCard
          label="Kết quả lọc"
          value={loading ? "--" : String(visibleAdmins.length)}
          icon={Filter}
          tone="blue"
        />
      </div>

      <FilterBar
        placeholder="Tìm theo tên câu lạc bộ đang phụ trách..."
        value={search}
        onChange={setSearch}
        actions={
          <select
            className="input w-full sm:w-56"
            value={category}
            onChange={(event) =>
              setCategory(event.target.value as AdminClubCategory | "")
            }
          >
            {CLUB_CATEGORY_OPTIONS.map((item) => (
              <option key={item.value || "all"} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        }
      />

      {loading ? (
        <SectionCard title="Đang tải dữ liệu">
          <EmptyState
            title="Đang tải danh sách quản trị viên câu lạc bộ"
            description="Dữ liệu sẽ hiển thị ngay khi sẵn sàng."
          />
        </SectionCard>
      ) : (
        <AdminUsersTable
          users={visibleAdmins}
          detailBasePath="/system-admin/club-admins"
          onOpenStatus={setStatusUser}
        />
      )}

      {statusUser && (
        <UserStatusDialog
          user={statusUser}
          busy={updating}
          onClose={() => setStatusUser(null)}
          onConfirm={handleStatusUpdate}
        />
      )}
    </main>
  );
}
export function UserSecurityDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<AdminUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadUser() {
      if (!id) {
        setError("Thiếu mã người dùng.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const [usersResult, clubAdmins] = await Promise.all([
          adminApi.getUsers({ page: 1, pageSize: 200 }),
          adminApi.getClubAdmins(),
        ]);
        const merged = [...usersResult.items, ...clubAdmins];
        const found =
          merged.find((item) => item.id === id && item.status !== "Deleted") ??
          null;

        if (!ignore) {
          setUser(found);
          if (!found) {
            setError(
              "Không tìm thấy người dùng trong dữ liệu hiện tại hoặc tài khoản đã bị xóa.",
            );
          }
        }
      } catch (err) {
        if (!ignore) {
          setError(
            err instanceof Error ? err.message : "Không thể tải chi tiết người dùng.",
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadUser();

    return () => {
      ignore = true;
    };
  }, [id]);

  if (loading) {
    return (
      <main className="page-shell">
        <PageTitle title="Chi tiết người dùng" />
        <SectionCard title="Đang tải">
          <EmptyState title="Đang tải thông tin người dùng" />
        </SectionCard>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="page-shell">
        <PageTitle
          title="Không tìm thấy người dùng"
          actions={
            <button className="btn-secondary" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" />
              Quay lại
            </button>
          }
        />
        <SectionCard title="Thông báo">
          <EmptyState title={error || "Người dùng không tồn tại"} />
        </SectionCard>
      </main>
    );
  }

  const name = getAdminUserName(user);

  return (
    <main className="page-shell">
      <PageTitle
        eyebrow={getRoleLabel(user.role)}
        title={name}
        description={user.email}
        actions={
          <button className="btn-secondary" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </button>
        }
      />

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[.85fr_1.15fr]">
        <SectionCard title="Hồ sơ tài khoản">
          <div className="flex items-center gap-4">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={name}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <div className="grid h-16 w-16 place-items-center rounded-full bg-slate-900 text-lg font-bold text-white">
                {getInitials(name)}
              </div>
            )}
            <div>
              <h3 className="text-lg font-bold">{name}</h3>
              <p className="text-sm text-muted">{user.username}</p>
            </div>
          </div>
          <div className="mt-5 space-y-3 text-sm">
            {([
              ["Email", user.email, Mail],
              ["Số điện thoại", user.phone || "Chưa cập nhật", Phone],
              ["MSSV", user.studentCode || "Chưa cập nhật", BadgeCheck],
            ] satisfies Array<[string, string, typeof Mail]>).map(
              ([label, value, DetailIcon]) => {
              return (
                <div
                  key={label}
                  className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3"
                >
                  <span className="flex items-center gap-2 text-muted">
                    <DetailIcon className="h-4 w-4" />
                    {label}
                  </span>
                  <span className="min-w-0 truncate font-semibold">
                    {String(value)}
                  </span>
                </div>
              );
            })}
          </div>
        </SectionCard>

        <SectionCard title="Quyền và trạng thái">
          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <div className="rounded-xl border bg-slate-50 p-4">
              <div className="text-xs font-bold uppercase text-muted">
                Vai trò
              </div>
              <div className="mt-2">
                <AdminRoleBadge role={user.role} />
              </div>
            </div>
            <div className="rounded-xl border bg-slate-50 p-4">
              <div className="text-xs font-bold uppercase text-muted">
                Trạng thái
              </div>
              <div className="mt-2">
                <AdminStatusBadge status={user.status} />
              </div>
            </div>
            <div className="rounded-xl border bg-slate-50 p-4">
              <div className="text-xs font-bold uppercase text-muted">
                Email xác thực
              </div>
              <div className="mt-2 font-semibold text-ink">
                {user.isEmailVerified ? "Đã xác thực" : "Chưa xác thực"}
              </div>
            </div>
            <div className="rounded-xl border bg-slate-50 p-4">
              <div className="text-xs font-bold uppercase text-muted">
                Ngày tạo
              </div>
              <div className="mt-2 font-semibold text-ink">
                {formatAdminDate(user.createdAt)}
              </div>
            </div>
          </div>
        </SectionCard>
      </div>
    </main>
  );
}
export function SystemAuditLogPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [clubOptions, setClubOptions] = useState<AdminClubSummary[]>([]);
  const [clubId, setClubId] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadAuditLogs() {
      setLoading(true);
      setError("");

      try {
        const clubsResult = await adminApi.getClubs({
          page: 1,
          pageSize: 100,
        });
        const clubs = clubsResult.items.filter(
          (club) => club.status !== "Deleted",
        );
        const targetClubs = clubId
          ? clubs.filter((club) => club.id === clubId)
          : clubs;

        const auditResults = await Promise.allSettled(
          targetClubs.map((club) =>
            adminApi.getClubAuditLogs(club.id, { page: 1, pageSize: 50 }),
          ),
        );
        const mergedLogs = auditResults
          .flatMap((result) =>
            result.status === "fulfilled" ? result.value.items : [],
          )
          .sort(
            (first, second) =>
              new Date(second.createdAt).getTime() -
              new Date(first.createdAt).getTime(),
          );

        if (!ignore) {
          setClubOptions(clubs);
          setLogs(mergedLogs);
        }
      } catch (err) {
        if (!ignore) {
          setError(
            err instanceof Error
              ? err.message
              : "Không thể tải nhật ký hệ thống.",
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadAuditLogs();

    return () => {
      ignore = true;
    };
  }, [clubId]);

  const clubNameById = useMemo(
    () => new Map(clubOptions.map((club) => [club.id, club.name])),
    [clubOptions],
  );
  const filteredLogs = useMemo(
    () =>
      logs.filter((log) =>
        auditMatchesSearch(
          log,
          log.clubId ? (clubNameById.get(log.clubId) ?? "") : "",
          search,
        ),
      ),
    [clubNameById, logs, search],
  );
  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / 20));
  const pageLogs = filteredLogs.slice((page - 1) * 20, page * 20);

  useEffect(() => {
    setPage(1);
  }, [clubId, search]);

  return (
    <main className="page-shell">
      <PageTitle
        title="Nhật ký hệ thống"
        description="Theo dõi các thao tác được ghi nhận trong từng câu lạc bộ như nộp hồ sơ, duyệt thành viên, tạo sự kiện và điểm danh."
      />
      <FilterBar
        placeholder="Tìm theo CLB, người thực hiện, thao tác..."
        value={search}
        onChange={setSearch}
        actions={
          <select
            className="input w-full sm:w-64"
            value={clubId}
            onChange={(event) => setClubId(event.target.value)}
          >
            <option value="">Tất cả câu lạc bộ</option>
            {clubOptions.map((club) => (
              <option key={club.id} value={club.id}>
                {club.name}
              </option>
            ))}
          </select>
        }
      />

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <SectionCard title="Đang tải dữ liệu">
          <EmptyState
            title="Đang tải nhật ký hệ thống"
            description="Dữ liệu sẽ hiển thị ngay khi sẵn sàng."
          />
        </SectionCard>
      ) : filteredLogs.length === 0 ? (
        <EmptyState
          title="Chưa có nhật ký phù hợp"
          description="Thử đổi câu lạc bộ hoặc từ khóa tìm kiếm."
        />
      ) : (
        <>
          <section className="card overflow-hidden">
            <DataTable
              columns={[
                "Thời gian",
                "Câu lạc bộ",
                "Người thực hiện",
                "Đối tượng",
                "Thao tác",
                "Mô tả",
              ]}
              rows={pageLogs.map((log) => [
                formatAdminDateTime(log.createdAt),
                log.clubId ? (clubNameById.get(log.clubId) ?? "Không rõ") : "Không rõ",
                log.performedByName || "Hệ thống",
                getAuditEntityLabel(log.entityType),
                <StatusBadge status={getAuditActionLabel(log.action)} />,
                <div className="min-w-[240px] text-sm text-muted">
                  {log.description || "Không có mô tả"}
                </div>,
              ])}
            />
          </section>
          <div className="mt-5 flex flex-col gap-3 rounded-xl border bg-white px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
            <span className="text-muted">
              Trang {page}/{totalPages} · {filteredLogs.length} nhật ký
            </span>
            <div className="flex gap-2">
              <button
                className="btn-secondary"
                disabled={page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                Trước
              </button>
              <button
                className="btn-secondary"
                disabled={page >= totalPages}
                onClick={() =>
                  setPage((current) => Math.min(totalPages, current + 1))
                }
              >
                Sau
              </button>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
export function PlatformStatisticsPage() {
  return (
    <main className="page-shell">
      <PageTitle
        title="Thống kê nền tảng"
        actions={
          <button className="btn-secondary">
            <Download className="h-4 w-4" />
            Xuất báo cáo
          </button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Người dùng" value="24,582" icon={Users} />
        <StatCard label="CLB" value="156" icon={FileCheck2} tone="blue" />
        <StatCard
          label="Sự kiện"
          value="1,240"
          icon={CalendarDays}
          tone="green"
        />
        <StatCard
          label="Tương tác"
          value="89.4%"
          icon={TrendingUp}
          tone="slate"
        />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <SectionCard title="Tăng trưởng CLB & thành viên">
          <div className="h-72 rounded-2xl bg-gradient-to-br from-primary-soft to-sky-100" />
        </SectionCard>
        <SectionCard title="Hệ thống xử lý hồ sơ">
          <div className="h-72 rounded-2xl bg-gradient-to-br from-emerald-100 to-primary-soft" />
        </SectionCard>
      </div>
    </main>
  );
}
export function SystemSettingsPage() {
  return (
    <main className="page-shell">
      <PageTitle title="Cài đặt hệ thống" />
      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Thông báo toàn hệ thống">
          <textarea
            className="input h-32 py-3"
            placeholder="Nhập nội dung thông báo..."
          />
          <button className="btn-primary mt-4">
            <Send className="h-4 w-4" />
            Gửi thông báo
          </button>
        </SectionCard>
        <SectionCard title="Quy tắc phê duyệt">
          <label>
            <span className="label">Điểm khuyến nghị phê duyệt</span>
            <input className="input" defaultValue="8.5" />
          </label>
        </SectionCard>
      </div>
    </main>
  );
}
