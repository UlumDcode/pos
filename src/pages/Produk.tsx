import { useState, useEffect, useCallback } from "react";
import {
  Package,
  Plus,
  Search,
  Edit3,
  Trash2,
  X,
  Save,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
// 1. IMPORT PUSAT API LO
import { getApiUrl } from "../utils/api";

const Produk = () => {
  const [produk, setProduk] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [form, setForm] = useState({
    id: "",
    nama_produk: "",
    kode_produk: "",
    harga_jual: "",
    stok: "",
    image: "",
  });

  const fetchProduk = useCallback(async () => {
    try {
      setLoading(true);
      // 2. GUNAKAN getApiUrl()
      const apiUrl = getApiUrl();
      const res = await fetch(
        `${apiUrl}/produk_manager.php?action=get_produk&search=${search}`,
      );
      const data = await res.json();
      setProduk(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Gagal mengambil data produk:", error);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchProduk();
  }, [fetchProduk]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const apiUrl = getApiUrl();
    const formData = new FormData();

    formData.append("id", form.id);
    formData.append("nama_produk", form.nama_produk);
    formData.append("kode_produk", form.kode_produk);
    formData.append("harga_jual", form.harga_jual);
    formData.append("stok", form.stok);
    formData.append("existing_image", form.image);
    if (selectedFile) formData.append("image", selectedFile);

    try {
      const res = await fetch(
        `${apiUrl}/produk_manager.php?action=save_produk`,
        {
          method: "POST",
          body: formData,
        },
      );

      const result = await res.json();
      if (result.success) {
        setShowModal(false);
        setSelectedFile(null);
        fetchProduk();
      }
    } catch (error) {
      alert("Gagal menyimpan data produk! Cek koneksi server.");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Apakah anda yakin ingin menghapus produk ini?")) {
      try {
        const apiUrl = getApiUrl();
        const res = await fetch(
          `${apiUrl}/produk_manager.php?action=delete_produk`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
          },
        );
        const result = await res.json();
        if (result.success) fetchProduk();
      } catch (error) {
        alert("Gagal menghapus produk!");
      }
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 animate-in fade-in duration-500 max-w-[1600px] mx-auto text-left">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 md:p-8 rounded-[2rem] md:rounded-4xl border border-slate-200 shadow-sm gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-slate-800">
            Master <span className="text-blue-600">Produk</span>
          </h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
            Kelola stok barang dan inventaris
          </p>
        </div>
        <button
          onClick={() => {
            setForm({
              id: "",
              nama_produk: "",
              kode_produk: "",
              harga_jual: "",
              stok: "",
              image: "",
            });
            setSelectedFile(null);
            setShowModal(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white w-full md:w-auto px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-blue-200 justify-center transition-all active:scale-95"
        >
          <Plus size={18} /> Tambah Barang
        </button>
      </div>

      {/* SEARCH SECTION */}
      <div className="relative">
        <Search
          className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400"
          size={20}
        />
        <input
          type="text"
          placeholder="Cari Nama atau Kode Produk..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-16 pr-8 py-4 md:py-5 bg-white border border-slate-200 rounded-2xl md:rounded-3xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 font-bold text-slate-700 shadow-sm transition-all"
        />
      </div>

      {/* DATA SECTION */}
      <div className="bg-white md:rounded-4xl rounded-3xl border border-slate-200 shadow-sm overflow-hidden text-left">
        <div className="hidden md:block">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Produk
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                  Stok
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                  Harga Jual
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && produk.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-20 text-center">
                    <Loader2
                      className="animate-spin text-blue-600 mx-auto"
                      size={32}
                    />
                  </td>
                </tr>
              ) : (
                produk.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        {p.image ? (
                          <img
                            src={`${getApiUrl()}/uploads/produk/${p.image}`}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                            alt=""
                          />
                        ) : (
                          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                            <Package size={24} />
                          </div>
                        )}
                        <div>
                          <p className="font-black text-slate-800 uppercase italic leading-none">
                            {p.nama_produk}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 mt-1 tracking-widest">
                            SKU: {p.kode_produk}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span
                        className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${parseInt(p.stok) < 10 ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"}`}
                      >
                        {p.stok} Unit
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right font-black text-slate-800">
                      Rp {Number(p.harga_jual).toLocaleString("id-ID")}
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => {
                            setForm(p);
                            setShowModal(true);
                          }}
                          className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* VIEW MOBILE */}
        <div className="md:hidden divide-y divide-slate-100">
          {produk.map((p) => (
            <div key={p.id} className="p-5 flex items-center gap-4">
              <div className="shrink-0">
                {p.image ? (
                  <img
                    src={`${getApiUrl()}/uploads/produk/${p.image}`}
                    className="w-16 h-16 rounded-2xl object-cover border border-slate-200"
                    alt=""
                  />
                ) : (
                  <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                    <Package size={28} />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="font-black text-slate-800 uppercase italic leading-tight truncate">
                  {p.nama_produk}
                </p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  SKU: {p.kode_produk}
                </p>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 rounded-md text-[8px] font-black uppercase ${parseInt(p.stok) < 10 ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"}`}
                  >
                    {p.stok} Stok
                  </span>
                  <span className="text-xs font-black text-blue-600">
                    Rp {Number(p.harga_jual).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    setForm(p);
                    setShowModal(true);
                  }}
                  className="p-2 bg-amber-50 text-amber-500 rounded-xl"
                >
                  <Edit3 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="p-2 bg-red-50 text-red-500 rounded-xl"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL SECTION */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50 shrink-0">
              <h2 className="text-lg font-black italic uppercase text-slate-800">
                Detail <span className="text-blue-600">Barang</span>
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={24} />
              </button>
            </div>
            <form
              onSubmit={handleSave}
              className="p-6 md:p-8 space-y-5 overflow-y-auto text-left"
            >
              <div className="flex justify-center mb-4">
                <label className="relative cursor-pointer group">
                  <div className="w-24 h-24 rounded-3xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 group-hover:border-blue-500 transition-all overflow-hidden">
                    {selectedFile ? (
                      <img
                        src={URL.createObjectURL(selectedFile)}
                        className="w-full h-full object-cover"
                        alt=""
                      />
                    ) : form.image ? (
                      <img
                        src={`${getApiUrl()}/uploads/produk/${form.image}`}
                        className="w-full h-full object-cover"
                        alt=""
                      />
                    ) : (
                      <>
                        <ImageIcon size={24} />
                        <span className="text-[8px] font-bold uppercase mt-1">
                          Icon
                        </span>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) =>
                      setSelectedFile(e.target.files ? e.target.files[0] : null)
                    }
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1 text-left">
                  <label className="text-[9px] font-black text-slate-400 uppercase">
                    Nama Produk *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.nama_produk}
                    onChange={(e) =>
                      setForm({ ...form, nama_produk: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-slate-50 border rounded-xl outline-none focus:border-blue-600 font-bold text-sm"
                  />
                </div>
                <div className="space-y-1 text-left">
                  <label className="text-[9px] font-black text-slate-400 uppercase">
                    Kode Produk *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.kode_produk}
                    onChange={(e) =>
                      setForm({ ...form, kode_produk: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-slate-50 border rounded-xl outline-none focus:border-blue-600 font-bold text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1 text-left">
                  <label className="text-[9px] font-black text-slate-400 uppercase">
                    Harga Jual *
                  </label>
                  <input
                    type="number"
                    required
                    value={form.harga_jual}
                    onChange={(e) =>
                      setForm({ ...form, harga_jual: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-slate-50 border rounded-xl outline-none focus:border-blue-600 font-bold text-sm"
                  />
                </div>
                <div className="space-y-1 text-left">
                  <label className="text-[9px] font-black text-slate-400 uppercase">
                    Stok Tersedia *
                  </label>
                  <input
                    type="number"
                    required
                    value={form.stok}
                    onChange={(e) => setForm({ ...form, stok: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border rounded-xl outline-none focus:border-blue-600 font-bold text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-blue-200 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Save size={18} /> Simpan Produk
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Produk;
