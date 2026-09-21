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
import ConstructionPage from './pages/ConstructionPage'
import InteriorPage from './pages/InteriorPage'
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
import AdminServiceProjects from './pages/admin/AdminServiceProjects'
import AdminLayout from './pages/admin/AdminLayout'
import { HERO_IMAGES, PAGE_SEO } from './lib/pageContent'

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
          <Route path="projects" element={<AdminServiceProjects />} />
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
                  <Route path="/buy" element={<CategoryPage listing="sale" title="Houses and land for sale in Kigali" description={PAGE_SEO.buy.description} eyebrow="Buy in Rwanda" image={HERO_IMAGES.buy} seo={PAGE_SEO.buy} />} />
                  <Route path="/rent" element={<CategoryPage listing="rent" title="Houses and apartments for rent in Kigali" description={PAGE_SEO.rent.description} eyebrow="Rent in Kigali" image={HERO_IMAGES.rent} seo={PAGE_SEO.rent} />} />
                  <Route path="/land" element={<CategoryPage type="land" title="Land for sale in Kigali, Rwanda" description={PAGE_SEO.land.description} eyebrow="Land" image={HERO_IMAGES.land} seo={PAGE_SEO.land} />} />
                  <Route path="/houses" element={<CategoryPage type="house" title="Houses for sale and rent in Kigali" description={PAGE_SEO.houses.description} eyebrow="Houses" image={HERO_IMAGES.houses} seo={PAGE_SEO.houses} />} />
                  <Route path="/villas" element={<CategoryPage type="villa" title="Villas for sale in Kigali" description={PAGE_SEO.villas.description} eyebrow="Villas" image={HERO_IMAGES.villas} seo={PAGE_SEO.villas} />} />
                  <Route path="/apartments" element={<CategoryPage type="apartment" title="Apartments for sale and rent in Kigali" description={PAGE_SEO.apartments.description} eyebrow="Apartments" image={HERO_IMAGES.apartments} seo={PAGE_SEO.apartments} />} />
                  <Route path="/townhouses" element={<CategoryPage type="townhouse" title="Townhouses in Kigali" description={PAGE_SEO.townhouses.description} eyebrow="Townhouses" image={HERO_IMAGES.townhouses} seo={PAGE_SEO.townhouses} />} />
                  <Route path="/commercial" element={<CategoryPage type="commercial" title="Commercial property in Kigali" description={PAGE_SEO.commercial.description} eyebrow="Commercial" image={HERO_IMAGES.commercial} seo={PAGE_SEO.commercial} />} />
                  <Route path="/developments" element={<DevelopmentsPage />} />
                  <Route path="/development/:slug" element={<DevelopmentDetailPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/construction" element={<ConstructionPage />} />
                  <Route path="/interiors" element={<InteriorPage />} />
                  <Route path="/interior" element={<Navigate to="/interiors" replace />} />
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
