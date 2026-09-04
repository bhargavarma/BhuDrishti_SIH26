import {
  Upload,
  Image,
  ScanText,
  Languages,
  Brain,
  Database,
  ShieldCheck,
  GitCompare,
  Map,
  UserCheck,
  BarChart3,
  CheckCircle2,
} from 'lucide-react'

const workflowSteps = [
  {
    number: '01',
    icon: Upload,
    title: 'Document Upload',
    description: 'Upload scanned land records, deeds, registers and supporting documents.',
  },
  {
    number: '02',
    icon: Image,
    title: 'Image Preprocessing',
    description: 'Clean, deskew, enhance and prepare documents for intelligent reading.',
  },
  {
    number: '03',
    icon: ScanText,
    title: 'OCR & Handwriting',
    description: 'Extract printed and handwritten text from legacy documents.',
  },
  {
    number: '04',
    icon: Languages,
    title: 'Language Detection',
    description: 'Identify scripts and process multilingual Indian land records.',
  },
  {
    number: '05',
    icon: Brain,
    title: 'AI Field Extraction',
    description: 'Understand owners, survey numbers, areas, villages and classifications.',
  },
  {
    number: '06',
    icon: Database,
    title: 'Record Structuring',
    description: 'Convert extracted information into structured digital land records.',
  },
  {
    number: '07',
    icon: ShieldCheck,
    title: 'Rule Validation',
    description: 'Apply land-record business rules to detect inconsistencies.',
  },
  {
    number: '08',
    icon: GitCompare,
    title: 'Cross-Record Verification',
    description: 'Compare information across related records and databases.',
  },
  {
    number: '09',
    icon: Map,
    title: 'GIS Verification',
    description: 'Connect records with spatial parcels and cadastral information.',
  },
  {
    number: '10',
    icon: UserCheck,
    title: 'Human Verification',
    description: 'Route uncertain fields to officials for assisted verification.',
  },
  {
    number: '11',
    icon: BarChart3,
    title: 'Confidence Scoring',
    description: 'Generate field-level confidence and prioritize review.',
  },
  {
    number: '12',
    icon: CheckCircle2,
    title: 'Trusted Digital Record',
    description: 'Produce a validated, traceable and spatially connected record.',
  },
]

function WorkflowSection() {
  return (
    <section id="workflow" className="workflow-section">
      <div className="section-container">

        <div className="workflow-heading">
          <div className="workflow-label">
            <span />
            INTELLIGENT PROCESSING PIPELINE
            <span />
          </div>

          <h2>
            From Paper to
            <br />
            <span>Trusted Intelligence.</span>
          </h2>

          <p>
            Every land record passes through multiple layers of AI,
            validation and human-assisted verification.
          </p>
        </div>

        <div className="workflow-grid">
          {workflowSteps.map((step) => {
            const Icon = step.icon

            return (
              <div className="workflow-card" key={step.number}>

                <div className="workflow-card-top">
                  <div className="workflow-number">
                    {step.number}
                  </div>

                  <div className="workflow-icon">
                    <Icon size={20} strokeWidth={2} />
                  </div>
                </div>

                <h3>{step.title}</h3>

                <p>{step.description}</p>

                {step.number !== '12' && (
                  <div className="workflow-connector" />
                )}

              </div>
            )
          })}
        </div>

        <div className="workflow-result">
          <div className="workflow-result-icon">
            <CheckCircle2 size={21} />
          </div>

          <div>
            <strong>One intelligent pipeline.</strong>
            <span>
              Document → Understanding → Validation → Verification → Trusted Record
            </span>
          </div>
        </div>

      </div>
    </section>
  )
}

export default WorkflowSection