import puppeteer, { Browser } from "puppeteer-core";
import chromium from "@sparticuz/chromium-min";

const CHROMIUM_PACK_URL =
  "https://github.com/Sparticuz/chromium/releases/download/v148.0.0/chromium-v148.0.0-pack.x64.tar";

let browserPromise: Promise<Browser | null> | null = null;

async function launchBrowser(): Promise<Browser | null> {
  try {
    const isServerless =
      process.platform === "linux" &&
      !!process.env.AWS_LAMBDA_FUNCTION_NAME;
    if (isServerless) {
      return await puppeteer.launch({
        args: chromium.args,
        executablePath: await chromium.executablePath(CHROMIUM_PACK_URL),
        headless: true,
      });
    }
    const localPath =
      process.env.PUPPETEER_EXECUTABLE_PATH ||
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
    return await puppeteer.launch({
      executablePath: localPath,
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  } catch (err) {
    console.warn("Puppeteer: failed to launch browser:", err);
    return null;
  }
}

export async function getBrowser(): Promise<Browser | null> {
  if (!browserPromise) browserPromise = launchBrowser();
  const browser = await browserPromise;
  if (!browser || !browser.connected) {
    browserPromise = launchBrowser();
    return browserPromise;
  }
  return browser;
}
