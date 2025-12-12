import { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, User, ShieldCheck, UserPlus } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from 'sonner';

interface LoginScreenProps {
  onLogin: (payload: { role: 'student' | 'admin'; email: string; name?: string; password?: string; isSignup?: boolean }) => Promise<void> | void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (role: 'student' | 'admin') => {
    if (!email || !password) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (isSignup) {
      if (!name) {
        toast.error('Please enter your name');
        return;
      }
      if (password !== confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
      if (password.length < 6) {
        toast.error('Password must be at least 6 characters');
        return;
      }
    }

    setLoading(true);
    try {
      await onLogin({ 
        role, 
        email, 
        name: name || email.split('@')[0],
        password,
        isSignup 
      });
      
      // Clear form after successful signup
      if (isSignup) {
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setName('');
        setIsSignup(false);
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 space-y-6 border border-purple-100">
          {/* Header */}
          <div className="text-center space-y-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg"
            >
              {isSignup ? (
                <UserPlus className="w-10 h-10 text-white" />
              ) : (
                <User className="w-10 h-10 text-white" />
              )}
            </motion.div>
            <h2 className="text-3xl font-bold text-purple-700">
              {isSignup ? 'Create Account' : 'Welcome Back!'}
            </h2>
            <p className="text-gray-600">
              {isSignup ? 'Sign up to get started' : 'Sign in to continue your journey'}
            </p>
          </div>

          {/* Form */}
          <div className="space-y-4">
            {isSignup && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
                <Input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-12 rounded-2xl border-purple-200 focus:border-purple-400 h-12"
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
              <Input
                type={isSignup ? "email" : "text"}
                placeholder={isSignup ? "Email Address" : "Username or Email"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-12 rounded-2xl border-purple-200 focus:border-purple-400 h-12"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-12 rounded-2xl border-purple-200 focus:border-purple-400 h-12"
              />
            </div>

            {isSignup && (
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
                <Input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-12 rounded-2xl border-purple-200 focus:border-purple-400 h-12"
                />
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="space-y-3">
            <Button
              onClick={() => handleSubmit('student')}
              disabled={loading}
              className="w-full h-12 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 shadow-lg hover:shadow-xl transition-all text-base font-semibold"
            >
              <User className="w-5 h-5 mr-2" />
              {loading ? 'Please wait...' : isSignup ? 'Sign up as Student' : 'Login as Student'}
            </Button>

            <Button
              onClick={() => handleSubmit('admin')}
              disabled={loading}
              variant="outline"
              className="w-full h-12 rounded-2xl border-2 border-cyan-400 text-cyan-600 hover:bg-cyan-50 hover:border-cyan-500 transition-all text-base font-semibold"
            >
              <ShieldCheck className="w-5 h-5 mr-2" />
              {loading ? 'Please wait...' : isSignup ? 'Sign up as Admin' : 'Login as Admin'}
            </Button>
          </div>

          {/* Toggle between login and signup */}
          <div className="text-center pt-4 border-t border-purple-100">
            <p className="text-gray-600">
              {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                onClick={() => {
                  setIsSignup(!isSignup);
                  setPassword('');
                  setConfirmPassword('');
                  setName('');
                }}
                className="text-purple-600 hover:text-purple-700 font-semibold hover:underline"
              >
                {isSignup ? 'Sign in' : 'Sign up'}
              </button>
            </p>
          </div>
        </div>

        {/* Decorative illustration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-8"
        >
          <p className="text-purple-400 text-sm">Powered by UniMitr</p>
        </motion.div>
      </motion.div>
    </div>
  );
}