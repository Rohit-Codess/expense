import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Button, Input } from '../components/ui';
import { authService } from '../services';

const validationSchema = Yup.object({
  phoneNumber: Yup.string()
    .matches(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit mobile number')
    .required('Mobile number is required'),
});

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formik = useFormik({
    initialValues: {
      phoneNumber: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await authService.sendOTP({
          phoneNumber: `+91${values.phoneNumber}`,
        });

        if (response.success) {
          // Navigate to OTP verification with phone number
          navigate('/verify-otp', {
            state: { phoneNumber: `+91${values.phoneNumber}` },
          });
        } else {
          setError(response.error || 'Failed to send OTP');
        }
      } catch {
        setError('An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-600">
              Please enter your mobile number to continue
            </p>
          </div>

          {/* Phone Icon */}
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
                  d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={formik.handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Phone Number Input */}
            <div className="space-y-4">
              <div className="flex gap-3">
                {/* Country Code */}
                <div className="flex-shrink-0">
                  <div className="flex items-center h-12 px-3 border border-gray-300 rounded-lg bg-gray-50">
                    <span className="text-gray-600 font-medium">+91</span>
                  </div>
                </div>

                {/* Mobile Number */}
                <div className="flex-1">
                  <Input
                    placeholder="Mobile Number"
                    type="tel"
                    value={formik.values.phoneNumber}
                    onChange={(value) => formik.setFieldValue('phoneNumber', value)}
                    error={formik.touched.phoneNumber ? formik.errors.phoneNumber : undefined}
                  />
                </div>
              </div>

              {/* Alternative input field for consistency with design */}
            </div>

            {/* Send OTP Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isLoading}
              disabled={!formik.isValid || !formik.values.phoneNumber}
              className="w-full"
            >
              Send OTP
            </Button>
          </form>
        </div>

        {/* Page indicator dots */}
        <div className="flex justify-center space-x-2 mt-8">
          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default Login;