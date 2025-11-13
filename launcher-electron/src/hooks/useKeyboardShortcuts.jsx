import { useEffect } from 'react';

/**
 * Keyboard Shortcuts Hook
 * Zentrale Verwaltung aller Tastatur-Shortcuts
 */
export function useKeyboardShortcuts(activeSection, onSectionChange, onAction) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Alt + Number für Navigation
      if (e.altKey && !e.ctrlKey && !e.shiftKey) {
        const sections = [
          'home',        // Alt+1
          'library',     // Alt+2
          'changelog',   // Alt+3
          'achievements',// Alt+4
          'rewards',     // Alt+5
          'daily',       // Alt+6
          'challenges',  // Alt+7
          'news',        // Alt+8
          'themes',      // Alt+9
        ];

        const num = parseInt(e.key);
        if (num >= 1 && num <= sections.length) {
          e.preventDefault();
          onSectionChange(sections[num - 1]);
        }
      }

      // Ctrl + Shortcuts
      if (e.ctrlKey && !e.altKey && !e.shiftKey) {
        switch(e.key.toLowerCase()) {
          case 'r':
            e.preventDefault();
            window.location.reload();
            break;
          case 's':
            e.preventDefault();
            onSectionChange('settings');
            break;
          case 'u':
            e.preventDefault();
            onSectionChange('updates');
            break;
          case 'b':
            e.preventDefault();
            onSectionChange('backup');
            break;
          case 'd':
            e.preventDefault();
            onSectionChange('discord');
            break;
          case 'k':
            e.preventDefault();
            onAction?.('showShortcuts');
            break;
        }
      }

      // Einzelne Tasten
      if (!e.ctrlKey && !e.altKey && !e.shiftKey) {
        switch(e.key) {
          case 'Escape':
            if (activeSection !== 'home') {
              e.preventDefault();
              onSectionChange('home');
            }
            break;
          case 'F1':
            e.preventDefault();
            onAction?.('showHelp');
            break;
          case 'F5':
            e.preventDefault();
            window.location.reload();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeSection, onSectionChange, onAction]);
}

/**
 * Shortcuts Help Component
 */
export function ShortcutsHelp({ onClose }) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const shortcuts = [
    { category: 'Navigation', items: [
      { keys: ['Alt', '1-9'], desc: 'Schnell zu Seiten springen' },
      { keys: ['Esc'], desc: 'Zurück zur Startseite' },
    ]},
    { category: 'Aktionen', items: [
      { keys: ['Ctrl', 'R'], desc: 'Launcher neu laden' },
      { keys: ['Ctrl', 'S'], desc: 'Einstellungen öffnen' },
      { keys: ['Ctrl', 'U'], desc: 'Updates anzeigen' },
      { keys: ['Ctrl', 'B'], desc: 'Backups verwalten' },
      { keys: ['Ctrl', 'D'], desc: 'Discord Status' },
      { keys: ['Ctrl', 'K'], desc: 'Diese Hilfe anzeigen' },
    ]},
    { category: 'Allgemein', items: [
      { keys: ['F1'], desc: 'Hilfe anzeigen' },
      { keys: ['F5'], desc: 'Neu laden' },
    ]},
  ];

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="glass-effect rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">⌨️ Tastatur-Shortcuts</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {shortcuts.map((category) => (
            <div key={category.category}>
              <h3 className="text-lg font-semibold mb-3 text-cyan-400">
                {category.category}
              </h3>
              <div className="space-y-2">
                {category.items.map((item, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center justify-between p-3 bg-dark-700/50 rounded-lg"
                  >
                    <span className="text-gray-300">{item.desc}</span>
                    <div className="flex items-center space-x-1">
                      {item.keys.map((key, i) => (
                        <span key={i}>
                          <kbd className="px-3 py-1 bg-dark-600 border border-gray-600 rounded text-sm font-mono">
                            {key}
                          </kbd>
                          {i < item.keys.length - 1 && (
                            <span className="mx-1 text-gray-500">+</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center text-sm text-gray-400">
          Drücke <kbd className="px-2 py-1 bg-dark-600 border border-gray-600 rounded text-xs">Esc</kbd> zum Schließen
        </div>
      </div>
    </div>
  );
}

export default useKeyboardShortcuts;
