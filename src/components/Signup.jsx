import React, { useState } from 'react'
import { FaEye, FaEyeSlash } from 'react-icons/fa6';
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

const Signup = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [formdata, setFormdata] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormdata((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignup = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(
        "https://ai-thinkr.vercel.app/api/v1/user/signup",
        {
          firstname: formdata.firstname,
          lastname: formdata.lastname,
          email: formdata.email,
          password: formdata.password
        },
        { withCredentials: true }
      );
      alert(res.data.message || "User signup successfully");
      navigate("/login");
    } catch (err) {
      const message = err.response?.data?.error || "Signup failed";
      setError(message); // This will show "Email already exists" if backend sends it
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-700 via-gray-900 to-gray-800 px-4">
      <div className="w-full max-w-md bg-[#18181b] rounded-2xl shadow-2xl p-8 border border-gray-800">
        <h1 className="text-3xl font-bold text-center mb-6 text-white">Sign Up</h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSignup();
          }}
        >
          {/* First Name */}
          <div className="mb-4">
            <input
              id="firstname"
              type="text"
              name="firstname"
              placeholder="First Name"
              className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
              value={formdata.firstname}
              onChange={handleChange}
              required
            />
          </div>

          {/* Last Name */}
          <div className="mb-4">
            <input
              id="lastname"
              type="text"
              name="lastname"
              placeholder="Last Name"
              className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
              value={formdata.lastname}
              onChange={handleChange}
              required
            />
          </div>

          {/* Email */}
          <div className="mb-4">
            <input
              id="email"
              type="email"
              name="email"
              placeholder="Email"
              className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
              value={formdata.email}
              onChange={handleChange}
              required
              inputMode="email"
              autoCapitalize="off"
              autoCorrect="off"
            />
          </div>

          {/* Password */}
          <div className="mb-4 relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
              value={formdata.password}
              onChange={handleChange}
              required
              pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$"
              title="Password must be at least 8 characters long and include uppercase, lowercase, number, and special character."
            />
            <span
              className="absolute right-3 top-3 text-gray-400 cursor-pointer"
              onClick={() => setShowPassword(prev => !prev)}
            >
              {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
            </span>
          </div>

          {/* Error Message */}
          {error && <span className="block text-red-500 text-sm mb-4">{error}</span>}

          {/* Signup Button */}
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
  );
}

export default Signup;
