import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Lock,
  User,
  Eye,
  EyeOff,
  Loader2,
  Server,
  X,
  Save,
  RefreshCw,
} from "lucide-react";
import { getApiUrl } from "../utils/api";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [showApiSettings, setShowApiSettings] = useState(false);
  const [tempApi, setTempApi] = useState(getApiUrl());

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const saveApiUrl = () => {
    if (!tempApi.startsWith("http")) {
      alert("URL harus diawali http:// atau https://");
      return;
    }
    localStorage.setItem("custom_api_url", tempApi.replace(/\/$/, ""));
    setShowApiSettings(false);
    alert("Server API Berhasil Disinkronkan!");
    window.location.reload();
  };

  const resetToDefault = () => {
    localStorage.removeItem("custom_api_url");
    alert("Kembali ke alamat bawaan sistem");
    window.location.reload();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/login.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username.trim(),
          password: form.password.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        // 1. Simpan ke storage
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userId", data.user.id);
        localStorage.setItem("role", data.user.role);
        localStorage.setItem("username", data.user.username);

        // 2. TRIGGER CUSTOM EVENT (Ini kuncinya bro!)
        // Kita kirim event 'auth-change' supaya App.tsx denger
        window.dispatchEvent(new Event("auth-change"));

        // 3. Navigasi internal
        navigate("/", { replace: true });

        // 4. Cadangan terakhir: Kalau dalam 500ms nggak pindah, paksa reload hash
        setTimeout(() => {
          if (window.location.hash !== "#/") {
            window.location.hash = "#/";
            window.location.reload();
          }
        }, 500);
      } else {
        alert(data.message || "Login Gagal!");
      }
    } catch (error) {
      console.error("Error Login:", error);
      alert("Gagal konek ke server! Pastikan IP Server sudah benar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans relative overflow-hidden text-left">
      <button
        type="button"
        onClick={() => setShowApiSettings(true)}
        className="absolute top-6 right-6 p-4 bg-white text-slate-400 hover:text-blue-600 rounded-2xl shadow-lg border border-slate-100 transition-all active:scale-90 z-10"
      >
        <Server size={20} />
      </button>

      {showApiSettings && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-sm:px-6 space-y-6 shadow-2xl animate-in zoom-in duration-200">
            <div className="flex justify-between items-center">
              <div className="text-left">
                <h3 className="font-black italic uppercase text-lg leading-none">
                  Server Config
                </h3>
                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
                  Update Endpoint API
                </p>
              </div>
              <button
                onClick={() => setShowApiSettings(false)}
                className="text-slate-300 hover:text-slate-900"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2 text-left">
                <label className="text-[9px] font-black text-slate-400 uppercase ml-2">
                  Base URL API
                </label>
                <input
                  type="text"
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all"
                  value={tempApi}
                  onChange={(e) => setTempApi(e.target.value)}
                  placeholder="Contoh: http://192.168.1.10/api"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={saveApiUrl}
                  className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-2 shadow-xl shadow-blue-200 active:scale-95 transition-all"
                >
                  <Save size={16} /> Simpan
                </button>
                <button
                  onClick={resetToDefault}
                  className="p-4 bg-slate-100 text-slate-400 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all active:scale-90"
                  title="Reset ke Default"
                >
                  <RefreshCw size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 space-y-8 border border-slate-200 animate-in fade-in zoom-in duration-500">
        <div className="text-center">
          <div className="bg-blue-600 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-200 transform hover:rotate-12 transition-transform">
            <Lock className="text-white" size={40} />
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic leading-none">
            Kasir Pro <span className="text-blue-600">.</span>
          </h1>
          <p className="text-slate-500 mt-2 font-bold text-[10px] uppercase tracking-widest leading-none">
            Sistem Manajemen Toko
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2 text-left">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">
              Username
            </label>
            <div className="relative group">
              <User
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors"
                size={20}
              />
              <input
                type="text"
                required
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 focus:bg-white transition-all text-sm font-bold text-slate-700"
                placeholder="Masukkan username"
              />
            </div>
          </div>

          <div className="space-y-2 text-left">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">
              Password
            </label>
            <div className="relative group">
              <Lock
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors"
                size={20}
              />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 focus:bg-white transition-all text-sm font-bold text-slate-700"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all transform active:scale-95 flex items-center justify-center gap-2 ${
              loading
                ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200"
            }`}
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              "Masuk Sekarang"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
