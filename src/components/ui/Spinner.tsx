import React from 'react';

export const Spinner: React.FC<{ size?: number; className?: string; label?: string }> = ({ size = 56, className = '', label = 'Processing' }) => (
  <div className={`flex flex-col items-center justify-center ${className}`} role="status" aria-live="polite">
    <svg
      className={`animate-spin motion-reduce:animate-none text-green-500`}
      style={{ width: size, height: size }}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.15" />
      <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    </svg>
    <span className="sr-only">{label}</span>
  </div>
);

export default Spinner;
