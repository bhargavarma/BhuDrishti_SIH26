import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  CheckCircle2,
  Circle,
  FileSearch,
  Loader2,
  ShieldCheck,
  Sparkles,
  XCircle,
} from 'lucide-react'

import {
  runOCR,
  extractDocumentFields,
  validateDocument,
  type OCRResponse,
  type ValidationResponse,
} from '../services/api'

import './ProcessingPage.css'
import WorkflowNav from '../components/WorkflowNav'


type StepStatus =
  | 'waiting'
  | 'processing'
  | 'completed'
  | 'failed'


interface PipelineStep {
  id: string
  number: number
  title: string
  description: string
  status: StepStatus
}


function ProcessingPage() {
  const { documentId } = useParams<{
    documentId: string
  }>()

  const navigate = useNavigate()


  // ==================================================
  // Pipeline Steps
  // ==================================================

  const [steps, setSteps] = useState<PipelineStep[]>([
    {
      id: 'preprocess',
      number: 1,
      title: 'Document Preprocessing',
      description:
        'Cleaning, enhancing and deskewing document pages.',
      status: 'completed',
    },
    {
      id: 'ocr',
      number: 2,
      title: 'OCR',
      description:
        'Reading text from the processed document.',
      status: 'processing',
    },
    {
      id: 'extract',
      number: 3,
      title: 'AI Field Extraction',
      description:
        'Identifying structured land-record information.',
      status: 'waiting',
    },
    {
      id: 'validate',
      number: 4,
      title: 'Multi-Tier Validation',
      description:
        'Checking extracted fields for consistency.',
      status: 'waiting',
    },
  ])


  // ==================================================
  // State
  // ==================================================

  const [currentMessage, setCurrentMessage] =
    useState(
      'Reading document using OCR...',
    )

  const [error, setError] =
    useState('')

  const [ocrResult, setOcrResult] =
    useState<OCRResponse | null>(null)

  const [extractionResult, setExtractionResult] =
    useState<ValidationResponse | null>(null)

  const [validationResult, setValidationResult] =
    useState<ValidationResponse | null>(null)

  const [pipelineFinished, setPipelineFinished] =
    useState(false)

  const [retryKey, setRetryKey] = useState(0)


  // ==================================================
  // Update Pipeline Step
  // ==================================================

  function updateStep(
    id: string,
    status: StepStatus,
  ) {
    setSteps((currentSteps) =>
      currentSteps.map((step) =>
        step.id === id
          ? {
              ...step,
              status,
            }
          : step,
      ),
    )
  }


  // ==================================================
  // Run AI Processing Pipeline
  // ==================================================

  useEffect(() => {
    if (!documentId) {
      setError('Processing session not found.')
      return
    }

    // React Router marks params as possibly undefined.
    // This check guarantees that id is a string.
    const id = documentId

    let cancelled = false


    async function processDocument() {
      try {

        // ============================================
        // STEP 2 — OCR
        // ============================================

        updateStep(
          'ocr',
          'processing',
        )

        setCurrentMessage(
          'Reading document using OCR...',
        )

        const ocr =
          await runOCR(id)

        if (cancelled) {
          return
        }

        setOcrResult(ocr)

        updateStep(
          'ocr',
          'completed',
        )


        // ============================================
        // STEP 3 — AI EXTRACTION
        // ============================================

        updateStep(
          'extract',
          'processing',
        )

        setCurrentMessage(
          'Extracting land-record fields...',
        )

        const extraction =
          await extractDocumentFields(id)

        if (cancelled) {
          return
        }

        setExtractionResult(
          extraction,
        )

        updateStep(
          'extract',
          'completed',
        )


        // ============================================
        // STEP 4 — VALIDATION
        // ============================================

        updateStep(
          'validate',
          'processing',
        )

        setCurrentMessage(
          'Running multi-tier validation...',
        )

        const validation =
          await validateDocument(id)

        if (cancelled) {
          return
        }

        setValidationResult(
          validation,
        )

        updateStep(
          'validate',
          'completed',
        )


        // ============================================
        // PIPELINE COMPLETE
        // ============================================

        setCurrentMessage(
          'Document processing completed successfully.',
        )

        setPipelineFinished(true)

      } catch (pipelineError) {

        if (cancelled) {
          return
        }

        const message =
          pipelineError instanceof Error
            ? pipelineError.message
            : 'Document processing failed.'

        setError(message)

        setCurrentMessage(
          'Processing failed.',
        )


        // Mark currently running step as failed.

        setSteps((currentSteps) =>
          currentSteps.map((step) =>
            step.status === 'processing'
              ? {
                  ...step,
                  status: 'failed',
                }
              : step,
          ),
        )
      }
    }


    processDocument()


    return () => {
      cancelled = true
    }

  }, [documentId, retryKey])


  if (!documentId) {
    return <main className="processing-page"><WorkflowNav /><section className="processing-error-page"><XCircle size={28} /><h1>Processing session not found</h1><p>Open a document from Upload Record to begin the AI pipeline.</p><div><button className="continue-button" onClick={() => navigate('/upload')}>Back to Upload</button><button className="continue-button secondary-continue" onClick={() => navigate('/dashboard')}>Dashboard</button></div></section></main>
  }

  // ==================================================
  // Continue to Validation
  // ==================================================

  function handleContinue() {
    if (!documentId) {
      return
    }

    navigate(
      `/validation/${documentId}`,
    )
  }


  // ==================================================
  // Render
  // ==================================================

  return (
    <main className="processing-page">
      <WorkflowNav />
      {!documentId && <div className="processing-error-actions"><p>Return to upload to start a new document.</p><button className="continue-button" onClick={() => navigate('/upload')}>Back to Upload</button></div>}

      {/* ============================================
          HEADER
      ============================================ */}

      <section className="processing-header">

        <div className="processing-logo">
          <Sparkles size={22} />
        </div>

        <div>

          <p className="processing-eyebrow">
            BHUDRISHTI
          </p>

          <h1>
            Processing Land Record
          </h1>

          <p className="processing-subtitle">
            AI is converting your document into a
            structured digital record.
          </p>

        </div>

      </section>


      {/* ============================================
          DOCUMENT ID
      ============================================ */}

      <section className="document-id-card">

        <div className="document-id-icon">
          <FileSearch size={20} />
        </div>

        <div>

          <span>
            DOCUMENT ID
          </span>

          <strong>
            {documentId || 'Unknown'}
          </strong>

        </div>

      </section>


      {/* ============================================
          PIPELINE
      ============================================ */}

      <section className="pipeline-card">

        <div className="pipeline-heading">

          <div>

            <h2>
              AI Processing Pipeline
            </h2>

            <p>
              Each stage runs automatically in sequence.
            </p>

          </div>


          <div className="pipeline-status">

            {pipelineFinished ? (
              <>
                <CheckCircle2 size={18} />
                Complete
              </>
            ) : error ? (
              <>
                <XCircle size={18} />
                Failed
              </>
            ) : (
              <>
                <Loader2
                  size={18}
                  className="spin"
                />
                Processing
              </>
            )}

          </div>

        </div>


        <div className="pipeline-list">

          {steps.map((step) => (

            <div
              key={step.id}
              className={`pipeline-step ${step.status}`}
            >

              {/* Step Icon */}

              <div className="step-number">

                {step.status === 'processing' && (
                  <Loader2
                    size={18}
                    className="spin"
                  />
                )}

                {step.status === 'completed' && (
                  <CheckCircle2 size={19} />
                )}

                {step.status === 'failed' && (
                  <XCircle size={19} />
                )}

                {step.status === 'waiting' && (
                  <Circle size={18} />
                )}

              </div>


              {/* Step Content */}

              <div className="step-content">

                <div className="step-title-row">

                  <h3>
                    {step.number}. {step.title}
                  </h3>

                  <span>

                    {step.status === 'processing'
                      ? 'Running'
                      : step.status === 'completed'
                        ? 'Completed'
                        : step.status === 'failed'
                          ? 'Failed'
                          : 'Waiting'}

                  </span>

                </div>

                <p>
                  {step.description}
                </p>

              </div>

            </div>

          ))}

        </div>

      </section>


      {/* ============================================
          LIVE STATUS
      ============================================ */}

      <section className="live-status-card">

        <div className="live-status-icon">

          {error ? (
            <XCircle size={21} />
          ) : pipelineFinished ? (
            <ShieldCheck size={21} />
          ) : (
            <Loader2
              size={21}
              className="spin"
            />
          )}

        </div>


        <div>

          <strong>

            {error
              ? 'Processing Error'
              : pipelineFinished
                ? 'Pipeline Complete'
                : 'AI Processing'}

          </strong>

          <p>
            {error || currentMessage}
          </p>

        </div>

      </section>


      {/* ============================================
          RESULTS SUMMARY
      ============================================ */}

      {pipelineFinished && (

        <section className="results-grid">

          {/* OCR */}

          <div className="result-card">

            <span>
              OCR PAGES
            </span>

            <strong>
              {ocrResult?.pages.length ?? 0}
            </strong>

          </div>


          {/* Extraction */}

          <div className="result-card">

            <span>
              EXTRACTED FIELDS
            </span>

            <strong>

              {extractionResult
                ? Object.values(
                    extractionResult.fields,
                  ).filter(Boolean).length
                : 0}

            </strong>

          </div>


          {/* Validation */}

          <div className="result-card">

            <span>
              VALIDATION SCORE
            </span>

            <strong>

              {typeof validationResult
                ?.validation
                ?.overall_score === 'number'
                ? `${validationResult.validation.overall_score}%`
                : '—'}

            </strong>

          </div>

        </section>
      )}

      {error && !pipelineFinished && <div className="processing-error-actions"><button className="continue-button" onClick={() => { setError(''); setRetryKey((key) => key + 1) }}>Retry OCR</button><button className="continue-button secondary-continue" onClick={() => navigate('/upload')}>Back to Upload</button></div>}

      {pipelineFinished && ocrResult && (
        <section className="ocr-preview-card">
          <div>
            <span>OCR TEXT PREVIEW</span>
            <strong>{ocrResult.pages[0]?.confidence ?? 0}% page confidence</strong>
          </div>
          <p>{ocrResult.pages[0]?.text || 'No readable text was found in the document.'}</p>
        </section>
      )}


      {/* ============================================
          CONTINUE
      ============================================ */}

      {pipelineFinished && (

        <button
          className="continue-button"
          onClick={handleContinue}
        >
          Review Validation Results

          <ShieldCheck size={19} />
        </button>

      )}

    </main>
  )
}


export default ProcessingPage