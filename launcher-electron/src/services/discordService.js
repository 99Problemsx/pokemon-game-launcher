/**
 * Discord Rich Presence Service - Multi-Game Support
 * Zeigt deine Mirrorbytes-Aktivität in Discord mit separaten Applications für jedes Spiel
 */

// Try to load discord-rpc, but don't fail if it's not available
let DiscordRPC = null;
try {
  DiscordRPC = require('discord-rpc');
} catch (error) {
  console.warn('⚠️ discord-rpc not available - Discord Rich Presence disabled');
}

class DiscordService {
  constructor() {
    this.enabled = !!DiscordRPC; // Nur aktivieren wenn Modul verfügbar ist
    this.clients = new Map(); // Separate clients für jedes Spiel
    this.currentClient = null;
    this.currentGameId = null;
    
    // Discord Application IDs - eine für jedes Spiel
    this.gameClients = {
      illusion: {
        id: process.env.DISCORD_CLIENT_ID_ILLUSION || '1426433345545572455', // Pokémon Illusion Discord App
        name: 'Pokémon Illusion',
        enabled: true
      },
      zorua: {
        id: process.env.DISCORD_CLIENT_ID_ZORUA || '1428590219430461602', // Zorua - The Divine Deception Discord App
        name: 'Zorua - The Divine Deception',
        enabled: true // Jetzt mit separater Discord App ID
      },
      launcher: {
        id: process.env.DISCORD_CLIENT_ID_ILLUSION || '1426433345545572455', // Fallback auf Illusion App
        name: 'Mirrorbytes Studio',
        enabled: true
      }
    };
    
    this.isConnected = false;
    this.currentActivity = null;
    this.startTimestamp = Date.now();
  }

  /**
   * Initialisiere Discord RPC für ein bestimmtes Spiel
   */
  async initialize(gameId = 'launcher') {
    if (!this.enabled) {
      console.log('⚠️  Discord Rich Presence disabled (module not available)');
      return false;
    }
    
    try {
      const gameConfig = this.gameClients[gameId];
      
      if (!gameConfig || !gameConfig.enabled) {
        console.log(`⚠️  Discord Rich Presence for ${gameId} not configured`);
        return false;
      }

      // Wenn bereits mit diesem Game verbunden, nichts tun
      if (this.currentGameId === gameId && this.isConnected) {
        console.log(`Already connected to Discord for ${gameId}`);
        return true;
      }

      // Disconnect von vorherigem Game falls nötig
      if (this.isConnected && this.currentGameId !== gameId) {
        await this.disconnect();
      }

      const client = new DiscordRPC.Client({ transport: 'ipc' });
      
      client.on('ready', () => {
        console.log(`✅ Discord Rich Presence connected for ${gameConfig.name}!`);
        console.log('Logged in as:', client.user.username);
        this.isConnected = true;
        this.currentClient = client;
        this.currentGameId = gameId;
        this.startTimestamp = Date.now();
      });

      client.on('disconnected', () => {
        console.log(`❌ Discord Rich Presence disconnected for ${gameConfig.name}`);
        this.isConnected = false;
        this.currentClient = null;
        this.currentGameId = null;
      });

      await client.login({ clientId: gameConfig.id });
      this.clients.set(gameId, client);
      
      return true;
    } catch (error) {
      console.error(`Failed to initialize Discord RPC for ${gameId}:`, error);
      return false;
    }
  }

  /**
   * Setze Activity wenn Launcher offen ist
   */
  async setLauncherActivity(selectedGame = null) {
    // Initialisiere mit launcher client
    await this.initialize('launcher');
    
    if (!this.isConnected) return;

    const state = selectedGame 
      ? `Schaut sich ${selectedGame.name} an`
      : 'Bereit zum Spielen';

    this.currentActivity = {
      details: 'Im Mirrorbytes Studio',
      state: state,
      startTimestamp: this.startTimestamp,
      largeImageKey: 'mirrorbytes_logo',
      largeImageText: 'Mirrorbytes Studio',
      smallImageKey: selectedGame ? this.getGameIcon(selectedGame.id) : 'launcher_icon',
      smallImageText: selectedGame ? selectedGame.name : 'Launcher',
      instance: false,
    };

    this.updateActivity();
  }

  /**
   * Gibt das passende Icon für ein Spiel zurück
   */
  getGameIcon(gameId) {
    const icons = {
      'illusion': 'illusion_logo',
      'zorua': 'zorua_logo'
    };
    return icons[gameId] || 'game_logo';
  }

  /**
   * Setze Activity wenn Game läuft
   */
  async setGameActivity(gameInfo = {}, selectedGame = {}) {
    const gameId = selectedGame.id || 'game';
    
    // Wechsle zur richtigen Discord Application für dieses Spiel
    await this.initialize(gameId);
    
    if (!this.isConnected) return;

    const {
      location = 'Unterwegs',
      map = null,
      playtime = '0h 0m',
      badges = 0,
      partySize = 0,
      partyMax = 6,
      playerName = null
    } = gameInfo;

    const gameName = selectedGame.name || 'Pokémon Game';
    const repoUrl = `https://github.com/99Problemsx/${selectedGame.repo}`;

    // Formatiere die Location-Anzeige
    let stateText = location;
    if (map) {
      stateText = `${location} - ${map}`;
    }
    if (badges > 0) {
      stateText += ` • ${badges} Orden`;
    }
    if (playerName) {
      stateText = `${playerName} in ${stateText}`;
    }

    this.currentActivity = {
      details: `Spielt ${gameName}`,
      state: stateText,
      startTimestamp: this.startTimestamp,
      largeImageKey: this.getGameIcon(gameId),
      largeImageText: gameName,
      smallImageKey: map ? `map_${map.toLowerCase().replace(/\s+/g, '_')}` : 'playing_icon',
      smallImageText: map || `${playtime} gespielt`,
      instance: false,
      buttons: [
        {
          label: '🎮 Game Info',
          url: repoUrl
        },
        {
          label: '💬 Discord Server',
          url: 'https://discord.gg/mirrorbytes' // TODO: Echten Discord Link
        }
      ]
    };

    // Optional: Party Info wenn multiplayer
    if (partySize > 0) {
      this.currentActivity.partySize = partySize;
      this.currentActivity.partyMax = partyMax;
    }

    this.updateActivity();
  }

  /**
   * Setze Activity für spezifische Szenarien
   */
  async setCustomActivity(type, data = {}) {
    const gameId = data.gameId || 'game';
    
    // Wechsle zur richtigen Discord Application für dieses Spiel
    await this.initialize(gameId);
    
    if (!this.isConnected) return;

    const gameName = data.gameName || 'Pokémon Game';

    switch (type) {
      case 'battle':
        this.currentActivity = {
          details: `${gameName} - Im Kampf`,
          state: data.opponent ? `vs ${data.opponent}` : 'Trainer Kampf',
          startTimestamp: Date.now(),
          largeImageKey: this.getGameIcon(gameId),
          largeImageText: gameName,
          smallImageKey: data.pokemon || 'pokeball',
          smallImageText: data.pokemonName || 'Im Kampf',
        };
        if (data.location) {
          this.currentActivity.state += ` • ${data.location}`;
        }
        break;

      case 'training':
        this.currentActivity = {
          details: `${gameName} - Training`,
          state: data.location || 'Trainiert Pokémon',
          startTimestamp: this.startTimestamp,
          largeImageKey: this.getGameIcon(gameId),
          largeImageText: gameName,
          smallImageKey: 'training_icon',
          smallImageText: 'Training',
        };
        break;

      case 'trading':
        this.currentActivity = {
          details: `${gameName} - Tauscht`,
          state: data.partner || 'Mit Freund',
          startTimestamp: Date.now(),
          largeImageKey: this.getGameIcon(gameId),
          largeImageText: gameName,
          smallImageKey: 'trade_icon',
          smallImageText: 'Pokémon Tausch',
        };
        break;

      case 'exploring':
        const exploreState = data.map 
          ? `${data.location || 'Erkundet'} - ${data.map}`
          : data.location || 'Neue Orte';
        
        this.currentActivity = {
          details: `${gameName} - Erkundet`,
          state: exploreState,
          startTimestamp: this.startTimestamp,
          largeImageKey: this.getGameIcon(gameId),
          largeImageText: gameName,
          smallImageKey: data.map ? `map_${data.map.toLowerCase().replace(/\s+/g, '_')}` : 'explore_icon',
          smallImageText: data.map || 'Exploration',
        };
        break;

      case 'menu':
        this.currentActivity = {
          details: `${gameName} - Im Menü`,
          state: data.section || 'Schaut sich um',
          startTimestamp: this.startTimestamp,
          largeImageKey: this.getGameIcon(gameId),
          largeImageText: gameName,
          smallImageKey: 'menu_icon',
          smallImageText: 'Menü',
        };
        break;

      case 'gym':
        this.currentActivity = {
          details: `${gameName} - Arena Kampf`,
          state: data.gymLeader ? `vs ${data.gymLeader}` : 'Arena Herausforderung',
          startTimestamp: Date.now(),
          largeImageKey: this.getGameIcon(gameId),
          largeImageText: gameName,
          smallImageKey: 'gym_icon',
          smallImageText: data.city || 'Arena',
        };
        if (data.badges) {
          this.currentActivity.state += ` • ${data.badges} Orden`;
        }
        break;

      case 'catching':
        this.currentActivity = {
          details: `${gameName} - Fängt Pokémon`,
          state: data.location || 'Auf der Jagd',
          startTimestamp: this.startTimestamp,
          largeImageKey: this.getGameIcon(gameId),
          largeImageText: gameName,
          smallImageKey: 'pokeball',
          smallImageText: data.pokemon || 'Fängt Pokémon',
        };
        break;

      default:
        this.setLauncherActivity(data.selectedGame);
    }

    this.updateActivity();
  }

  /**
   * Update die aktuelle Activity
   */
  async updateActivity() {
    if (!this.isConnected || !this.currentActivity || !this.currentClient) return;

    try {
      await this.currentClient.setActivity(this.currentActivity);
      console.log(`✅ Discord activity updated (${this.currentGameId}):`, this.currentActivity.details);
    } catch (error) {
      console.error('Failed to update Discord activity:', error);
    }
  }

  /**
   * Clear Activity
   */
  async clearActivity() {
    if (!this.isConnected || !this.currentClient) return;

    try {
      await this.currentClient.clearActivity();
      this.currentActivity = null;
      console.log('✅ Discord activity cleared');
    } catch (error) {
      console.error('Failed to clear Discord activity:', error);
    }
  }

  /**
   * Disconnect from Discord
   */
  async disconnect() {
    if (!this.isConnected || !this.currentClient) return;

    try {
      await this.clearActivity();
      await this.currentClient.destroy();
      this.clients.delete(this.currentGameId);
      this.isConnected = false;
      this.currentClient = null;
      console.log(`✅ Discord RPC disconnected (${this.currentGameId})`);
      this.currentGameId = null;
    } catch (error) {
      console.error('Failed to disconnect Discord RPC:', error);
    }
  }

  /**
   * Disconnect from all games
   */
  async disconnectAll() {
    for (const [gameId, client] of this.clients.entries()) {
      try {
        await client.destroy();
        console.log(`✅ Disconnected from ${gameId}`);
      } catch (error) {
        console.error(`Failed to disconnect from ${gameId}:`, error);
      }
    }
    this.clients.clear();
    this.isConnected = false;
    this.currentClient = null;
    this.currentGameId = null;
  }

  /**
   * Reconnect mit neuem Spiel
   */
  async reconnect(gameId = 'launcher') {
    await this.disconnect();
    await this.initialize(gameId);
  }
}

// Singleton instance
let discordServiceInstance = null;

module.exports = {
  getDiscordService: () => {
    if (!discordServiceInstance) {
      discordServiceInstance = new DiscordService();
    }
    return discordServiceInstance;
  }
};
