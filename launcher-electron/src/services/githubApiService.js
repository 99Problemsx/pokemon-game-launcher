/**
 * Zentraler GitHub API Service
 * Verhindert Code-Duplikation zwischen verschiedenen Services
 */

const https = require('https');

class GitHubApiService {
  constructor(owner = '99Problemsx', repo = 'Mirrorbytes') {
    this.owner = owner;
    this.repo = repo;
    this.baseUrl = 'api.github.com';
  }

  /**
   * Generische GitHub API Request Methode
   */
  async request(endpoint, options = {}) {
    return new Promise((resolve, reject) => {
      const requestOptions = {
        hostname: this.baseUrl,
        path: endpoint,
        method: options.method || 'GET',
        headers: {
          'User-Agent': 'Mirrorbytes-Launcher',
          ...options.headers
        }
      };

      https.get(requestOptions, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          if (res.statusCode === 200) {
            try {
              resolve(JSON.parse(data));
            } catch (e) {
              reject(new Error('Failed to parse JSON response'));
            }
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        });
      }).on('error', reject);
    });
  }

  /**
   * Hole neueste Release-Informationen
   */
  async getLatestRelease() {
    return this.request(`/repos/${this.owner}/${this.repo}/releases/latest`);
  }

  /**
   * Hole alle Releases
   */
  async getAllReleases(perPage = 10) {
    return this.request(`/repos/${this.owner}/${this.repo}/releases?per_page=${perPage}`);
  }

  /**
   * Hole spezifisches Release nach Tag
   */
  async getReleaseByTag(tag) {
    return this.request(`/repos/${this.owner}/${this.repo}/releases/tags/${tag}`);
  }

  /**
   * Hole Repository-Informationen
   */
  async getRepoInfo() {
    return this.request(`/repos/${this.owner}/${this.repo}`);
  }

  /**
   * Vergleiche zwei Versionen
   */
  parseVersion(versionString) {
    const cleanVersion = versionString.replace(/^v/, '');
    const parts = cleanVersion.split('.').map(Number);
    return {
      major: parts[0] || 0,
      minor: parts[1] || 0,
      patch: parts[2] || 0,
      string: cleanVersion
    };
  }

  /**
   * Prüfe ob Version A neuer ist als Version B
   */
  isNewerVersion(versionA, versionB) {
    if (versionA.major > versionB.major) return true;
    if (versionA.major < versionB.major) return false;
    if (versionA.minor > versionB.minor) return true;
    if (versionA.minor < versionB.minor) return false;
    return versionA.patch > versionB.patch;
  }

  /**
   * Finde Download-Asset für Windows
   */
  findWindowsAsset(release) {
    if (!release.assets || release.assets.length === 0) {
      return null;
    }

    const windowsAsset = release.assets.find(asset => 
      asset.name.includes('Windows') || 
      asset.name.includes('win') ||
      asset.name.endsWith('.zip') ||
      asset.name.includes('Setup')
    );

    return windowsAsset ? {
      name: windowsAsset.name,
      downloadUrl: windowsAsset.browser_download_url,
      size: windowsAsset.size
    } : null;
  }
}

// Export als Singleton
let instance = null;

function getGitHubApiService(owner, repo) {
  if (!instance) {
    instance = new GitHubApiService(owner, repo);
  }
  return instance;
}

module.exports = { GitHubApiService, getGitHubApiService };
