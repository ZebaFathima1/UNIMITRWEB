import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import StickyNavbar from './components/StickyNavbar';
import LandingPage from './components/LandingPage';
import LoginScreen from './components/LoginScreen';
import StudentDashboard from './components/StudentDashboard';
import ClubsPage from './components/ClubsPage';
import EventsPage from './components/EventsPage';
import WorkshopsPage from './components/WorkshopsPage';
import VolunteeringPage from './components/VolunteeringPage';
import PlacementsPage from './components/PlacementsPage';
import AdminDashboard from './components/AdminDashboard';
import ProfileDrawer from './components/ProfileDrawer';
import LeaderboardScreen from './components/LeaderboardScreen';
import GamificationScreen from './components/GamificationScreen';
import QRScannerScreen from './components/QRScannerScreen';
import SettingsScreen from './components/SettingsScreen';
import DigitalTwinScreen from './components/DigitalTwinScreen';
import CreateEventScreen from './components/CreateEventScreen';
import UploadBannerScreen from './components/UploadBannerScreen';
import EditEventsScreen from './components/EditEventsScreen';
import ViewRequestsScreen from './components/ViewRequestsScreen';
import { Toaster } from './components/ui/sonner';
import { login as apiLogin, signup as apiSignup, setAuthHeaders } from './lib/api';
import { toast } from 'sonner';

import type { Screen, UserRole } from './types';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [screenHistory, setScreenHistory] = useState<Screen[]>([]);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userName, setUserName] = useState('SRU');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isDark, setIsDark] = useState<boolean>(false);

  // Theme init and persistence
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    // Force dark as default when no saved preference exists
    const initialDark = saved ? saved === 'dark' : true;
    setIsDark(initialDark);
    if (initialDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    if (!saved) localStorage.setItem('theme', initialDark ? 'dark' : 'light');

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e: MediaQueryListEvent) => {
      const current = localStorage.getItem('theme');
      // Only react to system changes if the user has not set a preference
      if (!current) {
        if (e.matches) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
        setIsDark(e.matches);
      }
    };
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  const setTheme = (next: boolean) => {
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };
  const toggleTheme = () => setTheme(!isDark);

  const handleLogin = async (payload: { role: 'student' | 'admin'; email: string; name?: string; password?: string; isSignup?: boolean }) => {
    try {
      let response;
      
      if (payload.isSignup) {
        // Handle signup
        if (!payload.password || !payload.name) {
          toast.error('Please provide all required information');
          return;
        }
        
        const nameParts = payload.name.split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || '';
        
        await apiSignup({
          username: payload.email,
          email: payload.email,
          password: payload.password,
          first_name: firstName,
          last_name: lastName,
        });
        
        toast.success('Account created successfully! Please login.');
        return;
      }
      
      // Handle login - enforce password-based auth only (persisted users)
      if (!payload.password) {
        toast.error('Password is required to login. If you do not have an account, please sign up.');
        return;
      }
      response = await apiLogin({ 
        email: payload.email, 
        password: payload.password 
      });
      
      setAuthHeaders(payload.role, payload.email);
      setUserRole(payload.role);
      setUserEmail(payload.email);
      setUserName(response.user?.first_name || payload.name || 'User');
      
      // Rely on backend to determine admin/staff privileges; do not override on client
      
      const newScreen = payload.role === 'admin' ? 'admin' : 'dashboard';
      setCurrentScreen(newScreen);
      setScreenHistory([newScreen]);
      toast.success('Logged in successfully!');
    } catch (err: any) {
      console.error(err);
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || 'Login failed. Please check your credentials.';
      toast.error(errorMessage);
    }
  };

  const handleNavigation = (screen: Screen) => {
    setScreenHistory([...screenHistory, currentScreen]);
    setCurrentScreen(screen);
    setDrawerOpen(false);
  };

  const handleBack = () => {
    if (screenHistory.length > 0) {
      const previousScreen = screenHistory[screenHistory.length - 1];
      setScreenHistory(screenHistory.slice(0, -1));
      setCurrentScreen(previousScreen);
    }
  };

  const handleLogout = () => {
    setAuthHeaders(undefined, undefined);
    setUserRole(null);
    setUserEmail(null);
    setCurrentScreen('home');
    setDrawerOpen(false);
    setScreenHistory([]);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <LandingPage onGetStarted={() => setCurrentScreen('login')} />;
      case 'login':
        return <LoginScreen onLogin={handleLogin} />;
      case 'dashboard':
        return <StudentDashboard userName={userName} onNavigate={handleNavigation} />;
      case 'clubs':
        return <ClubsPage isAdmin={userRole === 'admin'} />;
      case 'events':
        return <EventsPage userEmail={userEmail || undefined} />;
      case 'workshops':
        return <WorkshopsPage />;
      case 'volunteering':
        return <VolunteeringPage />;
      case 'internships':
        return <PlacementsPage />;
      case 'admin':
        return <AdminDashboard onNavigate={handleNavigation} />;
      case 'leaderboard':
        return <LeaderboardScreen onBack={handleBack} />;
      case 'gamification':
        return <GamificationScreen onBack={handleBack} />;
      case 'qrscanner':
        return <QRScannerScreen onBack={handleBack} />;
      case 'settings':
        return <SettingsScreen onBack={handleBack} darkMode={isDark} onToggleDarkMode={setTheme} />;
      case 'digitaltwin':
        return (
          <DigitalTwinScreen
            onBack={handleBack}
            userName={userName}
            userActivity={{
              eventsAttended: 12,
              volunteeringHours: 8,
              workshopsCompleted: 5,
              challengesCompleted: 4,
              lastActive: new Date(),
            }}
          />
        );
      case 'createevent':
        return <CreateEventScreen onBack={handleBack} />;
      case 'uploadbanner':
        return <UploadBannerScreen onBack={handleBack} />;
      case 'editevents':
        return <EditEventsScreen onBack={handleBack} />;
      case 'viewrequests':
        return <ViewRequestsScreen onBack={handleBack} />;
      default:
        return <LandingPage onGetStarted={() => setCurrentScreen('login')} />;
    }
  };

  const showNavbar = currentScreen !== 'login' && currentScreen !== 'home' && currentScreen !== 'splash' && !drawerOpen;

  return (
    <div className={
      `relative min-h-screen ` +
      `bg-gradient-to-br from-amber-50 via-white to-blue-50 ` +
      `dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100`
    }>
      {/* Toaster for notifications */}
      <Toaster position="top-center" richColors />

      {/* Profile Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <ProfileDrawer
            onClose={() => setDrawerOpen(false)}
            onLogout={handleLogout}
            onNavigate={handleNavigation}
            userName={userName}
          />
        )}
      </AnimatePresence>

      {/* Sticky Navigation Bar */}
      {showNavbar && (
        <StickyNavbar
          currentTab={currentScreen}
          onNavigate={handleNavigation}
          onLogin={() => setCurrentScreen('login')}
          isLoggedIn={userRole !== null}
          userName={userName}
          onProfileClick={() => setDrawerOpen(true)}
        />
      )}

      {/* Floating theme toggle */}
      <button
        onClick={toggleTheme}
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        className="fixed bottom-6 right-6 z-50 inline-flex items-center justify-center w-11 h-11 rounded-full shadow-lg border border-slate-200/60 bg-white text-slate-700 hover:scale-105 transition active:scale-95 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700"
      >
        {isDark ? '☀️' : '🌙'}
      </button>

      {/* Main Content */}
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScreen}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen"
          >
            {renderScreen()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}