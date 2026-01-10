'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import * as Icons from 'lucide-react';

interface IconPickerProps {
  selectedIcon: string;
  onIconSelect: (icon: string) => void;
}

export default function IconPicker({ selectedIcon, onIconSelect }: IconPickerProps) {
  const [iconSearch, setIconSearch] = useState('');

  // Get all icon names from lucide-react
  const allIcons = Object.keys(Icons).filter(key => 
    key !== 'createLucideIcon' && 
    key !== 'default' &&
    typeof (Icons as any)[key] === 'object'
  );

  const filteredIcons = iconSearch 
    ? allIcons.filter(icon => icon.toLowerCase().includes(iconSearch.toLowerCase()))
    : allIcons.slice(0, 48); // Show first 48 icons by default

  const IconComponent = (Icons as any)[selectedIcon];

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Choose Icon
      </label>
      
      {/* Selected Icon Preview */}
      <div className="mb-3 p-4 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center gap-3 border border-gray-300 dark:border-gray-700">
        {IconComponent && <IconComponent size={24} className="text-violet-600 dark:text-violet-400" />}
        <span className="text-sm text-gray-600 dark:text-gray-400">Selected: {selectedIcon}</span>
      </div>

      {/* Search */}
      <div className="mb-3 relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={iconSearch}
          onChange={(e) => setIconSearch(e.target.value)}
          placeholder="Search icons..."
          className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm dark:text-white"
        />
      </div>

      {/* Icon Grid */}
      <div className="max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-2">
        <div className="grid grid-cols-8 gap-2">
          {filteredIcons.map((iconName) => {
            const Icon = (Icons as any)[iconName];
            return (
              <button
                key={iconName}
                type="button"
                onClick={() => onIconSelect(iconName)}
                className={`p-2 rounded-lg transition-all hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  selectedIcon === iconName
                    ? 'bg-violet-600 text-white ring-2 ring-violet-500'
                    : 'bg-gray-50 dark:bg-gray-800'
                }`}
                title={iconName}
              >
                {Icon && <Icon size={20} className={selectedIcon === iconName ? 'text-white' : 'text-gray-700 dark:text-gray-300'} />}
              </button>
            );
          })}
        </div>
        {filteredIcons.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
            No icons found
          </div>
        )}
      </div>
    </div>
  );
}
