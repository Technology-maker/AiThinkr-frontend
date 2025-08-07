import React, { useState } from 'react'
import { FaEye, FaEyeSlash } from 'react-icons/fa6';
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthProvider.jsx';

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
    const value = e.target.value
    const name = e.target.name
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-700 via-gray-900 to-gray-800 px-4">
      <div className="w-full max-w-md bg-[#18181b] rounded-2xl shadow-2xl p-8 border border-gray-800">
        {/* Heading */}
        <h1 className="text-3xl font-bold text-center mb-6 text-white">Login</h1>

        {/* Email */}
        <div className="mb-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
            value={formdata.email}
            onChange={handlechange}
            required
          />
        </div>

        {/* Password */}
        <div className="mb-4 relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
            value={formdata.password}
            onChange={handlechange}
          />
          <span
            className='absolute right-3 top-3 text-gray-400 cursor-pointer'
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
          </span>
        </div>

        {/* Error Message */}
        {error && <span className="block text-red-500 text-sm mb-4">{error}</span>}

        {/* Terms and Conditions */}
        <p className="text-gray-400 text-xs mb-6 text-center">
          By signing up or logging in, you agree to Deepseek's{' '}
          <a href="#" className="underline hover:text-blue-400">Terms of Use</a> and{' '}
          <a href="#" className="underline hover:text-blue-400">Privacy Policy</a>.
        </p>

        {/* Login Button */}
        <button onClick={handleLogin} disabled={loading} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition mb-4">
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* Link to signup page */}
        <div className="flex justify-between text-gray-400 text-sm">
          <span>Don't have an account?</span>
          <Link to="/signup" className="text-blue-400 hover:underline">Signup</Link>
        </div>
      </div>
    </div>
  )
}

export default Login;