import React, { lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

// Lazy load components
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Strategies = lazy(() => import('./pages/Strategies'))
const Users = lazy(() => import('./pages/Users'))
const CreateStrategy = lazy(() => import('./pages/CreateStrategy'))
const Strategy = lazy(() => import('./pages/Strategy'))
const PerformanceDashboard = lazy(() => import('./pages/PerformanceDashboard'))
const NoMatch = lazy(() => import('./pages/NoMatch'))
const Layout = lazy(() => import('./pages/Layout'))
const CreateExchangeAccount = lazy(() =>
  import('./pages/CreateExchangeAccount')
)
const Exchanges = lazy(() => import('./pages/Exchanges'))
const Cachers = lazy(() => import('./pages/Cachers'))
const RegisterCacher = lazy(() => import('./pages/RegisterCacher'))
const Exchange = lazy(() => import('./pages/Exchange'))
const User = lazy(() => import('./pages/User'))
const CreateCategory = lazy(() => import('./pages/CreateCategory'))
const MarketIndicators = lazy(() => import('./pages/MarketIndicators'))

const App = () => {
  return (
    <div className="App font-inter">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="strategies">
              <Route index element={<Strategies />} />
              <Route path="create" element={<CreateStrategy />} />
              <Route path=":strategyId" element={<Strategy />} />
            </Route>
            <Route path="performance-metrics-dashboard">
              <Route index element={<PerformanceDashboard />} />
            </Route>
            <Route path="market-indicators">
              <Route index element={<MarketIndicators />} />
            </Route>
            <Route path="users">
              <Route index element={<Users />} />
              <Route path="create-category" element={<CreateCategory />} />
              <Route path=":userId" element={<User />} />
            </Route>
            <Route path="exchanges">
              <Route index element={<Exchanges />} />
              <Route path="create" element={<CreateExchangeAccount />} />
              <Route path=":exchangeId" element={<Exchange />} />
            </Route>
            <Route path="cachers">
              <Route index element={<Cachers />} />
              <Route path="create" element={<RegisterCacher />} />
            </Route>
            <Route path="*" element={<NoMatch />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
