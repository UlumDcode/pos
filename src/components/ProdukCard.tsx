import { Package, Plus } from "lucide-react";

interface ProdukCardProps {
  produk: any;
  onClick: (p: any) => void;
}

const ProdukCard = ({ produk, onClick }: ProdukCardProps) => {
  return (
    <div
      onClick={() => onClick(produk)}
      // flex-row (HP jadi list) | lg:flex-col (Laptop jadi kotak)
      className="bg-slate-50 p-3 lg:p-5 rounded-3xl lg:rounded-4xl active:scale-95 transition-all flex flex-row lg:flex-col items-center lg:items-start cursor-pointer hover:shadow-xl group border border-transparent hover:border-blue-100 w-full gap-4 lg:gap-0"
    >
      {/* FOTO PRODUK - Kecil di HP (w-20), Gede di Laptop (w-full) */}
      <div className="w-20 h-20 lg:w-full lg:aspect-square bg-white rounded-2xl lg:rounded-2xl overflow-hidden relative shadow-sm shrink-0 lg:mb-3">
        {produk.image ? (
          <img
            src={`${import.meta.env.VITE_API_URL}/uploads/produk/${produk.image}`}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            alt=""
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-blue-100">
            <Package size={15} />
          </div>
        )}

        {/* Stok Badge - Laptop Only */}
        <div className="hidden lg:block absolute top-3 left-3 bg-slate-900/80 px-2 py-0.5 rounded-lg text-[9px] font-black text-white uppercase tracking-widest">
          STOK: {produk.stok}
        </div>
      </div>

      {/* INFO PRODUK */}
      <div className="flex-1 min-w-0 text-left lg:text-center lg:w-full">
        <h3 className="font-bold text-slate-800 uppercase italic text-xs lg:text-sm truncate leading-tight mb-1 tracking-tight">
          {produk.nama_produk}
        </h3>

        {/* Stok di HP (Tampil tipis di bawah nama) */}
        <p className="lg:hidden text-[10px] font-bold text-slate-400 mb-1">
          Stok: {produk.stok}
        </p>

        <div className="flex justify-between items-center lg:mt-2">
          <p className="text-blue-600 font-black text-sm lg:text-lg tracking-tighter leading-none">
            Rp {Number(produk.harga_jual).toLocaleString("id-ID")}
          </p>
          <div className="bg-blue-600 text-white p-2 rounded-xl shadow-md group-hover:bg-blue-700 transition-colors">
            <Plus size={8} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProdukCard;
