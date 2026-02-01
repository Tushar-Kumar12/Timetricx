'use client';
import { useState, useEffect } from 'react';
import { useTheme } from '../../../../contexts/ThemeContext';
import { useToast } from '../../../../contexts/ToastContext';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
  import Loading from '../../../../components/ui/Loading';

export default function Login() {
  const { theme } = useTheme();
  const { success, error, info } = useToast();
  const router = useRouter();
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotLoading, setIsForgotLoading] = useState(false);
  const [isOtpLoading, setIsOtpLoading] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);

  // Check if token exists in cookies and redirect to /users
  useEffect(() => {
    const token = Cookies.get('token');
    // if (token) {
    //   router.push('/users');
    // }
    
    // Handle Google OAuth success
    const urlParams = new URLSearchParams(window.location.search);
    const auth = urlParams.get('auth');
    const email = urlParams.get('email');
    const name = urlParams.get('name');
    const picture = urlParams.get('picture');
    
    if ((auth === 'google_success' || auth === 'github_success') && email) {
      // Store user data and token in cookies
      Cookies.set('user', JSON.stringify({
        email,
        name: name || email.split('@')[0],
        profilePicture: picture,
        provider: auth === 'google_success' ? 'google' : 'github'
      }), { expires: 365 });
      
      // Generate a simple token (in production, you'd want a proper JWT)
      const token = btoa(`${email}:${Date.now()}`);
      Cookies.set('token', token, { expires: 7 });
      
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Redirect to users dashboard
      window.location.href = "/users";
    }
    
    // Handle auth errors
    const authError = urlParams.get('auth_error');
    if (authError) {
      error(`Authentication failed: ${authError}`);
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [router]);
  // Handle email/password login
  const handleEmailLogin = async () => {
    const email = (document.querySelector('input[type="email"]') as HTMLInputElement)?.value;
    const password = (document.querySelector('input[type="password"]') as HTMLInputElement)?.value;
    
    if (!email || !password) {
      error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier: email, password }),
      });

      const data = await response.json();
      
if (data.success) {
  // Store user data and token in cookies
  Cookies.set('user', JSON.stringify(data.data.user), { expires: 365 })
  Cookies.set('token', data.data.token, { expires: 7 })

  // Always redirect to users dashboard
  window.location.href = "/users"
} else {
        error(data.error || 'Login failed');
      }
    } catch (error) {
      error('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  const handleSignupRedirect = () => {
    window.location.href = '/landing/auth/signup';
  };

  // Forgot Password Handlers
  const handleForgotPassword = async () => {
    if (!forgotEmail) {
      error('Please enter your email');
      return;
    }

    setIsForgotLoading(true);
    
    try {
      const response = await fetch('/api/auth/forgot-password/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: forgotEmail }),
      });

      const data = await response.json();
      
      if (data.success) {
        setShowForgotPasswordModal(false);
        setShowOtpModal(true);
        setResetToken(data.data.token);
        success('OTP sent to your email successfully!');
      } else {
        error(data.message || 'Failed to send OTP');
      }
    } catch (error) {
      error('Failed to send OTP. Please try again.');
    } finally {
      setIsForgotLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otpCode];
    newOtp[index] = value;
    setOtpCode(newOtp);
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`) as HTMLInputElement;
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpVerification = async () => {
    const otp = otpCode.join('');
    
    if (otp.length !== 6) {
      error('Please enter complete OTP');
      return;
    }

    setIsOtpLoading(true);
    
    try {
      const response = await fetch('/api/auth/forgot-password/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: forgotEmail, otp, token: resetToken }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setShowOtpModal(false);
        setShowResetPasswordModal(true);
        success('OTP verified successfully!');
      } else {
        error(result.message || 'OTP verification failed');
      }
    } catch (error) {
      error('OTP verification failed. Please try again.');
    } finally {
      setIsOtpLoading(false);
    }
  };

  const handleOtpResend = async () => {
    if (!forgotEmail || !resetToken) {
      error('Email information is missing. Please try again.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/forgot-password/resend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: forgotEmail, token: resetToken }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setResetToken(result.data.token);
        success('OTP has been resent to your email');
      } else {
        error(result.message || 'Failed to resend OTP');
      }
    } catch (error) {
      error('Failed to resend OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    const newPassword = (document.getElementById('newPassword') as HTMLInputElement)?.value;
    const confirmPassword = (document.getElementById('confirmPassword') as HTMLInputElement)?.value;

    if (!newPassword || !confirmPassword) {
      error('Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      error('Passwords do not match');
      return;
    }

    setIsResetLoading(true);
    
    try {
      const response = await fetch('/api/auth/forgot-password/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: forgotEmail, newPassword, token: resetToken }),
      });

      const data = await response.json();
      
      if (data.success) {
        success('Password reset successfully! Please login.');
        setShowResetPasswordModal(false);
        window.location.href = '/landing/auth/login';
      } else {
        error(data.message || 'Failed to reset password');
      }
    } catch (error) {
      error('Failed to reset password. Please try again.');
    } finally {
      setIsResetLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center 
      ${theme === 'dark' ? 'bg-[#000000]' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'} transition-colors p-6`}>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center">
          <Loading size="large" color="#3b82f6" text="Processing..." />
        </div>
      )}

      {/* SVG CLIP PATH */}
<svg width="0" height="0">
  <defs>
    <clipPath id="rightCurve" clipPathUnits="objectBoundingBox">
      <path
        d="
        M 0 0
        L 0.95  0
        C 0.64 0.04 1 0.12 1 0.22
        c 0.02 0.08 0.04 0.16 0.04 0.26
        C 1 1 1 1 1 1
        L 0 1
        Z"
      />
    </clipPath>
  </defs>
</svg>

      {/* MAIN CARD */}
      <div className={`w-full max-w-5xl rounded-[30px] 
        ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white/10 backdrop-blur-xl border-white/20'} 
        border shadow-2xl overflow-hidden`}>

        <div className="flex flex-col md:flex-row">

          {/* LEFT LOGIN */}
          <div className={`w-full md:w-1/2 p-10 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
          
            <div className="mb-10">
              <h1 className="text-3xl font-bold">Welcome back</h1>
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Track your attendance seamlessly and efficiently.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Email</label>
                <input
                  type="email"
                  placeholder="example@gmail.com"
                  className={`w-full mt-1 px-5 py-3 
                  rounded-full ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white/30 border-white/30 text-black'} 
                  focus:outline-none`}
                />
              </div>

              <div>
                <label className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Password</label>
                <input
                  type="password"
                  placeholder="********"
                  className={`w-full mt-1 px-5 py-3 
                  rounded-full ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white/30 border-white/30 text-black'} 
                  focus:outline-none`}
                />
              </div>

              <div className={`flex justify-end text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                <button 
                  onClick={() => setShowForgotPasswordModal(true)}
                  className="hover:underline"
                >
                  Forgot Password
                </button>
              </div>

              <button 
                className="w-full py-3 rounded-full 
                  bg-gradient-to-r from-[#0b5fffbf] to-[#3b82f680] 
                  text-black font-semibold flex items-center justify-center gap-2"
                onClick={handleEmailLogin}
                disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loading size="small" color="#000" />
                    Tracking...
                  </>
                ) : (
                  'Track Attendance'
                )}
              </button>


            </div>
            
          </div>
          

{/* RIGHT CARD WRAPPER */}
<div className="relative w-full md:w-1/2 m-4">

  {/* LOGO (OUTSIDE CLIP) */}
  <div className="absolute top-3 right-6 z-[45]">
    <img 
      src="/Timetricx logo.svg" 
      alt="Timetricx" 
      className="h-10 w-auto"
    />
  </div>

  {/* CLIPPED CARD */}
  <div
    className="relative w-full
    p-8 text-white 
    bg-gradient-to-br from-black 
    via-[#121629] to-[#050816] 
    rounded-2xl shadow-2xl"

    style={{
      clipPath: "url(#rightCurve)",
    }}
  >

    <h2 className="text-3xl font-bold mb-4">
      Welcome Back to <br /> Project Excellence
    </h2>

    <p className="text-sm text-white/70 leading-relaxed">
      "Timetricx has transformed how our team manages projects and tracks attendance. The real-time insights have boosted our productivity by 40%."
    </p>

    

    <div className="flex gap-3 mt-6">
      <button className="h-10 w-10 font-bold rounded-full bg-red-400 text-black">
        ←
      </button>
      <button className="h-10 w-10 font-bold rounded-full bg-green-400 text-black">
        →
      </button>
    </div>

    <button 
      onClick={handleSignupRedirect}
      className="w-50 mt-6 py-3 rounded-full 
      bg-gradient-to-r from-[#0b5fffbf] to-[#3b82f680] 
      text-black font-semibold">
      Create an Account
    </button>

    {/* FLOATING CARD */}
    <div className="relative w-full md:w-1/2 
    p-4 text-white -mb-4
    bg-gradient-to-br from-black 
    via-[#3d3838] to-[#0c1c6aa3] 
    rounded-2xl shadow-2xl m-4"

    style={{
      clipPath: "url(#rightCurve)",
    }}>
      <h3 className="font-semibold">
        Continue Your Project Success Journey
      </h3>
      <p className="text-xs text-gray-300 mt-1">
        Log in to access your projects, track team attendance, 
        and manage your workflow with powerful analytics.
      </p>
    </div>

  </div>
</div>

        </div>
      </div>

      {/* FORGOT PASSWORD MODAL */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 z-50 
          bg-black/60 backdrop-blur-md 
          flex items-center justify-center p-4">

          {/* OUTER CURVED CARD */}
          <div
            className="relative w-full md:w-130 
            p-6 text-white 
            bg-gradient-to-br from-black 
            via-[#121629] to-[#050816] 
            rounded-2xl shadow-2xl"

            style={{
              clipPath: "url(#rightCurve)",
            }}
          >

            {/* INNER GLASS CARD */}
            <div className="
              bg-transparent backdrop-blur-xl
              border border-white/20
              rounded-2xl shadow-xl w-120
              p-8">

              <h2 className="text-2xl font-bold text-white mb-6 text-center">
                Forgot Password
              </h2>

              <p className="text-sm text-white/70 text-center mb-6">
                Enter your email address and we'll send you an OTP
              </p>

              <div className="mb-6">
                <label className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2 block`}>
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className={`w-full px-5 py-3 rounded-full 
                  ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white/30 border-white/30 text-black'} 
                  focus:outline-none focus:ring-2 focus:ring-[#0b5fffbf]`}
                />
              </div>

              <button
                onClick={handleForgotPassword}
                disabled={isForgotLoading}
                className="w-full py-3 rounded-lg 
                  bg-gradient-to-r from-[#0b5fffbf] to-[#3b82f680] 
                  text-black font-semibold flex items-center justify-center gap-2">
                {isForgotLoading ? (
                  <>
                    <Loading size="small" color="#000" />
                    Sending OTP...
                  </>
                ) : (
                  'Send OTP'
                )}
              </button>

              <button
                onClick={() => setShowForgotPasswordModal(false)}
                className="w-full py-3 rounded-lg 
                  bg-gray-600 text-white font-semibold
                  hover:bg-gray-700 
                  transition-all mt-3"
              >
                Cancel
              </button>

            </div>
          </div>
        </div>
      )}

      {/* OTP VERIFICATION MODAL */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 
          bg-black/60 backdrop-blur-md 
          flex items-center justify-center p-4">

          {/* OUTER CURVED CARD */}
          <div
            className="relative w-full md:w-130
            p-6 text-white 
            bg-gradient-to-br from-black 
            via-[#121629] to-[#050816] 
            rounded-2xl shadow-2xl"

            style={{
              clipPath: "url(#rightCurve)",
            }}
          >

            {/* INNER GLASS CARD */}
            <div className="
              bg-transparent backdrop-blur-xl
              border border-white/20
              rounded-2xl shadow-xl w-120
              p-8">

              <h2 className="text-2xl font-bold text-white mb-6 text-center">
                Verify Your Email
              </h2>

              <p className="text-sm text-white/70 text-center mb-6">
                We've sent a 6-digit OTP to {forgotEmail}
              </p>

              <div className="flex justify-center space-x-2 mb-6">
                {otpCode.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    className="w-12 h-12 text-center text-lg font-semibold 
                      bg-black/30 border border-white/20 rounded-lg 
                      text-white focus:outline-none focus:ring-2 focus:ring-[#0b5fffbf]"
                  />
                ))}
              </div>

              <button
                onClick={handleOtpVerification}
                disabled={isOtpLoading}
                className="w-full py-3 rounded-lg 
                  bg-gradient-to-r from-[#0b5fffbf] to-[#3b82f680] 
                  text-black font-semibold flex items-center justify-center gap-2">
                {isOtpLoading ? (
                  <>
                    <Loading size="small" color="#000" />
                    Verifying...
                  </>
                ) : (
                  'Verify OTP'
                )}
              </button>

              <p className="text-xs text-white/60 text-center mt-4">
                Didn't receive OTP? <button onClick={handleOtpResend} className="text-purple-400 hover:text-purple-300 underline">Resend</button>
              </p>

            </div>
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {showResetPasswordModal && (
        <div className="fixed inset-0 z-50 
          bg-black/60 backdrop-blur-md 
          flex items-center justify-center p-4">

          {/* OUTER CURVED CARD */}
          <div
            className="relative w-full md:w-130
            p-6 text-white 
            bg-gradient-to-br from-black 
            via-[#121629] to-[#050816] 
            rounded-2xl shadow-2xl"

            style={{
              clipPath: "url(#rightCurve)",
            }}
          >

            {/* INNER GLASS CARD */}
            <div className="
              bg-transparent backdrop-blur-xl
              border border-white/20
              rounded-2xl shadow-xl w-120
              p-8">

              <h2 className="text-2xl font-bold text-white mb-6 text-center">
                Reset Password
              </h2>

              <p className="text-sm text-white/70 text-center mb-6">
                Enter your new password
              </p>

              <div className="mb-4">
                <label className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2 block`}>
                  New Password
                </label>
                <input
                  id="newPassword"
                  type="password"
                  placeholder="Enter new password"
                  className={`w-full px-5 py-3 rounded-full 
                  ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white/30 border-white/30 text-black'} 
                  focus:outline-none focus:ring-2 focus:ring-[#0b5fffbf]`}
                />
              </div>

              <div className="mb-6">
                <label className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2 block`}>
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  className={`w-full px-5 py-3 rounded-full 
                  ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white/30 border-white/30 text-black'} 
                  focus:outline-none focus:ring-2 focus:ring-[#0b5fffbf]`}
                />
              </div>

              <button
                onClick={handleResetPassword}
                disabled={isResetLoading}
                className="w-full py-3 rounded-lg 
                  bg-gradient-to-r from-[#0b5fffbf] to-[#3b82f680] 
                  text-black font-semibold flex items-center justify-center gap-2">
                {isResetLoading ? (
                  <>
                    <Loading size="small" color="#000" />
                    Resetting...
                  </>
                ) : (
                  'Reset Password'
                )}
              </button>

              <button
                onClick={() => setShowResetPasswordModal(false)}
                className="w-full py-3 rounded-lg 
                  bg-gray-600 text-white font-semibold
                  hover:bg-gray-700 
                  transition-all mt-3"
              >
                Cancel
              </button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
