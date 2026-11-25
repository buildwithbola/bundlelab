import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { spawn } from "node:child_process";

const BASE_URL = process.env.QA_URL || "http://127.0.0.1:3100";
const OUT_DIR = path.resolve("qa-screenshots");
fs.mkdirSync(OUT_DIR, { recursive: true });

function findBrowser() {
  const candidates = [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error("No Chrome or Edge executable found.");
}

async function waitForJson(url, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return await res.json();
    } catch {
      // retry
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`Timed out waiting for CDP at ${url}`);
}

class CDPClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 0;
    this.pending = new Map();
    this.events = [];
  }

  async connect() {
    await new Promise((resolve, reject) => {
      this.ws.addEventListener("open", resolve, { once: true });
      this.ws.addEventListener("error", reject, { once: true });
    });
    this.ws.addEventListener("message", (evt) => {
      const msg = JSON.parse(String(evt.data));
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(msg.error.message));
        else resolve(msg.result);
      } else if (msg.method) {
        this.events.push(msg);
      }
    });
  }

  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async eval(expression) {
    const res = await this.send("Runtime.evaluate", {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    if (res.exceptionDetails) {
      throw new Error(
        res.exceptionDetails.exception?.description ||
          res.exceptionDetails.text ||
          "Runtime error"
      );
    }
    return res.result?.value;
  }

  async screenshot(filename) {
    const { data } = await this.send("Page.captureScreenshot", {
      format: "png",
    });
    const outPath = path.join(OUT_DIR, filename);
    fs.writeFileSync(outPath, Buffer.from(data, "base64"));
    return outPath;
  }

  close() {
    this.ws.close();
  }
}

async function checkImages(client) {
  return client.eval(`(async () => {
    await document.fonts.ready;
    const fonts = [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family);
    const imgs = [...document.querySelectorAll('img')];
    await Promise.all(imgs.map(img => img.complete ? Promise.resolve() : new Promise(res => {
      img.addEventListener('load', res, { once: true });
      img.addEventListener('error', res, { once: true });
      setTimeout(res, 2000);
    })));
    const imgResults = imgs.map(img => ({
      alt: img.alt,
      complete: img.complete,
      naturalWidth: img.naturalWidth
    }));
    return {
      theme: document.documentElement.getAttribute('data-theme'),
      innerWidth: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      fonts: [...new Set(fonts)],
      brokenImages: imgResults.filter(i => !i.complete || i.naturalWidth === 0),
      totalImages: imgResults.length,
    };
  })()`);
}

async function run() {
  const chromePath = findBrowser();
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), "bundlelab-cdp-"));
  const port = 9344;

  const browser = spawn(
    chromePath,
    [
      "--headless=new",
      "--disable-gpu",
      "--no-sandbox",
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${userDataDir}`,
      "about:blank",
    ],
    { stdio: "ignore" }
  );

  try {
    const list = await waitForJson(`http://127.0.0.1:${port}/json/list`);
    const pageTarget = list.find((t) => t.type === "page") || list[0];
    if (!pageTarget?.webSocketDebuggerUrl) {
      throw new Error("No page target found");
    }

    const client = new CDPClient(pageTarget.webSocketDebuggerUrl);
    await client.connect();
    await client.send("Page.enable");
    await client.send("Runtime.enable");
    await client.send("Emulation.setDeviceMetricsOverride", {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    });

    // 1. Inspect Homepage (/)
    await client.send("Page.navigate", { url: BASE_URL });
    await new Promise((r) => setTimeout(r, 1200));
    const homeDesktopLight = await checkImages(client);
    const homeTierBefore = await client.eval(
      `document.querySelector('[data-testid="hero-preview-tier"]')?.textContent?.trim()`
    );
    await client.eval(
      `document.querySelector('[data-testid="hero-toggle-slot3"]')?.click()`
    );
    await new Promise((r) => setTimeout(r, 300));
    const homeTierToggled = await client.eval(
      `document.querySelector('[data-testid="hero-preview-tier"]')?.textContent?.trim()`
    );
    await client.eval(
      `document.querySelector('[data-testid="hero-toggle-slot3"]')?.click()`
    );
    await new Promise((r) => setTimeout(r, 300));
    await client.screenshot("home-desktop-light.png");

    // Scroll to Animated Walkthrough (#how-it-works) & verify interactive step click
    await client.eval(`(() => {
      document.querySelector('#how-it-works')?.scrollIntoView({ behavior: 'instant', block: 'center' });
      document.querySelector('[data-testid="walkthrough-step-2"]')?.click();
    })()`);
    await new Promise((r) => setTimeout(r, 500));
    const walkthroughPresent = await client.eval(
      `Boolean(document.querySelector('[data-testid="walkthrough-showcase"]'))`
    );
    await client.screenshot("home-walkthrough-desktop.png");

    // Scroll back top for Dark Mode capture
    await client.eval(`window.scrollTo(0, 0)`);
    await new Promise((r) => setTimeout(r, 200));

    // Dark Mode Homepage
    await client.eval(
      `document.querySelector('button[aria-label*="Switch to dark"]')?.click()`
    );
    await new Promise((r) => setTimeout(r, 400));
    const homeDesktopDark = await checkImages(client);
    await client.screenshot("home-desktop-dark.png");

    // Mobile Homepage (375x812)
    await client.eval(
      `document.querySelector('button[aria-label*="Switch to light"]')?.click()`
    );
    await client.send("Emulation.setDeviceMetricsOverride", {
      width: 375,
      height: 812,
      deviceScaleFactor: 2,
      mobile: true,
    });
    await new Promise((r) => setTimeout(r, 400));
    const homeMobileLight = await checkImages(client);
    await client.screenshot("home-mobile-light.png");

    // 2. Navigate to /builder via Launch Builder link
    await client.send("Emulation.setDeviceMetricsOverride", {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await client.eval(
      `document.querySelector('[data-testid="hero-try-builder"]')?.click()`
    );
    await new Promise((r) => setTimeout(r, 1400));
    const builderUrl = await client.eval(`window.location.pathname`);
    const builderDesktopLight = await checkImages(client);

    await client.eval(`(() => {
      document.querySelector('[data-testid="add-product-1003"]')?.click();
      document.querySelector('[data-testid="subscribe-toggle-btn"]')?.click();
    })()`);
    await new Promise((r) => setTimeout(r, 500));
    await client.screenshot("builder-desktop-light.png");
    const afterAddReport = await client.eval(`(() => ({
      tierPill: document.querySelector('[data-testid="active-tier-pill"]')?.textContent?.trim(),
      slotCounter: document.querySelector('[data-testid="dock-slot-counter"]')?.textContent?.trim(),
      savingsPill: document.querySelector('[data-testid="dock-savings-pill"]')?.textContent?.trim(),
    }))()`);

    // 3. Test Guided Tour via /builder?tour=1
    await client.send("Page.navigate", { url: `${BASE_URL}/builder?tour=1` });
    await new Promise((r) => setTimeout(r, 1200));
    const tourVisible = await client.eval(
      `Boolean(document.querySelector('[data-testid="guided-tour-card"]'))`
    );
    await client.eval(
      `document.querySelector('[data-testid="tour-next-btn"]')?.click()`
    );
    await new Promise((r) => setTimeout(r, 450));
    await client.screenshot("builder-tour-desktop.png");

    const consoleErrors = client.events.filter(
      (e) =>
        e.method === "Runtime.exceptionThrown" ||
        (e.method === "Log.entryAdded" && e.params?.entry?.level === "error")
    );

    console.log(
      JSON.stringify(
        {
          homeDesktopLight,
          homeTierBefore,
          homeTierToggled,
          walkthroughPresent,
          homeDesktopDark,
          homeMobileLight,
          builderUrl,
          builderDesktopLight,
          afterAddReport,
          tourVisible,
          consoleErrorCount: consoleErrors.length,
        },
        null,
        2
      )
    );

    client.close();
  } finally {
    browser.kill();
    try {
      fs.rmSync(userDataDir, { recursive: true, force: true });
    } catch {
      // ignore cleanup lock
    }
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
