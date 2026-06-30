import React from 'react'
import { Routes, Route } from "react-router-dom"

import Home from "./pages/Home"
import Login from "./pages/auth/Login"
import Register from "./pages/auth/Register"
import DashboardLayout from  "./components/dashboard/DashboardLayout"
import FreelancerProfile from "./Profile"
import VerifyEmail from "./pages/auth/VerifyEmail"
import ProtectedRoute from './components/ProtectedRoute'
import Dashboards from './pages/Dashboards'


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
                    <DashboardLayout/>
                </ProtectedRoute>
                }
            />
            <Route
                path="/freelancer/profile"
                element={
                    <ProtectedRoute allowedRoles={["freelancer"]}>
                        <FreelancerProfile />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/verify-email/:token"
                element={<VerifyEmail/>}
            />
            
           <Route path="/freelancer/dashboard" element={
                <ProtectedRoute allowedRoles={["freelancer"]}>
                    <Dashboards />
                </ProtectedRoute>
            } />

            <Route path="/admin/dashboard" element={
                <ProtectedRoute allowedRoles={["admin"]}>
                    <Dashboards />
                </ProtectedRoute>
            } />

            <Route path="/client/dashboard" element={
                <ProtectedRoute allowedRoles={["client"]}>
                    <Dashboards />
                </ProtectedRoute>
            } />


        </Routes>

    )
}
