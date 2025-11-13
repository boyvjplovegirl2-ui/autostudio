import React from 'react';

// FIX: Extend props to accept standard div attributes like onClick
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    <div className={`bg-light-card dark:bg-dark-card rounded-xl shadow-md overflow-hidden p-6 border border-light-border dark:border-dark-border transition-all duration-300 ease-in-out hover:shadow-lg hover:transform hover:-translate-y-1 ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;