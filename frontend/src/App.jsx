import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import {
  ResetPassword,
  ForgotPassword,
  Login,
  Register,
  Admin,
  NotFound,
  Home,
  BillingEditStatus,
} from './pages/index';
import { Toaster } from 'react-hot-toast';
import { updateUser } from './features/authSlice';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { UserLayout, PublicLayout, AdminLayout } from './Layouts';
import Dashboard from './pages/Dashboard';
import { AllocationDetails, CreateUser } from './components/index';
import CreateInvoice from './components/CreateInvoice';
import AllocateServiceRequest from './components/AllocateServiceRequest';
import ShowUsers from './components/ShowUsers';
import ServiceRequestDetails from './components/ServiceRequestDetails';
import ManagerLayout from './Layouts/ManagerLayout';
import Manager from './pages/Manager';
import SpcLayout from './Layouts/SpcLayout';
import Spc from './pages/Spc';
import AllRequests from './components/AllRequests';
import StatusDataPage from './pages/StatusDataPage';
import CommonLayout from './Layouts/CommonLayout';
import CompletedTasks from './components/CompletedTasks';
import PdiLayout from './pdi/layouts/PdiLayout';
import PDI_Calls from './pdi/components/PDI_Calls';
import { DashboardContent } from './pdi/components';
import { CallList, EquipmentList, InspectorList } from './pdi/pages';

function App() {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    // dispatch(updateUser());
  }, [user]);

  return (
    <Router>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            padding: '8px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            borderRadius: '4px',
          },
        }}
      />
      <Routes>
        <Route path="/" element={<UserLayout />}>
          <Route index element={<Home />} />
          <Route path="create-service-request" element={<CreateInvoice />} />
          <Route path="user-service-requests" element={<AllRequests />} />
          <Route
            path="/user-service-request/:serviceRequestId"
            element={<ServiceRequestDetails />}
          />
        </Route>
        <Route path="/" element={<PublicLayout />}>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>
        <Route path="/admin" element={<AdminLayout />}>
          {/* <Route index element={<Home />} /> */}
          <Route index element={<Admin />} />
          <Route path="create-user" element={<CreateUser />} />
          <Route path="show-users" element={<ShowUsers />} />
          <Route path="service-requests" element={<AllRequests />} />
        </Route>
        <Route path="/billingManager" element={<ManagerLayout />}>
          <Route index element={<Manager />} />
          <Route path="all-requests" element={<AllRequests />} />
          <Route path="allocation-details" element={<AllocationDetails />} />
          {/* <Route
            path="/service-requests/:user/:serviceRequestId"
            element={<ServiceRequestDetails />}
          /> */}
        </Route>
        <Route path="/" element={<SpcLayout />}>
          <Route path="billingAgent" element={<Spc />} />
        </Route>
        <Route path="/" element={<CommonLayout />}>
          <Route path="/billed" element={<CompletedTasks />} />
          <Route
            path="service-requests/:user/:serviceRequestId"
            element={<ServiceRequestDetails />}
          />
          <Route
            path="/status/:billingProgressStatus"
            element={<StatusDataPage />}
          />
          <Route
            path="/quoteStatus/:quoteStatus"
            element={<StatusDataPage />}
          />
          <Route
            path="/billingEditStatus/:billingEditStatus"
            element={<BillingEditStatus />}
          />

          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password" element={<ResetPassword />} />
        </Route>
        <Route path="/inspector" element={<PdiLayout />}>
          <Route index element={<DashboardContent />} />
          <Route path="inspector-list" element={<InspectorList />} />
          <Route path="equipment-list" element={<EquipmentList />} />
          <Route path="call-list" element={<CallList />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
