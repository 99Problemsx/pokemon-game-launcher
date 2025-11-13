import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiMinus, FiMaximize2, FiX, FiGlobe } from 'react-icons/fi';

const TitleBar = () => {
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'de');

  const handleMinimize = () => {
    window.electron?.minimizeWindow();
  };

  const handleMaximize = () => {
    window.electron?.maximizeWindow();
  };

  const handleClose = () => {
    window.electron?.closeWindow();
  };

  const toggleLanguage = () => {
    const newLang = language === 'de' ? 'en' : 'de';
    setLanguage(newLang);
    localStorage.setItem('language', newLang);
    // Reload app to apply language change
    setTimeout(() => window.location.reload(), 100);
  };

  return (
    <div className="h-8 bg-dark-800/80 backdrop-blur-md flex items-center justify-between px-4 select-none relative z-50 border-b border-white/5"
         style={{ WebkitAppRegion: 'drag' }}>
      {/* Logo & Title */}
      <div className="flex items-center space-x-2">
        <motion.div
          animate={{
            rotate: [0, 360],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatDelay: 2
          }}
          className="w-4 h-4 bg-gradient-to-br from-red-500 to-purple-600 rounded-sm glow-effect"
        ></motion.div>
        <motion.span
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-xs font-semibold text-white/90 tracking-wider"
        >
          MIRRORBYTES STUDIO
        </motion.span>
      </div>

      {/* Language Switcher & Window Controls */}
      <div className="flex items-center space-x-1" style={{ WebkitAppRegion: 'no-drag' }}>
        {/* Language Switcher */}
        <motion.button
          whileHover={{ backgroundColor: 'rgba(6, 182, 212, 0.2)', scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleLanguage}
          className="h-8 px-3 flex items-center space-x-1.5 text-white/70 hover:text-cyan-400 transition-colors rounded group"
          title={language === 'de' ? 'Switch to English' : 'Zu Deutsch wechseln'}
        >
          <FiGlobe size={13} className="group-hover:text-cyan-400" />
          <span className="text-xs font-medium group-hover:text-cyan-400">
            {language === 'de' ? '🇩🇪' : '🇬🇧'}
          </span>
        </motion.button>

        <div className="w-px h-5 bg-white/10 mx-1"></div>

        {/* Window Controls */}
        <motion.button
          whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleMinimize}
          className="w-10 h-8 flex items-center justify-center text-white/70 hover:text-white transition-colors rounded"
        >
          <FiMinus size={14} />
        </motion.button>
        <motion.button
          whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleMaximize}
          className="w-10 h-8 flex items-center justify-center text-white/70 hover:text-white transition-colors rounded"
        >
          <FiMaximize2 size={12} />
        </motion.button>
        <motion.button
          whileHover={{ backgroundColor: 'rgba(239, 68, 68, 0.8)', scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleClose}
          className="w-10 h-8 flex items-center justify-center text-white/70 hover:text-white transition-colors rounded"
        >
          <FiX size={16} />
        </motion.button>
      </div>
    </div>
  );
};

export default TitleBar;
