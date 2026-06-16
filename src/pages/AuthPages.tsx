import { FormEvent, useState } from "react";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { AuthShell, Brand } from "../components";
const TEST_ACCOUNTS = [
  {
    email: "student@test.com",
    password: "123456",
    role: "student",
    label: "Sinh viên",
    redirect: "/dashboard",
  },
  {
    email: "clubadmin@test.com",
    password: "123456",
    role: "club_admin",
    label: "Quản trị CLB",
    redirect: "/club-admin",
  },
  {
    email: "systemadmin@test.com",
    password: "123456",
    role: "system_admin",
    label: "Quản trị hệ thống",
    redirect: "/system-admin",
  },
];
function Field({
  label,
  type = "text",
  placeholder,
  icon: Icon,
  value,
  onChange,
}: {
  label: string;
  type?: string;
  placeholder: string;
  icon: typeof Mail;
  value: string;
  onChange: (v: string) => void;
}) {
  const [show, setShow] = useState(false);
  const password = type === "password";
  return (
    <label className="block">
      <span className="label">{label}</span>
      <span className="relative block">
        <Icon className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
        <input
          className="input pl-12 pr-11"
          type={password ? (show ? "text" : "password") : type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {password && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-3 top-2.5 btn-ghost min-h-0 p-1.5"
          >
            {show ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        )}
      </span>
    </label>
  );
}
export function LoginPage({ compact = false }: { compact?: boolean }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const acc = TEST_ACCOUNTS.find(
      (a) => a.email === email.trim() && a.password === password,
    );
    if (!acc) {
      setError(
        "Email hoặc mật khẩu không đúng. Hãy chọn tài khoản test bên dưới.",
      );
      return;
    }
    setLoading(true);
    setTimeout(() => navigate(acc.redirect), 350);
  };
  const form = (
    <div className="w-full">
      <div className="mb-8 text-center lg:text-left">
        <div className="lg:hidden">
          <Brand />
        </div>
        <h1 className="mt-6 text-3xl font-extrabold">Chào mừng bạn trở lại</h1>
        <p className="mt-2 text-muted">
          Đăng nhập để tiếp tục hành trình cùng cộng đồng CLB.
        </p>
      </div>
      <div className="mb-4 rounded-2xl border border-dashed border-primary/40 bg-primary-soft p-4">
        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-primary">
          Tài khoản test UI
        </p>
        <div className="grid gap-2 sm:grid-cols-3">
          {TEST_ACCOUNTS.map((acc) => (
            <button
              key={acc.role}
              type="button"
              onClick={() => {
                setEmail(acc.email);
                setPassword(acc.password);
                setError("");
              }}
              className="rounded-xl border border-primary/20 bg-white px-3 py-2.5 text-left text-xs transition hover:border-primary hover:bg-primary-soft"
            >
              <div className="font-bold text-ink">{acc.label}</div>
              <div className="mt-0.5 text-muted">{acc.email}</div>
            </button>
          ))}
        </div>
        <p className="mt-2.5 text-xs text-muted">
          Mật khẩu tất cả:{" "}
          <span className="font-mono font-bold text-ink">123456</span>
        </p>
      </div>
      <form onSubmit={submit} className="card space-y-5 p-6 sm:p-8">
        <Field
          label="Email hoặc MSSV"
          placeholder="sv2026@university.edu.vn"
          icon={Mail}
          value={email}
          onChange={setEmail}
        />
        <Field
          label="Mật khẩu"
          type="password"
          placeholder="Nhập mật khẩu"
          icon={KeyRound}
          value={password}
          onChange={setPassword}
        />
        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {error}
          </p>
        )}
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="rounded text-primary focus:ring-primary"
            />
            Duy trì đăng nhập
          </label>
          <Link to="/forgot-password" className="font-semibold text-primary">
            Quên mật khẩu?
          </Link>
        </div>
        <button disabled={loading} className="btn-primary w-full">
          {loading ? "Đang đăng nhập..." : "Đăng nhập ngay"}
        </button>
        <button type="button" className="btn-secondary w-full">
          Đăng nhập với Google
        </button>
      </form>
      <p className="mt-6 text-center text-sm">
        Bạn chưa có tài khoản?{" "}
        <Link to="/register" className="font-bold text-primary">
          Đăng ký ngay
        </Link>
      </p>
    </div>
  );
  return compact ? (
    <main className="hero-grid grid min-h-screen place-items-center p-5">
      {form}
    </main>
  ) : (
    <AuthShell>{form}</AuthShell>
  );
}
export function RegisterPage() {
  return (
    <AuthShell headline="Bắt đầu hành trình sinh viên năng động.">
      <div className="w-full">
        <h1 className="text-3xl font-extrabold">Tạo tài khoản ClubHub</h1>
        <p className="mt-2 text-muted">
          Sử dụng thông tin sinh viên chính thức của bạn.
        </p>
        <form className="card mt-7 grid gap-5 p-6 sm:p-8">
          <Field
            label="Họ và tên"
            placeholder="Nguyễn Văn A"
            icon={UserRound}
            value=""
            onChange={() => {}}
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Mã số sinh viên"
              placeholder="SE180001"
              icon={ShieldCheck}
              value=""
              onChange={() => {}}
            />
            <Field
              label="Email trường"
              placeholder="a.nv@university.edu.vn"
              icon={Mail}
              value=""
              onChange={() => {}}
            />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Mật khẩu"
              type="password"
              placeholder="Tối thiểu 8 ký tự"
              icon={KeyRound}
              value=""
              onChange={() => {}}
            />
            <Field
              label="Xác nhận mật khẩu"
              type="password"
              placeholder="Nhập lại mật khẩu"
              icon={KeyRound}
              value=""
              onChange={() => {}}
            />
          </div>
          <label className="flex items-start gap-3 text-sm text-muted">
            <input
              type="checkbox"
              className="mt-1 rounded text-primary focus:ring-primary"
            />
            Tôi đồng ý với Điều khoản sử dụng và Chính sách bảo mật.
          </label>
          <button type="button" className="btn-primary">
            Đăng ký tài khoản
          </button>
        </form>
        <p className="mt-5 text-center text-sm">
          Đã có tài khoản?{" "}
          <Link to="/login" className="font-bold text-primary">
            Đăng nhập
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  return (
    <AuthShell headline="Khôi phục truy cập, tiếp tục kết nối.">
      <div className="w-full max-w-lg">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary-soft text-primary">
          <KeyRound />
        </div>
        <h1 className="mt-5 text-3xl font-extrabold">Quên mật khẩu?</h1>
        <p className="mt-2 text-muted">
          Nhập email trường để nhận liên kết đặt lại mật khẩu.
        </p>
        {sent ? (
          <div className="card mt-7 p-7">
            <CheckCircle2 className="h-10 w-10 text-emerald-600" />
            <h2 className="mt-4 text-xl font-bold">Đã gửi email khôi phục</h2>
            <p className="mt-2 text-sm text-muted">
              Hãy kiểm tra hộp thư. Liên kết có hiệu lực trong 15 phút.
            </p>
            <Link to="/reset-password" className="btn-primary mt-6">
              Mở màn hình đặt lại
            </Link>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
            className="card mt-7 space-y-5 p-7"
          >
            <Field
              label="Email trường"
              placeholder="a.nv@university.edu.vn"
              icon={Mail}
              value=""
              onChange={() => {}}
            />
            <button className="btn-primary w-full">
              Gửi liên kết khôi phục
            </button>
          </form>
        )}
        <Link to="/login" className="btn-ghost mt-5">
          ← Quay lại đăng nhập
        </Link>
      </div>
    </AuthShell>
  );
}
export function ResetPasswordPage() {
  return (
    <AuthShell headline="Một mật khẩu mới, một khởi đầu an toàn.">
      <form className="card w-full max-w-lg space-y-5 p-7">
        <h1 className="text-2xl font-extrabold">Đặt lại mật khẩu</h1>
        <p className="text-sm text-muted">
          Mật khẩu cần tối thiểu 8 ký tự, gồm chữ hoa và ký tự đặc biệt.
        </p>
        <Field
          label="Mật khẩu mới"
          type="password"
          placeholder="Nhập mật khẩu mới"
          icon={KeyRound}
          value=""
          onChange={() => {}}
        />
        <Field
          label="Xác nhận mật khẩu"
          type="password"
          placeholder="Nhập lại mật khẩu"
          icon={KeyRound}
          value=""
          onChange={() => {}}
        />
        <div className="rounded-xl bg-emerald-100 p-4 text-sm text-emerald-700">
          <CheckCircle2 className="mr-2 inline h-4 w-4" />
          Mật khẩu đáp ứng yêu cầu bảo mật.
        </div>
        <Link to="/login" className="btn-primary w-full">
          Cập nhật mật khẩu
        </Link>
      </form>
    </AuthShell>
  );
}
