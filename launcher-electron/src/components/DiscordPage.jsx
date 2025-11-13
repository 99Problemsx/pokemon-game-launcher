import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useTranslation } from '../i18n/translations';

const DiscordPage = ({ selectedGame }) => {
  const { t } = useTranslation();
  const [isConnected, setIsConnected] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);
  const [showDetails, setShowDetails] = useState(true);
  const [activityType, setActivityType] = useState('launcher');

  useEffect(() => {
    checkDiscordStatus();
  }, []);

  const checkDiscordStatus = async () => {
    try {
      const status = await window.electronAPI.getDiscordStatus();
      setIsConnected(status.connected);
      setIsEnabled(status.enabled);
    } catch (error) {
      console.error('Failed to get Discord status:', error);
    }
  };

  const toggleDiscord = async () => {
    try {
      if (isEnabled) {
        await window.electronAPI.disableDiscord();
        toast.success(t('discordRichPresenceDeactivated'));
      } else {
        await window.electronAPI.enableDiscord();
        toast.success(t('discordRichPresenceActivated'));
      }
      setIsEnabled(!isEnabled);
      checkDiscordStatus();
    } catch (error) {
      toast.error(t('error') + ': ' + error.message);
    }
  };

  const testActivity = async (type) => {
    try {
      const testData = {
        location: 'Route 1',
        map: 'Kanto',
        pokemon: 'pikachu',
        pokemonName: 'Pikachu',
        opponent: 'Trainer Markus',
        badges: 3,
        playtime: '5h 30m'
      };

      await window.electronAPI.setDiscordActivity(type, testData, selectedGame);
      toast.success(`${selectedGame.name} Activity: ${type}`);
    } catch (error) {
      toast.error(t('error') + ': ' + error.message);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="glass-effect rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{t('discordIntegration')}</h1>
            <p className="text-gray-400">
              {t('showDiscordActivity')}
            </p>
          </div>
          <div className="text-6xl">
            🎮
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="glass-effect rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold mb-1">{t('discordStatus')}</h2>
            <p className="text-sm text-gray-400">
              {isConnected ? t('discordConnected') : t('discordDisconnected')}
            </p>
          </div>
          <div className={`w-4 h-4 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
        </div>

        <div className="flex items-center justify-between p-4 bg-dark-700 rounded-lg">
          <div>
            <p className="font-medium">Rich Presence</p>
            <p className="text-sm text-gray-400">
              {isEnabled ? t('discordEnabled') : t('discordDisabled')}
            </p>
          </div>
          <button
            onClick={toggleDiscord}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
              isEnabled ? 'bg-green-500' : 'bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                isEnabled ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Einstellungen */}
      <div className="glass-effect rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4">{t('discordSettings')}</h2>
        
        <div className="space-y-4">
          {/* Details anzeigen */}
          <div className="flex items-center justify-between p-4 bg-dark-700 rounded-lg">
            <div>
              <p className="font-medium">{t('discordShowDetails')}</p>
              <p className="text-sm text-gray-400">
                {t('discordShowDetailsDesc')}
              </p>
            </div>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                showDetails ? 'bg-blue-500' : 'bg-gray-600'
              }`}
              disabled={!isEnabled}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  showDetails ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Vorschau */}
      <div className="glass-effect rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4">{t('discordPreview')}</h2>
        
        <div className="bg-[#202225] rounded-lg p-4 border-2 border-gray-700">
          <div className="flex items-start space-x-3">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-2xl">
              🎮
            </div>
            <div className="flex-1">
              <p className="font-bold text-white mb-1">Mirrorbytes Studio</p>
              {isEnabled && showDetails ? (
                <>
                  <p className="text-sm text-gray-300">{t('discordPlaying')} {selectedGame.name}</p>
                  <p className="text-sm text-gray-400">Route 1 - Kanto • 3 {t('discordBadges')}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-xs">
                      ⚡
                    </div>
                    <p className="text-xs text-gray-400">Kanto</p>
                  </div>
                  <div className="mt-2 flex space-x-2">
                    <button className="text-xs bg-[#5865F2] hover:bg-[#4752C4] px-3 py-1 rounded transition-colors">
                      🎮 {t('discordGameInfo')}
                    </button>
                    <button className="text-xs bg-[#5865F2] hover:bg-[#4752C4] px-3 py-1 rounded transition-colors">
                      💬 {t('discordServer')}
                    </button>
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-400">{t('discordInLauncher')}</p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <p className="text-sm text-yellow-200">
            💡 <strong>{t('note')}:</strong> {t('discordMapTip')}
          </p>
        </div>
      </div>

      {/* Test Activities */}
      {isEnabled && (
        <div className="glass-effect rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4">{t('discordTestActivities')}</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <button
              onClick={() => testActivity('launcher')}
              className="p-4 bg-dark-700 hover:bg-dark-600 rounded-lg transition-colors"
            >
              <span className="text-2xl mb-2 block">🏠</span>
              <p className="text-sm font-medium">{t('discordTestLauncher')}</p>
            </button>
            
            <button
              onClick={() => testActivity('battle')}
              className="p-4 bg-dark-700 hover:bg-dark-600 rounded-lg transition-colors"
            >
              <span className="text-2xl mb-2 block">⚔️</span>
              <p className="text-sm font-medium">{t('discordTestBattle')}</p>
            </button>
            
            <button
              onClick={() => testActivity('training')}
              className="p-4 bg-dark-700 hover:bg-dark-600 rounded-lg transition-colors"
            >
              <span className="text-2xl mb-2 block">💪</span>
              <p className="text-sm font-medium">{t('discordTestTraining')}</p>
            </button>
            
            <button
              onClick={() => testActivity('trading')}
              className="p-4 bg-dark-700 hover:bg-dark-600 rounded-lg transition-colors"
            >
              <span className="text-2xl mb-2 block">🔄</span>
              <p className="text-sm font-medium">{t('discordTestTrading')}</p>
            </button>
            
            <button
              onClick={() => testActivity('exploring')}
              className="p-4 bg-dark-700 hover:bg-dark-600 rounded-lg transition-colors"
            >
              <span className="text-2xl mb-2 block">🗺️</span>
              <p className="text-sm font-medium">{t('discordTestExploring')}</p>
            </button>
            
            <button
              onClick={() => testActivity('menu')}
              className="p-4 bg-dark-700 hover:bg-dark-600 rounded-lg transition-colors"
            >
              <span className="text-2xl mb-2 block">📋</span>
              <p className="text-sm font-medium">{t('discordTestMenu')}</p>
            </button>
            
            <button
              onClick={() => testActivity('gym')}
              className="p-4 bg-dark-700 hover:bg-dark-600 rounded-lg transition-colors"
            >
              <span className="text-2xl mb-2 block">🏛️</span>
              <p className="text-sm font-medium">{t('discordTestGym')}</p>
            </button>
            
            <button
              onClick={() => testActivity('catching')}
              className="p-4 bg-dark-700 hover:bg-dark-600 rounded-lg transition-colors"
            >
              <span className="text-2xl mb-2 block">⚾</span>
              <p className="text-sm font-medium">{t('discordTestCatching')}</p>
            </button>
            
            <button
              onClick={() => testActivity('game')}
              className="p-4 bg-dark-700 hover:bg-dark-600 rounded-lg transition-colors col-span-2 md:col-span-1"
            >
              <span className="text-2xl mb-2 block">🎮</span>
              <p className="text-sm font-medium">{t('discordTestInGame')}</p>
            </button>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="glass-effect rounded-xl p-6 bg-blue-500/10 border border-blue-500/30">
        <div className="flex items-start space-x-3">
          <span className="text-2xl">ℹ️</span>
          <div>
            <p className="font-medium text-blue-400 mb-1">{t('note')}</p>
            <p className="text-sm text-gray-300">
              {t('discordInfo')}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DiscordPage;
