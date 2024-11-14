import React, { useState, useEffect } from "react";
import { get } from "../services/ApiEndpoint";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { toast } from "react-hot-toast";

const StatusChart = () => {
  const [invoices, setInvoices] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [activeDataType, setActiveDataType] = useState("srStatus");

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#FF6666"];

  const fetchInvoices = async () => {
    try {
      const response = await get("/api/user/get-service-request");
      if (response.status === 200) {
        const fetchedInvoices = response.data.serviceRequests || [];
        setInvoices(fetchedInvoices);
        calculateStatusCounts(fetchedInvoices, "srStatus"); // Default initial data type
      } else {
        toast.error("Failed to fetch invoices.");
      }
    } catch (error) {
      toast.error(`Error fetching invoices: ${error.message}`);
    }
  };

  const calculateStatusCounts = (invoices, dataType) => {
    const counts = {};
    invoices.forEach((invoice) => {
      const field = invoice[dataType];
      if (field) {
        counts[field] = (counts[field] || 0) + 1;
      }
    });
    setChartData(
      Object.entries(counts).map(([name, value]) => ({
        name,
        value,
      }))
    );
  };

  const handleCheckboxChange = (e) => {
    const { name } = e.target;
    setActiveDataType(name);
    calculateStatusCounts(invoices, name);
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  return (
    <div className="flex flex-col  py-4">
      {/* Checkbox Section */}
      <div className="flex flex-wrap justify-center mb-4">
        {["srStatus", "quoteStatus", "zone", "industryDiv"].map((type) => (
          <label
            key={type}
            className="mr-4 mb-2 text-gray-800 dark:text-gray-300"
          >
            <input
              type="checkbox"
              name={type}
              checked={activeDataType === type}
              onChange={handleCheckboxChange}
              className="mr-2"
            />
            {type}
          </label>
        ))}
      </div>

      {/* Charts Section */}
      <div className="flex  justify-between flex-col dark:text-gray-300 text-gray-800 md:flex-row">
        <div className="flex flex-col w-full lg:w-1/2 mb-8 lg:mr-8">
          <h2 className="text-lg md:text-xl font-semibold mb-4 text-center">
            Bar Chart for {activeDataType}
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-col w-full lg:w-1/2">
          <h2 className="text-lg md:text-xl font-semibold mb-4 text-center">
            Pie Chart for {activeDataType}
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius="70%"
                fill="#8884d8"
                dataKey="value"
                label
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default StatusChart;
