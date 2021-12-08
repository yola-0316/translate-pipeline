const path = require("path");
const { app, BrowserWindow, ipcMain } = require("electron");

app.commandLine.appendSwitch("disable-site-isolation-trials");

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 1200,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.loadURL("http://localhost:3000");

  win.webContents.session.webRequest.onHeadersReceived({ urls: ["*://*/*"] }, (d, c) => {
    Object.keys(d.responseHeaders).forEach((k) => {
      if (/x-frame-options|content-security-policy/i.test(k)) {
        delete d.responseHeaders[k];
      }
    });

    c({ cancel: false, responseHeaders: d.responseHeaders });
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
