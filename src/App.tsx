import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import Nav from './components/Nav'
import Landing from './pages/Landing'
import Seasons from './pages/Seasons'
import Franchises from './pages/Franchises'
import Players from './pages/Players'
import Records from './pages/Records'
import About from './pages/About'

export default function App() {
  return (
    <HashRouter>
      <div style={{ minHeight: '100vh', backgroundColor: '#161616' }}>
        <Nav />
        <main>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/seasons" element={<Seasons />} />
            <Route path="/franchises" element={<Franchises />} />
            <Route path="/players" element={<Players />} />
            <Route path="/records" element={<Records />} />
            <Route path="/about" element={<About />} />
            {/* /postseason and /leaderboards merged into /records — keep old links alive */}
            <Route path="/postseason" element={<Navigate to="/records" replace />} />
            <Route path="/leaderboards" element={<Navigate to="/records" replace />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  )
}
