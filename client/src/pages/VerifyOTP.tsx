import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/ui';
import { authService } from '../services';

const VerifyOTP: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const phoneNumber = location.state?.phoneNumber;

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(30);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Redirect if no phone number
  useEffect(() => {
    if (!phoneNumber) {
      navigate('/login');
    }
  }, [phoneNumber, navigate]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Prevent multiple characters
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError(null);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields are filled
    if (newOtp.every(digit => digit !== '') && newOtp.join('').length === 6) {
      handleVerifyOTP(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async (otpValue?: string) => {
    const otpToVerify = otpValue || otp.join('');
    
    if (otpToVerify.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.verifyOTP({
        phoneNumber,
        otp: otpToVerify,
      });

      if (response.success) {
        navigate('/dashboard');
      } else {
        setError(response.error || 'Invalid OTP');
        // Clear OTP on error
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;

    setResendLoading(true);
    setError(null);

    try {
      const response = await authService.sendOTP({ phoneNumber });
      
      if (response.success) {
        setCanResend(false);
        setCountdown(30);
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        setError(response.error || 'Failed to resend OTP');
      }
    } catch {
      setError('Failed to resend OTP');
    } finally {
      setResendLoading(false);
    }
  };

  const maskedPhoneNumber = phoneNumber ? 
    `${phoneNumber.slice(0, 3)} ${phoneNumber.slice(3, 6)}XXXXX` : '';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Verify your number
            </h2>
            <p className="text-gray-600">
              Enter 6-digit code sent to {maskedPhoneNumber}
            </p>
          </div>

          {/* Shield Icon */}
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          )}

          {/* OTP Input */}
          <div className="flex justify-center space-x-2 mb-6">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-10 h-10 text-center text-lg font-semibold border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                disabled={isLoading}
              />
            ))}
          </div>

          {/* Resend Code */}
          <div className="text-center mb-6">
            {canResend ? (
              <button
                onClick={handleResendOTP}
                disabled={resendLoading}
                className="text-blue-500 hover:text-blue-600 font-medium transition-colors"
              >
                {resendLoading ? 'Sending...' : 'Resend code'}
              </button>
            ) : (
              <p className="text-gray-500 text-sm">
                Resend code in {countdown}s
              </p>
            )}
          </div>

          {/* Verify Button */}
          <Button
            onClick={() => handleVerifyOTP()}
            variant="primary"
            size="lg"
            loading={isLoading}
            disabled={otp.some(digit => !digit)}
            className="w-full"
          >
            Verify
          </Button>
        </div>

        {/* Page indicator dots */}
        <div className="flex justify-center space-x-2 mt-8">
          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;