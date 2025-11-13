import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown, FiTerminal, FiMonitor, FiCopy, FiFolder } from 'react-icons/fi';

const LaunchOptions = ({ onLaunch }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState({
    debugMode: false,
    windowedMode: false,
    createBackup: false
  });

  const options = [
    {
      id: 'debugMode',
      icon: <FiTerminal />,
      label: 'Debug Mode',
      description: 'Startet das Spiel mit Debug-Konsole',
      flag: '--debug'
    },
    {
      id: 'windowedMode',
      icon: <FiMonitor />,
      label: 'Fenstermodus',
      description: 'Startet das Spiel im Fenster statt Vollbild',
      flag: '--windowed'
    },
    {
      id: 'createBackup',
      icon: <FiCopy />,
      label: 'Backup erstellen',
      description: 'Erstellt ein Backup vor dem Start',
      flag: '--backup'
    }
  ];

  const toggleOption = (optionId) => {
    setSelectedOptions(prev => ({
      ...prev,
      [optionId]: !prev[optionId]
    }));
  };

  const handleLaunch = () => {
    const flags = options
      .filter(opt => selectedOptions[opt.id])
      .map(opt => opt.flag);
    
    onLaunch(flags);
    setIsOpen(false);
  };

  const openSaveFolder = async () => {
    if (window.electron?.openSaveFolder) {
      await window.electron.openSaveFolder();
    }
  };

  return (
    <div className="relative">
      {/* Dropdown Toggle */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="p-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:shadow-2xl hover:shadow-cyan-500/50 rounded-xl font-bold transition-all glow-effect"
      >
        <FiChevronDown 
          size={24} 
          className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="fixed bottom-24 right-4 w-80 glass-effect-strong rounded-xl border border-gray-700 shadow-2xl z-[9999]"
          >
            {/* Options List */}
            <div className="p-4 space-y-3">
              <h3 className="text-sm font-bold text-gray-400 uppercase">Launch Optionen</h3>
              {options.map((option) => (
                <motion.button
                  key={option.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => toggleOption(option.id)}
                  className={`w-full p-3 rounded-lg text-left transition-all ${
                    selectedOptions[option.id]
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border border-cyan-500'
                      : 'bg-dark-700 hover:bg-dark-600'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`mt-0.5 ${selectedOptions[option.id] ? 'text-cyan-400' : 'text-gray-400'}`}>
                      {option.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{option.label}</span>
                        <div className={`w-10 h-5 rounded-full transition-colors ${
                          selectedOptions[option.id] ? 'bg-cyan-500' : 'bg-gray-600'
                        }`}>
                          <motion.div
                            animate={{ x: selectedOptions[option.id] ? 20 : 2 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            className="w-4 h-4 bg-white rounded-full mt-0.5"
                          />
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{option.description}</p>
                    </div>
                  </div>
                </motion.button>
              ))}

              {/* Save Folder Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={openSaveFolder}
                className="w-full p-3 bg-dark-700 hover:bg-dark-600 rounded-lg text-left transition-all flex items-center space-x-3"
              >
                <FiFolder className="text-yellow-400" />
                <div>
                  <span className="font-medium">Spielstand-Ordner</span>
                  <p className="text-xs text-gray-400">Ordner im Explorer öffnen</p>
                </div>
              </motion.button>
            </div>

            {/* Action Button */}
            <div className="p-4 border-t border-gray-700">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLaunch}
                className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-xl hover:shadow-green-500/50 rounded-lg font-bold transition-all glow-effect"
              >
                Mit Optionen starten
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LaunchOptions;
