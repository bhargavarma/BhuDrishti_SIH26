import { BarChart3, ClipboardCheck, FilePlus2, FileText, Map, Menu, Settings2, X, Users, Bell, LogOut, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import '../pages/Dashboard.css'

const groups = [
  { title: 'MAIN', items: [['/dashboard', 'Dashboard', BarChart3], ['/records', 'Land Records', FileText], ['/gis', 'GIS Map', Map], ['/upload', 'Upload Record', FilePlus2]] },
  { title: 'VERIFICATION', items: [['/records?queue=validation', 'Validation Queue', ClipboardCheck], ['/officers', 'Officers', Users]] },
  { title: 'SYSTEM', items: [['/notifications', 'Notifications', Bell], ['/settings', 'Settings', Settings2]] },
] as const

export default function DashboardSidebar({ open, onClose, collapsed = false, onToggle = () => undefined }: { open: boolean; onClose: () => void; collapsed?: boolean; onToggle?: () => void }) {
  const navigate = useNavigate()
  function logout() { localStorage.removeItem('bhudrishti-settings'); localStorage.removeItem('bhudrishti-notifications'); navigate('/') }
  return <><div className={`sidebar-overlay ${open ? 'visible' : ''}`} onClick={onClose} /><aside className={`dashboard-sidebar ${open ? 'open' : ''} ${collapsed ? 'collapsed' : ''}`}><div className="sidebar-brand"><Link to="/dashboard"><span>BD</span><div><b>BHU<span>DRISHTI</span></b><small>AI LAND INTELLIGENCE</small></div></Link><button className="sidebar-close" onClick={onClose} aria-label="Close navigation"><X size={18} /></button></div><button className="sidebar-collapse" onClick={onToggle} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>{collapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}</button><nav>{groups.map((group) => <div className="sidebar-group" key={group.title}><small>{group.title}</small>{group.items.map(([to, label, Icon]) => <NavLink key={label} to={to} end={to === '/dashboard' || label === 'Land Records' || label === 'Officers' || label === 'Settings'} onClick={onClose} title={label}><Icon size={17} /><span>{label}</span></NavLink>)}</div>)}</nav><div className="sidebar-bottom"><div className="sidebar-user"><span>RO</span><div><b>Revenue Officer</b><small>Application role</small></div></div><button className="logout-button" onClick={logout}><LogOut size={16} /><span>Logout</span></button></div></aside></>
}
export function MenuButton({ onClick }: { onClick: () => void }) { return <button className="menu-button" onClick={onClick} aria-label="Open navigation"><Menu /></button> }
