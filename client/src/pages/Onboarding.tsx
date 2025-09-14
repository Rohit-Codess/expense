import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui';

const Onboarding: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Logo/Title */}
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          PocketLedger
        </h1>
        
        {/* Subtitle */}
        <p className="text-lg text-gray-600 mb-12">
          Track daily spends — travel, food, stationery
        </p>

        {/* Illustration */}
        <div className="mb-12 flex justify-center">
          <div className="relative">
            {/* Main character illustration */}
            <div className="w-64 h-64 mx-auto bg-gradient-to-b from-blue-100 to-blue-50 rounded-full flex items-center justify-center relative overflow-hidden">
              {/* Character */}
              <div className="relative">
                {/* Head */}
                <div className="w-16 h-16 bg-orange-200 rounded-full mx-auto mb-2 relative">
                  {/* Hair */}
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-12 h-8 bg-gray-800 rounded-full"></div>
                  {/* Face */}
                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-8 h-6 bg-orange-300 rounded-full"></div>
                </div>
                
                {/* Body */}
                <div className="w-20 h-24 bg-green-300 rounded-t-3xl mx-auto relative">
                  {/* Backpack */}
                  <div className="absolute -right-3 top-2 w-8 h-12 bg-blue-600 rounded-lg"></div>
                  
                  {/* Arms */}
                  <div className="absolute -left-4 top-4 w-6 h-3 bg-green-400 rounded-full"></div>
                  <div className="absolute -right-4 top-4 w-6 h-3 bg-green-400 rounded-full"></div>
                </div>
                
                {/* Legs */}
                <div className="flex justify-center gap-2 -mt-1">
                  <div className="w-4 h-16 bg-blue-600 rounded-b-lg"></div>
                  <div className="w-4 h-16 bg-blue-600 rounded-b-lg"></div>
                </div>
              </div>

              {/* Floating items */}
              <div className="absolute top-8 left-8 w-8 h-10 bg-yellow-200 rounded transform rotate-12">
                {/* Coffee cup */}
                <div className="w-6 h-6 bg-yellow-300 rounded-full mx-auto mt-1"></div>
                <div className="w-1 h-2 bg-gray-400 rounded mx-auto"></div>
              </div>
              
              <div className="absolute top-12 right-12 w-8 h-6 bg-blue-200 rounded transform -rotate-12">
                {/* Credit card */}
                <div className="w-full h-1 bg-gray-300 rounded mt-1"></div>
                <div className="w-3 h-1 bg-gray-400 rounded mt-1 ml-1"></div>
              </div>
              
              <div className="absolute bottom-16 left-12 w-6 h-8 bg-green-200 rounded transform rotate-45">
                {/* Notebook */}
                <div className="w-full h-1 bg-gray-300 rounded mt-1"></div>
                <div className="w-full h-1 bg-gray-300 rounded mt-1"></div>
              </div>
              
              <div className="absolute bottom-12 right-8 w-10 h-6 bg-gray-300 rounded-full transform -rotate-12">
                {/* Airplane */}
                <div className="w-8 h-2 bg-gray-400 rounded mx-auto mt-2"></div>
              </div>
              
              <div className="absolute top-20 right-4 w-6 h-8 bg-red-200 rounded">
                {/* Book */}
                <div className="w-full h-1 bg-red-400 rounded mt-1"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Get Started Button */}
        <Button
          variant="primary"
          size="lg"
          onClick={handleGetStarted}
          className="w-full max-w-xs mx-auto shadow-lg"
        >
          Get Started
        </Button>

        {/* Page indicator dots */}
        <div className="flex justify-center space-x-2 mt-8">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;