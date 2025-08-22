import React, { useState } from 'react'
import { FaEye, FaEyeSlash } from 'react-icons/fa6';
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Hyperspeed from './snipet/Hyperspeed';

const Signup = () => {
  const [loading, setloding] = useState(false);
  const navigate = useNavigate()

  const [formdata, setformdate] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
  });

  const [error, seterror] = useState();
  const [showPassword, setShowPassword] = useState(false);

  const handlechange = (e) => {
    const value = e.target.value
    const name = e.target.name
    setformdate({
      ...formdata,
      [name]: value,
    })
  }

  const handleSignup = async () => {
    setloding(true)
    seterror("");
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
      seterror(mess);
      console.log(error);
    }
    finally {
      setloding(false);
    }
  }

  return (<>

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

    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-700 via-gray-900 to-gray-800 px-4">
      <div className="w-full max-w-md bg-[#18181b] rounded-2xl shadow-2xl p-8 border border-gray-800">
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
              className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
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
              className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
              value={formdata.lastname}
              onChange={handlechange}
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="sr-only">Email</label>
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
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
              className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
              value={formdata.password}
              onChange={handlechange}
              required
              autoComplete="new-password"
            />
            <span
              className="absolute right-3 top-3 text-gray-400 cursor-pointer"
              onClick={() => setShowPassword(prev => !prev)}
              tabIndex={0}
              role="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setShowPassword(prev => !prev);
                }
              }}
            >
              {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
            </span>
          </div>

          {error && <span className="block text-red-500 text-sm mb-4">{error}</span>}

          <p className="text-gray-400 text-xs mb-6 text-center">
            By signing up or logging in, you agree to Deepseek&apos;s{' '}
            <a href="#" className="underline hover:text-blue-400">Terms of Use</a> and{' '}
            <a href="#" className="underline hover:text-blue-400">Privacy Policy</a>.
          </p>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition mb-4"
          >
            {loading ? "Signing..." : "Signup"}
          </button>

          <div className="flex justify-between text-gray-400 text-sm">
            <span>Already registered?</span>
            <Link to="/login" className="text-blue-400 hover:underline">Login</Link>
          </div>
        </form>
      </div>
    </div>
  </>
  )
}

export default Signup;
