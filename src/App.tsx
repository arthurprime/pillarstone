import { useEffect, useState } from 'react'
import { Navigate, Routes, Route } from 'react-router-dom'
import { ToastProvider } from './components/Toast'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { getSiteSettings } from './lib/data'
import HomePage from './pages/HomePage'
import PropertiesPage from './pages/PropertiesPage'
import PropertyDetailPage from './pages/PropertyDetailPage'
import CategoryPage from './pages/CategoryPage'
import DevelopmentsPage from './pages/DevelopmentsPage'
import DevelopmentDetailPage from './pages/DevelopmentDetailPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import FavoritesPage from './pages/FavoritesPage'
import SellPage from './pages/SellPage'
import NotFoundPage from './pages/NotFoundPage'
import AdminPage from './pages/admin/AdminPage'
import AdminProperties from './pages/admin/AdminProperties'
import AdminPropertyEdit from './pages/admin/AdminPropertyEdit'
import AdminDevelopments from './pages/admin/AdminDevelopments'
import AdminAgents from './pages/admin/AdminAgents'
import AdminLocations from './pages/admin/AdminLocations'
import AdminInquiries from './pages/admin/AdminInquiries'
import AdminUsers from './pages/admin/AdminUsers'
import AdminContent from './pages/admin/AdminContent'
import AdminSettings from './pages/admin/AdminSettings'
import AdminSellRequests from './pages/admin/AdminSellRequests'
import AdminLayout from './pages/admin/AdminLayout'

function FooterWrapper() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  useEffect(() => {
    getSiteSettings().then(setSettings).catch(() => {})
  }, [])
  return <Footer settings={settings} />
}

export default function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminPage />} />
          <Route path="properties" element={<AdminProperties />} />
          <Route path="properties/new" element={<AdminPropertyEdit />} />
          <Route path="properties/:id" element={<AdminPropertyEdit />} />
          <Route path="developments" element={<AdminDevelopments />} />
          <Route path="agents" element={<AdminAgents />} />
          <Route path="locations" element={<AdminLocations />} />
          <Route path="inquiries" element={<AdminInquiries />} />
          <Route path="sell-requests" element={<AdminSellRequests />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="content" element={<AdminContent />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        <Route
          path="*"
          element={
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/properties" element={<PropertiesPage />} />
                  <Route path="/property/:slug" element={<PropertyDetailPage />} />
                  <Route path="/buy" element={<CategoryPage listing="sale" title="Properties for Sale" />} />
                  <Route path="/rent" element={<CategoryPage listing="rent" title="Properties for Rent" />} />
                  <Route path="/land" element={<CategoryPage type="land" title="Land for Sale" />} />
                  <Route path="/houses" element={<CategoryPage type="house" title="Houses" />} />
                  <Route path="/villas" element={<CategoryPage type="villa" title="Villas" />} />
                  <Route path="/apartments" element={<CategoryPage type="apartment" title="Apartments" />} />
                  <Route path="/townhouses" element={<CategoryPage type="townhouse" title="Townhouses" />} />
                  <Route path="/commercial" element={<CategoryPage type="commercial" title="Commercial Properties" />} />
                  <Route path="/developments" element={<DevelopmentsPage />} />
                  <Route path="/development/:slug" element={<DevelopmentDetailPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/favorites" element={<FavoritesPage />} />
                  <Route path="/login" element={<Navigate to="/admin" replace />} />
                  <Route path="/register" element={<Navigate to="/" replace />} />
                  <Route path="/profile" element={<Navigate to="/" replace />} />
                  <Route path="/sell" element={<SellPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </main>
              <FooterWrapper />
            </div>
          }
        />
      </Routes>
    </ToastProvider>
  )
}
