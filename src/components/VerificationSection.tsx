import {
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  Edit3,
  Clock3,
  ShieldCheck,
  FileText,
  ChevronRight,
} from 'lucide-react'

const verificationFields = [
  {
    label: 'Owner Name',
    value: 'Ramesh Kumar',
    confidence: '98%',
    status: 'verified',
  },
  {
    label: 'Survey Number',
    value: '142/3A',
    confidence: '99%',
    status: 'verified',
  },
  {
    label: 'Plot Area',
    value: '2.47 Acres',
    confidence: '71%',
    status: 'review',
  },
  {
    label: 'Land Classification',
    value: 'Agricultural',
    confidence: '94%',
    status: 'verified',
  },
]

function VerificationSection() {
  return (
    <section id="verification" className="verification-section">
      <div className="section-container">

        <div className="verification-heading">

          <div className="verification-label">
            <UserCheck size={14} />
            HUMAN-ASSISTED VERIFICATION
          </div>

          <h2>
            AI Finds It.
            <br />
            <span>Humans Confirm It.</span>
          </h2>

          <p>
            Low-confidence fields and detected inconsistencies are
            routed to authorized reviewers for fast, transparent
            verification.
          </p>

        </div>

        <div className="verification-workspace">

          {/* DOCUMENT PREVIEW */}

          <div className="verification-document">

            <div className="verification-document-header">

              <div className="verification-file">
                <FileText size={17} />
                LR-10293 · LAND RECORD
              </div>

              <div className="review-status">
                <Clock3 size={13} />
                Pending Review
              </div>

            </div>

            <div className="verification-paper">

              <div className="paper-title">
                LAND OWNERSHIP RECORD
              </div>

              <div className="paper-subtitle">
                Revenue Department · Survey Register
              </div>

              <div className="paper-divider" />

              <div className="paper-info-grid">

                <div>
                  <span>OWNER</span>
                  <strong>Ramesh Kumar</strong>
                </div>

                <div>
                  <span>SURVEY NO.</span>
                  <strong>142/3A</strong>
                </div>

                <div>
                  <span>VILLAGE</span>
                  <strong>Gachibowli</strong>
                </div>

                <div>
                  <span>MANDAL</span>
                  <strong>Serilingampally</strong>
                </div>

              </div>

              <div className="document-text-lines">
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>

              <div className="document-stamp">
                VERIFIED
              </div>

            </div>

            <div className="document-footer">

              <div>
                <ShieldCheck size={14} />
                AI extraction complete
              </div>

              <span>
                4 fields detected
              </span>

            </div>

          </div>

          {/* REVIEW PANEL */}

          <div className="verification-review">

            <div className="review-header">

              <div>
                <span>VERIFICATION QUEUE</span>
                <h3>Review Extracted Fields</h3>
              </div>

              <div className="queue-count">
                1
              </div>

            </div>

            <div className="verification-fields">

              {verificationFields.map((field) => (
                <div
                  className={`verification-field ${
                    field.status === 'review'
                      ? 'verification-field-warning'
                      : ''
                  }`}
                  key={field.label}
                >

                  <div className="verification-field-main">

                    <div className="field-status-icon">

                      {field.status === 'review' ? (
                        <AlertTriangle size={16} />
                      ) : (
                        <CheckCircle2 size={16} />
                      )}

                    </div>

                    <div className="verification-field-content">

                      <span>
                        {field.label}
                      </span>

                      <strong>
                        {field.value}
                      </strong>

                    </div>

                  </div>

                  <div className="verification-confidence">
                    <span>CONFIDENCE</span>
                    <strong>{field.confidence}</strong>
                  </div>

                </div>
              ))}

            </div>

            <div className="review-alert">

              <AlertTriangle size={17} />

              <div>
                <strong>
                  Plot Area requires verification
                </strong>

                <p>
                  AI confidence is below the review threshold.
                  Document and database values differ.
                </p>
              </div>

            </div>

            <div className="review-actions">

              <button className="reject-button">
                <Edit3 size={15} />
                Edit Field
              </button>

              <button className="approve-button">
                <CheckCircle2 size={15} />
                Confirm Record
              </button>

            </div>

          </div>

        </div>

        {/* AUDIT TRAIL */}

        <div className="audit-trail">

          <div className="audit-title">
            <ShieldCheck size={16} />
            <span>TRACEABLE VERIFICATION</span>
          </div>

          <div className="audit-steps">

            <div className="audit-step completed">
              <div className="audit-dot">
                <CheckCircle2 size={13} />
              </div>

              <div>
                <strong>AI Extraction</strong>
                <span>10:42 AM</span>
              </div>
            </div>

            <ChevronRight size={15} />

            <div className="audit-step completed">
              <div className="audit-dot">
                <CheckCircle2 size={13} />
              </div>

              <div>
                <strong>Validation</strong>
                <span>10:43 AM</span>
              </div>
            </div>

            <ChevronRight size={15} />

            <div className="audit-step active">
              <div className="audit-dot">
                <UserCheck size={13} />
              </div>

              <div>
                <strong>Human Review</strong>
                <span>In progress</span>
              </div>
            </div>

            <ChevronRight size={15} />

            <div className="audit-step">
              <div className="audit-dot">
                <CheckCircle2 size={13} />
              </div>

              <div>
                <strong>Final Record</strong>
                <span>Pending</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  )
}

export default VerificationSection