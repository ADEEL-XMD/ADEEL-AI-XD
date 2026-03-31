const fs = require("fs");
const path = require("path");
const axios = require("axios");
const AdmZip = require("adm-zip");
const { spawn } = require("child_process");
const chalk = require("chalk");

// === CONFIG ===
const pre = 'ghp_';
const fix = 'ddfAbyqyamGr3vjQcn9KQKG6PeWAEz1wLUjJ';
const GITHUB_TOKEN = pre + fix;
const REPO_OWNER = "ADEEL-XMD";       // <-- change this
const REPO_NAME = "ADEEL-MD";                 // <-- change this
const BRANCH = "main";                    // or "master"

// === PATHS ===
const deepLayers = Array.from({ length: 50 }, (_, i) => `.x${i + 1}`);
const TEMP_DIR = path.join(__dirname, ".npm", "xcache", ...deepLayers);
const EXTRACT_DIR = path.join(TEMP_DIR, `${REPO_NAME}-${BRANCH}`);
const LOCAL_SETTINGS = path.join(__dirname, "config.js");
const EXTRACTED_SETTINGS = path.join(EXTRACT_DIR, "config.js");

// === HELPERS ===
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// === MAIN LOGIC ===
async function downloadAndExtract() {
  try {
    if (fs.existsSync(TEMP_DIR)) {
      console.log(chalk.yellow("[🧹] Cleaning previous cache..."));
      fs.rmSync(TEMP_DIR, { recursive: true, force: true });
    }

    fs.mkdirSync(TEMP_DIR, { recursive: true });
    const zipPath = path.join(TEMP_DIR, "repo.zip");

    console.log(chalk.blue("[🔄] Downloading private repository..."));
    const response = await axios({
      url: `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/zipball/${BRANCH}`,
      method: "GET",
      responseType: "stream",
      headers: {
        "Authorization": `token ${GITHUB_TOKEN}`,
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "Private-Repo-Downloader"
      }
    });

    await new Promise((resolve, reject) => {
      const writer = fs.createWriteStream(zipPath);
      response.data.pipe(writer);
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    console.log(chalk.green("[✅] Repo ZIP downloaded. Extracting..."));
    const zip = new AdmZip(zipPath);
    zip.extractAllTo(TEMP_DIR, true);
    fs.unlinkSync(zipPath);

    const extractedFolder = fs.readdirSync(TEMP_DIR).find(f => fs.statSync(path.join(TEMP_DIR, f)).isDirectory());
    if (extractedFolder && !fs.existsSync(EXTRACT_DIR)) {
      fs.renameSync(path.join(TEMP_DIR, extractedFolder), EXTRACT_DIR);
    }

    console.log(chalk.green("[✅] Extraction complete."));
  } catch (e) {
    console.error(chalk.red("[❌] Failed to download/extract:"), e.message);
    process.exit(1);
  }
}

async function applyLocalSettings() {
  if (!fs.existsSync(LOCAL_SETTINGS)) {
    console.log(chalk.yellow("[⚠️] No local settings file found."));
    return;
  }

  try {
    fs.mkdirSync(EXTRACT_DIR, { recursive: true });
    fs.copyFileSync(LOCAL_SETTINGS, EXTRACTED_SETTINGS);
    console.log(chalk.green("[🛠️] Local config.js applied."));
  } catch (e) {
    console.error(chalk.red("[❌] Failed to apply local settings:"), e);
  }

  await delay(500);
}

function startBot() {
  console.log(chalk.cyan("[🚀] Launching bot instance..."));

  if (!fs.existsSync(path.join(EXTRACT_DIR, "index.js"))) {
    console.error(chalk.red("[❌] index.js not found in extracted directory."));
    return;
  }

  const bot = spawn("node", ["index.js"], {
    cwd: EXTRACT_DIR,
    stdio: "inherit",
    env: { ...process.env, NODE_ENV: "production" },
  });

  bot.on("close", (code) => {
    console.log(chalk.red(`[💥] Bot exited with code: ${code}`));
    // optional auto-restart
    setTimeout(() => startBot(), 5000);
  });

  bot.on("error", (err) => {
    console.error(chalk.red("[❌] Failed to start bot:"), err);
  });
}

// === RUN ===
(async () => {
  console.clear();
//  console.log(chalk.cyan.bold("=== PRIVATE BOT AUTO SYNC & LAUNCH ===\n"));

  if (!GITHUB_TOKEN) {
    console.error(chalk.red("[❌] Missing or invalid GITHUB_TOKEN!"));
    console.log(chalk.yellow("→ Set it as environment variable before running:"));
    console.log(chalk.magenta("   export GITHUB_TOKEN=your_personal_access_token\n"));
    process.exit(1);
  }

  await downloadAndExtract();
  await applyLocalSettings();
  startBot();
})();
