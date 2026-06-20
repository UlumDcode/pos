import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Transaksi from "./pages/Transaksi";
import Produk from "./pages/Produk";
import Users from "./pages/Users";
import Laporan from "./pages/Laporan";
import JamKerja from "./pages/JamKerja";
import Settings from "./pages/Settings";
import Login from "./pages/Login";

function App() {
  // PAKAI STATE: Agar React nge-render ulang kalau status login berubah
  const [authState, setAuthState] = useState({
    isLoggedIn: localStorage.getItem("isLoggedIn") === "true",
    role: localStorage.getItem("role") || "kasir",
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // LISTENER: Dengerin perubahan storage (pas login/logout)
  useEffect(() => {
    const syncAuth = () => {
      setAuthState({
        isLoggedIn: localStorage.getItem("isLoggedIn") === "true",
        role: localStorage.getItem("role") || "kasir",
      });
    };

    window.addEventListener("storage", syncAuth);
    // Custom event buat handle login instan tanpa reload jendela
    window.addEventListener("auth-change", syncAuth);

    return () => {
      window.removeEventListener("storage", syncAuth);
      window.removeEventListener("auth-change", syncAuth);
    };
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/*"
          element={
            authState.isLoggedIn ? (
              <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
                <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

                <main className="flex-1 transition-all duration-300 p-4 md:p-6 lg:p-8 lg:ml-72">
                  <div className="max-w-7xl mx-auto pt-16 lg:pt-0">
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/transaksi" element={<Transaksi />} />
                      <Route path="/produk" element={<Produk />} />

                      {/* PROTEKSI MENU ADMIN */}
                      {authState.role === "admin" && (
                        <>
                          <Route path="/users" element={<Users />} />
                          <Route path="/laporan" element={<Laporan />} />
                          <Route path="/jam-kerja" element={<JamKerja />} />
                          <Route path="/settings" element={<Settings />} />
                        </>
                      )}

                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </div>
                </main>
              </div>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
