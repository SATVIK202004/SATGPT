import React, { useState, useEffect } from 'react';
import { modelConfigs } from '../config/models';
import { Brain } from 'lucide-react';

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
}

export function ModelSelector({ selectedModel, onModelChange }: ModelSelectorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [modelDescriptions, setModelDescriptions] = useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState('');

  // Mock loading effect and fetching model descriptions (you can replace with real API calls)
  useEffect(() => {
    const fetchDescriptions = () => {
      setIsLoading(true);
      setTimeout(() => {
        // Example model descriptions, these would ideally come from an API or your config
        const descriptions = Object.keys(modelConfigs).reduce((acc, modelName) => {
          acc[modelName] = `Description of ${modelName} model`;
          return acc;
        }, {} as Record<string, string>);
        setModelDescriptions(descriptions);
        setIsLoading(false);
      }, 1000);
    };

    fetchDescriptions();
  }, []);

  const filteredModels = Object.keys(modelConfigs).filter((modelName) =>
    modelName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="px-3 py-2 border-b border-gray-700">
      <div className="flex items-center gap-2 mb-2 text-white">
        <Brain size={16} />
        <span className="text-sm font-medium">Select AI Model</span>
      </div>
      
      <div className="mb-2">
        <input
          type="text"
          placeholder="Search models..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-gray-800 text-white rounded-md px-3 py-2 mb-2 outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      <select
        value={selectedModel}
        onChange={(e) => onModelChange(e.target.value)}
        className="w-full bg-gray-800 text-white rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500"
        disabled={isLoading}
      >
        {isLoading ? (
          <option disabled>Loading...</option>
        ) : (
          filteredModels.map((modelName) => (
            <option key={modelName} value={modelName}>
              {modelName}
            </option>
          ))
        )}
      </select>

      {/* Show description when a model is selected */}
      {selectedModel && modelDescriptions[selectedModel] && (
        <div className="mt-2 text-gray-400 text-sm">
          {modelDescriptions[selectedModel]}
        </div>
      )}
    </div>
  );
}
