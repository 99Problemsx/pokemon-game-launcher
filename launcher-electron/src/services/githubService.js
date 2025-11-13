/**
 * GitHub API Service
 * Fetches releases and changelog from repositories
 */

const REPO_OWNER = '99Problemsx';
const GITHUB_API = 'https://api.github.com';

/**
 * Fetch all releases from GitHub
 */
export async function fetchReleases(repo = 'Illusion') {
  try {
    const response = await fetch(
      `${GITHUB_API}/repos/${REPO_OWNER}/${repo}/releases`
    );
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }
    
    const releases = await response.json();
    
    // Enhance releases with structured changelog data
    const enhancedReleases = await Promise.all(
      releases.map(async (release) => {
        const changelog = await fetchChangelogJson(release.tag_name, repo);
        return {
          ...release,
          structuredChangelog: changelog,
        };
      })
    );
    
    return enhancedReleases;
  } catch (error) {
    console.error('Error fetching releases:', error);
    return [];
  }
}

/**
 * Fetch structured changelog JSON for a specific release
 */
export async function fetchChangelogJson(tagName, repo = 'Illusion') {
  try {
    const response = await fetch(
      `https://github.com/${REPO_OWNER}/${repo}/releases/download/${tagName}/changelog.json`
    );
    
    if (!response.ok) {
      return null;
    }
    
    const changelog = await response.json();
    return changelog;
  } catch (error) {
    console.log(`No structured changelog for ${tagName}`);
    return null;
  }
}

/**
 * Get the latest release
 */
export async function getLatestRelease(repo = 'Illusion') {
  try {
    const response = await fetch(
      `${GITHUB_API}/repos/${REPO_OWNER}/${repo}/releases/latest`
    );
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }
    
    const release = await response.json();
    return release;
  } catch (error) {
    console.error('Error fetching latest release:', error);
    return null;
  }
}

/**
 * Check if there's a new version available
 */
export async function checkForUpdates(currentVersion, repo = 'Illusion') {
  const latestRelease = await getLatestRelease(repo);
  
  if (!latestRelease) {
    return { hasUpdate: false };
  }
  
  const latestVersion = latestRelease.tag_name.replace('v', '');
  const current = currentVersion.replace('v', '');
  
  return {
    hasUpdate: compareVersions(latestVersion, current) > 0,
    latestVersion: latestRelease.tag_name,
    currentVersion: currentVersion,
    downloadUrl: getDownloadUrl(latestRelease),
    changelog: latestRelease.body,
    publishedAt: latestRelease.published_at,
    htmlUrl: latestRelease.html_url,
  };
}

/**
 * Get download URL for the game executable
 */
function getDownloadUrl(release) {
  // Look for .exe or .zip asset
  const asset = release.assets.find(
    (a) => a.name.endsWith('.exe') || a.name.endsWith('.zip')
  );
  
  return asset?.browser_download_url || release.html_url;
}

/**
 * Compare two semantic versions
 * Returns: 1 if v1 > v2, -1 if v1 < v2, 0 if equal
 */
function compareVersions(v1, v2) {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);
  
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const num1 = parts1[i] || 0;
    const num2 = parts2[i] || 0;
    
    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }
  
  return 0;
}

/**
 * Parse markdown changelog to HTML
 */
export function parseChangelog(markdown) {
  if (!markdown) return '';
  
  // Simple markdown parsing
  let html = markdown
    // Headers
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold mt-4 mb-2">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-6 mb-3">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>')
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
    // Code
    .replace(/`(.*?)`/g, '<code class="px-2 py-1 bg-dark-800 rounded text-primary-400">$1</code>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary-400 hover:text-primary-300 underline" target="_blank">$1</a>')
    // Lists
    .replace(/^\* (.*$)/gim, '<li class="ml-4">• $1</li>')
    .replace(/^- (.*$)/gim, '<li class="ml-4">• $1</li>')
    // Line breaks
    .replace(/\n\n/g, '<br/><br/>');
  
  return html;
}

/**
 * Download a release asset
 */
export async function downloadRelease(downloadUrl, onProgress) {
  try {
    const response = await fetch(downloadUrl);
    
    if (!response.ok) {
      throw new Error(`Download failed: ${response.status}`);
    }
    
    const contentLength = response.headers.get('content-length');
    const total = parseInt(contentLength, 10);
    let loaded = 0;
    
    const reader = response.body.getReader();
    const chunks = [];
    
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;
      
      chunks.push(value);
      loaded += value.length;
      
      if (onProgress && total) {
        onProgress({ loaded, total, progress: (loaded / total) * 100 });
      }
    }
    
    const blob = new Blob(chunks);
    return blob;
  } catch (error) {
    console.error('Error downloading release:', error);
    throw error;
  }
}
