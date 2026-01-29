'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet'
import { feature } from 'topojson-client'
import type { Topology, GeometryCollection } from 'topojson-specification'
import L from 'leaflet'

interface VendorCount {
  [countryName: string]: number
}

interface EuropeMapProps {
  selectedCountries: string[]
  onCountrySelect: (country: string) => void
  vendorCounts: VendorCount
}

function MapUpdater() {
  const map = useMap()

  useEffect(() => {
    map.invalidateSize()
    map.setMaxBounds([
      [34, -25],
      [72, 45]
    ])
  }, [map])

  return null
}

export function EuropeMap({ selectedCountries, onCountrySelect, vendorCounts }: EuropeMapProps) {
  const [geoData, setGeoData] = useState<any>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return

    fetch('/maps/europe.json')
      .then(response => response.json())
      .then((topology: Topology) => {
        const countries = feature(
          topology,
          topology.objects.countries as GeometryCollection
        )
        setGeoData(countries)
      })
      .catch(error => console.error('Error loading map:', error))
  }, [isMounted])

  const getCountryStyle = (countryName: string) => {
    const isSelected = selectedCountries.includes(countryName)
    const hasVendors = (vendorCounts[countryName] || 0) > 0

    if (isSelected) {
      return {
        fillColor: '#3b82f6',
        fillOpacity: 0.7,
        color: '#2563eb',
        weight: 2,
      }
    }
    if (hasVendors) {
      return {
        fillColor: '#3b82f6',
        fillOpacity: 0.2,
        color: '#cbd5e1',
        weight: 1,
      }
    }
    return {
      fillColor: '#e2e8f0',
      fillOpacity: 0.4,
      color: '#cbd5e1',
      weight: 1,
    }
  }

  const onEachCountry = (country: any, layer: L.Layer) => {
    const countryName = country.properties.name
    const vendorCount = vendorCounts[countryName] || 0

    layer.on({
      mouseover: (e) => {
        const layer = e.target
        if (vendorCount > 0) {
          layer.setStyle({
            fillOpacity: 0.5,
            weight: 2,
            color: '#2563eb',
          })
        }
      },
      mouseout: (e) => {
        const layer = e.target
        const style = getCountryStyle(countryName)
        layer.setStyle(style)
      },
      click: () => {
        if (vendorCount > 0) {
          onCountrySelect(countryName)
        }
      },
    })

    const tooltipContent = vendorCount > 0
      ? `<strong>${countryName}</strong><br/>${vendorCount} vendor${vendorCount !== 1 ? 's' : ''}`
      : `<strong>${countryName}</strong><br/>No vendors`

    layer.bindTooltip(tooltipContent, {
      sticky: true,
      className: 'custom-tooltip',
    })
  }

  if (!isMounted || !geoData) {
    return (
      <div className="w-full h-100 flex items-center justify-center bg-muted rounded-lg">
        <div className="animate-pulse text-muted-foreground">Loading map...</div>
      </div>
    )
  }

  return (
    <div className="w-full h-100 rounded-lg overflow-hidden border">
      <MapContainer
        center={[54, 15]}
        zoom={4}
        minZoom={3}
        maxZoom={6}
        maxBounds={[
          [34, -25],
          [72, 45]
        ]}
        maxBoundsViscosity={1.0}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <GeoJSON
          data={geoData}
          style={(feature) => getCountryStyle(feature?.properties?.name || '')}
          onEachFeature={onEachCountry}
          key={selectedCountries.join(',')}
        />
        <MapUpdater />
      </MapContainer>
    </div>
  )
}
