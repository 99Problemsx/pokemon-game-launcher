import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiSave, FiRefreshCw, FiTrash2, FiEdit2, FiFolderPlus, 
  FiDownload, FiUpload, FiSettings, FiClock, FiHardDrive,
  FiAlertCircle, FiCheckCircle
} from 'react-icons/fi';
import BackupService from '../services/backupService';
import { toast } from 'react-toastify';
import { useTranslation } from '../i18n/translations';

const BackupPage = ({ selectedGame }) => {
  const { t } = useTranslation();
  const [backupService] = useState(() => {
    try {
      return new BackupService();
    } catch (error) {
      console.warn('BackupService not available (Dev-Mode):', error);
      return null;
    }
  });
  const [backups, setBackups] = useState([]);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editingBackup, setEditingBackup] = useState(null);
  const [newName, setNewName] = useState('');
  const [savePath, setSavePath] = useState('');
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    // Prüfe ob wir im Demo-Modus sind
    if (!backupService) {
      setIsDemoMode(true);
      loadDemoData();
      return;
    }

    loadBackups();
    loadConfig();
    
    // Automatisches Scannen nach Pokemon Essentials Spielstand-Ordnern
    scanForSavePath();
  }, [backupService]);

  const scanForSavePath = async () => {
    try {
      const username = require('os').userInfo().username;
      const appdata = process.env.APPDATA || `C:\\Users\\${username}\\AppData\\Roaming`;
      
      const gameName = selectedGame.name;
      let foundPath = null;
      
      // Liste möglicher Basis-Ordner
      const possibleBasePaths = [
        appdata,  // %appdata% direkt (Essentials v21+)
        `${appdata}\\Gespeicherte Spiele`,  // Deutsch (alte Version)
        `${appdata}\\Saved Games`,          // Englisch (alte Version)
      ];
      
      // Suche nach {selectedGame.name} Ordner mit .rxdata Dateien
      if (!isDemoMode && typeof window !== 'undefined' && window.electron) {
        for (const basePath of possibleBasePaths) {
          const testPath = `${basePath}\\${gameName}`;
          
          try {
            // Prüfe ob der Ordner existiert
            const folderExists = await window.electron.checkFileExists(testPath);
            if (!folderExists) continue;
            
            // Prüfe ob .rxdata Dateien existieren (Essentials Spielstände)
            const saveFiles = [
              `${testPath}\\Game.rxdata`,     // Hauptspielstand
              `${testPath}\\File 1.rxdata`,   // Spielstand Slot 1
              `${testPath}\\File A.rxdata`,   // Alternativer Name
            ];
            
            // Wenn einer der Save-Files existiert, haben wir den richtigen Ordner gefunden
            for (const saveFile of saveFiles) {
              try {
                const fileExists = await window.electron.checkFileExists(saveFile);
                if (fileExists) {
                  foundPath = testPath;
                  console.log('✅ Spielstand-Ordner mit .rxdata Dateien gefunden:', foundPath);
                  toast.success(`✅ Spielstand-Ordner gefunden: ${gameName}`);
                  break;
                }
              } catch (err) {
                continue;
              }
            }
            
            if (foundPath) break;
          } catch (error) {
            continue;
          }
        }
      }
      
      // Wenn kein Pfad mit .rxdata gefunden wurde, nutze Standard
      if (!foundPath) {
        foundPath = `${appdata}\\${gameName}`;
        console.log('ℹ️ Kein Spielstand mit .rxdata gefunden. Standard-Pfad wird verwendet:', foundPath);
        toast.info('ℹ️ Kein Spielstand gefunden. Nutze Standard-Pfad.');
      }
      
      setSavePath(foundPath);
      if (backupService) {
        backupService.setSavePath(foundPath);
      }
    } catch (error) {
      console.warn('Fehler beim Scannen nach Spielstand-Pfad:', error);
      const fallbackPath = `C:\\Users\\%USERNAME%\\AppData\\Roaming\\${selectedGame.name}`;
      setSavePath(fallbackPath);
      toast.error('❌ Fehler beim Scannen nach Spielstand');
    }
  };

  const loadDemoData = () => {
    // Demo-Daten für Entwicklung
    setBackups([
      {
        name: 'backup_demo_1',
        displayName: 'Vor Elite Vier - 15.08.2024',
        created: new Date(Date.now() - 86400000 * 2).toISOString(),
        size: 52428800, // 50 MB
        type: 'manual'
      },
      {
        name: 'backup_demo_2',
        displayName: 'Nach 8. Arena',
        created: new Date(Date.now() - 86400000 * 7).toISOString(),
        size: 48234567,
        type: 'manual'
      },
      {
        name: 'backup_demo_3',
        displayName: t('autoBackupName'),
        created: new Date(Date.now() - 86400000 * 1).toISOString(),
        size: 51234567,
        type: 'auto'
      }
    ]);
    setConfig({
      autoBackupEnabled: true,
      autoBackupInterval: 'daily',
      maxBackups: 10,
      lastAutoBackup: new Date(Date.now() - 86400000).toISOString(),
      compressionEnabled: true
    });
    setSavePath(`C:\\Users\\Username\\Saved Games\\${selectedGame.name}`);
  };

  const loadBackups = async () => {
    if (!backupService) return;
    setLoading(true);
    try {
      const backupList = await backupService.listBackups();
      setBackups(backupList);
    } catch (error) {
      console.error('Error loading backups:', error);
      toast.error(t('couldNotLoadBackups'));
    }
    setLoading(false);
  };

  const loadConfig = () => {
    if (!backupService) return;
    try {
      const cfg = backupService.getConfig();
      setConfig(cfg);
    } catch (error) {
      console.error(t('couldNotLoadConfig'), error);
    }
  };

  const handleCreateBackup = async () => {
    if (isDemoMode) {
      toast.info(t('demoCreateBackup'));
      return;
    }
    
    setLoading(true);
    toast.info(t('creatingBackup'), { autoClose: 1000 });
    
    try {
      const result = await backupService.createBackup(`Manual Backup - ${new Date().toLocaleString()}`);
      
      if (result.success) {
        toast.success(t('backupCreatedSuccess'));
        await loadBackups();
      } else {
        toast.error(`❌ ${result.error}`);
      }
    } catch (error) {
      toast.error('❌ ' + error.message);
    }
    
    setLoading(false);
  };

  const handleRestoreBackup = async (backupName) => {
    if (isDemoMode) {
      toast.info(t('demoRestoreBackup'));
      return;
    }

    if (!window.confirm(t('confirmRestore'))) {
      return;
    }

    setLoading(true);
    toast.info(t('restoringBackup'), { autoClose: 2000 });
    
    try {
      const result = await backupService.restoreBackup(backupName);
      
      if (result.success) {
        toast.success(t('backupRestoredSuccess'));
        await loadBackups();
      } else {
        toast.error(`❌ ${result.error}`);
      }
    } catch (error) {
      toast.error('❌ ' + error.message);
    }
    
    setLoading(false);
  };

  const handleDeleteBackup = async (backupName) => {
    if (isDemoMode) {
      toast.info(t('demoDeleteBackup'));
      return;
    }

    if (!window.confirm(t('confirmDelete'))) {
      return;
    }

    try {
      const result = await backupService.deleteBackup(backupName);
      
      if (result.success) {
        toast.success(t('backupDeleted'));
        await loadBackups();
      } else {
        toast.error(`❌ ${result.error}`);
      }
    } catch (error) {
      toast.error('❌ ' + error.message);
    }
  };

  const handleRenameBackup = async (backupName) => {
    if (isDemoMode) {
      toast.info('✏️ ' + t('demoMode'));
      setEditingBackup(null);
      setNewName('');
      return;
    }

    if (!newName.trim()) {
      toast.error(t('pleaseEnterCode'));
      return;
    }

    try {
      const result = await backupService.renameBackup(backupName, newName);
      
      if (result.success) {
        toast.success(t('backupRenamed'));
        setEditingBackup(null);
        setNewName('');
        await loadBackups();
      } else {
        toast.error(`❌ ${result.error}`);
      }
    } catch (error) {
      toast.error('❌ ' + error.message);
    }
  };

  const handleUpdateConfig = (updates) => {
    if (isDemoMode) {
      toast.info('⚙️ ' + t('demoMode'));
      setConfig({ ...config, ...updates });
      return;
    }

    try {
      const newConfig = { ...config, ...updates };
      backupService.updateConfig(newConfig);
      setConfig(newConfig);
      toast.success(t('settingsSaved'));
    } catch (error) {
      toast.error('❌ ' + error.message);
    }
  };

  const handleChangeSavePath = () => {
    if (isDemoMode) {
      toast.info(t('demoOpenFolder'));
      return;
    }

    try {
      const { dialog } = window.require('@electron/remote');
      
      dialog.showOpenDialog({
        properties: ['openDirectory'],
        title: t('selectFolderTitle')
      }).then(result => {
        if (!result.canceled && result.filePaths.length > 0) {
          const path = result.filePaths[0];
          setSavePath(path);
          backupService.setSavePath(path);
          toast.success(t('pathUpdated'));
        }
      });
    } catch (error) {
      toast.error('❌ Pfad-Auswahl nicht verfügbar');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="h-full p-8 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Demo Mode Banner */}
        {isDemoMode && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-effect rounded-xl p-4 mb-6 border-2 border-yellow-500/50 bg-yellow-500/10"
          >
            <div className="flex items-center space-x-3">
              <FiAlertCircle className="text-yellow-400 flex-shrink-0" size={24} />
              <div>
                <p className="font-bold text-yellow-400">{t('demoMode')}</p>
                <p className="text-sm text-yellow-200">
                  {t('demoModeDesc')}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center space-x-3">
              <FiSave className="text-theme-accent" size={32} />
              <span>{t('backupPageTitle')}</span>
            </h1>
            <p className="text-gray-400">
              {t('backupPageDesc')}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all border border-white/10 flex items-center space-x-2"
            >
              <FiSettings size={18} />
              <span>{t('settingsButton')}</span>
            </button>
            
            <button
              onClick={handleCreateBackup}
              disabled={loading}
              className="px-6 py-2 rounded-lg font-medium transition-all text-white flex items-center space-x-2"
              style={{
                background: 'linear-gradient(to right, var(--theme-primary), var(--theme-secondary))',
                opacity: loading ? 0.5 : 1
              }}
            >
              <FiDownload size={18} />
              <span>{t('createBackupButton')}</span>
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="glass-effect rounded-xl p-6 mb-6 border-2 border-theme-primary/30"
            >
              <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
                <FiSettings className="text-theme-accent" />
                <span>{t('backupSettings')}</span>
              </h3>

              <div className="space-y-4">
                {/* Spielstand-Pfad */}
                <div>
                  <label className="block text-sm font-medium mb-2">{t('saveFolder')}</label>
                  <p className="text-xs text-gray-400 mb-2">
                    {t('saveFolderHint')}{selectedGame.name}
                    <br />
                    {t('saveFolderHint2')}
                  </p>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={savePath}
                      readOnly
                      className="flex-1 px-4 py-2 bg-dark-800 border border-gray-700 rounded-lg text-sm"
                    />
                    <button
                      onClick={() => {
                        if (isDemoMode) {
                          toast.info(t('demoScanFolder'));
                          return;
                        }
                        toast.info(t('scanningFolder'));
                        scanForSavePath();
                      }}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all border border-white/10"
                      title={t('autoScanTitle')}
                    >
                      <FiRefreshCw size={18} />
                    </button>
                    <button
                      onClick={handleChangeSavePath}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all border border-white/10"
                      title={t('selectFolderTitle')}
                    >
                      <FiFolderPlus size={18} />
                    </button>
                  </div>
                </div>

                {/* Auto-Backup */}
                <div>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config?.autoBackupEnabled || false}
                      onChange={(e) => handleUpdateConfig({ autoBackupEnabled: e.target.checked })}
                      className="w-5 h-5 rounded"
                    />
                    <span className="font-medium">{t('autoBackupEnabled')}</span>
                  </label>
                </div>

                {/* Backup-Intervall */}
                {config?.autoBackupEnabled && (
                  <div>
                    <label className="block text-sm font-medium mb-2">{t('backupInterval')}</label>
                    <select
                      value={config?.autoBackupInterval || 'daily'}
                      onChange={(e) => handleUpdateConfig({ autoBackupInterval: e.target.value })}
                      className="px-4 py-2 bg-dark-800 border border-gray-700 rounded-lg"
                    >
                      <option value="daily">{t('daily')}</option>
                      <option value="weekly">{t('weekly')}</option>
                    </select>
                  </div>
                )}

                {/* Max Backups */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t('maxBackups')}: {config?.maxBackups || 10}
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    value={config?.maxBackups || 10}
                    onChange={(e) => handleUpdateConfig({ maxBackups: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>

                {/* Backup-Ordner öffnen */}
                <button
                  onClick={() => {
                    if (isDemoMode) {
                      toast.info(t('demoOpenFolder'));
                      return;
                    }
                    try {
                      backupService.openBackupFolder();
                    } catch (error) {
                      toast.error(t('couldNotOpenFolder'));
                    }
                  }}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all border border-white/10 flex items-center space-x-2"
                >
                  <FiFolderPlus size={18} />
                  <span>{t('openBackupFolder')}</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info Box */}
        <div className="glass-effect rounded-xl p-6 mb-6 border-2 border-blue-500/30">
          <div className="flex items-start space-x-4">
            <FiAlertCircle className="text-blue-400 flex-shrink-0 mt-1" size={24} />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-blue-400 mb-2">{t('importantNotes')}</h3>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>{t('backupNote1')}</li>
                <li>{t('backupNote2')}</li>
                <li>{t('backupNote3')}</li>
                <li>{t('backupNote4')}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-effect rounded-xl p-6 border-2 border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">{t('totalBackups')}</p>
                <p className="text-3xl font-bold text-theme-accent">{backups.length}</p>
              </div>
              <FiHardDrive className="text-theme-accent" size={32} />
            </div>
          </div>

          <div className="glass-effect rounded-xl p-6 border-2 border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">{t('lastBackup')}</p>
                <p className="text-lg font-bold">
                  {backups.length > 0 ? formatDate(backups[0].created) : t('never')}
                </p>
              </div>
              <FiClock className="text-green-400" size={32} />
            </div>
          </div>

          <div className="glass-effect rounded-xl p-6 border-2 border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">{t('totalSize')}</p>
                <p className="text-2xl font-bold">
                  {formatSize(backups.reduce((sum, b) => sum + (b.size || 0), 0))}
                </p>
              </div>
              <FiSave className="text-purple-400" size={32} />
            </div>
          </div>
        </div>

        {/* Backup List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">{t('backupListTitle')}</h2>
            <button
              onClick={loadBackups}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all border border-white/10"
            >
              <FiRefreshCw size={18} />
            </button>
          </div>

          {loading && backups.length === 0 ? (
            <div className="glass-effect rounded-xl p-12 text-center">
              <div className="animate-spin mx-auto mb-4 w-12 h-12 border-4 border-theme-primary border-t-transparent rounded-full"></div>
              <p className="text-gray-400">{t('newsLoading')}...</p>
            </div>
          ) : backups.length === 0 ? (
            <div className="glass-effect rounded-xl p-12 text-center">
              <FiAlertCircle className="mx-auto mb-4 text-gray-500" size={48} />
              <p className="text-xl font-bold mb-2">{t('noBackupsYet')}</p>
              <p className="text-gray-400 mb-4">{t('createFirstBackup')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {backups.map((backup, index) => (
                <motion.div
                  key={backup.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass-effect rounded-xl p-6 border-2 border-gray-700 hover:border-theme-primary/50 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {editingBackup === backup.name ? (
                        <div className="flex items-center space-x-2 mb-2">
                          <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="Neuer Name..."
                            className="flex-1 px-3 py-2 bg-dark-800 border border-gray-700 rounded-lg"
                            autoFocus
                          />
                          <button
                            onClick={() => handleRenameBackup(backup.name)}
                            className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg transition-all"
                          >
                            <FiCheckCircle size={18} />
                          </button>
                          <button
                            onClick={() => {
                              setEditingBackup(null);
                              setNewName('');
                            }}
                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <h3 className="text-xl font-bold mb-2 flex items-center space-x-2">
                          <span>{backup.displayName}</span>
                          {backup.type === 'auto' && (
                            <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded">
                              {t('autoResolution')}
                            </span>
                          )}
                        </h3>
                      )}
                      
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-400">
                        <div>
                          <FiClock className="inline mr-2" />
                          {formatDate(backup.created)}
                        </div>
                        <div>
                          <FiHardDrive className="inline mr-2" />
                          {formatSize(backup.size || 0)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => {
                          setEditingBackup(backup.name);
                          setNewName(backup.displayName);
                        }}
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all border border-white/10"
                        title={t('renameBackup')}
                      >
                        <FiEdit2 size={18} />
                      </button>
                      
                      <button
                        onClick={() => handleRestoreBackup(backup.name)}
                        disabled={loading}
                        className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg transition-all flex items-center space-x-2"
                        title={t('restoreBackup')}
                      >
                        <FiUpload size={18} />
                        <span>{t('restoreBackup')}</span>
                      </button>
                      
                      <button
                        onClick={() => handleDeleteBackup(backup.name)}
                        className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all"
                        title={t('deleteBackup')}
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default BackupPage;
