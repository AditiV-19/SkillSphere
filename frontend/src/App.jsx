import React from 'react'
import { Routes, Route } from "react-router-dom"

import Home from "./pages/Home"
import Login from "./pages/auth/Login"
import Register from "./pages/auth/Register"
import Dashboard from  "./components/dashboard/DashboardLayout"
import Profile from "./pages/Profile"
import VerifyEmail from "./pages/auth/VerifyEmail"
import ProtectedRoute from './components/ProtectedRoute'
import FreelancerDashboard from './pages/freelancer/FreelancerDashboard'
import ClientDashboard from './pages/client/ClientDashboard' 
import AdminDashboard from './pages/admin/AdminDashboard'

export default function App(){

    return(
        <Routes>

            <Route
                path="/"
                element={<Home/>}
            />
            <Route
                path="/register"
                element={<Register/>}
            />
            <Route
                path="/login"
                element={<Login/>}
            />
            <Route
                path="/dashboard"
                element={
                <ProtectedRoute>
                    <Dashboard/>
                </ProtectedRoute>
                }
            />
            <Route
                path="/profile"
                element={
                <ProtectedRoute>
                    <Profile/>
                </ProtectedRoute>}
            />
            <Route
                path="/verify-email/:token"
                element={<VerifyEmail/>}
            />
            
            <Route
                path="/freelancer/dashboard"
                element={
                    <ProtectedRoute
                allowedRoles={["freelancer"]}
            >
                <FreelancerDashboard />
            </ProtectedRoute>
                }
            />
            <Route
                path="/client/dashboard"
                element={
                    <ProtectedRoute
                        allowedRoles={["client"]}
                    >
                        <ClientDashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/dashboard"
                element={
                    <ProtectedRoute
                        allowedRoles={["admin"]}
                    >
                        <AdminDashboard />
                    </ProtectedRoute>
                }
            />
        </Routes>

    )
}
