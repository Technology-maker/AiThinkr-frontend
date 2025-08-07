import React from 'react'
import { Navigate, Route, Routes } from "react-router"
import Home from './components/home';
import Login from './components/Login.jsx';
import Signup from './components/Signup';
import { useAuth } from './context/AuthProvider.jsx';

const App = () => {

  const [authUser] = useAuth();
  console.log(authUser);

  return (
    <>
      <div>
        <Routes>
          <Route path="/" element={authUser ? <Home /> : <Navigate to="/login" />} />
          <Route path="/login" element={!authUser ? <Login /> : <Navigate to="/" />} />
          <Route path="/signup" element={!authUser ? <Signup /> : <Navigate to="/" />} />
        </Routes>
      </div>

    </>
  )
}

export default App