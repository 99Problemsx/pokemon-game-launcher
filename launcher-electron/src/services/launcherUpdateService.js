// Auto-Update Service für den Launcher selbst
export class LauncherUpdateService {
  constructor() {
    this.currentVersion = '1.0.0'; // Aus package.json lesen
    this.updateCheckInterval = 1000 * 60 * 60; // 1 Stunde
  }

  async checkForLauncherUpdate() {
    try {
      const response = await fetch(
        'https://api.github.com/repos/99Problemsx/mirrorbytes-launcher/releases/latest'
      );
      
      if (!response.ok) {
        throw new Error('Failed to check for updates');
      }

      const release = await response.json();
      const latestVersion = release.tag_name.replace('launcher-v', '');

      if (this.isNewerVersion(latestVersion, this.currentVersion)) {
        return {
          hasUpdate: true,
          version: latestVersion,
          releaseNotes: release.body,
          downloadUrl: this.getDownloadUrlForPlatform(release.assets),
          releaseDate: release.published_at,
        };
      }

      return { hasUpdate: false };
    } catch (error) {
      console.error('Error checking for launcher updates:', error);
      return { hasUpdate: false, error: error.message };
    }
  }

  isNewerVersion(latest, current) {
    const latestParts = latest.split('.').map(Number);
    const currentParts = current.split('.').map(Number);

    for (let i = 0; i < 3; i++) {
      if (latestParts[i] > currentParts[i]) return true;
      if (latestParts[i] < currentParts[i]) return false;
    }
    return false;
  }

  getDownloadUrlForPlatform(assets) {
    // Detect platform from user agent since process is not available in renderer
    const userAgent = navigator.userAgent.toLowerCase();
    let extension;

    if (userAgent.includes('win')) extension = '.exe';
    else if (userAgent.includes('mac')) extension = '.dmg';
    else extension = '.AppImage';

    const asset = assets.find(a => a.name.endsWith(extension));
    return asset?.browser_download_url;
  }

  startAutoUpdateCheck(callback) {
    // Sofort beim Start prüfen
    this.checkForLauncherUpdate().then(callback);

    // Dann regelmäßig
    return setInterval(async () => {
      const updateInfo = await this.checkForLauncherUpdate();
      callback(updateInfo);
    }, this.updateCheckInterval);
  }
}
