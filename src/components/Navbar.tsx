import { ArrowRight, MapPin } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

function Navbar() {
  const navigate = useNavigate()
  return (
    <header className="navbar">
      <div className="navbar-inner">

          <Link to="/dashboard" className="brand">
          <div className="brand-icon">
            <MapPin size={20} strokeWidth={2} />
          </div>

          <div className="brand-text">
            <div className="brand-name">
              BHU<span>DRISHTI</span>
            </div>

            <div className="brand-tagline">
              AI-POWERED LAND RECORD INTELLIGENCE
            </div>
          </div>
          </Link>

        <nav className="nav-links">
          <a href="#problem">Problem</a>
          <a href="#workflow">How It Works</a>
          <a href="#features">Features</a>
          <a href="#gis">GIS</a>
          <a href="#validation">Validation</a>
        </nav>

        <div className="nav-actions">
          <button className="login-button">
            Login
          </button>

          <button className="nav-cta" onClick={() => navigate('/dashboard')}>
            Explore Platform
            <ArrowRight size={17} />
          </button>
        </div>

      </div>
    </header>
  )
}

export default Navbar