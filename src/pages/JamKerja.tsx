import { useState, useEffect, useCallback } from "react";
import { Save, ArrowRightLeft, UserCheck, Clock, Loader2 } from "lucide-react";
import { getApiUrl } from "../utils/api";

const JamKerja = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [masterShifts, setMasterShifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [pendingChanges, setPendingChanges] = useState<Record<number, any>>({});

  // 2. FUNSI FETCH YANG DINAMIS
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const apiUrl = getApiUrl(); // Ambil dari LocalStorage atau .env
      const res = await fetch(`${apiUrl}/shift_manager.php?action=get_all`);

      if (!res.ok) throw new Error("Server bermasalah");

      const data = await res.json();
      if (data.success) {
        setUsers(data.users || []);
        setMasterShifts(data.shifts || []);
      }
    } catch (e) {
      console.error("Gagal sinkron:", e);
      // Jika gagal, pastikan loading berhenti biar gak muter terus
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSaveChanges = async () => {
    const changeIds = Object.keys(pendingChanges);
    if (changeIds.length === 0) return;

    try {
      setIsSaving(true);
      const apiUrl = getApiUrl();

      for (const userId of changeIds) {
        const shift = pendingChanges[Number(userId)];
        await fetch(`${apiUrl}/shift_manager.php?action=apply_to_user`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: Number(userId),
            jam_mulai: shift.jam_mulai,
            jam_selesai: shift.jam_selesai,
          }),
        });
      }

      setMessage("Jadwal Berhasil Diperbarui!");
      setPendingChanges({});
      await fetchData();
      setTimeout(() => setMessage(""), 3000);
    } catch (e) {
      alert("Terjadi kesalahan simpan! Cek koneksi server.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} />
        <p className="font-black uppercase italic text-slate-400 tracking-widest">
          Sinkronisasi Jadwal...
        </p>
      </div>
    );

  return (
    <div className="p-4 md:p-8 space-y-6 animate-in fade-in duration-500 max-w-400 mx-auto text-left">
      {/* HEADER SECTION */}
      <div className="bg-white p-6 md:p-8 rounded-4xl border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center shadow-sm gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black italic uppercase text-slate-800 tracking-tighter">
            Penugasan <span className="text-indigo-600">Shift</span>
          </h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 text-left">
            Update Jadwal Kerja Karyawan POS Kasir
          </p>
        </div>
        <button
          onClick={handleSaveChanges}
          disabled={isSaving || Object.keys(pendingChanges).length === 0}
          className={`flex items-center justify-center gap-2 w-full md:w-auto px-8 py-4 rounded-2xl font-black uppercase text-xs transition-all active:scale-95 ${
            Object.keys(pendingChanges).length > 0
              ? "bg-indigo-600 text-white shadow-xl shadow-indigo-200 hover:bg-indigo-700"
              : "bg-slate-100 text-slate-400 cursor-not-allowed"
          }`}
        >
          {isSaving ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <Save size={16} />
          )}
          Simpan Jadwal
        </button>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 text-emerald-700 rounded-2xl font-bold text-xs border border-emerald-200 flex items-center gap-2 animate-in slide-in-from-top-2">
          <UserCheck size={16} /> {message}
        </div>
      )}

      <div className="bg-white md:rounded-4xl rounded-3xl border border-slate-200 overflow-hidden shadow-sm text-left">
        <div className="hidden md:block">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b">
              <tr className="text-[10px] font-black uppercase text-slate-400">
                <th className="px-8 py-5">Karyawan</th>
                <th className="px-8 py-5">Shift Sekarang</th>
                <th className="px-8 py-5 text-center">Status Update</th>
                <th className="px-8 py-5 text-center">Pilih Jadwal Baru</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black border border-indigo-100 uppercase italic">
                        {user.username.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800 uppercase italic leading-none">
                          {user.username}
                        </p>
                        <p className="text-[9px] text-indigo-500 font-black uppercase tracking-widest mt-1">
                          {user.role}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 font-bold text-slate-600 text-left">
                    <div className="flex items-center gap-2 text-xs">
                      <Clock size={14} className="text-slate-300" />
                      {user.jam_mulai?.slice(0, 5) || "00:00"} —{" "}
                      {user.jam_selesai?.slice(0, 5) || "00:00"}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    {pendingChanges[user.id] ? (
                      <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-xl border border-amber-200 animate-pulse">
                        <ArrowRightLeft size={12} />
                        <span className="text-[10px] font-black uppercase">
                          {pendingChanges[user.id].nama_shift}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-300 font-black uppercase italic tracking-widest">
                        Sesuai Jadwal
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-6 text-center">
                    <select
                      className={`text-[11px] font-black border rounded-xl px-4 py-3 outline-none transition-all cursor-pointer ${pendingChanges[user.id] ? "border-indigo-500 bg-indigo-50 ring-4 ring-indigo-50" : "bg-slate-50 border-slate-200"}`}
                      value={pendingChanges[user.id]?.id || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        const selected = masterShifts.find(
                          (s: any) => s.id == val,
                        );
                        if (selected)
                          setPendingChanges((prev) => ({
                            ...prev,
                            [user.id]: selected,
                          }));
                      }}
                    >
                      <option value="" disabled className="italic">
                        PILIH SHIFT BARU...
                      </option>
                      {masterShifts.map((ms: any) => (
                        <option key={ms.id} value={ms.id}>
                          {ms.nama_shift} ({ms.jam_mulai.slice(0, 5)})
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default JamKerja;
