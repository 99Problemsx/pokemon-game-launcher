import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiTrendingUp, FiClock, FiActivity, FiDownload, 
  FiRefreshCw, FiBarChart2, FiPieChart, FiTarget 
} from 'react-icons/fi';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import statisticsService from '../services/statisticsService';
import { toast } from 'react-toastify';
import { useTranslation } from '../i18n/translations';

const StatisticsPage = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = () => {
    setLoading(true);
    try {
      const data = statisticsService.getStatistics();
      setStats(data);
    } catch (error) {
      console.error('Error loading statistics:', error);
      toast.error(t('errorLoadingStats'));
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    try {
      statisticsService.exportStatistics();
      toast.success(t('statsExportedSuccess'));
    } catch (error) {
      toast.error(t('errorExporting'));
    }
  };

  const handleReset = () => {
    if (statisticsService.resetStatistics()) {
      loadStatistics();
      toast.success(t('statsReset'));
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-full">
        <FiRefreshCw className="animate-spin text-4xl text-purple-500" />
      </div>
    );
  }

  const last7Days = statisticsService.getLast7DaysData();
  const peakTimes = statisticsService.getPeakTimesData();

  // Features Usage für Pie Chart
  const featuresData = Object.entries(stats.featuresUsage).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            {t('statisticsTitle')}
          </h1>
          <p className="text-gray-400 mt-2">
            {t('statisticsDesc')}
          </p>
        </div>
        
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={loadStatistics}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center gap-2 hover:shadow-lg hover:shadow-purple-500/50 transition-all"
          >
            <FiRefreshCw className="w-4 h-4" />
            {t('checkNow')}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleExport}
            className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg flex items-center gap-2 hover:shadow-lg hover:shadow-green-500/50 transition-all"
          >
            <FiDownload className="w-4 h-4" />
            {t('exportButton')}
          </motion.button>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: 'overview', label: t('overviewTab'), icon: FiActivity },
          { id: 'charts', label: 'Charts', icon: FiBarChart2 },
          { id: 'features', label: 'Features', icon: FiPieChart },
          { id: 'sessions', label: t('sessionsTab'), icon: FiClock }
        ].map((tab) => (
          <motion.button
            key={tab.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedTab(tab.id)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
              selectedTab === tab.id
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg'
                : 'bg-white/5 hover:bg-white/10'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </motion.button>
        ))}
      </div>

      {/* Overview Tab */}
      {selectedTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-xl rounded-xl p-6 border border-purple-500/30"
          >
            <div className="flex items-center gap-3 mb-2">
              <FiTarget className="w-6 h-6 text-purple-400" />
              <h3 className="text-lg font-semibold">{t('totalLaunches')}</h3>
            </div>
            <p className="text-3xl font-bold text-purple-400">{stats.totalLaunches}</p>
            <p className="text-sm text-gray-400 mt-1">{t('thisWeek')}: {stats.launchesThisWeek}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 backdrop-blur-xl rounded-xl p-6 border border-blue-500/30"
          >
            <div className="flex items-center gap-3 mb-2">
              <FiClock className="w-6 h-6 text-blue-400" />
              <h3 className="text-lg font-semibold">{t('totalTime')}</h3>
            </div>
            <p className="text-3xl font-bold text-blue-400">{formatTime(stats.totalPlaytime)}</p>
            <p className="text-sm text-gray-400 mt-1">{t('avgSessionLength')}: {formatTime(stats.averageSessionTime)}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 backdrop-blur-xl rounded-xl p-6 border border-green-500/30"
          >
            <div className="flex items-center gap-3 mb-2">
              <FiTrendingUp className="w-6 h-6 text-green-400" />
              <h3 className="text-lg font-semibold">Top Feature</h3>
            </div>
            <p className="text-2xl font-bold text-green-400">
              {stats.mostUsedFeature.feature || 'N/A'}
            </p>
            <p className="text-sm text-gray-400 mt-1">{stats.mostUsedFeature.count}x genutzt</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-orange-600/20 to-yellow-600/20 backdrop-blur-xl rounded-xl p-6 border border-orange-500/30"
          >
            <div className="flex items-center gap-3 mb-2">
              <FiActivity className="w-6 h-6 text-orange-400" />
              <h3 className="text-lg font-semibold">Peak Zeit</h3>
            </div>
            <p className="text-3xl font-bold text-orange-400">{stats.peakHour}</p>
            <p className="text-sm text-gray-400 mt-1">Aktivste Stunde</p>
          </motion.div>
        </div>
      )}

      {/* Charts Tab */}
      {selectedTab === 'charts' && (
        <div className="space-y-6">
          {/* Launches Last 7 Days */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10"
          >
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FiTrendingUp className="text-purple-400" />
              {t('launchTrend')}
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={last7Days}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="day" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#f3f4f6' }}
                />
                <Legend />
                <Line type="monotone" dataKey="launches" stroke="#8b5cf6" strokeWidth={2} name={t('launches')} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Peak Times */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10"
          >
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FiActivity className="text-blue-400" />
              {t('peakTimes')}
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={peakTimes}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="hour" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#f3f4f6' }}
                />
                <Bar dataKey="launches" fill="#3b82f6" name={t('launches')} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      )}

      {/* Features Tab */}
      {selectedTab === 'features' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10"
        >
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FiPieChart className="text-pink-400" />
            {t('featureUsage')}
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={featuresData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {featuresData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            <div className="space-y-3">
              {Object.entries(stats.featuresUsage).map(([feature, count], index) => (
                <div key={feature} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="font-medium capitalize">{feature}</span>
                  </div>
                  <span className="text-gray-400">{count}x</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Sessions Tab */}
      {selectedTab === 'sessions' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10"
        >
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FiClock className="text-green-400" />
            {t('sessionsTab')} ({t('last30')})
          </h3>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {stats.sessionsHistory.length === 0 ? (
              <p className="text-gray-400 text-center py-8">{t('noSessionsYet')}</p>
            ) : (
              stats.sessionsHistory.map((session, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all"
                >
                  <div>
                    <p className="font-medium">
                      {new Date(session.date).toLocaleString('de-DE')}
                    </p>
                    <p className="text-sm text-gray-400">
                      {session.features.length > 0 
                        ? `${t('features')}: ${session.features.join(', ')}`
                        : t('noFeaturesUsed')
                      }
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-purple-400">{formatTime(session.duration)}</p>
                    <p className="text-sm text-gray-400">{session.launches} {t('launchesCount')}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      )}

      {/* Reset Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex justify-center pt-4"
      >
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 rounded-lg text-red-400 transition-all"
        >
          🔄 {t('resetStatistics')}
        </button>
      </motion.div>
    </div>
  );
};

export default StatisticsPage;
