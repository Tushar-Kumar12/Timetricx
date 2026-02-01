'use client';
import { useState, useEffect, Suspense } from 'react';
import { useTheme } from '../../../../contexts/ThemeContext';
import { useToast } from '../../../../contexts/ToastContext';
import Cookies from 'js-cookie';
import { useRouter, useSearchParams } from 'next/navigation';
import Loading from '../../../../components/ui/Loading';

function SignupContent() {
  const { theme } = useTheme();
  const { success, error, info } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [userToken, setUserToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOtpLoading, setIsOtpLoading] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [userData, setUserData] = useState({ 
    fullName: '', 
    profilePicture: '' as File | string, 
    githubId: '',
    shift: 'day' // Add shift preference
  });
  const [otpCode, setOtpCode] = useState(['', '', '', '', '','']);
  const [signupEmail, setSignupEmail] = useState('');

  // Check for OAuth success
  useEffect(() => {
    const success = searchParams.get('success');
    const token = searchParams.get('token');
    const user = searchParams.get('user');
    
    if (success === 'true' && token && user) {
      try {
        // Store user data and token in cookies
        Cookies.set('user', decodeURIComponent(user), { expires: 365 });
        Cookies.set('token', token, { expires: 365 });
        // Redirect to users dashboard after OAuth success
        window.location.href = '/users';
      } catch (error) {
        console.error('Error storing OAuth data:', error);
      }
    }
  }, [searchParams]);

  // Handle email/password signup
  const handleEmailSignup = async () => {
    const email = (document.querySelector('input[type="email"]') as HTMLInputElement)?.value;
    const password = (document.querySelectorAll('input[type="password"]')[0] as HTMLInputElement)?.value;
    const confirmPassword = (document.querySelectorAll('input[type="password"]')[1] as HTMLInputElement)?.value;

  if (!email || !password || !confirmPassword) {
    error('Please fill in all fields');
    return;
  }

  if (password !== confirmPassword) {
    error('Passwords do not match');
    return;
  }

  setIsLoading(true);
  
try {
  const response = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  /* ✅ SUCCESS CASE */
  

  /* 🔥 GITHUB CONNECT REQUIRED */
  if (data.action === 'github') {
    setSignupEmail(email);
    setShowProfileModal(true); // 👈 GitHub modal
    return;
  }

  /* 🔥 GOOGLE CONNECT REQUIRED */
  if (data.action === 'google') {
    setSignupEmail(email);
    setShowGoogleModal(true); // 👈 Google modal
    return;
  }
  if (response.ok && data.success) {
    Cookies.set('user', JSON.stringify(data.data.user), { expires: 365 });
    Cookies.set('token', data.data.token, { expires: 365 });

    success('Signup successful! Please verify your email');
    setSignupEmail(email);
    setUserToken(data.data.token);
    setShowOtpModal(true);
    return;
  }

  /* ❌ USER ALREADY EXISTS / OTHER ERRORS */
  error(data.message || 'User already exists');

} catch (err) {
  error('Signup failed. Please try again.');
} finally {
  setIsLoading(false);
}

};

const handleGoogleConnect = () => {
  const userCookie = Cookies.get('user')

  if (!userCookie) {
    error('User not logged in')
    return
  }

  let user
  try {
    user = JSON.parse(userCookie)
  } catch (err) {
    error('Invalid user session')
    return
  }

  if (!user?.email) {
    error('User email not found')
    return
  }

  // 🔥 CONNECT MODE + EXISTING USER EMAIL
  const state = encodeURIComponent(
    JSON.stringify({
      mode: 'connect',
      email: user.email,
      redirect: '/users'   // ✅ success ke baad yahin jaana hai
    })
  )

  // 🔁 Google OAuth start
  window.location.href = `/api/auth/google?state=${state}`
}
  const handleLoginRedirect = () => {
    window.location.href = '/landing/auth/login';
  };

const handleModalSubmit = async () => {
  setIsProfileLoading(true);
  
  try {
    const formData = new FormData()
    
    formData.append('fullName', userData.fullName)
    formData.append('githubId', userData.githubId)
    formData.append('shift', userData.shift)

    if (userData.profilePicture) {
      formData.append('profilePicture', userData.profilePicture)
    }
console.log("FILE SENT:", userData.profilePicture)

    const response = await fetch('/api/auth/update-profile', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${userToken}` // ONLY this
      },
      body: formData // ✅
    })

    const result = await response.json()

    if (response.ok && result.success) {
      Cookies.set('user', JSON.stringify(result.data.user), { expires: 365 })
      setShowProfileModal(false)
      setShowGoogleModal(true)
      success('Profile updated successfully!')
    } else {
      error(result.message || 'Profile update failed')
    }

  } catch (error) {
    error('Profile update failed. Please try again.')
  } finally {
    setIsProfileLoading(false);
  }
}


// Handle OTP verification
const handleOtpVerification = async () => {
  const otp = otpCode.join('');
  
  if (otp.length !== 6) {
    error('Please enter complete OTP');
    return;
  }

  setIsOtpLoading(true);
  
  try {
    const response = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({ email: signupEmail, otp })
    });

    const result = await response.json();

    if (response.ok && result.success) {
      success('OTP verified successfully!')
      setShowOtpModal(false);
      setShowProfileModal(true);
    } else {
      error(result.message || 'OTP verification failed');
    }

  } catch (error) {
    error('OTP verification failed. Please try again.');
  } finally {
    setIsOtpLoading(false);
  }
};

// Handle OTP input change
const handleOtpChange = (index: number, value: string) => {
  if (value.length > 1) return;
  
  const newOtp = [...otpCode];
  newOtp[index] = value;
  setOtpCode(newOtp);
  
  // Auto focus next input
  if (value && index < 6) {
    const nextInput = document.getElementById(`otp-${index + 1}`) as HTMLInputElement;
    if (nextInput) nextInput.focus();
  }
};

  const handleProfilePictureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Store the actual File object for upload
      setUserData({ ...userData, profilePicture: file });
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center 
      ${theme === 'dark' ? 'bg-[#000000]' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'} transition-colors p-6`}>

      {/* SVG CLIP PATH */}
      <svg width="0" height="0">
        <defs>
          <clipPath id="rightCurveSignup" clipPathUnits="objectBoundingBox">
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

          {/* LEFT SIGNUP */}
          <div className={`w-full md:w-1/2 p-10 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
            <div className="mb-10">
              <h1 className="text-3xl font-bold">Create Account</h1>
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Join us and start tracking attendance smartly.
              </p>
            </div>

            <div className="space-y-5">

              <div>
                <label className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Email</label>
                <input
                  type="email"
                  placeholder="example@gmail.com"
                  className="w-full mt-1 px-5 py-3 
                  rounded-full bg-black/30 
                  border border-white/20 focus:outline-none"
                />
              </div>

              <div>
                <label className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Password</label>
                <input
                  type="password"
                  placeholder="********"
                  className="w-full mt-1 px-5 py-3 
                  rounded-full bg-black/30 
                  border border-white/20 focus:outline-none"
                />
              </div>

              <div>
                <label className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Confirm Password</label>
                <input
                  type="password"
                  placeholder="********"
                  className="w-full mt-1 px-5 py-3 
                  rounded-full bg-black/30 
                  border border-white/20 focus:outline-none"
                />
              </div>

              <button 
                className="w-full py-3 rounded-full 
                  bg-gradient-to-r from-[#0b5fffbf] to-[#3b82f680] 
                  text-black font-semibold flex items-center justify-center gap-2"
                onClick={handleEmailSignup}
                disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loading size="small" color="#000" />
                    Signing up...
                  </>
                ) : (
                  'Sign Up'
                )}
              </button>

              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-center`}>
                Already have an account?{" "}
                <button onClick={handleLoginRedirect} className="underline">
                  Sign in
                </button>
              </p>

            </div>
          </div>

{/* RIGHT SIGNUP CARD WRAPPER */}
<div className="relative w-full md:w-1/2 m-4">

  {/* FLOATING LOGO */}
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
      clipPath: "url(#rightCurveSignup)",
    }}
  >

    <h2 className="text-3xl font-bold mb-4">
      Manage Projects Like a Pro
    </h2>

    <p className="text-sm text-white/70 leading-relaxed">
      "Timetricx empowers teams with comprehensive project management, real-time attendance tracking, and powerful analytics to drive productivity and success."
    </p>
    <p className="text-sm text-white/70 leading-relaxed">
      "Experience seamless collaboration, automated workflows, and intelligent insights that transform how your team delivers projects on time."
    </p>

    <div className="mt-6">
      <p className="font-semibold">Why Teams Choose Timetricx</p>
      <p className="text-xs text-white/60">
        📊 Real-time project dashboards
      </p>
      <p className="text-xs text-white/60">
        ⏰ Smart attendance tracking
      </p>
      <p className="text-xs text-white/60">
        👥 Team collaboration tools
      </p>
      <p className="text-xs text-white/60">
        📈 Performance analytics
      </p>
    </div>

    <div className="mt-4">
      <p className="text-sm text-white/80">
        Trusted by 10,000+ project managers worldwide
      </p>
    </div>

    <div className="flex gap-3 mt-6">
      <button className="h-10 w-10 font-bold rounded-full bg-red-400 text-black">
        ←
      </button>
      <button className="h-10 w-10 font-bold rounded-full bg-green-400 text-black">
        →
      </button>
    </div>

    {/* FLOATING INFO CARD */}
    <div className="relative w-3/4 
      p-4 text-white mt-6
      bg-gradient-to-br from-black 
      via-[#3d3838] to-[#0c1c6aa3] 
      rounded-2xl shadow-2xl"

      style={{
        clipPath: "url(#rightCurveSignup)",
      }}>

      <h3 className="font-semibold">
        Start Your Project Journey Today
      </h3>
      <p className="text-xs text-gray-300 mt-1">
        Join thousands of successful teams using Timetricx for 
        project management, attendance tracking, and team collaboration.
      </p>

    </div>

  </div>
</div>


        </div>
      </div>


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
        clipPath: "url(#rightCurveSignup)",
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
          We've sent a 6-digit OTP to {signupEmail}
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
            <><Loading size="small" color="#000" />Verifying...</>
          ) : (
            'Verify OTP'
          )}
        </button>

        <p className="text-xs text-white/60 text-center mt-4">
          Didn't receive OTP? <button className="text-purple-400 hover:text-purple-300 underline">Resend</button>
        </p>

      </div>
    </div>
  </div>
)}

      {/* PROFILE COMPLETION MODAL */}
{showProfileModal && (
  <div className="fixed inset-0 z-50 
    bg-black/60 backdrop-blur-md 
    flex items-center justify-center p-4">

    {/* OUTER CURVED CARD (SAME AS RIGHT PANEL) */}
    <div
      className="relative w-full md:w-130 
      p-6 text-white 
      bg-gradient-to-br from-black 
      via-[#121629] to-[#050816] 
      rounded-2xl shadow-2xl"

      style={{
        clipPath: "url(#rightCurveSignup)",
      }}
    >

      {/* INNER GLASS CARD */}
      <div className="
        bg-transparent backdrop-blur-xl
        border border-white/20
        rounded-2xl shadow-xl  w-120
        p-8">

        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          Complete Your Profile
        </h2>

        <div className="space-y-4">

          <div>
            <label className="block text-sm text-white/80 mb-2">
              Full Name
            </label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={userData.fullName}
              onChange={(e) =>
                setUserData({ ...userData, fullName: e.target.value })
              }
              className="
                w-full px-4 py-3 rounded-lg 
                bg-black/30 border border-white/20 
                text-white placeholder-white/40
                focus:outline-none focus:ring-2 focus:ring-[#0b5fffbf]"
            />
          </div>

          <div>
            <label className="block text-sm text-white/80 mb-2">
              Profile Picture
            </label>
            <div className="flex gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePictureUpload}
                className="
                  flex-1 px-4 py-3 rounded-lg 
                  bg-black/30 border border-white/20 
                  text-white file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-600 file:text-white
                  hover:file:bg-blue-700"
              />
              
            </div>
          </div>

          <div>
            <label className="block text-sm text-white/80 mb-2">
              GitHub ID
            </label>
            <input
              type="text"
              placeholder="Enter your GitHub username"
              value={userData.githubId}
              onChange={(e) =>
                setUserData({ ...userData, githubId: e.target.value })
              }
              className="
                w-full px-4 py-3 rounded-lg 
                bg-black/30 border border-white/20 
                text-white placeholder-white/40"
            />
          </div>

          <div>
            <label className="block text-sm text-white/80 mb-2">
              Work Shift
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setUserData({ ...userData, shift: 'day' })}
                className={`flex-1 py-3 rounded-lg border-2 transition-all ${
                  userData.shift === 'day'
                    ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                    : 'bg-black/30 border-white/20 text-white/60 hover:border-white/40'
                }`}
              >
                🌞 Day Shift
              </button>
              <button
                type="button"
                onClick={() => setUserData({ ...userData, shift: 'night' })}
                className={`flex-1 py-3 rounded-lg border-2 transition-all ${
                  userData.shift === 'night'
                    ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                    : 'bg-black/30 border-white/20 text-white/60 hover:border-white/40'
                }`}
              >
                🌙 Night Shift
              </button>
            </div>
          </div>

          <button
            onClick={handleModalSubmit}
            disabled={isProfileLoading}
            className="
              w-full py-3 rounded-lg 
              bg-gradient-to-r from-[#0b5fffbf] to-[#3b82f680] 
              text-black font-semibold
              hover:from-[#0b5fffbf] hover:to-[#3b82f680] 
              transition-all flex items-center justify-center gap-2"
          >
            {isProfileLoading ? (
              <>
                <Loading size="small" color="#000" />
                Submitting...
              </>
            ) : (
              'Add & Continue'
            )}
          </button>

        </div>
      </div>
    </div>
  </div>
)}

      {/* GOOGLE CONNECT MODAL */}
{showGoogleModal && (
  <div className="fixed inset-0 z-50 
    bg-black/60 backdrop-blur-md 
    flex items-center justify-center p-4">

    <div className="relative w-full md:w-1/2 
      p-6 text-white 
      bg-gradient-to-br from-black 
      via-[#121629] to-[#050816] 
      rounded-2xl shadow-2xl">

      <div className="
        bg-transparent backdrop-blur-xl
        border border-white/20
        rounded-2xl shadow-xl  
        p-8">

        <h2 className="text-2xl font-bold text-white mb-4 text-center">
          Connect Your Account
        </h2>

        <p className="text-white/70 text-center mb-8">
          Connect your Google account to sync your data and enable additional features
        </p>

        <button 
          onClick={handleGoogleConnect}
          className="w-full flex items-center justify-center gap-3 py-3 rounded-lg 
            bg-white text-black font-semibold
            hover:bg-gray-100 transition-all
            shadow-lg hover:shadow-xl">
          
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>

          Connect with Google
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}

export default function Signup() {
  return (
    <Suspense fallback={<Loading />}>
      <SignupContent />
    </Suspense>
  );
}
