import React, { useState } from 'react'
import { FaEye, FaEyeSlash } from 'react-icons/fa6';
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Squares from './snipet/Squares'

const Signup = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const [formdata, setFormdata] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormdata(prev => ({ ...prev, [name]: value }));
  }

  const handleSignup = async () => {
    setLoading(true);
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
      alert(data.message || "Signup successful");
      navigate("/login");
    } catch (err) {
      setError(err?.response?.data?.error || "Signup Failed");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-900 overflow-hidden">
      {/* Squares Background */}
      <div className="absolute inset-0 z-0">
        <Squares
          speed={0.5}
          squareSize={40}
          direction="diagonal"
          borderColor="#fff"
          hoverFillColor="#222"
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Form Container */}
      <div className="relative z-10 w-full max-w-md bg-transparent backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-gray-800">
        <h1 className="text-3xl font-bold text-center mb-6 text-white">Sign Up</h1>

        <form
          onSubmit={e => {
            e.preventDefault();
            handleSignup();
          }}
          autoComplete="on"
        >
          <div className="mb-4">
            <label htmlFor="firstname" className="sr-only">First Name</label>
            <input
              id="firstname"
              name="firstname"
              type="text"
              placeholder="First Name"
              value={formdata.firstname}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="lastname" className="sr-only">Last Name</label>
            <input
              id="lastname"
              name="lastname"
              type="text"
              placeholder="Last Name"
              value={formdata.lastname}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="sr-only">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Email"
              value={formdata.email}
              onChange={handleChange}
              required
              autoComplete="username"
              className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
            />
          </div>

          <div className="mb-4 relative">
            <label htmlFor="password" className="sr-only">Password</label>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={formdata.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
              className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
            />
            <span
              className="absolute right-3 top-3 text-gray-400 cursor-pointer"
              onClick={() => setShowPassword(prev => !prev)}
              role="button"
              tabIndex={0}
              aria-label={showPassword ? "Hide password" : "Show password"}
              onKeyDown={e => {
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
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition mb-4 disabled:opacity-50"
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
  )
}

export default Signup;
