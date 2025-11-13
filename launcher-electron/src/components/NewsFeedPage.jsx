import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiRefreshCw, FiExternalLink, FiGithub, FiAlertCircle } from 'react-icons/fi';
import NewsFeedService from '../services/newsFeedService';
import { toast } from 'react-toastify';
import { useTranslation } from '../i18n/translations';

const NewsFeedPage = ({ selectedGame }) => {
  const { t } = useTranslation();
  const [newsFeed] = useState(() => new NewsFeedService(selectedGame.repo));
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState(null);

  useEffect(() => {
    loadNews();
    
    // Auto-refresh every 30 minutes
    const interval = setInterval(loadNews, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadNews = async () => {
    setLoading(true);
    try {
      const allNews = await newsFeed.fetchAllNews();
      setNews(allNews);
    } catch (error) {
      console.error('Failed to load news:', error);
      toast.error('Fehler beim Laden der News', {
        position: 'top-right',
        autoClose: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    newsFeed.clearCache();
    await loadNews();
    toast.success('News aktualisiert!', {
      position: 'top-right',
      autoClose: 2000
    });
  };

  const getNewsTypeColor = (type) => {
    const colors = {
      'release': 'from-green-500 to-emerald-600',
      'commit': 'from-theme-primary to-theme-secondary',
      'announcement': 'from-purple-500 to-pink-600',
      'event': 'from-yellow-500 to-orange-600',
      'update': 'from-theme-accent to-theme-primary',
      'bugfix': 'from-red-500 to-orange-600'
    };
    return colors[type] || 'from-gray-500 to-gray-600';
  };

  const getNewsTypeName = (type) => {
    const names = {
      'release': 'Release',
      'commit': 'Commit',
      'announcement': 'Ankündigung',
      'event': 'Event',
      'update': 'Update',
      'bugfix': 'Bugfix'
    };
    return names[type] || 'News';
  };

  return (
    <div className="h-full p-8 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center space-x-3">
              <FiGithub className="text-purple-400" size={32} />
              <span>News & Updates</span>
            </h1>
            <p className="text-gray-400">
              Bleibe auf dem Laufenden über neue Features und Updates
            </p>
          </div>
          
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-theme-primary hover:bg-theme-secondary rounded-lg transition-all disabled:opacity-50"
          >
            <FiRefreshCw className={loading ? 'animate-spin' : ''} size={18} />
            <span>Aktualisieren</span>
          </button>
        </div>

        {/* Info Box */}
        <div className="glass-effect rounded-xl p-6 mb-8 border-2 border-theme-primary/30">
          <div className="flex items-start space-x-4">
            <div className="text-4xl">ℹ️</div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-blue-400 mb-2">{t('newsFeed')}</h3>
              <p className="text-sm text-gray-300">
                {t('newsFeedDescription')}
              </p>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && news.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin text-6xl mb-4">⏳</div>
            <p className="text-gray-400 text-lg">{t('loadingNews')}</p>
          </div>
        )}

        {/* No News State */}
        {!loading && news.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-gray-400 text-lg">{t('noNewsAvailable')}</p>
          </div>
        )}

        {/* News Grid */}
        <div className="space-y-6">
          {news.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.01 }}
              onClick={() => setSelectedNews(item)}
              className={`glass-effect rounded-xl p-6 border-2 transition-all cursor-pointer ${
                item.isPinned
                  ? 'border-yellow-500/50 bg-yellow-500/5'
                  : 'border-gray-700 hover:border-purple-500/50'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  {/* Type Badge */}
                  <div className="flex items-center space-x-2 mb-3">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full bg-gradient-to-r ${getNewsTypeColor(item.type)} text-white flex items-center space-x-1`}>
                      <span>{newsFeed.getNewsTypeEmoji(item.type)}</span>
                      <span>{getNewsTypeName(item.type)}</span>
                    </span>
                    {item.isPinned && (
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-yellow-500 text-black">
                        📌 Wichtig
                      </span>
                    )}
                    {item.isPrerelease && (
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-orange-500/30 text-orange-400 border border-orange-500/50">
                        Pre-Release
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h2 className="text-2xl font-bold mb-2">{item.title}</h2>

                  {/* Meta Info */}
                  <div className="flex items-center space-x-4 text-sm text-gray-400 mb-4">
                    <span>👤 {item.author}</span>
                    <span>📅 {newsFeed.formatDate(item.date)}</span>
                    {item.version && (
                      <span className="text-cyan-400 font-mono">{item.version}</span>
                    )}
                    {item.sha && (
                      <span className="text-blue-400 font-mono">{item.sha}</span>
                    )}
                  </div>

                  {/* Content Preview */}
                  <p className="text-gray-300 line-clamp-3 whitespace-pre-wrap">
                    {item.content}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col space-y-2 ml-4">
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 bg-purple-500 hover:bg-purple-600 rounded-lg transition-all"
                      title="Auf GitHub öffnen"
                    >
                      <FiExternalLink size={18} />
                    </a>
                  )}
                  {item.downloadUrl && (
                    <a
                      href={item.downloadUrl}
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 bg-green-500 hover:bg-green-600 rounded-lg transition-all"
                      title="Herunterladen"
                    >
                      📥
                    </a>
                  )}
                </div>
              </div>

              {/* Expand Indicator */}
              <div className="flex items-center justify-center pt-2 border-t border-gray-700">
                <span className="text-xs text-gray-500">Klicken für Details</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Detail Modal */}
        {selectedNews && (
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedNews(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-effect-strong rounded-2xl p-8 max-w-3xl w-full max-h-[80vh] overflow-y-auto border-2 border-purple-500/50"
            >
              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center space-x-2 mb-4">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full bg-gradient-to-r ${getNewsTypeColor(selectedNews.type)} text-white`}>
                    {newsFeed.getNewsTypeEmoji(selectedNews.type)} {getNewsTypeName(selectedNews.type)}
                  </span>
                  {selectedNews.version && (
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-cyan-500/30 text-cyan-400 border border-cyan-500/50 font-mono">
                      {selectedNews.version}
                    </span>
                  )}
                </div>
                <h2 className="text-3xl font-bold mb-3">{selectedNews.title}</h2>
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <span>👤 {selectedNews.author}</span>
                  <span>📅 {(() => {
                    const dateObj = selectedNews.date instanceof Date ? selectedNews.date : new Date(selectedNews.date);
                    return dateObj.toLocaleDateString('de-DE', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    });
                  })()}</span>
                </div>
              </div>

              {/* Content */}
              <div className="bg-dark-800/50 rounded-lg p-6 mb-6">
                <pre className="whitespace-pre-wrap font-sans text-gray-300 leading-relaxed">
                  {selectedNews.content}
                </pre>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {selectedNews.url && (
                    <a
                      href={selectedNews.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg transition-all"
                    >
                      <FiGithub size={18} />
                      <span>Auf GitHub öffnen</span>
                    </a>
                  )}
                  {selectedNews.downloadUrl && (
                    <a
                      href={selectedNews.downloadUrl}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg transition-all"
                    >
                      <span>📥</span>
                      <span>Herunterladen</span>
                    </a>
                  )}
                </div>
                
                <button
                  onClick={() => setSelectedNews(null)}
                  className="px-4 py-2 bg-dark-700 hover:bg-dark-600 rounded-lg transition-all"
                >
                  Schließen
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default NewsFeedPage;
