import { FaPhoneAlt, FaBook, FaHistory } from "react-icons/fa";

const Card = ({ color, icon: Icon, title }) => (
  <div
    className={`flex items-center p-4 rounded-lg border ${color} shadow-md hover:shadow-lg transition-shadow`}
  >
    <Icon className="text-lg text-white mr-3" />
    <span className="text-white font-medium">{title}</span>
  </div>
);

const CallCards = () => (
  <div className="flex gap-4">
    <Card
      color="bg-yellow-400 border-yellow-500 shadow-yellow-300"
      icon={FaPhoneAlt}
      title="All Calls"
    />
    <Card
      color="bg-green-500 border-green-600 shadow-green-300"
      icon={FaBook}
      title="WIP Calls"
    />
    <Card
      color="bg-blue-500 border-blue-600 shadow-blue-300"
      icon={FaHistory}
      title="Call History"
    />
  </div>
);

export default CallCards;
