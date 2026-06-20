import { useState, useEffect, useCallback } from "react";
import {
  TrendingUp,
  Search,
  Eye,
  X,
  Printer,
  Bluetooth,
  Clock,
  User,
  ShoppingBag,
  FileSpreadsheet,
  FileText,
  Loader2,
  CheckCircle2,
} from "lucide-react";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
//   Cell,
// } from "recharts";
import { printBluetoothReceipt } from "../utils/BluetoothPrinter";
import { getApiUrl } from "../utils/api";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const Laporan = () => {
  const [transaksi, setTransaksi] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTrx, setSelectedTrx] = useState<any>(null);
  const [detailItems, setDetailItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showExportPreview, setShowExportPreview] = useState(false);
  const [namaToko, setNamaToko] = useState("POS Kasir");

  const [filter, setFilter] = useState({
    start_date: new Date().toISOString().split("T")[0],
    end_date: new Date().toISOString().split("T")[0],
  });

  const fetchLaporan = useCallback(async () => {
    try {
      setLoading(true);
      const apiUrl = getApiUrl();

      // Ambil data laporan penjualan
      const res = await fetch(
        `${apiUrl}/transaksi_manager.php?action=get_laporan&start=${filter.start_date}&end=${filter.end_date}`,
      );
      const data = await res.json();
      if (Array.isArray(data)) setTransaksi(data);

      // Ambil Nama Toko
      const resS = await fetch(`${apiUrl}/shift_manager.php?action=get_all`);
      const dS = await resS.json();
      if (dS.success && dS.settings) {
        setNamaToko(dS.settings.nama_toko || "POS Kasir");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [filter.start_date, filter.end_date]);

  useEffect(() => {
    fetchLaporan();
  }, [fetchLaporan]);

  // --- LOGIKA EXPORT EXCEL DETAIL ---
  const handleExportExcel = async () => {
    setLoading(true);
    const apiUrl = getApiUrl();
    const fullExportData: any[] = [];

    try {
      // Loop setiap transaksi untuk ambil detail itemnya
      for (const t of filteredData) {
        const res = await fetch(
          `${apiUrl}/transaksi_manager.php?action=get_detail_transaksi&id=${t.id}`,
        );
        const items = await res.json();

        // Gabungkan data header transaksi dengan detail item produk
        items.forEach((item: any) => {
          fullExportData.push({
            "No. Invoice": t.invoice_no,
            Tanggal: t.tanggal,
            Kasir: t.nama_kasir || "Admin",
            Produk: item.nama_produk,
            "Harga Satuan": Number(item.harga_jual),
            Qty: Number(item.qty),
            Subtotal: Number(item.qty * item.harga_jual),
            "Metode Bayar": t.metode_bayar,
            "Total Transaksi": Number(t.total_harga),
          });
        });
      }

      const worksheet = XLSX.utils.json_to_sheet(fullExportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Detail Penjualan");

      // Styling kolom otomatis
      const wscols = [
        { wch: 15 },
        { wch: 20 },
        { wch: 15 },
        { wch: 25 },
        { wch: 15 },
        { wch: 8 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
      ];
      worksheet["!cols"] = wscols;

      XLSX.writeFile(
        workbook,
        `Laporan_Detail_${namaToko}_${filter.start_date}.xlsx`,
      );
      setShowExportPreview(false);
    } catch (e) {
      alert("Gagal Export Excel!");
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(namaToko.toUpperCase(), 14, 15);
    doc.setFontSize(10);
    doc.text(`LAPORAN RINGKASAN PENJUALAN`, 14, 22);
    doc.text(`Periode: ${filter.start_date} s/d ${filter.end_date}`, 14, 27);

    const tableData = filteredData.map((t) => [
      t.invoice_no,
      t.tanggal,
      t.nama_kasir || "Admin",
      `Rp ${Number(t.total_harga).toLocaleString("id-ID")}`,
      t.metode_bayar,
    ]);

    autoTable(doc, {
      head: [["Invoice", "Tanggal", "Kasir", "Total", "Metode"]],
      body: tableData,
      startY: 35,
      theme: "grid",
      headStyles: { fillColor: [79, 70, 229] },
    });

    doc.save(`Laporan_PDF_${namaToko}.pdf`);
    setShowExportPreview(false);
  };

  const fetchDetail = async (trx: any) => {
    try {
      const apiUrl = getApiUrl();
      const res = await fetch(
        `${apiUrl}/transaksi_manager.php?action=get_detail_transaksi&id=${trx.id}`,
      );
      const data = await res.json();
      setDetailItems(data);
      setSelectedTrx(trx);
    } catch (e) {
      alert("Gagal ambil detail!");
    }
  };

  const filteredData = transaksi.filter(
    (t) =>
      t.invoice_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.nama_kasir?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalOmzet = filteredData.reduce(
    (acc, curr) => acc + Number(curr.total_harga || 0),
    0,
  );

  return (
    <div className="h-screen w-full flex flex-col bg-slate-50 text-slate-900 overflow-hidden text-left font-sans">
      {/* HEADER */}
      <header className="shrink-0 z-50 bg-white border-b border-slate-200 p-4 md:p-6 shadow-sm">
        <div className="max-w-350 mx-auto space-y-4">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <h1 className="text-xl md:text-2xl font-black italic uppercase leading-none">
              Laporan <span className="text-indigo-600">{namaToko}</span>
            </h1>

            <div className="flex gap-2">
              <button
                onClick={() => setShowExportPreview(true)}
                className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase hover:bg-indigo-600 transition-all active:scale-95 shadow-lg shadow-slate-200"
              >
                <FileSpreadsheet size={16} /> Export Data
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 flex items-center gap-2 bg-slate-100 px-3 py-2.5 rounded-xl border border-slate-200">
              <Search size={14} className="text-slate-400" />
              <input
                placeholder="Cari Invoice atau Kasir..."
                className="bg-transparent outline-none text-[11px] font-bold w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex gap-2 items-center bg-slate-100 p-1.5 rounded-xl border border-slate-200">
              <input
                type="date"
                className="bg-white px-2 py-1.5 rounded-lg text-[10px] font-bold outline-none"
                value={filter.start_date}
                onChange={(e) =>
                  setFilter({ ...filter, start_date: e.target.value })
                }
              />
              <span className="text-slate-400 font-bold text-[10px]">to</span>
              <input
                type="date"
                className="bg-white px-2 py-1.5 rounded-lg text-[10px] font-bold outline-none"
                value={filter.end_date}
                onChange={(e) =>
                  setFilter({ ...filter, end_date: e.target.value })
                }
              />
              <button
                onClick={fetchLaporan}
                className="bg-indigo-600 text-white px-5 py-2 rounded-lg font-black text-[10px] uppercase active:scale-95 transition-all"
              >
                {loading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  "Filter"
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* AREA KONTEN */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 no-scrollbar">
        <div className="max-w-350 mx-auto w-full space-y-6">
          <div className="grid grid-cols-2 gap-4 md:gap-8">
            <div className="bg-indigo-600 p-6 md:p-10 rounded-4xl text-white shadow-2xl relative overflow-hidden">
              <TrendingUp className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10" />
              <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-2">
                Total Pendapatan
              </p>
              <h2 className="text-2xl md:text-5xl font-black italic tracking-tighter">
                Rp{totalOmzet.toLocaleString("id-ID")}
              </h2>
            </div>
            <div className="bg-white p-6 md:p-10 rounded-4xl border border-slate-200 shadow-sm relative overflow-hidden">
              <ShoppingBag className="absolute -right-4 -bottom-4 w-32 h-32 text-slate-50" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                Total Transaksi
              </p>
              <h2 className="text-2xl md:text-5xl font-black text-slate-800 italic">
                {filteredData.length} <span className="text-sm">Trx</span>
              </h2>
            </div>
          </div>

          <div className="bg-white rounded-4xl border border-slate-200 shadow-sm overflow-hidden mb-20">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-black uppercase text-xs italic tracking-widest text-slate-400">
                Riwayat Transaksi Terkini
              </h3>
              {loading && (
                <Loader2 className="animate-spin text-indigo-600" size={18} />
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <tbody className="divide-y divide-slate-100">
                  {filteredData.map((t) => (
                    <tr
                      key={t.id}
                      className="hover:bg-slate-50 transition-colors group"
                    >
                      <td className="p-6 md:p-8">
                        <div className="flex justify-between items-center">
                          <div className="space-y-2">
                            <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                              #{t.invoice_no}
                            </span>
                            <div className="flex items-center gap-4 mt-2">
                              <div className="flex items-center gap-1.5 opacity-50 text-[10px] font-bold uppercase">
                                <User size={12} /> {t.nama_kasir || "Admin"}
                              </div>
                              <div className="flex items-center gap-1.5 opacity-50 text-[10px] font-bold uppercase">
                                <Clock size={12} /> {t.tanggal}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-8">
                            <div className="text-right">
                              <p className="text-[9px] font-black text-slate-300 uppercase">
                                Total Bayar
                              </p>
                              <p className="text-xl font-black italic text-slate-800">
                                Rp
                                {Number(t.total_harga).toLocaleString("id-ID")}
                              </p>
                            </div>
                            <button
                              onClick={() => fetchDetail(t)}
                              className="p-4 bg-slate-100 text-slate-400 rounded-2xl group-hover:bg-slate-900 group-hover:text-white transition-all active:scale-90 shadow-sm"
                            >
                              <Eye size={18} />
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* MODAL PREVIEW EXPORT (PENTING!) */}
      {showExportPreview && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-4xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 border-b bg-slate-50 flex justify-between items-center">
              <div className="text-left">
                <h2 className="text-2xl font-black italic uppercase text-slate-800">
                  Export <span className="text-indigo-600">Preview</span>
                </h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  Konfirmasi data sebelum diunduh
                </p>
              </div>
              <button
                onClick={() => setShowExportPreview(false)}
                className="p-3 bg-white rounded-2xl shadow-sm text-slate-400 hover:text-red-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-8 space-y-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-1">
                    Periode Laporan
                  </p>
                  <p className="text-sm font-black text-slate-700">
                    {filter.start_date}{" "}
                    <span className="text-slate-300">s/d</span>{" "}
                    {filter.end_date}
                  </p>
                </div>
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-1">
                    Total Item Transaksi
                  </p>
                  <p className="text-sm font-black text-slate-700">
                    {filteredData.length} Baris Data
                  </p>
                </div>
              </div>

              <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 flex gap-4 items-start">
                <CheckCircle2 className="text-amber-600 shrink-0" size={24} />
                <p className="text-[11px] font-bold text-amber-800 leading-relaxed text-left">
                  Format Excel akan mencakup{" "}
                  <span className="font-black italic underline text-amber-900">
                    Detail Produk
                  </span>{" "}
                  (Nama barang, Qty, dan Harga Satuan) untuk setiap transaksi
                  yang dipilih.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handleExportExcel}
                  disabled={loading}
                  className="flex items-center justify-center gap-3 bg-emerald-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-100 active:scale-95 transition-all"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <>
                      <FileSpreadsheet size={20} /> Download Excel
                    </>
                  )}
                </button>
                <button
                  onClick={handleExportPDF}
                  disabled={loading}
                  className="flex items-center justify-center gap-3 bg-slate-900 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 active:scale-95 transition-all"
                >
                  <FileText size={20} /> Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PREVIEW STRUK REPRINT */}
      {selectedTrx && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
          <div className="bg-white rounded-4xl shadow-2xl w-full max-w-[320px] overflow-hidden animate-in zoom-in duration-200">
            <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
              <button
                onClick={() => setSelectedTrx(null)}
                className="text-slate-400 font-black text-[9px] uppercase flex items-center gap-1"
              >
                <X size={14} /> Tutup
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="p-2.5 bg-slate-900 text-white rounded-xl active:scale-90 transition-all shadow-sm"
                >
                  <Printer size={16} />
                </button>
                <button
                  onClick={() =>
                    printBluetoothReceipt(
                      { ...selectedTrx, items: detailItems },
                      { namaToko, alamatToko: "", footerStruk: "Terima Kasih" },
                    )
                  }
                  className="p-2.5 bg-indigo-600 text-white rounded-xl active:scale-90 transition-all shadow-indigo-100"
                >
                  <Bluetooth size={16} />
                </button>
              </div>
            </div>
            <div
              id="receipt-print"
              className="p-8 font-mono text-[10px] text-center bg-white overflow-y-auto max-h-[60vh]"
            >
              <h2 className="text-lg font-black italic mb-2 uppercase tracking-tighter">
                {namaToko}
              </h2>
              <div className="border-b border-dashed border-slate-300 mb-4 pb-2 text-[8px] text-left space-y-0.5">
                <p>INV: #{selectedTrx.invoice_no}</p>
                <p>KASIR: {selectedTrx.nama_kasir || "Admin"}</p>
                <p>TGL: {selectedTrx.tanggal}</p>
              </div>
              <div className="space-y-2 text-left mb-4">
                {detailItems.map((item: any, i: number) => (
                  <div
                    key={i}
                    className="flex justify-between items-start gap-3"
                  >
                    <span className="uppercase flex-1 leading-tight">
                      {item.qty}x {item.nama_produk}
                    </span>
                    <span className="font-bold">
                      {(item.qty * item.harga_jual).toLocaleString("id-ID")}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-dashed border-slate-300 pt-3 text-left">
                <div className="flex justify-between font-black text-[12px] italic">
                  <span>TOTAL</span>
                  <span>
                    Rp{Number(selectedTrx.total_harga).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
              <p className="mt-8 opacity-40 font-bold uppercase text-[7px] tracking-[0.2em] text-center">
                *** RE-PRINTED ***
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Laporan;
