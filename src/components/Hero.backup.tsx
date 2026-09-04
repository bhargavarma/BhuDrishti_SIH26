import {
  ArrowRight,
  Play,
  Sparkles,
} from 'lucide-react'

function Hero() {
  return (
    <section className="hero">

      <div className="hero-grid">

        {/* LEFT SIDE */}
        <div className="hero-content">

          <div className="hero-badge">
            <Sparkles size={15} />
            AI-POWERED LAND RECORD INTELLIGENCE
          </div>

          <h1 className="hero-title">
            From Legacy Land
            <br />
            Records
            <br />
            to
            <br />
            <span>Trusted Digital</span>
            <br />
            <span>Intelligence</span>
          </h1>

          <div className="hero-line" />

          <p className="hero-description">
            BhuDrishti transforms scanned, handwritten and
            multilingual land records into structured, validated
            and spatially connected digital records.
          </p>

          <div className="hero-buttons">

            <button className="primary-button">
              Explore Platform
              <ArrowRight size={18} />
            </button>

            <button className="secondary-button">
              <Play size={16} />
              Watch AI Demo
            </button>

          </div>

        </div>

        {/* RIGHT SIDE */}
        <div className="hero-demo">

          <div className="terminal">

            <div className="terminal-header">

              <div className="terminal-dots">
                <span />
                <span />
                <span />
              </div>

              <span className="terminal-address">
                bhudrishti://process/LR-10293
              </span>

            </div>

            <div className="terminal-body">

              <div className="document-preview">

                <div className="document-lines">
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                </div>

                <div className="document-mark">
                  —
                </div>

              </div>

              <div className="process-list">

                <div className="process-item active">
                  <span>1</span>
                  Document Uploaded
                </div>

                <div className="process-item">
                  <span>2</span>
                  AI Reading Document
                </div>

                <div className="process-item">
                  <span>3</span>
                  Extracting Land Information
                </div>

                <div className="process-item">
                  <span>4</span>
                  Validating Records
                </div>

                <div className="process-item">
                  <span>5</span>
                  Checking GIS
                </div>

                <div className="process-item">
                  <span>6</span>
                  Ready for Verification
                </div>

              </div>

              <button className="run-demo-button">
                <Play size={15} fill="currentColor" />
                Run Demo
              </button>

            </div>

          </div>

        </div>

      </div>

    </section>
  )
}

export default Hero