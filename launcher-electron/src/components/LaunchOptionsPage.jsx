import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiTerminal, FiMonitor, FiZap, FiVolume2, FiAlertCircle, 
  FiCheckCircle, FiCode, FiCpu, FiHardDrive
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useTranslation } from '../i18n/translations';

const LaunchOptionsPage = () => {
  const { t } = useTranslation();
  const [options, setOptions] = useState({
    // Graphics
    fullscreen: false,
    resolution: 'auto',
    vsync: true,
    smoothMode: true,
    
    // Performance
    skipIntro: false,
    fastBattles: false,
    
    // Audio
    masterVolume: 100,
    musicVolume: 80,
    sfxVolume: 90,
    
    // Debug
    debugMode: false,
    showFPS: false,
    consoleEnabled: false,
    
    // Advanced
    customArgs: ''
  });

  useEffect(() => {
    loadOptions();
  }, []);

  const loadOptions = () => {
    try {
      const saved = localStorage.getItem('mirrorbytes_launch_options');
      if (saved) {
        setOptions(JSON.parse(saved));
      }
    } catch (error) {
      console.error(t('errorLoadingOptions'), error);
    }
  };

  const saveOptions = (newOptions) => {
    try {
      localStorage.setItem('mirrorbytes_launch_options', JSON.stringify(newOptions));
      setOptions(newOptions);
      toast.success(`⚙️ ${t('settingsSaved')}`);
    } catch (error) {
      console.error(t('errorSavingOptions'), error);
      toast.error(`❌ ${t('errorSavingOptions')}`);
    }
  };

  const handleOptionChange = (key, value) => {
    const newOptions = { ...options, [key]: value };
    saveOptions(newOptions);
  };

  const handleReset = () => {
    if (!window.confirm(t('resetOptionsConfirm'))) {
      return;
    }

    const defaultOptions = {
      fullscreen: false,
      resolution: 'auto',
      vsync: true,
      smoothMode: true,
      skipIntro: false,
      fastBattles: false,
      masterVolume: 100,
      musicVolume: 80,
      sfxVolume: 90,
      debugMode: false,
      showFPS: false,
      consoleEnabled: false,
      customArgs: ''
    };

    saveOptions(defaultOptions);
    toast.info(`🔄 ${t('themeResetSuccess')}`);
  };

  const resolutionOptions = [
    { value: 'auto', label: t('autoResolution') },
    { value: '1920x1080', label: '1920x1080 (Full HD)' },
    { value: '1280x720', label: '1280x720 (HD)' },
    { value: '1600x900', label: '1600x900' },
    { value: '2560x1440', label: '2560x1440 (2K)' },
    { value: '3840x2160', label: '3840x2160 (4K)' }
  ];

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
              <FiTerminal className="text-theme-accent" size={32} />
              <span>{t('launchOptionsTitle')}</span>
            </h1>
            <p className="text-gray-400">
              {t('launchOptionsDesc')}
            </p>
          </div>

          <button
            onClick={handleReset}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all border border-white/10"
          >
            🔄 {t('themeReset')}
          </button>
        </div>

        {/* Info Box */}
        <div className="glass-effect rounded-xl p-6 mb-6 border-2 border-blue-500/30">
          <div className="flex items-start space-x-4">
            <FiAlertCircle className="text-blue-400 flex-shrink-0 mt-1" size={24} />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-blue-400 mb-2">{t('info')}</h3>
              <p className="text-sm text-gray-300">
                {t('launchOptionsInfo')}
              </p>
            </div>
          </div>
        </div>

        {/* Graphics Settings */}
        <div className="glass-effect rounded-xl p-6 mb-6 border-2 border-gray-700">
          <h2 className="text-2xl font-bold mb-6 flex items-center space-x-2">
            <FiMonitor className="text-theme-accent" />
            <span>{t('graphics')}</span>
          </h2>

          <div className="space-y-6">
            {/* Fullscreen */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <label className="font-medium text-lg">{t('fullscreenMode')}</label>
                <p className="text-sm text-gray-400">{t('fullscreenDesc')}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.fullscreen}
                  onChange={(e) => handleOptionChange('fullscreen', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-theme-primary peer-checked:to-theme-secondary"></div>
              </label>
            </div>

            {/* Resolution */}
            <div>
              <label className="block font-medium text-lg mb-2">{t('resolution')}</label>
              <select
                value={options.resolution}
                onChange={(e) => handleOptionChange('resolution', e.target.value)}
                className="w-full px-4 py-3 bg-dark-800 border border-gray-700 rounded-lg focus:border-theme-primary transition-all"
              >
                {resolutionOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* VSync */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <label className="font-medium text-lg">{t('vsync')}</label>
                <p className="text-sm text-gray-400">{t('vsyncDesc')}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.vsync}
                  onChange={(e) => handleOptionChange('vsync', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-theme-primary peer-checked:to-theme-secondary"></div>
              </label>
            </div>

            {/* Smooth Mode */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <label className="font-medium text-lg">{t('smoothMode')}</label>
                <p className="text-sm text-gray-400">{t('smoothModeDesc')}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.smoothMode}
                  onChange={(e) => handleOptionChange('smoothMode', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-theme-primary peer-checked:to-theme-secondary"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Performance Settings */}
        <div className="glass-effect rounded-xl p-6 mb-6 border-2 border-gray-700">
          <h2 className="text-2xl font-bold mb-6 flex items-center space-x-2">
            <FiZap className="text-theme-accent" />
            <span>{t('performance')}</span>
          </h2>

          <div className="space-y-6">
            {/* Skip Intro */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <label className="font-medium text-lg">{t('skipIntro')}</label>
                <p className="text-sm text-gray-400">{t('skipIntroDesc')}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.skipIntro}
                  onChange={(e) => handleOptionChange('skipIntro', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-theme-primary peer-checked:to-theme-secondary"></div>
              </label>
            </div>

            {/* Fast Battles */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <label className="font-medium text-lg">{t('fastBattles')}</label>
                <p className="text-sm text-gray-400">{t('fastBattlesDesc')}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.fastBattles}
                  onChange={(e) => handleOptionChange('fastBattles', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-theme-primary peer-checked:to-theme-secondary"></div>
              </label>
            </div>
          </div>
        </div>

          {/* Audio Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-6 flex items-center space-x-2">
              <FiVolume2 className="text-theme-accent" />
              <span>{t('audio')}</span>
            </h2>          <div className="space-y-6">
            {/* Master Volume */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-medium text-lg">{t('masterVolume')}</label>
                <span className="text-theme-accent font-bold">{options.masterVolume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={options.masterVolume}
                onChange={(e) => handleOptionChange('masterVolume', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-theme-primary"
              />
            </div>

            {/* Music Volume */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-medium text-lg">{t('musicVolume')}</label>
                <span className="text-theme-accent font-bold">{options.musicVolume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={options.musicVolume}
                onChange={(e) => handleOptionChange('musicVolume', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-theme-primary"
              />
            </div>

            {/* SFX Volume */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-medium text-lg">{t('sfxVolume')}</label>
                <span className="text-theme-accent font-bold">{options.sfxVolume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={options.sfxVolume}
                onChange={(e) => handleOptionChange('sfxVolume', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-theme-primary"
              />
            </div>
          </div>
        </div>

        {/* Debug Settings */}
        <div className="glass-effect rounded-xl p-6 mb-6 border-2 border-red-500/30">
          <h2 className="text-2xl font-bold mb-6 flex items-center space-x-2">
            <FiCode className="text-red-400" />
            <span>{t('debugOptions')}</span>
          </h2>

          <div className="space-y-6">
            {/* Debug Mode */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <label className="font-medium text-lg text-red-400">{t('debugMode')}</label>
                <p className="text-sm text-gray-400">{t('debugModeDesc')}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.debugMode}
                  onChange={(e) => handleOptionChange('debugMode', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-500"></div>
              </label>
            </div>

            {/* Show FPS */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <label className="font-medium text-lg">{t('showFPS')}</label>
                <p className="text-sm text-gray-400">{t('showFPS')}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.showFPS}
                  onChange={(e) => handleOptionChange('showFPS', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-theme-primary peer-checked:to-theme-secondary"></div>
              </label>
            </div>

            {/* Console */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <label className="font-medium text-lg">{t('enableConsole')}</label>
                <p className="text-sm text-gray-400">{t('enableConsole')}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.consoleEnabled}
                  onChange={(e) => handleOptionChange('consoleEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-theme-primary peer-checked:to-theme-secondary"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Advanced Settings */}
        <div className="glass-effect rounded-xl p-6 mb-6 border-2 border-gray-700">
          <h2 className="text-2xl font-bold mb-6 flex items-center space-x-2">
            <FiCpu className="text-theme-accent" />
            <span>{t('advanced')}</span>
          </h2>

          <div>
            <label className="block font-medium text-lg mb-2">{t('customArgs')}</label>
            <p className="text-sm text-gray-400 mb-3">
              {t('customArgsDesc')}
            </p>
            <input
              type="text"
              value={options.customArgs}
              onChange={(e) => handleOptionChange('customArgs', e.target.value)}
              placeholder="z.B. --no-sandbox --disable-gpu"
              className="w-full px-4 py-3 bg-dark-800 border border-gray-700 rounded-lg focus:border-theme-primary transition-all font-mono text-sm"
            />
          </div>
        </div>

        {/* Current Settings Summary */}
        <div className="glass-effect rounded-xl p-6 border-2 border-green-500/30">
          <h3 className="text-lg font-bold text-green-400 mb-3 flex items-center space-x-2">
            <FiCheckCircle />
            <span>{t('currentConfiguration')}</span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-400">{t('fullscreen')}</p>
              <p className="font-bold">{options.fullscreen ? t('yes') : t('no')}</p>
            </div>
            <div>
              <p className="text-gray-400">{t('resolution')}</p>
              <p className="font-bold">{resolutionOptions.find(r => r.value === options.resolution)?.label}</p>
            </div>
            <div>
              <p className="text-gray-400">{t('vsync')}</p>
              <p className="font-bold">{options.vsync ? t('on') : t('off')}</p>
            </div>
            <div>
              <p className="text-gray-400">{t('masterVolume')}</p>
              <p className="font-bold">{options.masterVolume}%</p>
            </div>
            <div>
              <p className="text-gray-400">{t('debugMode')}</p>
              <p className="font-bold text-red-400">{options.debugMode ? t('active') : t('inactive')}</p>
            </div>
            <div>
              <p className="text-gray-400">{t('skipIntro')}</p>
              <p className="font-bold">{options.skipIntro ? t('yes') : t('no')}</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LaunchOptionsPage;
