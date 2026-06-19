import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { membershipApi } from "./api/membershipApi";
import { getAccessToken, getProfile } from "./api/authStorage";
import { hasClubAdminPermission } from "./clubPermissions";
import type { UserProfile } from "./types/auth";

const LOGIN_REQUIRED_MESSAGE = "Vui lòng đăng nhập để tiếp tục.";

function GuardLoading({ message }: { message: string }) {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 px-4">
      <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 text-sm font-semibold text-slate-600 shadow-card">
        {message}
      </div>
    </div>
  );
}

function getHomePath(profile: UserProfile | null) {
  if (profile?.systemRole === "UniversityAdmin") return "/system-admin";
  return "/dashboard";
}

function getAuthState() {
  const token = getAccessToken();
  const profile = getProfile();

  return {
    isAuthenticated: Boolean(token && profile),
    profile,
  };
}

export function RequireGuest() {
  const { isAuthenticated, profile } = getAuthState();
  const [homePath, setHomePath] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function resolveHomePath() {
      if (!isAuthenticated) {
        setHomePath(null);
        return;
      }

      if (profile?.systemRole === "UniversityAdmin") {
        setHomePath("/system-admin");
        return;
      }

      try {
        const memberships = await membershipApi.getMyMemberships();
        if (!ignore) {
          setHomePath(
            hasClubAdminPermission(memberships) ? "/club-admin" : "/dashboard",
          );
        }
      } catch {
        if (!ignore) {
          setHomePath("/dashboard");
        }
      }
    }

    resolveHomePath();

    return () => {
      ignore = true;
    };
  }, [isAuthenticated, profile?.systemRole]);

  if (isAuthenticated) {
    if (profile?.systemRole === "UniversityAdmin") {
      return <Navigate to={getHomePath(profile)} replace />;
    }

    if (!homePath) {
      return <GuardLoading message="Đang kiểm tra phiên đăng nhập..." />;
    }

    return <Navigate to={homePath} replace />;
  }

  return <Outlet />;
}

export function RequireAuth() {
  const location = useLocation();
  const { isAuthenticated } = getAuthState();

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname, message: LOGIN_REQUIRED_MESSAGE }}
      />
    );
  }

  return <Outlet />;
}

export function RequireStudent() {
  const location = useLocation();
  const { isAuthenticated, profile } = getAuthState();

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname, message: LOGIN_REQUIRED_MESSAGE }}
      />
    );
  }

  if (profile?.systemRole === "UniversityAdmin") {
    return <Navigate to="/system-admin" replace />;
  }

  return <Outlet />;
}

export function RequireUniversityAdmin() {
  const location = useLocation();
  const { isAuthenticated, profile } = getAuthState();

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname, message: LOGIN_REQUIRED_MESSAGE }}
      />
    );
  }

  if (profile?.systemRole !== "UniversityAdmin") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export function RequireClubAdmin() {
  const location = useLocation();
  const { isAuthenticated, profile } = getAuthState();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    let ignore = false;

    async function checkClubAdminPermission() {
      if (!isAuthenticated || profile?.systemRole === "UniversityAdmin") {
        setAllowed(null);
        return;
      }

      setAllowed(null);

      try {
        const memberships = await membershipApi.getMyMemberships();
        if (!ignore) {
          setAllowed(hasClubAdminPermission(memberships));
        }
      } catch {
        if (!ignore) {
          setAllowed(false);
        }
      }
    }

    checkClubAdminPermission();

    return () => {
      ignore = true;
    };
  }, [isAuthenticated, profile?.systemRole]);

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname, message: LOGIN_REQUIRED_MESSAGE }}
      />
    );
  }

  if (profile?.systemRole === "UniversityAdmin") {
    return <Navigate to="/system-admin" replace />;
  }

  if (allowed === null) {
    return <GuardLoading message="Đang kiểm tra quyền quản trị CLB..." />;
  }

  if (!allowed) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
