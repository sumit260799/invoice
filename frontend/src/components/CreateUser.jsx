import React from "react";
import { useForm } from "react-hook-form";
import { post } from "../services/ApiEndpoint";
import axios from "axios";
import { toast } from "react-hot-toast";

const CreateUser = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const onSubmit = async (data) => {
    console.log("hiii");

    console.log("Submitted Data:", data); // Verify data here
    try {
      const response = await axios.post(
        "http://localhost:5000/api/admin/create-user",
        data,
        { method: "POST" }
      );
      toast.success("User created successfully");
      console.log("User created successfully:", response.data);
      reset(); // Reset the form after successful submission
    } catch (error) {
      console.error(
        "Failed to create user:",
        error.response?.data || error.message
      );
    }
  };

  return (
    <div className=" mx-auto  p-6 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-400 shadow-sm rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Employee Form</h2>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div className="mb-4">
          <label
            htmlFor="employeeId"
            className="block text-sm font-semibold mb-2"
          >
            Employee ID
          </label>
          <input
            type="text"
            id="employeeId"
            {...register("employeeId", { required: "Employee ID is required" })}
            className={`border rounded-md p-2 w-full ${
              errors.employeeId ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.employeeId && (
            <p className="text-red-500 text-sm">{errors.employeeId.message}</p>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-semibold mb-2">
            Name
          </label>
          <input
            type="text"
            id="name"
            {...register("name", { required: "Name is required" })}
            className={`border rounded-md p-2 w-full ${
              errors.name ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.name && (
            <p className="text-red-500 text-sm">{errors.name.message}</p>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-semibold mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^\S+@\S+$/i,
                message: "Invalid email format",
              },
            })}
            className={`border rounded-md p-2 w-full ${
              errors.email ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}
        </div>

        <div className="mb-4">
          <label
            htmlFor="password"
            className="block text-sm font-semibold mb-2"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            {...register("password", { required: "Password is required" })}
            className={`border rounded-md p-2 w-full ${
              errors.password ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password.message}</p>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="phone" className="block text-sm font-semibold mb-2">
            Phone
          </label>
          <input
            type="tel"
            id="phone"
            {...register("phone", {
              required: "Phone number is required",
              pattern: {
                value: /^\+?[0-9]{10,15}$/,
                message: "Invalid phone number",
              },
            })}
            className={`border rounded-md p-2 w-full ${
              errors.phone ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.phone && (
            <p className="text-red-500 text-sm">{errors.phone.message}</p>
          )}
        </div>

        <div className="mb-4 ">
          <label htmlFor="role" className="block text-sm font-semibold mb-2">
            Role
          </label>
          <select
            id="role"
            {...register("role", { required: "Role is required" })}
            className={`border rounded-md p-3 w-full ${
              errors.role ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="" disabled>
              Select a role
            </option>

            <option value="manager">Manager</option>
            <option value="spc">Service Co-ordinator</option>
          </select>
          {errors.role && (
            <p className="text-red-500 text-sm">{errors.role.message}</p>
          )}
        </div>

        <button
          type="submit"
          className="col-span-1 md:col-span-2 w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default CreateUser;
