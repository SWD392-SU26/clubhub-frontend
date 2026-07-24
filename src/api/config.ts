const configuredApiUrl = import.meta.env.VITE_API_BASE_URL?.trim();

export const API_BASE_URL = (
  configuredApiUrl || "http://localhost:5100"
).replace(/\/+$/, "");

if (import.meta.env.PROD && !configuredApiUrl) {
  console.error(
    "Thiếu VITE_API_BASE_URL. Frontend production sẽ không gọi được backend.",
  );
}
