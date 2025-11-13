import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTarget, FiCheck, FiTrendingUp, FiAward, FiZap } from 'react-icons/fi';
import DailyChallengesSystem from '../services/dailyChallengesSystem';
import { toast } from 'react-toastify';

const DailyChallengesPage = ({ onPointsEarned, selectedGame }) => {
  const [challengeSystem] = useState(() => new DailyChallengesSystem(selectedGame.id));
  const [challenges, setChallenges] = useState([]);
  const [stats, setStats] = useState(null);
  const [showCompletionAnimation, setShowCompletionAnimation] = useState(false);
  const [completedChallenge, setCompletedChallenge] = useState(null);

  useEffect(() => {
    loadChallenges();
    loadStats();
  }, []);

  const loadChallenges = () => {
    const currentChallenges = challengeSystem.getChallenges();
    setChallenges(currentChallenges);
  };

  const loadStats = () => {
    const currentStats = challengeSystem.getStats();
    setStats(currentStats);
  };

  // Simuliert Challenge-Progress (für Demo)
  const simulateProgress = (challenge) => {
    const result = challengeSystem.updateChallengeProgress(challenge.id, 1);
    
    if (result) {
      loadChallenges();
      loadStats();
      
      if (result.completed) {
        setCompletedChallenge(result.challenge);
        setShowCompletionAnimation(true);
        
        if (onPointsEarned) {
          onPointsEarned(result.challenge.reward);
        }
        
        toast.success(`🎉 ${result.message}`, {
          position: 'top-center',
          autoClose: 3000,
        });
        
        setTimeout(() => setShowCompletionAnimation(false), 3000);
      } else {
        toast.info(`Fortschritt: ${result.progress}`, {
          position: 'top-right',
          autoClose: 2000,
        });
      }
    }
  };

  const getChallengeTypeColor = (type) => {
    const colors = {
      'launcher': 'from-theme-primary to-theme-secondary',
      'gameplay': 'from-purple-500 to-pink-500',
      'social': 'from-green-500 to-emerald-500',
      'exploration': 'from-yellow-500 to-orange-500',
      'streak': 'from-theme-accent to-orange-500'
    };
    return colors[type] || 'from-gray-500 to-gray-600';
  };

  const getChallengeTypeName = (type) => {
    const names = {
      'launcher': 'Launcher',
      'gameplay': 'Gameplay',
      'social': 'Social',
      'exploration': 'Erkundung',
      'streak': 'Streak'
    };
    return names[type] || 'Sonstiges';
  };

  if (!stats) return null;

  const completionPercentage = challenges.length > 0 
    ? (stats.todayProgress.completed / stats.todayProgress.total) * 100 
    : 0;

  return (
    <div className="h-full p-8 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center space-x-3">
            <FiTarget className="text-theme-accent" size={32} />
            <span>Tägliche Herausforderungen</span>
          </h1>
          <p className="text-gray-400">
            Schließe Challenges ab und verdiene Bonus-Punkte!
          </p>
        </div>

        {/* Completion Animation */}
        <AnimatePresence>
          {showCompletionAnimation && completedChallenge && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: -50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -50 }}
              className="fixed top-1/4 left-1/2 transform -translate-x-1/2 z-50"
            >
              <div className="glass-effect-strong rounded-2xl p-8 border-4 border-theme-accent text-center">
                <div className="text-6xl mb-4">✅</div>
                <h2 className="text-2xl font-bold text-theme-accent mb-2">{completedChallenge.title}</h2>
                <p className="text-xl text-white mb-4">Challenge abgeschlossen!</p>
                <p className="text-3xl font-bold text-green-400">+{completedChallenge.reward} Punkte! 🎉</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Today's Progress */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="glass-effect rounded-xl p-6 border-2 border-theme-accent/30"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold mb-1">Heutiger Fortschritt</h2>
                <p className="text-sm text-gray-400">Challenges abgeschlossen</p>
              </div>
              <FiTarget className="text-theme-accent" size={28} />
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl font-bold text-theme-accent">
                  {stats.todayProgress.completed}/{stats.todayProgress.total}
                </span>
                <span className="text-lg text-gray-400">{Math.round(completionPercentage)}%</span>
              </div>
              <div className="h-3 bg-dark-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${completionPercentage}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                />
              </div>
            </div>

            {completionPercentage === 100 && (
              <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-3 text-center">
                <p className="text-green-400 font-bold">🎉 Alle Challenges abgeschlossen!</p>
              </div>
            )}
          </motion.div>

          {/* Total Stats */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="glass-effect rounded-xl p-6 border-2 border-purple-500/30"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold mb-1">Gesamt-Statistiken</h2>
                <p className="text-sm text-gray-400">Alle Challenges</p>
              </div>
              <FiTrendingUp className="text-purple-400" size={28} />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Abgeschlossen:</span>
                <span className="text-2xl font-bold text-purple-400">{stats.totalCompleted}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Punkte verdient:</span>
                <span className="text-2xl font-bold text-yellow-400">{stats.totalPoints}</span>
              </div>
            </div>
          </motion.div>

          {/* Streak */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="glass-effect rounded-xl p-6 border-2 border-orange-500/30"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold mb-1">Challenge-Streak</h2>
                <p className="text-sm text-gray-400">Tägliche Completion</p>
              </div>
              <FiAward className="text-orange-400" size={28} />
            </div>

            <div className="text-center">
              <div className="text-5xl font-bold text-orange-400 mb-2">{stats.streakDays}</div>
              <p className="text-gray-400">Tage in Folge 🔥</p>
            </div>
          </motion.div>
        </div>

        {/* Info Box */}
        <div className="glass-effect rounded-xl p-6 mb-8 border-2 border-yellow-500/30">
          <div className="flex items-start space-x-4">
            <div className="text-4xl">💡</div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-yellow-400 mb-2">Wie funktionieren Challenges?</h3>
              <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
                <li>Jeden Tag erhältst du 3-5 neue zufällige Challenges</li>
                <li>Schließe Challenges ab, um Bonus-Punkte zu verdienen</li>
                <li>Einige Challenges tracken automatisch deinen Fortschritt</li>
                <li>Vervollständige alle Challenges für einen Streak-Bonus!</li>
                <li>Challenges erneuern sich jeden Tag um Mitternacht</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Challenges Grid */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold mb-4 flex items-center space-x-2">
            <FiZap className="text-yellow-400" />
            <span>Heutige Challenges</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {challenges.map((challenge, index) => {
            const progress = (challenge.current / challenge.target) * 100;
            const typeColor = getChallengeTypeColor(challenge.type);
            
            return (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.03 }}
                className={`glass-effect rounded-xl p-6 border-2 transition-all ${
                  challenge.completed
                    ? 'border-green-500/50 bg-green-500/10'
                    : 'border-gray-700 hover:border-cyan-500/50'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl">{challenge.icon}</div>
                  {challenge.completed && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="bg-green-500 rounded-full p-2"
                    >
                      <FiCheck size={20} className="text-white" />
                    </motion.div>
                  )}
                </div>

                {/* Type Badge */}
                <div className="mb-3">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full bg-gradient-to-r ${typeColor} text-white`}>
                    {getChallengeTypeName(challenge.type)}
                  </span>
                </div>

                {/* Title & Description */}
                <h3 className="text-xl font-bold mb-2">{challenge.title}</h3>
                <p className="text-sm text-gray-400 mb-4">{challenge.description}</p>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Fortschritt</span>
                    <span className={`text-sm font-bold ${
                      challenge.completed ? 'text-green-400' : 'text-cyan-400'
                    }`}>
                      {challenge.current}/{challenge.target}
                    </span>
                  </div>
                  <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5 }}
                      className={`h-full ${
                        challenge.completed
                          ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                          : 'bg-gradient-to-r from-cyan-400 to-blue-500'
                      }`}
                    />
                  </div>
                </div>

                {/* Reward & Action */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-yellow-400 text-xl">⭐</span>
                    <span className="text-lg font-bold text-yellow-400">+{challenge.reward}</span>
                  </div>
                  
                  {!challenge.completed && (
                    <button
                      onClick={() => simulateProgress(challenge)}
                      className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:shadow-lg hover:shadow-cyan-500/50 rounded-lg font-medium text-sm transition-all"
                    >
                      Test Progress
                    </button>
                  )}
                  
                  {challenge.completed && (
                    <span className="text-green-400 font-bold">✓ Fertig</span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Completion Bonus Info */}
        {completionPercentage === 100 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-8 glass-effect rounded-xl p-8 border-4 border-green-500/50 text-center"
          >
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-3xl font-bold text-green-400 mb-2">Perfekter Tag!</h2>
            <p className="text-xl text-white mb-4">Du hast alle heutigen Challenges abgeschlossen!</p>
            <p className="text-2xl font-bold text-yellow-400">+75 Bonus-Punkte! 🎉</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default DailyChallengesPage;
