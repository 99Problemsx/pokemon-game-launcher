import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../i18n';

const LanguageSelector = () => {
  const { language, changeLanguage, availableLanguages } = useTranslation();

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-300">
        Language / Sprache
      </label>
      <div className="grid grid-cols-2 gap-3">
        {availableLanguages.map((lang) => (
          <motion.button
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`p-4 rounded-lg border-2 transition-all ${
              language === lang.code
                ? 'border-blue-500 bg-blue-500/20'
                : 'border-gray-700 bg-dark-700 hover:border-gray-600'
            }`}
          >
            <div className="flex items-center space-x-3">
              <span className="text-3xl">{lang.flag}</span>
              <div className="text-left">
                <div className="font-semibold">{lang.name}</div>
                <div className="text-xs text-gray-400">{lang.code.toUpperCase()}</div>
              </div>
              {language === lang.code && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="ml-auto text-blue-400"
                >
                  ✓
                </motion.div>
              )}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSelector;
