import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { existsSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const API_PORT = 4000;
const PREVIEW_PORT = 4173;
const HEALTH = `http://localhost:${String(API_PORT)}/api/health`;
const PREVIEW = `http://localhost:${String(PREVIEW_PORT)}/`;
const READY_TIMEOUT_MS = 20_000;
const POLL_MS = 250;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const puppeteerChromes = () => {
  const root = join(homedir(), '.cache', 'puppeteer', 'chrome');
  if (!existsSync(root)) return [];
  return readdirSync(root)
    .sort()
    .reverse()
    .flatMap((build) => {
      const dir = join(root, build);
      return readdirSync(dir).map((platform) =>
        join(
          dir,
          platform,
          'Google Chrome for Testing.app',
          'Contents',
          'MacOS',
          'Google Chrome for Testing',
        ),
      );
    });
};

const CHROME_CANDIDATES = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
];

const resolveChrome = () => {
  const configured = process.env.CHROME_PATH;
  if (configured) return existsSync(configured) ? configured : null;
  return [...CHROME_CANDIDATES, ...puppeteerChromes()].find((path) => existsSync(path)) ?? null;
};

const answers = async (url) => {
  try {
    const response = await fetch(url);
    return response.ok;
  } catch {
    return false;
  }
};

const untilReady = async (url) => {
  const deadline = Date.now() + READY_TIMEOUT_MS;
  while (Date.now() < deadline) {
    if (await answers(url)) return true;
    await wait(POLL_MS);
  }
  return false;
};

const chrome = resolveChrome();
if (chrome === null) {
  console.error(
    process.env.CHROME_PATH
      ? `CHROME_PATH points at ${process.env.CHROME_PATH}, which does not exist.`
      : 'No Chrome found. Lighthouse drives a real browser, so one has to be installed. Set' +
          ' CHROME_PATH to point at it, or install Chrome.',
  );
  process.exit(1);
}
console.log(`Chrome: ${chrome}`);

const borrowed = await answers(HEALTH);

let api = null;
let apiExited = false;
let preview = null;
let previewExited = false;

const stopApi = () => {
  if (api !== null && !apiExited) api.kill('SIGTERM');
};

const stopPreview = () => {
  if (preview !== null && !previewExited) preview.kill('SIGTERM');
};

const stopAll = () => {
  stopPreview();
  stopApi();
};

process.on('SIGINT', stopAll);
process.on('SIGTERM', stopAll);

if (borrowed) {
  console.log(`Reusing the API already answering ${HEALTH}.`);
} else {
  api = spawn('node', ['app/backend/src/index.js'], {
    env: { ...process.env, PORT: String(API_PORT), NODE_ENV: 'production' },
    stdio: ['ignore', 'ignore', 'inherit'],
  });
  api.on('exit', () => {
    apiExited = true;
  });

  if (!(await untilReady(HEALTH))) {
    stopAll();
    console.error(`The API never answered ${HEALTH} within ${String(READY_TIMEOUT_MS)}ms.`);
    process.exit(1);
  }
  console.log(`Started the API on :${String(API_PORT)}.`);
}

preview = spawn('node', ['node_modules/vite/bin/vite.js', 'preview', '--strictPort'], {
  cwd: 'app/frontend',
  stdio: ['ignore', 'ignore', 'inherit'],
});
preview.on('exit', () => {
  previewExited = true;
});

if (!(await untilReady(PREVIEW))) {
  stopAll();
  console.error(
    `The preview server never answered ${PREVIEW} within ${String(READY_TIMEOUT_MS)}ms.`,
  );
  process.exit(1);
}
console.log(`Serving the production build on :${String(PREVIEW_PORT)}.`);

const lhci = spawn('pnpm', ['exec', 'lhci', 'autorun', ...process.argv.slice(2)], {
  env: { ...process.env, CHROME_PATH: chrome },
  stdio: 'inherit',
});

const [code] = await once(lhci, 'exit');
stopAll();
process.exit(code ?? 1);
