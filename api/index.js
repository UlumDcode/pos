import express from 'express';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- MOCK DATA ---
let products = [
  { id: 1, nama_produk: "Kopi Susu", kode_produk: "KP01", harga_jual: 15000, stok: 50, image: "" },
  { id: 2, nama_produk: "Roti Bakar", kode_produk: "RB01", harga_jual: 12000, stok: 20, image: "" }
];

let transactions = [
  { id: 1, no_transaksi: "TRX-001", tanggal: new Date().toISOString(), total_harga: 30000, bayar: 50000, kembalian: 20000, id_user: 1 }
];

let users = [
  { id: 1, username: "admin", nama_lengkap: "Administrator", role: "admin" },
  { id: 2, username: "kasir", nama_lengkap: "Kasir 1", role: "kasir" }
];

let settings = {
  nama_toko: "Alfin POS Demo",
  alamat: "Jl. Portofolio No. 1",
  no_telp: "081234567890",
  struk_footer: "Terima Kasih"
};

// --- ENDPOINTS ---

app.get('/api-kasir/dashboard_data.php', (req, res) => {
  res.json({
    status: "success",
    stats: {
      omzet_today: 1250000,
      omzet_month: 34500000,
      trx_today: 45,
      produk: products.length,
      karyawan: users.length
    },
    chart_data: [
      { tgl: "14 Jun", omzet: 500000 },
      { tgl: "15 Jun", omzet: 750000 },
      { tgl: "16 Jun", omzet: 600000 },
      { tgl: "17 Jun", omzet: 900000 },
      { tgl: "18 Jun", omzet: 1100000 },
      { tgl: "19 Jun", omzet: 850000 },
      { tgl: "20 Jun", omzet: 1250000 }
    ],
    top_products: [
      { nama_produk: "Kopi Susu Gula Aren", total_qty: 124 },
      { nama_produk: "Roti Bakar Coklat", total_qty: 89 },
      { nama_produk: "Ice Matcha Latte", total_qty: 76 },
      { nama_produk: "Nasi Goreng Spesial", total_qty: 52 },
      { nama_produk: "Kentang Goreng", total_qty: 45 }
    ],
    active_users: users
  });
});

app.all('/api-kasir/login.php', (req, res) => {
  res.json({ success: true, user: users[0] });
});

app.all('/api-kasir/produk_manager.php', (req, res) => {
  const action = req.query.action;
  if (action === 'get_produk') {
    res.json(products);
  } else if (action === 'save_produk') {
    const isEdit = req.body.id;
    if (isEdit) {
      const idx = products.findIndex(p => String(p.id) === String(req.body.id));
      if (idx !== -1) products[idx] = { ...products[idx], ...req.body };
    } else {
      products.push({ id: Date.now(), ...req.body });
    }
    res.json({ success: true });
  } else if (action === 'delete_produk') {
    products = products.filter(p => String(p.id) !== String(req.body.id));
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

app.all('/api-kasir/transaksi_manager.php', (req, res) => {
  const action = req.query.action;
  if (action === 'get_transaksi') {
    res.json(transactions);
  } else if (action === 'get_produk') {
    res.json(products);
  } else if (action === 'save_transaksi') {
    transactions.push({ id: Date.now(), ...req.body, tanggal: new Date().toISOString() });
    res.json({ success: true, message: 'Transaksi berhasil' });
  } else {
    res.json({ success: false });
  }
});

app.all('/api-kasir/users_manager.php', (req, res) => {
  const action = req.query.action;
  if (action === 'get_users') {
    res.json(users);
  } else if (action === 'save_user') {
    users.push({ id: Date.now(), ...req.body });
    res.json({ success: true });
  } else if (action === 'delete_user') {
    users = users.filter(u => String(u.id) !== String(req.body.id));
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

app.all('/api-kasir/get_settings.php', (req, res) => {
  res.json(settings);
});

app.all('/api-kasir/update_settings.php', (req, res) => {
  settings = { ...settings, ...req.body };
  res.json({ success: true });
});

// Fallback untuk semua endpoint lain agar tidak error di frontend
app.use((req, res) => {
  res.json({ success: true, message: "Mock endpoint reached" });
});

export default app;
