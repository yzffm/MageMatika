import {
  geoMercator,
  geoPath,
  geoCentroid,
} from 'd3-geo'

import { useNavigate } from 'react-router-dom'
import {
  useState,
  useMemo,
  useRef,
  useEffect,
  useCallback,
} from 'react'
import {
  ChevronLeft,
  MapPin,
  Lock,
  Plus,
  Minus,
  Locate,
  ArrowRight,
  X,
} from 'lucide-react'

import { useCulturalObjects } from '../hooks/useContent.js'
import { useToast } from '../hooks/useToast.jsx'
import geojsonData from '../data/magetan-kecamatan.json'
import BottomNav from '../components/BottomNav.jsx'

import './MapPage.css'


/**
 * Normalize nama kecamatan supaya konsisten.
 *
 * Contoh:
 * "Takeran" -> "takeran"
 * "Maospati" -> "maospati"
 */
function normalizeKecamatanId(name) {
  return String(name || '')
    .trim()
    .toLowerCase()
}


/**
 * Fix arah winding ring supaya sesuai dengan yang diharapkan d3-geo.
 *
 * PENYEBAB BUG PETA:
 * GeoJSON dari penyedia menggunakan winding order lama/legacy
 * (exterior ring CCW pada bidang lng/lat). d3-geo (geoPath, geoCentroid, dll)
 * mengharapkan arah sebaliknya (right-hand rule versi d3). Kalau kebalik,
 * setiap polygon dibaca sebagai "seluruh bola dunia MINUS area ini",
 * sehingga path/bounds yang dihasilkan meledak jadi nilai raksasa
 * dan yang ke-render cuma outline tipis sisa kliping di tepi SVG.
 *
 * Reverse urutan titik tiap ring (exterior maupun hole) supaya arahnya
 * konsisten dengan yang dibutuhkan d3-geo, tanpa perlu tahu ring mana
 * yang exterior/hole (reverse seragam tetap menjaga orientasi relatif
 * antar ring).
 */
function fixRingWinding(polygonCoordinates) {
  return polygonCoordinates.map((ring) => [...ring].reverse())
}

/**
 * Menggabungkan semua desa menjadi 1 MultiPolygon
 * untuk setiap kecamatan.
 *
 * GeoJSON source kita berisi banyak polygon desa.
 * UI sebenarnya membutuhkan 18 kecamatan.
 */
function buildKecamatanFeatures(data) {
  const groups = new Map()

  for (const feature of data.features || []) {
    const kecamatan = feature?.properties?.kecamatan

    if (!kecamatan || !feature.geometry) {
      continue
    }

    const id = normalizeKecamatanId(kecamatan)

    if (!groups.has(id)) {
      groups.set(id, {
        id,
        name: kecamatan,
        kode: feature.properties?.kode_kec || null,
        polygons: [],
        edges: new Map(),
      })
    }

    const group = groups.get(id)
    const geometry = feature.geometry

    const polygons =
      geometry.type === 'Polygon'
        ? [geometry.coordinates]
        : geometry.type === 'MultiPolygon'
          ? geometry.coordinates
          : []

    for (const polygon of polygons) {
      group.polygons.push(fixRingWinding(polygon))

      // Hitung sisi (edge) tiap ring. Sisi yang dipakai 2 desa
      // (batas internal) akan muncul >1x dan dibuang dari outline.
      for (const ring of polygon) {
        for (let i = 0; i < ring.length - 1; i++) {
          const a = ring[i]
          const b = ring[i + 1]
          const ka = a.join(',')
          const kb = b.join(',')
          const key = ka < kb ? `${ka}|${kb}` : `${kb}|${ka}`
          const entry = group.edges.get(key)
          if (entry) entry.count += 1
          else group.edges.set(key, { a, b, count: 1 })
        }
      }
    }
  }

  return Array.from(groups.values()).map((group) => {
    const outline = []
    for (const edge of group.edges.values()) {
      if (edge.count === 1) outline.push([edge.a, edge.b])
    }

    return {
      type: 'Feature',
      properties: {
        kecamatan: group.name,
        kecamatanId: group.id,
        kode_kec: group.kode,
        // Batas luar kecamatan saja (tanpa batas antar-desa)
        outline: { type: 'MultiLineString', coordinates: outline },
      },
      geometry: {
        type: 'MultiPolygon',
        coordinates: group.polygons,
      },
    }
  })
}


/* ===================================================================
   Zoom / Pan constants
   =================================================================== */
const MIN_ZOOM = 0.8
const MAX_ZOOM = 5
const ZOOM_STEP = 0.3


export default function MapPage() {
  const { culturalObjects, loading } = useCulturalObjects()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const viewportRef = useRef(null)

  /* ---------------------------------------------------------------
     Selection state
     --------------------------------------------------------------- */
  const [selectedKec, setSelectedKec] = useState(null)
  const [hoveredKec, setHoveredKec] = useState(null)

  /* ---------------------------------------------------------------
     Pan / Zoom state
     --------------------------------------------------------------- */
  const [transform, setTransform] = useState({
    x: 0,
    y: 0,
    scale: 1,
  })

  // Track dragging
  const dragState = useRef({
    dragging: false,
    startX: 0,
    startY: 0,
    startTx: 0,
    startTy: 0,
    moved: false,
  })

  // Track pinch
  const pinchState = useRef({
    active: false,
    initialDistance: 0,
    initialScale: 1,
    initialMidX: 0,
    initialMidY: 0,
    initialTx: 0,
    initialTy: 0,
  })

  /* ---------------------------------------------------------------
     Viewport dimensions
     --------------------------------------------------------------- */
  const [viewportSize, setViewportSize] = useState({
    width: 400,
    height: 600,
  })

  useEffect(() => {
    const updateSize = () => {
      if (!viewportRef.current) return
      setViewportSize({
        width: viewportRef.current.clientWidth,
        height: viewportRef.current.clientHeight,
      })
    }

    updateSize()

    const observer = new ResizeObserver(updateSize)
    if (viewportRef.current) {
      observer.observe(viewportRef.current)
    }

    return () => observer.disconnect()
  }, [])


  /* ---------------------------------------------------------------
     Active kecamatan (ones that have cultural objects)
     --------------------------------------------------------------- */
  const activeKecamatanIds = useMemo(() => {
    return new Set(
      culturalObjects
        .map((obj) =>
          normalizeKecamatanId(obj.kecamatanId)
        )
        .filter(Boolean)
    )
  }, [culturalObjects])

  /* Count cultural objects per kecamatan */
  const objectCountByKec = useMemo(() => {
    const counts = {}
    for (const obj of culturalObjects) {
      const id = normalizeKecamatanId(obj.kecamatanId)
      if (id) {
        counts[id] = (counts[id] || 0) + 1
      }
    }
    return counts
  }, [culturalObjects])


  /* ---------------------------------------------------------------
     Convert 235 desa -> 18 kecamatan
     --------------------------------------------------------------- */
  const kecamatanFeatures = useMemo(() => {
    return buildKecamatanFeatures(geojsonData)
  }, [])


  /* ---------------------------------------------------------------
     Build projection — fits all kecamatan into viewport
     --------------------------------------------------------------- */
  const { projection, pathGenerator } = useMemo(() => {
    const padding = 32
    const width = viewportSize.width
    const height = viewportSize.height

    // Manual bounding box
    let minLng = Infinity
    let maxLng = -Infinity
    let minLat = Infinity
    let maxLat = -Infinity

    function walkCoordinates(coordinates) {
      if (!Array.isArray(coordinates)) return
      if (
        coordinates.length >= 2 &&
        typeof coordinates[0] === 'number' &&
        typeof coordinates[1] === 'number'
      ) {
        minLng = Math.min(minLng, coordinates[0])
        maxLng = Math.max(maxLng, coordinates[0])
        minLat = Math.min(minLat, coordinates[1])
        maxLat = Math.max(maxLat, coordinates[1])
        return
      }
      for (const child of coordinates) {
        walkCoordinates(child)
      }
    }

    for (const feature of kecamatanFeatures) {
      walkCoordinates(feature.geometry?.coordinates)
    }

    if (
      !Number.isFinite(minLng) ||
      !Number.isFinite(maxLng) ||
      !Number.isFinite(minLat) ||
      !Number.isFinite(maxLat)
    ) {
      return {
        projection: geoMercator(),
        pathGenerator: geoPath(),
      }
    }

    const centerLng = (minLng + maxLng) / 2
    const centerLat = (minLat + maxLat) / 2

    const projection = geoMercator()
      .center([centerLng, centerLat])
      .translate([width / 2, height / 2])

    // Compute scale
    projection.scale(1)

    const projTL = projection([minLng, maxLat])
    const projTR = projection([maxLng, maxLat])
    const projBL = projection([minLng, minLat])

    const projectedWidth = Math.abs(projTR[0] - projTL[0])
    const projectedHeight = Math.abs(projBL[1] - projTL[1])

    const availW = width - padding * 2
    const availH = height - padding * 2

    const scale = Math.min(
      availW / projectedWidth,
      availH / projectedHeight
    )

    projection.scale(scale)
    projection.translate([width / 2, height / 2])

    const pathGenerator = geoPath().projection(projection)

    return { projection, pathGenerator }
  }, [viewportSize.width, viewportSize.height, kecamatanFeatures])


  /* ---------------------------------------------------------------
     Centroids for labels
     --------------------------------------------------------------- */
  const kecamatanCentroids = useMemo(() => {
    const result = {}

    for (const feature of kecamatanFeatures) {
      const centroid = geoCentroid(feature)
      if (!centroid || !Number.isFinite(centroid[0])) continue
      const projected = projection(centroid)
      if (!projected) continue

      result[feature.properties.kecamatanId] = {
        x: projected[0],
        y: projected[1],
        name: feature.properties.kecamatan,
      }
    }

    return result
  }, [kecamatanFeatures, projection])


  /* ---------------------------------------------------------------
     Zoom helpers
     --------------------------------------------------------------- */
  const clampTransform = useCallback((tx, ty, s) => {
    const clampedScale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, s))
    // Allow some pan room beyond edges
    const maxPan = 200 * clampedScale
    return {
      x: Math.max(-maxPan, Math.min(maxPan, tx)),
      y: Math.max(-maxPan, Math.min(maxPan, ty)),
      scale: clampedScale,
    }
  }, [])

  const zoomIn = useCallback(() => {
    setTransform((prev) =>
      clampTransform(prev.x, prev.y, prev.scale + ZOOM_STEP)
    )
  }, [clampTransform])

  const zoomOut = useCallback(() => {
    setTransform((prev) =>
      clampTransform(prev.x, prev.y, prev.scale - ZOOM_STEP)
    )
  }, [clampTransform])

  const resetView = useCallback(() => {
    setTransform({ x: 0, y: 0, scale: 1 })
    setSelectedKec(null)
  }, [])


  /* ---------------------------------------------------------------
     Mouse wheel zoom
     --------------------------------------------------------------- */
  useEffect(() => {
    const el = viewportRef.current
    if (!el) return

    const handleWheel = (e) => {
      e.preventDefault()
      const delta = e.deltaY > 0 ? -ZOOM_STEP * 0.5 : ZOOM_STEP * 0.5
      setTransform((prev) =>
        clampTransform(prev.x, prev.y, prev.scale + delta)
      )
    }

    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [clampTransform])


  /* ---------------------------------------------------------------
     Pointer drag — uses document-level listeners so SVG child
     click events still fire (setPointerCapture would steal them).
     --------------------------------------------------------------- */
  const handlePointerDown = useCallback(
    (e) => {
      // Only single-finger / left-click
      if (e.pointerType === 'touch' && e.isPrimary === false) return
      if (e.button !== 0) return

      dragState.current = {
        dragging: true,
        startX: e.clientX,
        startY: e.clientY,
        startTx: transform.x,
        startTy: transform.y,
        moved: false,
      }

      const onMove = (me) => {
        if (!dragState.current.dragging) return
        if (pinchState.current.active) return

        const dx = me.clientX - dragState.current.startX
        const dy = me.clientY - dragState.current.startY

        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
          dragState.current.moved = true
        }

        setTransform((prev) =>
          clampTransform(
            dragState.current.startTx + dx,
            dragState.current.startTy + dy,
            prev.scale
          )
        )
      }

      const onUp = () => {
        dragState.current.dragging = false
        document.removeEventListener('pointermove', onMove)
        document.removeEventListener('pointerup', onUp)
      }

      document.addEventListener('pointermove', onMove)
      document.addEventListener('pointerup', onUp)
    },
    [transform.x, transform.y, clampTransform]
  )


  /* ---------------------------------------------------------------
     Touch pinch-to-zoom
     --------------------------------------------------------------- */
  const activeTouches = useRef(new Map())

  const handleTouchStart = useCallback(
    (e) => {
      for (const touch of e.changedTouches) {
        activeTouches.current.set(touch.identifier, {
          x: touch.clientX,
          y: touch.clientY,
        })
      }

      if (activeTouches.current.size === 2) {
        const entries = [...activeTouches.current.values()]
        const dx = entries[1].x - entries[0].x
        const dy = entries[1].y - entries[0].y
        const dist = Math.hypot(dx, dy)

        pinchState.current = {
          active: true,
          initialDistance: dist,
          initialScale: transform.scale,
          initialMidX: (entries[0].x + entries[1].x) / 2,
          initialMidY: (entries[0].y + entries[1].y) / 2,
          initialTx: transform.x,
          initialTy: transform.y,
        }
      }
    },
    [transform.scale, transform.x, transform.y]
  )

  const handleTouchMove = useCallback(
    (e) => {
      for (const touch of e.changedTouches) {
        activeTouches.current.set(touch.identifier, {
          x: touch.clientX,
          y: touch.clientY,
        })
      }

      if (pinchState.current.active && activeTouches.current.size >= 2) {
        const entries = [...activeTouches.current.values()]
        const dx = entries[1].x - entries[0].x
        const dy = entries[1].y - entries[0].y
        const dist = Math.hypot(dx, dy)

        const ratio = dist / pinchState.current.initialDistance
        const newScale = pinchState.current.initialScale * ratio

        setTransform(
          clampTransform(
            pinchState.current.initialTx,
            pinchState.current.initialTy,
            newScale
          )
        )
      }
    },
    [clampTransform]
  )

  const handleTouchEnd = useCallback((e) => {
    for (const touch of e.changedTouches) {
      activeTouches.current.delete(touch.identifier)
    }

    if (activeTouches.current.size < 2) {
      pinchState.current.active = false
    }
  }, [])


  /* ---------------------------------------------------------------
     District click
     --------------------------------------------------------------- */
  const handleDistrictClick = useCallback(
    (feature) => {
      // Ignore if the user dragged
      if (dragState.current.moved) return

      const kecamatanId = feature.properties.kecamatanId

      if (selectedKec === kecamatanId) {
        // Second tap on already selected => navigate if active
        if (activeKecamatanIds.has(kecamatanId)) {
          navigate(`/kecamatan/${kecamatanId}`)
        } else {
          showToast('🔒 Kecamatan ini segera hadir!')
        }
        return
      }

      setSelectedKec(kecamatanId)
    },
    [selectedKec, activeKecamatanIds, navigate, showToast]
  )


  /* ---------------------------------------------------------------
     Selection panel helpers
     --------------------------------------------------------------- */
  const selectedFeature = useMemo(() => {
    if (!selectedKec) return null
    return kecamatanFeatures.find(
      (f) => f.properties.kecamatanId === selectedKec
    )
  }, [selectedKec, kecamatanFeatures])

  const isSelectedActive = selectedKec
    ? activeKecamatanIds.has(selectedKec)
    : false

  const selectedObjectCount = selectedKec
    ? objectCountByKec[selectedKec] || 0
    : 0


  // Gambar kecamatan terpilih/hover paling akhir supaya outline-nya tidak tertimpa tetangga
  const orderedFeatures = useMemo(() => {
    const top = (f) =>
      f.properties.kecamatanId === selectedKec
        ? 2
        : f.properties.kecamatanId === hoveredKec
          ? 1
          : 0
    return [...kecamatanFeatures].sort((a, b) => top(a) - top(b))
  }, [kecamatanFeatures, selectedKec, hoveredKec])

  /* ---------------------------------------------------------------
     Loading
     --------------------------------------------------------------- */
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

  /* ---------------------------------------------------------------
     Font size for labels based on zoom
     --------------------------------------------------------------- */
  const baseLabelSize = viewportSize.width < 400 ? 7 : 8.5
  const labelSize = baseLabelSize / transform.scale


  /* ---------------------------------------------------------------
     Render
     --------------------------------------------------------------- */
  return (
    <div className="page-container map-page">

      {/* =========================================================
          TOP BAR
      ========================================================== */}
      <div className="map-topbar">
        <button
          className="map-back-btn"
          onClick={() => navigate('/home')}
          aria-label="Kembali"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="map-topbar-title">
          <h1>Jelajahi Magetan</h1>
          <p>Ketuk kecamatan untuk mulai eksplorasi</p>
        </div>
      </div>


      {/* =========================================================
          MAP VIEWPORT
      ========================================================== */}
      <div
        className="map-viewport"
        ref={viewportRef}
        onPointerDown={handlePointerDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        <svg
          className="map-svg"
          width={viewportSize.width}
          height={viewportSize.height}
          viewBox={`0 0 ${viewportSize.width} ${viewportSize.height}`}
          role="img"
          aria-label="Peta Kecamatan Magetan"
          style={{ touchAction: 'none' }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !dragState.current.moved) {
              setSelectedKec(null)
            }
          }}
        >
          <g
            transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}
            style={{
              transformOrigin: `${viewportSize.width / 2}px ${viewportSize.height / 2}px`,
            }}
          >
            {/* ===================================================
                RENDER 18 KECAMATAN
            ==================================================== */}
            {orderedFeatures.map((feature) => {
              const kecamatanId = feature.properties.kecamatanId
              const isActive = activeKecamatanIds.has(kecamatanId)
              const isHovered = hoveredKec === kecamatanId
              const isSelected = selectedKec === kecamatanId

              const classNames = [
                'map-district',
                isActive
                  ? 'map-district--active'
                  : 'map-district--locked',
                isSelected ? 'map-district--selected' : '',
                isHovered && !isSelected
                  ? (isActive
                    ? 'map-district--active-hover'
                    : 'map-district--locked-hover')
                  : '',
              ]
                .filter(Boolean)
                .join(' ')

              return (
                <g key={kecamatanId}>
                  <path
                    d={pathGenerator(feature) || ''}
                    className={classNames}
                    onClick={() => handleDistrictClick(feature)}
                    onMouseEnter={() => setHoveredKec(kecamatanId)}
                    onMouseLeave={() => setHoveredKec(null)}
                  />
                  <path
                    d={pathGenerator(feature.properties.outline) || ''}
                    className={
                      'map-outline' +
                      (isSelected ? ' map-outline--selected' : '')
                    }
                    fill="none"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                  />
                </g>
              )
            })}


            {/* ===================================================
                KECAMATAN LABELS
            ==================================================== */}
            {Object.entries(kecamatanCentroids).map(
              ([kecamatanId, position]) => {
                const isActive = activeKecamatanIds.has(kecamatanId)
                const isSelected = selectedKec === kecamatanId

                return (
                  <text
                    key={kecamatanId}
                    x={position.x}
                    y={position.y}
                    className={[
                      'map-label',
                      isActive ? 'map-label--active' : '',
                      isSelected ? 'map-label--selected' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={
                      isSelected
                        ? labelSize * 1.15
                        : labelSize
                    }
                  >
                    {position.name}
                  </text>
                )
              }
            )}
          </g>
        </svg>


        {/* =========================================================
            MAP CONTROLS
        ========================================================== */}
        <div className="map-controls">
          <button
            className="map-control-btn"
            onClick={zoomIn}
            aria-label="Perbesar"
          >
            <Plus size={18} />
          </button>

          <button
            className="map-control-btn"
            onClick={zoomOut}
            aria-label="Perkecil"
          >
            <Minus size={18} />
          </button>

          <button
            className="map-control-btn map-control-btn--reset"
            onClick={resetView}
            aria-label="Reset peta"
          >
            <Locate size={18} />
          </button>
        </div>


        {/* =========================================================
            LEGEND
        ========================================================== */}
        <div className="map-legend-float">
          <div className="map-legend-row">
            <span className="map-legend-swatch map-legend-swatch--active" />
            <span>Aktif ({activeKecamatanIds.size})</span>
          </div>
          <div className="map-legend-row">
            <span className="map-legend-swatch map-legend-swatch--locked" />
            <span>
              Segera Hadir (
              {Math.max(
                0,
                kecamatanFeatures.length - activeKecamatanIds.size
              )}
              )
            </span>
          </div>
        </div>


        {/* =========================================================
            HINT (shown when no selection)
        ========================================================== */}
        {!selectedKec && (
          <div className="map-hint">
            Ketuk kecamatan berwarna untuk memulai
          </div>
        )}


        {/* =========================================================
            SELECTION PANEL
        ========================================================== */}
        {selectedFeature && (
          <div
            className="map-selection-panel"
            key={selectedKec}
          >
            <button
              className="map-selection-close"
              onClick={() => setSelectedKec(null)}
              aria-label="Tutup"
            >
              <X size={14} />
            </button>

            <div
              className={
                'map-selection-icon ' +
                (isSelectedActive
                  ? 'map-selection-icon--active'
                  : 'map-selection-icon--locked')
              }
            >
              {isSelectedActive ? (
                <MapPin size={22} />
              ) : (
                <Lock size={20} />
              )}
            </div>

            <div className="map-selection-info">
              <div className="map-selection-name">
                {selectedFeature.properties.kecamatan}
              </div>
              <div className="map-selection-status">
                <span
                  className={
                    'map-selection-status-dot ' +
                    (isSelectedActive
                      ? 'map-selection-status-dot--active'
                      : 'map-selection-status-dot--locked')
                  }
                />
                {isSelectedActive
                  ? `${selectedObjectCount} objek budaya`
                  : 'Segera hadir'}
              </div>
            </div>

            {isSelectedActive && (
              <div className="map-selection-action">
                <button
                  className="map-explore-btn"
                  onClick={() =>
                    navigate(`/kecamatan/${selectedKec}`)
                  }
                >
                  Jelajahi
                  <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}