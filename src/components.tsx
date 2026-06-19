import type { ComponentType, ReactNode } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  FileChartColumn,
  Gauge,
  Home,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  Menu,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
  X,
  UserRound,
  Star,
  PlusCircle,
  ListChecks,
  History,
  BarChart3,
  MessageSquare,
  Trophy,
  ScanLine,
  Building2,
} from "lucide-react";
import { useState } from "react";
import { authApi } from "./api/authApi";
import { clearAuthSession } from "./api/authStorage";
export const images = {
  campus:
    "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1600&q=80",
  students:
    "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1400&q=80",
  code: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
  meeting:
    "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1200&q=80",
};
export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      to="/"
      className="flex items-center gap-2.5 font-extrabold tracking-tight text-ink"
    >
      <span
        className="flex h-10 w-12 items-center gap-0.5 overflow-hidden rounded-xl bg-white p-1 shadow-sm ring-1 ring-slate-200"
        aria-hidden="true"
      >
        <span className="h-full flex-1 rounded-bl-lg rounded-tl-2xl bg-fpt-blue" />
        <span className="h-full flex-1 -skew-x-6 bg-fpt-orange" />
        <span className="h-full flex-1 rounded-br-2xl rounded-tr-lg bg-fpt-green" />
      </span>
      {!compact && <span className="text-xl text-primary">ClubHub</span>}
    </Link>
  );
}

function LogoutButton({
  compact = false,
  className = "",
}: {
  compact?: boolean;
  className?: string;
}) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Error occurred while logging out:", error);
    } finally {
      clearAuthSession();
      sessionStorage.clear();
      navigate("/login", { replace: true });
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className={`btn-ghost text-red-600 hover:bg-red-50 hover:text-red-700 ${className}`}
      title="Đăng xuất"
      aria-label="Đăng xuất"
    >
      <LogOut className="h-5 w-5" />
      {!compact && <span>Đăng xuất</span>}
    </button>
  );
}

function MobilePanel({
  open,
  onClose,
  children,
  panelClassName = "bg-white",
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  panelClassName?: string;
}) {
  if (!open) return null;
  return (
    <>
      <button
        className="fixed inset-0 z-40 bg-slate-950/30 lg:hidden"
        onClick={onClose}
      />
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 p-5 shadow-lift lg:hidden ${panelClassName}`}
      >
        {children}
      </div>
    </>
  );
}
const publicLinks = [
  ["/", "Trang chủ"],
  ["/clubs", "Khám phá CLB"],
  ["/events", "Sự kiện"],
  ["/style-guide", "Style Guide"],
];
export function PublicHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Brand />
        <nav className="hidden items-center gap-7 md:flex">
          {publicLinks.map(([to, label]) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `text-sm font-semibold ${isActive ? "text-primary" : "text-slate-600 hover:text-ink"}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <Link to="/login" className="btn-ghost">
            Đăng nhập
          </Link>
          <Link to="/register" className="btn-primary">
            Tạo tài khoản
          </Link>
        </div>
        <button
          className="btn-ghost md:hidden"
          onClick={() => setOpen(true)}
          aria-label="Mở menu"
        >
          <Menu />
        </button>
      </div>
      <MobilePanel open={open} onClose={() => setOpen(false)}>
        <div className="mb-6 flex items-center justify-between">
          <Brand />
          <button className="btn-ghost" onClick={() => setOpen(false)}>
            <X />
          </button>
        </div>
        {publicLinks.map(([to, label]) => (
          <Link
            key={to}
            to={to}
            onClick={() => setOpen(false)}
            className="block rounded-xl px-4 py-3 font-semibold hover:bg-primary-soft"
          >
            {label}
          </Link>
        ))}
        <Link to="/login" className="btn-primary mt-4 w-full">
          Đăng nhập
        </Link>
      </MobilePanel>
    </header>
  );
}
export function PublicLayout() {
  return (
    <>
      <PublicHeader />
      <Outlet />
      <Footer />
    </>
  );
}
export function Footer() {
  return (
    <footer className="mt-auto border-t bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <Brand />
          <p className="mt-4 max-w-sm text-sm leading-6 text-muted">
            Nền tảng quản lý câu lạc bộ sinh viên toàn diện, hiện đại và tin
            cậy.
          </p>
        </div>
        <div>
          <h3 className="font-bold">Nền tảng</h3>
          <div className="mt-3 grid gap-2 text-sm text-muted">
            <Link to="/clubs">Khám phá CLB</Link>
            <Link to="/events">Lịch sự kiện</Link>
            <Link to="/system-states">Trạng thái UI</Link>
          </div>
        </div>
        <div>
          <h3 className="font-bold">Workspace</h3>
          <div className="mt-3 grid gap-2 text-sm text-muted">
            <Link to="/dashboard">Sinh viên</Link>
            <Link to="/club-admin">Club Admin</Link>
            <Link to="/system-admin">System Admin</Link>
            <span>© 2026 ClubHub University</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
const studentNav = [
  ["/dashboard", "Tổng quan", LayoutDashboard],
  ["/my-clubs", "Câu lạc bộ", Users],
  ["/my-events", "Sự kiện", CalendarDays],
  ["/club-proposals", "Đề xuất CLB", ClipboardCheck],
  ["/activity/points", "Điểm", Trophy],
  ["/notifications", "Thông báo", Bell],
  ["/account/security", "Bảo mật", LockKeyhole],
] as const;
export function StudentLayout() {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-5 px-4 sm:px-6 lg:px-8">
          <button className="btn-ghost md:hidden" onClick={() => setOpen(true)}>
            <Menu />
          </button>
          <Brand />
          <nav className="hidden gap-5 md:flex">
            {studentNav.slice(0, 5).map(([to, label]) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `text-sm font-semibold ${isActive ? "text-primary" : "text-slate-600"}`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto hidden items-center gap-2 rounded-xl bg-slate-100 px-3 sm:flex">
            <Search className="h-4 w-4 text-muted" />
            <input
              className="h-10 bg-transparent text-sm outline-none"
              placeholder="Tìm kiếm CLB, sự kiện..."
            />
          </div>
          <Link to="/notifications" className="btn-ghost">
            <Bell className="h-5 w-5" />
          </Link>
          <LogoutButton compact />
          <Link
            to="/profile"
            className="grid h-10 w-10 place-items-center rounded-full bg-white/15 font-bold text-white"
          >
            MH
          </Link>
        </div>
      </header>
      <MobilePanel open={open} onClose={() => setOpen(false)}>
        <div className="mb-6 flex items-center justify-between">
          <Brand />
          <button className="btn-ghost" onClick={() => setOpen(false)}>
            <X />
          </button>
        </div>
        {studentNav.map(([to, label, Icon]) => (
          <Link
            key={to}
            to={to}
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-xl px-4 py-3 font-semibold hover:bg-primary-soft"
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        ))}
        <div className="mt-6 border-t pt-4">
          <LogoutButton className="w-full justify-start" />
        </div>
      </MobilePanel>
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
type NavItem = readonly [
  string,
  string,
  ComponentType<{
    className?: string;
  }>,
];
const clubAdminNav: NavItem[] = [
  ["/club-admin", "Dashboard", LayoutDashboard],
  ["/club-admin/members", "Thành viên", Users],
  ["/club-admin/join-requests", "Yêu cầu tham gia", ListChecks],
  ["/club-admin/events", "Sự kiện", CalendarDays],
  ["/club-admin/check-in", "Check-in", ScanLine],
  ["/club-admin/feedback", "Feedback", MessageSquare],
  ["/club-admin/points", "Điểm", Trophy],
  ["/club-admin/statistics", "Thống kê", BarChart3],
  ["/club-admin/audit-log", "Nhật ký", History],
  ["/club-admin/settings", "Cài đặt", Settings],
];
const systemAdminNav: NavItem[] = [
  ["/system-admin", "Dashboard", LayoutDashboard],
  ["/system-admin/proposals", "Phê duyệt CLB", ClipboardCheck],
  ["/system-admin/clubs", "Quản lý CLB", Building2],
  ["/system-admin/users", "Người dùng", Users],
  ["/system-admin/statistics", "Báo cáo", FileChartColumn],
  ["/system-admin/audit-log", "Nhật ký hệ thống", History],
  ["/system-admin/settings", "Cài đặt", Settings],
];
export function AdminLayout({ system = false }: { system?: boolean }) {
  const [open, setOpen] = useState(false);
  const nav = system ? systemAdminNav : clubAdminNav;
  const sidebar = (
    <>
      <div className="flex items-center justify-between">
        <Brand />
        <button className="btn-ghost lg:hidden" onClick={() => setOpen(false)}>
          <X />
        </button>
      </div>
      <div className="mt-3 text-sm text-white/80">
        {system ? "SYSTEM_ADMIN workspace" : "CLUB_ADMIN workspace"}
      </div>
      <nav className="mt-8 grid gap-2">
        {nav.map(([to, label, Icon]) => (
          <NavLink
            key={to}
            to={to}
            end={to === (system ? "/system-admin" : "/club-admin")}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 font-semibold transition ${isActive ? "bg-white text-primary-dark shadow-sm" : "text-white/90 hover:bg-white/15 hover:text-white"}`
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto border-t border-white/20 pt-5">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-white/15 font-bold text-white">
            {system ? "SA" : "CA"}
          </div>
          <div>
            <div className="font-bold text-white">
              {system ? "System Admin" : "Club Admin"}
            </div>
            <div className="text-xs text-white/75">
              {system ? "Toàn hệ thống" : "CLB Guitar"}
            </div>
          </div>
          <LogoutButton
            compact
            className="ml-auto !text-white hover:!bg-white/15 hover:!text-white"
          />
        </div>
      </div>
    </>
  );
  return (
    <div className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-[280px_1fr]">
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-primary-dark bg-primary-dark p-5 text-white lg:flex [&_.text-primary]:!text-white">
        {sidebar}
      </aside>
      <MobilePanel
        open={open}
        onClose={() => setOpen(false)}
        panelClassName="bg-primary-dark text-white [&_.text-primary]:!text-white"
      >
        {sidebar}
      </MobilePanel>
      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-white/95 px-4 backdrop-blur sm:px-6">
          <button className="btn-ghost lg:hidden" onClick={() => setOpen(true)}>
            <Menu />
          </button>
          <div className="hidden items-center gap-2 rounded-xl bg-slate-100 px-3 sm:flex">
            <Search className="h-4 w-4 text-muted" />
            <input
              className="h-10 bg-transparent text-sm outline-none"
              placeholder="Tìm kiếm nhanh..."
            />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button className="btn-ghost">
              <Bell className="h-5 w-5" />
            </button>
            {!system && (
              <Link to="/club-admin/events/new" className="btn-primary">
                <PlusCircle className="h-4 w-4" />
                Tạo sự kiện
              </Link>
            )}
          </div>
        </header>
        <Outlet />
      </div>
    </div>
  );
}
export function AuthShell({
  children,
  headline = "Kết nối sinh viên, vươn tầm CLB.",
}: {
  children: ReactNode;
  headline?: string;
}) {
  return (
    <main className="hero-grid grid min-h-screen bg-white lg:grid-cols-[1.1fr_.9fr]">
      <section className="flex flex-col px-5 py-6 sm:px-10 lg:px-16">
        <Brand />
        <div className="mx-auto flex w-full max-w-xl flex-1 items-center py-10">
          {children}
        </div>
      </section>
      <aside className="relative hidden min-h-screen items-center overflow-hidden bg-ink p-12 lg:flex xl:p-16">
        <img
          src={images.students}
          alt="Sinh viên ClubHub kết nối trong khuôn viên trường"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/85 via-ink/70 to-fpt-blue/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-white/10" />
        <div className="relative z-10 w-full max-w-2xl">
          <div className="mb-8 h-1.5 w-24 rounded-full bg-white" />
          <h2 className="max-w-xl text-6xl font-extrabold leading-[1.05] tracking-tight text-white">
            {headline}
          </h2>
          <p className="mt-8 max-w-lg text-lg leading-8 text-white/85">
            Một không gian thống nhất để sinh viên khám phá, tham gia và quản lý
            hoạt động câu lạc bộ.
          </p>
          <div className="mt-10 grid max-w-lg grid-cols-3 gap-3">
            <div className="rounded-2xl bg-white/95 p-4 text-center shadow-card backdrop-blur">
              <div className="text-lg font-extrabold text-primary">5.000+</div>
              <div className="text-xs font-semibold text-muted">Sinh viên</div>
            </div>
            <div className="rounded-2xl bg-white/95 p-4 text-center shadow-card backdrop-blur">
              <div className="text-lg font-extrabold text-fpt-blue">120+</div>
              <div className="text-xs font-semibold text-muted">CLB</div>
            </div>
            <div className="rounded-2xl bg-white/95 p-4 text-center shadow-card backdrop-blur">
              <div className="text-lg font-extrabold text-fpt-green">300+</div>
              <div className="text-xs font-semibold text-muted">
                Sự kiện/năm
              </div>
            </div>
          </div>
        </div>
      </aside>
    </main>
  );
}
export function PageTitle({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl text-muted">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </div>
  );
}
export function StatCard({
  label,
  value,
  meta,
  icon: Icon,
  tone = "primary",
}: {
  label: string;
  value: string;
  meta?: string;
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
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div
          className={`grid h-11 w-11 place-items-center rounded-xl ${tones[tone]}`}
        >
          <Icon className="h-5 w-5" />
        </div>
        {meta && (
          <span className="text-xs font-bold text-fpt-green-dark">{meta}</span>
        )}
      </div>
      <div className="mt-5 text-sm font-medium text-muted">{label}</div>
      <div className="mt-1 text-3xl font-extrabold tracking-tight">{value}</div>
    </div>
  );
}
export function SectionCard({
  title,
  action,
  children,
  className = "",
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`card ${className}`}>
      <header className="flex items-center justify-between border-b px-5 py-4">
        <h2 className="text-lg font-bold">{title}</h2>
        {action}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}
export function EmptyState({
  title = "Chưa có dữ liệu",
  description = "Dữ liệu sẽ xuất hiện tại đây khi có cập nhật mới.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="grid min-h-52 place-items-center rounded-2xl border border-dashed bg-slate-50 p-8 text-center">
      <div>
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary-soft text-primary">
          <Sparkles />
        </div>
        <h3 className="mt-4 font-bold">{title}</h3>
        <p className="mt-1 text-sm text-muted">{description}</p>
      </div>
    </div>
  );
}
export function StatusBadge({ status }: { status: string }) {
  const s = status.toUpperCase();
  const cls =
    s.includes("ACTIVE") || s.includes("APPROVED") || s.includes("SUCCESS")
      ? "status-active"
      : s.includes("PENDING") || s.includes("DRAFT") || s.includes("CHỜ")
        ? "status-pending"
        : s.includes("REJECT") || s.includes("LOCK") || s.includes("CANCEL")
          ? "status-danger"
          : "status-info";
  return <span className={cls}>{status}</span>;
}
export function DataTable({
  columns,
  rows,
}: {
  columns: string[];
  rows: ReactNode[][];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="bg-slate-100 text-xs uppercase text-muted">
          <tr>
            {columns.map((c) => (
              <th key={c} className="px-5 py-4">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t hover:bg-primary-soft/50">
              {row.map((cell, j) => (
                <td key={j} className="px-5 py-4">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export function FilterBar({
  placeholder = "Tìm kiếm...",
  actions,
}: {
  placeholder?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-xl border bg-white px-3 sm:max-w-md">
        <Search className="h-4 w-4 text-muted" />
        <input
          className="w-full bg-transparent text-sm outline-none"
          placeholder={placeholder}
        />
      </div>
      <div className="flex flex-wrap gap-2">{actions}</div>
    </div>
  );
}
export {
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  FileChartColumn,
  Gauge,
  Home,
  LayoutDashboard,
  LockKeyhole,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
  UserRound,
  Star,
  PlusCircle,
  ListChecks,
  History,
  BarChart3,
  MessageSquare,
  Trophy,
  ScanLine,
  Building2,
};
