/**
 * Mystery Gift Service
 * Schreibt eingelöste Codes in eine Datei die das Spiel lesen kann
 */

const fs = require('fs');
const path = require('path');
const { app } = require('electron');

class MysteryGiftService {
  constructor() {
    // Pfad zu den Game Save Files
    this.savePath = path.join(
      app.getPath('appData'),
      'Pokemon Illusion',
      'mystery_gifts.json'
    );
  }

  /**
   * Speichere eingelöste Mystery Gifts für das Spiel
   */
  async saveGiftsForGame(redeemedCodes) {
    try {
      // Erstelle Verzeichnis falls nicht vorhanden
      const dir = path.dirname(this.savePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Konvertiere Codes zu Game-Format
      const gifts = redeemedCodes.map(code => ({
        code: code,
        timestamp: Date.now(),
        claimed: false, // Wird vom Spiel auf true gesetzt wenn Item erhalten
        data: this.getGiftData(code)
      }));

      // Schreibe in Datei
      fs.writeFileSync(this.savePath, JSON.stringify(gifts, null, 2));
      
      console.log('✅ Mystery Gifts saved for game:', this.savePath);
      return true;
    } catch (error) {
      console.error('Failed to save mystery gifts:', error);
      return false;
    }
  }

  /**
   * Hole Gift-Daten für einen Code
   */
  getGiftData(code) {
    // Load gifts from external config file
    try {
      // Try to load from mystery-gifts.config.json (user's custom config)
      const configPath = require('path').join(__dirname, '../../mystery-gifts.config.json');
      const fs = require('fs');
      
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        return config.gifts[code] || null;
      }
      
      // Fallback to example config
      const examplePath = require('path').join(__dirname, '../../mystery-gifts.config.example.json');
      if (fs.existsSync(examplePath)) {
        const config = JSON.parse(fs.readFileSync(examplePath, 'utf-8'));
        return config.gifts[code] || null;
      }
      
      console.warn('⚠️ No mystery-gifts.config.json found. Please create one based on mystery-gifts.config.example.json');
      return null;
    } catch (error) {
      console.error('Failed to load mystery gifts config:', error);
      return null;
    }
  }

  /**
   * Lade bereits vom Spiel geclaimte Gifts
   */
  async loadClaimedGifts() {
    try {
      if (!fs.existsSync(this.savePath)) {
        return [];
      }

      const data = fs.readFileSync(this.savePath, 'utf8');
      const gifts = JSON.parse(data);
      
      // Gib nur bereits geclaimte zurück
      return gifts.filter(g => g.claimed).map(g => g.code);
    } catch (error) {
      console.error('Failed to load claimed gifts:', error);
      return [];
    }
  }

  /**
   * Prüfe ob ein Gift bereits im Spiel geclaimed wurde
   */
  async isGiftClaimed(code) {
    const claimed = await this.loadClaimedGifts();
    return claimed.includes(code);
  }
}

// Export Singleton
let instance = null;

function getMysteryGiftService() {
  if (!instance) {
    instance = new MysteryGiftService();
  }
  return instance;
}

module.exports = { MysteryGiftService, getMysteryGiftService };
