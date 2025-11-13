import React, { InputHTMLAttributes, useState } from 'react';
import { EyeIcon, EyeSlashIcon, ClipboardDocumentIcon, CheckIcon } from '../icons/Icons';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Input: React.FC<InputProps> = ({ label, id, className = '', type, ...props }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleCopy = () => {
    if (props.value) {
      navigator.clipboard.writeText(props.value as string).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      });
    }
  };

  const isPassword = type === 'password';
  const hasCopyButton = props.readOnly && props.value && !isPassword;
  
  const currentType = isPassword ? (isPasswordVisible ? 'text' : 'password') : type;

  return (
    <div className="w-full">
      {label && <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>}
      <div className="relative">
        <input
          id={id}
          type={currentType}
          className={`w-full px-3 py-2 bg-white dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-md shadow-sm placeholder-gray-500/80 dark:placeholder-gray-400/80 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm text-gray-900 dark:text-gray-100 disabled:bg-gray-100 dark:disabled:bg-dark-border/50 ${isPassword || hasCopyButton ? 'pr-10' : ''} ${className}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setIsPasswordVisible(!isPasswordVisible)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
            title={isPasswordVisible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          >
            {isPasswordVisible ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
          </button>
        )}
        {hasCopyButton && (
           <button
            type="button"
            onClick={handleCopy}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            aria-label={isCopied ? 'Copied' : 'Copy to clipboard'}
            title={isCopied ? 'Đã sao chép' : 'Sao chép vào clipboard'}
          >
            {isCopied ? <CheckIcon className="h-5 w-5 text-green-500" /> : <ClipboardDocumentIcon className="h-5 w-5" />}
          </button>
        )}
      </div>
    </div>
  );
};

export default Input;