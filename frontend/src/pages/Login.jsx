import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { post } from "../services/ApiEndpoint";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "../features/authSlice";

const emailSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
});

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [darkMode, setDarkMode] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const emailForm = useForm({
    resolver: zodResolver(emailSchema),
  });

  const otpForm = useForm({
    resolver: zodResolver(otpSchema),
  });

  useEffect(() => {
    const isDarkMode = localStorage.getItem("isDarkMode") === "true";
    setDarkMode(isDarkMode);
  }, []);

  const handleEmailSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await post("/api/auth/sendOtp", { email: data.email });
      if (response?.status === 200) {
        toast.success(response?.data?.message || "OTP sent to your email.");
        setOtpSent(true);
        setEmail(data.email);
        emailForm.reset();
      } else {
        toast.error(response?.data?.message || "Failed to send OTP.");
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast.error("An error occurred while sending OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (data) => {
    try {
      const response = await post("/api/auth/verifyOtp", {
        email,
        otp: data.otp,
      });
      if (response?.status === 200) {
        dispatch(setUser(response?.data?.existUser));
        toast.success(response?.data?.message || "Login successful.");
        navigate("/");
        otpForm.reset();
      } else {
        toast.error(response?.data?.message || "Invalid OTP.");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast.error("An error occurred while verifying OTP.");
    }
  };

  return (
    <div
      className={`relative min-h-screen flex items-center justify-center bg-cover bg-center ${
        darkMode ? "bg-gray-900 text-gray-200" : "bg-gray-50 text-gray-800"
      }`}
      style={{
        backgroundImage: `url('https://t4.ftcdn.net/jpg/01/19/11/55/360_F_119115529_mEnw3lGpLdlDkfLgRcVSbFRuVl6sMDty.jpg')`,
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-50" />
      <div className="relative z-10 max-w-lg w-full p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-600">Invoice</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            {otpSent
              ? "Enter the OTP sent to your email"
              : "Sign in to access your account"}
          </p>
        </div>

        {!otpSent ? (
          <form
            onSubmit={emailForm.handleSubmit(handleEmailSubmit)}
            className="space-y-6"
          >
            <div>
              <label className="text-sm mb-2 block font-medium">
                Email Address
              </label>
              <input
                {...emailForm.register("email")}
                type="email"
                className={`w-full px-4 py-2 rounded-md shadow-sm outline-none focus:ring-1 transition-all text-gray-800 bg-gray-100 dark:bg-gray-700 dark:text-gray-100 border ${
                  emailForm.formState.errors.email
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
                placeholder="Enter your email"
                // autoComplete="off"
              />
              {emailForm.formState.errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {emailForm.formState.errors.email.message}
                </p>
              )}
            </div>
            <div>
              <button
                type="submit"
                className="w-full py-2 px-6 text-sm font-bold rounded-md outline-none bg-blue-600 text-white hover:bg-blue-700 focus:outline-none shadow-md disabled:opacity-50"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send OTP"}
              </button>
            </div>
          </form>
        ) : (
          <form
            onSubmit={otpForm.handleSubmit(handleOtpSubmit)}
            className="space-y-6"
          >
            <div>
              <label className="text-sm mb-2 block font-medium">OTP</label>
              <input
                {...otpForm.register("otp")}
                type="text"
                className={`w-full px-4 py-2 rounded-md shadow-sm outline-none focus:ring-1 transition-all text-gray-800 bg-gray-100 dark:bg-gray-700 dark:text-gray-100 border ${
                  otpForm.formState.errors.otp
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
                placeholder="Enter OTP"
                autoComplete="off"
              />
              {otpForm.formState.errors.otp && (
                <p className="text-red-500 text-sm mt-1">
                  {otpForm.formState.errors.otp.message}
                </p>
              )}
            </div>
            <div>
              <button
                type="submit"
                className="w-full py-2 px-6 text-sm font-bold rounded-md outline-none bg-blue-600 text-white hover:bg-blue-700 focus:outline-none shadow-md"
              >
                Verify OTP
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
