import { FormEvent, useState } from "react";
import { authApi } from "../api/authApi";
import { membershipApi } from "../api/membershipApi";
import { setAuthSession } from "../api/authStorage";
import { hasClubAdminPermission } from "../clubPermissions";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { AuthShell, Brand } from "../components";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STUDENT_CODE_PATTERN = /^[A-Z]{2}\d{6}$/;
const USERNAME_PATTERN = /^[A-Za-z0-9._-]{3,50}$/;
const VIETNAM_PHONE_PATTERN = /^(0[35789]\d{8}|84[35789]\d{8})$/;
const OTP_PATTERN = /^\d{6}$/;

function normalizePhone(value: string) {
  const normalized = value.trim().replace(/[\s.-]+/g, "");

  if (normalized.startsWith("+84")) {
    return `0${normalized.slice(3)}`;
  }

  if (normalized.startsWith("84")) {
    return `0${normalized.slice(2)}`;
  }

  return normalized;
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function Field({
  label,
  type = "text",
  placeholder,
  icon: Icon,
  value,
  onChange,
  error,
  maxLength,
  inputMode,
}: {
  label: string;
  type?: string;
  placeholder: string;
  icon: typeof Mail;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  maxLength?: number;
  inputMode?: "none" | "text" | "tel" | "url" | "email" | "numeric" | "decimal" | "search";
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
          maxLength={maxLength}
          inputMode={inputMode}
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
  const location = useLocation();
  const locationMessage =
    location.state &&
      typeof location.state === "object" &&
      "message" in location.state
      ? String((location.state as { message?: string }).message ?? "")
      : "";
  const locationMessageIsSuccess = locationMessage.includes("thành công");
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

      const requestedPath =
        location.state &&
          typeof location.state === "object" &&
          "from" in location.state
          ? String((location.state as { from?: string }).from ?? "")
          : "";
      const isUniversityAdmin =
        (data.profile.role ?? data.profile.systemRole) === "UniversityAdmin";
      const memberships = await membershipApi.getMyMemberships().catch(() => []);
      const hasClubAdminAccess = hasClubAdminPermission(memberships);
      const defaultPath = isUniversityAdmin
        ? "/system-admin"
        : hasClubAdminAccess
          ? "/club-admin"
          : "/dashboard";
      const canUseRequestedPath =
        requestedPath.startsWith("/") &&
        !requestedPath.startsWith("/login") &&
        (requestedPath.startsWith("/club-admin")
          ? !isUniversityAdmin && hasClubAdminAccess
          : requestedPath.startsWith("/system-admin")
            ? isUniversityAdmin
            : !isUniversityAdmin);

      navigate(canUseRequestedPath ? requestedPath : defaultPath, {
        replace: true,
      });
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
        {locationMessage && (
          <p
            className={`rounded-xl px-4 py-3 text-sm font-medium ${locationMessageIsSuccess
                ? "bg-emerald-50 text-emerald-700"
                : "bg-primary-soft text-primary-dark"
              }`}
          >
            {locationMessage}
          </p>
        )}
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
    const trimmedFullName = fullName.trim();
    const trimmedUsername = username.trim();
    const normalizedStudentCode = studentCode.trim().toUpperCase();
    const trimmedEmail = normalizeEmail(email);
    const normalizedPhone = normalizePhone(phone);

    if (!trimmedFullName) {
      nextErrors.fullName = "Vui lòng nhập họ và tên.";
    } else if (trimmedFullName.length > 100) {
      nextErrors.fullName = "Họ và tên không được vượt quá 100 ký tự.";
    }

    if (!trimmedUsername) {
      nextErrors.username = "Vui lòng nhập username.";
    } else if (!USERNAME_PATTERN.test(trimmedUsername)) {
      nextErrors.username =
        "Username cần 3-50 ký tự, chỉ gồm chữ, số, dấu chấm, gạch dưới hoặc gạch ngang.";
    }

    if (!normalizedStudentCode) {
      nextErrors.studentCode = "Vui lòng nhập mã số sinh viên.";
    } else if (!STUDENT_CODE_PATTERN.test(normalizedStudentCode)) {
      nextErrors.studentCode =
        "Mã số sinh viên cần đúng định dạng, ví dụ SE180001.";
    }

    if (!trimmedEmail) {
      nextErrors.email = "Vui lòng nhập email trường.";
    } else if (!EMAIL_PATTERN.test(trimmedEmail)) {
      nextErrors.email = "Email cần đúng định dạng, ví dụ name@fpt.edu.vn.";
    }

    if (!normalizedPhone) {
      nextErrors.phone = "Vui lòng nhập số điện thoại.";
    } else if (!VIETNAM_PHONE_PATTERN.test(normalizedPhone)) {
      nextErrors.phone =
        "Số điện thoại cần là số Việt Nam, ví dụ 0900000000 hoặc +84900000000.";
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
        fullName: trimmedFullName,
        username: trimmedUsername,
        email: trimmedEmail,
        password,
        studentCode: normalizedStudentCode,
        phone: normalizedPhone,
      });

      navigate("/verify-email", {
        replace: true,
        state: {
          email: trimmedEmail,
          message: "Đăng ký thành công. Vui lòng nhập mã OTP đã gửi về email.",
        },
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

export function VerifyEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state =
    location.state && typeof location.state === "object"
      ? (location.state as { email?: string; message?: string })
      : {};
  const [email, setEmail] = useState(state.email ?? "");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    otp?: string;
  }>({});
  const [formError, setFormError] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();

    const normalizedEmail = normalizeEmail(email);
    const normalizedOtp = otp.trim();
    const nextErrors: typeof fieldErrors = {};

    if (!normalizedEmail) {
      nextErrors.email = "Vui lòng nhập email.";
    } else if (!EMAIL_PATTERN.test(normalizedEmail)) {
      nextErrors.email = "Email không đúng định dạng.";
    }

    if (!normalizedOtp) {
      nextErrors.otp = "Vui lòng nhập mã OTP.";
    } else if (!OTP_PATTERN.test(normalizedOtp)) {
      nextErrors.otp = "Mã OTP cần gồm đúng 6 chữ số.";
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
      await authApi.verifyEmail({
        email: normalizedEmail,
        otp: normalizedOtp,
      });

      navigate("/login", {
        replace: true,
        state: {
          message: "Xác thực email thành công. Vui lòng đăng nhập.",
        },
      });
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Xác thực email thất bại.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell headline="Xác thực tài khoản để bắt đầu tham gia CLB.">
      <form onSubmit={submit} className="card w-full max-w-lg space-y-5 p-7">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary-soft text-primary">
          <ShieldCheck />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold">Xác thực email</h1>
          <p className="mt-2 text-sm text-muted">
            Nhập mã OTP 6 chữ số đã được gửi về email trường của bạn.
          </p>
        </div>
        {state.message && (
          <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {state.message}
          </p>
        )}
        <Field
          label="Email trường"
          placeholder="a.nv@university.edu.vn"
          icon={Mail}
          value={email}
          onChange={(value) => {
            setEmail(value);
            setFieldErrors((prev) => ({ ...prev, email: undefined }));
            setFormError("");
          }}
          error={fieldErrors.email}
          inputMode="email"
        />
        <Field
          label="Mã OTP"
          placeholder="Nhập 6 chữ số"
          icon={ShieldCheck}
          value={otp}
          onChange={(value) => {
            setOtp(value.replace(/\D/g, "").slice(0, 6));
            setFieldErrors((prev) => ({ ...prev, otp: undefined }));
            setFormError("");
          }}
          error={fieldErrors.otp}
          inputMode="numeric"
          maxLength={6}
        />
        {formError && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {formError}
          </p>
        )}
        <button disabled={loading} className="btn-primary w-full">
          {loading ? "Đang xác thực..." : "Xác thực tài khoản"}
        </button>
        <Link to="/login" className="btn-ghost w-full justify-center">
          Quay lại đăng nhập
        </Link>
      </form>
    </AuthShell>
  );
}

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();

    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail) {
      setError("Vui lòng nhập email.");
      return;
    }

    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      setError("Email không đúng định dạng.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await authApi.forgotPassword({ email: normalizedEmail });
      navigate("/reset-password", {
        state: {
          email: normalizedEmail,
          message: "Mã OTP đặt lại mật khẩu đã được gửi về email.",
        },
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gửi email khôi phục thất bại.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell headline="Khôi phục truy cập, tiếp tục kết nối.">
      <div className="w-full max-w-lg">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary-soft text-primary">
          <KeyRound />
        </div>
        <h1 className="mt-5 text-3xl font-extrabold">Quên mật khẩu?</h1>
        <p className="mt-2 text-muted">
          Nhập email trường để nhận mã OTP đặt lại mật khẩu.
        </p>
        <form onSubmit={submit} className="card mt-7 space-y-5 p-7">
          <Field
            label="Email trường"
            placeholder="a.nv@university.edu.vn"
            icon={Mail}
            value={email}
            onChange={(value) => {
              setEmail(value);
              setError("");
            }}
            inputMode="email"
          />
          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {error}
            </p>
          )}
          <button disabled={loading} className="btn-primary w-full">
            {loading ? "Đang gửi..." : "Gửi mã OTP"}
          </button>
        </form>
        <Link to="/login" className="btn-ghost mt-5">
          Quay lại đăng nhập
        </Link>
      </div>
    </AuthShell>
  );
}

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state =
    location.state && typeof location.state === "object"
      ? (location.state as { email?: string; message?: string })
      : {};

  const [email, setEmail] = useState(state.email ?? "");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();

    const normalizedEmail = normalizeEmail(email);
    const normalizedOtp = otp.trim();

    if (!normalizedEmail) {
      setError("Vui lòng nhập email.");
      return;
    }

    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      setError("Email không đúng định dạng.");
      return;
    }

    if (!normalizedOtp) {
      setError("Vui lòng nhập mã OTP.");
      return;
    }

    if (!OTP_PATTERN.test(normalizedOtp)) {
      setError("Mã OTP cần gồm đúng 6 chữ số.");
      return;
    }

    if (!password) {
      setError("Vui lòng nhập mật khẩu mới.");
      return;
    }

    if (password.length < 6) {
      setError("Mật khẩu cần tối thiểu 6 ký tự.");
      return;
    }

    if (!confirmPassword) {
      setError("Vui lòng xác nhận mật khẩu.");
      return;
    }

    if (confirmPassword !== password) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await authApi.resetPassword({
        email: normalizedEmail,
        otp: normalizedOtp,
        newPassword: password,
      });

      navigate("/login", {
        replace: true,
        state: { message: "Đặt lại mật khẩu thành công. Vui lòng đăng nhập." },
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Đặt lại mật khẩu thất bại.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell headline="Một mật khẩu mới, một khởi đầu an toàn.">
      <form onSubmit={submit} className="card w-full max-w-lg space-y-5 p-7">
        <h1 className="text-2xl font-extrabold">Đặt lại mật khẩu</h1>
        <p className="text-sm text-muted">
          Nhập email, mã OTP 6 chữ số và mật khẩu mới của bạn.
        </p>
        {state.message && (
          <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {state.message}
          </p>
        )}
        <Field
          label="Email trường"
          placeholder="a.nv@university.edu.vn"
          icon={Mail}
          value={email}
          onChange={(value) => {
            setEmail(value);
            setError("");
          }}
          inputMode="email"
        />
        <Field
          label="Mã OTP"
          placeholder="Nhập 6 chữ số"
          icon={ShieldCheck}
          value={otp}
          onChange={(value) => {
            setOtp(value.replace(/\D/g, "").slice(0, 6));
            setError("");
          }}
          inputMode="numeric"
          maxLength={6}
        />
        <Field
          label="Mật khẩu mới"
          type="password"
          placeholder="Nhập mật khẩu mới"
          icon={KeyRound}
          value={password}
          onChange={(value) => {
            setPassword(value);
            setError("");
          }}
        />
        <Field
          label="Xác nhận mật khẩu"
          type="password"
          placeholder="Nhập lại mật khẩu"
          icon={KeyRound}
          value={confirmPassword}
          onChange={(value) => {
            setConfirmPassword(value);
            setError("");
          }}
        />
        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {error}
          </p>
        )}
        <button disabled={loading} className="btn-primary w-full">
          {loading ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
        </button>
      </form>
    </AuthShell>
  );
}
