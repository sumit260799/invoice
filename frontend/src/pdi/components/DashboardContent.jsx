import CallCards from "./CallCards";
import DataTable from "./DataTable";

const DashboardContent = () => {
  return (
    <main className="p-6 space-y-6">
      <CallCards />
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Example card */}
        <div className="bg-white shadow-md p-4 rounded-lg">
          <h3 className="text-gray-700 font-semibold">Total Balance</h3>
          <p className="text-2xl font-bold text-indigo-700">$12,340.00</p>
        </div>
        <div className="bg-white shadow-md p-4 rounded-lg">
          <h3 className="text-gray-700 font-semibold">Spending</h3>
          <p className="text-2xl font-bold text-red-500">$2,340.00</p>
        </div>
        {/* Add more cards as needed */}
      </section>
      <DataTable />
    </main>
  );
};

export default DashboardContent;
