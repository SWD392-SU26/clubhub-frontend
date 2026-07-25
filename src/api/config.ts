const configuredApiUrl = import.meta.env.VITE_API_BASE_URL?.trim();

const resolvedApiUrl =
  import.meta.env.PROD && configuredApiUrl?.startsWith("http://")
    ? "/api-proxy"
    : configuredApiUrl;

export const API_BASE_URL = (
  resolvedApiUrl || (import.meta.env.PROD ? "/api-proxy" : "http://localhost:5100")
).replace(/\/+$/, "");

if (import.meta.env.PROD && !configuredApiUrl) {
  console.error(
    "Thiếu VITE_API_BASE_URL. Frontend production sẽ không gọi được backend.",
  );
}
