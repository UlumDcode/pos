import { useState, useEffect, useCallback } from "react";
import {
  Users,
  Package,
  RefreshCw,
  Monitor,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  ArrowUpRight,
} from "lucide-react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { getApiUrl } from "../utils/api";

const Dashboard = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const userRole = localStorage.getItem("role");

  const fetchDashboard = useCallback(async () => {
    try {
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/dashboard_data.php?t=${Date.now()}`);
      const result = await res.json();
      if (result.status === "success") {
        setData(result);
      }
    } catch (error) {
      console.error("Gagal sinkronisasi dashboard:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 15000);
    return () => clearInterval(interval);
  }, [fetchDashboard]);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-slate-50">
        <RefreshCw className="animate-spin text-blue-600" size={40} />
        <p className="font-black italic text-slate-400 uppercase tracking-widest text-[10px]">
          Menyambungkan ke Server ...
        </p>
      </div>
    );

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-700 text-left overflow-x-hidden pb-20">
      {/* 1. HEADER DENGAN GREETING DYNAMIC */}
      <div className="bg-white p-6 md:p-10 rounded-4xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
        <div className="relative z-10 text-center md:text-left">
          <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] mb-2">
            Management System v1.0
          </p>
          <h1 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tighter italic uppercase leading-none">
            HELLO,{" "}
            <span className="text-blue-600">
              {localStorage.getItem("username")}
            </span>
          </h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">
            {userRole === "admin"
              ? "Anda memegang kendali penuh toko hari ini"
              : "Selamat bekerja, pastikan pelayanan maksimal"}
          </p>
        </div>
        <div className="bg-slate-900 p-6 rounded-3xl text-white min-w-[200px] shadow-2xl">
          <p className="text-[9px] font-black text-slate-500 uppercase mb-1">
            Total Omzet Hari Ini
          </p>
          <h3 className="text-2xl font-black italic">
            Rp{Number(data?.stats?.omzet_today || 0).toLocaleString("id-ID")}
          </h3>
        </div>
      </div>

      {/* 2. STATS GRID UTAMA (MAK JOS) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 text-left">
        <div className="bg-white p-6 rounded-4xl border border-slate-200 shadow-sm group hover:scale-[1.02] transition-all">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
            <DollarSign size={20} />
          </div>
          <p className="text-[9px] font-black text-slate-400 uppercase mb-1">
            Omzet Bulanan
          </p>
          <h2 className="text-xl md:text-2xl font-black italic">
            Rp{Number(data?.stats?.omzet_month || 0).toLocaleString("id-ID")}
          </h2>
        </div>

        <div className="bg-white p-6 rounded-4xl border border-slate-200 shadow-sm group hover:scale-[1.02] transition-all">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
            <ShoppingBag size={20} />
          </div>
          <p className="text-[9px] font-black text-slate-400 uppercase mb-1">
            Trx Hari Ini
          </p>
          <h2 className="text-xl md:text-2xl font-black italic">
            {data?.stats?.trx_today || 0}{" "}
            <span className="text-[10px] opacity-40">Orders</span>
          </h2>
        </div>

        <div className="bg-white p-6 rounded-4xl border border-slate-200 shadow-sm group hover:scale-[1.02] transition-all">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-4">
            <Package size={20} />
          </div>
          <p className="text-[9px] font-black text-slate-400 uppercase mb-1">
            Total Produk
          </p>
          <h2 className="text-xl md:text-2xl font-black italic">
            {data?.stats?.produk || 0}{" "}
            <span className="text-[10px] opacity-40">Items</span>
          </h2>
        </div>

        <div className="bg-white p-6 rounded-4xl border border-slate-200 shadow-sm group hover:scale-[1.02] transition-all">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-4">
            <Users size={20} />
          </div>
          <p className="text-[9px] font-black text-slate-400 uppercase mb-1">
            Karyawan
          </p>
          <h2 className="text-xl md:text-2xl font-black italic">
            {data?.stats?.karyawan || 0}{" "}
            <span className="text-[10px] opacity-40">Staf</span>
          </h2>
        </div>
      </div>

      {/* 3. CHART SECTION (VISUALISASI) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* GRAFIK OMZET 7 HARI */}
        <div className="lg:col-span-2 bg-white p-8 rounded-4xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-black italic uppercase text-xs tracking-widest text-slate-400 flex items-center gap-2">
              <TrendingUp size={16} className="text-blue-600" /> Tren Penjualan
              7 Hari
            </h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.chart_data || []}>
                <defs>
                  <linearGradient id="colorOmzet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="tgl"
                  axisLine={false}
                  tickLine={false}
                  fontSize={10}
                  fontStyle="italic"
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  fontSize={10}
                  tickFormatter={(v) => `${v / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "16px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="omzet"
                  stroke="#2563eb"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorOmzet)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PRODUK TERLARIS */}
        <div className="bg-slate-900 p-8 rounded-4xl text-white shadow-xl relative overflow-hidden">
          <h3 className="font-black italic uppercase text-xs tracking-widest text-blue-400 mb-8 flex items-center gap-2">
            🔥 Top 5 Produk
          </h3>
          <div className="space-y-6 relative z-10">
            {data?.top_products?.map((p: any, i: number) => (
              <div key={i} className="flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <span className="text-xl font-black italic opacity-20 group-hover:opacity-100 transition-all text-blue-500">
                    0{i + 1}
                  </span>
                  <div className="text-left">
                    <p className="text-xs font-black uppercase italic leading-none mb-1">
                      {p.nama_produk}
                    </p>
                    <p className="text-[9px] text-slate-500 font-bold uppercase">
                      {p.total_qty} Terjual
                    </p>
                  </div>
                </div>
                <ArrowUpRight size={14} className="text-blue-600" />
              </div>
            ))}
          </div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl"></div>
        </div>
      </div>

      {/* 4. MONITORING PANEL (TETAP ADA) */}
      {userRole === "admin" && (
        <div className="bg-white rounded-4xl p-8 border border-slate-200 shadow-sm text-left">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
              <h3 className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-3 text-slate-800">
                <Monitor size={20} className="text-blue-600" /> Live Status
                Kasir
              </h3>
              <p className="text-slate-400 text-[9px] font-bold mt-1 uppercase tracking-widest">
                Siapa saja yang sedang melayani pelanggan?
              </p>
            </div>
            <div className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase border border-emerald-100 flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
              {data?.active_users?.length || 0} Kasir Online
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {data?.active_users?.map((user: any, idx: number) => (
              <div
                key={idx}
                className="bg-slate-50 p-5 rounded-3xl border border-slate-100 flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center font-black text-blue-600 text-xl shadow-sm border border-slate-100 shrink-0">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="text-left">
                  <p className="text-sm font-black text-slate-800 uppercase italic leading-none mb-1">
                    {user.username}
                  </p>
                  <p className="text-[9px] text-emerald-500 font-bold uppercase tracking-widest font-mono">
                    AKTIF
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
