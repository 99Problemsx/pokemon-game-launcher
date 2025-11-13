import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlay, FiDownload, FiSettings, FiClock, FiCheck, FiRefreshCw, FiFolder } from 'react-icons/fi';
import { useToast } from './Toast';
import { useTranslation } from '../i18n/translations';
import Settings from './Settings';
import Confetti from './Confetti';
import statisticsService from '../services/statisticsService';

const GameCard = ({ game }) => {
  const { t } = useTranslation();
  const [isLaunching, setIsLaunching] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [checkingInstall, setCheckingInstall] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [installPath, setInstallPath] = useState('');
  const [installedVersion, setInstalledVersion] = useState(game.version); // Default to prop version
  const [playtime, setPlaytime] = useState(0); // in minutes
  const [sessionStart, setSessionStart] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [retryCount, setRetryCount] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  
  const { toasts, addToast, removeToast, ToastContainer } = useToast();

  // Check online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      addToast(t('connectionRestored'), 'success', 3000);
    };
    const handleOffline = () => {
      setIsOnline(false);
      addToast(t('noInternet'), 'warning', 5000);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Check if game is installed on component mount
  useEffect(() => {
    checkGameInstalled();
    loadInstallPath();
    loadPlaytime();
  }, [game.id]);

  // Update playtime display every minute when game is running
  useEffect(() => {
    if (isLaunching && sessionStart) {
      const interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - sessionStart) / 1000 / 60);
        setPlaytime(prev => {
          const newTotal = prev + 1;
          localStorage.setItem(`${game.id}_playtime`, newTotal.toString());
          return newTotal;
        });
      }, 60000); // Every minute

      return () => clearInterval(interval);
    }
  }, [isLaunching, sessionStart, game.id]);

  const loadPlaytime = () => {
    const stored = localStorage.getItem(`${game.id}_playtime`);
    if (stored) {
      setPlaytime(parseInt(stored, 10));
    }
  };

  const formatPlaytime = (minutes) => {
    if (minutes < 60) {
      return `${minutes} Min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const loadInstallPath = async () => {
    try {
      const path = await window.electron?.getInstallPath(game.id);
      setInstallPath(path || 'N/A');
    } catch (error) {
      console.error('Error loading install path:', error);
      setInstallPath('N/A');
    }
  };

  const checkGameInstalled = async () => {
    setCheckingInstall(true);
    console.log('Checking if game is installed...');
    
    try {
      if (!window.electron) {
        console.error('Electron API not available');
        setIsInstalled(false);
        setCheckingInstall(false);
        return;
      }

      const path = await window.electron.getGamePath(game.id);
      console.log('Game path:', path);
      
      if (!path) {
        console.log('No game path configured');
        setIsInstalled(false);
        setCheckingInstall(false);
        return;
      }

      const exists = await window.electron.checkFileExists(path);
      console.log('Game exists:', exists);
      setIsInstalled(exists);
      setInstallPath(path); // Save the actual install path
      
      // Try to read VERSION.txt
      if (exists) {
        const versionPath = path.replace('Game.exe', 'VERSION.txt');
        try {
          const versionContent = await window.electron.readFile(versionPath);
          if (versionContent) {
            setInstalledVersion(versionContent.trim());
            console.log('Installed version:', versionContent.trim());
          }
        } catch (err) {
          console.log('Could not read VERSION.txt, using default');
        }
      }
    } catch (error) {
      console.error('Error checking game installation:', error);
      setIsInstalled(false);
    } finally {
      setCheckingInstall(false);
    }
  };

  const handlePlay = async (launchFlags = []) => {
    setIsLaunching(true);
    setSessionStart(Date.now()); // Start playtime tracking
    
    try {
      // Track launch in statistics
      statisticsService.trackGameLaunch();
      
      const result = await window.electron?.launchGame(game.id, launchFlags);
      
      if (result?.success) {
        console.log('Game launched successfully with flags:', launchFlags);
        console.log('⏱️ Playtime tracking started');
        addToast(t('gameStarted'), 'success', 2000);
      } else {
        console.error('Failed to launch game:', result?.message);
        setSessionStart(null); // Reset if launch failed
        addToast(`${t('errorStarting')}: ${result?.message || t('unknownError')}`, 'error', 5000);
      }
    } catch (error) {
      console.error('Error launching game:', error);
      addToast(`${t('error')}: ${error.message}`, 'error', 5000);
      setSessionStart(null); // Reset if launch failed
    } finally {
      // Game closed
      if (sessionStart) {
        const sessionDuration = Math.floor((Date.now() - sessionStart) / 1000 / 60);
        const newTotal = playtime + sessionDuration;
        setPlaytime(newTotal);
        localStorage.setItem(`${game.id}_playtime`, newTotal.toString());
        console.log(`⏱️ Session ended: ${sessionDuration} minutes (Total: ${newTotal} minutes)`);
        if (sessionDuration > 0) {
          addToast(`${t('sessionDuration')}: ${sessionDuration} ${t('min')}`, 'info', 3000);
        }
        setSessionStart(null);
      }
      setIsLaunching(false);
    }
  };

  const handleDownload = async (isRetry = false) => {
    if (!isOnline) {
      addToast(t('noInternetCheck'), 'error', 5000);
      return;
    }

    setIsDownloading(true);
    setIsExtracting(false);
    setDownloadProgress(0);

    if (isRetry) {
      addToast(`${t('retry')} ${retryCount + 1}/3...`, 'info', 3000);
    } else {
      setRetryCount(0);
      addToast(t('downloadStarted'), 'info', 2000);
    }

    try {
      console.log('🚀 Starting download from GitHub releases...');
      console.log('📦 Repository: https://github.com/99Problemsx/' + game.repo + '/releases');
      
      // Get latest release download URL
      const result = await window.electron?.downloadGame(
        game.id, 
        (progressData) => {
          // Handle both old (number) and new (object) progress format
          if (typeof progressData === 'number') {
            console.log(`📊 Download progress: ${progressData.toFixed(0)}%`);
            setDownloadProgress(progressData);
          } else {
            console.log(`📊 Download progress: ${progressData.percent}%`);
            setDownloadProgress(progressData.percent);
          }
        },
        (extracting) => {
          console.log('📦 Extracting:', extracting);
          setIsExtracting(extracting);
          if (extracting) {
            addToast(t('extracting'), 'info', 2000);
          }
        }
      );

      if (result?.success) {
        console.log('✅ Game downloaded successfully!');
        console.log('💾 Saved to:', result.path);
        if (result.extracted) {
          console.log('📦 ZIP file extracted automatically');
        }
        setIsInstalled(true);
        setRetryCount(0);
        addToast(`✅ ${t('downloadSuccess')}`, 'success', 4000);
        setShowConfetti(true); // 🎉 Trigger confetti!
        setTimeout(() => setShowConfetti(false), 3000);
        // Re-check installation to update UI
        setTimeout(() => checkGameInstalled(), 1000);
      } else {
        console.error('❌ Download failed:', result?.message);
        throw new Error(result?.message || 'Unbekannter Fehler');
      }
    } catch (error) {
      console.error('❌ Error downloading game:', error);
      console.error('📋 Full error details:', error.message);
      
      // Exponential backoff retry logic
      if (retryCount < 3) {
        const backoffDelay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
        addToast(
          `Fehler: ${error.message}. Wiederholung in ${backoffDelay / 1000}s...`,
          'warning',
          backoffDelay
        );
        
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          handleDownload(true);
        }, backoffDelay);
      } else {
        addToast(
          `Download fehlgeschlagen: ${error.message}. Bitte versuche es später erneut.`,
          'error',
          0 // No auto-dismiss for final error
        );
        setRetryCount(0);
      }
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  const handleUninstall = async () => {
    if (!window.confirm(t('uninstallConfirm'))) {
      return;
    }

    addToast(t('uninstallStarting'), 'info', 2000);

    try {
      const result = await window.electron?.uninstallGame(game.id);
      
      if (result?.success) {
        console.log('✅ Game uninstalled successfully');
        setIsInstalled(false);
        setInstallPath('');
        setInstalledVersion(game.version);
        addToast(`✅ ${t('uninstallSuccess')}`, 'success', 4000);
        // Re-check installation to update UI
        setTimeout(() => checkGameInstalled(), 500);
      } else {
        console.error('❌ Uninstall failed:', result?.message);
        addToast(`${t('errorUninstalling')}: ${result?.message || t('unknownError')}`, 'error', 5000);
      }
    } catch (error) {
      console.error('❌ Error uninstalling game:', error);
      addToast(`${t('error')}: ${error.message}`, 'error', 5000);
    }
  };

  const handleOpenFolder = async () => {
    if (!installPath) {
      addToast(t('installPathNotAvailable'), 'error', 3000);
      return;
    }

    try {
      const result = await window.electron?.openPath(installPath);
      if (result?.success) {
        console.log('✅ Opened folder successfully');
      } else {
        addToast(`${t('error')}: ${result?.error || t('couldNotOpenFolder')}`, 'error', 3000);
      }
    } catch (error) {
      console.error('❌ Error opening folder:', error);
      addToast(`${t('error')}: ${error.message}`, 'error', 3000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-2xl overflow-hidden glass-effect-strong neon-border"
    >
      {/* Hero Image */}
      <div className="relative h-96 overflow-hidden particle-container">
        <motion.img
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8 }}
          src={game.image}
          alt={game.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="400"%3E%3Cdefs%3E%3ClinearGradient id="g" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%23667eea;stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:%23764ba2;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill="url(%23g)" width="800" height="400"/%3E%3C/svg%3E';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/50 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-8">
        {/* Game Info */}
        <div className="mb-6">
          <motion.h1
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-3xl md:text-4xl lg:text-5xl mb-2 text-gradient-animated leading-tight"
            style={{ 
              fontWeight: 'bold',
              color: 'transparent',
              WebkitTextFillColor: 'transparent'
            }}
          >
            {game.name}
          </motion.h1>
          <motion.p
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-sm md:text-base lg:text-lg text-gray-300 mb-4"
          >
            {game.description}
          </motion.p>
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center space-x-6 text-sm text-gray-400"
          >
            <div className="flex items-center space-x-2">
              <FiClock size={16} />
              <span>{game.playTime}</span>
            </div>
            <div>
              <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold glow-effect">
                {installedVersion}
              </span>
            </div>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center space-x-4"
        >
          {checkingInstall ? (
            <motion.button
              disabled
              className="px-8 py-4 bg-gray-600 cursor-not-allowed rounded-xl font-bold text-lg flex items-center space-x-3"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <FiSettings size={24} />
              </motion.div>
              <span>Prüfe Installation...</span>
            </motion.button>
          ) : isInstalled ? (
            <>
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(239, 68, 68, 0.6)' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePlay()}
                disabled={isLaunching}
                className={`flex-1 px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center space-x-3 transition-all ripple ${
                  isLaunching
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-red-500 to-purple-600 hover:shadow-2xl hover:shadow-red-500/50 shine-effect glow-effect'
                }`}
              >
                <FiPlay size={24} />
                <span>{isLaunching ? t('starting') : t('playGame')}</span>
              </motion.button>
              
              {/* Uninstall Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleUninstall}
                className="p-4 bg-gradient-to-r from-gray-600 to-gray-700 hover:shadow-lg hover:shadow-gray-500/50 rounded-xl transition-all"
                title={t('uninstallGame')}
              >
                <FiRefreshCw size={24} className="rotate-180" />
              </motion.button>
            </>
          ) : isDownloading ? (
            <div className="flex-1">
              <motion.div className="relative">
                <div 
                  className="px-8 py-4 rounded-xl font-bold text-lg text-center"
                  style={{
                    background: `linear-gradient(to right, var(--theme-primary), var(--theme-secondary))`
                  }}
                >
                  <div className="flex items-center justify-center space-x-3 mb-2">
                    <motion.div
                      animate={{ rotate: isExtracting ? 360 : 0 }}
                      transition={{ duration: 1, repeat: isExtracting ? Infinity : 0, ease: 'linear' }}
                    >
                      {isExtracting ? <FiSettings size={24} /> : <FiDownload size={24} />}
                    </motion.div>
                    <span>
                      {isExtracting 
                        ? `${t('extracting')} 📦`
                        : `${t('downloading')} ${Math.round(downloadProgress)}%`
                      }
                    </span>
                  </div>
                  {/* Progress Bar */}
                  {!isExtracting && (
                    <div className="w-full bg-dark-800/50 rounded-full h-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${downloadProgress}%` }}
                        className="h-full glow-effect"
                        style={{
                          background: `linear-gradient(to right, #4ade80, var(--theme-accent))`
                        }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDownload}
              className="px-8 py-4 hover:shadow-2xl rounded-xl font-bold text-lg flex items-center space-x-3 transition-all shine-effect glow-effect"
              style={{ 
                background: `linear-gradient(to right, var(--theme-primary), var(--theme-secondary))`,
                boxShadow: `0 0 20px var(--theme-primary)`
              }}
            >
              <FiDownload size={24} />
              <span>HERUNTERLADEN</span>
            </motion.button>
          )}
        </motion.div>

        {/* Settings button removed - now in Sidebar */}
      </div>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <Settings isOpen={showSettings} onClose={() => setShowSettings(false)} />
      <Confetti isActive={showConfetti} duration={3000} />
    </motion.div>
  );
};

export default GameCard;
