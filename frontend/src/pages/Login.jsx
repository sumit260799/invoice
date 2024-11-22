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
  const [darkMode, setDarkMode] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
  });

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
            : userRole === 'salesUser'
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
      className={`relative min-h-screen flex items-center justify-center bg-cover bg-center ${
        darkMode ? 'bg-gray-900 text-gray-200' : 'bg-gray-50 text-gray-800'
      }`}
      style={{
        backgroundImage: `url('https://t4.ftcdn.net/jpg/01/19/11/55/360_F_119115529_mEnw3lGpLdlDkfLgRcVSbFRuVl6sMDty.jpg')`,
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-50" />
      <div className="relative z-10 max-w-lg w-full p-8  bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-600">Invoice</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Sign in to access your account
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="text-sm mb-2 block font-medium">
              Email Address
            </label>
            <input
              {...register('email')}
              type="email"
              className={`w-full px-4 py-2 rounded-md shadow-sm outline-none focus:ring-1 transition-all text-gray-800 bg-gray-100 dark:bg-gray-700 dark:text-gray-100 border ${
                errors.email
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="Enter your email"
              autoComplete="off"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm mb-2 block font-medium">Password</label>
            <input
              {...register('password')}
              type="password"
              className={`w-full px-4 py-2 rounded-md  shadow-sm outline-none focus:ring-1 transition-all text-gray-800 bg-gray-100 dark:bg-gray-700 dark:text-gray-100 border ${
                errors.password
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="Enter your password"
              autoComplete="off"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="text-right">
            <Link
              to="/forgot-password"
              className="text-sm text-blue-600 hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          <div>
            <button
              type="submit"
              className="w-full py-2 px-6 text-sm font-bold rounded-md outline-none bg-blue-600 text-white hover:bg-blue-700 focus:outline-none shadow-md"
            >
              Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
