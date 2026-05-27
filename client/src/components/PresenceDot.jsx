import React from 'react';

export default function PresenceDot({ isOnline }) {
  return (
    <span className="relative flex h-2.5 w-2.5">
      {isOnline && (
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
      )}
      <span
        className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
          isOnline ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'
        }`}
      ></span>
    </span>
  );
}
