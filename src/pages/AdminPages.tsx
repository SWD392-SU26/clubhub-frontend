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
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { membershipApi } from "../api/membershipApi";
import { getPrimaryAdminMembership } from "../clubPermissions";
import { auditLogs, clubs, events, members, proposals, users } from "../data";
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
export function SystemAdminDashboard() {
  const profile = useCurrentProfile();
  const displayName = getProfileDisplayName(profile);

  return (
    <main className="page-shell">
      <PageTitle
        eyebrow="SYSTEM_ADMIN"
        title={`Chào ${displayName}!`}
        description="Quản lý toàn bộ nền tảng ClubHub."
        actions={
          <Link to="/system-admin/proposals" className="btn-primary">
            Xem đề xuất mới
          </Link>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Tổng CLB" value="158" icon={FileCheck2} />
        <StatCard label="Người dùng" value="12,450" icon={Users} tone="blue" />
        <StatCard
          label="Lượt tham gia"
          value="32,890"
          icon={TrendingUp}
          tone="green"
        />
        <StatCard label="Cần chú ý" value="24" icon={Filter} tone="red" />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_.8fr]">
        <SectionCard title="Đề xuất CLB mới">
          <DataTable
            columns={["Tên CLB", "Chủ quản", "Ngày gửi", "Thao tác"]}
            rows={proposals.map((p) => [
              p.name,
              p.founder,
              p.date,
              <Link
                className="btn-ghost"
                to={`/system-admin/proposals/${p.id}`}
              >
                Xem
              </Link>,
            ])}
          />
        </SectionCard>
        <SectionCard title="Mục cần chú ý">
          <EmptyState
            title="Không có cảnh báo nghiêm trọng"
            description="Các hạng mục rủi ro sẽ hiển thị ở đây."
          />
        </SectionCard>
      </div>
    </main>
  );
}
export function SystemProposalsPage() {
  return (
    <main className="page-shell">
      <PageTitle title="Phê duyệt Đề xuất Câu lạc bộ" />
      <FilterBar
        placeholder="Tên CLB, tên người sáng lập..."
        actions={
          <button className="btn-secondary">
            <Filter className="h-4 w-4" />
            Bộ lọc
          </button>
        }
      />
      <section className="card overflow-hidden">
        <DataTable
          columns={[
            "Tên đề xuất",
            "Người sáng lập",
            "Ngày gửi",
            "Điểm",
            "Trạng thái",
            "Thao tác",
          ]}
          rows={proposals.map((p) => [
            p.name,
            p.founder,
            p.date,
            p.score,
            <StatusBadge status={p.status} />,
            <Link className="btn-ghost" to={`/system-admin/proposals/${p.id}`}>
              Xử lý
            </Link>,
          ])}
        />
      </section>
    </main>
  );
}
export function ProposalReviewPage() {
  const p = proposals[0];
  return (
    <main className="page-shell">
      <PageTitle
        title={`Đề án: ${p.name}`}
        description={`${p.founder} · ${p.faculty}`}
        actions={
          <>
            <button className="btn-secondary">
              <Edit3 className="h-4 w-4" />
              Yêu cầu chỉnh sửa
            </button>
            <button className="btn-ghost text-red-600">
              <XCircle className="h-4 w-4" />
              Từ chối
            </button>
            <button className="btn-primary">
              <CheckCircle2 className="h-4 w-4" />
              Phê duyệt đề án
            </button>
          </>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[1.3fr_.8fr]">
        <SectionCard title="Thông tin tổng quan">
          <p className="leading-7 text-muted">
            Hồ sơ gồm mô tả CLB, lý do thành lập, kế hoạch hoạt động, người sáng
            lập và tài liệu đính kèm.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              ["Tên đề xuất", p.name],
              ["Người sáng lập", p.founder],
              ["Khoa/đơn vị", p.faculty],
              ["Ngày gửi", p.date],
              ["Trạng thái", p.status],
              ["Điểm đánh giá", `${p.score}/10`],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border bg-slate-50 p-4">
                <div className="text-xs font-bold uppercase text-muted">
                  {label}
                </div>
                <div className="mt-1 font-semibold text-ink">{value}</div>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-xl border p-4">
            <FileCheck2 className="inline text-primary" />{" "}
            Ke_hoach_hoat_dong_2026.pdf
          </div>
          <label className="mt-5 block">
            <span className="label">Ghi chú thẩm định</span>
            <textarea
              className="input h-28 py-3"
              defaultValue="Đề án có mục tiêu rõ, cần bổ sung kế hoạch nhân sự ban điều hành trong 6 tháng đầu."
            />
          </label>
        </SectionCard>
        <SectionCard title="Lịch sử thẩm định">
          {[
            "Hệ thống chấm điểm hồ sơ 8.7",
            "Khoa chủ quản đã xác nhận",
            "Chờ SYSTEM_ADMIN quyết định",
          ].map((x) => (
            <div key={x} className="mb-3 rounded-xl bg-slate-50 p-3 text-sm">
              {x}
            </div>
          ))}
          <div className="mt-5 rounded-2xl bg-primary-soft p-4">
            <div className="text-sm font-bold text-primary-dark">
              Checklist trước khi duyệt
            </div>
            {[
              "Thông tin người sáng lập hợp lệ",
              "Tên CLB không trùng lặp",
              "Có kế hoạch hoạt động tối thiểu 1 học kỳ",
              "Có giảng viên/đơn vị hỗ trợ",
            ].map((item) => (
              <div key={item} className="mt-3 flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-fpt-green-dark" />
                {item}
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </main>
  );
}
export function SystemClubsPage() {
  return (
    <main className="page-shell">
      <PageTitle
        title="Quản lý Câu lạc bộ"
        actions={
          <Link to="/system-admin/clubs/new" className="btn-primary">
            <PlusCircle className="h-4 w-4" />
            Create Official Club
          </Link>
        }
      />
      <FilterBar placeholder="Tìm kiếm tên CLB, Admin..." />
      <section className="card overflow-hidden">
        <DataTable
          columns={[
            "Club Name",
            "Category",
            "Assigned Admin",
            "Members",
            "Status",
            "Actions",
          ]}
          rows={clubs.map((c) => [
            c.name,
            c.category,
            c.admin,
            c.members,
            <StatusBadge status={c.status} />,
            <Link to={`/system-admin/clubs/${c.id}`} className="btn-ghost">
              Chi tiết
            </Link>,
          ])}
        />
      </section>
    </main>
  );
}
export function OfficialClubCreatePage() {
  return (
    <main className="page-shell max-w-5xl">
      <PageTitle title="Tạo Câu Lạc Bộ Chính Thức" />
      <section className="card grid gap-5 p-6 sm:grid-cols-2">
        <label>
          <span className="label">Tên Câu Lạc Bộ *</span>
          <input className="input" placeholder="CLB Sách và Những người bạn" />
        </label>
        <label>
          <span className="label">Danh mục *</span>
          <select className="input">
            <option>Học thuật</option>
            <option>Công nghệ</option>
          </select>
        </label>
        <label className="sm:col-span-2">
          <span className="label">Gán CLUB_ADMIN *</span>
          <input className="input" placeholder="Tìm theo tên hoặc MSSV..." />
        </label>
        <label className="sm:col-span-2">
          <span className="label">Mô tả tóm tắt</span>
          <textarea className="input h-32 py-3" />
        </label>
        <div className="sm:col-span-2 flex justify-end gap-2">
          <button className="btn-secondary">Hủy bỏ</button>
          <button className="btn-primary">Khởi tạo CLB ngay</button>
        </div>
      </section>
    </main>
  );
}
export function SystemClubDetailPage() {
  const c = clubs[0];
  return (
    <main className="page-shell">
      <PageTitle
        title={c.name}
        description="Chi tiết quản trị CLB, trạng thái, admin phụ trách và lịch sử quản trị."
        actions={
          <>
            <button className="btn-secondary">
              <Eye className="h-4 w-4" />
              Ẩn CLB
            </button>
            <button className="btn-secondary">
              <Archive className="h-4 w-4" />
              Lưu trữ
            </button>
            <button className="btn-ghost text-red-600">
              <Lock className="h-4 w-4" />
              Khóa
            </button>
          </>
        }
      />
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <StatCard
          label="Thành viên"
          value={String(c.members)}
          icon={Users}
          tone="primary"
        />
        <StatCard
          label="Sự kiện đã tạo"
          value="24"
          meta="+6 kỳ này"
          icon={CalendarDays}
          tone="blue"
        />
        <StatCard label="Điểm hoạt động" value="8.9" icon={Star} tone="green" />
        <StatCard label="Cảnh báo" value="0" icon={ShieldCheck} tone="slate" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[.8fr_1.4fr]">
        <SectionCard title="CLUB_ADMIN phụ trách">
          <h3 className="font-bold">{c.admin}</h3>
          <p className="text-muted">Đang quản lý {c.name}</p>
          <div className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between rounded-xl bg-slate-50 p-3">
              <span className="text-muted">Email</span>
              <span className="font-semibold">admin.clubhub@fpt.edu.vn</span>
            </div>
            <div className="flex justify-between rounded-xl bg-slate-50 p-3">
              <span className="text-muted">Phân loại</span>
              <span className="font-semibold">{c.category}</span>
            </div>
            <div className="flex justify-between rounded-xl bg-slate-50 p-3">
              <span className="text-muted">Trạng thái</span>
              <StatusBadge status={c.status} />
            </div>
          </div>
          <div className="mt-5 grid gap-2">
            <button className="btn-secondary justify-center">
              Đổi CLUB_ADMIN phụ trách
            </button>
            <button className="btn-ghost justify-center text-red-600">
              Tạm khóa quyền quản trị
            </button>
          </div>
        </SectionCard>
        <SectionCard title="Lịch sử quản trị">
          <DataTable
            columns={["Thời gian", "Tác nhân", "Hành động", "Trạng thái"]}
            rows={auditLogs.map(([time, actor, text, status]) => [
              time,
              actor,
              text,
              <StatusBadge status={status} />,
            ])}
          />
        </SectionCard>
      </div>
      <section className="mt-6 grid gap-4 md:grid-cols-3">
        {[
          ["Hồ sơ công khai", "Đang hiển thị trên trang khám phá CLB."],
          ["Kiểm duyệt nội dung", "Không có mô tả hoặc ảnh cần xử lý."],
          [
            "Sẵn sàng backend",
            "Các action có thể map API lock, archive, update admin.",
          ],
        ].map(([title, text]) => (
          <div key={title} className="card p-5">
            <div className="font-extrabold text-ink">{title}</div>
            <p className="mt-2 text-sm leading-6 text-muted">{text}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
export function UsersManagementPage() {
  return (
    <main className="page-shell">
      <PageTitle title="Quản lý người dùng" />
      <FilterBar placeholder="Tìm kiếm người dùng..." />
      <section className="card overflow-hidden">
        <DataTable
          columns={[
            "Người dùng",
            "Email",
            "Global Role",
            "CLB",
            "Trạng thái",
            "Thao tác",
          ]}
          rows={users.map((u) => [
            u.name,
            u.email,
            u.role,
            u.clubs,
            <StatusBadge status={u.status} />,
            <Link to={`/system-admin/users/${u.id}`} className="btn-ghost">
              Chi tiết
            </Link>,
          ])}
        />
      </section>
    </main>
  );
}
export function UserSecurityDetailPage() {
  const u = users[0];
  return (
    <main className="page-shell">
      <PageTitle
        title="Chi tiết người dùng"
        description={`${u.name} · ${u.email}`}
        actions={
          <>
            <button className="btn-secondary">Xuất log hoạt động</button>
            <button className="btn-primary">Chỉnh sửa Profile</button>
          </>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[.8fr_1.4fr]">
        <SectionCard title="Bảo mật & Quyền hạn">
          <button className="btn-secondary mb-3 w-full">
            Nâng cấp CLUB_ADMIN
          </button>
          <button className="btn-secondary mb-3 w-full">
            Hạ quyền xuống STUDENT
          </button>
          <button className="btn-primary w-full bg-red-600 hover:bg-red-700">
            Khóa tài khoản
          </button>
        </SectionCard>
        <SectionCard title="CLB quản lý / thành viên tại">
          <DataTable
            columns={["Tên CLB", "Vai trò", "Trạng thái"]}
            rows={clubs
              .slice(0, 3)
              .map((c) => [
                c.name,
                c.admin === u.name ? "CLUB_ADMIN" : "MEMBER",
                <StatusBadge status={c.status} />,
              ])}
          />
        </SectionCard>
      </div>
    </main>
  );
}
export function SystemAuditLogPage() {
  return (
    <main className="page-shell">
      <PageTitle title="Nhật ký Kiểm toán Hệ thống" />
      <FilterBar placeholder="Tìm kiếm log..." />
      <section className="card overflow-hidden">
        <DataTable
          columns={["Thời gian", "Actor", "Action", "Status"]}
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
