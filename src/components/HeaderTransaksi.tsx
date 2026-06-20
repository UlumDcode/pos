import { Search } from "lucide-react";

interface HeaderProps {
  namaToko: string;
  setSearchTerm: (val: string) => void;
}

const HeaderTransaksi = ({ namaToko, setSearchTerm }: HeaderProps) => (
  <div className="fixed top-0 left-0 right-0 z-[40] bg-white/80 backdrop-blur-md lg:relative lg:m-4 lg:p-7 lg:rounded-4xl lg:bg-slate-50 border-b border-slate-100 lg:border-none shadow-sm lg:shadow-none transition-all duration-300">
    <div className="flex items-center justify-between gap-3 h-[70px] lg:h-auto px-4 lg:px-0 pt-1 lg:pt-0">
      {/* pl-14: Biar Nama Toko nggak ketutup tombol hamburger sidebar lo */}
      <div className="flex flex-col shrink-0 pl-14 lg:pl-0 text-left">
        <h1 className="text-[11px] lg:text-3xl font-black italic text-slate-800 tracking-tighter uppercase truncate max-w-[90px] lg:max-w-none leading-none">
          {namaToko}
        </h1>
        <span className="text-[7px] lg:hidden font-bold text-blue-600 uppercase tracking-[0.2em] mt-0.5">
          Aplikasi Kasir
        </span>
      </div>

      <div className="relative flex-1 max-w-[450px] group text-left">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          <Search size={14} strokeWidth={3} />
        </div>
        <input
          type="text"
          placeholder="Cari menu favorit..."
          className="w-full pl-9 pr-4 py-2.5 lg:py-4 bg-slate-100/80 lg:bg-white border-none rounded-2xl font-bold text-[10px] lg:text-base outline-none transition-all placeholder:text-slate-400 text-slate-700 shadow-inner"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    </div>
  </div>
);

export default HeaderTransaksi;
