'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

const MapContainer = dynamic(
    () => import('react-leaflet').then((mod) => mod.MapContainer),
    { ssr: false }
)
const TileLayer = dynamic(
    () => import('react-leaflet').then((mod) => mod.TileLayer),
    { ssr: false }
)
const Marker = dynamic(
    () => import('react-leaflet').then((mod) => mod.Marker),
    { ssr: false }
)
const Popup = dynamic(
    () => import('react-leaflet').then((mod) => mod.Popup),
    { ssr: false }
)

interface RFQMapProps {
    lat: number
    lng: number
    location: string
}

export function RFQMap({ lat, lng, location }: RFQMapProps) {
    const [redIcon, setRedIcon] = useState<any>(null)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)

        if (typeof window !== 'undefined') {
            const L = require('leaflet')

            const icon = new L.Icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            })

            setRedIcon(icon)
        }
    }, [])

    if (!mounted) {
        return (
            <div className="w-full h-64 rounded-lg overflow-hidden border relative z-0 bg-muted flex items-center justify-center">
                <p className="text-sm text-muted-foreground">Loading map...</p>
            </div>
        )
    }

    return (
        <div className="w-full h-64 rounded-lg overflow-hidden border relative z-0">
            <MapContainer
                center={[lat, lng]}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {redIcon && (
                    <Marker position={[lat, lng]} icon={redIcon}>
                        <Popup>
                            <div className="text-sm">
                                <p className="font-semibold">{location}</p>
                            </div>
                        </Popup>
                    </Marker>
                )}
            </MapContainer>
        </div>
    )
}
