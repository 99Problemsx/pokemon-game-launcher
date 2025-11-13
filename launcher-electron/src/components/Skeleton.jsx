import React from 'react';
import { motion } from 'framer-motion';

export const SkeletonCard = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="glass-effect rounded-2xl border border-gray-700 p-8"
  >
    {/* Image Skeleton */}
    <div className="w-48 h-64 bg-gradient-to-r from-dark-700 via-dark-600 to-dark-700 rounded-xl animate-pulse mb-6" />
    
    {/* Title Skeleton */}
    <div className="h-8 w-64 bg-gradient-to-r from-dark-700 via-dark-600 to-dark-700 rounded animate-pulse mb-4" />
    
    {/* Description Skeleton */}
    <div className="space-y-2 mb-6">
      <div className="h-4 w-full bg-gradient-to-r from-dark-700 via-dark-600 to-dark-700 rounded animate-pulse" />
      <div className="h-4 w-5/6 bg-gradient-to-r from-dark-700 via-dark-600 to-dark-700 rounded animate-pulse" />
    </div>
    
    {/* Button Skeleton */}
    <div className="h-12 w-40 bg-gradient-to-r from-dark-700 via-dark-600 to-dark-700 rounded-xl animate-pulse" />
  </motion.div>
);

export const SkeletonNewsCard = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="glass-effect rounded-xl border border-gray-700 p-4"
  >
    {/* Title */}
    <div className="h-6 w-3/4 bg-gradient-to-r from-dark-700 via-dark-600 to-dark-700 rounded animate-pulse mb-3" />
    
    {/* Content */}
    <div className="space-y-2">
      <div className="h-3 w-full bg-gradient-to-r from-dark-700 via-dark-600 to-dark-700 rounded animate-pulse" />
      <div className="h-3 w-5/6 bg-gradient-to-r from-dark-700 via-dark-600 to-dark-700 rounded animate-pulse" />
      <div className="h-3 w-4/6 bg-gradient-to-r from-dark-700 via-dark-600 to-dark-700 rounded animate-pulse" />
    </div>
    
    {/* Date */}
    <div className="h-3 w-24 bg-gradient-to-r from-dark-700 via-dark-600 to-dark-700 rounded animate-pulse mt-4" />
  </motion.div>
);

export const SkeletonText = ({ width = 'w-full' }) => (
  <div className={`h-4 ${width} bg-gradient-to-r from-dark-700 via-dark-600 to-dark-700 rounded animate-pulse`} />
);
