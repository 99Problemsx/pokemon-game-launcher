// News Feed Service - Fetches news from GitHub and other sources
export class NewsFeedService {
  constructor(repo = 'Mirrorbytes') {
    this.storageKey = 'mirrorbytes_news_cache';
    this.cacheExpiry = 30 * 60 * 1000; // 30 minutes
    this.owner = '99Problemsx';
    this.repo = repo;
  }

  // Load cached news
  loadCache() {
    try {
      const cached = localStorage.getItem(this.storageKey);
      if (cached) {
        const data = JSON.parse(cached);
        const now = Date.now();
        if (now - data.timestamp < this.cacheExpiry) {
          return data.news;
        }
      }
      return null;
    } catch (error) {
      console.error('Failed to load news cache:', error);
      return null;
    }
  }

  // Save news to cache
  saveCache(news) {
    try {
      const data = {
        news: news,
        timestamp: Date.now()
      };
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save news cache:', error);
    }
  }

  // Fetch GitHub Releases as news
  async fetchGitHubReleases() {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${this.owner}/${this.repo}/releases?per_page=10`
      );
      
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }
      
      const releases = await response.json();
      
      return releases.map(release => ({
        id: `release_${release.id}`,
        type: 'release',
        title: release.name || release.tag_name,
        content: release.body || 'Keine Beschreibung verfügbar',
        date: new Date(release.published_at),
        author: release.author?.login || 'Unknown',
        url: release.html_url,
        version: release.tag_name,
        isPrerelease: release.prerelease,
        downloadUrl: release.assets[0]?.browser_download_url || null
      }));
    } catch (error) {
      console.error('Failed to fetch GitHub releases:', error);
      return [];
    }
  }

  // Fetch GitHub commits as news
  async fetchGitHubCommits() {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${this.owner}/${this.repo}/commits?per_page=5`
      );
      
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }
      
      const commits = await response.json();
      
      return commits.map(commit => ({
        id: `commit_${commit.sha}`,
        type: 'commit',
        title: commit.commit.message.split('\n')[0],
        content: commit.commit.message,
        date: new Date(commit.commit.author.date),
        author: commit.commit.author.name,
        url: commit.html_url,
        sha: commit.sha.substring(0, 7)
      }));
    } catch (error) {
      console.error('Failed to fetch GitHub commits:', error);
      return [];
    }
  }

  // Custom launcher news (can be manually added)
  getCustomNews() {
    return [
      {
        id: 'news_launcher_v1',
        type: 'announcement',
        title: '🎉 Launcher v1.0 ist da!',
        content: 'Der brandneue Mirrorbytes Launcher ist jetzt verfügbar mit vielen tollen Features:\n\n• Daily Login Belohnungen\n• Tägliche Herausforderungen\n• Achievement System\n• Mystery Gift Rewards\n• Auto-Updates\n• Und vieles mehr!',
        date: new Date('2025-10-11'),
        author: 'Mirrorbytes Team',
        url: null,
        isPinned: true
      },
      {
        id: 'news_welcome',
        type: 'announcement',
        title: '👋 Willkommen bei Mirrorbytes Studio!',
        content: 'Erlebe ein episches Abenteuer in der Welt der Pokémon. Dieser Launcher hilft dir, das Spiel zu verwalten, Updates zu installieren und deine Fortschritte zu tracken.\n\nViel Spaß beim Spielen!',
        date: new Date('2025-10-10'),
        author: 'Mirrorbytes Team',
        url: null,
        isPinned: false
      }
    ];
  }

  // Fetch all news from all sources
  async fetchAllNews() {
    try {
      // Check cache first
      const cached = this.loadCache();
      if (cached) {
        return cached;
      }

      // Fetch from all sources
      const [releases, commits, customNews] = await Promise.all([
        this.fetchGitHubReleases(),
        this.fetchGitHubCommits(),
        Promise.resolve(this.getCustomNews())
      ]);

      // Combine and sort by date
      const allNews = [...customNews, ...releases, ...commits]
        .sort((a, b) => b.date - a.date);

      // Save to cache
      this.saveCache(allNews);

      return allNews;
    } catch (error) {
      console.error('Failed to fetch news:', error);
      // Return custom news as fallback
      return this.getCustomNews();
    }
  }

  // Format date for display
  formatDate(date) {
    // Ensure date is a Date object
    const dateObj = date instanceof Date ? date : new Date(date);
    const now = new Date();
    const diff = now - dateObj;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60));
        return minutes <= 1 ? 'Gerade eben' : `Vor ${minutes} Minuten`;
      }
      return hours === 1 ? 'Vor 1 Stunde' : `Vor ${hours} Stunden`;
    } else if (days === 1) {
      return 'Gestern';
    } else if (days < 7) {
      return `Vor ${days} Tagen`;
    } else {
      return dateObj.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    }
  }

  // Get news type emoji
  getNewsTypeEmoji(type) {
    const emojis = {
      'release': '🚀',
      'commit': '💻',
      'announcement': '📢',
      'event': '🎉',
      'update': '🔄',
      'bugfix': '🐛'
    };
    return emojis[type] || '📰';
  }

  // Clear cache (for testing/refresh)
  clearCache() {
    localStorage.removeItem(this.storageKey);
  }
}

export default NewsFeedService;
