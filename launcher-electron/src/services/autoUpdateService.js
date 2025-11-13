/**
 * Auto-Update Service
 * Automatische Game-Updates von GitHub Releases
 */

const https = require('https');
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const { app } = require('electron');
const { getGitHubApiService } = require('./githubApiService');

class AutoUpdateService {
  constructor(repo = 'Illusion') {
    this.githubApi = getGitHubApiService('99Problemsx', repo);
    this.currentVersion = '0.2.1'; // TODO: Aus package.json lesen
    this.updateCheckInterval = 3600000; // 1 Stunde
    this.updateCheckTimer = null;
    this.isChecking = false;
    this.isDownloading = false;
    this.downloadProgress = 0;
  }

  /**
   * Initialisiere Auto-Update
   */
  initialize(mainWindow) {
    this.mainWindow = mainWindow;
    
    // Check for updates on startup
    setTimeout(() => {
      this.checkForUpdates();
    }, 5000); // Nach 5 Sekunden

    // Regelmäßige Update-Checks
    this.startPeriodicChecks();
  }

  /**
   * Starte periodische Update-Checks
   */
  startPeriodicChecks() {
    if (this.updateCheckTimer) {
      clearInterval(this.updateCheckTimer);
    }

    this.updateCheckTimer = setInterval(() => {
      this.checkForUpdates();
    }, this.updateCheckInterval);
  }

  /**
   * Stoppe periodische Checks
   */
  stopPeriodicChecks() {
    if (this.updateCheckTimer) {
      clearInterval(this.updateCheckTimer);
      this.updateCheckTimer = null;
    }
  }

  /**
   * Check für Updates
   */
  async checkForUpdates(silent = true) {
    if (this.isChecking) {
      console.log('Update check already in progress');
      return null;
    }

    this.isChecking = true;

    try {
      console.log('🔍 Checking for updates...');
      
      const latestRelease = await this.getLatestRelease();
      
      if (!latestRelease) {
        console.log('No releases found');
        this.isChecking = false;
        return null;
      }

      const latestVersion = this.parseVersion(latestRelease.tag_name);
      const currentVersion = this.parseVersion(this.currentVersion);

      console.log(`Current: ${this.currentVersion}, Latest: ${latestRelease.tag_name}`);

      if (this.isNewerVersion(latestVersion, currentVersion)) {
        console.log('✨ New version available!');
        
        const updateInfo = {
          available: true,
          version: latestRelease.tag_name,
          name: latestRelease.name,
          body: latestRelease.body,
          publishedAt: latestRelease.published_at,
          downloadUrl: this.getDownloadUrl(latestRelease),
          size: this.getDownloadSize(latestRelease)
        };

        if (!silent && this.mainWindow) {
          this.mainWindow.webContents.send('update-available', updateInfo);
        }

        this.isChecking = false;
        return updateInfo;
      } else {
        console.log('✅ Already on latest version');
        this.isChecking = false;
        return { available: false };
      }
    } catch (error) {
      console.error('Failed to check for updates:', error);
      this.isChecking = false;
      return null;
    }
  }

  /**
   * Check für Updates
   */
  async checkForUpdates(silent = true) {
    if (this.isChecking) {
      console.log('Update check already in progress');
      return null;
    }

    this.isChecking = true;

    try {
      console.log('🔍 Checking for updates...');
      
      const latestRelease = await this.githubApi.getLatestRelease();
      
      if (!latestRelease) {
        console.log('No releases found');
        this.isChecking = false;
        return null;
      }

      const latestVersion = this.githubApi.parseVersion(latestRelease.tag_name);
      const currentVersion = this.githubApi.parseVersion(this.currentVersion);

      console.log(`Current: ${this.currentVersion}, Latest: ${latestRelease.tag_name}`);

      if (this.githubApi.isNewerVersion(latestVersion, currentVersion)) {
        console.log('✨ New version available!');
        
        const windowsAsset = this.githubApi.findWindowsAsset(latestRelease);
        console.log('🔍 Available assets:', latestRelease.assets.map(a => ({
          name: a.name,
          url: a.browser_download_url,
          size: a.size
        })));

        if (!windowsAsset) {
          console.log('❌ No Windows asset found!');
        } else {
          console.log('✅ Found Windows asset:', windowsAsset.name);
        }
        
        const updateInfo = {
          available: true,
          version: latestRelease.tag_name,
          name: latestRelease.name,
          body: latestRelease.body,
          publishedAt: latestRelease.published_at,
          downloadUrl: windowsAsset?.downloadUrl || null,
          size: windowsAsset?.size || 0
        };

        if (!silent && this.mainWindow) {
          this.mainWindow.webContents.send('update-available', updateInfo);
        }

        this.isChecking = false;
        return updateInfo;
      } else {
        console.log('✅ Already on latest version');
        this.isChecking = false;
        return null;
      }
    } catch (error) {
      console.error('Update check failed:', error);
      this.isChecking = false;
      return null;
    }
  }

  /**
   * Download Update
   */
  async downloadUpdate(updateInfo, installPath) {
    if (this.isDownloading) {
      throw new Error('Download already in progress');
    }

    // Check if download URL exists
    if (!updateInfo.downloadUrl) {
      throw new Error('No download available for this release. The release may not have any assets attached.');
    }

    this.isDownloading = true;
    this.downloadProgress = 0;

    try {
      console.log('📥 Downloading update...');
      
      const tempDir = path.join(app.getPath('temp'), 'mirrorbytes-update');
      await fs.mkdir(tempDir, { recursive: true });

      const zipPath = path.join(tempDir, 'update.zip');
      const extractPath = path.join(tempDir, 'extracted');

      // Download
      await this.downloadFile(updateInfo.downloadUrl, zipPath, (progress) => {
        this.downloadProgress = progress;
        if (this.mainWindow) {
          this.mainWindow.webContents.send('update-download-progress', progress);
        }
      });

      console.log('✅ Download complete');

      // Extract
      console.log('📦 Extracting update...');
      if (this.mainWindow) {
        this.mainWindow.webContents.send('update-extracting');
      }

      await fs.mkdir(extractPath, { recursive: true });
      const zip = new AdmZip(zipPath);
      zip.extractAllTo(extractPath, true);

      console.log('✅ Extraction complete');

      // Install
      console.log('🔧 Installing update...');
      if (this.mainWindow) {
        this.mainWindow.webContents.send('update-installing');
      }

      await this.installUpdate(extractPath, installPath);

      console.log('✅ Update installed successfully!');

      // Cleanup
      await fs.rm(tempDir, { recursive: true, force: true });

      this.isDownloading = false;
      this.downloadProgress = 0;

      if (this.mainWindow) {
        this.mainWindow.webContents.send('update-complete', updateInfo.version);
      }

      return true;
    } catch (error) {
      console.error('Update failed:', error);
      this.isDownloading = false;
      this.downloadProgress = 0;

      if (this.mainWindow) {
        this.mainWindow.webContents.send('update-error', error.message);
      }

      throw error;
    }
  }

  /**
   * Download File mit Progress
   */
  downloadFile(url, dest, onProgress) {
    return new Promise((resolve, reject) => {
      console.log('📥 Downloading from URL:', url);
      
      const file = fsSync.createWriteStream(dest);
      const urlObj = new URL(url);
      
      console.log('🔗 Parsed URL:', {
        hostname: urlObj.hostname,
        port: urlObj.port || 443,
        path: urlObj.pathname + urlObj.search
      });
      
      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port || 443,
        path: urlObj.pathname + urlObj.search,
        method: 'GET',
        headers: {
          'User-Agent': 'Mirrorbytes-Launcher/1.0'
        }
      };
      
      https.request(options, (response) => {
        // Handle redirects
        if (response.statusCode === 302 || response.statusCode === 301) {
          file.close();
          fsSync.unlinkSync(dest);
          return this.downloadFile(response.headers.location, dest, onProgress)
            .then(resolve)
            .catch(reject);
        }

        if (response.statusCode !== 200) {
          file.close();
          fsSync.unlinkSync(dest);
          return reject(new Error(`Download failed with status ${response.statusCode}`));
        }

        const totalSize = parseInt(response.headers['content-length'], 10);
        let downloadedSize = 0;

        response.on('data', (chunk) => {
          downloadedSize += chunk.length;
          const progress = Math.round((downloadedSize / totalSize) * 100);
          
          if (onProgress) {
            onProgress(progress);
          }
        });

        response.pipe(file);

        file.on('finish', () => {
          file.close();
          resolve();
        });

        file.on('error', (err) => {
          file.close();
          fsSync.unlink(dest, () => {});
          reject(err);
        });
      }).on('error', (err) => {
        file.close();
        fsSync.unlink(dest, () => {});
        reject(err);
      }).end();
    });
  }

  /**
   * Installiere Update
   */
  async installUpdate(sourcePath, targetPath) {
    try {
      // Backup erstellen
      const backupPath = targetPath + '_backup_' + Date.now();
      console.log(`Creating backup at ${backupPath}`);
      
      if (fsSync.existsSync(targetPath)) {
        await fs.rename(targetPath, backupPath);
      }

      // Neue Dateien kopieren
      await this.copyRecursive(sourcePath, targetPath);

      // Backup löschen wenn erfolgreich
      if (fsSync.existsSync(backupPath)) {
        await fs.rm(backupPath, { recursive: true, force: true });
      }

      return true;
    } catch (error) {
      console.error('Installation failed:', error);
      throw error;
    }
  }

  /**
   * Rekursives Kopieren
   */
  async copyRecursive(src, dest) {
    const stats = await fs.stat(src);

    if (stats.isDirectory()) {
      await fs.mkdir(dest, { recursive: true });
      const entries = await fs.readdir(src);

      for (const entry of entries) {
        await this.copyRecursive(
          path.join(src, entry),
          path.join(dest, entry)
        );
      }
    } else {
      await fs.copyFile(src, dest);
    }
  }

  /**
   * Rollback zu vorheriger Version
   */
  async rollback(installPath) {
    try {
      // Finde neuestes Backup
      const parentDir = path.dirname(installPath);
      const backupName = path.basename(installPath) + '_backup_';
      
      const files = await fs.readdir(parentDir);
      const backups = files
        .filter(f => f.startsWith(backupName))
        .sort()
        .reverse();

      if (backups.length === 0) {
        throw new Error('No backup found');
      }

      const latestBackup = path.join(parentDir, backups[0]);
      
      // Aktuelles löschen
      if (fsSync.existsSync(installPath)) {
        await fs.rm(installPath, { recursive: true, force: true });
      }

      // Backup wiederherstellen
      await fs.rename(latestBackup, installPath);

      console.log('✅ Rollback successful');
      return true;
    } catch (error) {
      console.error('Rollback failed:', error);
      throw error;
    }
  }
}

// Singleton instance
let autoUpdateServiceInstance = null;

module.exports = {
  getAutoUpdateService: (repo = 'Illusion') => {
    if (!autoUpdateServiceInstance) {
      autoUpdateServiceInstance = new AutoUpdateService(repo);
    }
    return autoUpdateServiceInstance;
  }
};
