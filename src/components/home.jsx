import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Prompt from './Prompt';
import ClickSpark from './snipet/ClickSpark';

const Home = () => {
  const [prompt, setPrompt] = useState([]);
  return (
    <div className="flex h-screen bg-[#1e1e1e] text-white overflow-hidden">

      {/* <ClickSpark
        sparkColor='#fff'
        sparkSize={10}
        sparkRadius={15}
        sparkCount={8}
        duration={400}
      > */}

        {/* Only one Sidebar */}
        <Sidebar setPrompt={setPrompt} />

        {/* Prompt area */}
        <div className="flex-1 flex flex-col w-full">
          <div className="flex-1 flex items-center justify-center">
            <Prompt prompt={prompt} setPrompt={setPrompt} />
          </div>
        </div>

      {/* </ClickSpark> */}
    </div>
  );
};

export default Home;
