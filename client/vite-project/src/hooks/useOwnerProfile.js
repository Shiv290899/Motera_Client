import { useEffect, useState } from "react";

const readOwnerProfile = () => {
  if (typeof window === "undefined") {
    return { webAppUrl: "", logoUrl: "" };
  }
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return { webAppUrl: "", logoUrl: "" };
    const user = JSON.parse(raw);
    const owner = user?.owner || {};
    return {
      webAppUrl:
        owner.webAppUrl ||
        owner.web_app_url ||
        user?.ownerWebAppUrl ||
        user?.webAppUrl ||
        "",
      logoUrl: owner.logoUrl || owner.logo_url || user?.logoUrl || "",
    };
  } catch {
    return { webAppUrl: "", logoUrl: "" };
  }
};

export default function useOwnerProfile() {
  const [profile, setProfile] = useState(readOwnerProfile);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const refresh = () => setProfile(readOwnerProfile());
    window.addEventListener("storage", refresh);
    window.addEventListener("owner-profile-updated", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("owner-profile-updated", refresh);
    };
  }, []);

  return profile;
}
