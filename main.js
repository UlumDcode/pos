import { app, BrowserWindow } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    title: "POS Kasir",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // --- FITUR IZIN BLUETOOTH SMART ---

  // 1. Pairing Handler (Otomatis OK)
  win.webContents.session.setBluetoothPairingHandler((details, callback) => {
    callback({ confirmed: true });
  });

  // 2. Device Selector
  win.webContents.on(
    "select-bluetooth-device",
    (event, deviceList, callback) => {
      event.preventDefault(); // Kita ambil alih prosesnya

      console.log("--- Scanning Bluetooth Devices ---");

      // Filter perangkat yang namanya mengandung 'Printer' atau 'Thermal'
      const printer = deviceList.find((device) => {
        return (
          device.deviceName.toLowerCase().includes("printer") ||
          device.deviceName.toLowerCase().includes("thermal") ||
          device.deviceName.toLowerCase().includes("pos")
        );
      });

      if (printer) {
        console.log(
          `Printer Ditemukan: ${printer.deviceName} [${printer.deviceId}]`,
        );
        callback(printer.deviceId);
      } else if (deviceList.length > 0) {
        // Jika tidak ada nama spesifik, ambil perangkat pertama yang muncul
        console.log(
          `Printer spesifik tidak ada, mencoba perangkat pertama: ${deviceList[0].deviceName}`,
        );
        callback(deviceList[0].deviceId);
      } else {
        console.log(
          "Tidak ada perangkat Bluetooth terdeteksi. Pastikan Printer ON!",
        );
      }
    },
  );
  // -----------------------------------------------------------

  const indexPath = path.join(__dirname, "dist", "index.html");

  if (fs.existsSync(indexPath)) {
    console.log("File index.html ditemukan, memulai loading...");
    win.loadFile(indexPath);
  } else {
    console.error("ERROR: File index.html TIDAK DITEMUKAN");
    win.loadURL(`data:text/html,<h1>File Tidak Ketemu!</h1>`);
  }

  // Aktifkan ini kalau mau debug (liat console merah/biru)
  // win.webContents.openDevTools();

  win.setMenuBarVisibility(false);
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
