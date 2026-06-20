import { useState, useEffect, useCallback } from "react";
import { Loader2, X, Printer, Bluetooth } from "lucide-react";
import HeaderTransaksi from "../components/HeaderTransaksi";
import BillTransaksi from "../components/BillTransaksi";
import ProdukCard from "../components/ProdukCard";
import { printBluetoothReceipt } from "../utils/BluetoothPrinter";
import { getApiUrl } from "../utils/api";

const Transaksi = () => {
  const [produk, setProduk] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [metodeBayar, setMetodeBayar] = useState("Cash");
  const [jumlahBayar, setJumlahBayar] = useState<number | undefined>(undefined);
  const [lastTransaction, setLastTransaction] = useState<any>(null);

  const [namaToko, setNamaToko] = useState("POS Kasir");
  const [alamatToko, setAlamatToko] = useState("");
  const [pajakPersen, setPajakPersen] = useState(0);
  const [footerStruk, setFooterStruk] = useState("Terima Kasih");

  const formatRibuan = (v: string) => {
    const val = v.replace(/\D/g, "");
    return val ? new Intl.NumberFormat("id-ID").format(parseInt(val)) : "";
  };

  const cleanNumber = (v: string) => {
    const val = v.replace(/\./g, "");
    return val ? Number(val) : undefined;
  };

  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const apiUrl = getApiUrl();
      const resP = await fetch(
        `${apiUrl}/transaksi_manager.php?action=get_produk`,
      );
      const dataP = await resP.json();
      setProduk(Array.isArray(dataP) ? dataP : []);

      const resS = await fetch(`${apiUrl}/shift_manager.php?action=get_all`);
      const dS = await resS.json();
      if (dS.success && dS.settings) {
        setNamaToko(dS.settings.nama_toko || "POS Kasir");
        setAlamatToko(dS.settings.alamat_toko || "");
        setPajakPersen(Number(dS.settings.pajak_percent) || 0);
        setFooterStruk(dS.settings.footer_struk || "Terima Kasih");
      }
    } catch (e) {
      console.error("Gagal konek server transaksi:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [fetchInitialData]);

  const addToCart = (p: any) => {
    const exists = cart.find((i) => String(i.id) === String(p.id));
    if (exists) {
      if (exists.qty < Number(p.stok)) {
        setCart(
          cart.map((i) =>
            String(i.id) === String(p.id)
              ? {
                  ...i,
                  qty: i.qty + 1,
                  subtotal: (i.qty + 1) * Number(i.harga_jual),
                }
              : i,
          ),
        );
      } else {
        alert("Stok habis!");
      }
    } else {
      setCart([...cart, { ...p, qty: 1, subtotal: Number(p.harga_jual) }]);
    }
  };

  const updateQty = (id: string, delta: number) => {
    const item = cart.find((i) => String(i.id) === String(id));
    if (!item) return;
    const nQ = item.qty + delta;
    if (nQ <= 0) {
      setCart(cart.filter((i) => String(i.id) !== String(id)));
    } else if (nQ <= Number(item.stok)) {
      setCart(
        cart.map((i) =>
          String(i.id) === String(id)
            ? { ...i, qty: nQ, subtotal: nQ * Number(i.harga_jual) }
            : i,
        ),
      );
    }
  };

  const subtotal = cart.reduce((acc, i) => acc + Number(i.subtotal), 0);
  const total = subtotal + subtotal * (pajakPersen / 100);
  const kembalian = (jumlahBayar || 0) - total;

  const handleCharge = async () => {
    if (cart.length === 0 || isProcessing) return;
    setIsProcessing(true);
    try {
      const apiUrl = getApiUrl();
      const currentKasir = localStorage.getItem("username") || "Kasir";
      const valBayar = metodeBayar === "Cash" ? jumlahBayar || total : total;
      const valKembali = metodeBayar === "Cash" ? kembalian : 0;
      const res = await fetch(
        `${apiUrl}/transaksi_manager.php?action=simpan_transaksi`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            kasir_id: localStorage.getItem("userId") || "1",
            nama_kasir: currentKasir,
            total: total,
            metode_bayar: metodeBayar,
            bayar: valBayar,
            kembali: valKembali,
            items: cart,
          }),
        },
      );
      const resJ = await res.json();
      if (resJ.success) {
        setLastTransaction({
          invoice: resJ.invoice,
          items: [...cart],
          total,
          bayar: valBayar,
          kembali: valKembali,
          kasir: currentKasir,
          metodeBayar,
        });
        setShowInvoice(true);
        setCart([]);
        setJumlahBayar(undefined);
        fetchInitialData();
      }
    } catch (e) {
      alert("Simpan Gagal!");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-white overflow-hidden text-slate-900 relative text-left">
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        @media print {
          html, body {
            height: auto;
            margin: 0 !important;
            padding: 0 !important;
            background: #fff;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body * { visibility: hidden; }
          #receipt-print, #receipt-print * { 
            visibility: visible; 
            color: #000 !important; 
          }
          #receipt-print { 
            position: absolute; 
            left: 50%;
            transform: translateX(-50%);
            top: 0; 
            width: 100% !important;
            max-width: 80mm;
            margin: 0;
            padding: 5mm;
            box-shadow: none;
            background: white;
            image-rendering: pixelated;
          }
          .font-mono { 
            font-family: 'Courier New', Courier, monospace !important; 
            font-weight: bold !important;
          }
          @page { size: auto; margin: 0mm; }
        }
      `}</style>

      {/* --- UI KASIR --- */}
      <div className="flex-1 flex flex-col h-full overflow-hidden border-r border-slate-100 bg-slate-50 text-left">
        <div className="shrink-0 z-40">
          <HeaderTransaksi namaToko={namaToko} setSearchTerm={setSearchTerm} />
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar px-4 lg:px-10 pt-21.25 lg:pt-6 pb-96 lg:pb-10">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="animate-spin text-indigo-600" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
              {produk
                .filter((p) =>
                  p.nama_produk
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()),
                )
                .map((p) => (
                  <ProdukCard key={p.id} produk={p} onClick={addToCart} />
                ))}
            </div>
          )}
        </div>
      </div>

      <div className="shrink-0 lg:w-105 z-50 h-screen hidden lg:block bg-slate-50 lg:p-4 text-left border-l border-slate-100">
        <div className="h-full flex flex-col bg-white lg:rounded-4xl shadow-xl border border-slate-100 overflow-hidden">
          <BillTransaksi
            cart={cart}
            setCart={setCart}
            updateQty={updateQty}
            metodeBayar={metodeBayar}
            setMetodeBayar={setMetodeBayar}
            jumlahBayar={jumlahBayar}
            setJumlahBayar={setJumlahBayar}
            total={total}
            kembalian={kembalian}
            handleCharge={handleCharge}
            isProcessing={isProcessing}
            formatRibuan={formatRibuan}
            cleanNumber={cleanNumber}
          />
        </div>
      </div>

      <div className="lg:hidden z-50">
        <BillTransaksi
          cart={cart}
          setCart={setCart}
          updateQty={updateQty}
          metodeBayar={metodeBayar}
          setMetodeBayar={setMetodeBayar}
          jumlahBayar={jumlahBayar}
          setJumlahBayar={setJumlahBayar}
          total={total}
          kembalian={kembalian}
          handleCharge={handleCharge}
          isProcessing={isProcessing}
          formatRibuan={formatRibuan}
          cleanNumber={cleanNumber}
        />
      </div>

      {/* MODAL INVOICE */}
      {showInvoice && lastTransaction && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-150 flex items-center justify-center p-4 print:p-0 print:bg-white">
          <div className="bg-white rounded-4xl shadow-2xl overflow-hidden w-full max-w-sm print:shadow-none print:rounded-none">
            <div className="p-4 border-b flex flex-col gap-3 bg-slate-50 print:hidden text-left">
              <div className="flex justify-between items-center text-left">
                <button
                  onClick={() => setShowInvoice(false)}
                  className="text-slate-400 font-black text-xs uppercase flex items-center gap-1"
                >
                  <X size={18} /> Tutup
                </button>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
                  Review Struk
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() =>
                    printBluetoothReceipt(lastTransaction, {
                      namaToko,
                      alamatToko,
                      footerStruk,
                    })
                  }
                  className="bg-indigo-600 text-white py-3 rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <Bluetooth size={16} /> Bluetooth
                </button>
                <button
                  onClick={() => window.print()}
                  className="bg-slate-900 text-white py-3 rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <Printer size={16} /> Print Biasa
                </button>
              </div>
            </div>

            {/* AREA PRINT - GARIS FULL & TEGAS */}
            <div
              id="receipt-print"
              className="font-mono text-black p-4 text-center text-[12px] bg-white overflow-y-auto max-h-[65vh]"
            >
              <h2 className="text-[20px] font-black uppercase leading-tight tracking-tighter mb-1">
                {namaToko}
              </h2>
              <p className="text-[10px] leading-tight whitespace-pre-line mb-3 font-bold">
                {alamatToko}
              </p>

              {/* GARIS DOUBLE FULL ATAS */}
              <div className="border-t-[2px] border-double border-black mb-3 w-full"></div>

              <div className="text-left text-[10px] space-y-1.5 mb-3 font-bold uppercase italic">
                <div className="flex justify-between items-center">
                  <span>NO. INV</span>
                  <span>#{lastTransaction.invoice}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>KASIR</span>
                  <span>{lastTransaction.kasir}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>TANGGAL</span>
                  <span>
                    {new Date().toLocaleDateString("id-ID")}{" "}
                    {new Date().toLocaleTimeString("id-ID").slice(0, 5)}
                  </span>
                </div>
              </div>

              {/* GARIS PUTUS TENGAH FULL */}
              <div className="border-t border-dashed border-black mb-3 w-full"></div>

              <div className="space-y-4 mb-3 text-left text-[11px]">
                {lastTransaction.items.map((item: any, idx: number) => (
                  <div key={idx} className="font-bold italic">
                    <div className="flex justify-between uppercase leading-none">
                      <span className="flex-1 pr-4">{item.nama_produk}</span>
                      <span>
                        {Number(item.subtotal).toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="text-[9px] mt-1 opacity-80 font-black italic">
                      {item.qty} x{" "}
                      {Number(item.harga_jual).toLocaleString("id-ID")}
                    </div>
                  </div>
                ))}
              </div>

              {/* GARIS PUTUS SEBELUM TOTAL FULL */}
              <div className="border-t border-dashed border-black mb-3 w-full"></div>

              <div className="text-left space-y-1.5 text-[12px] font-bold">
                <div className="flex justify-between text-[15px] font-black italic">
                  <span>TOTAL</span>
                  <span>
                    Rp {Number(lastTransaction.total).toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between opacity-80">
                  <span>BAYAR ({lastTransaction.metodeBayar})</span>
                  <span>
                    {Number(lastTransaction.bayar).toLocaleString("id-ID")}
                  </span>
                </div>

                {/* GARIS TEGAS FULL SEBELUM KEMBALIAN */}
                <div className="border-t-2 border-black pt-1.5 flex justify-between text-indigo-700 print:text-black font-black italic">
                  <span>KEMBALI</span>
                  <span>
                    {Number(lastTransaction.kembali).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              {/* GARIS DOUBLE PENUTUP FULL */}
              <div className="border-t-[2px] border-double border-black mt-6 mb-3 w-full"></div>

              <div className="space-y-1">
                <p className="text-[11px] font-black uppercase whitespace-pre-line leading-tight italic">
                  {footerStruk}
                </p>
                <p className="text-[8px] mt-4 italic font-bold opacity-30 tracking-[0.4em]">
                  *** TERIMA KASIH ***
                </p>
              </div>

              <div className="pb-12 print:block hidden"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transaksi;
