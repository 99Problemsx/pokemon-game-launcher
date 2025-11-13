import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiGift, FiCopy, FiCheck, FiLock, FiStar } from 'react-icons/fi';
import { RewardSystem, getAllRewardsWithStatus } from '../services/rewardSystem';
import { AchievementManager } from '../services/achievementManager';
import { useTranslation } from '../i18n/translations';

const RewardsPage = ({ selectedGame }) => {
  const { t } = useTranslation();
  const [rewards, setRewards] = useState([]);
  const [selectedReward, setSelectedReward] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);
  const [showClaimModal, setShowClaimModal] = useState(false);

  const rewardSystem = new RewardSystem();
  const achievementManager = new AchievementManager(selectedGame.id);

  useEffect(() => {
    loadRewards();
  }, []);

  const loadRewards = () => {
    const rewardsWithStatus = getAllRewardsWithStatus(achievementManager, rewardSystem);
    setRewards(rewardsWithStatus);
  };

  const handleClaimReward = (reward) => {
    // Öffne Modal für verfügbare UND bereits eingelöste Rewards
    if (reward.isUnlocked) {
      setSelectedReward(reward);
      setShowClaimModal(true);
    }
  };

  const confirmClaim = () => {
    if (selectedReward) {
      rewardSystem.claimReward(selectedReward.id);
      copyToClipboard(selectedReward.mysteryGiftCode);
      loadRewards(); // Refresh
      // Modal bleibt offen zum Code kopieren
    }
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 3000);
  };

  const getRarityColor = (type) => {
    return type === 'pokemon' 
      ? 'from-purple-500 to-pink-600' 
      : 'from-blue-500 to-cyan-600';
  };

  const getTypeEmoji = (type) => {
    return type === 'pokemon' ? '🎮' : '📦';
  };

  return (
    <div className="h-full p-8 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center space-x-3">
            <FiGift className="text-pink-400" size={32} />
            <span>{t('mysteryGiftsTitle')}</span>
          </h1>
          <p className="text-gray-400">
            {t('rewardsPageDesc')}
          </p>
        </div>

        {/* Info Box */}
        <div className="glass-effect rounded-xl p-6 mb-8 border-2 border-pink-500/30">
          <div className="flex items-start space-x-4">
            <div className="text-4xl">💡</div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-pink-400 mb-2">{t('howItWorks')}</h3>
              <ol className="text-sm text-gray-300 space-y-1 list-decimal list-inside">
                <li>{t('rewardStep1')}</li>
                <li>{t('rewardStep2')}</li>
                <li>{t('rewardStep3')}</li>
                <li>{t('rewardStep4')}</li>
                <li>{t('rewardStep5')}</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="glass-effect rounded-xl p-4 text-center">
            <p className="text-sm text-gray-400 mb-1">{t('available')}</p>
            <p className="text-3xl font-bold text-green-400">
              {rewards.filter(r => r.status === 'available').length}
            </p>
          </div>
          <div className="glass-effect rounded-xl p-4 text-center">
            <p className="text-sm text-gray-400 mb-1">{t('claimed')}</p>
            <p className="text-3xl font-bold text-blue-400">
              {rewards.filter(r => r.status === 'claimed').length}
            </p>
          </div>
          <div className="glass-effect rounded-xl p-4 text-center">
            <p className="text-sm text-gray-400 mb-1">{t('locked')}</p>
            <p className="text-3xl font-bold text-gray-400">
              {rewards.filter(r => r.status === 'locked').length}
            </p>
          </div>
        </div>

        {/* Rewards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rewards.map((reward) => (
            <motion.div
              key={reward.id}
              whileHover={{ scale: reward.isUnlocked ? 1.03 : 1 }}
              className={`glass-effect rounded-xl p-4 transition-all ${
                reward.status === 'available' 
                  ? 'border-2 border-green-500/50 shadow-lg shadow-green-500/20' 
                  : reward.status === 'claimed'
                  ? 'border-2 border-blue-500/30'
                  : 'opacity-60'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-3xl ${
                  reward.isUnlocked
                    ? `bg-gradient-to-br ${getRarityColor(reward.type)}`
                    : 'bg-dark-700'
                }`}>
                  {reward.isUnlocked ? reward.icon : <FiLock />}
                </div>
                
                <div className="flex flex-col items-end space-y-1">
                  <span className={`text-xs px-2 py-1 rounded flex items-center space-x-1 ${
                    reward.type === 'pokemon' 
                      ? 'bg-purple-500/20 text-purple-400' 
                      : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    <span>{getTypeEmoji(reward.type)}</span>
                    <span>{reward.type.toUpperCase()}</span>
                  </span>
                  
                  {reward.status === 'claimed' && (
                    <span className="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-400 flex items-center space-x-1">
                      <FiCheck size={12} />
                      <span>EINGELÖST</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Info */}
              <h3 className="font-bold text-lg mb-1">{reward.name}</h3>
              <p className="text-sm text-gray-400 mb-3">{reward.description}</p>

              {/* Requirement */}
              <div className="bg-dark-700/50 rounded-lg p-3 mb-3">
                <p className="text-xs text-gray-400 mb-2">Anforderung:</p>
                <p className="text-sm font-medium">{reward.requirement.description}</p>
                
                {/* Progress Bar */}
                {reward.status === 'locked' && (
                  <div className="mt-2">
                    <div className="w-full bg-dark-800 rounded-full h-2 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all"
                        style={{ width: `${reward.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1 text-right">{reward.progress}%</p>
                  </div>
                )}
              </div>

              {/* Details */}
              {reward.details && (
                <div className="bg-dark-700/30 rounded-lg p-2 mb-3 text-xs">
                  {reward.type === 'pokemon' && (
                    <>
                      <p className="text-gray-400">
                        <span className="text-white font-medium">Pokémon:</span> {reward.details.pokemon}
                      </p>
                      {reward.details.shiny && (
                        <p className="text-yellow-400">✨ Shiny</p>
                      )}
                      {reward.details.level && (
                        <p className="text-gray-400">Level: {reward.details.level}</p>
                      )}
                    </>
                  )}
                  {reward.type === 'item' && reward.details.items && (
                    <p className="text-gray-400">
                      <span className="text-white font-medium">Items:</span> {reward.details.items.join(', ')}
                    </p>
                  )}
                </div>
              )}

              {/* Claim Button */}
              <button
                onClick={() => handleClaimReward(reward)}
                disabled={reward.status !== 'available' && reward.status !== 'claimed'}
                className={`w-full py-2 rounded-lg font-medium transition-all flex items-center justify-center space-x-2 ${
                  reward.status === 'available'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-lg hover:shadow-green-500/50'
                    : reward.status === 'claimed'
                    ? 'bg-theme-accent/20 text-theme-accent hover:bg-theme-accent/30 cursor-pointer'
                    : 'bg-dark-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                {reward.status === 'available' && (
                  <>
                    <FiGift size={16} />
                    <span>Einlösen</span>
                  </>
                )}
                {reward.status === 'claimed' && (
                  <>
                    <FiCopy size={16} />
                    <span>Code anzeigen</span>
                  </>
                )}
                {reward.status === 'locked' && (
                  <>
                    <FiLock size={16} />
                    <span>Gesperrt</span>
                  </>
                )}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Claim Modal */}
        <AnimatePresence>
          {showClaimModal && selectedReward && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
              onClick={() => setShowClaimModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="glass-effect-strong rounded-2xl p-8 max-w-md w-full mx-4 border-2 border-pink-500/50"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center mb-6">
                  <div className="text-6xl mb-4">{selectedReward.icon}</div>
                  <h2 className="text-2xl font-bold mb-2">{selectedReward.name}</h2>
                  <p className="text-gray-400">{selectedReward.description}</p>
                </div>

                {!selectedReward.isClaimed ? (
                  <button
                    onClick={confirmClaim}
                    className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-lg hover:shadow-green-500/50 rounded-xl font-bold text-lg transition-all mb-4"
                  >
                    ✨ {t('claimReward')}
                  </button>
                ) : (
                  <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-2 border-cyan-500/50 rounded-xl p-4 mb-4">
                    <p className="text-sm text-gray-300 mb-3 text-center">
                      <FiCheck className="inline mr-1 text-green-400" />
                      {t('rewardAlreadyClaimed')}
                    </p>
                    <div className="bg-dark-800 rounded-lg p-3 mb-3">
                      <p className="text-xs text-gray-400 mb-2 text-center">{t('yourMysteryGiftCode')}</p>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={selectedReward.mysteryGiftCode}
                          readOnly
                          className="flex-1 bg-dark-900 border border-cyan-500/50 rounded-lg px-4 py-2 text-center font-mono text-lg font-bold text-cyan-300 select-all"
                        />
                        <button
                          onClick={() => copyToClipboard(selectedReward.mysteryGiftCode)}
                          className="p-2 bg-cyan-500 hover:bg-cyan-400 rounded-lg transition-all"
                          title={t('copyCode')}
                        >
                          {copiedCode === selectedReward.mysteryGiftCode ? (
                            <FiCheck size={20} />
                          ) : (
                            <FiCopy size={20} />
                          )}
                        </button>
                      </div>
                      {copiedCode === selectedReward.mysteryGiftCode && (
                        <p className="text-xs text-green-400 mt-2 text-center animate-pulse">✓ {t('codeCopied')}</p>
                      )}
                    </div>
                  </div>
                )}

                {selectedReward.isClaimed && (
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-4">
                    <p className="text-sm text-blue-300">
                      💡 <strong>{t('howToRedeem')}</strong><br/>
                      <span className="text-gray-400">
                      {t('gameInstruction1')}<br/>
                      {t('gameInstruction2')}<br/>
                      {t('gameInstruction3')}<br/>
                      {t('gameInstruction4')}: <span className="font-mono font-bold text-cyan-300">{selectedReward.mysteryGiftCode}</span><br/>
                      {t('gameInstruction5')}
                      </span>
                    </p>
                  </div>
                )}

                {!selectedReward.isClaimed && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-4">
                    <p className="text-sm text-yellow-300">
                      ⚠️ <strong>Wichtig:</strong> Nach dem Einlösen erhältst du einen <strong>Mystery Gift Code</strong>, den du <strong>im Spiel</strong> beim Mystery Gift NPC eingeben musst!
                    </p>
                  </div>
                )}

                <button
                  onClick={() => setShowClaimModal(false)}
                  className="w-full py-2 bg-dark-700 hover:bg-dark-600 rounded-lg transition-all"
                >
                  Schließen
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default RewardsPage;
