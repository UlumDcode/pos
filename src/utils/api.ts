// /src/utils/api.ts
export const getApiUrl = () => {
  // 1. Cek LocalStorage dulu (Hasil inputan manual di Login)
  const savedApi = localStorage.getItem("custom_api_url");

  // 2. Cek .env (Default)
  const envApi = import.meta.env.VITE_API_URL;

  // Pilih yang tersedia, prioritaskan savedApi
  const baseUrl = savedApi || envApi || "";

  // Bersihkan dari spasi atau garis miring di akhir
  return baseUrl.trim().replace(/\/$/, "");
};
