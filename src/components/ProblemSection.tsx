import {
  ScanText,
  Languages,
  Files,
  TriangleAlert,
  PenLine,
  Link2,
  ArrowDown,
} from 'lucide-react'

const problems = [
  {
    icon: ScanText,
    title: 'Handwritten Records',
    description: 'Decades of paper records in varied handwriting.',
  },
  {
    icon: Languages,
    title: 'Multilingual Documents',
    description: 'Records span 11+ Indian languages and scripts.',
  },
  {
    icon: Files,
    title: 'Poor Document Quality',
    description: 'Faded, skewed and damaged scans.',
  },
  {
    icon: TriangleAlert,
    title: 'Inconsistent Formats',
    description: 'No two districts format records the same way.',
    highlighted: true,
  },
  {
    icon: PenLine,
    title: 'Manual Data Entry',
    description: 'Slow, error-prone transcription by hand.',
  },
  {
    icon: Link2,
    title: 'Disconnected Records',
    description: 'Documents, databases and maps live apart.',
  },
]

function ProblemSection() {
  return (
    <section id="problem" className="problem-section">
      <div className="section-container">

        <div className="section-heading">
          <h2>
            Land Records Were Built for Humans.
            <br />
            <span>Modern Governance Needs Data.</span>
          </h2>
        </div>

        <div className="problem-grid">
          {problems.map((problem) => {
            const Icon = problem.icon

            return (
              <div
                key={problem.title}
                className={`problem-card ${
                  problem.highlighted
                    ? 'problem-card-highlighted'
                    : ''
                }`}
              >
                <div className="problem-icon">
                  <Icon size={21} strokeWidth={2} />
                </div>

                <h3>{problem.title}</h3>

                <p>{problem.description}</p>
              </div>
            )
          })}
        </div>

        <div className="problem-transition">
          <span>Fragmented Records</span>

          <ArrowDown
            size={22}
            strokeWidth={2}
          />

          <strong>Connected Land Intelligence</strong>
        </div>

      </div>
    </section>
  )
}

export default ProblemSection