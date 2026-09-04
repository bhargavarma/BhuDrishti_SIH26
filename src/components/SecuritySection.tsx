import {
  ShieldCheck,
  LockKeyhole,
  Users,
  FileClock,
  KeyRound,
  Database,
  CheckCircle2,
  Activity,
  Fingerprint,
} from 'lucide-react'

const securityFeatures = [
  {
    icon: LockKeyhole,
    title: 'Secure Repository',
    description:
      'Protect digitized land records with controlled access and secure storage.',
  },
  {
    icon: Users,
    title: 'Role-Based Access',
    description:
      'Give officials and reviewers access according to their responsibilities.',
  },
  {
    icon: FileClock,
    title: 'Complete Audit Trail',
    description:
      'Track every extraction, validation, edit and verification event.',
  },
  {
    icon: KeyRound,
    title: 'Authenticated APIs',
    description:
      'Keep system integrations protected through authenticated access.',
  },
]

function SecuritySection() {
  return (
    <section id="security" className="security-section">
      <div className="section-container">

        <div className="security-heading">

          <div className="security-label">
            <ShieldCheck size={14} />
            SECURITY · GOVERNANCE · AUDIT
          </div>

          <h2>
            Intelligence You Can
            <br />
            <span>Trust and Trace.</span>
          </h2>

          <p>
            Every action is accountable. BhuDrishti combines
            controlled access, secure records and transparent audit
            trails for responsible land-record digitization.
          </p>

        </div>

        <div className="security-layout">

          {/* SECURITY STATUS PANEL */}

          <div className="security-status-panel">

            <div className="security-panel-header">

              <div className="security-panel-title">
                <ShieldCheck size={18} />
                System Security
              </div>

              <div className="security-online">
                <span />
                ACTIVE
              </div>

            </div>

            <div className="security-score">

              <div className="security-score-ring">
                <div>
                  <strong>98%</strong>
                  <span>SECURE</span>
                </div>
              </div>

              <div className="security-score-info">

                <span className="score-kicker">
                  GOVERNANCE STATUS
                </span>

                <h3>
                  Protection controls active
                </h3>

                <p>
                  Access, records and verification activity are
                  continuously tracked.
                </p>

              </div>

            </div>

            <div className="security-check-list">

              <div>
                <CheckCircle2 size={16} />
                <span>Authenticated access</span>
                <strong>Active</strong>
              </div>

              <div>
                <CheckCircle2 size={16} />
                <span>Role-based permissions</span>
                <strong>Active</strong>
              </div>

              <div>
                <CheckCircle2 size={16} />
                <span>Audit logging</span>
                <strong>Enabled</strong>
              </div>

              <div>
                <CheckCircle2 size={16} />
                <span>Record traceability</span>
                <strong>Enabled</strong>
              </div>

            </div>

          </div>

          {/* FEATURE GRID */}

          <div className="security-feature-grid">

            {securityFeatures.map((feature) => {
              const Icon = feature.icon

              return (
                <div className="security-feature" key={feature.title}>

                  <div className="security-feature-icon">
                    <Icon size={20} />
                  </div>

                  <h3>{feature.title}</h3>

                  <p>{feature.description}</p>

                </div>
              )
            })}

          </div>

        </div>

        {/* AUDIT TIMELINE */}

        <div className="audit-log-panel">

          <div className="audit-log-header">

            <div>
              <span>AUDIT LOG</span>
              <h3>Every important action leaves a trace.</h3>
            </div>

            <div className="audit-live">
              <Activity size={14} />
              LIVE LOG
            </div>

          </div>

          <div className="audit-log-list">

            <div className="audit-log-item">

              <div className="audit-log-icon">
                <Database size={15} />
              </div>

              <div className="audit-log-content">
                <strong>Record uploaded</strong>
                <span>LR-10293 · Document repository</span>
              </div>

              <time>10:42:11</time>

            </div>

            <div className="audit-log-item">

              <div className="audit-log-icon">
                <Fingerprint size={15} />
              </div>

              <div className="audit-log-content">
                <strong>AI extraction completed</strong>
                <span>4 fields extracted · 96.8% average confidence</span>
              </div>

              <time>10:42:38</time>

            </div>

            <div className="audit-log-item">

              <div className="audit-log-icon warning">
                <Activity size={15} />
              </div>

              <div className="audit-log-content">
                <strong>Validation exception detected</strong>
                <span>Plot area mismatch · Review required</span>
              </div>

              <time>10:43:04</time>

            </div>

            <div className="audit-log-item">

              <div className="audit-log-icon">
                <Users size={15} />
              </div>

              <div className="audit-log-content">
                <strong>Human verification requested</strong>
                <span>Assigned to authorized reviewer</span>
              </div>

              <time>10:43:12</time>

            </div>

          </div>

        </div>

      </div>
    </section>
  )
}

export default SecuritySection