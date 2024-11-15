import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { post } from '../services/ApiEndpoint';
import { toast } from 'react-hot-toast';

// Zod validation schema
const schema = z
  .object({
    firstName: z
      .string()
      .min(2, 'First Name must be at least 2 characters')
      .max(50, 'First Name is too long'),
    lastName: z
      .string()
      .min(2, 'Last Name must be at least 2 characters')
      .max(50, 'Last Name is too long'),
    email: z.string().email('Invalid email address'),
    phone: z
      .string()
      .regex(/^\d+$/, 'Mobile number must contain only digits')
      .min(10, 'Mobile number must be at least 10 digits')
      .max(15, 'Mobile number must not exceed 15 digits'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    cpassword: z
      .string()
      .min(6, 'Confirm Password must be at least 6 characters'),
  })
  .refine(data => data.password === data.cpassword, {
    path: ['cpassword'],
    message: 'Passwords do not match',
  });

const Register = () => {
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

  const onSubmit = async (data, e) => {
    e.preventDefault();
    const { cpassword, ...filteredData } = data;
    try {
      const response = await post('/api/auth/register', filteredData);
      if (response && response.status === 200) {
        toast.success(response.data.message);
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
    <section
      className={`${
        darkMode ? 'bg-gray-800 text-gray-200' : 'bg-gray-50 text-gray-800'
      } min-h-screen mx-auto p-6`}
    >
      <div className="text-center mb-5 md:mb-10">
        <h1 className="head-font text-3xl md:text-4xl underline">Invoice</h1>
        <h4 className="text-xl font-semibold mt-2 md:mt-6">
          Signup for an account
        </h4>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto">
        <div className="grid sm:grid-cols-2  gap-8">
          {/* First Name */}
          <div>
            <label className="text-sm mb-2 block">First Name</label>
            <input
              {...register('firstName')}
              type="text"
              aria-invalid={errors.firstName ? 'true' : 'false'}
              className={`bg-gray-50 border border-gray-300 w-full text-sm px-4 py-3.5 rounded-md focus:bg-transparent transition-all ${
                errors.firstName ? 'border-red-500' : ''
              }`}
              placeholder="Enter first name"
            />
            {errors.firstName && (
              <p className="text-red-500 text-sm mt-1">
                {errors.firstName.message}
              </p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label className="text-sm mb-2 block">Last Name</label>
            <input
              {...register('lastName')}
              type="text"
              aria-invalid={errors.lastName ? 'true' : 'false'}
              className={`bg-gray-50 border border-gray-300 w-full text-sm px-4 py-3.5 rounded-md focus:bg-transparent transition-all ${
                errors.lastName ? 'border-red-500' : ''
              }`}
              placeholder="Enter last name"
            />
            {errors.lastName && (
              <p className="text-red-500 text-sm mt-1">
                {errors.lastName.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="text-sm mb-2 block">Email</label>
            <input
              {...register('email')}
              type="email"
              aria-invalid={errors.email ? 'true' : 'false'}
              className={`bg-gray-50 border border-gray-300 w-full text-sm px-4 py-3.5 rounded-md focus:bg-transparent transition-all ${
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

          {/* Mobile Number */}
          <div>
            <label className="text-sm mb-2 block">Mobile No.</label>
            <input
              {...register('phone')}
              type="text"
              aria-invalid={errors.phone ? 'true' : 'false'}
              className={`bg-gray-50 border border-gray-300 w-full text-sm px-4 py-3.5 rounded-md focus:bg-transparent transition-all ${
                errors.phone ? 'border-red-500' : ''
              }`}
              placeholder="Enter mobile number"
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">
                {errors.phone.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="text-sm mb-2 block">Password</label>
            <input
              {...register('password')}
              type="password"
              aria-invalid={errors.password ? 'true' : 'false'}
              className={`bg-gray-50 border border-gray-300 w-full text-sm px-4 py-3.5 rounded-md focus:bg-transparent transition-all ${
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

          {/* Confirm Password */}
          <div>
            <label className="text-sm mb-2 block">Confirm Password</label>
            <input
              {...register('cpassword')}
              type="password"
              aria-invalid={errors.cpassword ? 'true' : 'false'}
              className={`bg-gray-50 border border-gray-300 w-full text-sm px-4 py-3.5 rounded-md focus:bg-transparent transition-all ${
                errors.cpassword ? 'border-red-500' : ''
              }`}
              placeholder="Enter confirm password"
            />
            {errors.cpassword && (
              <p className="text-red-500 text-sm mt-1">
                {errors.cpassword.message}
              </p>
            )}
          </div>
        </div>

        {/* Submit button */}
        <div className="mt-6">
          <button
            type="submit"
            className="py-3 px-7 text-sm font-semibold tracking-wider rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
          >
            Sign up
          </button>
        </div>
      </form>

      {/* Already have an account? Login link */}
      <div className="text-center mt-4">
        <p className="text-sm text-gray-700">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-blue-600 hover:underline"
          >
            Login here
          </Link>
        </p>
      </div>
    </section>
  );
};

export default Register;
