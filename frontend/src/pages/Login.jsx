import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { post } from '../services/ApiEndpoint';
import { toast } from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { setUser } from '../features/authSlice';

// Zod validation schema
const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [darkMode, setDarkMode] = useState(false); // State for dark mode

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
  });

  // Check localStorage for dark mode preference on mount
  useEffect(() => {
    const isDarkMode = localStorage.getItem('isDarkMode') === 'true';
    setDarkMode(isDarkMode);
  }, []);

  const onSubmit = async data => {
    try {
      const response = await post('/api/auth/login', data);

      if (response && response.status === 200) {
        const userRole = response?.data?.existUser.role;
        navigate(
          userRole === 'admin'
            ? '/admin'
            : userRole === 'user'
            ? '/'
            : `/${userRole}`
        );
        toast.success(response?.data.message);
        dispatch(setUser(response?.data?.existUser));
        reset();
      } else {
        toast.error('Login failed. Please try again.');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    }
  };

  return (
    <div
      className={`${
        darkMode ? 'bg-gray-800 text-gray-200' : 'bg-gray-50 text-gray-800'
      } min-h-screen flex items-center justify-center`}
    >
      <section className="max-w-2xl w-full mx-auto p-6">
        <div className="text-center mb-5 md:mb-10">
          <h1 className="head-font text-3xl md:text-4xl underline">Invoice</h1>
          <h4 className="text-xl font-semibold mt-2 md:mt-6">
            Sign in to your account
          </h4>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email Field */}
          <div>
            <label className="text-sm mb-2 block">Email Id</label>
            <input
              {...register('email')}
              type="email"
              className={`bg-gray-100 text-gray-800 dark:text-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 w-full text-sm px-4 py-3.5 rounded-md outline-none focus:ring-2 transition-all ${
                errors.email
                  ? 'ring-red-500'
                  : 'ring-blue-500 focus:ring-blue-500'
              }`}
              placeholder="Enter email"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label className="text-sm mb-2 block">Password</label>
            <input
              {...register('password')}
              type="password"
              className={`bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-300 dark:border-gray-600 w-full text-sm px-4 py-3.5 rounded-md outline-none focus:ring-2 transition-all ${
                errors.password
                  ? 'ring-red-500'
                  : 'ring-blue-500 focus:ring-blue-500'
              }`}
              placeholder="Enter password"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Forgot Password */}
          <div className="text-right">
            <Link
              to="/forgot-password"
              className="text-sm text-blue-600 hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className="w-full py-3 px-6 text-sm font-semibold rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
            >
              Sign In
            </button>
          </div>
        </form>

        {/* Register Link */}
        <div className="text-center mt-4">
          <p className="text-sm">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-semibold text-blue-600 hover:underline"
            >
              Register here
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
};

export default Login;
