import React from 'react';
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
  password: z.string().min(6, 'Password must be at least 6 characters'), // Added password validation
});

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // useForm with Zod validation
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(schema), // Apply Zod schema for validation
  });

  // Submit handler
  const onSubmit = async data => {
    try {
      const response = await post('/api/auth/login', data);
      console.log('response?.data?', response?.data);

      if (response && response.status === 200) {
        if (response?.data?.existUser.role == 'admin') {
          navigate('/admin');
        } else if (response?.data?.existUser.role == 'user') {
          navigate('/');
        } else if (response?.data?.existUser.role == 'manager') {
          navigate('/manager');
        } else if (response?.data?.existUser.role == 'spc') {
          navigate('/spc');
        }
        toast.success(response?.data.message);
        dispatch(setUser(response?.data?.existUser));
        reset();
      } else {
        toast.error('Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Error during registration:', error);

      if (error.response) {
        toast.error(
          error.response.data.message ||
            'Registration failed. Please try again.'
        );
      } else {
        toast.error('Registration failed. Please try again.');
      }
    }
  };

  return (
    <section className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-5 md:mb-10">
        <h1 className="head-font text-3xl md:text-4xl underline">Invoice</h1>
        <h4 className="text-gray-800 text-xl font-semibold mt-2 md:mt-6">
          Sign in to your account
        </h4>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-8">
          {/* Email Field */}
          <div>
            <label className="text-gray-800 text-sm mb-2 block">Email Id</label>
            <input
              {...register('email')}
              type="email" // Change to "email" for better validation
              className={`bg-gray-50 border border-gray-300 w-full text-gray-800 text-sm px-4 py-3.5 rounded-md focus:bg-transparent outline-blue-500 transition-all ${
                errors.email ? 'border-red-500' : ''
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
            <label className="text-gray-800 text-sm mb-2 block">Password</label>
            <input
              {...register('password')}
              type="password"
              className={`bg-gray-50 border border-gray-300 w-full text-gray-800 text-sm px-4 py-3.5 rounded-md focus:bg-transparent outline-blue-500 transition-all ${
                errors.password ? 'border-red-500' : ''
              }`}
              placeholder="Enter password"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>
        </div>

        {/* Forgot Password link */}
        <div className="text-right mt-2">
          <Link
            to="/forgot-password"
            className="text-sm text-blue-600 hover:underline focus:outline-none"
          >
            Forgot Password?
          </Link>
        </div>

        <div className="mt-6">
          <button
            type="submit"
            className="py-3 px-7 text-sm font-semibold tracking-wider rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
          >
            Sign In
          </button>
        </div>
      </form>

      {/* "Don't have an account? Register here" link */}
      <div className="text-center mt-4">
        <p className="text-sm text-gray-700">
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
  );
};

export default Login;
