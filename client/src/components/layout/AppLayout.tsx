import React from 'react';
import { BottomNavigation } from '../layout';

interface AppLayoutProps {
  children: React.ReactNode;
  showNavigation?: boolean;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children, showNavigation = false }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1">
        {children}
      </main>
      {showNavigation && (
        <BottomNavigation className="fixed bottom-0 left-0 right-0 shadow-lg" />
      )}
      {showNavigation && <div className="h-16"></div>} {/* Spacer for fixed navigation */}
    </div>
  );
};

export default AppLayout;