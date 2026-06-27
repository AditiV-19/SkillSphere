import React from 'react'
import { Routes, Route } from "react-router-dom"

import Home from "./pages/Home"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from  "./pages/Dashboard"
import Profile from "./pages/Profile"
import VerifyEmail from "./pages/VerifyEmail"

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
                element={<Dashboard/>}
            />
            <Route
                path="/profile"
                element={<Profile/>}
            />
            <Route
                path="/verify-email/:token"
                element={<VerifyEmail/>}
            />
        </Routes>

    )
}
