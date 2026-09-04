import './UtilityContent.css'
export default function UtilityHeader({ eyebrow, title }: { eyebrow: string; title: string }) { return <header className="utility-top"><div><p>{eyebrow}</p><h1>{title}</h1></div></header> }
