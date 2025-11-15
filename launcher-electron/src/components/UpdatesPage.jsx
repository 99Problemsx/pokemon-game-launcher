import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useTranslation } from '../i18n/translations';

const UpdatesPage = ({ selectedGame }) => {
  const { t } = useTranslation();
  const [updateInfo, setUpdateInfo] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [currentVersion, setCurrentVersion] = useState('0.2.1');
  const [activeTab, setActiveTab] = useState('updates'); // 'updates' or 'news'
  const [releases, setReleases] = useState([]);

  useEffect(() => {
    loadSettings();
    checkForUpdates();
    loadReleases();

    // Listen for update events
    window.electronAPI?.onUpdateAvailable?.((info) => {
      setUpdateInfo(info);
      if (autoUpdate) {
        toast.info(`${t('newVersionAvailableToast')}: ${info.version}`, {
          autoClose: false,
          onClick: () => startDownload()
        });
      }
    });

    window.electronAPI?.onUpdateProgress?.((progress) => {
      setDownloadProgress(progress);
    });

    window.electronAPI?.onUpdateComplete?.((version) => {
      toast.success(`${t('updateSuccessToast')} ${version}`);
      setIsDownloading(false);
      setUpdateInfo(null);
    });

    window.electronAPI?.onUpdateError?.((error) => {
      toast.error(`${t('updateFailedToast')}: ${error}`);
      setIsDownloading(false);
    });
  }, []);

  const loadReleases = async () => {
    try {
      const response = await fetch(`https://api.github.com/repos/${selectedGame.repo.owner}/${selectedGame.repo.name}/releases`);
      const data = await response.json();
      setReleases(data.slice(0, 10)); // Top 10 releases
    } catch (error) {
      console.error('Failed to load releases:', error);
    }
  };

  const loadSettings = () => {
    const settings = JSON.parse(localStorage.getItem('launcherSettings') || '{}');
    setAutoUpdate(settings.autoUpdate !== false);
  };

  const saveSettings = () => {
    const settings = JSON.parse(localStorage.getItem('launcherSettings') || '{}');
    settings.autoUpdate = autoUpdate;
    localStorage.setItem('launcherSettings', JSON.stringify(settings));
  };

  const checkForUpdates = async () => {
    setIsChecking(true);
    try {
      const result = await window.electronAPI.checkForUpdates();
      if (result?.available) {
        setUpdateInfo(result);
        toast.info(`${t('newVersionAvailableToast')}: ${result.version}`);
      } else {
        toast.success(t('latestVersionToast'));
      }
    } catch (error) {
      toast.error(t('updateCheckFailed'));
    } finally {
      setIsChecking(false);
    }
  };

  const startDownload = async () => {
    if (!updateInfo) return;
    
    // Check if download URL exists
    if (!updateInfo.downloadUrl) {
      toast.error(`❌ ${t('noDownloadAvailable')}`, {
        autoClose: 5000
      });
      return;
    }
    
    setIsDownloading(true);
    setDownloadProgress(0);
    
    try {
      await window.electronAPI.downloadUpdate(updateInfo);
    } catch (error) {
      toast.error(`${t('downloadFailed')}: ${error.message}`);
      setIsDownloading(false);
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Header with Tabs */}
      <div className="glass-effect rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{t('news')} & {t('updatesTitle')}</h1>
            <p className="text-gray-400">
              {t('currentVersionLabel')}: <span className="text-blue-400 font-mono">{currentVersion}</span>
            </p>
          </div>
          <div className="text-6xl">
            {activeTab === 'updates' ? '🔄' : '📰'}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-2 bg-dark-700/50 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('updates')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'updates'
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            🔄 {t('updatesTitle')}
          </button>
          <button
            onClick={() => setActiveTab('news')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'news'
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            📰 {t('releaseNotes')}
          </button>
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'updates' ? (
        <>
      {/* Update Check */}
      <div className="glass-effect rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold mb-1">{t('checkForUpdates')}</h2>
            <p className="text-sm text-gray-400">
              {t('checkForUpdatesDesc')}
            </p>
          </div>
          <button
            onClick={checkForUpdates}
            disabled={isChecking || isDownloading}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-lg hover:shadow-blue-500/50 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isChecking ? (
              <span className="flex items-center space-x-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>{t('search')}...</span>
              </span>
            ) : (
              t('checkNow')
            )}
          </button>
        </div>

        {/* Auto-Update Setting */}
        <div className="flex items-center justify-between p-4 bg-dark-700 rounded-lg">
          <div>
            <p className="font-medium">{t('autoUpdateLabel')}</p>
            <p className="text-sm text-gray-400">
              {t('autoUpdateDesc')}
            </p>
          </div>
          <button
            onClick={() => {
              setAutoUpdate(!autoUpdate);
              saveSettings();
            }}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
              autoUpdate ? 'bg-green-500' : 'bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                autoUpdate ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Update Available */}
      {updateInfo && updateInfo.available && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-effect rounded-xl p-6 border-2 border-green-500/50"
        >
          <div className="flex items-start space-x-4">
            <div className="text-5xl">✨</div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-green-400 mb-2">
                {t('newVersionAvailableTitle')}
              </h2>
              <p className="text-lg mb-4">
                Version {updateInfo.version} - {updateInfo.name}
              </p>
              
              <div className="bg-dark-700 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-400 mb-2">{t('releaseDate')} {formatDate(updateInfo.publishedAt)}</p>
                <div className="prose prose-invert max-w-none">
                  <p className="text-sm whitespace-pre-wrap">
                    {updateInfo.body?.substring(0, 300)}
                    {updateInfo.body?.length > 300 && '...'}
                  </p>
                </div>
              </div>

              {updateInfo.size > 0 && (
                <p className="text-sm text-gray-400 mb-4">
                  {t('downloadSize')}: {formatBytes(updateInfo.size)}
                </p>
              )}

              {!updateInfo.downloadUrl && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-4">
                  <p className="text-yellow-400 text-sm">
                    ⚠️ {t('noInstallFile')}
                  </p>
                </div>
              )}

              {!isDownloading ? (
                <div className="flex space-x-3">
                  <button
                    onClick={startDownload}
                    disabled={!updateInfo.downloadUrl}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-lg hover:shadow-green-500/50 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t('downloadNow')}
                  </button>
                  <button
                    onClick={() => setUpdateInfo(null)}
                    className="px-6 py-3 bg-dark-700 hover:bg-dark-600 rounded-lg font-medium transition-colors"
                  >
                    {t('later')}
                  </button>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{t('downloadProgress')}</span>
                    <span className="text-sm font-mono">{downloadProgress}%</span>
                  </div>
                  <div className="w-full bg-dark-700 rounded-full h-3 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-600"
                      initial={{ width: 0 }}
                      animate={{ width: `${downloadProgress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    {t('downloadingUpdate')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Update History */}
      <div className="glass-effect rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4">{t('updateHistory')}</h2>
        
        <div className="space-y-3">
          {['0.2.1', '0.2.0', '0.1.0'].map((version, index) => (
            <div
              key={version}
              className="flex items-center justify-between p-4 bg-dark-700 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-green-500' : 'bg-gray-500'}`} />
                <div>
                  <p className="font-medium font-mono">v{version}</p>
                  <p className="text-sm text-gray-400">
                    {index === 0 ? t('currentVersionOnly') : t('previousVersionLabel')}
                  </p>
                </div>
              </div>
              {index !== 0 && (
                <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                  {t('rollback')}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="glass-effect rounded-xl p-6 bg-blue-500/10 border border-blue-500/30">
        <div className="flex items-start space-x-3">
          <span className="text-2xl">ℹ️</span>
          <div>
            <p className="font-medium text-blue-400 mb-1">{t('info')}</p>
            <p className="text-sm text-gray-300">
              {t('updatesFromGithub')}
              {t('autoBackupCreated')}
            </p>
          </div>
        </div>
      </div>
        </>
      ) : (
        /* Release Notes Tab */
        <div className="space-y-4">
          {releases.length > 0 ? (
            releases.map((release) => (
              <div key={release.id} className="glass-effect rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold mb-1">{release.name}</h3>
                    <p className="text-sm text-gray-400">
                      Version {release.tag_name} • {formatDate(release.published_at)}
                    </p>
                  </div>
                  {!release.prerelease && (
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
                      {t('stable')}
                    </span>
                  )}
                  {release.prerelease && (
                    <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-medium">
                      {t('preRelease')}
                    </span>
                  )}
                </div>
                
                <div className="prose prose-invert max-w-none">
                  <div 
                    className="text-gray-300 whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: release.body }}
                  />
                </div>

                {release.assets && release.assets.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <p className="text-sm text-gray-400 mb-2">📦 Downloads:</p>
                    <div className="flex flex-wrap gap-2">
                      {release.assets.map((asset) => (
                        <a
                          key={asset.id}
                          href={asset.browser_download_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 bg-dark-700 hover:bg-dark-600 rounded-lg text-sm transition-colors flex items-center space-x-2"
                        >
                          <span>💾</span>
                          <span>{asset.name}</span>
                          <span className="text-gray-500">({formatBytes(asset.size)})</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="glass-effect rounded-xl p-12 text-center">
              <div className="text-6xl mb-4">📰</div>
              <h3 className="text-xl font-bold mb-2">{t('noReleaseNotes')}</h3>
              <p className="text-gray-400">
                {t('newsLoading')}
              </p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default UpdatesPage;
