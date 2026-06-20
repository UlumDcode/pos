import { useState, useEffect, useCallback } from "react";
import {
  Save,
  Store,
  Clock,
  Plus,
  Trash2,
  Percent,
  Loader2,
  MapPin,
  Upload,
  Image as ImageIcon,
  MessageSquare,
} from "lucide-react";
// 1. IMPORT PUSAT API BIAR DINAMIS
import { getApiUrl } from "../utils/api";

const Settings = () => {
  const [loading, setLoading] = useState(false);
  const [shifts, setShifts] = useState<any[]>([]);
  const [formToko, setFormToko] = useState({
    nama_toko: "",
    jam_operasional: "",
    logo_url: "",
    pajak_persen: "0",
    alamat_toko: "",
    footer_struk: "",
  });

  const [newShift, setNewShift] = useState({
    nama_shift: "",
    jam_mulai: "",
    jam_selesai: "",
  });

  // 2. FETCH DATA DENGAN URL DINAMIS
  const fetchData = useCallback(async () => {
    try {
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/shift_manager.php?action=get_all`);
      const data = await res.json();

      if (data.settings) {
        setFormToko({
          nama_toko: data.settings.nama_toko || "",
          jam_operasional: data.settings.jam_operasional || "",
          logo_url: data.settings.logo_url || "",
          pajak_persen: data.settings.pajak_persen || "0",
          alamat_toko: data.settings.alamat_toko || "",
          footer_struk: data.settings.footer_struk || "Terima Kasih",
        });
      }
      setShifts(data.shifts || []);
    } catch (error) {
      console.error("Gagal sinkron settings:", error);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const formData = new FormData();
      formData.append("logo", e.target.files[0]);
      setLoading(true);
      try {
        const apiUrl = getApiUrl();
        const res = await fetch(
          `${apiUrl}/shift_manager.php?action=upload_logo`,
          {
            method: "POST",
            body: formData,
          },
        );
        const result = await res.json();
        if (result.success) {
          alert("Logo Berhasil Diganti!");
          fetchData();
        }
      } catch (error) {
        alert("Gagal upload logo");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSaveToko = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const apiUrl = getApiUrl();
      const res = await fetch(
        `${apiUrl}/shift_manager.php?action=update_settings`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formToko),
        },
      );
      const result = await res.json();
      if (result.success) alert("Pengaturan POS Kasir Berhasil Disimpan!");
    } catch (e) {
      alert("Gagal menyimpan! Cek koneksi server.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddShift = async () => {
    if (!newShift.nama_shift || !newShift.jam_mulai || !newShift.jam_selesai)
      return;
    try {
      const apiUrl = getApiUrl();
      await fetch(`${apiUrl}/shift_manager.php?action=add_shift`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newShift),
      });
      setNewShift({ nama_shift: "", jam_mulai: "", jam_selesai: "" });
      fetchData();
    } catch (e) {
      alert("Gagal tambah shift!");
    }
  };

  const handleDeleteShift = async (id: number) => {
    if (!confirm("Hapus master shift ini?")) return;
    try {
      const apiUrl = getApiUrl();
      await fetch(`${apiUrl}/shift_manager.php?action=delete_shift`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      fetchData();
    } catch (e) {
      alert("Gagal hapus!");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10 p-4 md:p-8 text-left">
      {/* HEADER */}
      <div className="bg-white p-8 rounded-4xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 italic uppercase">
            Setting <span className="text-indigo-600">Sistem</span>
          </h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">
            Identitas & Operasional Toko
          </p>
        </div>
        <button
          onClick={handleSaveToko}
          disabled={loading}
          className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase flex items-center gap-2 transition-all active:scale-95 shadow-xl disabled:bg-slate-300"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <Save size={18} />
          )}
          Simpan Perubahan
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* IDENTITAS TOKO */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6 text-left">
          <h3 className="font-black text-slate-800 flex items-center gap-3 border-b pb-6 uppercase italic text-sm">
            <ImageIcon size={20} className="text-indigo-600" /> Profil & Struk
          </h3>

          <div className="flex flex-col items-center gap-6 p-8 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 group hover:border-indigo-400 transition-colors">
            <div className="w-32 h-32 bg-white rounded-[1.5rem] shadow-sm border border-slate-100 flex items-center justify-center overflow-hidden">
              {formToko.logo_url ? (
                <img
                  src={`${getApiUrl()}/${formToko.logo_url}`}
                  className="w-full h-full object-contain"
                  alt="Logo Toko"
                />
              ) : (
                <Store className="text-slate-200" size={50} />
              )}
            </div>
            <label className="cursor-pointer bg-white px-6 py-3 rounded-xl border border-slate-300 text-[10px] font-black uppercase hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-2 shadow-sm">
              <Upload size={14} />{" "}
              {loading ? "Uploading..." : "Ganti Logo Toko"}
              <input
                type="file"
                className="hidden"
                onChange={handleUploadLogo}
                accept="image/*"
              />
            </label>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase ml-2">
                Nama Brand/Toko
              </label>
              <input
                type="text"
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:border-indigo-500 transition-all"
                value={formToko.nama_toko}
                onChange={(e) =>
                  setFormToko({ ...formToko, nama_toko: e.target.value })
                }
                placeholder="Nama Toko"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase ml-2">
                Alamat Fisik
              </label>
              <div className="relative">
                <MapPin
                  className="absolute left-4 top-4 text-slate-300"
                  size={18}
                />
                <textarea
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:border-indigo-500 transition-all"
                  rows={2}
                  value={formToko.alamat_toko}
                  onChange={(e) =>
                    setFormToko({ ...formToko, alamat_toko: e.target.value })
                  }
                  placeholder="Alamat Lengkap Toko"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase ml-2">
                Jam Buka - Tutup
              </label>
              <input
                type="text"
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:border-indigo-500 transition-all"
                value={formToko.jam_operasional}
                onChange={(e) =>
                  setFormToko({ ...formToko, jam_operasional: e.target.value })
                }
                placeholder="Contoh: 08:00 - 21:00"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase ml-2">
                Pesan Kaki Struk (Footer)
              </label>
              <div className="relative">
                <MessageSquare
                  className="absolute left-4 top-4 text-slate-300"
                  size={18}
                />
                <textarea
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:border-indigo-500 transition-all"
                  rows={2}
                  value={formToko.footer_struk}
                  onChange={(e) =>
                    setFormToko({ ...formToko, footer_struk: e.target.value })
                  }
                  placeholder="Terima kasih sudah berbelanja!"
                />
              </div>
            </div>

            <div className="p-6 bg-indigo-50 rounded-3xl border border-indigo-100 space-y-4">
              <label className="text-[10px] font-black text-indigo-900 uppercase flex items-center gap-2">
                <Percent size={16} /> Pengaturan Pajak
              </label>
              <div className="relative">
                <input
                  type="number"
                  className="w-full p-5 bg-white border border-indigo-200 rounded-2xl font-black text-2xl text-indigo-600"
                  value={formToko.pajak_persen}
                  onChange={(e) =>
                    setFormToko({ ...formToko, pajak_persen: e.target.value })
                  }
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-indigo-300 text-2xl">
                  %
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* MASTER SHIFT */}
        <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white space-y-8 shadow-2xl relative overflow-hidden text-left">
          <h3 className="font-black flex items-center gap-3 text-indigo-400 border-b border-slate-800 pb-6 uppercase italic text-sm relative z-10">
            <Clock size={20} /> Master Data Shift
          </h3>

          <div className="bg-slate-800/50 p-6 rounded-[2rem] border border-slate-700 space-y-4 relative z-10">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Buat Shift Baru
            </p>
            <input
              type="text"
              placeholder="Nama Shift (Misal: Pagi)"
              className="w-full bg-slate-900 border border-slate-700 p-4 rounded-xl text-sm font-bold text-white outline-none focus:border-indigo-500"
              value={newShift.nama_shift}
              onChange={(e) =>
                setNewShift({ ...newShift, nama_shift: e.target.value })
              }
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="time"
                className="bg-slate-900 border border-slate-700 p-4 rounded-xl text-white outline-none"
                value={newShift.jam_mulai}
                onChange={(e) =>
                  setNewShift({ ...newShift, jam_mulai: e.target.value })
                }
              />
              <input
                type="time"
                className="bg-slate-900 border border-slate-700 p-4 rounded-xl text-white outline-none"
                value={newShift.jam_selesai}
                onChange={(e) =>
                  setNewShift({ ...newShift, jam_selesai: e.target.value })
                }
              />
            </div>
            <button
              onClick={handleAddShift}
              className="w-full bg-indigo-600 py-4 rounded-2xl font-black uppercase text-xs tracking-widest flex justify-center items-center gap-2 hover:bg-indigo-500 transition-all active:scale-95 shadow-xl"
            >
              <Plus size={18} /> Tambah Master
            </button>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto no-scrollbar pr-2 relative z-10">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
              Daftar Shift Tersedia
            </p>
            {shifts.map((s) => (
              <div
                key={s.id}
                className="flex justify-between items-center p-5 bg-slate-800/80 rounded-2xl border border-slate-700 hover:border-indigo-500 transition-colors"
              >
                <div>
                  <p className="text-xs font-black uppercase italic tracking-tight">
                    {s.nama_shift}
                  </p>
                  <p className="text-[10px] text-indigo-400 font-black mt-1">
                    <Clock size={10} className="inline mr-1" />
                    {s.jam_mulai.substring(0, 5)} -{" "}
                    {s.jam_selesai.substring(0, 5)} WIB
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteShift(s.id)}
                  className="text-slate-600 hover:text-red-400 p-3 bg-slate-900 rounded-xl transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
