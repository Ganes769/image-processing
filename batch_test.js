const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const BASE = "http://localhost:3000";
const LOG_PATH = "batch_test_log.txt";
const OUT_DIR = "transformed_outputs";
const FIXTURES = "fixtures";
const USER = { username: "odinuser", password: "secret123" };

function log(line) {
  fs.appendFileSync(LOG_PATH, `${line}\n`);
  console.log(line);
}

function formFile(field, filePath, type) {
  const form = new FormData();
  const blob = new Blob([fs.readFileSync(filePath)], { type });
  form.append(field, blob, path.basename(filePath));
  return form;
}

async function ensureFixtures() {
  fs.mkdirSync(FIXTURES, { recursive: true });
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const jpg = path.join(FIXTURES, "sample.jpg");
  const txt = path.join(FIXTURES, "bad.txt");

  if (!fs.existsSync(jpg)) {
    await sharp({
      create: {
        width: 800,
        height: 600,
        channels: 3,
        background: { r: 80, g: 140, b: 200 },
      },
    })
      .jpeg({ quality: 80 })
      .toFile(jpg);
  }

  if (!fs.existsSync(txt)) {
    fs.writeFileSync(txt, "this is not an image");
  }

  return { jpg, txt };
}

async function getToken() {
  const login = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(USER),
  });
  const loginBody = await login.json().catch(() => ({}));
  if (login.ok && loginBody.token) return loginBody.token;

  const register = await fetch(`${BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(USER),
  });
  const registerBody = await register.json().catch(() => ({}));
  if (!registerBody.token) {
    throw new Error(`Could not get auth token: ${JSON.stringify(registerBody)}`);
  }
  return registerBody.token;
}

async function runCase(name, expected, fn) {
  log(`\n--- ${name} ---`);
  const { status, body } = await fn();
  const passed =
    expected === "success" ? status >= 200 && status < 300 : status >= 400;
  const outcome = passed
    ? expected === "success"
      ? "success"
      : "expected failure"
    : "UNEXPECTED";

  log(`HTTP_STATUS:${status}`);
  log(`BODY:${body.slice(0, 800)}`);
  log(`OUTCOME:${outcome}`);

  return { status, body, outcome, passed };
}

async function main() {
  fs.writeFileSync(LOG_PATH, "BATCH TEST LOG\n");
  const { jpg, txt } = await ensureFixtures();
  const token = await getToken();
  const auth = { Authorization: `Bearer ${token}` };

  const upload = await runCase("CASE 1 valid jpeg upload", "success", async () => {
    const res = await fetch(`${BASE}/api/images/upload`, {
      method: "POST",
      headers: auth,
      body: formFile("image", jpg, "image/jpeg"),
    });
    return { status: res.status, body: await res.text() };
  });

  if (!upload.passed) {
    throw new Error(
      "CASE 1 upload failed. Keep the server terminal visible and check the error there.",
    );
  }

  const imageId = JSON.parse(upload.body).image?.id;
  if (!imageId) {
    throw new Error("Upload response had no image.id");
  }

  await runCase("CASE 2 resize 300x300 webp", "success", async () => {
    const res = await fetch(`${BASE}/api/image/${imageId}/transform`, {
      method: "POST",
      headers: { ...auth, "Content-Type": "application/json" },
      body: JSON.stringify({
        transformation: {
          resize: { width: 300, heigth: 300 },
          format: "webp",
        },
      }),
    });
    const body = await res.text();
    try {
      const json = JSON.parse(body);
      if (json.url) {
        const img = await fetch(json.url);
        fs.writeFileSync(
          path.join(OUT_DIR, "sample_300.webp"),
          Buffer.from(await img.arrayBuffer()),
        );
      }
    } catch {
      // keep the raw body in the log even if download fails
    }
    return { status: res.status, body };
  });

  await runCase("CASE 3 invalid txt upload", "failure", async () => {
    const res = await fetch(`${BASE}/api/images/upload`, {
      method: "POST",
      headers: auth,
      body: formFile("image", txt, "text/plain"),
    });
    return { status: res.status, body: await res.text() };
  });

  await runCase("CASE 4 unexpected field name", "failure", async () => {
    const res = await fetch(`${BASE}/api/images/upload`, {
      method: "POST",
      headers: auth,
      body: formFile("photo", jpg, "image/jpeg"),
    });
    return { status: res.status, body: await res.text() };
  });

  log("\nDone. See batch_test_log.txt and transformed_outputs/");
}

main().catch((err) => {
  log(`\nSCRIPT ERROR:${err.message}`);
  process.exit(1);
});
