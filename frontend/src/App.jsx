import React from 'react'
import { Routes, Route } from "react-router-dom"

import Home from "./pages/Home"
import Login from "./pages/auth/Login"
import Register from "./pages/auth/Register"
import DashboardLayout from  "./components/dashboard/DashboardLayout"
import VerifyEmail from "./pages/auth/VerifyEmail"
import ProtectedRoute from './components/ProtectedRoute'
import Dashboards from './pages/Dashboards'
import Profile from "./pages/Profile"
import GigMarketplace from './pages/GigMarketplace'
import PostProject from './pages/client/PostProject'

export default function App(){

    const user = JSON.parse(localStorage.getItem("user"));

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
                path="/verify-email/:token"
                element={<VerifyEmail/>}
            />


            <Route
                path="/dashboard"
                element={
                <ProtectedRoute>
                    <DashboardLayout/>
                </ProtectedRoute>
                }
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



            <Route path="/freelancer/profile" element={
                <ProtectedRoute allowedRoles={["freelancer"]}>
                    <Profile />
                </ProtectedRoute>
            } />

            <Route path="/admin/profile" element={
                <ProtectedRoute allowedRoles={["admin"]}>
                    <Profile />
                </ProtectedRoute>
            } />

            <Route path="/client/profile" element={
                <ProtectedRoute allowedRoles={["client"]}>
                    <Profile />
                </ProtectedRoute>
            } />

            <Route path="/client/post-project" element={
                <ProtectedRoute allowedRoles={["client"]}>
                    <PostProject />
                </ProtectedRoute>
            } />
           
            <Route path="/client/marketplace" element={
                <GigMarketplace />
            } />
            
           


        </Routes>

    )
}
