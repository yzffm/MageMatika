import { geoMercator, geoPath } from 'd3-geo'
import { useNavigate } from 'react-router-dom'
import { useState, useMemo, useRef, useEffect } from 'react'
import { ChevronLeft, MapPin, Lock } from 'lucide-react'
import { useLocations } from '../hooks/useLocations'
import { useToast } from '../hooks/useToast.jsx'
import geojsonData from '../data/magetan-kecamatan.json'
import './MapPage.css'

export default function MapPage() {
  const { locations, loading } = useLocations()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const svgRef = useRef(null)
  const containerRef = useRef(null)
  const [dimensions, setDimensions] = useState({ width: 380, height: 480 })
  const [hoveredKec, setHoveredKec] = useState(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })

  // Set SVG dimensions based on container width
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const w = Math.min(containerRef.current.offsetWidth - 32, 450)
        setDimensions({ width: w, height: w * 1.25 })
      }
    }
    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  // Derive active kecamatan set from locations data
  const activeKecamatanIds = useMemo(
    () => new Set(locations.map(l => l.kecamatanId)),
    [locations]
  )

  // Build projection and path generator
  const { projection, pathGenerator } = useMemo(() => {
    const proj = geoMercator().fitSize(
      [dimensions.width, dimensions.height],
      geojsonData
    )
    return { projection: proj, pathGenerator: geoPath().projection(proj) }
  }, [dimensions])

  // Group features by kecamatan for label positioning
  const kecamatanCentroids = useMemo(() => {
    const groups = {}
    geojsonData.features.forEach(f => {
      const kec = f.properties.kecamatan
      if (!groups[kec]) groups[kec] = []
      groups[kec].push(f)
    })

    const centroids = {}
    Object.entries(groups).forEach(([kec, features]) => {
      // Calculate centroid from all polygons of this kecamatan
      let totalX = 0, totalY = 0, count = 0
      features.forEach(f => {
        const coords = f.geometry.type === 'MultiPolygon'
          ? f.geometry.coordinates.flat(1)
          : f.geometry.coordinates
        coords.forEach(ring => {
          ring.forEach(([lng, lat]) => {
            const projected = projection([lng, lat])
            if (projected) {
              totalX += projected[0]
              totalY += projected[1]
              count++
            }
          })
        })
      })
      if (count > 0) {
        centroids[kec] = { x: totalX / count, y: totalY / count }
      }
    })
    return centroids
  }, [projection])

  function getKecamatanId(feature) {
    return feature.properties.kecamatan.toLowerCase()
  }

  function handleClick(feature) {
    const kecamatanId = getKecamatanId(feature)
    if (activeKecamatanIds.has(kecamatanId)) {
      navigate(`/kecamatan/${kecamatanId}`)
    } else {
      showToast('🔒 Kecamatan ini segera hadir!')
    }
  }

  function handleMouseMove(e, feature) {
    const kec = feature.properties.kecamatan
    setHoveredKec(kec)
    if (svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect()
      setTooltipPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top - 40
      })
    }
  }

  if (loading) {
    return (
      <div className="page-container map-page">
        <div className="map-loading">
          <div className="map-loading-spinner" />
          <p>Memuat peta...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container map-page" ref={containerRef}>
      {/* Header */}
      <header className="map-header animate-fade-in-up">
        <button className="btn btn-ghost" onClick={() => navigate('/')}>
          <ChevronLeft size={18} /> Kembali
        </button>
        <div>
          <h1 className="map-title">Peta Magetan</h1>
          <p className="map-subtitle">
            Pilih kecamatan untuk memulai eksplorasi
          </p>
        </div>
      </header>

      {/* Legend */}
      <div className="map-legend animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <div className="map-legend-item">
          <span className="map-legend-dot map-legend-dot--active" />
          <span>Aktif ({activeKecamatanIds.size})</span>
        </div>
        <div className="map-legend-item">
          <span className="map-legend-dot map-legend-dot--inactive" />
          <span>Segera Hadir ({18 - activeKecamatanIds.size})</span>
        </div>
      </div>

      {/* Map SVG */}
      <div className="map-container glass-card animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
          className="map-svg"
        >
          {/* Glow filter for active kecamatan */}
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Render all 235 desa polygons */}
          {geojsonData.features.map((feature, i) => {
            const kecId = getKecamatanId(feature)
            const isActive = activeKecamatanIds.has(kecId)
            const isHovered = feature.properties.kecamatan === hoveredKec

            return (
              <path
                key={i}
                d={pathGenerator(feature)}
                fill={isActive
                  ? (isHovered ? 'var(--color-map-active-hover)' : 'var(--color-map-active)')
                  : (isHovered ? 'var(--color-map-inactive-hover)' : 'var(--color-map-inactive)')
                }
                stroke="var(--color-map-stroke)"
                strokeWidth={isHovered ? 1 : 0.5}
                onClick={() => handleClick(feature)}
                onMouseEnter={(e) => handleMouseMove(e, feature)}
                onMouseMove={(e) => handleMouseMove(e, feature)}
                onMouseLeave={() => setHoveredKec(null)}
                onTouchStart={() => {
                  setHoveredKec(feature.properties.kecamatan)
                }}
                className={`map-polygon ${isActive ? 'map-polygon--active' : 'map-polygon--inactive'}`}
                filter={isActive ? 'url(#glow)' : undefined}
              />
            )
          })}

          {/* Kecamatan labels */}
          {Object.entries(kecamatanCentroids).map(([kec, pos]) => {
            const kecId = kec.toLowerCase()
            const isActive = activeKecamatanIds.has(kecId)
            return (
              <text
                key={kec}
                x={pos.x}
                y={pos.y}
                className={`map-label ${isActive ? 'map-label--active' : ''}`}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={dimensions.width < 350 ? 7 : 8}
                pointerEvents="none"
              >
                {kec}
              </text>
            )
          })}
        </svg>

        {/* Hover tooltip */}
        {hoveredKec && (
          <div
            className="map-tooltip"
            style={{ left: tooltipPos.x, top: tooltipPos.y }}
          >
            {activeKecamatanIds.has(hoveredKec.toLowerCase())
              ? <><MapPin size={12} /> {hoveredKec} — Klik untuk jelajah</>
              : <><Lock size={12} /> {hoveredKec} — Segera hadir</>
            }
          </div>
        )}
      </div>
    </div>
  )
}
