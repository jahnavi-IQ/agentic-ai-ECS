// File: src/app/(auth)/login/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, confirmSignIn, signOut } from 'aws-amplify/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Sparkles, Mail, Phone, ArrowLeft } from 'lucide-react';
import { isValidPhoneNumber } from 'libphonenumber-js';
import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading: authLoading, refreshUser } = useAuth();
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showClearSession, setShowClearSession] = useState(false);
  const [waitingForAuth, setWaitingForAuth] = useState(false);
  
  const redirectTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Clear any pending redirects on unmount
  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }
    };
  }, []);

  // Handle redirect when user becomes available AFTER login
  useEffect(() => {
    if (waitingForAuth && !authLoading && user) {
      console.log('✅ User loaded after login, redirecting to home...');
      toast.success('Redirecting to chat...');
      
      redirectTimerRef.current = setTimeout(() => {
        router.push('/');
      }, 300);
    }
  }, [waitingForAuth, authLoading, user, router]);

  // Handle already authenticated (before login attempt)
  useEffect(() => {
    if (!authLoading && user && !waitingForAuth) {
      console.log('✅ Already authenticated, redirecting...');
      toast.info('You are already signed in');
      router.push('/');
    }
  }, [user, authLoading, waitingForAuth, router]);

  // Show loading while checking initial auth
  if (authLoading && !waitingForAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin h-8 w-8 border-4 border-gold border-t-transparent rounded-full" />
          <p className="text-sm text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show waiting state after successful login
  if (waitingForAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin h-8 w-8 border-4 border-gold border-t-transparent rounded-full" />
          <p className="text-sm text-muted-foreground">
            {authLoading ? 'Loading user data...' : 'Redirecting to chat...'}
          </p>
        </div>
      </div>
    );
  }

  // Redirect if already authenticated (prevent showing form)
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin h-8 w-8 border-4 border-gold border-t-transparent rounded-full" />
          <p className="text-sm text-muted-foreground">Redirecting to chat...</p>
        </div>
      </div>
    );
  }

  const handleClearSession = async () => {
    setLoading(true);
    try {
      console.log('🧹 Clearing session...');
      await signOut({ global: true });
      toast.success('Session cleared! Please try again.');
      setShowClearSession(false);
      setUsername('');
      setPassword('');
      
      // Wait for session to fully clear
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Clear session error:', error);
      toast.error('Please refresh the page and try again');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!username || !password) {
        toast.error('Please fill in all fields');
        setLoading(false);
        return;
      }

      let formattedUsername = username;
      if (loginMethod === 'phone') {
        const cleaned = username.replace(/\D/g, '');
        
        if (cleaned.startsWith('91') && cleaned.length === 12) {
          formattedUsername = `+${cleaned}`;
        } else if (cleaned.startsWith('1') && cleaned.length === 11) {
          formattedUsername = `+${cleaned}`;
        } else if (cleaned.length === 10) {
          formattedUsername = `+1${cleaned}`;
        } else if (username.startsWith('+')) {
          formattedUsername = username;
        } else {
          toast.error('Invalid phone number format');
          setLoading(false);
          return;
        }

        if (!isValidPhoneNumber(formattedUsername)) {
          toast.error('Invalid phone number');
          setLoading(false);
          return;
        }
      }

      console.log('🔑 Attempting sign in with:', formattedUsername);

      const { isSignedIn, nextStep } = await signIn({
        username: formattedUsername,
        password,
      });

      console.log('✅ Sign in response:', { isSignedIn, nextStep });

      if (isSignedIn) {
        console.log('✅ Sign in successful!');
        toast.success('Login successful! Loading your account...');
        
        // Set waiting state FIRST
        setWaitingForAuth(true);
        setLoading(false);
        
        // Trigger user reload (Hub listener should also fire)
        console.log('🔄 Refreshing user data...');
        await refreshUser();
        
        // The useEffect above will handle redirect when user loads
      } else if (nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_SMS_CODE') {
        setShowOtp(true);
        toast.info('OTP sent to your phone');
        setLoading(false);
      } else if (nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_TOTP_CODE') {
        setShowOtp(true);
        toast.info('Enter your authenticator code');
        setLoading(false);
      } else {
        console.log('⚠️ Unexpected sign-in step:', nextStep);
        toast.error('Unexpected authentication step');
        setLoading(false);
      }
    } catch (error: unknown) {
      console.error('❌ Login error:', error);
      
      const err = error as { name?: string; message?: string };
      
      if (err.name === 'UserAlreadyAuthenticatedException') {
        console.log('⚠️ User already authenticated');
        toast.error('Active session detected');
        setShowClearSession(true);
      } else if (err.name === 'UserNotFoundException') {
        toast.error('Account not found. Please sign up first.');
      } else if (err.name === 'NotAuthorizedException') {
        toast.error('Incorrect username or password');
      } else if (err.name === 'UserNotConfirmedException') {
        toast.error('Please verify your email/phone first');
      } else {
        toast.error(err.message || 'Login failed');
      }
      
      setLoading(false);
    }
  };

  const handleOtpVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!otpCode || otpCode.length !== 6) {
        toast.error('Please enter a valid 6-digit code');
        setLoading(false);
        return;
      }

      console.log('🔐 Verifying OTP...');

      const { isSignedIn } = await confirmSignIn({
        challengeResponse: otpCode,
      });

      console.log('✅ OTP verification result:', { isSignedIn });

      if (isSignedIn) {
        toast.success('Verification successful! Loading your account...');
        
        setWaitingForAuth(true);
        setLoading(false);
        
        console.log('🔄 Refreshing user data...');
        await refreshUser();
        
        // useEffect handles redirect
      }
    } catch (error: unknown) {
      console.error('❌ OTP verification error:', error);
      
      const err = error as { name?: string; message?: string };
      
      if (err.name === 'CodeMismatchException') {
        toast.error('Invalid code. Please try again.');
      } else if (err.name === 'ExpiredCodeException') {
        toast.error('Code expired. Please request a new one.');
        setShowOtp(false);
      } else {
        toast.error(err.message || 'Verification failed');
      }
      
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="p-8 space-y-6 bg-card rounded-lg border border-border">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-8 h-8 text-gold" />
            <span className="text-2xl font-bold">IGPT</span>
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-bold">Welcome Back</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Sign in to continue to your account
            </p>
          </div>

          {showClearSession && (
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-yellow-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-yellow-500 text-xs font-bold">!</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-500 mb-1">
                    Active Session Detected
                  </p>
                  <p className="text-xs text-yellow-500/80">
                    You have an active session. Clear it to sign in again.
                  </p>
                </div>
              </div>
              <Button
                onClick={handleClearSession}
                variant="outline"
                className="w-full border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10"
                disabled={loading}
              >
                {loading ? 'Clearing...' : 'Clear Session & Try Again'}
              </Button>
            </div>
          )}

          {!showOtp ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-lg">
                <Button
                  type="button"
                  variant={loginMethod === 'email' ? 'default' : 'ghost'}
                  onClick={() => setLoginMethod('email')}
                  className="gap-2"
                  size="sm"
                >
                  <Mail className="w-4 h-4" />
                  Email
                </Button>
                <Button
                  type="button"
                  variant={loginMethod === 'phone' ? 'default' : 'ghost'}
                  onClick={() => setLoginMethod('phone')}
                  className="gap-2"
                  size="sm"
                >
                  <Phone className="w-4 h-4" />
                  Phone
                </Button>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {loginMethod === 'email' ? 'Email Address' : 'Phone Number'}
                </label>
                <Input
                  type={loginMethod === 'email' ? 'email' : 'tel'}
                  placeholder={loginMethod === 'email' ? 'user@company.com' : '+91 98765 43210'}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete={loginMethod === 'email' ? 'email' : 'tel'}
                  disabled={showClearSession}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  disabled={showClearSession}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gold hover:bg-gold/90 text-black font-medium"
                disabled={loading || showClearSession}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="text-gold hover:underline font-medium">
                  Sign Up
                </Link>
              </p>
            </form>
          ) : (
            <form onSubmit={handleOtpVerification} className="space-y-4">
              <div className="text-center mb-4">
                <p className="text-sm text-muted-foreground">
                  Enter the verification code sent to your {loginMethod}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Verification Code</label>
                <Input
                  type="text"
                  placeholder="000000"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  required
                  autoComplete="one-time-code"
                  className="text-center text-2xl tracking-widest"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gold hover:bg-gold/90 text-black font-medium"
                disabled={loading || otpCode.length !== 6}
              >
                {loading ? 'Verifying...' : 'Verify & Sign In'}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setShowOtp(false)}
              >
                Back to Login
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}