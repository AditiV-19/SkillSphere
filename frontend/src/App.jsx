import React from 'react'
import { Routes, Route } from "react-router-dom"

import Home from "./pages/Home"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from  "./pages/Dashboard"
import Profile from "./pages/Profile"
import VerifyEmail from "./pages/VerifyEmail"
import ProtectedRoute from './components/ProtectedRoute'

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
        </Routes>

    )
}
