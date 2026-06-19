import { FormEvent, useState } from "react";
import { authApi } from "../api/authApi";
import { setAuthSession } from "../api/authStorage";

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
function Field({
  label,
  type = "text",
  placeholder,
  icon: Icon,
  value,
  onChange,
  error,
}: {
  label: string;
  type?: string;
  placeholder: string;
  icon: typeof Mail;
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  const [show, setShow] = useState(false);
  const password = type === "password";
  return (
    <label className="block">
      <span className="label">{label}</span>
      <span className="relative block">
        <Icon className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
        <input
          className={`input pl-12 pr-11 ${error ? "border-red-300 focus:border-red-500 focus:ring-red-100" : ""}`}
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
      {error && (
      <p className="mt-2 text-sm font-medium text-red-600">
        {error}
      </p>
    )}
    </label>
  );
}
export function LoginPage({ compact = false }: { compact?: boolean }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
  username?: string;
  password?: string;
}>({});
const [formError, setFormError] = useState("");
  const submit = async (e: FormEvent) => {
  e.preventDefault();

  const trimmedUsername = username.trim();
  const nextErrors: {
    username?: string;
    password?: string;
  } = {};

  if (!trimmedUsername) {
    nextErrors.username = "Vui lòng nhập username.";
  }

  if (!password) {
    nextErrors.password = "Vui lòng nhập mật khẩu.";
  }

  if (Object.keys(nextErrors).length > 0) {
    setFieldErrors(nextErrors);
    setFormError("");
    return;
  }

  setFieldErrors({});
  setFormError("");
  setLoading(true);

  try {
    const data = await authApi.login({
      emailOrUsername: trimmedUsername,
      password,
    });

    setAuthSession(data);

    if (data.profile.systemRole === "UniversityAdmin") {
      navigate("/system-admin", { replace: true });
    } else {
      navigate("/dashboard", { replace: true });
    }
  } catch (err) {
    setFormError(err instanceof Error ? err.message : "Đăng nhập thất bại.");
  } finally {
    setLoading(false);
  }
};
  const form = (
    <div className="w-full">
      <div className="mb-8 text-center lg:text-left">
        <div className="lg:hidden">
          <Brand />
        </div>
        <h1 className="mt-6 text-3xl font-extrabold">
          Chào mừng bạn trở lại 
        </h1>
        <p className="mt-2 text-muted">
          Đăng nhập để tiếp tục hành trình cùng cộng đồng CLB.
        </p>
      </div>
      <form onSubmit={submit} className="card space-y-5 p-6 sm:p-8">
        <Field
          label="Username"
          placeholder="Nhập username"
          icon={UserRound}
          value={username}
          onChange={(value) => {
            setUsername(value);
            setFieldErrors((prev) => ({ ...prev, username: undefined }));
        }}
        error={fieldErrors.username}
/>
        <Field
          label="Mật khẩu"
          type="password"
          placeholder="Nhập mật khẩu"
          icon={KeyRound}
          value={password}
          onChange={(value) => {
            setPassword(value);
            setFieldErrors((prev) => ({ ...prev, password: undefined }));
          }}
          error={fieldErrors.password}
        />      
        {formError && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {formError}
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
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [studentCode, setStudentCode] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<{
    fullName?: string;
    username?: string;
    studentCode?: string;
    email?: string;
    phone?: string;
    password?: string;
    confirmPassword?: string;
    agreeTerms?: string;
  }>({});

  const [formError, setFormError] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();

    const nextErrors: typeof fieldErrors = {};
    const normalizedPhone = phone.trim().replace(/\s+/g, "");

    if (!fullName.trim()) {
      nextErrors.fullName = "Vui lòng nhập họ và tên.";
    }

    if (!username.trim()) {
      nextErrors.username = "Vui lòng nhập username.";
    }

    if (!studentCode.trim()) {
      nextErrors.studentCode = "Vui lòng nhập mã số sinh viên.";
    }

    if (!email.trim()) {
      nextErrors.email = "Vui lòng nhập email trường.";
    }

    if (
      normalizedPhone &&
      !/^(0(3|5|7|8|9)\d{8}|\+84(3|5|7|8|9)\d{8})$/.test(normalizedPhone)
    ) {
      nextErrors.phone = "Số điện thoại không hợp lệ.";
    }

    if (!password) {
      nextErrors.password = "Vui lòng nhập mật khẩu.";
    } else if (password.length < 6) {
      nextErrors.password = "Mật khẩu cần tối thiểu 6 ký tự.";
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = "Vui lòng xác nhận mật khẩu.";
    } else if (confirmPassword !== password) {
      nextErrors.confirmPassword = "Mật khẩu xác nhận không khớp.";
    }

    if (!agreeTerms) {
      nextErrors.agreeTerms = "Bạn cần đồng ý với điều khoản sử dụng.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      setFormError("");
      return;
    }

    setFieldErrors({});
    setFormError("");
    setLoading(true);

    try {
      await authApi.register({
        fullName: fullName.trim(),
        username: username.trim(),
        email: email.trim(),
        password,
        studentCode: studentCode.trim(),
        phone: normalizedPhone || undefined,
      });

      navigate("/login", { 
        replace: true,
        state: { message: "Đăng ký thành công! Vui lòng đăng nhập." },
      });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Đăng ký thất bại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell headline="Bắt đầu hành trình sinh viên năng động.">
      <div className="w-full">
        <h1 className="text-3xl font-extrabold">Tạo tài khoản ClubHub</h1>
        <p className="mt-2 text-muted">
          Sử dụng thông tin sinh viên chính thức của bạn.
        </p>
        <form onSubmit={submit} className="card mt-7 grid gap-5 p-6 sm:p-8">
          <Field
            label="Họ và tên"
            placeholder="Nguyễn Văn A"
            icon={UserRound}
            value={fullName}
            onChange={(value) => {
              setFullName(value);
              setFieldErrors((prev) => ({ ...prev, fullName: undefined }));
            }}
            error={fieldErrors.fullName}
          />
          <Field
            label="Username"
            placeholder="thaonguyen1909"
            icon={UserRound}
            value={username}
            onChange={(value) => {
            setUsername(value);
            setFieldErrors((prev) => ({ ...prev, username: undefined }));
          }}
          error={fieldErrors.username}
/>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Mã số sinh viên"
              placeholder="SE180001"
              icon={ShieldCheck}
              value={studentCode}
              onChange={(value) => {
                setStudentCode(value);
                setFieldErrors((prev) => ({ ...prev, studentCode: undefined }));
              }}
              error={fieldErrors.studentCode}
            />
            <Field
              label="Email trường"
              placeholder="a.nv@university.edu.vn"
              icon={Mail}
              value={email}
              onChange={(value) => {
                setEmail(value);
                setFieldErrors((prev) => ({ ...prev, email: undefined }));
              }}
              error={fieldErrors.email}
            />
          </div>
          <Field
            label="Số điện thoại"
            placeholder="0900000000"
            icon={UserRound}
            value={phone}
            onChange={(value) => {
              setPhone(value);
              setFieldErrors((prev) => ({ ...prev, phone: undefined }));
            }}
            error={fieldErrors.phone}
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Mật khẩu"
              type="password"
              placeholder="Tối thiểu 6 ký tự"
              icon={KeyRound}
              value={password}
              onChange={(value) => {
                setPassword(value);
                setFieldErrors((prev) => ({ ...prev, password: undefined }));
              }}
              error={fieldErrors.password}
            />
            <Field
              label="Xác nhận mật khẩu"
              type="password"
              placeholder="Nhập lại mật khẩu"
              icon={KeyRound}
              value={confirmPassword}
              onChange={(value) => {
                setConfirmPassword(value);
                setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }));
              }}
              error={fieldErrors.confirmPassword}
            />
          </div>
          <label className="flex items-start gap-3 text-sm text-muted">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => {
              setAgreeTerms(e.target.checked);
              setFieldErrors((prev) => ({ ...prev, agreeTerms: undefined }));
          }}
          className="mt-1 rounded text-primary focus:ring-primary"
        />
        Tôi đồng ý với Điều khoản sử dụng và Chính sách bảo mật.
      </label>
      {fieldErrors.agreeTerms && (
        <p className="-mt-3 text-sm font-medium text-red-600">
        {fieldErrors.agreeTerms}
        </p>
      )}
      {formError && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
      {formError}
        </p>
      )}
          <button disabled={loading} className="btn-primary">
            {loading ? "Đang đăng ký..." : "Đăng ký tài khoản"}
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
            <h2 className="mt-4 text-xl font-bold">
              Đã gởi email khôi phục
            </h2>
            <p className="mt-2 text-sm text-muted">
              Hãy kiểm tra hộp thư. Liên kết có hiệu lực trong 15
              phút.
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
          Quay lại đăng nhập
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
          Mật khẩu cần tối thiểu 6 ký tự, gồm chữ hoa và ký
          tự đặc biệt.
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
