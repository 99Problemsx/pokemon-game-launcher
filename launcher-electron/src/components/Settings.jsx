import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiFolder, FiGlobe, FiMoon, FiSun, FiToggleLeft, FiToggleRight, FiTrash2 } from 'react-icons/fi';
import { useTranslation } from '../i18n/translations';

const Settings = ({ isOpen, onClose }) => {
  const { t, language: currentLang } = useTranslation();
  const [settings, setSettings] = useState({
    installPath: localStorage.getItem('installPath') || '',
    autoUpdate: localStorage.getItem('autoUpdate') === 'true',
    language: localStorage.getItem('language') || 'de',
    theme: localStorage.getItem('theme') || 'dark'
  });

  useEffect(() => {
    // Apply theme
    document.documentElement.classList.toggle('light-theme', settings.theme === 'light');
  }, [settings.theme]);

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    localStorage.setItem(key, value.toString());
    // Reload app when language changes
    if (key === 'language') {
      setTimeout(() => window.location.reload(), 100);
    }
  };

  const clearCache = () => {
    const confirmClear = window.confirm(t('clearCacheConfirm'));
    if (confirmClear) {
      // Clear only cache-related items, keep settings
      const keysToKeep = ['installPath', 'autoUpdate', 'language', 'theme'];
      const allKeys = Object.keys(localStorage);
      allKeys.forEach(key => {
        if (!keysToKeep.includes(key)) {
          localStorage.removeItem(key);
        }
      });
      alert(t('clearCacheSuccess'));
    }
  };

  const selectInstallPath = async () => {
    if (window.electron?.selectDirectory) {
      const path = await window.electron.selectDirectory();
      if (path) {
        updateSetting('installPath', path);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="glass-effect-strong rounded-2xl border border-gray-700 max-w-3xl w-full max-h-[85vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 glass-effect-strong border-b border-gray-700 p-6 flex items-center justify-between z-10">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              {t('settings')}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <FiX size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Install Path */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-300">
                <FiFolder />
                <span>{t('installPath')}</span>
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={settings.installPath}
                  onChange={(e) => updateSetting('installPath', e.target.value)}
                  placeholder="C:\Games\Mein Spiel"
                  className="flex-1 px-4 py-3 bg-dark-700 border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-500 transition-colors text-sm break-all"
                  style={{ wordBreak: 'break-all' }}
                />
                <button
                  onClick={selectInstallPath}
                  className="px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-lg font-medium transition-all whitespace-nowrap text-sm"
                >
                  📁 {t('search')}
                </button>
              </div>
            </div>

            {/* Auto Update */}
            <div className="flex items-center justify-between p-4 bg-dark-700 rounded-lg">
              <div className="flex items-center space-x-3">
                {settings.autoUpdate ? <FiToggleRight size={24} className="text-green-400" /> : <FiToggleLeft size={24} className="text-gray-400" />}
                <div>
                  <p className="font-medium">{t('autoUpdate')}</p>
                  <p className="text-sm text-gray-400">{t('autoUpdateDesc')}</p>
                </div>
              </div>
              <button
                onClick={() => updateSetting('autoUpdate', !settings.autoUpdate)}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  settings.autoUpdate
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-gray-600 hover:bg-gray-700'
                }`}
              >
                {settings.autoUpdate ? t('on') : t('off')}
              </button>
            </div>

            {/* Language */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-300">
                <FiGlobe />
                <span>{t('language')}</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => updateSetting('language', 'de')}
                  className={`px-4 py-3 rounded-lg font-medium transition-all ${
                    settings.language === 'de'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/50'
                      : 'bg-dark-700 hover:bg-dark-600'
                  }`}
                >
                  🇩🇪 Deutsch
                </button>
                <button
                  onClick={() => updateSetting('language', 'en')}
                  className={`px-4 py-3 rounded-lg font-medium transition-all ${
                    settings.language === 'en'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/50'
                      : 'bg-dark-700 hover:bg-dark-600'
                  }`}
                >
                  🇬🇧 English
                </button>
              </div>
            </div>

            {/* Theme */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-300">
                {settings.theme === 'dark' ? <FiMoon /> : <FiSun />}
                <span>{t('theme')}</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => updateSetting('theme', 'dark')}
                  className={`px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center space-x-2 ${
                    settings.theme === 'dark'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-600 shadow-lg shadow-purple-500/50'
                      : 'bg-dark-700 hover:bg-dark-600'
                  }`}
                >
                  <FiMoon />
                  <span>{t('dark')}</span>
                </button>
                <button
                  onClick={() => updateSetting('theme', 'light')}
                  className={`px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center space-x-2 ${
                    settings.theme === 'light'
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-600 shadow-lg shadow-yellow-500/50'
                      : 'bg-dark-700 hover:bg-dark-600'
                  }`}
                >
                  <FiSun />
                  <span>{t('light')}</span>
                </button>
              </div>
            </div>

            {/* Clear Cache */}
            <div className="space-y-2">
              <button
                onClick={clearCache}
                className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-all flex items-center justify-center space-x-2"
              >
                <FiTrash2 />
                <span>{t('clearCache')}</span>
              </button>
              <p className="text-xs text-gray-400 text-center">
                {t('clearCacheDesc')}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 glass-effect-strong border-t border-gray-700 p-6">
            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 rounded-lg font-bold transition-all"
            >
              {t('close')}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Settings;
