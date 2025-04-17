import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "../../components/Dashboard";
import ChatbotToggler from "../../components/ChatbotToggler";
import MainLayout from "../../components/MainLayout";
import HelpPage from "../../pages/HelpPage";
import NotFound from "../../pages/NotFound";
import LandingPage from "../../pages/LandingPage";
import SignUp from "../../pages/SignUp";
import Login from "../../pages/Login";
import ForgotPassword from "../../pages/ForgotPassword";
import UserManager from "../../components/UserManager";
import NewUser from "../../pages/NewUser";
import AdminboardLayout from "../../pages/AdminBoardLayout";
import ExistingUser from "../../pages/ExistingUser";
import ResetPassword from "../../pages/ResetPassword";
import DeletedUsers from "../../pages/DeletedUsers";
import UserLogs from "../../pages/UserLogs";
import UserSession from "../../pages/UserSession";
import UpdateUser from "../../pages/UpdateUser";
import { useUserContext } from "../../context/UserContext";
import { allowedRoles } from "../../utils/constants";
import LoadingPage from "../../pages/LoadingPage";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />; // Redirect to login if no token
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  if (token) {
    return <Navigate to="/dashboard" replace />; // Redirect to dashboard if token exists
  }

  return children;
};

const AdminRoute = ({ children }) => {
  const { profile, profileFetching } = useUserContext();

  const token = localStorage.getItem("token");

  if (!profile && profileFetching) return <LoadingPage />; // Prevent rendering while fetching profile

  if (!token || !profile || (profile && Object.keys(profile).length === 0))
    return <Navigate to="/login" replace />; // Redirect to login if no token or profile

  if (!allowedRoles.includes(profile.roleName)) {
    return <Navigate to="/dashboard" replace />; // Redirect to dashboard if not an admin
  }

  return children;
};

export const CustomRouter = () => {
  return (
    <BrowserRouter>
      <ChatbotToggler />
      <UserManager>
        <Routes>
          {/* MainLayout wraps all routes */}
          <Route path="/" element={<MainLayout />}>
            {/* Public pages */}
            <Route
              index
              element={
                <PublicRoute>
                  <LandingPage />
                </PublicRoute>
              }
            />
            <Route
              path="signup"
              element={
                <PublicRoute>
                  <SignUp />
                </PublicRoute>
              }
            />
            <Route
              path="login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="forgotPassword"
              element={
                <PublicRoute>
                  <ForgotPassword />
                </PublicRoute>
              }
            />

            {/* Protected pages */}
            <Route
              path="dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/adminboard"
              element={
                <AdminRoute>
                  <AdminboardLayout />
                </AdminRoute>
              }
            >
              <Route path="newUser" element={<NewUser />} />
              <Route path="existingUser" element={<ExistingUser />} />
              <Route path="updateUser/:id" element={<UpdateUser />} />
              <Route path="resetPassword" element={<ResetPassword />} />
              <Route path="deletedUsers" element={<DeletedUsers />} />
              <Route path="userLogs" element={<UserLogs />} />
              <Route path="liveSession" element={<UserSession />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </UserManager>
    </BrowserRouter>
  );
};

export default CustomRouter;
