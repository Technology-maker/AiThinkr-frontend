import React, { useState, useEffect } from 'react'
import { FaEye, FaEyeSlash } from 'react-icons/fa6';
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Hyperspeed from './snipet/Hyperspeed';

const Signup = () => {
  const [loading, setLoading] = useState(false);
  const [showHyperspeed, setShowHyperspeed] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  const navigate = useNavigate();

  const [formdata, setFormdata] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState();
  const [showPassword, setShowPassword] = useState(false);

  // Listen for changes in motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleChange = (e) => {
      setReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  const handlechange = (e) => {
    const value = e.target.value
    const name = e.target.name
    setFormdata({
      ...formdata,
      [name]: value,
    })
  }

  const handleSignup = async () => {
    setLoading(true)
    setError("");
    try {
      const { data } = await axios.post(
        "https://ai-thinkr.vercel.app/api/v1/user/signup",
        {
          firstname: formdata.firstname,
          lastname: formdata.lastname,
          email: formdata.email,
          password: formdata.password,
        },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      alert(data.message || "Signup successfully")
      navigate("/login");
    }
    catch (error) {
      const mess = error?.response?.data?.error || "Signup Failed";
      setError(mess);
      console.log(error);
    }
    finally {
      setLoading(false);
    }
  }

  // Determine if animation should be shown
  const shouldShowAnimation = showHyperspeed && !reducedMotion;

  return (
    <div className="relative min-h-screen">
      {/* Background Layer */}
      {shouldShowAnimation && (
        <div className="fixed inset-0 z-0">
          <Hyperspeed
            effectOptions={{
              onSpeedUp: () => { },
              onSlowDown: () => { },
              distortion: 'turbulentDistortion',
              length: 400,
              roadWidth: 10,
              islandWidth: 2,
              lanesPerRoad: 4,
              fov: 90,
              fovSpeedUp: 150,
              speedUp: 2,
              carLightsFade: 0.4,
              totalSideLightSticks: 20,
              lightPairsPerRoadWay: 30, // Reduced for better performance
              shoulderLinesWidthPercentage: 0.05,
              brokenLinesWidthPercentage: 0.1,
              brokenLinesLengthPercentage: 0.5,
              lightStickWidth: [0.12, 0.5],
              lightStickHeight: [1.3, 1.7],
              movingAwaySpeed: [40, 60], // Slightly slower for less distraction
              movingCloserSpeed: [-80, -120], // Slightly slower
              carLightsLength: [400 * 0.03, 400 * 0.2],
              carLightsRadius: [0.05, 0.14],
              carWidthPercentage: [0.3, 0.5],
              carShiftX: [-0.8, 0.8],
              carFloorSeparation: [0, 5],
              colors: {
                roadColor: 0x080808,
                islandColor: 0x0a0a0a,
                background: 0x000000,
                shoulderLines: 0xFFFFFF,
                brokenLines: 0xFFFFFF,
                leftCars: [0xD856BF, 0x6750A2, 0xC247AC],
                rightCars: [0x03B3C3, 0x0E5EA5, 0x324555],
                sticks: 0x03B3C3,
              }
            }}
          />
          {/* Overlay to reduce distraction */}
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" />
        </div>
      )}

      {/* Fallback Background */}
      {!shouldShowAnimation && (
        <div className="fixed inset-0 z-0 bg-gradient-to-br from-gray-700 via-gray-900 to-gray-800" />
      )}

      {/* Content Layer */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-8">
        {/* Animation Controls */}
        <div className="absolute top-4 right-4 flex gap-2">
          {!reducedMotion && (
            <button
              onClick={() => setShowHyperspeed(!showHyperspeed)}
              className="px-3 py-1 text-xs bg-gray-800/80 text-white rounded-md hover:bg-gray-700/80 transition-colors"
              aria-label={showHyperspeed ? "Disable animation" : "Enable animation"}
            >
              {showHyperspeed ? "🎬 Disable" : "🎬 Enable"}
            </button>
          )}
          {reducedMotion && (
            <div className="px-3 py-1 text-xs bg-gray-800/80 text-gray-400 rounded-md">
              🎬 Reduced motion
            </div>
          )}
        </div>

        <div className="w-full max-w-md bg-[#18181b]/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-gray-800/50">
          <h1 className="text-3xl font-bold text-center mb-6 text-white">Sign Up</h1>

          <form
            name="signup"
            method="POST"
            onSubmit={(e) => {
              e.preventDefault();
              handleSignup();
            }}
            autoComplete="on"
          >
            <div className="mb-4">
              <label htmlFor="firstname" className="sr-only">First Name</label>
              <input
                id="firstname"
                type="text"
                name="firstname"
                placeholder="First Name"
                className="w-full px-4 py-3 rounded-lg bg-gray-900/90 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition backdrop-blur-sm"
                value={formdata.firstname}
                onChange={handlechange}
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="lastname" className="sr-only">Last Name</label>
              <input
                id="lastname"
                type="text"
                name="lastname"
                placeholder="Last Name"
                className="w-full px-4 py-3 rounded-lg bg-gray-900/90 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition backdrop-blur-sm"
                value={formdata.lastname}
                onChange={handlechange}
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="email" className="sr-only">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="Email"
                className="w-full px-4 py-3 rounded-lg bg-gray-900/90 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition backdrop-blur-sm"
                value={formdata.email}
                onChange={handlechange}
                required
                autoComplete="username"
              />
            </div>

            <div className="mb-4 relative">
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                className="w-full px-4 py-3 rounded-lg bg-gray-900/90 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition backdrop-blur-sm"
                value={formdata.password}
                onChange={handlechange}
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-300 cursor-pointer p-1"
                onClick={() => setShowPassword(prev => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg">
                <span className="text-red-300 text-sm">{error}</span>
              </div>
            )}

            <p className="text-gray-400 text-xs mb-6 text-center">
              By signing up or logging in, you agree to Deepseek&apos;s{' '}
              <a href="#" className="underline hover:text-blue-400 transition-colors">Terms of Use</a> and{' '}
              <a href="#" className="underline hover:text-blue-400 transition-colors">Privacy Policy</a>.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors mb-4"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing up...
                </span>
              ) : (
                "Sign Up"
              )}
            </button>

            <div className="flex justify-between text-gray-400 text-sm">
              <span>Already registered?</span>
              <Link to="/login" className="text-blue-400 hover:text-blue-300 hover:underline transition-colors">
                Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Signup;
