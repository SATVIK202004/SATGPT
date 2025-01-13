import React, { useState } from 'react';
import { RefreshCw, CheckCircle } from 'lucide-react';

interface RegenerateButtonProps {
  onClick: () => void;
  disabled: boolean;
  isLoading: boolean;
  successMessage: string;
}

export function RegenerateButton({
  onClick,
  disabled,
  isLoading,
  successMessage,
}: RegenerateButtonProps) {
  const [showSuccess, setShowSuccess] = useState(false);

  const handleClick = () => {
    onClick();
    setShowSuccess(false);
    setTimeout(() => setShowSuccess(true), 500); // Show success after 500ms
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isLoading}
      className={`flex items-center gap-2 px-4 py-2 text-sm ${
        disabled || isLoading
          ? 'text-gray-400 bg-gray-300 cursor-not-allowed opacity-50'
          : 'text-white bg-gradient-to-r from-red-500 via-green-400 to-blue-300 hover:from-blue-600 hover:via-red-500 hover:to-blue-400'
      } rounded-lg transition-colors duration-300`}
    >
      {isLoading ? (
        <RefreshCw size={16} className="animate-spin" />
      ) : showSuccess ? (
        <CheckCircle size={16} className="text-black-500" />
      ) : (
        <RefreshCw size={16} />
      )}
      {isLoading ? 'Generating...' : showSuccess ? successMessage : 'Regenerate response'}
    </button>
  );
}
