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
        "http://localhost:5000/api/auth/createUser",
        data,
        { method: "POST" }
      );
      toast.success("User created successfully");
      console.log("User created successfully:", response.data);
      reset(); // Reset the form after successful submission
    } catch (error) {
      toast.error(error.response?.data?.message);
    }
  };

  return (
    <div className=" mx-auto  py-6 px-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-400 shadow-sm rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Employee Form</h2>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 justify-between items-center gap-4"
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
            className={`border rounded-md dark:bg-gray-600 dark:text-gray-300 outline-none p-1 w-full ${
              errors.employeeId ? "border-red-500" : "border-gray-300"
            }`}
            autoComplete="off"
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
            className={`border rounded-md dark:bg-gray-600 dark:text-gray-300 outline-none p-1 w-full ${
              errors.name ? "border-red-500" : "border-gray-300"
            }`}
            autoComplete="off"
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
            className={`border rounded-md dark:bg-gray-600 dark:text-gray-300 outline-none p-1 w-full ${
              errors.email ? "border-red-500" : "border-gray-300"
            }`}
            autoComplete="off"
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
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
            className={`border rounded-md dark:bg-gray-600 dark:text-gray-300 outline-none p-1 w-full ${
              errors.phone ? "border-red-500" : "border-gray-300"
            }`}
            autoComplete="off"
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
            className={`border rounded-md dark:bg-gray-600 dark:text-gray-300 outline-none p-[6px] w-full ${
              errors.role ? "border-red-500" : "border-gray-300"
            }`}
            autoComplete="off"
          >
            <option value="" disabled>
              Select a role
            </option>

            <option value="salesUser">Sales User</option>
            <option value="billingManager">Billing Manager</option>
            <option value="billingAgent">Billing Agent</option>
            <option value="C&LManager">C&LManager</option>
            <option value="inspector">Inspector</option>
          </select>
          {errors.role && (
            <p className="text-red-500 text-sm">{errors.role.message}</p>
          )}
        </div>

        <button
          type="submit"
          className="h-10 mt-2  bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default CreateUser;
