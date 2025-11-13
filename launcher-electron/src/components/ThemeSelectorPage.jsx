import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCheck, FiSun, FiMoon, FiDroplet } from 'react-icons/fi';
import ThemeSystem from '../services/themeSystem';
import { toast } from 'react-toastify';
import { useTranslation } from '../i18n/translations';

const ThemeSelectorPage = () => {
  const { t } = useTranslation();
  const [themeSystem] = useState(() => new ThemeSystem());
  const [themes, setThemes] = useState([]);
  const [currentTheme, setCurrentTheme] = useState(null);

  useEffect(() => {
    loadThemes();
  }, []);

  const loadThemes = () => {
    const allThemes = themeSystem.getThemes();
    const current = themeSystem.getCurrentTheme();
    setThemes(allThemes);
    setCurrentTheme(current);
  };

  const handleThemeChange = (themeId) => {
    const newTheme = themeSystem.changeTheme(themeId);
    if (newTheme) {
      setCurrentTheme(newTheme);
      toast.success(`🎨 ${t('themeActivated').replace('{name}', newTheme.name)}`, {
        position: 'top-center',
        autoClose: 2000,
      });
    }
  };

  const handleReset = () => {
    const defaultTheme = themeSystem.resetTheme();
    setCurrentTheme(defaultTheme);
    toast.info(`🔄 ${t('themeResetSuccess')}`, {
      position: 'top-center',
      autoClose: 2000,
    });
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
              <FiDroplet className="text-purple-400" size={32} />
              <span>{t('themesTitle')}</span>
            </h1>
            <p className="text-gray-400">
              {t('themesDesc')}
            </p>
          </div>

          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all"
          >
            🔄 {t('themeReset')}
          </button>
        </div>

        {/* Current Theme Info */}
        {currentTheme && (
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="glass-effect rounded-xl p-6 mb-8 border-2 border-purple-500/50"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-1">{t('currentTheme')}</h2>
                <p className="text-gray-400">{currentTheme.description}</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm text-gray-400">Theme</p>
                  <p className="text-xl font-bold">{currentTheme.name}</p>
                </div>
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${currentTheme.gradient} shadow-lg`}>
                </div>
              </div>
            </div>

            {/* Color Preview */}
            <div className="mt-4 pt-4 border-t border-gray-700">
              <p className="text-sm text-gray-400 mb-3">{t('colorPalette')}:</p>
              <div className="flex items-center space-x-3">
                <div className="flex flex-col items-center">
                  <div 
                    className="w-12 h-12 rounded-lg shadow-lg"
                    style={{ backgroundColor: currentTheme.primary }}
                  ></div>
                  <span className="text-xs text-gray-400 mt-1">{t('primary')}</span>
                </div>
                <div className="flex flex-col items-center">
                  <div 
                    className="w-12 h-12 rounded-lg shadow-lg"
                    style={{ backgroundColor: currentTheme.secondary }}
                  ></div>
                  <span className="text-xs text-gray-400 mt-1">{t('secondary')}</span>
                </div>
                <div className="flex flex-col items-center">
                  <div 
                    className="w-12 h-12 rounded-lg shadow-lg"
                    style={{ backgroundColor: currentTheme.accent }}
                  ></div>
                  <span className="text-xs text-gray-400 mt-1">{t('accent')}</span>
                </div>
                <div className="flex flex-col items-center">
                  <div 
                    className="w-12 h-12 rounded-lg shadow-lg border border-gray-600"
                    style={{ backgroundColor: currentTheme.background }}
                  ></div>
                  <span className="text-xs text-gray-400 mt-1">{t('themeBackground')}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Info Box */}
        <div className="glass-effect rounded-xl p-6 mb-8 border-2 border-blue-500/30">
          <div className="flex items-start space-x-4">
            <div className="text-4xl">💡</div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-blue-400 mb-2">{t('themeSystem')}</h3>
              <p className="text-sm text-gray-300">
                {t('themeSystemDesc')}
              </p>
            </div>
          </div>
        </div>

        {/* Theme Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center space-x-2">
            <FiMoon className="text-purple-400" />
            <span>{t('darkThemes')}</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {themes.filter(t => t.isDark).map((theme, index) => {
              const isActive = currentTheme && currentTheme.id === theme.id;
              
              return (
                <motion.div
                  key={theme.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.03 }}
                  onClick={() => handleThemeChange(theme.id)}
                  className={`glass-effect rounded-xl p-6 border-2 transition-all cursor-pointer ${
                    isActive
                      ? 'border-theme-primary bg-theme-primary/10 shadow-lg'
                      : 'border-gray-700 hover:border-theme-primary/50'
                  }`}
                  style={isActive ? { boxShadow: `var(--theme-primary) 0px 0px 20px` } : {}}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-1">{theme.name}</h3>
                      <p className="text-sm text-gray-400">{theme.description}</p>
                    </div>
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="bg-theme-primary rounded-full p-2"
                      >
                        <FiCheck size={18} className="text-white" />
                      </motion.div>
                    )}
                  </div>

                  {/* Preview Card */}
                  <div 
                    className={`h-32 rounded-lg bg-gradient-to-br ${theme.gradient} shadow-lg mb-4 flex items-center justify-center`}
                  >
                    <div className="text-white text-2xl font-bold opacity-80">
                      {theme.name}
                    </div>
                  </div>

                  {/* Color Swatches */}
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-8 h-8 rounded-lg shadow"
                      style={{ backgroundColor: theme.primary }}
                    ></div>
                    <div 
                      className="w-8 h-8 rounded-lg shadow"
                      style={{ backgroundColor: theme.secondary }}
                    ></div>
                    <div 
                      className="w-8 h-8 rounded-lg shadow"
                      style={{ backgroundColor: theme.accent }}
                    ></div>
                    <div className="flex-1"></div>
                    <button
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        isActive
                          ? 'text-white'
                          : 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 hover:border-white/20'
                      }`}
                      style={isActive ? {
                        background: `linear-gradient(to right, ${theme.primary}, ${theme.secondary})`
                      } : {}}
                    >
                      {isActive ? `${t('active')} ✓` : t('selectTheme')}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Theme Tips */}
        <div className="glass-effect rounded-xl p-6 border-2 border-green-500/30">
          <h3 className="text-lg font-bold text-green-400 mb-3">💡 {t('themeTips')}</h3>
          <ul className="text-sm text-gray-300 space-y-2">
            <li>• {t('themeTip1')}</li>
            <li>• {t('themeTip2')}</li>
            <li>• {t('themeTip3')}</li>
            <li>• {t('themeTip4')}</li>
            <li>• {t('themeTip5')}</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
};

export default ThemeSelectorPage;
