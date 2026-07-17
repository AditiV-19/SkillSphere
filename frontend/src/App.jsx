import React from "react";
import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import VerifyEmail from "./pages/auth/VerifyEmail";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboards from "./pages/Dashboards";
import Profile from "./pages/Profile";
import GigMarketplace from "./pages/GigMarketplace";
import PostProject from "./pages/client/PostProject";
import MyProjects from "./pages/client/MyProjects";
import ProjectDetails from "./pages/client/ProjectDetails";
import BrowseFreelancers from "./pages/client/BrowseFreelancers";
import ViewFreelancerProfile from "./pages/client/ViewFreelancerProfile";
import Invitations from "./pages/freelancer/Invitations";
import GigDetails from "./pages/freelancer/GigDetails";
import FreelancerGigApplications from "./pages/freelancer/FreelancerGigApplications";
import ClientGigApplications from "./pages/client/ClientGigApplications";
import AssignedGigs from "./pages/freelancer/AssignedGigs";
import GigProgress from "./pages/client/GigProgress";
import GigWorkTracker from "./pages/freelancer/GigWorkTracker";
import ActiveContracts from "./pages/client/ActiveContracts";
import Chat from "./pages/Chat";
import NotificationsPage from "./pages/NotificationsPage";
import TransactionHistory from "./pages/TransactionHistory";
import GigApproval from "./pages/admin/GigApproval";
import AnalyticsOverview from "./pages/admin/AnalyticsOverview";
import UserManagement from "./pages/admin/UserManagement";
import PaymentMonitoring from "./pages/admin/PaymentMonitoring";
import FraudDetection from "./pages/admin/FraudDetection";

export default function App() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/verify-email/:token" element={<VerifyEmail />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      />
      <Route
        path="/freelancer/dashboard"
        element={
          <ProtectedRoute allowedRoles={["freelancer"]}>
            <Dashboards />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Dashboards />
          </ProtectedRoute>
        }
      />

      <Route
        path="/client/dashboard"
        element={
          <ProtectedRoute allowedRoles={["client"]}>
            <Dashboards />
          </ProtectedRoute>
        }
      />

      <Route
        path="/freelancer/profile"
        element={
          <ProtectedRoute allowedRoles={["freelancer"]}>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/profile"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/client/profile"
        element={
          <ProtectedRoute allowedRoles={["client"]}>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/client/post-project"
        element={
          <ProtectedRoute allowedRoles={["client"]}>
            <PostProject />
          </ProtectedRoute>
        }
      />
      <Route
        path="/client/projects"
        element={
          <ProtectedRoute allowedRoles={["client"]}>
            <MyProjects />
          </ProtectedRoute>
        }
      />
      <Route
        path="/client/projects/:id"
        element={
          <ProtectedRoute allowedRoles={["client"]}>
            <ProjectDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/client/browse"
        element={
          <ProtectedRoute allowedRoles={["client"]}>
            <BrowseFreelancers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/client/freelancer/:id"
        element={
          <ProtectedRoute allowedRoles={["client"]}>
            <ViewFreelancerProfile />
          </ProtectedRoute>
        }
      />

      <Route path="/client/marketplace" element={<GigMarketplace />} />

      <Route
        path="/freelancer/invitations"
        element={
          <ProtectedRoute allowedRoles={["freelancer"]}>
            <Invitations />
          </ProtectedRoute>
        }
      />
      <Route
        path="/freelancer/gig/:gigId"
        element={
          <ProtectedRoute allowedRoles={["freelancer"]}>
            <GigDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/freelancer/gig/applications"
        element={
          <ProtectedRoute allowedRoles={["freelancer"]}>
            <FreelancerGigApplications />
          </ProtectedRoute>
        }
      />

      <Route
        path="/client/gig/applications"
        element={
          <ProtectedRoute allowedRoles={["client"]}>
            <ClientGigApplications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/client/gigs/:gigId/progress"
        element={
          <ProtectedRoute allowedRoles={["client"]}>
            <GigProgress />
          </ProtectedRoute>
        }
      />
      <Route
        path="/client/assigned-gigs"
        element={
          <ProtectedRoute allowedRoles={["client"]}>
            <ActiveContracts />
          </ProtectedRoute>
        }
      />
      <Route
        path="/freelancer/assigned-gigs"
        element={
          <ProtectedRoute allowedRoles={["freelancer"]}>
            <AssignedGigs />
          </ProtectedRoute>
        }
      />

      <Route
        path="/freelancer/tracker/:gigId"
        element={
          <ProtectedRoute allowedRoles={["freelancer"]}>
            <GigWorkTracker />
          </ProtectedRoute>
        }
      />

      <Route path="/chats" element={<Chat />} />

      <Route path="/chats/:conversationId" element={<Chat />} />

      <Route
        path="/notifications"
        element={
          <ProtectedRoute allowedRoles={["freelancer", "client"]}>
            <NotificationsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <UserManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/gig-approvals"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <GigApproval />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/analytics"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AnalyticsOverview />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/payments"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <PaymentMonitoring />
          </ProtectedRoute>
        }
      />
       <Route
        path="/admin/fraud-flags"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <FraudDetection />
          </ProtectedRoute>
        }
      />

         <Route
        path="/admin/freelancer/:id"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <ViewFreelancerProfile />
          </ProtectedRoute>
        }
      />


      <Route path="/transactions" element={<TransactionHistory />} />

    </Routes>
  );
}
