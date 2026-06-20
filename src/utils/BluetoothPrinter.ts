export const printBluetoothReceipt = async (
  transaction: any,
  settings: any,
) => {
  try {
    const device = await (navigator as any).bluetooth.requestDevice({
      filters: [{ services: ["000018f0-0000-1000-8000-00805f9b34fb"] }],
      optionalServices: ["000018f0-0000-1000-8000-00805f9b34fb"],
    });

    const server = await device.gatt.connect();
    const service = await server.getPrimaryService(
      "000018f0-0000-1000-8000-00805f9b34fb",
    );
    const characteristic = await service.getCharacteristic(
      "00002af1-0000-1000-8000-00805f9b34fb",
    );

    const encoder = new TextEncoder();
    const CH_WIDTH = 32;

    const formatRow = (left: string, right: string) => {
      const spaceNeeded = CH_WIDTH - (left.length + right.length);
      return left + " ".repeat(Math.max(1, spaceNeeded)) + right + "\n";
    };

    const divideLine = () => "-".repeat(CH_WIDTH) + "\n";
    const doubleLine = () => "=".repeat(CH_WIDTH) + "\n";

    let commands = "";

    // 2. FORMAT STRUK
    commands += "\x1b\x40"; // Reset
    commands += "\x1b\x61\x01"; // Center
    commands += "\x1b\x45\x01"; // Bold ON
    commands += "\x1b\x21\x30"; // Besar
    commands += `${settings.namaToko.toUpperCase()}\n`;
    commands += "\x1b\x21\x00"; // Normal
    commands += `${settings.alamatToko}\n`;

    commands += "\x1b\x61\x00"; // Left
    commands += divideLine();
    commands += `No. Inv : ${transaction.invoice}\n`;
    commands += `Kasir   : ${transaction.kasir}\n`;
    commands += `Tanggal : ${new Date().toLocaleDateString("id-ID")} ${new Date().toLocaleTimeString("id-ID").slice(0, 5)}\n`;
    commands += doubleLine();

    transaction.items.forEach((item: any) => {
      const nama = item.nama_produk.toUpperCase();
      commands += `${nama}\n`;
      const qtyPrice = `${item.qty} x ${Number(item.harga_jual).toLocaleString("id-ID")}`;
      const subtotal = Number(
        item.subtotal || item.qty * item.harga_jual,
      ).toLocaleString("id-ID");
      commands += formatRow(`  ${qtyPrice}`, subtotal);
    });

    commands += divideLine();
    commands += formatRow(
      "SUBTOTAL",
      Number(transaction.total).toLocaleString("id-ID"),
    );

    if (settings.pajakPersen > 0) {
      const nilaiPajak = transaction.total * (settings.pajakPersen / 100);
      commands += formatRow(
        `PAJAK ${settings.pajakPersen}%`,
        nilaiPajak.toLocaleString("id-ID"),
      );
    }

    commands += "\x1b\x45\x01";
    commands += formatRow(
      "TOTAL AKHIR",
      `Rp ${Number(transaction.total).toLocaleString("id-ID")}`,
    );
    commands += "\x1b\x45\x00";
    commands += formatRow(
      `BAYAR (${transaction.metodeBayar || "CASH"})`,
      Number(transaction.bayar).toLocaleString("id-ID"),
    );
    commands += formatRow(
      "KEMBALIAN",
      Number(transaction.kembali).toLocaleString("id-ID"),
    );

    commands += doubleLine();
    commands += "\x1b\x61\x01";
    commands += `\n${settings.footerStruk}\n`;
    commands += "\n--- System POS ---\n";
    commands += "\n\n\n"; // Feed secukupnya (jangan kebanyakan biar memori gak penuh)

    // 3. LOGIC CHUNKING (PENTING BUAT HP/NGROK)
    const data = encoder.encode(commands);
    const CHUNK_SIZE = 20; // Kirim per 20 byte

    console.log("Memulai proses cetak bertahap...");

    for (let i = 0; i < data.length; i += CHUNK_SIZE) {
      const chunk = data.slice(i, i + CHUNK_SIZE);
      await characteristic.writeValue(chunk);
      // Kasih jeda 20ms biar buffer printer gak penuh
      await new Promise((resolve) => setTimeout(resolve, 20));
    }

    console.log("Cetak selesai!");
  } catch (error) {
    console.error("Gagal cetak bluetooth:", error);
    alert("Koneksi terputus! Pastikan HP dekat dengan printer.");
  }
};
