import { motion } from 'motion/react';
import { X, Trophy, Award, QrCode, Settings, LogOut, User, Sparkles, Activity, ClipboardList } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';

import type { Screen } from '../types';

interface ProfileDrawerProps {
  onClose: () => void;
  onLogout: () => void;
  onNavigate: (screen: Screen) => void;
  userName: string;
}

export default function ProfileDrawer({ onClose, onLogout, onNavigate, userName }: ProfileDrawerProps) {
  const savedProfileImage = typeof window !== 'undefined' ? localStorage.getItem('profileImage') : null;
  const badges = [
    { icon: '🎨', label: 'Creative Organizer', color: 'bg-pink-100 text-pink-700' },
    { icon: '💪', label: 'Top Volunteer', color: 'bg-purple-100 text-purple-700' },
    { icon: '💡', label: 'Knowledge Guru', color: 'bg-cyan-100 text-cyan-700' },
    { icon: '🏅', label: 'Event Explorer', color: 'bg-yellow-100 text-yellow-700' },
  ];

  // Current mood for the avatar
  const currentMood = { emoji: '🎯', label: 'High Performance' };

  const menuItems = [
    { 
      icon: Sparkles, 
      label: 'Digital Twin', 
      onClick: () => onNavigate('digitaltwin'),
      color: 'text-pink-600',
      hoverColor: 'hover:bg-pink-50'
    },
    { 
      icon: ClipboardList, 
      label: 'My Applications', 
      onClick: () => onNavigate('myapplications'),
      color: 'text-indigo-600',
      hoverColor: 'hover:bg-indigo-50'
    },
    { 
      icon: Trophy, 
      label: 'View Leaderboard', 
      onClick: () => onNavigate('leaderboard'),
      color: 'text-yellow-600',
      hoverColor: 'hover:bg-yellow-50'
    },
    { 
      icon: Award, 
      label: 'Gamifications', 
      onClick: () => onNavigate('gamification'),
      color: 'text-pink-600',
      hoverColor: 'hover:bg-pink-50'
    },
    { 
      icon: QrCode, 
      label: 'QR Code Scanning', 
      onClick: () => onNavigate('qrscanner'),
      color: 'text-cyan-600',
      hoverColor: 'hover:bg-cyan-50'
    },
    { 
      icon: Settings, 
      label: 'Settings', 
      onClick: () => onNavigate('settings'),
      color: 'text-purple-600',
      hoverColor: 'hover:bg-purple-50'
    },
    { 
      icon: LogOut, 
      label: 'Logout', 
      onClick: onLogout, 
      danger: true,
      color: 'text-red-600',
      hoverColor: 'hover:bg-red-50'
    },
  ];

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Drawer */}
      <motion.div
        initial={{ x: -320 }}
        animate={{ x: 0 }}
        exit={{ x: -320 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed left-0 top-0 bottom-0 w-80 bg-white shadow-2xl z-50 overflow-y-auto"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <Avatar className="w-16 h-16 bg-white/20">
                {savedProfileImage ? (
                  <AvatarImage src={savedProfileImage} alt="Profile" />
                ) : (
                  <AvatarFallback className="text-white">{userName[0]}</AvatarFallback>
                )}
              </Avatar>
              {/* Mood indicator */}
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg"
              >
                <span className="text-lg">{currentMood.emoji}</span>
              </motion.div>
            </div>
            <div>
              <h3 className="text-white">{userName}</h3>
              <p className="text-purple-200">Management</p>
              <p className="text-purple-100 text-xs flex items-center gap-1 mt-1">
                <Sparkles className="w-3 h-3" />
                {currentMood.label}
              </p>
            </div>
          </div>

          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
            <div className="flex items-center justify-between text-white">
              <span>Total Points</span>
              <span className="flex items-center gap-1">
                <Trophy className="w-5 h-5" />
                450
              </span>
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="p-6">
          <h4 className="text-gray-800 mb-3">Your Badges</h4>
          <div className="grid grid-cols-2 gap-3">
            {badges.map((badge, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className={`${badge.color} rounded-xl p-3 text-center`}
              >
                <div className="text-2xl mb-1">{badge.icon}</div>
                <p className="text-xs">{badge.label}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Menu Items */}
        <div className="px-6 pb-6 space-y-2">
          {menuItems.map((item, idx) => (
            <motion.button
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + idx * 0.05 }}
              onClick={item.onClick}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all relative ${item.color} ${item.hoverColor}`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
              {/* Special pulse indicator for Digital Twin */}
              {idx === 0 && (
                <motion.span
                  animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute right-3 w-2 h-2 bg-pink-500 rounded-full"
                />
              )}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </>
  );
}