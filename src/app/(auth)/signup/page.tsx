// file: src\app\(auth)\signup\page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signUp, confirmSignUp, autoSignIn } from 'aws-amplify/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Sparkles, Mail, Phone, ArrowLeft, Check } from 'lucide-react';
import { isValidPhoneNumber} from 'libphonenumber-js';
import Link from 'next/link';

export default function SignUpPage() {
  const router = useRouter();
  const [signupMethod, setSignupMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verificationUsername, setVerificationUsername] = useState('');

  // Password validation
  const passwordValidations = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSymbol: /[^A-Za-z0-9]/.test(password),
    passwordsMatch: password === confirmPassword && confirmPassword.length > 0,
  };

  const isPasswordValid = Object.values(passwordValidations).every(Boolean);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // ALWAYS require email (Cognito requirement)
      if (!email) {
        toast.error('Email is required');
        setLoading(false);
        return;
      }

      if (signupMethod === 'phone' && !phoneNumber) {
        toast.error('Please enter your phone number');
        setLoading(false);
        return;
      }

      if (!isPasswordValid) {
        toast.error('Please meet all password requirements');
        setLoading(false);
        return;
      }

      let formattedPhone = '';
      let username = '';
      let userAttributes: { email: string; phone_number?: string } = { email };

      if (signupMethod === 'phone') {
        // Clean and validate phone number
        const cleaned = phoneNumber.replace(/\D/g, '');
        
        if (cleaned.startsWith('91') && cleaned.length === 12) {
          formattedPhone = `+${cleaned}`;
        } else if (cleaned.startsWith('1') && cleaned.length === 11) {
          formattedPhone = `+${cleaned}`;
        } else if (cleaned.length === 10) {
          formattedPhone = `+1${cleaned}`;
        } else if (phoneNumber.startsWith('+')) {
          formattedPhone = phoneNumber;
        } else {
          toast.error('Invalid phone number. Use format: +91XXXXXXXXXX or +1XXXXXXXXXX');
          setLoading(false);
          return;
        }

        try {
          if (!isValidPhoneNumber(formattedPhone)) {
            toast.error('Invalid phone number format');
            setLoading(false);
            return;
          }
        } catch { 
          toast.error('Invalid phone number');
          setLoading(false);
          return;
        }

        // Use phone as username, but INCLUDE email in attributes
        username = formattedPhone;
        userAttributes = {
          email: email,  // ← REQUIRED by Cognito
          phone_number: formattedPhone,
        };
      } else {
        // Email signup
        username = email;
        userAttributes = {
          email: email,
        };
      }

      console.log('Signing up with:', { username, userAttributes });

      const { isSignUpComplete, userId, nextStep } = await signUp({
        username,
        password,
        options: {
          userAttributes,
          autoSignIn: true,
        },
      });

      console.log('Sign up response:', { isSignUpComplete, userId, nextStep });

      setVerificationUsername(username);

      if (!isSignUpComplete) {
        setShowVerification(true);
        toast.success(
          `Verification code sent to your ${signupMethod}`
        );
      } else {
        toast.success('Account created successfully!');
        router.push('/');
      }
    } catch (error: unknown) {  
      console.error('Sign up error:', error);
      
      const err = error as { name?: string; message?: string };
      
      if (err.name === 'UsernameExistsException') {
        toast.error('An account with this email/phone already exists');
      } else if (err.name === 'InvalidPasswordException') {
        toast.error('Password does not meet requirements');
      } else if (err.name === 'InvalidParameterException') {
        if (err.message?.includes('phone_number')) {
          toast.error('Invalid phone number format. Use +CountryCodeNumber');
        } else if (err.message?.includes('email')) {
          toast.error('Invalid email format');
        } else {
          toast.error(err.message || 'Invalid input format');
        }
      } else {
        toast.error(err.message || 'Sign up failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (verificationCode.length !== 6) {
        toast.error('Please enter a valid 6-digit code');
        setLoading(false);
        return;
      }

      console.log('✅ Confirming sign up for:', verificationUsername);

      const { isSignUpComplete } = await confirmSignUp({
        username: verificationUsername,
        confirmationCode: verificationCode,
      });

      console.log('✅ Confirm response:', { isSignUpComplete });

      if (isSignUpComplete) {
        toast.success('Account verified!');
        
        // Auto sign-in
        try {
          console.log('🔑 Attempting auto sign-in...');
          const signInResult = await autoSignIn();
          console.log('✅ Auto sign-in result:', signInResult);
          
          if (signInResult.isSignedIn) {
            toast.success('Signed in! Redirecting...');
            
            // Give more time for auth state to propagate
            // The Hub listener will pick up the 'signedIn' event
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Redirect to home (let home page handle the chat redirect)
            router.push('/');
          } else {
            console.log('⚠️ Auto sign-in did not complete, redirecting to login');
            toast.info('Please sign in with your credentials');
            router.push('/login');
          }
        } catch (autoSignInError: unknown) {
          console.error('❌ Auto sign-in error:', autoSignInError);
          toast.info('Verification complete. Please sign in.');
          router.push('/login');
        }
      }
    } catch (error: unknown) {  
      console.error('❌ Verification error:', error);
      
      const err = error as { name?: string; message?: string };
      
      if (err.name === 'CodeMismatchException') {
        toast.error('Invalid verification code');
      } else if (err.name === 'ExpiredCodeException') {
        toast.error('Code expired. Please request a new one');
      } else if (err.name === 'NotAuthorizedException') {
        toast.error('Account already verified. Please sign in.');
        router.push('/login');
      } else {
        toast.error(err.message || 'Verification failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Back to Home */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="p-8 space-y-6 bg-card rounded-lg border border-border">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-8 h-8 text-gold" />
            <span className="text-2xl font-bold">IGPT</span>
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-bold">Create Your Account</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Get started with IGPT today
            </p>
          </div>

          {!showVerification ? (
            <form onSubmit={handleSignUp} className="space-y-4">
              {/* Signup Method Toggle */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-lg">
                <Button
                  type="button"
                  variant={signupMethod === 'email' ? 'default' : 'ghost'}
                  onClick={() => setSignupMethod('email')}
                  className="gap-2"
                  size="sm"
                >
                  <Mail className="w-4 h-4" />
                  Email
                </Button>
                <Button
                  type="button"
                  variant={signupMethod === 'phone' ? 'default' : 'ghost'}
                  onClick={() => setSignupMethod('phone')}
                  className="gap-2"
                  size="sm"
                >
                  <Phone className="w-4 h-4" />
                  Phone
                </Button>
              </div>

              {/* ALWAYS show email input (required by Cognito) */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Email Address {signupMethod === 'phone' && <span className="text-xs text-muted-foreground">(required)</span>}
                </label>
                <Input
                  type="email"
                  placeholder="user@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              {/* Phone input - only show if phone method selected */}
              {signupMethod === 'phone' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone Number</label>
                  <Input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                    autoComplete="tel"
                  />
                  <p className="text-xs text-muted-foreground">
                    India: +91XXXXXXXXXX | US: +1XXXXXXXXXX
                  </p>
                </div>
              )}

              {/* Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <Input
                  type="password"
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Confirm Password</label>
                <Input
                  type="password"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>

              {/* Password Requirements */}
              {password && (
                <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs font-medium text-muted-foreground">Password must contain:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <PasswordRequirement met={passwordValidations.minLength}>
                      8+ characters
                    </PasswordRequirement>
                    <PasswordRequirement met={passwordValidations.hasUppercase}>
                      Uppercase letter
                    </PasswordRequirement>
                    <PasswordRequirement met={passwordValidations.hasLowercase}>
                      Lowercase letter
                    </PasswordRequirement>
                    <PasswordRequirement met={passwordValidations.hasNumber}>
                      Number
                    </PasswordRequirement>
                    <PasswordRequirement met={passwordValidations.hasSymbol}>
                      Special character
                    </PasswordRequirement>
                    <PasswordRequirement met={passwordValidations.passwordsMatch}>
                      Passwords match
                    </PasswordRequirement>
                  </div>
                </div>
              )}

              {/* Submit */}
              <Button
                type="submit"
                className="w-full bg-gold hover:bg-gold/90 text-black font-medium"
                disabled={loading || !isPasswordValid}
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </Button>

              {/* Login Link */}
              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link href="/login" className="text-gold hover:underline font-medium">
                  Sign In
                </Link>
              </p>
            </form>
          ) : (
            <form onSubmit={handleVerification} className="space-y-4">
              <div className="text-center mb-4">
                <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-3">
                  <Mail className="w-6 h-6 text-gold" />
                </div>
                <p className="text-sm text-muted-foreground">
                  We&apos;ve sent a verification code to{' '}
                  <span className="font-medium text-foreground">
                    {signupMethod === 'email' ? email : phoneNumber}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Code expires in 3 minutes
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Verification Code</label>
                <Input
                  type="text"
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  required
                  autoComplete="one-time-code"
                  className="text-center text-2xl tracking-widest"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gold hover:bg-gold/90 text-black font-medium"
                disabled={loading || verificationCode.length !== 6}
              >
                {loading ? 'Verifying...' : 'Verify & Sign In'}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setShowVerification(false);
                  setVerificationCode('');
                }}
              >
                Back to Sign Up
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function PasswordRequirement({ met, children }: { met: boolean; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
        met ? 'bg-green-500/20 text-green-500' : 'bg-muted text-muted-foreground'
      }`}>
        {met && <Check className="w-3 h-3" />}
      </div>
      <span className={met ? 'text-green-500' : 'text-muted-foreground'}>
        {children}
      </span>
    </div>
  );
}
