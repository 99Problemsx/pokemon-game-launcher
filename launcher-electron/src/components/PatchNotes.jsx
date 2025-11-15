import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiTag, FiCalendar, FiUser } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';

const PatchNotes = ({ isOpen, onClose, releaseData }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [releaseNotes, setReleaseNotes] = useState(null);

  useEffect(() => {
    if (isOpen && releaseData) {
      fetchReleaseNotes();
    }
  }, [isOpen, releaseData]);

  const fetchReleaseNotes = async () => {
    setIsLoading(true);
    try {
      // If we already have the data, use it
      if (releaseData.body) {
        setReleaseNotes(releaseData);
        setIsLoading(false);
        return;
      }

      // Otherwise fetch from GitHub API
      const response = await fetch(`https://api.github.com/repos/${releaseData.repo?.owner || "YourGitHubUsername"}/${releaseData.repo?.name || "your-repo"}/releases/${releaseData.id}`);
      const data = await response.json();
      setReleaseNotes(data);
    } catch (error) {
      console.error('Failed to fetch release notes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="glass-effect-strong rounded-2xl border border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="glass-effect-strong border-b border-gray-700 p-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                {releaseNotes?.name || 'Release Notes'}
              </h2>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
                {releaseNotes?.tag_name && (
                  <div className="flex items-center space-x-1">
                    <FiTag size={14} />
                    <span>{releaseNotes.tag_name}</span>
                  </div>
                )}
                {releaseNotes?.published_at && (
                  <div className="flex items-center space-x-1">
                    <FiCalendar size={14} />
                    <span>{new Date(releaseNotes.published_at).toLocaleDateString('de-DE')}</span>
                  </div>
                )}
                {releaseNotes?.author?.login && (
                  <div className="flex items-center space-x-1">
                    <FiUser size={14} />
                    <span>{releaseNotes.author.login}</span>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <FiX size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
              </div>
            ) : releaseNotes?.body ? (
              <div className="prose prose-invert max-w-none">
                <ReactMarkdown
                  components={{
                    h1: ({ node, ...props }) => <h1 className="text-3xl font-bold mb-4 text-cyan-400" {...props} />,
                    h2: ({ node, ...props }) => <h2 className="text-2xl font-bold mb-3 mt-6 text-purple-400" {...props} />,
                    h3: ({ node, ...props }) => <h3 className="text-xl font-bold mb-2 mt-4 text-pink-400" {...props} />,
                    p: ({ node, ...props }) => <p className="mb-4 text-gray-300 leading-relaxed" {...props} />,
                    ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-4 space-y-2 text-gray-300" {...props} />,
                    ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-4 space-y-2 text-gray-300" {...props} />,
                    li: ({ node, ...props }) => <li className="ml-4" {...props} />,
                    a: ({ node, ...props }) => <a className="text-cyan-400 hover:text-cyan-300 underline" target="_blank" rel="noopener noreferrer" {...props} />,
                    code: ({ node, inline, ...props }) => 
                      inline 
                        ? <code className="bg-dark-700 px-2 py-1 rounded text-cyan-400 text-sm" {...props} />
                        : <code className="block bg-dark-700 p-4 rounded-lg overflow-x-auto text-sm mb-4" {...props} />,
                    blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-cyan-400 pl-4 italic text-gray-400 my-4" {...props} />,
                    hr: ({ node, ...props }) => <hr className="border-gray-700 my-6" {...props} />,
                  }}
                >
                  {releaseNotes.body}
                </ReactMarkdown>
              </div>
            ) : (
              <p className="text-center text-gray-400 py-12">Keine Release Notes verfügbar.</p>
            )}
          </div>

          {/* Footer */}
          <div className="glass-effect-strong border-t border-gray-700 p-6">
            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 rounded-lg font-bold transition-all"
            >
              Schließen
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PatchNotes;
