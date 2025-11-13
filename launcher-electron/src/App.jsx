import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFolder, FiSettings } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useTranslation } from './i18n/translations';
import TitleBar from './components/TitleBar';
import Sidebar from './components/Sidebar';
import GameCard from './components/GameCard';
import NewsSection from './components/NewsSection';
import BackgroundAnimation from './components/BackgroundAnimation';
import UpdateNotification from './components/UpdateNotification';
import ChangelogPage from './components/ChangelogPage';
import AchievementsPage from './components/AchievementsPage';
import RewardsPage from './components/RewardsPage';
import DailyLoginPage from './components/DailyLoginPage';
import DailyChallengesPage from './components/DailyChallengesPage';
import NewsFeedPage from './components/NewsFeedPage';
import ThemeSelectorPage from './components/ThemeSelectorPage';
import BackupPage from './components/BackupPage';
import LaunchOptionsPage from './components/LaunchOptionsPage';
import StatisticsPage from './components/StatisticsPage';
import DiscordPage from './components/DiscordPage';
import UpdatesPage from './components/UpdatesPage';
import { checkForUpdates } from './services/githubService';
import { LocalAnalytics } from './services/analytics';
import { LauncherUpdateService } from './services/launcherUpdateService';
import { AchievementManager } from './services/achievementManager';
import ThemeSystem from './services/themeSystem';
import statisticsService from './services/statisticsService';
import useKeyboardShortcuts, { ShortcutsHelp } from './hooks/useKeyboardShortcuts';

// Import games config
import gamesConfigData from '../games.config.json';

function App() {
  const { t } = useTranslation();
  
  // Load games from external config
  const GAMES = gamesConfigData.games.map(game => ({
    id: game.id,
    name: game.name,
    description: t(game.descriptionKey),
    version: game.version,
    image: game.coverImage,
    repo: game.repo.name,
    status: 'not-installed', // Status wird dynamisch geprüft
    playTime: '0h 0m', // Wird nach Installation aktualisiert
  }));
  
  const [selectedGame, setSelectedGame] = useState(GAMES[0]);
  const [activeSection, setActiveSection] = useState('home');
  const [updateInfo, setUpdateInfo] = useState(null);
  const [showUpdateNotification, setShowUpdateNotification] = useState(false);
  const [playtime, setPlaytime] = useState(0); // Spielzeit in Minuten
  const [installedVersion, setInstalledVersion] = useState(null);
  const [installPath, setInstallPath] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [launcherUpdateInfo, setLauncherUpdateInfo] = useState(null);
  const [showLauncherUpdateNotification, setShowLauncherUpdateNotification] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(null);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);

  // Initialize services using useMemo to prevent re-creation on every render
  const analytics = useMemo(() => new LocalAnalytics(), []);
  const launcherUpdateService = useMemo(() => new LauncherUpdateService(), []);
  const achievementManager = useMemo(() => new AchievementManager(), []);
  const themeSystem = useMemo(() => new ThemeSystem(), []);

  // Keyboard Shortcuts
  useKeyboardShortcuts(activeSection, setActiveSection, (action) => {
    if (action === 'showShortcuts') {
      setShowShortcutsHelp(true);
    } else if (action === 'showHelp') {
      setShowShortcutsHelp(true);
    }
  });

  // Initialize theme
  useEffect(() => {
    const theme = themeSystem.getCurrentTheme();
    setCurrentTheme(theme);
    
    // Listen for theme changes
    const handleThemeChange = (event) => {
      setCurrentTheme(event.detail);
    };
    
    window.addEventListener('themeChanged', handleThemeChange);
    return () => window.removeEventListener('themeChanged', handleThemeChange);
  }, [themeSystem]);

  // Track launcher open and check achievements
  useEffect(() => {
    analytics.trackLauncherOpen();
    achievementManager.checkAchievements(analytics);
  }, [analytics, achievementManager]);

  // Achievement notification handler
  useEffect(() => {
    achievementManager.onAchievementUnlocked((achievement) => {
      toast.success(`🏆 ${t('achievementUnlocked')}: ${achievement.name}`, {
        position: 'top-center',
        autoClose: 5000,
      });
    });
  }, [achievementManager, t]);

  // Check for launcher updates
  useEffect(() => {
    const checkInterval = launcherUpdateService.startAutoUpdateCheck((updateInfo) => {
      if (updateInfo.hasUpdate) {
        setLauncherUpdateInfo(updateInfo);
        setShowLauncherUpdateNotification(true);
      }
    });

    return () => clearInterval(checkInterval);
  }, []);

  // Check installation status
  useEffect(() => {
    const checkInstallation = async () => {
      try {
        const path = await window.electron?.getInstallPath(selectedGame.id);
        setInstallPath(path);
        
        if (path) {
          const gamePath = await window.electron?.getGamePath(selectedGame.id);
          const exists = await window.electron?.checkFileExists(gamePath);
          setIsInstalled(exists);
          
          if (exists) {
            // Try to read version
            const versionPath = gamePath.replace('Game.exe', 'VERSION.txt');
            try {
              const versionContent = await window.electron?.readFile(versionPath);
              if (versionContent) {
                setInstalledVersion(versionContent.trim());
              }
            } catch (err) {
              console.log('Could not read version');
            }
          }
        }
      } catch (error) {
        console.error('Error checking installation:', error);
      }
    };

    checkInstallation();
    // Re-check every 3 seconds to detect changes
    const interval = setInterval(checkInstallation, 3000);
    return () => clearInterval(interval);
  }, [selectedGame.id]);

  // Check for updates on app start
  useEffect(() => {
    const checkUpdates = async () => {
      const info = await checkForUpdates(selectedGame.version, selectedGame.repo);
      if (info.hasUpdate) {
        setUpdateInfo(info);
        setShowUpdateNotification(true);
      }
    };

    checkUpdates();
    // Check every 30 minutes
    const interval = setInterval(checkUpdates, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleDownloadUpdate = () => {
    if (updateInfo?.downloadUrl) {
      window.electron?.openExternal(updateInfo.downloadUrl);
    }
  };

  const handleOpenGameFolder = async () => {
    if (!installPath) {
      toast.error(t('installPathNotAvailable'), {
        position: 'top-center',
        autoClose: 3000,
      });
      return;
    }

    try {
      const result = await window.electron?.openPath(installPath);
      if (result?.success) {
        toast.success(t('folderOpened'), {
          position: 'top-center',
          autoClose: 2000,
        });
      } else {
        toast.error(`${t('error')}: ${result?.error || t('couldNotOpenFolder')}`, {
          position: 'top-center',
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error('Error opening folder:', error);
      toast.error(`${t('error')}: ${error.message}`, {
        position: 'top-center',
        autoClose: 3000,
      });
    }
  };

  return (
    <div className="w-screen h-screen overflow-hidden flex flex-col bg-dark-900">
      {/* Aurora Effect */}
      <div className="aurora-effect"></div>

      {/* Background Animation */}
      <BackgroundAnimation />

      {/* Update Notification */}
      {showUpdateNotification && (
        <UpdateNotification
          updateInfo={updateInfo}
          onClose={() => setShowUpdateNotification(false)}
          onDownload={handleDownloadUpdate}
        />
      )}

      {/* Shortcuts Help */}
      {showShortcutsHelp && (
        <ShortcutsHelp onClose={() => setShowShortcutsHelp(false)} />
      )}

      {/* Title Bar */}
      <TitleBar />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden relative z-10">
        {/* Sidebar */}
        <Sidebar
          games={GAMES}
          selectedGame={selectedGame}
          onSelectGame={setSelectedGame}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />

        {/* Main Area */}
        <main className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-500/30 scrollbar-track-transparent">
          <AnimatePresence mode="wait">
            {activeSection === 'home' && (
              <motion.div
                key="home"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="h-full flex flex-col"
              >
                {/* Hero Section */}
                <div className="flex-1 p-8 overflow-y-auto scrollbar-hide">
                  <h1 className="text-4xl font-bold mb-6">{t('yourGames')}</h1>
                  
                  {/* Games Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {GAMES.map((game) => (
                      <GameCard key={game.id} game={game} />
                    ))}
                  </div>
                  
                  {/* News Section */}
                  <div className="mt-8">
                    <NewsSection selectedGame={selectedGame} />
                  </div>
                </div>
              </motion.div>
            )}

            {activeSection === 'library' && (
              <motion.div
                key="library"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="h-full p-8 overflow-y-auto"
              >
                <h1 className="text-4xl font-bold mb-8">{t('library')}</h1>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                  {GAMES.map((game) => (
                    <motion.div
                      key={game.id}
                      whileHover={{ scale: 1.05 }}
                      className="glass-effect rounded-xl p-4 cursor-pointer"
                      onClick={() => {
                        setSelectedGame(game);
                        setActiveSection('home');
                      }}
                    >
                      <div className="aspect-video bg-dark-700 rounded-lg mb-3 overflow-hidden">
                        <img
                          src={game.image}
                          alt={game.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23242424" width="400" height="300"/%3E%3Ctext fill="%23666" font-family="sans-serif" font-size="24" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3EPokémon%3C/text%3E%3C/svg%3E';
                          }}
                        />
                      </div>
                      <h3 className="font-semibold text-lg">{game.name}</h3>
                      <p className="text-sm text-gray-400">{game.version}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeSection === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="h-full p-8 overflow-y-auto"
              >
                <h1 className="text-4xl font-bold mb-8">{t('settings')}</h1>
                
                {/* Spiel-Einstellungen */}
                <div className="glass-effect rounded-xl p-6 max-w-3xl mb-6">
                  <h2 className="text-2xl font-bold mb-4 flex items-center space-x-2">
                    <FiSettings className="text-cyan-400" />
                    <span>{t('gameSettings')}</span>
                  </h2>
                  <div className="space-y-4">
                    {/* Game Info */}
                    <div className="bg-dark-700 rounded-lg p-4">
                      <h3 className="font-semibold mb-3 flex items-center space-x-2">
                        <span>📊</span>
                        <span>{t('gameInfo')}</span>
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">{t('status')}:</span>
                          <span className="font-medium">
                            {isInstalled ? (
                              <span className="text-green-400">✅ {t('installed')}</span>
                            ) : (
                              <span className="text-gray-400">❌ {t('notInstalled')}</span>
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">{t('version')}:</span>
                          <span className="font-medium">{installedVersion || t('notAvailable')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">{t('installLocation')}:</span>
                          <span className="font-medium text-xs">{installPath || t('notAvailable')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">{t('lastUpdate')}:</span>
                          <span className="font-medium">{new Date().toLocaleDateString('de-DE')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Playtime */}
                    <div className="bg-dark-700 rounded-lg p-4">
                      <h3 className="font-semibold mb-2 flex items-center space-x-2">
                        <span>⏱️</span>
                        <span>{t('playtime')}</span>
                      </h3>
                      <div className="text-2xl font-bold text-cyan-400">
                        {Math.floor(playtime / 60)}h {playtime % 60}m
                      </div>
                      <p className="text-sm text-gray-400 mt-1">{t('totalPlaytime')}</p>
                    </div>

                    {/* Open Game Folder */}
                    <div className="bg-dark-700 rounded-lg p-4">
                      <h3 className="font-semibold mb-2 flex items-center space-x-2">
                        <FiFolder className="text-yellow-400" size={20} />
                        <span>{t('gameFolder')}</span>
                      </h3>
                      <button 
                        onClick={handleOpenGameFolder}
                        disabled={!installPath || !isInstalled}
                        className="w-full mt-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-600 hover:shadow-lg hover:shadow-yellow-500/50 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
                      >
                        {t('openGameFolder')}
                      </button>
                    </div>

                    {/* Verify Installation */}
                    <div className="bg-dark-700 rounded-lg p-4">
                      <h3 className="font-semibold mb-2 flex items-center space-x-2">
                        <span>🔍</span>
                        <span>{t('verifyInstallation')}</span>
                      </h3>
                      <button 
                        onClick={async () => {
                          const toastId = toast.loading(t('verifying'), {
                            position: 'top-center',
                          });
                          
                          try {
                            const result = await window.electronAPI.verifyInstallation(installPath);
                            
                            if (result.valid) {
                              toast.update(toastId, {
                                render: `✅ ${t('verifySuccess')} (${result.filesFound}/${result.requiredFiles} ${t('filesFound')})`,
                                type: 'success',
                                isLoading: false,
                                autoClose: 3000,
                              });
                            } else {
                              toast.update(toastId, {
                                render: `❌ ${t('verifyFailed')}: ${result.missingFiles.slice(0, 3).join(', ')}${result.missingFiles.length > 3 ? '...' : ''}`,
                                type: 'error',
                                isLoading: false,
                                autoClose: 5000,
                              });
                            }
                          } catch (error) {
                            toast.update(toastId, {
                              render: `❌ ${t('error')}: ${error.message}`,
                              type: 'error',
                              isLoading: false,
                              autoClose: 3000,
                            });
                          }
                        }}
                        disabled={!installPath || !isInstalled}
                        className="w-full mt-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-lg hover:shadow-green-500/50 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
                      >
                        {t('verifyInstallation')}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Launcher-Einstellungen */}
                <div className="glass-effect rounded-xl p-6 max-w-3xl">
                  <h2 className="text-2xl font-bold mb-4 flex items-center space-x-2">
                    <span>⚙️</span>
                    <span>{t('launcherSettings')}</span>
                  </h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">{t('language')}</label>
                      <select className="w-full bg-dark-700 border border-gray-600 rounded-lg px-4 py-2">
                        <option>Deutsch</option>
                        <option>English</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">{t('theme')}</label>
                      <select className="w-full bg-dark-700 border border-gray-600 rounded-lg px-4 py-2">
                        <option>{t('dark')}</option>
                        <option>{t('light')}</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{t('autoUpdate')}</span>
                      <input type="checkbox" className="toggle" defaultChecked />
                    </div>
                  </div>
                </div>

                {/* Statistiken */}
                <div className="glass-effect rounded-xl p-6 max-w-3xl mt-6">
                  <h2 className="text-2xl font-bold mb-4 flex items-center space-x-2">
                    <span>📊</span>
                    <span>{t('yourStats')}</span>
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-dark-700 rounded-lg p-4">
                      <p className="text-sm text-gray-400 mb-1">{t('totalPlaytime')}</p>
                      <p className="text-2xl font-bold text-cyan-400">{analytics.getStats().totalPlaytime}</p>
                    </div>
                    <div className="bg-dark-700 rounded-lg p-4">
                      <p className="text-sm text-gray-400 mb-1">{t('totalSessions')}</p>
                      <p className="text-2xl font-bold text-purple-400">{analytics.getStats().totalSessions}</p>
                    </div>
                    <div className="bg-dark-700 rounded-lg p-4">
                      <p className="text-sm text-gray-400 mb-1">{t('achievementPoints')}</p>
                      <p className="text-2xl font-bold text-yellow-400">{achievementManager.getTotalPoints()}</p>
                    </div>
                    <div className="bg-dark-700 rounded-lg p-4">
                      <p className="text-sm text-gray-400 mb-1">{t('daysActive')}</p>
                      <p className="text-2xl font-bold text-green-400">{analytics.getStats().daysActive}</p>
                    </div>
                  </div>
                  <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <p className="text-sm text-blue-400">
                      📊 {t('dataPrivacy')}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {activeSection === 'changelog' && (
              <motion.div
                key="changelog"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                <ChangelogPage />
              </motion.div>
            )}

            {activeSection === 'achievements' && (
              <motion.div
                key="achievements"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                <AchievementsPage />
              </motion.div>
            )}

            {activeSection === 'rewards' && (
              <motion.div
                key="rewards"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                <RewardsPage selectedGame={selectedGame} />
              </motion.div>
            )}

            {activeSection === 'dailylogin' && (
              <motion.div
                key="dailylogin"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                <DailyLoginPage onPointsEarned={(points) => {
                  // Update achievement manager with new points
                  achievementManager.checkAchievements(analytics);
                  toast.success(`+${points} Achievement Punkte!`, {
                    position: 'top-right',
                    autoClose: 2000
                  });
                }} selectedGame={selectedGame} />
              </motion.div>
            )}

            {activeSection === 'dailychallenges' && (
              <motion.div
                key="dailychallenges"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                <DailyChallengesPage onPointsEarned={(points) => {
                  // Update achievement manager with new points
                  achievementManager.checkAchievements(analytics);
                  toast.success(`+${points} Challenge Punkte!`, {
                    position: 'top-right',
                    autoClose: 2000
                  });
                }} selectedGame={selectedGame} />
              </motion.div>
            )}

            {activeSection === 'news' && (
              <motion.div
                key="news"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                <NewsFeedPage selectedGame={selectedGame} />
              </motion.div>
            )}

            {activeSection === 'themes' && (
              <motion.div
                key="themes"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                <ThemeSelectorPage />
              </motion.div>
            )}

            {activeSection === 'backup' && (
              <motion.div
                key="backup"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                <BackupPage selectedGame={selectedGame} />
              </motion.div>
            )}

            {activeSection === 'launchoptions' && (
              <motion.div
                key="launchoptions"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                <LaunchOptionsPage />
              </motion.div>
            )}

            {activeSection === 'statistics' && (
              <motion.div
                key="statistics"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                <StatisticsPage />
              </motion.div>
            )}

            {activeSection === 'discord' && (
              <motion.div
                key="discord"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                <DiscordPage selectedGame={selectedGame} />
              </motion.div>
            )}

            {activeSection === 'updates' && (
              <motion.div
                key="updates"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                <UpdatesPage selectedGame={selectedGame} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default App;
