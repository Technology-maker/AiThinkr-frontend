import React, { useState } from 'react'
import { FaEye, FaEyeSlash } from 'react-icons/fa6';
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthProvider.jsx';
import Hyperspeed from './snipet/Hyperspeed.jsx';

const Login = () => {
  const [loading, setloding] = useState(false);
  const navigate = useNavigate()
  const [, setAuthUser] = useAuth()

  const [formdata, setformdate] = useState({
    email: "",
    password: "",
  });

  const [error, seterror] = useState();
  const [showPassword, setShowPassword] = useState(false);

  const handlechange = (e) => {
    const { name, value } = e.target;
    setformdate({
      ...formdata,
      [name]: value,
    })
  }

  const handleLogin = async () => {
    setloding(true)
    seterror("");
    try {
      const { data } = await axios.post(
        "https://ai-thinkr.vercel.app/api/v1/user/login",
        {
          email: formdata.email,
          password: formdata.password
        },
        { withCredentials: true }
      );
      alert(data.message || "Login successfully")
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);
      setAuthUser(data.token)
      navigate("/");
    }
    catch (error) {
      const mess = error?.response?.data?.error || "Login Failed";
      seterror(mess);
      console.log(error);
    }
    finally {
      setloding(false);
    }
  }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* 🔥 Hyperspeed Background */}
      <div className="absolute inset-0 z-0">
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
            lightPairsPerRoadWay: 40,
            shoulderLinesWidthPercentage: 0.05,
            brokenLinesWidthPercentage: 0.1,
            brokenLinesLengthPercentage: 0.5,
            lightStickWidth: [0.12, 0.5],
            lightStickHeight: [1.3, 1.7],
            movingAwaySpeed: [60, 80],
            movingCloserSpeed: [-120, -160],
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
      </div>

      {/* 🔥 Login Box */}
      <div className="relative z-10 flex items-center justify-center h-full px-4">
        <div className="w-full max-w-md bg-black/70 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-gray-700">
          {/* Heading */}
          <h1 className="text-3xl font-bold text-center mb-6 text-white">Login</h1>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
          >
            {/* Email */}
            <div className="mb-4">
              <input
                type="email"
                name="email"
                placeholder="Email"
                className="w-full px-4 py-3 rounded-lg bg-gray-900/80 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                value={formdata.email}
                onChange={handlechange}
                required
                autoComplete="username"
              />
            </div>

            {/* Password */}
            <div className="mb-4 relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                className="w-full px-4 py-3 rounded-lg bg-gray-900/80 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                value={formdata.password}
                onChange={handlechange}
                required
                autoComplete="current-password"
              />
              <span
                className='absolute right-3 top-3 text-gray-400 cursor-pointer'
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </span>
            </div>

            {/* Error */}
            {error && <span className="block text-red-500 text-sm mb-4">{error}</span>}

            {/* Terms */}
            <p className="text-gray-400 text-xs mb-6 text-center">
              By signing up or logging in, you agree to Deepseek's{' '}
              <a href="#" className="underline hover:text-blue-400">Terms of Use</a> and{' '}
              <a href="#" className="underline hover:text-blue-400">Privacy Policy</a>.
            </p>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition mb-4"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* Signup link */}
          <div className="flex justify-between text-gray-400 text-sm">
            <span>Don't have an account?</span>
            <Link to="/signup" className="text-blue-400 hover:underline">Signup</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login;
