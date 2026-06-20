import { useState, useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  BarChart3,
  Clock,
  Settings,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Menu,
  X,
} from "lucide-react";
// 1. IMPORT PUSAT API BIAR ALAMATNYA DINAMIS
import { getApiUrl } from "../utils/api";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}

const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
  const location = useLocation();
  const role = localStorage.getItem("role") || "kasir";
  const username = localStorage.getItem("username") || "User";
  const userId = localStorage.getItem("userId");

  const [storeName, setStoreName] = useState("KASIR PRO");
  const [logoUrl, setLogoUrl] = useState("");
  const [myShift, setMyShift] = useState("--:-- - --:--");

  useEffect(() => {
    const fetchSidebarData = async () => {
      try {
        // Ambil URL terbaru dari LocalStorage/Config
        const apiUrl = getApiUrl();

        // Fetch data shift dan settings toko
        const response = await fetch(
          `${apiUrl}/shift_manager.php?action=get_all`,
        );
        const data = await response.json();

        if (data.settings) {
          setStoreName(data.settings.nama_toko || "POS Kasir");
          setLogoUrl(data.settings.logo_url || "");
        }

        if (data.users) {
          // Cari data shift berdasarkan username yang sedang login
          const me = data.users.find((u: any) => u.username === username);
          if (me && me.jam_mulai && me.jam_selesai) {
            // Gunakan substring untuk ambil format HH:mm saja
            const mulai = me.jam_mulai.substring(0, 5);
            const selesai = me.jam_selesai.substring(0, 5);
            setMyShift(`${mulai} - ${selesai}`);
          }
        }
      } catch (error) {
        console.error("Gagal load data sidebar:", error);
      }
    };

    fetchSidebarData();
  }, [username]);

  // --- FUNGSI LOGOUT DENGAN UPDATE STATUS KE DATABASE ---
  const handleLogout = async () => {
    try {
      const apiUrl = getApiUrl();
      // Update status is_online jadi 0 di database
      await fetch(`${apiUrl}/login.php?action=logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userId }),
      });
    } catch (error) {
      console.error("Gagal update status online saat logout:", error);
    } finally {
      // Bersihkan session dan tendang ke login page
      localStorage.clear();
      window.location.replace("/login");
    }
  };

  const menuItems = [
    {
      name: "Dashboard",
      path: "/",
      icon: <LayoutDashboard size={20} />,
      roles: ["admin", "kasir"],
    },
    {
      name: "Transaksi",
      path: "/transaksi",
      icon: <ShoppingCart size={20} />,
      roles: ["admin", "kasir"],
    },
    {
      name: "Data Produk",
      path: "/produk",
      icon: <Package size={20} />,
      roles: ["admin", "kasir"],
    },
    {
      name: "Kelola Karyawan",
      path: "/users",
      icon: <Users size={20} />,
      roles: ["admin"],
    },
    {
      name: "Laporan Penjualan",
      path: "/laporan",
      icon: <BarChart3 size={20} />,
      roles: ["admin"],
    },
    {
      name: "Setting Jam Kerja",
      path: "/jam-kerja",
      icon: <Clock size={20} />,
      roles: ["admin"],
    },
    {
      name: "Setting Toko",
      path: "/settings",
      icon: <Settings size={20} />,
      roles: ["admin"],
    },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-[100] p-3 bg-indigo-600 text-white rounded-2xl shadow-xl active:scale-95 transition-all"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Backdrop/Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[90] lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-[100] w-72 bg-slate-900 text-slate-300 transform transition-transform duration-500 ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 border-r border-slate-800 flex flex-col h-full shadow-2xl lg:shadow-none`}
      >
        {/* BAGIAN ATAS: Info Toko & Profil */}
        <div className="flex-none">
          <div className="p-8 text-left">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center overflow-hidden shadow-lg shrink-0">
                {logoUrl ? (
                  <img
                    src={`${getApiUrl()}/${logoUrl}`}
                    className="w-full h-full object-contain p-1"
                    alt="logo"
                  />
                ) : (
                  <ShoppingCart className="text-indigo-500" size={24} />
                )}
              </div>
              <h1 className="text-lg font-black text-white italic tracking-tighter uppercase truncate">
                {storeName}
              </h1>
            </div>
          </div>

          <div className="mx-6 mb-4 p-4 bg-slate-800/40 rounded-2xl border border-slate-700/50">
            <div className="flex items-center gap-3 mb-3 border-b border-slate-700 pb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black border border-white/10 shadow-lg text-sm shrink-0">
                {username.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden text-left">
                <p className="text-sm font-bold text-white truncate">
                  {username}
                </p>
                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-1">
                  <ShieldCheck size={10} className="text-indigo-400" /> {role}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-tighter">
              <Clock size={12} className="text-indigo-400" /> Shift: {myShift}
            </div>
          </div>
        </div>

        {/* BAGIAN TENGAH: Navigasi */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto no-scrollbar">
          <p className="px-4 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4 mt-2 text-left">
            Main Navigation
          </p>
          {menuItems.map(
            (item) =>
              item.roles.includes(role) && (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center justify-between px-4 py-3.5 rounded-2xl font-bold transition-all duration-300 ${location.pathname === item.path ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 translate-x-1" : "hover:bg-slate-800 text-slate-400 hover:text-white"}`}
                >
                  <div className="flex items-center gap-3 text-left">
                    {item.icon}
                    <span className="text-sm tracking-wide">{item.name}</span>
                  </div>
                  {location.pathname === item.path && (
                    <ChevronRight size={14} />
                  )}
                </Link>
              ),
          )}
        </nav>

        {/* BAGIAN BAWAH: Logout */}
        <div className="flex-none p-4 border-t border-slate-800 bg-slate-900">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-4 w-full text-slate-400 font-black hover:bg-red-500/10 hover:text-red-400 rounded-2xl transition-all duration-300 group"
          >
            <div className="p-2 rounded-lg bg-slate-800 group-hover:bg-red-500/20 transition-colors">
              <LogOut size={18} />
            </div>
            <span className="text-sm">Keluar Akun</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
