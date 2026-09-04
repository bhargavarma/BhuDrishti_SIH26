import { useEffect, useState } from 'react'
import { Download, FileCheck2, Loader2 } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { exportApprovedRecord, getApprovedRecord, getRecordById, type ApprovedRecordResponse } from '../services/api'
import './WorkflowPages.css'
import WorkflowNav from '../components/WorkflowNav'

export default function RecordPage() {
  const { documentId } = useParams<{ documentId: string }>(); const navigate = useNavigate()
  const { recordId } = useParams<{ recordId: string }>()
  const identifier = documentId || recordId
  const [data, setData] = useState<ApprovedRecordResponse | null>(null); const [error, setError] = useState('')
  useEffect(() => { if (!identifier) { setError('Record identifier is missing.'); return }; const request = documentId ? getApprovedRecord(documentId) : getRecordById(identifier); void request.then(setData).catch((e) => setError(e instanceof Error ? e.message : 'Unable to load approved record.')) }, [documentId, identifier])
  async function download() { if (!identifier) return; const payload = await exportApprovedRecord(documentId || (data?.document_id || identifier)); const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `bhudrishti-${identifier}.json`; link.click(); URL.revokeObjectURL(url) }
  if (error) return <main className="workflow-page centered workflow-error">{error}</main>
  if (!data) return <main className="workflow-page centered"><Loader2 className="spin" /> Loading approved record...</main>
  const { record, verification } = data
  const values = [['Owner', record?.owner?.name], ['Father Name', record?.owner?.father_name], ['District', record?.location?.district], ['Mandal', record?.location?.mandal], ['Village', record?.location?.village], ['Survey Number', record?.land?.survey_number], ['Khata Number', record?.land?.khata_number], ['Record Number', record?.land?.record_number], ['Land Area', record?.land?.area], ['Land Type', record?.land?.type]]
  return <main className="workflow-page"><div className="workflow-shell"><WorkflowNav /><header className="workflow-header"><div className="workflow-mark"><FileCheck2 /></div><div><p className="workflow-kicker">APPROVED DIGITAL RECORD</p><h1>Land record verified</h1><p>Human-reviewed data is ready for export and future system integrations.</p></div></header><section className="workflow-card record-card"><div className="record-top"><div><p className="workflow-kicker">VERIFICATION STATUS</p><h2>Approved</h2></div><strong className="score">{verification?.score ?? '—'}%</strong></div><div className="field-grid record-grid">{values.map(([label, value]) => <div className="record-field" key={label}><span>{label}</span><strong>{value || 'Not available'}</strong></div>)}</div><div className="record-meta"><span>Reviewer: {verification?.reviewer || 'Not provided'}</span><span>Document: {data.document_id || identifier}</span><p>{verification?.reviewer_comment || 'No reviewer comment.'}</p></div><div className="review-actions"><button className="secondary-button" onClick={() => navigate('/records')}>View records</button><button className="secondary-button" onClick={() => navigate(`/gis?record=${data.id || data.document_id || identifier}`)}>View on GIS</button><button className="approve-button" onClick={() => void download()}><Download size={16} /> Export JSON</button></div></section></div></main>
}
