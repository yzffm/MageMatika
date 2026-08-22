import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import HomePage from './pages/HomePage.jsx'
import PersonalizedHomePage from './pages/PersonalizedHomePage.jsx'
import MapPage from './pages/MapPage.jsx'
import KecamatanPage from './pages/KecamatanPage.jsx'
import LocationPage from './pages/LocationPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<PersonalizedHomePage />} />
        <Route path="/peta" element={<MapPage />} />
        <Route path="/kecamatan/:kecamatanId" element={<KecamatanPage />} />
        <Route path="/lokasi/:locationId" element={<LocationPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
