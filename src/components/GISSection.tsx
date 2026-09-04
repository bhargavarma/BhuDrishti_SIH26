import {
  MapPin,
  Layers3,
  Maximize2,
  LocateFixed,
  CheckCircle2,
  Ruler,
  User,
  Hash,
  Navigation,
} from 'lucide-react'

const parcels = [
  {
    id: '142/3A',
    points: '30,16 48,8 67,17 63,39 45,46 28,35',
    className: 'parcel-one',
  },
  {
    id: '142/3B',
    points: '67,17 84,12 94,27 88,46 63,39',
    className: 'parcel-two',
  },
  {
    id: '141/8',
    points: '28,35 45,46 42,67 23,61 15,46',
    className: 'parcel-three',
  },
  {
    id: '143/1',
    points: '45,46 63,39 88,46 78,67 58,73 42,67',
    className: 'parcel-four',
  },
  {
    id: '143/2',
    points: '15,46 23,61 18,82 5,70 6,52',
    className: 'parcel-five',
  },
]

function GISSection() {
  return (
    <section id="gis" className="gis-section">
      <div className="section-container">

        <div className="gis-heading">

          <div className="gis-label">
            <MapPin size={14} />
            SPATIAL LAND INTELLIGENCE
          </div>

          <h2>
            Connect Every Record
            <br />
            <span>to Its Land.</span>
          </h2>

          <p>
            Link extracted land records with cadastral parcels and
            spatial information to create a complete picture of every
            property.
          </p>

        </div>

        <div className="gis-layout">

          {/* MAP */}

          <div className="gis-map-panel">

            <div className="map-toolbar">

              <div className="map-title">
                <Layers3 size={17} />
                Cadastral Map
              </div>

              <div className="map-actions">
                <button aria-label="Locate">
                  <LocateFixed size={15} />
                </button>

                <button aria-label="Fullscreen">
                  <Maximize2 size={15} />
                </button>
              </div>

            </div>

            <div className="map-canvas">

              <div className="map-grid" />

              <div className="map-road road-one" />
              <div className="map-road road-two" />
              <div className="map-road road-three" />

              <div className="map-river" />

              <svg
                className="parcel-map"
                viewBox="0 0 100 90"
                preserveAspectRatio="none"
              >
                {parcels.map((parcel) => (
                  <polygon
                    key={parcel.id}
                    points={parcel.points}
                    className={`map-parcel ${parcel.className}`}
                  />
                ))}
              </svg>

              <div className="parcel-label label-one">
                142/3A
              </div>

              <div className="parcel-label label-two">
                142/3B
              </div>

              <div className="parcel-label label-three">
                141/8
              </div>

              <div className="parcel-label label-four">
                143/1
              </div>

              <div className="selected-parcel">

                <div className="selected-dot">
                  <MapPin size={15} fill="currentColor" />
                </div>

                <div className="selected-tooltip">
                  <strong>142/3A</strong>
                  <span>Selected parcel</span>
                </div>

              </div>

              <div className="map-scale">
                <span />
                <small>100 m</small>
              </div>

              <div className="map-coordinates">
                17.3850° N · 78.4867° E
              </div>

            </div>

            <div className="map-footer">

              <div>
                <span className="legend-dot selected" />
                Selected Parcel
              </div>

              <div>
                <span className="legend-dot verified" />
                Verified Boundary
              </div>

              <div>
                <span className="legend-dot other" />
                Adjacent Parcels
              </div>

            </div>

          </div>

          {/* PARCEL DETAILS */}

          <div className="parcel-panel">

            <div className="parcel-panel-header">

              <div>
                <span className="panel-kicker">
                  SELECTED PARCEL
                </span>

                <h3>
                  Survey No. 142/3A
                </h3>
              </div>

              <div className="parcel-status">
                <CheckCircle2 size={14} />
                Verified
              </div>

            </div>

            <div className="parcel-preview">

              <div className="mini-map-shape" />

              <div className="mini-map-point">
                <MapPin size={13} fill="currentColor" />
              </div>

            </div>

            <div className="parcel-details">

              <div className="parcel-detail">
                <div className="detail-icon">
                  <User size={16} />
                </div>

                <div>
                  <span>OWNER</span>
                  <strong>Ramesh Kumar</strong>
                </div>
              </div>

              <div className="parcel-detail">
                <div className="detail-icon">
                  <Ruler size={16} />
                </div>

                <div>
                  <span>AREA</span>
                  <strong>2.47 Acres</strong>
                </div>
              </div>

              <div className="parcel-detail">
                <div className="detail-icon">
                  <Hash size={16} />
                </div>

                <div>
                  <span>SURVEY NUMBER</span>
                  <strong>142/3A</strong>
                </div>
              </div>

              <div className="parcel-detail">
                <div className="detail-icon">
                  <Navigation size={16} />
                </div>

                <div>
                  <span>CLASSIFICATION</span>
                  <strong>Agricultural</strong>
                </div>
              </div>

            </div>

            <div className="spatial-check">

              <CheckCircle2 size={17} />

              <div>
                <strong>Spatial match confirmed</strong>
                <span>
                  Record boundary aligns with cadastral parcel.
                </span>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  )
}

export default GISSection