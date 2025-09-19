import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input: React.FC<InputProps> = ({ 
  label, 
  error, 
  helperText, 
  className = '', 
  id,
  ...props 
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div className="space-y-4" style={{ marginTop: '0.5rem' }}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-neutral-700" style={{ display: 'block' }}>
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`input ${error ? 'border-red-300' : ''} ${className}`}
        style={error ? { 
          borderColor: '#fca5a5',
          boxShadow: '0 0 0 4px rgba(248, 113, 113, 0.2)'
        } : {}}
        {...props}
      />
      {error && (
        <p className="text-sm flex items-center gap-1" style={{ color: '#dc2626' }}>
          <span>⚠️</span>
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="text-sm text-neutral-500">{helperText}</p>
      )}
    </div>
  );
};

export default Input;
