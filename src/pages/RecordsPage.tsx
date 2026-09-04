import { useEffect, useState } from 'react'
import { FileText, Loader2, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getAllRecords, type ApprovedRecordResponse } from '../services/api'
import WorkflowNav from '../components/WorkflowNav'
import './WorkflowPages.css'

export default function RecordsPage() {
  const navigate = useNavigate()
  const [records, setRecords] = useState<ApprovedRecordResponse[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => { void getAllRecords().then((response) => setRecords(Array.isArray(response.records) ? response.records : [])).catch((requestError) => setError(requestError instanceof Error ? requestError.message : 'Unable to load records.')).finally(() => setLoading(false)) }, [])
  const filteredRecords = records.filter((item) => JSON.stringify(item || {}).toLowerCase().includes(query.toLowerCase()))
  return <main className="workflow-page"><div className="workflow-shell"><WorkflowNav /><header className="workflow-header"><div className="workflow-mark"><FileText /></div><div><p className="workflow-kicker">RECORDS REGISTRY</p><h1>Approved land records</h1><p>Search the verified digital record archive.</p></div></header><div className="records-toolbar"><div className="search-box"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search owner, village, survey number..." /></div><span>{records.length} approved records</span></div>{loading && <div className="centered"><Loader2 className="spin" /> Loading records...</div>}{error && <div className="workflow-error" role="alert">{error}</div>}{!loading && !error && filteredRecords.length === 0 && <section className="workflow-card empty-state">No approved records match your search.</section>}{!loading && !error && <div className="records-list">{filteredRecords.map((item, index) => { const record = item?.record; const owner = record?.owner; const location = record?.location; const land = record?.land; const verification = item?.verification; const recordId = item?.id || item?.document_id || String(index); return <button className="record-row" key={recordId} onClick={() => item?.id && navigate(`/records/${item.id}`)}><div><strong>{owner?.name || 'Unnamed owner'}</strong><span>{owner?.father_name || 'Father name unavailable'} · {location?.district || 'District unavailable'} · {location?.mandal || 'Mandal unavailable'} · {location?.village || 'Village unavailable'}</span><span>Survey {land?.survey_number || '—'} · Khata {land?.khata_number || '—'} · Record {land?.record_number || '—'} · {land?.area || 'Area unavailable'} · {land?.type || 'Land type unavailable'}</span></div><b>{verification?.score ?? '—'}% · {verification?.status || 'Status unavailable'}</b></button> })}</div>}</div></main>
}
