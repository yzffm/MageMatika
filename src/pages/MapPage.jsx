import {
  geoMercator,
  geoPath,
  geoCentroid,
} from 'd3-geo'

import { useNavigate } from 'react-router-dom'
import { useState, useMemo, useRef, useEffect } from 'react'
import { ChevronLeft, MapPin, Lock } from 'lucide-react'

import { useLocations } from '../hooks/useLocations'
import { useToast } from '../hooks/useToast.jsx'
import geojsonData from '../data/magetan-kecamatan.json'

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

function inspectGeoJSON(data) {
  const points = []

  function walkCoordinates(
    coordinates,
    feature,
    path = []
  ) {
    if (!Array.isArray(coordinates)) {
      return
    }

    // Coordinate pair: [longitude, latitude]
    if (
      coordinates.length >= 2 &&
      typeof coordinates[0] === 'number' &&
      typeof coordinates[1] === 'number'
    ) {
      points.push({
        lng: coordinates[0],
        lat: coordinates[1],
        kecamatan:
          feature.properties?.kecamatan,
        kode:
          feature.properties?.kode_kec,
        path,
      })

      return
    }

    coordinates.forEach((child, index) => {
      walkCoordinates(
        child,
        feature,
        [...path, index]
      )
    })
  }

  for (const feature of data.features || []) {
    walkCoordinates(
      feature.geometry?.coordinates,
      feature
    )
  }

  const lngs = points.map(p => p.lng)
  const lats = points.map(p => p.lat)

  console.log(
    '[GEO DEBUG] Total coordinates:',
    points.length
  )

  console.log(
    '[GEO DEBUG] Longitude range:',
    Math.min(...lngs),
    '→',
    Math.max(...lngs)
  )

  console.log(
    '[GEO DEBUG] Latitude range:',
    Math.min(...lats),
    '→',
    Math.max(...lats)
  )

  // Coordinates yang mencurigakan untuk Magetan
  const suspicious = points.filter(
    p =>
      p.lng < 110 ||
      p.lng > 112 ||
      p.lat > -6 ||
      p.lat < -9
  )

  console.log(
    '[GEO DEBUG] Suspicious coordinates:',
    suspicious.length
  )

  console.table(
    suspicious.slice(0, 100)
  )

  return points
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
      })
    }

    const group = groups.get(id)
    const geometry = feature.geometry

    if (geometry.type === 'Polygon') {
      group.polygons.push(fixRingWinding(geometry.coordinates))
    }

    if (geometry.type === 'MultiPolygon') {
      for (const polygon of geometry.coordinates) {
        group.polygons.push(fixRingWinding(polygon))
      }
    }
  }

  return Array.from(groups.values()).map((group) => ({
    type: 'Feature',
    properties: {
      kecamatan: group.name,
      kecamatanId: group.id,
      kode_kec: group.kode,
    },
    geometry: {
      type: 'MultiPolygon',
      coordinates: group.polygons,
    },
  }))
}


export default function MapPage() {
  const { locations, loading } = useLocations()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const svgRef = useRef(null)
  const containerRef = useRef(null)

  const [dimensions, setDimensions] = useState({
    width: 380,
    height: 480,
  })

  const [hoveredKec, setHoveredKec] = useState(null)

  const [tooltipPos, setTooltipPos] = useState({
    x: 0,
    y: 0,
  })

  //debug
  useEffect(() => {
    inspectGeoJSON(geojsonData)
  }, [])


  /**
   * ---------------------------------------------------------
   * 1. Responsive dimensions
   * ---------------------------------------------------------
   */
  useEffect(() => {
    const updateDimensions = () => {
      if (!containerRef.current) {
        return
      }

      const containerWidth = containerRef.current.clientWidth

      // Padding kiri + kanan dari map-container
      const availableWidth = Math.max(
        280,
        Math.min(containerWidth - 32, 450)
      )

      // Magetan dibuat portrait-ish.
      // Ratio ini masih bisa kamu tuning.
      const width = availableWidth
      const height = width * 1.15

      setDimensions({
        width,
        height,
      })
    }

    updateDimensions()

    const observer = new ResizeObserver(updateDimensions)

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    window.addEventListener('resize', updateDimensions)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', updateDimensions)
    }
  }, [])


  /**
   * ---------------------------------------------------------
   * 2. Active kecamatan
   * ---------------------------------------------------------
   */
  const activeKecamatanIds = useMemo(() => {
    return new Set(
      locations
        .map((location) =>
          normalizeKecamatanId(location.kecamatanId)
        )
        .filter(Boolean)
    )
  }, [locations])


  /**
   * ---------------------------------------------------------
   * 3. Convert 235 desa -> 18 kecamatan
   * ---------------------------------------------------------
   */
  const kecamatanFeatures = useMemo(() => {
    console.log(
      '[MAP DEBUG] Total source features:',
      geojsonData?.features?.length
    )

    const result = buildKecamatanFeatures(geojsonData)

    console.log(
      '[MAP DEBUG] Total kecamatan:',
      result.length
    )

    console.log(
      '[MAP DEBUG] Kecamatan:',
      result.map(
        feature => feature.properties.kecamatan
      )
    )

    return result
  }, [])

  /**
   * ---------------------------------------------------------
   * 4. Build projection
   *
   * IMPORTANT:
   * projection sekarang FIT ke 18 kecamatan,
   * bukan ke 235 polygon desa.
   * ---------------------------------------------------------
   */
  const { projection, pathGenerator } = useMemo(() => {
    const padding = 24

    const width = dimensions.width
    const height = dimensions.height

    /**
     * ---------------------------------------------------------
     * Hitung bounding box GeoJSON secara manual.
     *
     * Kita sengaja TIDAK menggunakan fitExtent().
     * ---------------------------------------------------------
     */

    let minLng = Infinity
    let maxLng = -Infinity
    let minLat = Infinity
    let maxLat = -Infinity

    function walkCoordinates(coordinates) {
      if (!Array.isArray(coordinates)) {
        return
      }

      // [longitude, latitude]
      if (
        coordinates.length >= 2 &&
        typeof coordinates[0] === 'number' &&
        typeof coordinates[1] === 'number'
      ) {
        const lng = coordinates[0]
        const lat = coordinates[1]

        minLng = Math.min(minLng, lng)
        maxLng = Math.max(maxLng, lng)

        minLat = Math.min(minLat, lat)
        maxLat = Math.max(maxLat, lat)

        return
      }

      for (const child of coordinates) {
        walkCoordinates(child)
      }
    }

    for (const feature of kecamatanFeatures) {
      walkCoordinates(
        feature.geometry?.coordinates
      )
    }

    console.log(
      '[MAP DEBUG] Manual bounds:',
      {
        minLng,
        maxLng,
        minLat,
        maxLat,
      }
    )

    /**
     * ---------------------------------------------------------
     * Guard
     * ---------------------------------------------------------
     */

    if (
      !Number.isFinite(minLng) ||
      !Number.isFinite(maxLng) ||
      !Number.isFinite(minLat) ||
      !Number.isFinite(maxLat)
    ) {
      console.error(
        '[MAP ERROR] Invalid GeoJSON bounds'
      )

      return {
        projection: geoMercator(),
        pathGenerator: geoPath(),
      }
    }

    /**
     * ---------------------------------------------------------
     * Center geografis
     * ---------------------------------------------------------
     */

    const centerLng =
      (minLng + maxLng) / 2

    const centerLat =
      (minLat + maxLat) / 2


    /**
     * ---------------------------------------------------------
     * Base projection
     * ---------------------------------------------------------
     */

    const projection = geoMercator()
      .center([
        centerLng,
        centerLat,
      ])
      .translate([
        width / 2,
        height / 2,
      ])


    /**
     * ---------------------------------------------------------
     * Hitung scale berdasarkan hasil projection.
     *
     * Kita project 4 corner bounding box kemudian cari
     * ukuran geografis dalam pixel pada scale=1.
     * ---------------------------------------------------------
     */

    projection.scale(1)

    console.log(
      '[MAP DEBUG] Scale=1 projected corners:',
      {
        topLeft: projection([
          minLng,
          maxLat,
        ]),

        topRight: projection([
          maxLng,
          maxLat,
        ]),

        bottomLeft: projection([
          minLng,
          minLat,
        ]),

        bottomRight: projection([
          maxLng,
          minLat,
        ]),
      }
    )

    const projectedTopLeft =
      projection([
        minLng,
        maxLat,
      ])

    const projectedTopRight =
      projection([
        maxLng,
        maxLat,
      ])

    const projectedBottomLeft =
      projection([
        minLng,
        minLat,
      ])

    const projectedBottomRight =
      projection([
        maxLng,
        minLat,
      ])


    const projectedWidth = Math.abs(
      projectedTopRight[0] -
      projectedTopLeft[0]
    )

    const projectedHeight = Math.abs(
      projectedBottomLeft[1] -
      projectedTopLeft[1]
    )


    /**
     * ---------------------------------------------------------
     * Scale supaya geometry masuk ke SVG.
     * ---------------------------------------------------------
     */

    const availableWidth =
      width - padding * 2

    const availableHeight =
      height - padding * 2

    const scaleX =
      availableWidth / projectedWidth

    const scaleY =
      availableHeight / projectedHeight

    const scale =
      Math.min(scaleX, scaleY)


    /**
     * ---------------------------------------------------------
     * Apply scale
     * ---------------------------------------------------------
     */

    projection.scale(scale)


    /**
     * Setelah scale berubah, translate perlu disesuaikan
     * supaya center geometry tetap berada di tengah SVG.
     */

    projection.translate([
      width / 2,
      height / 2,
    ])


    const pathGenerator =
      geoPath().projection(projection)


    /**
     * ---------------------------------------------------------
     * Debug
     * ---------------------------------------------------------
     */

    console.log(
      '[MAP DEBUG] Final projection:',
      {
        center: projection.center(),
        scale: projection.scale(),
        translate: projection.translate(),
      }
    )


    const sampleFeature =
      kecamatanFeatures[0]

    if (sampleFeature) {
      console.log(
        '[MAP DEBUG] Sample path length:',
        pathGenerator(sampleFeature)?.length
      )
    }


    return {
      projection,
      pathGenerator,
    }

  }, [
    dimensions.width,
    dimensions.height,
    kecamatanFeatures,
  ])


  /**
   * ---------------------------------------------------------
   * 5. Centroid setiap kecamatan
   *
   * Jangan lagi menghitung rata-rata vertex secara manual.
   *
   * geoCentroid() menghitung centroid berdasarkan geometry.
   * ---------------------------------------------------------
   */
  const kecamatanCentroids = useMemo(() => {
    const result = {}

    for (const feature of kecamatanFeatures) {
      const centroid = geoCentroid(feature)

      if (!centroid || !Number.isFinite(centroid[0])) {
        continue
      }

      const projected = projection(centroid)

      if (!projected) {
        continue
      }

      result[feature.properties.kecamatanId] = {
        x: projected[0],
        y: projected[1],
        name: feature.properties.kecamatan,
      }
    }

    return result
  }, [
    kecamatanFeatures,
    projection,
  ])


  /**
   * ---------------------------------------------------------
   * 6. Click kecamatan
   * ---------------------------------------------------------
   */
  function handleClick(feature) {
    const kecamatanId =
      feature.properties.kecamatanId

    if (activeKecamatanIds.has(kecamatanId)) {
      navigate(`/kecamatan/${kecamatanId}`)
      return
    }

    showToast('🔒 Kecamatan ini segera hadir!')
  }


  /**
   * ---------------------------------------------------------
   * 7. Tooltip
   * ---------------------------------------------------------
   */
  function handleMouseMove(event, feature) {
    const kecamatanId =
      feature.properties.kecamatanId

    setHoveredKec(kecamatanId)

    if (!svgRef.current) {
      return
    }

    const rect =
      svgRef.current.getBoundingClientRect()

    setTooltipPos({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top - 42,
    })
  }


  /**
   * ---------------------------------------------------------
   * Loading state
   * ---------------------------------------------------------
   */
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
    <div
      className="page-container map-page"
      ref={containerRef}
    >

      {/* =====================================================
          HEADER
      ====================================================== */}
      <header className="map-header animate-fade-in-up">

        <button
          className="btn btn-ghost"
          onClick={() => navigate('/')}
        >
          <ChevronLeft size={18} />
          Kembali
        </button>

        <div>
          <h1 className="map-title">
            Peta Magetan
          </h1>

          <p className="map-subtitle">
            Pilih kecamatan untuk memulai eksplorasi
          </p>
        </div>

      </header>


      {/* =====================================================
          LEGEND
      ====================================================== */}
      <div
        className="map-legend animate-fade-in-up"
        style={{
          animationDelay: '0.1s',
        }}
      >

        <div className="map-legend-item">
          <span className="map-legend-dot map-legend-dot--active" />

          <span>
            Aktif ({activeKecamatanIds.size})
          </span>
        </div>


        <div className="map-legend-item">
          <span className="map-legend-dot map-legend-dot--inactive" />

          <span>
            Segera Hadir ({Math.max(
              0,
              kecamatanFeatures.length -
              activeKecamatanIds.size
            )})
          </span>
        </div>

      </div>


      {/* =====================================================
          MAP
      ====================================================== */}
      <div
        className="map-container glass-card animate-fade-in-up"
        style={{
          animationDelay: '0.2s',
        }}
      >

        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
          className="map-svg"
          role="img"
          aria-label="Peta Kecamatan Magetan"
        >

          {/* =================================================
              SVG FILTER
          ================================================== */}
          <defs>

            <filter
              id="map-glow"
              x="-50%"
              y="-50%"
              width="200%"
              height="200%"
            >
              <feGaussianBlur
                stdDeviation="2"
                result="blur"
              />

              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>

            </filter>

          </defs>


          {/* =================================================
              RENDER 18 KECAMATAN
          ================================================== */}
          {kecamatanFeatures.map((feature) => {

            const kecamatanId =
              feature.properties.kecamatanId

            const isActive =
              activeKecamatanIds.has(kecamatanId)

            const isHovered =
              hoveredKec === kecamatanId


            return (
              <path
                key={kecamatanId}
                d={pathGenerator(feature) || ''}
                fill={
                  isActive
                    ? (
                      isHovered
                        ? 'var(--color-map-active-hover)'
                        : 'var(--color-map-active)'
                    )
                    : (
                      isHovered
                        ? 'var(--color-map-inactive-hover)'
                        : 'var(--color-map-inactive)'
                    )
                }
                stroke="var(--color-map-stroke)"
                strokeWidth={
                  isHovered ? 1.2 : 0.7
                }
                strokeLinejoin="round"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                onClick={() => handleClick(feature)}
                onMouseEnter={(event) =>
                  handleMouseMove(event, feature)
                }
                onMouseMove={(event) =>
                  handleMouseMove(event, feature)
                }
                onMouseLeave={() =>
                  setHoveredKec(null)
                }
                onTouchStart={() =>
                  setHoveredKec(kecamatanId)
                }
                className={[
                  'map-polygon',
                  isActive
                    ? 'map-polygon--active'
                    : 'map-polygon--inactive',
                ].join(' ')}
                filter={
                  isActive
                    ? 'url(#map-glow)'
                    : undefined
                }
              />
            )
          })}


          {/* =================================================
              KECAMATAN LABELS
          ================================================== */}
          {Object.entries(kecamatanCentroids).map(
            ([kecamatanId, position]) => {

              const isActive =
                activeKecamatanIds.has(kecamatanId)

              return (
                <text
                  key={kecamatanId}
                  x={position.x}
                  y={position.y}
                  className={[
                    'map-label',
                    isActive
                      ? 'map-label--active'
                      : '',
                  ].join(' ')}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={
                    dimensions.width < 350
                      ? 7
                      : 8
                  }
                  pointerEvents="none"
                >
                  {position.name}
                </text>
              )
            }
          )}

        </svg>


        {/* ===================================================
            TOOLTIP
        ==================================================== */}
        {hoveredKec && (
          <div
            className="map-tooltip"
            style={{
              left: tooltipPos.x,
              top: tooltipPos.y,
            }}
          >

            {activeKecamatanIds.has(
              hoveredKec
            ) ? (
              <>
                <MapPin size={12} />
                {
                  kecamatanFeatures.find(
                    (feature) =>
                      feature.properties.kecamatanId ===
                      hoveredKec
                  )?.properties.kecamatan
                }
                {' '}— Klik untuk jelajah
              </>
            ) : (
              <>
                <Lock size={12} />
                {
                  kecamatanFeatures.find(
                    (feature) =>
                      feature.properties.kecamatanId ===
                      hoveredKec
                  )?.properties.kecamatan
                }
                {' '}— Segera hadir
              </>
            )}

          </div>
        )}

      </div>
    </div>
  )
}