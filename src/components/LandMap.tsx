import { useEffect } from 'react'
import { MapContainer, Polygon, Popup, TileLayer, useMap } from 'react-leaflet'
import { useNavigate } from 'react-router-dom'
import type { LatLngExpression } from 'leaflet'
import type { GISRecord } from '../services/api'
import 'leaflet/dist/leaflet.css'
import './LandMap.css'

function MapFocus({ records, selectedId }: { records: GISRecord[]; selectedId?: string }) {
  const map = useMap()
  useEffect(() => { const selected = records.find((record) => record.record_id === selectedId) || records[0]; if (selected?.latitude && selected.longitude) map.setView([selected.latitude, selected.longitude], selectedId ? 15 : 11) }, [map, records, selectedId])
  return null
}
function polygonFor(record: GISRecord): LatLngExpression[] { const coordinates = record.parcel_geojson?.coordinates?.[0]; return coordinates ? coordinates.map(([longitude, latitude]) => [latitude, longitude] as [number, number]) : [[(record.latitude || 17.35) - .001, (record.longitude || 78.42) - .001], [(record.latitude || 17.35) + .001, (record.longitude || 78.42) - .001], [(record.latitude || 17.35) + .001, (record.longitude || 78.42) + .001]] }
export default function LandMap({ records, selectedId, onSelect }: { records: GISRecord[]; selectedId?: string; onSelect?: (id: string) => void }) { const navigate = useNavigate(); const center: [number, number] = [records[0]?.latitude || 17.35, records[0]?.longitude || 78.42]; return <MapContainer className="land-map" center={center} zoom={11} scrollWheelZoom><TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" /><MapFocus records={records} selectedId={selectedId} />{records.map((record) => <Polygon key={record.record_id} positions={polygonFor(record)} pathOptions={{ color: record.record_id === selectedId ? '#f59e0b' : '#0f9f91', fillColor: record.record_id === selectedId ? '#fbbf24' : '#14b8a6', fillOpacity: .35, weight: record.record_id === selectedId ? 4 : 2 }} eventHandlers={{ click: () => onSelect?.(record.record_id) }}><Popup><div className="map-popup"><b>LAND RECORD</b><strong>{record.owner || 'Unnamed owner'}</strong><span>Survey: {record.survey_number || '—'}</span><span>{record.village || 'Village unavailable'}, {record.district || 'District unavailable'}</span><span>{record.land_area || 'Area unavailable'} · {record.land_type || 'Land type unavailable'}</span><span>Verification: {record.status || 'unknown'} · {record.validation_score ?? '—'}%</span><small>{record.is_demo_location ? 'Demo GIS location' : 'GIS location available'}</small><button onClick={() => navigate(`/records/${record.record_id}`)}>View Record</button></div></Popup></Polygon>)}</MapContainer> }
