import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CheckCircle2, FileCheck2, Loader2, Save, XCircle } from 'lucide-react'
import { createDocumentReview, getDocumentReview, updateDocumentReview, type LandRecordFields, type ReviewResponse } from '../services/api'
import './WorkflowPages.css'
import WorkflowNav from '../components/WorkflowNav'

const labels: Record<keyof LandRecordFields, string> = {
  owner_name: 'Owner Name', father_name: 'Father Name', district: 'District', mandal: 'Mandal', village: 'Village', survey_number: 'Survey Number', khata_number: 'Khata Number', record_number: 'Record Number', land_area: 'Land Area', land_type: 'Land Type',
}

export default function ValidationPage() {
  const { documentId } = useParams<{ documentId: string }>()
  const navigate = useNavigate()
  const [review, setReview] = useState<ReviewResponse['review'] | null>(null)
  const [fields, setFields] = useState<LandRecordFields>({})
  const [reviewer, setReviewer] = useState('')
  const [comment, setComment] = useState('')
  const [status, setStatus] = useState<'pending' | 'approved' | 'rejected'>('pending')
  const [busy, setBusy] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    if (!documentId) return
    const load = async () => {
      try {
        let result: ReviewResponse
        try { result = await getDocumentReview(documentId) } catch { result = await createDocumentReview(documentId) }
        setReview(result.review)
        setFields((result.review.fields as LandRecordFields) || {})
        setReviewer(String(result.review.reviewer || ''))
        setComment(String(result.review.reviewer_comment || ''))
        setStatus((result.review.status as typeof status) || 'pending')
      } catch (loadError) { setError(loadError instanceof Error ? loadError.message : 'Unable to load validation results.') }
      finally { setBusy(false) }
    }
    void load()
  }, [documentId])

  async function save(nextStatus: typeof status) {
    if (!documentId) return
    setBusy(true); setError(''); setNotice('')
    try {
      await updateDocumentReview(documentId, { status: nextStatus, fields, reviewer, comment })
      setStatus(nextStatus)
      setNotice(nextStatus === 'rejected' ? 'Review rejected and saved.' : nextStatus === 'pending' ? 'Draft saved.' : 'Review approved.')
      if (nextStatus === 'approved') navigate(`/record/${documentId}`)
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : 'Unable to save review.') }
    finally { setBusy(false) }
  }

  if (busy && !review) return <main className="workflow-page centered"><Loader2 className="spin" /> Loading validation results...</main>
  return <main className="workflow-page"><div className="workflow-shell"><WorkflowNav />
    <header className="workflow-header"><div className="workflow-mark"><FileCheck2 /></div><div><p className="workflow-kicker">HUMAN VERIFICATION</p><h1>Review Validation Results</h1><p>Confirm extracted values before creating the approved digital record.</p></div></header>
    <div className="workflow-id">Document ID <strong>{documentId}</strong></div>
    {error && <div className="workflow-error">{error}</div>}
    {notice && <div className="workflow-notice" role="status">{notice}</div>}
    <section className="review-layout"><div className="workflow-card"><div className="card-heading"><div><h2>Extracted land record</h2><p>Fields are editable when OCR needs correction.</p></div><span className="integration-tag">External systems: integration-ready</span></div><div className="field-grid">{(Object.keys(labels) as (keyof LandRecordFields)[]).map((field) => <label key={field}>{labels[field]}<input value={fields[field] || ''} onChange={(event) => setFields({ ...fields, [field]: event.target.value })} placeholder="Not extracted" /></label>)}</div></div>
      <aside className="workflow-card review-panel"><h2>Reviewer decision</h2><label>Reviewer name<input value={reviewer} onChange={(event) => setReviewer(event.target.value)} placeholder="Revenue officer" /></label><label>Comment<textarea value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Add verification notes" rows={5} /></label><div className="review-actions"><button className="secondary-button" onClick={() => void save('pending')} disabled={busy}><Save size={16} /> Save draft</button><button className="reject-button" onClick={() => void save('rejected')} disabled={busy}><XCircle size={16} /> Reject</button><button className="approve-button" onClick={() => void save('approved')} disabled={busy}><CheckCircle2 size={16} /> Approve</button></div><p className="review-note">Validation result: {String((review?.validation as { status?: string } | undefined)?.status || 'Review required')}</p></aside></section>
  </div></main>
}
