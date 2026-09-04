import { useEffect, useState } from 'react'
import { CheckCircle2, Pause, Play, RotateCcw, X } from 'lucide-react'
import './AIDemoModal.css'

const stages = [
  ['Document Uploaded', 'A scanned record is securely staged for processing.'],
  ['Preprocessing document', 'Pages are enhanced, denoised and deskewed.'],
  ['OCR extracting text', 'Text and layout are reconstructed page by page.'],
  ['AI field extraction', 'Owner, location and land identifiers are identified.'],
  ['Confidence scoring', 'Low-confidence fields are flagged for review.'],
  ['Multi-tier validation', 'Field, record and cross-system checks are evaluated.'],
  ['Human verification', 'A revenue officer reviews the extracted record.'],
  ['Record approved', 'Verified values are ready as a digital land record.'],
  ['Integration-ready output', 'JSON and GIS/API adapters are ready to connect.'],
] as const

const demoFields = [
  ['Owner', 'Ravi Kumar'], ['Father Name', 'Suresh Kumar'], ['District', 'Demo District'],
  ['Village', 'Example Village'], ['Survey Number', '123/4A'], ['Land Area', '2.50 Acres'],
]

interface AIDemoModalProps { open: boolean; onClose: () => void }

export default function AIDemoModal({ open, onClose }: AIDemoModalProps) {
  const [stage, setStage] = useState(0)
  const [playing, setPlaying] = useState(true)
  useEffect(() => { if (!open) return; setStage(0); setPlaying(true) }, [open])
  useEffect(() => {
    if (!open || !playing || stage >= stages.length - 1) return
    const timer = window.setTimeout(() => setStage((current) => current + 1), 1500)
    return () => window.clearTimeout(timer)
  }, [open, playing, stage])
  if (!open) return null
  const complete = stage === stages.length - 1
  return <div className="demo-backdrop" role="dialog" aria-modal="true" aria-label="BhuDrishti demonstration">
    <section className="demo-modal">
      <div className="demo-modal-header"><div><p>BHUDRISHTI / LIVE SIMULATION</p><h2>From scan to trusted record</h2></div><button className="demo-close" onClick={onClose} aria-label="Close demo"><X /></button></div>
      <div className="demo-progress"><span style={{ width: `${((stage + 1) / stages.length) * 100}%` }} /></div>
      <div className="demo-content"><div className="demo-stages">{stages.map(([title], index) => <div className={`demo-stage ${index === stage ? 'current' : ''} ${index < stage ? 'done' : ''}`} key={title}><span>{index < stage ? <CheckCircle2 size={15} /> : index + 1}</span><b>{title}</b></div>)}</div><div className="demo-result"><div className="demo-status"><span className={complete ? 'status-dot complete' : 'status-dot'} />{complete ? 'Approved digital record' : stages[stage][0]}</div><p>{stages[stage][1]}</p>{stage >= 3 && <div className="demo-fields">{demoFields.slice(0, Math.min(demoFields.length, stage - 2)).map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>}{stage >= 4 && <div className="demo-score"><span>Validation confidence</span><strong>{complete ? '98.4%' : `${88 + stage}.2%`}</strong></div>}</div></div>
      <div className="demo-modal-footer"><span>Stage {stage + 1} of {stages.length}</span><div><button className="demo-control" onClick={() => { setStage(0); setPlaying(true) }}><RotateCcw size={15} /> Restart</button><button className="demo-control primary" onClick={() => setPlaying((current) => !current)}>{playing ? <Pause size={15} /> : <Play size={15} />}{playing ? 'Pause' : 'Play'}</button></div></div>
    </section>
  </div>
}
