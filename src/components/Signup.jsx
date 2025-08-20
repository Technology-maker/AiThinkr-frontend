import React, { useState } from 'react'
import { FaEye, FaEyeSlash } from 'react-icons/fa6';
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

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

  const handleSignup = async (e) => {
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

      // ✅ SUCCESS: Trigger password manager save prompt using History API
      if (data && data.message) {
        alert(data.message || "Signup successfully");

        // Use History API to trigger password save prompt
        // This simulates a successful form submission that browsers recognize
        window.history.pushState({
          signupSuccess: true,
          user: data.user,
          timestamp: Date.now()
        }, '', window.location.href);

        // Small delay to ensure password managers capture the credentials
        setTimeout(() => {
          navigate("/login");
        }, 500);
      }
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-700 via-gray-900 to-gray-800 px-4">
      <div className="w-full max-w-md bg-[#18181b] rounded-2xl shadow-2xl p-8 border border-gray-800">
        {/* Heading */}
        <h1 className="text-3xl font-bold text-center mb-6 text-white">Sign Up</h1>

        {/* ✅ Form with proper attributes for password manager */}
        <form
          name="signup"
          method="POST"
          // ✅ Critical: Set action to your signup endpoint
          action="https://ai-thinkr.vercel.app/api/v1/user/signup"
          onSubmit={(e) => {
            e.preventDefault();
            handleSignup(e);
          }}
          // ✅ Enable browser password manager functionality
          autoComplete="on"
        >
          {/* First Name */}
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
              // ✅ Tell password managers this is first name
              autoComplete="given-name"
            />
          </div>

          {/* Last Name */}
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
              // ✅ Tell password managers this is last name
              autoComplete="family-name"
            />
          </div>

          {/* Email */}
          <div className="mb-4">
            <label htmlFor="email" className="sr-only">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="Email"
              className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
              value={formdata.email}
              onChange={handlechange}
              required
              inputMode="email"
              autoCapitalize="off"
              autoCorrect="off"
              // ✅ Critical: Tell password managers this is the username field
              autoComplete="username"
            />
          </div>

          {/* Password */}
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
              // ✅ Critical: Tell password managers this is a new password
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

          {/* Error Message */}
          {error && <span className="block text-red-500 text-sm mb-4">{error}</span>}

          {/* Terms and Conditions */}
          <p className="text-gray-400 text-xs mb-6 text-center">
            By signing up or logging in, you agree to Deepseek&apos;s{' '}
            <a href="#" className="underline hover:text-blue-400">Terms of Use</a> and{' '}
            <a href="#" className="underline hover:text-blue-400">Privacy Policy</a>.
          </p>

          {/* Signup Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition mb-4"
          >
            {loading ? "Signing..." : "Signup"}
          </button>

          {/* Link to login page */}
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
