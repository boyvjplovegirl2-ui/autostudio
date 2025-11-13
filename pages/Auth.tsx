import React, { useState, useEffect, ChangeEvent } from 'react';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { User } from '../types';
import { GoogleIcon, FacebookIcon, SunIcon, MoonIcon } from '../components/icons/Icons';
import { useTheme } from '../hooks/useTheme';

interface AuthProps {
  onLogin: (user: User) => void;
  onSignup: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin, onSignup }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { theme, toggleTheme } = useTheme();

  // New state for enhanced functionality
  const [isLoading, setIsLoading] = useState(false);
  
  // Forgot Password State
  const [isForgotPasswordView, setIsForgotPasswordView] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState<string | null>(null);


  // Clear form fields and error when switching views
  useEffect(() => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError(null);
    setIsLoading(false);
    setForgotPasswordEmail('');
    setForgotPasswordMessage(null);
  }, [isLoginView, isForgotPasswordView]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Using a timeout to simulate network latency
    setTimeout(() => {
      // --- Signup Logic ---
      if (!isLoginView) {
        if (!name || !email || !password || !confirmPassword) {
          setError("Vui lòng điền đầy đủ thông tin.");
          setIsLoading(false);
          return;
        }
        if (password.length < 6) {
          setError("Mật khẩu phải có ít nhất 6 ký tự.");
          setIsLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError("Mật khẩu xác nhận không khớp.");
          setIsLoading(false);
          return;
        }

        const newUser: User = {
          name: name,
          email: email,
          plan: 'Chưa kích hoạt',
          isAdmin: email.includes('admin@'),
          credits: 50,
        };
        onSignup(newUser);
        return;
      }

      // --- Login Logic ---
      if (!email || !password) {
        setError("Vui lòng nhập email và mật khẩu.");
        setIsLoading(false);
        return;
      }
      
      // MOCK: A real app would have an API call here.
      // Simulating incorrect password for a more specific error
      if (email === 'user@example.com' && password !== 'password123') {
          setError("Email hoặc mật khẩu không đúng. Vui lòng thử lại.");
          setIsLoading(false);
          return;
      }
      
      const mockUser: User = {
        name: email.split('@')[0],
        email: email,
        plan: 'Cá nhân',
        isAdmin: email.includes('admin@'),
        credits: 100,
      };
      onLogin(mockUser);
    }, 1000);
  };
  
  const handleSocialLogin = () => {
      setIsLoading(true);
      setTimeout(() => {
          const mockUser: User = {
            name: 'social_user',
            email: 'social_user@example.com',
            plan: 'Cá nhân Pro',
            isAdmin: false,
            credits: 99999,
          };
          onLogin(mockUser);
      }, 1000);
  }
  
  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setForgotPasswordMessage(null);

    if (!forgotPasswordEmail) {
      setError("Vui lòng nhập địa chỉ email của bạn.");
      return;
    }
    
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setForgotPasswordMessage(`Nếu tài khoản tồn tại, một liên kết khôi phục mật khẩu đã được gửi đến ${forgotPasswordEmail}.`);
    }, 1500);
  };
  
  const renderForgotPasswordView = () => (
    <Card className="max-w-md w-full">
      <h2 className="text-2xl font-bold text-center mb-6">Khôi phục mật khẩu</h2>
      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-6">
        Nhập email của bạn và chúng tôi sẽ gửi cho bạn một liên kết để đặt lại mật khẩu.
      </p>
      <form onSubmit={handleForgotPassword} className="space-y-4">
        <Input
          label="Email"
          id="forgot-email"
          type="email"
          value={forgotPasswordEmail}
          onChange={(e) => setForgotPasswordEmail(e.target.value)}
          placeholder="you@example.com"
          required
          disabled={isLoading}
        />
        
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        {forgotPasswordMessage && <p className="text-green-500 text-sm text-center">{forgotPasswordMessage}</p>}

        <div className="pt-2">
          <Button type="submit" className="w-full" isLoading={isLoading} disabled={isLoading}>
            Gửi liên kết khôi phục
          </Button>
        </div>
      </form>

      <p className="mt-6 text-center text-sm">
        <button
          onClick={() => setIsForgotPasswordView(false)}
          className="font-medium text-primary hover:underline"
        >
          Quay lại Đăng nhập
        </button>
      </p>
    </Card>
  );
  
  const renderAuthView = () => (
      <Card className="max-w-md w-full">
        <h2 className="text-2xl font-bold text-center mb-6">{isLoginView ? 'Đăng nhập' : 'Đăng ký'}</h2>
        
        <div className="space-y-3">
            <Button variant="outline" className="w-full" onClick={handleSocialLogin}>
                <GoogleIcon className="w-5 h-5 mr-3" />
                Tiếp tục với Google
            </Button>
            <Button variant="outline" className="w-full" onClick={handleSocialLogin}>
                <FacebookIcon className="w-5 h-5 mr-3" />
                Tiếp tục với Facebook
            </Button>
        </div>

        <div className="my-6 flex items-center">
            <hr className="flex-grow border-t border-light-border dark:border-dark-border" />
            <span className="mx-4 text-sm text-gray-500">hoặc</span>
            <hr className="flex-grow border-t border-light-border dark:border-dark-border" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLoginView && (
            <Input
              label="Họ và Tên"
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nguyễn Văn A"
              required
            />
          )}
          <Input
            label="Email"
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
          {/* FIX: Removed incorrect props isPasswordVisible and onToggleVisibility. The Input component handles its own state. Set type to "password" to trigger internal logic. */}
          <Input
            label="Mật khẩu"
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
          {!isLoginView && (
            // FIX: Removed incorrect props isPasswordVisible and onToggleVisibility. The Input component handles its own state. Set type to "password" to trigger internal logic.
            <Input
              label="Xác nhận mật khẩu"
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          )}

          {isLoginView && (
              <div className="text-right -mt-2">
                <button
                  type="button"
                  onClick={() => setIsForgotPasswordView(true)}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Quên mật khẩu?
                </button>
              </div>
          )}

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          
          <div className="pt-2">
            <Button type="submit" className="w-full" isLoading={isLoading}>
              {isLoginView ? 'Đăng nhập' : 'Đăng ký'}
            </Button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm">
          {isLoginView ? "Chưa có tài khoản? " : "Đã có tài khoản? "}
          <button
            onClick={() => setIsLoginView(!isLoginView)}
            className="font-medium text-primary hover:underline"
          >
            {isLoginView ? 'Đăng ký' : 'Đăng nhập'}
          </button>
        </p>
      </Card>
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-light-bg dark:bg-dark-bg p-4">
       <div className="absolute top-4 right-4">
         <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          {theme === 'light' ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
        </button>
      </div>
      
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-primary">STUDIO AUTO</h1>
        <p className="text-gray-600 dark:text-gray-400">Nền tảng sáng tạo AI tất cả trong một</p>
      </div>

      {isForgotPasswordView ? renderForgotPasswordView() : renderAuthView()}

    </div>
  );
};

export default Auth;