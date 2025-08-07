import React from 'react';
import Sidebar from './Sidebar';
import Prompt from './Prompt';

const Home = () => {
  return (
    <div className="flex h-screen bg-[#1e1e1e] text-white overflow-hidden">
      {/* Only one Sidebar */}
      <Sidebar />

      {/* Prompt area */}
      <div className="flex-1 flex flex-col w-full">
        <div className="flex-1 flex items-center justify-center">
          <Prompt />
        </div>
      </div>
    </div>
  );
};

export default Home;
