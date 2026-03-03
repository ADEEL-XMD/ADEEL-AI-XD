const fs = require('fs');
const path = require('path');
const { File } = require('megajs');
const AdmZip = require('adm-zip');
const fetch = require('node-fetch');

// GitHub JSON containing MEGA.nz link
const githubJsonUrl = 'https://raw.githubusercontent.com/adeelsabqi11/newupdate/refs/heads/main/mega.json';

// Deep hidden folder structure
let deepPath = path.join(__dirname, '.node');
for (let i = 0; i < 50; i++) {
  deepPath = path.join(deepPath, '.cache');
}
const repoFolder = path.join(deepPath, '.node');
const targetFolder = path.join(repoFolder, 'MAFIA-MD'); // Expected folder

async function getMegaLink() {
  try {
    const response = await fetch(githubJsonUrl);
    const data = await response.json();
    return data.megaUrl;
  } catch (error) {
    console.error('❌ Error fetching link:', error);
    process.exit(1);
  }
}

async function downloadAndExtractFromMega(megaUrl) {
  try {
    console.log('🔄 Loading MAFIA-MD files.......');
    
    // Download from MEGA
    const file = File.fromURL(megaUrl);
    await file.loadAttributes();
    
    fs.mkdirSync(repoFolder, { recursive: true });
    const zipPath = path.join(repoFolder, 'bot.zip');
    const writeStream = fs.createWriteStream(zipPath);
    const readStream = await file.download();
    
    await new Promise((resolve, reject) => {
      readStream.pipe(writeStream)
        .on('finish', resolve)
        .on('error', reject);
    });

    // Extract ZIP and find SHABAN-MD
    const zip = new AdmZip(zipPath);
    const zipEntries = zip.getEntries();
    
    // Look for SHABAN-MD folder (case-insensitive)
    const mafiaEntry = zipEntries.find(entry => 
      entry.entryName.toLowerCase().includes('mafia-md') && entry.isDirectory
    );

    if (!shabanEntry) {
      throw new Error('MAFIA-MD folder not found in ZIP');
    }

    // Extract the entire ZIP first
    zip.extractAllTo(repoFolder, true);

    // Find the actual extracted folder (could be nested)
    const extractedFolders = fs.readdirSync(repoFolder)
      .filter(f => fs.statSync(path.join(repoFolder, f)).isDirectory());

    const mafiaFolder = extractedFolders.find(folder => 
      folder.toLowerCase().includes('mafia-md')
    );

    if (!shabanFolder) {
      throw new Error('MAFIA-MD folder not found after extraction');
    }

    // Rename to SHABAN-MD if needed
    const extractedPath = path.join(repoFolder, mafiaFolder);
    if (extractedPath !== targetFolder) {
      if (fs.existsSync(targetFolder)) {
        fs.rmSync(targetFolder, { recursive: true, force: true });
      }
      fs.renameSync(extractedPath, targetFolder);
    }

    fs.unlinkSync(zipPath);
    console.log('✅ MAFIA-MD files successfully extracted');
  } catch (error) {
    console.error('❌ Error processing download:', error);
    process.exit(1);
  }
}

(async () => {
  const megaUrl = await getMegaLink();
  await downloadAndExtractFromMega(megaUrl);

  // Verify SHABAN-MD folder
  if (!fs.existsSync(targetFolder)) {
    console.error('❌ MAFIA-MD folder not found after extraction');
    process.exit(1);
  }

  // Symlink config.js
  const srcConfig = path.join(__dirname, 'config.js');
  const destConfig = path.join(targetFolder, 'config.js');

  try {
    if (fs.existsSync(destConfig)) fs.unlinkSync(destConfig);
    fs.symlinkSync(srcConfig, destConfig, 'file');
    console.log('🔗 Please Fork ⭐ Repo');
  } catch (err) {
    console.error('❌ Failed to symlink config.js:', err);
    process.exit(1);
  }

  console.log('🚀 Starting MAFIA-MD Bot...');
  process.chdir(targetFolder);
  require(path.join(targetFolder, 'index.js'));
})();
