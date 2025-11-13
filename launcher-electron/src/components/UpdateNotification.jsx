import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiDownload, FiX, FiGift, FiExternalLink } from 'react-icons/fi';
import { parseChangelog } from '../services/githubService';

const UpdateNotification = ({ updateInfo, onClose, onDownload }) => {
  if (!updateInfo || !updateInfo.hasUpdate) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-2xl px-4"
      >
        <div className="glass-effect-strong neon-border rounded-2xl p-6 shadow-2xl">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                className="text-primary-400"
              >
                <FiGift size={32} />
              </motion.div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Neues Update verfügbar! 🎉
                </h2>
                <p className="text-gray-400 text-sm">
                  Version {updateInfo.currentVersion} → {updateInfo.latestVersion}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <FiX size={24} />
            </button>
          </div>

          {/* Changelog */}
          <div className="mb-6 max-h-64 overflow-y-auto">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
              <span>📝 Changelog</span>
            </h3>
            <div
              className="text-gray-300 text-sm space-y-2 changelog-content"
              dangerouslySetInnerHTML={{
                __html: parseChangelog(updateInfo.changelog),
              }}
            />
          </div>

          {/* Release Date */}
          <div className="text-xs text-gray-500 mb-4">
            Veröffentlicht: {new Date(updateInfo.publishedAt).toLocaleDateString('de-DE', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onDownload}
              className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-xl font-bold transition-all glow-effect"
            >
              <FiDownload size={20} />
              <span>Jetzt herunterladen</span>
            </motion.button>
            
            <motion.a
              href={updateInfo.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center space-x-2 px-6 py-3 glass-effect border border-gray-700 hover:border-primary-500 text-white rounded-xl font-bold transition-all"
            >
              <FiExternalLink size={20} />
              <span>Details</span>
            </motion.a>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default UpdateNotification;
