import { Trash2, Receipt, Minus, Plus, RefreshCw, Save } from "lucide-react";

interface BillProps {
  cart: any[];
  setCart: (val: any[]) => void;
  updateQty: (id: string, delta: number) => void;
  metodeBayar: string;
  setMetodeBayar: (val: string) => void;
  jumlahBayar: number | undefined;
  setJumlahBayar: (val: number | undefined) => void;
  total: number;
  kembalian: number;
  handleCharge: () => void;
  isProcessing: boolean;
  formatRibuan: (val: string) => string;
  cleanNumber: (val: string) => number | undefined;
}

const BillTransaksi = ({
  cart,
  setCart,
  updateQty,
  metodeBayar,
  setMetodeBayar,
  jumlahBayar,
  setJumlahBayar,
  total,
  kembalian,
  handleCharge,
  isProcessing,
  formatRibuan,
  cleanNumber,
}: BillProps) => {
  // LOGIKA VALIDASI: Cek apakah pembayaran sah
  const isPaymentValid = () => {
    if (cart.length === 0) return false;
    if (metodeBayar === "Cash") {
      // Harus diisi angkanya DAN tidak boleh kurang dari total
      return jumlahBayar !== undefined && jumlahBayar >= total;
    }
    // Kalau QRIS atau Transfer dianggap langsung sah (karena sistem luar)
    return true;
  };

  return (
    <div className="bill-area-fixed fixed bottom-0 left-0 right-0 lg:static flex flex-col bg-slate-50 lg:rounded-[3rem] overflow-hidden z-50 shadow-[0_-20px_50px_rgba(0,0,0,0.1)] lg:shadow-none border-t lg:border-none h-auto lg:h-full shrink-0">
      {/* --- BAGIAN 1: HEADER & LIST --- */}
      <div
        className={`${cart.length === 0 ? "hidden lg:flex" : "flex"} flex-col flex-1 min-h-0 overflow-hidden text-left`}
      >
        <div className="p-4 lg:p-6 flex justify-between items-center bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-2">
            <Receipt size={18} className="text-blue-400" />
            <h2 className="text-xs lg:text-sm font-black uppercase tracking-widest italic">
              BILL
            </h2>
          </div>
          <button
            onClick={() => setCart([])}
            className="p-1 text-slate-500 hover:text-red-400 transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4 lg:space-y-6 custom-scrollbar max-h-[40vh] lg:max-h-none text-left">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 opacity-50">
              <Receipt size={40} className="mb-2" />
              <p className="text-[10px] font-black uppercase italic">
                Siap Melayani...
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="flex flex-col animate-in fade-in slide-in-from-bottom-2 text-left"
              >
                <p className="font-black text-slate-800 text-[10px] uppercase italic truncate mb-2 tracking-tight">
                  {item.nama_produk}
                </p>
                <div className="flex justify-between items-center">
                  <p className="text-[10px] font-black text-blue-600">
                    Rp {Number(item.harga_jual).toLocaleString("id-ID")}
                  </p>
                  <div className="flex items-center gap-2 lg:gap-3">
                    <button
                      onClick={() => updateQty(item.id, -1)}
                      className="w-6 h-6 lg:w-7 lg:h-7 flex items-center justify-center bg-white rounded-full text-slate-400 shadow-sm"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-4 text-center text-[10px] lg:text-xs font-black">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => updateQty(item.id, 1)}
                      className="w-6 h-6 lg:w-7 lg:h-7 flex items-center justify-center bg-blue-600 rounded-full text-white shadow-md"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* --- BAGIAN 2: PAYMENT AREA --- */}
      <div className="p-3 lg:p-4 lg:-mt-8 bg-white rounded-t-[2.5rem] lg:rounded-t-[3.5rem] shadow-[0_-15px_40px_-12px_rgba(0,0,0,0.08)] space-y-2 lg:space-y-3 shrink-0 border-t lg:border-none text-left">
        <div className="flex gap-1.5 lg:gap-2">
          {["Cash", "QRIS", "Transfer"].map((m) => (
            <button
              key={m}
              onClick={() => {
                setMetodeBayar(m);
                if (m !== "Cash") setJumlahBayar(undefined); // Reset nominal kalau bukan cash
              }}
              className={`flex-1 py-1.5 lg:py-2 rounded-xl text-[8px] lg:text-[9px] font-black uppercase transition-all ${
                metodeBayar === m
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-slate-50 text-slate-400"
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {metodeBayar === "Cash" && (
          <div className="space-y-1 text-left">
            <input
              type="text"
              value={
                jumlahBayar !== undefined
                  ? formatRibuan(jumlahBayar.toString())
                  : ""
              }
              onChange={(e) => setJumlahBayar(cleanNumber(e.target.value))}
              placeholder="Masukkan Uang Tunai..."
              className={`w-full p-2.5 lg:p-3 bg-slate-50 border-2 rounded-xl lg:rounded-2xl font-black text-base lg:text-base outline-none text-left shadow-inner transition-all ${
                jumlahBayar !== undefined && jumlahBayar < total
                  ? "border-red-200 text-red-500"
                  : "border-transparent text-blue-600"
              }`}
            />
            {jumlahBayar !== undefined && (
              <div className="flex justify-between items-center px-1">
                <span className="text-[8px] lg:text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  {kembalian < 0 ? "Kurang" : "Kembali"}
                </span>
                <span
                  className={`text-[10px] lg:text-xs font-black ${kembalian < 0 ? "text-red-500" : "text-green-600"}`}
                >
                  Rp {Math.abs(kembalian).toLocaleString("id-ID")}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-between items-center py-1 lg:py-1 border-t border-slate-50 text-left">
          <span className="text-[9px] lg:text-[10px] font-black text-slate-400 uppercase italic">
            Total
          </span>
          <span className="text-xl lg:text-2xl font-black text-blue-600 tracking-tighter">
            Rp {total.toLocaleString("id-ID")}
          </span>
        </div>

        <button
          onClick={handleCharge}
          disabled={isProcessing || !isPaymentValid()}
          className="w-full bg-slate-900 text-white py-3 lg:py-4 rounded-2xl lg:rounded-3xl font-black text-[10px] lg:text-[11px] tracking-widest uppercase flex justify-center items-center gap-2 active:scale-95 disabled:bg-slate-100 disabled:text-slate-300 transition-all shadow-lg"
        >
          {isProcessing ? (
            <RefreshCw className="animate-spin" size={14} />
          ) : (
            <Save size={16} />
          )}
          {isProcessing ? "PROCESSING" : "BAYAR"}
        </button>
      </div>
    </div>
  );
};

export default BillTransaksi;
