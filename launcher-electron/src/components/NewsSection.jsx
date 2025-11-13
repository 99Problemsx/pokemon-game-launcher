import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../i18n/translations';

const NewsSection = ({ selectedGame }) => {
  const { t } = useTranslation();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      // Fetch latest releases from GitHub
      const response = await fetch(`https://api.github.com/repos/99Problemsx/${selectedGame.repo}/releases?per_page=10`);
      const releases = await response.json();
      
      // Filter out releases created by github-actions bot and take only 3
      const filteredReleases = releases
        .filter(release => release.author?.login !== 'github-actions[bot]')
        .slice(0, 3);
      
      const newsItems = filteredReleases.map((release, index) => ({
        id: release.id,
        title: release.name || release.tag_name,
        description: release.body?.substring(0, 100) + '...' || t('newVersionAvailable'),
        date: new Date(release.published_at).toLocaleDateString('de-DE', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }),
        tag: release.prerelease ? 'Pre-Release' : 'Update',
        url: release.html_url
      }));
      
      setNews(newsItems);
    } catch (error) {
      console.error('Failed to fetch news:', error);
      // Fallback to placeholder news
      setNews([
        {
          id: 1,
          title: t('newsLoading'),
          description: t('currentUpdates'),
          date: new Date().toLocaleDateString('de-DE'),
          tag: 'Update',
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const openNewsUrl = (url) => {
    if (url && window.electron?.openExternal) {
      window.electron.openExternal(url);
    }
  };
  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">{t('news')}</h2>
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-effect rounded-xl overflow-hidden animate-pulse">
              <div className="h-40 bg-dark-700"></div>
              <div className="p-4 space-y-3">
                <div className="h-4 bg-dark-700 rounded w-3/4"></div>
                <div className="h-3 bg-dark-700 rounded"></div>
                <div className="h-3 bg-dark-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {news.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              onClick={() => openNewsUrl(item.url)}
              className="glass-effect rounded-xl overflow-hidden cursor-pointer group scale-up-hover"
            >
              <div className="relative h-40 overflow-hidden bg-gradient-to-br from-purple-900/30 to-red-900/30 flex items-center justify-center">
                <div className="text-6xl opacity-20">📰</div>
                <div className="absolute top-3 left-3">
                  <motion.span
                    whileHover={{ scale: 1.1 }}
                    className={`px-3 py-1 rounded-full text-xs font-bold glow-effect ${
                      item.tag === 'Pre-Release' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                  >
                    {item.tag}
                  </motion.span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2 group-hover:text-gradient transition-all duration-300">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                  {item.description}
                </p>
                <p className="text-xs text-gray-500">
                  {item.date}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NewsSection;
