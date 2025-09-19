import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  padding = 'md',
  onClick
}) => {
  const paddingClasses = {
    sm: 'p-6',
    md: 'p-8',
    lg: 'p-12',
  };
  
  return (
    <div 
      className={`card ${paddingClasses[padding]} ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;
