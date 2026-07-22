import { HashRouter, Routes, Route } from 'react-router-dom'
import Nav from './components/Nav'
import Landing from './pages/Landing'
import Seasons from './pages/Seasons'
import Franchises from './pages/Franchises'
import Players from './pages/Players'
import Postseason from './pages/Postseason'
import Leaderboards from './pages/Leaderboards'
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
            <Route path="/postseason" element={<Postseason />} />
            <Route path="/leaderboards" element={<Leaderboards />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  )
}
