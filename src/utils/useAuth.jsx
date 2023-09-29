import React, { useState, useContext, createContext } from 'react'
import UserService from '../services/UserService'
const AuthContext = createContext()

export const useAuth = () => {
  return useContext(AuthContext)
}

const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(UserService.isLoggedIn() || false)
  const state = { auth, setAuth }

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>
}

export default AuthProvider
