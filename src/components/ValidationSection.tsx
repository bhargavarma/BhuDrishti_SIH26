import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  GitCompare,
  MapPin,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'

const validationChecks = [
  {
    label: 'Owner Name',
    document: 'Ramesh Kumar',
    database: 'Ramesh Kumar',
    status: 'match',
  },
  {
    label: 'Survey Number',
    document: '142/3A',
    database: '142/3A',
    status: 'match',
  },
  {
    label: 'Plot Area',
    document: '2.47 Acres',
    database: '2.74 Acres',
    status: 'warning',
  },
  {
    label: 'Land Classification',
    document: 'Agricultural',
    database: 'Agricultural',
    status: 'match',
  },
]

function ValidationSection() {
  return (
    <section id="validation" className="validation-section">
      <div className="section-container">

        <div className="validation-heading">

          <div className="validation-label">
            <Sparkles size={14} />
            AI VALIDATION ENGINE
          </div>

          <h2>
            Don't Just Extract.
            <br />
            <span>Validate.</span>
          </h2>

          <p>
            BhuDrishti cross-checks extracted information against
            business rules, related records and spatial data to surface
            inconsistencies before they become governance problems.
          </p>

        </div>

        <div className="validation-layout">

          {/* LEFT — RECORD COMPARISON */}
          <div className="validation-panel record-panel">

            <div className="panel-header">
              <div className="panel-title">
                <FileText size={18} />
                Record Comparison
              </div>

              <div className="verified-badge">
                <ShieldCheck size={14} />
                AI Checked
              </div>
            </div>

            <div className="comparison-header">
              <div>FIELD</div>
              <div>DOCUMENT</div>
              <div>DATABASE</div>
              <div>STATUS</div>
            </div>

            <div className="comparison-list">
              {validationChecks.map((check) => (
                <div className="comparison-row" key={check.label}>

                  <strong>{check.label}</strong>

                  <span>{check.document}</span>

                  <span
                    className={
                      check.status === 'warning'
                        ? 'value-warning'
                        : ''
                    }
                  >
                    {check.database}
                  </span>

                  <div className="status-cell">
                    {check.status === 'match' ? (
                      <CheckCircle2
                        size={18}
                        className="status-match"
                      />
                    ) : (
                      <AlertTriangle
                        size={18}
                        className="status-warning"
                      />
                    )}
                  </div>

                </div>
              ))}
            </div>

            <div className="mismatch-alert">

              <div className="mismatch-icon">
                <AlertTriangle size={19} />
              </div>

              <div>
                <strong>Potential inconsistency detected</strong>

                <p>
                  Document area differs from the registered database
                  value by 0.27 acres.
                </p>
              </div>

            </div>

          </div>

          {/* RIGHT — INTELLIGENCE */}
          <div className="validation-side">

            <div className="intelligence-card">

              <div className="intelligence-icon">
                <GitCompare size={21} />
              </div>

              <div>
                <span className="card-kicker">
                  CROSS-RECORD ANALYSIS
                </span>

                <h3>
                  Compare connected records
                </h3>

                <p>
                  Detect conflicts between documents, databases,
                  mutations and registration records.
                </p>
              </div>

            </div>

            <div className="intelligence-card">

              <div className="intelligence-icon">
                <MapPin size={21} />
              </div>

              <div>
                <span className="card-kicker">
                  SPATIAL VALIDATION
                </span>

                <h3>
                  Verify against GIS parcels
                </h3>

                <p>
                  Compare extracted land information with cadastral
                  boundaries and spatial records.
                </p>
              </div>

            </div>

            <div className="confidence-card">

              <div className="confidence-top">
                <span>AI CONFIDENCE</span>
                <strong>94.8%</strong>
              </div>

              <div className="confidence-bar">
                <div className="confidence-fill" />
              </div>

              <p>
                High-confidence record · 1 field requires review
              </p>

            </div>

          </div>

        </div>

      </div>
    </section>
  )
}

export default ValidationSection