import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiGift, FiDownload, FiExternalLink, FiRefreshCw } from 'react-icons/fi';
import { fetchReleases, parseChangelog } from '../services/githubService';

const ChangelogPage = () => {
  const [releases, setReleases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRelease, setSelectedRelease] = useState(null);

  useEffect(() => {
    loadReleases();
  }, []);

  const loadReleases = async () => {
    setLoading(true);
    const data = await fetchReleases();
    
    // Filter out releases created by github-actions bot
    const filteredReleases = data.filter(
      release => release.author?.login !== 'github-actions[bot]'
    );
    
    setReleases(filteredReleases);
    if (filteredReleases.length > 0) {
      setSelectedRelease(filteredReleases[0]);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <FiRefreshCw size={48} className="text-primary-400" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Release List */}
      <div className="w-80 border-r border-gray-800 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Releases</h2>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.9 }}
              onClick={loadReleases}
              className="text-gray-400 hover:text-primary-400 transition-colors"
            >
              <FiRefreshCw size={20} />
            </motion.button>
          </div>

          <div className="space-y-3">
            {releases.map((release, index) => (
              <motion.div
                key={release.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedRelease(release)}
                className={`p-4 rounded-xl cursor-pointer transition-all ${
                  selectedRelease?.id === release.id
                    ? 'glass-effect-strong neon-border'
                    : 'glass-effect hover:glass-effect-strong border border-transparent hover:border-gray-700'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-white flex items-center space-x-2">
                    {release.prerelease && (
                      <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs">
                        Pre-Release
                      </span>
                    )}
                    {index === 0 && !release.prerelease && (
                      <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs flex items-center space-x-1">
                        <FiGift size={12} />
                        <span>Neu</span>
                      </span>
                    )}
                    <span>{release.tag_name}</span>
                  </h3>
                </div>
                <p className="text-xs text-gray-400">
                  {new Date(release.published_at).toLocaleDateString('de-DE', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Release Details */}
      <div className="flex-1 overflow-y-auto">
        {selectedRelease ? (
          <div className="p-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-gradient-animated mb-3">
                  {selectedRelease.name || selectedRelease.tag_name}
                </h1>
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <span>
                    📅 {new Date(selectedRelease.published_at).toLocaleDateString('de-DE', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <span>•</span>
                  <span>👤 {selectedRelease.author.login}</span>
                  {selectedRelease.prerelease && (
                    <>
                      <span>•</span>
                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded">
                        Pre-Release
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Changelog */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-white mb-4">📝 Changelog</h2>
                
                {/* Structured Changelog (if available) */}
                {selectedRelease.structuredChangelog ? (
                  <div className="space-y-6">
                    {/* New Features */}
                    {selectedRelease.structuredChangelog.features?.length > 0 && (
                      <div className="glass-effect p-6 rounded-xl">
                        <h3 className="text-lg font-bold text-green-400 mb-3 flex items-center space-x-2">
                          <span>✨</span>
                          <span>New Features</span>
                        </h3>
                        <ul className="space-y-2">
                          {selectedRelease.structuredChangelog.features.map((feature, idx) => (
                            <li key={idx} className="text-gray-300 flex items-start space-x-2">
                              <span className="text-green-400 mt-1">▸</span>
                              <span dangerouslySetInnerHTML={{ __html: parseChangelog(feature) }} />
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {/* Bug Fixes */}
                    {selectedRelease.structuredChangelog.fixes?.length > 0 && (
                      <div className="glass-effect p-6 rounded-xl">
                        <h3 className="text-lg font-bold text-red-400 mb-3 flex items-center space-x-2">
                          <span>🐛</span>
                          <span>Bug Fixes</span>
                        </h3>
                        <ul className="space-y-2">
                          {selectedRelease.structuredChangelog.fixes.map((fix, idx) => (
                            <li key={idx} className="text-gray-300 flex items-start space-x-2">
                              <span className="text-red-400 mt-1">▸</span>
                              <span dangerouslySetInnerHTML={{ __html: parseChangelog(fix) }} />
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {/* Other Changes */}
                    {selectedRelease.structuredChangelog.other?.length > 0 && (
                      <div className="glass-effect p-6 rounded-xl">
                        <h3 className="text-lg font-bold text-blue-400 mb-3 flex items-center space-x-2">
                          <span>🔧</span>
                          <span>Other Changes</span>
                        </h3>
                        <ul className="space-y-2">
                          {selectedRelease.structuredChangelog.other.map((change, idx) => (
                            <li key={idx} className="text-gray-300 flex items-start space-x-2">
                              <span className="text-blue-400 mt-1">▸</span>
                              <span dangerouslySetInnerHTML={{ __html: parseChangelog(change) }} />
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Fallback to markdown body */
                  <div
                    className="prose prose-invert max-w-none text-gray-300 changelog-content glass-effect p-6 rounded-xl"
                    dangerouslySetInnerHTML={{
                      __html: parseChangelog(selectedRelease.body || 'Kein Changelog verfügbar'),
                    }}
                  />
                )}
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p>Wähle ein Release aus der Liste</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChangelogPage;
