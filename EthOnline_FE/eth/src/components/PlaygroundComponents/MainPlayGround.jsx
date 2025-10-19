import React from 'react';
import ReactFlowPlaygroundWrapper from './ReactFlowPlayground';
import PlaygroundSelector from './PlaygroundSelector';
import { PlaygroundProvider } from '../../contexts/PlaygroundContext';

const MainPlayGround = () => {
  return (
    <PlaygroundProvider>
      <div className="h-[90vh] flex flex-col">
        {/* Playground Header */}
        <div className="bg-white border-b border-gray-100 px-2 py-1 flex items-center justify-between shadow-sm">
          
            <PlaygroundSelector />
         
        </div>
        
        {/* React Flow Playground */}
        <div className="flex-1">
          <ReactFlowPlaygroundWrapper />
        </div>
      </div>
    </PlaygroundProvider>
  );
};

export default MainPlayGround;