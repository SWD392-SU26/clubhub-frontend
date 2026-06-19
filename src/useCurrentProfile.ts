import { useEffect, useState } from "react";
import { getProfile } from "./api/authStorage";
import type { UserProfile } from "./types/auth";

export function useCurrentProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(() =>
    getProfile(),
  );

  useEffect(() => {
    const syncProfile = () => setProfile(getProfile());

    window.addEventListener("clubhub_profile_updated", syncProfile);
    window.addEventListener("storage", syncProfile);

    return () => {
      window.removeEventListener("clubhub_profile_updated", syncProfile);
      window.removeEventListener("storage", syncProfile);
    };
  }, []);

  return profile;
}

export function getProfileDisplayName(
  profile: UserProfile | null,
  fallback = "bạn",
) {
  return profile?.fullName?.trim() || profile?.username?.trim() || fallback;
}
