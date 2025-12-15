import { motion } from 'motion/react';
import { Calendar, Users, Heart, Briefcase, LogIn, UserCircle, BookOpen, Home } from 'lucide-react';
import internshipLogo from '../assets/WhatsApp Image 2025-12-06 at 19.52.38_7e3c71fa.jpg';
import { Button } from './ui/button';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';

import type { Screen } from '../types';
import logo from '../assets/WhatsApp Image 2025-11-29 at 15.20.36_76796458.jpg';

interface StickyNavbarProps {
  currentTab: Screen;
  onNavigate: (tab: Screen) => void;
  onLogin: () => void;
  isLoggedIn: boolean;
  userName?: string;
  onProfileClick?: () => void;
}

export default function StickyNavbar({ currentTab, onNavigate, onLogin, isLoggedIn, userName, onProfileClick }: StickyNavbarProps) {
  const allTabs: { id: Screen; label: string; icon: any; isCenter?: boolean }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'clubs', label: 'Clubs', icon: Users },
    { id: 'internships', label: 'Internships', icon: Briefcase, isCenter: true },
    { id: 'workshops', label: 'Workshops', icon: BookOpen },
    { id: 'volunteering', label: 'Volunteering', icon: Heart },
  ];

  // Show protected tabs (like 'internships', 'dashboard') only when logged in
  const tabs = allTabs.filter((t) => {
    if ((t.id === 'internships' || t.id === 'dashboard') && !isLoggedIn) return false;
    return true;
  });

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-md"
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => onNavigate('home')}
            whileHover={{ scale: 1.05 }}
          >
            <motion.img
              src={logo}
              alt="Uniमित्र Logo"
              className="w-12 h-12 rounded-lg"
              whileHover={{ rotate: [0, -5, 5, 0] }}
              transition={{ duration: 0.5 }}
            />
            <div>
              <h1 className="text-gray-900 text-2xl">Uniमित्र</h1>
              <p className="text-gray-500 text-xs">Community Platform</p>
            </div>
          </motion.div>

          {/* Navigation Tabs - Desktop */}
          <div className="hidden md:flex items-center gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              
              if (tab.isCenter) {
                return (
                  <motion.button
                    key={tab.id}
                    onClick={() => onNavigate(tab.id)}
                    className="relative mx-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.div
                      className={`flex items-center gap-2 px-6 py-3 rounded-xl shadow-lg transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 text-white'
                          : 'bg-gradient-to-r from-orange-400 via-pink-400 to-purple-500 text-white hover:from-orange-500 hover:via-pink-500 hover:to-purple-600'
                      }`}
                      animate={isActive ? {
                        boxShadow: [
                          '0 4px 20px rgba(236, 72, 153, 0.4)',
                          '0 4px 20px rgba(168, 85, 247, 0.4)',
                          '0 4px 20px rgba(236, 72, 153, 0.4)',
                        ],
                      } : {}}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {/* use provided internship image for center tab */}
                      <img src={internshipLogo} alt="Internships" className="w-6 h-6 object-contain" />
                      <span className="font-semibold">{tab.label}</span>
                      {isActive && (
                        <motion.div
                          className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        />
                      )}
                    </motion.div>
                  </motion.button>
                );
              }
              
              return (
                <button
                  key={tab.id}
                  onClick={() => onNavigate(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Login/Profile Button */}
          <div>
            {isLoggedIn ? (
                <button
                  onClick={onProfileClick}
                  className="flex items-center gap-2 px-3 py-1 rounded-lg bg-gradient-to-r from-blue-600 to-red-600 text-white shadow-md hover:shadow-lg transition-shadow"
                >
                  <Avatar className="w-7 h-7 bg-white/20">
                    {typeof window !== 'undefined' && localStorage.getItem('profileImage') ? (
                      <AvatarImage src={localStorage.getItem('profileImage') as string} alt="Profile" />
                    ) : (
                      <AvatarFallback className="text-white">{(userName || 'P')[0]}</AvatarFallback>
                    )}
                  </Avatar>
                  <span>{userName || 'Profile'}</span>
                </button>
              ) : (
                <Button
                  onClick={onLogin}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-red-600 hover:from-blue-700 hover:to-red-700"
                >
                  <LogIn className="w-5 h-5" />
                  Login
                </Button>
              )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center justify-around mt-4 gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            
            if (tab.isCenter) {
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => onNavigate(tab.id)}
                  className="relative"
                  whileTap={{ scale: 0.9 }}
                >
                  <motion.div
                    className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl shadow-lg -mt-2 ${
                      isActive
                        ? 'bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 text-white'
                        : 'bg-gradient-to-br from-orange-400 via-pink-400 to-purple-500 text-white'
                    }`}
                    animate={isActive ? {
                      boxShadow: [
                        '0 4px 15px rgba(236, 72, 153, 0.5)',
                        '0 4px 15px rgba(168, 85, 247, 0.5)',
                        '0 4px 15px rgba(236, 72, 153, 0.5)',
                      ],
                    } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {/* use provided internship image for center tab (mobile) */}
                    <img src={internshipLogo} alt="Internships" className="w-6 h-6 object-contain" />
                    <span className="text-xs font-semibold">{tab.label}</span>
                    {isActive && (
                      <motion.div
                        className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-yellow-400 rounded-full"
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      />
                    )}
                  </motion.div>
                </motion.button>
              );
            }
            
            return (
              <button
                key={tab.id}
                onClick={() => onNavigate(tab.id)}
                className={`flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
}