import React, { SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

const Select: React.FC<SelectProps> = ({ label, id, options, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>}
      <select
        id={id}
        className={`w-full px-3 py-2 bg-white dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm text-gray-900 dark:text-gray-100 ${className}`}
        {...props}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  );
};

export default Select;