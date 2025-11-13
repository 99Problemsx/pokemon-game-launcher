import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCalendar, FiGift, FiTrendingUp, FiAward, FiClock } from 'react-icons/fi';
import DailyLoginSystem from '../services/dailyLoginSystem';
import { toast } from 'react-toastify';
import { useTranslation } from '../i18n/translations';

const DailyLoginPage = ({ onPointsEarned, selectedGame }) => {
  const { t } = useTranslation();
  const [loginSystem] = useState(() => new DailyLoginSystem(selectedGame.id));
  const [loginStatus, setLoginStatus] = useState(null);
  const [showClaimAnimation, setShowClaimAnimation] = useState(false);
  const [claimResult, setClaimResult] = useState(null);

  useEffect(() => {
    loadLoginStatus();
  }, []);

  const loadLoginStatus = () => {
    const status = loginSystem.getLoginStatus();
    setLoginStatus(status);
  };

  const handleClaimReward = () => {
    const result = loginSystem.performDailyLogin((points) => {
      if (onPointsEarned) {
        onPointsEarned(points);
      }
    });

    if (result.success) {
      setClaimResult(result);
      setShowClaimAnimation(true);
      loadLoginStatus();
      
      toast.success(`🎉 ${result.message}`, {
        position: "top-center",
        autoClose: 3000,
      });

      // Hide animation after 3 seconds
      setTimeout(() => setShowClaimAnimation(false), 3000);
    } else {
      toast.info(result.message, {
        position: "top-center",
        autoClose: 2000,
      });
    }
  };

  if (!loginStatus) return null;

  // Berechne Fortschritt zum nächsten Milestone
  const nextMilestone = loginStatus.nextMilestone;
  const milestoneProgress = nextMilestone.days > 0 
    ? ((loginStatus.currentStreak % (loginStatus.currentStreak + nextMilestone.days)) / (loginStatus.currentStreak + nextMilestone.days)) * 100
    : 100;

  return (
    <div className="h-full p-8 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center space-x-3">
            <FiCalendar className="text-yellow-400" size={32} />
            <span>{t('dailyLoginTitle')}</span>
          </h1>
          <p className="text-gray-400">
            {t('dailyLoginDesc')}
          </p>
        </div>

        {/* Claim Animation */}
        <AnimatePresence>
          {showClaimAnimation && claimResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: -50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -50 }}
              className="fixed top-1/4 left-1/2 transform -translate-x-1/2 z-50"
            >
              <div className="glass-effect-strong rounded-2xl p-8 border-4 border-yellow-400 text-center">
                <div className="text-6xl mb-4">🎁</div>
                <h2 className="text-3xl font-bold text-yellow-400 mb-2">+{claimResult.points} {t('points')}!</h2>
                <p className="text-xl text-white">{claimResult.streak} {t('daysStreak')}</p>
                {claimResult.milestone && (
                  <div className="mt-4 pt-4 border-t border-yellow-400/30">
                    <p className="text-2xl font-bold text-pink-400">🎉 {claimResult.milestone.name}</p>
                    <p className="text-xl text-green-400">+{claimResult.milestone.bonus} {t('bonusPoints')}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Daily Claim Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="glass-effect rounded-xl p-6 border-2 border-yellow-400/30"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold mb-1">{t('dailyLoginHeader')}</h2>
                <p className="text-sm text-gray-400">{t('dailyRewardWaiting')}</p>
              </div>
              <FiGift className="text-yellow-400" size={32} />
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">{t('currentStreak')}:</span>
                <span className="text-2xl font-bold text-yellow-400">{loginStatus.currentStreak} 🔥</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">{t('baseReward')}:</span>
                <span className="text-xl font-bold text-green-400">10 {t('points')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">{t('streakBonus')}:</span>
                <span className="text-xl font-bold text-blue-400">+{Math.min(loginStatus.currentStreak * 5, 100)} {t('points')}</span>
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-700">
                <span className="text-white font-medium">{t('totalReward')}:</span>
                <span className="text-2xl font-bold text-theme-accent">
                  {10 + Math.min(loginStatus.currentStreak * 5, 100)} {t('points')}
                </span>
              </div>
            </div>

            <button
              onClick={handleClaimReward}
              disabled={loginStatus.hasLoggedInToday}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center space-x-2 ${
                loginStatus.hasLoggedInToday
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:shadow-lg hover:shadow-yellow-400/50 animate-pulse'
              }`}
            >
              {loginStatus.hasLoggedInToday ? (
                <>
                  <FiClock size={20} />
                  <span>{t('claimReward').replace(' 🎁', '')} ✓</span>
                </>
              ) : (
                <>
                  <FiGift size={20} />
                  <span>{t('claimReward')}</span>
                </>
              )}
            </button>
          </motion.div>

          {/* Streak Stats Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="glass-effect rounded-xl p-6 border-2 border-purple-500/30"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold mb-1">{t('streakStats')}</h2>
                <p className="text-sm text-gray-400">{t('yourStats')}</p>
              </div>
              <FiTrendingUp className="text-purple-400" size={32} />
            </div>

            <div className="space-y-4">
              <div className="bg-dark-700/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">{t('currentStreak')}</span>
                  <span className="text-2xl font-bold text-yellow-400">{loginStatus.currentStreak} 🔥</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">{t('longestStreak')}</span>
                  <span className="text-xl font-bold text-orange-400">{loginStatus.longestStreak} 🏆</span>
                </div>
              </div>

              <div className="bg-dark-700/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">{t('totalLogins')}</span>
                  <span className="text-xl font-bold text-green-400">{loginStatus.totalLogins} 📅</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">{t('earnedPoints')}</span>
                  <span className="text-xl font-bold text-cyan-400">{loginStatus.totalPointsEarned} ⭐</span>
                </div>
              </div>

              {loginStatus.lastLogin && (
                <div className="bg-dark-700/50 rounded-lg p-4">
                  <span className="text-gray-400 text-sm">{t('lastLogin')}:</span>
                  <p className="text-white font-medium">
                    {new Date(loginStatus.lastLogin).toLocaleString('de-DE', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Milestone Progress */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="glass-effect rounded-xl p-6 border-2 border-pink-500/30 mb-8"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold mb-1">{t('nextMilestone')}</h2>
              <p className="text-sm text-gray-400">{nextMilestone.name}</p>
            </div>
            <FiAward className="text-pink-400" size={32} />
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">{t('progress')}</span>
              <span className="text-white font-bold">
                {nextMilestone.days > 0 
                  ? `${loginStatus.currentStreak} / ${loginStatus.currentStreak + nextMilestone.days} ${t('days')}`
                  : t('completed')
                }
              </span>
            </div>
            <div className="h-4 bg-dark-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${milestoneProgress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-pink-500 to-purple-500"
              />
            </div>
          </div>

          {nextMilestone.days > 0 && (
            <div className="flex items-center justify-between bg-pink-500/10 border border-pink-500/30 rounded-lg p-4">
              <div>
                <p className="text-sm text-gray-400">{t('reward')}</p>
                <p className="text-2xl font-bold text-pink-400">+{nextMilestone.reward} {t('bonusPoints')}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">{t('remaining')}</p>
                <p className="text-2xl font-bold text-yellow-400">{nextMilestone.days} {t('days')}</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Milestone Overview */}
        <div className="glass-effect rounded-xl p-6 border-2 border-blue-500/30">
          <h2 className="text-2xl font-bold mb-4">{t('allMilestones')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { days: 7, name: t('weekly'), reward: 50, icon: '📅' },
              { days: 30, name: t('monthly'), reward: 200, icon: '🗓️' },
              { days: 100, name: t('century'), reward: 500, icon: '💯' }
            ].map((milestone) => (
              <div
                key={milestone.days}
                className={`bg-dark-700/50 rounded-lg p-4 border-2 transition-all ${
                  loginStatus.currentStreak >= milestone.days
                    ? 'border-green-400 bg-green-500/10'
                    : 'border-gray-700'
                }`}
              >
                <div className="text-4xl mb-2 text-center">{milestone.icon}</div>
                <h3 className="font-bold text-center mb-1">{milestone.name}</h3>
                <p className="text-sm text-gray-400 text-center mb-2">{milestone.days} {t('days')}</p>
                <p className="text-lg font-bold text-center text-yellow-400">+{milestone.reward} {t('points')}</p>
                {loginStatus.currentStreak >= milestone.days && (
                  <p className="text-xs text-green-400 text-center mt-2">{t('achieved')}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DailyLoginPage;
