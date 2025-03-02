import React, { useEffect, useState } from 'react';

interface AuthCheckProps {
  children: React.ReactNode;
  onNotAuthenticated: () => void;
}

export function AuthCheck({ children, onNotAuthenticated }: AuthCheckProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const userData = localStorage.getItem('satgpt_user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user.name && user.dob) {
          setIsAuthenticated(true);
        } else {
          onNotAuthenticated();
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('satgpt_user');
        onNotAuthenticated();
      }
    } else {
      onNotAuthenticated();
    }
    setIsChecking(false);
  }, [onNotAuthenticated]);

  if (isChecking) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : null;
}
