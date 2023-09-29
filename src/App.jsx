import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import {
  Dashboard,
  Strategies,
  Users,
  CreateStrategy,
  Strategy,
  NoMatch,
  Layout,
  CreateExchangeAccount,
  Exchanges,
  Cachers,
  RegisterCacher,
  Exchange,
  User,
} from './pages'
import UserService from './services/UserService'
import useAuth from './utils/useAuth'

const App = () => {
  return (
    <div className="App font-inter">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="strategies">
              <Route index element={<Strategies />} />
              {UserService.hasRole(['trader']) && (
                <Route path="create" element={<CreateStrategy />} />
              )}
              <Route path=":strategyId" element={<Strategy />} />
            </Route>
            {UserService.hasRole(['admin']) && (
              <Route path="users">
                <Route index element={<Users />} />
                <Route path=":userId" element={<User />} />
              </Route>
            )}
            <Route path="exchanges">
              <Route index element={<Exchanges />} />
              {UserService.hasRole(['trader']) && (
                <Route path="create" element={<CreateExchangeAccount />} />
              )}
              <Route path=":exchangeId" element={<Exchange />} />
            </Route>
            <Route path="cachers">
              <Route index element={<Cachers />} />
              {UserService.hasRole(['trader']) && (
                <Route path="create" element={<RegisterCacher />} />
              )}
              {/* <Route path=":strategyId" element={<Cachers />} /> */}
            </Route>
            <Route path="*" element={<NoMatch />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
