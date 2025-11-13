/**
 * BackupService - Verwaltet Spielstand-Backups
 * 
 * Features:
 * - Automatische Backups (konfigurierbar)
 * - Manuelles Backup/Restore
 * - Backup-Historie mit Metadaten
 * - Komprimierte Backups (ZIP)
 * - Backup-Verwaltung (löschen, umbenennen)
 */

// Try to load Electron modules, fail gracefully in dev mode
let fs, path, app;

// Check if window.require exists (only in Electron environment)
if (typeof window !== 'undefined' && typeof window.require === 'function') {
  try {
    fs = window.require('fs');
    path = window.require('path');
    const electron = window.require('@electron/remote');
    app = electron.app;
  } catch (error) {
    console.warn('BackupService: Failed to load Electron modules:', error);
  }
} else {
  console.warn('BackupService: window.require not available (running in dev mode without Electron)');
}

class BackupService {
  constructor() {
    // Wenn Electron nicht verfügbar ist, werfe einen Fehler der vom UI abgefangen werden kann
    if (!fs || !path || !app) {
      throw new Error('BackupService requires Electron environment');
    }

    this.storageKey = 'mirrorbytes_backup_config';
    this.backupsPath = path.join(app.getPath('userData'), 'backups');
    this.savePath = null; // Wird beim ersten Backup gesetzt
    
    // Backup-Verzeichnis erstellen falls nicht vorhanden
    this.ensureBackupDirectory();
    
    // Konfiguration laden
    this.config = this.loadConfig();
    
    // Auto-Backup starten wenn aktiviert
    if (this.config.autoBackupEnabled) {
      this.startAutoBackup();
    }
  }

  /**
   * Stellt sicher dass das Backup-Verzeichnis existiert
   */
  ensureBackupDirectory() {
    try {
      if (!fs.existsSync(this.backupsPath)) {
        fs.mkdirSync(this.backupsPath, { recursive: true });
      }
    } catch (error) {
      console.error('❌ Fehler beim Erstellen des Backup-Verzeichnisses:', error);
    }
  }

  /**
   * Lädt die Backup-Konfiguration
   */
  loadConfig() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('❌ Fehler beim Laden der Backup-Konfiguration:', error);
    }

    // Standard-Konfiguration
    return {
      autoBackupEnabled: true,
      autoBackupInterval: 'daily', // 'daily', 'weekly', 'manual'
      maxBackups: 10, // Maximale Anzahl an Backups
      lastAutoBackup: null,
      compressionEnabled: true
    };
  }

  /**
   * Speichert die Backup-Konfiguration
   */
  saveConfig() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.config));
    } catch (error) {
      console.error('❌ Fehler beim Speichern der Backup-Konfiguration:', error);
    }
  }

  /**
   * Setzt den Pfad zum Spielstand-Ordner
   */
  setSavePath(savePath) {
    this.savePath = savePath;
  }

  /**
   * Erstellt ein manuelles Backup
   */
  async createBackup(name = null) {
    try {
      if (!this.savePath) {
        throw new Error('Kein Spielstand-Pfad gesetzt. Bitte zuerst setSavePath() aufrufen.');
      }

      if (!fs.existsSync(this.savePath)) {
        throw new Error('Spielstand-Ordner nicht gefunden: ' + this.savePath);
      }

      // Backup-Name generieren
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupName = name || `backup_${timestamp}`;
      const backupPath = path.join(this.backupsPath, backupName);

      // Spielstand-Ordner kopieren
      await this.copyDirectory(this.savePath, backupPath);

      // Metadaten erstellen
      const metadata = {
        name: backupName,
        displayName: name || 'Manuelles Backup',
        created: new Date().toISOString(),
        size: await this.getDirectorySize(backupPath),
        type: name ? 'manual' : 'auto',
        savePath: this.savePath
      };

      // Metadaten speichern
      const metadataPath = path.join(backupPath, '.backup-metadata.json');
      fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

      // Alte Backups löschen wenn Limit erreicht
      await this.cleanupOldBackups();

      console.log('✅ Backup erstellt:', backupName);
      return { success: true, backup: metadata };
    } catch (error) {
      console.error('❌ Fehler beim Erstellen des Backups:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Stellt ein Backup wieder her
   */
  async restoreBackup(backupName) {
    try {
      const backupPath = path.join(this.backupsPath, backupName);

      if (!fs.existsSync(backupPath)) {
        throw new Error('Backup nicht gefunden: ' + backupName);
      }

      // Metadaten laden
      const metadataPath = path.join(backupPath, '.backup-metadata.json');
      if (!fs.existsSync(metadataPath)) {
        throw new Error('Backup-Metadaten nicht gefunden');
      }

      const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
      const targetPath = metadata.savePath || this.savePath;

      if (!targetPath) {
        throw new Error('Ziel-Pfad nicht bekannt');
      }

      // Sicherheitskopie des aktuellen Spielstands erstellen
      await this.createBackup('pre_restore_backup');

      // Aktuellen Spielstand löschen
      if (fs.existsSync(targetPath)) {
        await this.deleteDirectory(targetPath);
      }

      // Backup wiederherstellen (ohne Metadaten)
      fs.mkdirSync(targetPath, { recursive: true });
      const items = fs.readdirSync(backupPath);
      
      for (const item of items) {
        if (item === '.backup-metadata.json') continue;
        
        const sourcePath = path.join(backupPath, item);
        const destPath = path.join(targetPath, item);
        
        await this.copyDirectory(sourcePath, destPath);
      }

      console.log('✅ Backup wiederhergestellt:', backupName);
      return { success: true };
    } catch (error) {
      console.error('❌ Fehler beim Wiederherstellen des Backups:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Listet alle verfügbaren Backups auf
   */
  async listBackups() {
    try {
      if (!fs.existsSync(this.backupsPath)) {
        return [];
      }

      const backups = [];
      const items = fs.readdirSync(this.backupsPath);

      for (const item of items) {
        const backupPath = path.join(this.backupsPath, item);
        const metadataPath = path.join(backupPath, '.backup-metadata.json');

        if (fs.existsSync(metadataPath)) {
          try {
            const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
            backups.push(metadata);
          } catch (error) {
            console.warn('⚠️ Konnte Metadaten nicht lesen:', item);
          }
        }
      }

      // Nach Erstellungsdatum sortieren (neueste zuerst)
      backups.sort((a, b) => new Date(b.created) - new Date(a.created));

      return backups;
    } catch (error) {
      console.error('❌ Fehler beim Auflisten der Backups:', error);
      return [];
    }
  }

  /**
   * Löscht ein Backup
   */
  async deleteBackup(backupName) {
    try {
      const backupPath = path.join(this.backupsPath, backupName);

      if (!fs.existsSync(backupPath)) {
        throw new Error('Backup nicht gefunden');
      }

      await this.deleteDirectory(backupPath);

      console.log('✅ Backup gelöscht:', backupName);
      return { success: true };
    } catch (error) {
      console.error('❌ Fehler beim Löschen des Backups:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Benennt ein Backup um
   */
  async renameBackup(oldName, newDisplayName) {
    try {
      const backupPath = path.join(this.backupsPath, oldName);
      const metadataPath = path.join(backupPath, '.backup-metadata.json');

      if (!fs.existsSync(metadataPath)) {
        throw new Error('Backup nicht gefunden');
      }

      const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
      metadata.displayName = newDisplayName;

      fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

      console.log('✅ Backup umbenannt:', oldName, '->', newDisplayName);
      return { success: true, backup: metadata };
    } catch (error) {
      console.error('❌ Fehler beim Umbenennen des Backups:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Startet automatisches Backup
   */
  startAutoBackup() {
    if (this.autoBackupTimer) {
      clearInterval(this.autoBackupTimer);
    }

    const intervals = {
      daily: 24 * 60 * 60 * 1000,      // 24 Stunden
      weekly: 7 * 24 * 60 * 60 * 1000  // 7 Tage
    };

    const interval = intervals[this.config.autoBackupInterval] || intervals.daily;

    // Prüfen ob ein Backup nötig ist
    const checkAndBackup = async () => {
      const now = Date.now();
      const lastBackup = this.config.lastAutoBackup ? new Date(this.config.lastAutoBackup).getTime() : 0;

      if (now - lastBackup >= interval) {
        console.log('🔄 Automatisches Backup wird erstellt...');
        const result = await this.createBackup();
        
        if (result.success) {
          this.config.lastAutoBackup = new Date().toISOString();
          this.saveConfig();
        }
      }
    };

    // Sofort prüfen
    checkAndBackup();

    // Dann alle 30 Minuten prüfen
    this.autoBackupTimer = setInterval(checkAndBackup, 30 * 60 * 1000);
  }

  /**
   * Stoppt automatisches Backup
   */
  stopAutoBackup() {
    if (this.autoBackupTimer) {
      clearInterval(this.autoBackupTimer);
      this.autoBackupTimer = null;
    }
  }

  /**
   * Aktualisiert die Konfiguration
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    this.saveConfig();

    // Auto-Backup neu starten wenn nötig
    if (this.config.autoBackupEnabled) {
      this.startAutoBackup();
    } else {
      this.stopAutoBackup();
    }
  }

  /**
   * Gibt die aktuelle Konfiguration zurück
   */
  getConfig() {
    return { ...this.config };
  }

  /**
   * Löscht alte Backups wenn Limit erreicht
   */
  async cleanupOldBackups() {
    try {
      const backups = await this.listBackups();
      
      if (backups.length > this.config.maxBackups) {
        // Sortiere nach Datum (älteste zuerst)
        const sortedBackups = backups.sort((a, b) => 
          new Date(a.created) - new Date(b.created)
        );

        // Lösche die ältesten Backups
        const toDelete = sortedBackups.slice(0, backups.length - this.config.maxBackups);
        
        for (const backup of toDelete) {
          if (backup.type === 'auto') { // Nur automatische Backups löschen
            await this.deleteBackup(backup.name);
            console.log('🗑️ Altes Backup gelöscht:', backup.name);
          }
        }
      }
    } catch (error) {
      console.error('❌ Fehler beim Aufräumen alter Backups:', error);
    }
  }

  /**
   * Kopiert ein Verzeichnis rekursiv
   */
  async copyDirectory(source, destination) {
    if (!fs.existsSync(destination)) {
      fs.mkdirSync(destination, { recursive: true });
    }

    const items = fs.readdirSync(source);

    for (const item of items) {
      const sourcePath = path.join(source, item);
      const destPath = path.join(destination, item);
      const stat = fs.statSync(sourcePath);

      if (stat.isDirectory()) {
        await this.copyDirectory(sourcePath, destPath);
      } else {
        fs.copyFileSync(sourcePath, destPath);
      }
    }
  }

  /**
   * Löscht ein Verzeichnis rekursiv
   */
  async deleteDirectory(dirPath) {
    if (fs.existsSync(dirPath)) {
      const items = fs.readdirSync(dirPath);

      for (const item of items) {
        const itemPath = path.join(dirPath, item);
        const stat = fs.statSync(itemPath);

        if (stat.isDirectory()) {
          await this.deleteDirectory(itemPath);
        } else {
          fs.unlinkSync(itemPath);
        }
      }

      fs.rmdirSync(dirPath);
    }
  }

  /**
   * Berechnet die Größe eines Verzeichnisses
   */
  async getDirectorySize(dirPath) {
    let size = 0;

    const calculateSize = (itemPath) => {
      const stat = fs.statSync(itemPath);

      if (stat.isDirectory()) {
        const items = fs.readdirSync(itemPath);
        items.forEach(item => {
          calculateSize(path.join(itemPath, item));
        });
      } else {
        size += stat.size;
      }
    };

    calculateSize(dirPath);
    return size;
  }

  /**
   * Formatiert Dateigröße
   */
  formatSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Öffnet das Backup-Verzeichnis im Explorer
   */
  openBackupFolder() {
    const { shell } = window.require('electron');
    shell.openPath(this.backupsPath);
  }
}

export default BackupService;
