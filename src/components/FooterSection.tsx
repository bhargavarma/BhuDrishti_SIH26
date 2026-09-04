import {
  ArrowRight,
  MapPin,
  ShieldCheck,
  GitBranch,
  Mail,
  ExternalLink,
} from 'lucide-react'

function FooterSection({ onDemo = () => undefined, onExplore = () => undefined }: { onDemo?: () => void; onExplore?: () => void }) {
  return (
    <footer className="footer-section">

      {/* FINAL CTA */}

      <div className="final-cta">
        <div className="section-container">

          <div className="final-cta-content">

            <div className="final-cta-label">
              <span />
              THE FUTURE OF LAND RECORDS
              <span />
            </div>

            <h2>
              Turn Legacy Records
              <br />
              Into <span>Trusted Intelligence.</span>
            </h2>

            <p>
              Transform fragmented land records into structured,
              validated and spatially connected digital intelligence.
            </p>

            <div className="final-cta-actions">

              <button className="final-primary-button" onClick={onExplore}>
                Explore Platform
                <ArrowRight size={17} />
              </button>

              <button className="final-secondary-button" onClick={onDemo}>
                View AI Demo
              </button>

            </div>

          </div>

        </div>
      </div>

      {/* FOOTER */}

      <div className="footer-main">
        <div className="section-container">

          <div className="footer-grid">

            {/* BRAND */}

            <div className="footer-brand">

              <div className="footer-brand-link">

                <div className="footer-brand-icon">
                  <MapPin size={20} />
                </div>

                <div>
                  <div className="footer-brand-name">
                    BHU<span>DRISHTI</span>
                  </div>

                  <div className="footer-brand-tagline">
                    AI-POWERED LAND RECORD INTELLIGENCE
                  </div>
                </div>

              </div>

              <p>
                AI-powered intelligence for transforming legacy
                land records into trusted digital information.
              </p>

              <div className="footer-project-badge">
                <ShieldCheck size={14} />
                Built for intelligent governance
              </div>

            </div>

            {/* PLATFORM */}

            <div className="footer-column">

              <h3>Platform</h3>

              <a href="#workflow">
                How It Works
              </a>

              <a href="#features">
                AI & OCR
              </a>

              <a href="#validation">
                Validation
              </a>

              <a href="#gis">
                GIS Intelligence
              </a>

              <a href="#verification">
                Human Verification
              </a>

            </div>

            {/* SOLUTIONS */}

            <div className="footer-column">

              <h3>Solutions</h3>

              <a href="#problem">
                Land Digitization
              </a>

              <a href="#validation">
                Record Validation
              </a>

              <a href="#gis">
                Parcel Intelligence
              </a>

              <a href="#security">
                Governance
              </a>

              <a href="#security">
                Audit Trails
              </a>

            </div>

            {/* CONTACT */}

            <div className="footer-column">

              <h3>Connect</h3>

              <a href="mailto:hello@bhudrishti.ai">
                <Mail size={14} />
                Contact Team
              </a>

              <a href="#platform">
                <ExternalLink size={14} />
                Platform
              </a>

              <a href="#security">
                <ShieldCheck size={14} />
                Security
              </a>

              <a href="https://github.com" target="_blank" rel="noreferrer">
  <GitBranch size={14} />
  GitHub
</a>

            </div>

          </div>

          <div className="footer-bottom">

            <span>
                © 2026 BhuDrishti. All rights reserved.
            </span>

            <div className="footer-bottom-links">
              <a href="#security">
                Privacy
              </a>

              <a href="#security">
                Security
              </a>

              <a href="#security">
                Governance
              </a>
            </div>

          </div>

        </div>
      </div>

    </footer>
  )
}

export default FooterSection