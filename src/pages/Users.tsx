import { useState, useEffect, useCallback } from "react";
import { UserPlus, Edit, Trash2, X, Save, Loader2 } from "lucide-react";
import { getApiUrl } from "../utils/api";

const Users = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [form, setForm] = useState({
    id: "",
    username: "",
    password: "",
    role: "kasir",
  });

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/users_manager.php?action=get_users`);
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Gagal load users:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsProcessing(true);
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/users_manager.php?action=save_user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await res.json();
      if (result.success) {
        setShowModal(false);
        fetchUsers();
      } else {
        alert(result.message);
      }
    } catch (e) {
      alert("Server Error!");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Hapus user ini?")) return;
    try {
      const apiUrl = getApiUrl();
      const res = await fetch(
        `${apiUrl}/users_manager.php?action=delete_user`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        },
      );
      const result = await res.json();
      if (result.success) fetchUsers();
    } catch (e) {
      alert("Gagal hapus!");
    }
  };

  return (
    <div className="p-8 space-y-6 text-left">
      <div className="flex justify-between items-center bg-white p-8 rounded-4xl border border-slate-200 shadow-sm">
        <h1 className="text-3xl font-black italic uppercase">
          Master <span className="text-blue-600">User</span>
        </h1>
        <button
          onClick={() => {
            setForm({ id: "", username: "", password: "", role: "kasir" });
            setShowModal(true);
          }}
          className="bg-slate-800 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase flex items-center gap-2"
        >
          <UserPlus size={18} /> Tambah
        </button>
      </div>

      <div className="bg-white rounded-4xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="animate-spin text-blue-600" />
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Username
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                  Role
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                  Status
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-8 py-6 font-black text-slate-800 uppercase italic">
                    {u.username}
                  </td>
                  <td className="px-8 py-6 text-center text-[10px] font-black uppercase text-slate-500">
                    {u.role}
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span
                      className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase ${u.is_online == "1" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
                    >
                      {u.is_online == "1" ? "Online" : "Offline"}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => {
                          setForm({ ...u, password: "" });
                          setShowModal(true);
                        }}
                        className="p-2 text-blue-600 bg-blue-50 rounded-lg"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(u.id)}
                        className="p-2 text-red-600 bg-red-50 rounded-lg"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 text-left">
          <div className="bg-white w-full max-w-md rounded-4xl shadow-2xl p-8 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-black uppercase italic">
                Form <span className="text-blue-600">User</span>
              </h2>
              <button onClick={() => setShowModal(false)}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase">
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={form.username}
                  onChange={(e) =>
                    setForm({ ...form, username: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-50 border rounded-xl font-bold text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase">
                  Password {form.id && "(Kosongkan jika tak ganti)"}
                </label>
                <input
                  type="password"
                  required={!form.id}
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-50 border rounded-xl font-bold text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase">
                  Role
                </label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border rounded-xl font-bold text-sm uppercase"
                >
                  <option value="kasir">Kasir</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-4 bg-slate-800 text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <>
                    <Save size={18} /> Simpan Akun
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
