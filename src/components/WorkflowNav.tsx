import { ArrowLeft, Home } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import './WorkflowNav.css'

export default function WorkflowNav() {
  const navigate = useNavigate()
  return <nav className="workflow-nav"><button onClick={() => navigate(-1)}><ArrowLeft size={15} /> Back</button><Link to="/dashboard"><Home size={15} /> Home</Link></nav>
}
