import { ReactNode, useEffect, useState } from "react";
import { authApi } from "./api/authApi";
import { clearAuthSession, getAccessToken, setProfile } from "./api/authStorage";

export function AuthBootstrap({ children }: { children: ReactNode }) {
  const [checking, setChecking] = useState(() => Boolean(getAccessToken()));

  useEffect(() => {
    let ignore = false;

    async function verifySession() {
      const token = getAccessToken();

      if (!token) {
        setChecking(false);
        return;
      }

      try {
        const profile = await authApi.getMe();
        if (ignore) return;

        setProfile(profile);
      } catch {
        if (!ignore) {
          clearAuthSession();
        }
      } finally {
        if (!ignore) {
          setChecking(false);
        }
      }
    }

    verifySession();

    return () => {
      ignore = true;
    };
  }, []);

  if (checking) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50 px-4">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 text-sm font-semibold text-slate-600 shadow-card">
          Đang kiểm tra phiên đăng nhập...
        </div>
      </div>
    );
  }

  return children;
}
