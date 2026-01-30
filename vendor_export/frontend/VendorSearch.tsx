import React, { useEffect, useState } from 'react'

type Vendor = {
  vendorId: string
  name: string
  country?: string
  availableQty: number
  landedCost: number
  deliveryDays: number
  qualityScore?: number
  reliabilityScore?: number
  score?: number
}

type Demand = {
  sku?: string
  inn_name?: string
  quantity?: number
  mode?: string
}

type Props = {
  demand: Demand
  preferences: string[] // e.g. ['time','quality']
  onSelect?: (vendor: Vendor) => void
  apiBase?: string
}

// Preset weights for each preference option
const PRESETS: Record<string, Record<string, number>> = {
  time: { qty: 0.2, cost: 0.05, delivery: 0.45, quality: 0.15, reliability: 0.15 },
  quality: { qty: 0.2, cost: 0.05, delivery: 0.1, quality: 0.45, reliability: 0.2 },
  quantity: { qty: 0.45, cost: 0.1, delivery: 0.1, quality: 0.15, reliability: 0.2 },
  'resource-saving': { qty: 0.25, cost: 0.45, delivery: 0.1, quality: 0.1, reliability: 0.1 },
  balanced: { qty: 0.3, cost: 0.22, delivery: 0.15, quality: 0.15, reliability: 0.1 }
}

function averageWeights(selected: string[]) {
  if (!selected || selected.length === 0) return PRESETS.balanced
  const picks = selected.map(s => PRESETS[s] || PRESETS.balanced)
  const keys = Object.keys(PRESETS.balanced)
  const avg: Record<string, number> = {}
  keys.forEach(k => {
    avg[k] = picks.reduce((acc, p) => acc + (p[k] || 0), 0) / picks.length
  })
  return avg
}

export default function VendorSearch({ demand, preferences, onSelect, apiBase = 'http://127.0.0.1:5002' }: Props) {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!demand) return
    fetchAndScore()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demand, preferences])

  async function fetchAndScore() {
    setLoading(true)
    try {
      const sku = encodeURIComponent((demand.sku || demand.inn_name || '').trim())
      const prefsParam = preferences.join(',')
      const res = await fetch(`${apiBase}/api/vendors?sku=${sku}&prefs=${prefsParam}&top=10`)
      const data = await res.json()
      
      // Combine top_vendor and other_vendors
      const allVendors: Vendor[] = []
      if (data.top_vendor) allVendors.push(data.top_vendor)
      if (data.other_vendors) allVendors.push(...data.other_vendors)
      
      setVendors(allVendors)
    } catch (err) {
      console.error('Failed fetching vendors', err)
      setVendors([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <p>Searching vendors...</p>

  if (!vendors || vendors.length === 0) return <p>No vendors found for this medicine.</p>

  const top = vendors[0]
  const rest = vendors.slice(1)

  return (
    <div>
      <h4>Top recommendation</h4>
      <div style={{ border: '2px solid #2b6cb0', padding: 8, marginBottom: 8, borderRadius: 4 }}>
        <h3 style={{ margin: '0 0 8px 0' }}>{top.name}</h3>
        <p style={{ margin: 4 }}>Country: {top.country}</p>
        <p style={{ margin: 4 }}>Available: {top.availableQty}</p>
        <p style={{ margin: 4 }}>Landed Cost: ${top.landedCost}</p>
        <p style={{ margin: 4 }}>Delivery: {top.deliveryDays} days</p>
        <strong>Score: {top.score} / 10</strong>
        <div style={{ marginTop: 8 }}>
          <button onClick={() => onSelect?.(top)} style={{ padding: '6px 12px', cursor: 'pointer' }}>
            Select this vendor
          </button>
        </div>
      </div>

      {rest.length > 0 && (
        <>
          <h4>Other options</h4>
          {rest.map(v => (
            <div key={v.vendorId || v.name} style={{ border: '1px solid #ccc', margin: 8, padding: 8, borderRadius: 4 }}>
              <h4 style={{ margin: '0 0 8px 0' }}>{v.name}</h4>
              <p style={{ margin: 4 }}>Country: {v.country}</p>
              <p style={{ margin: 4 }}>Available: {v.availableQty}</p>
              <p style={{ margin: 4 }}>Landed Cost: ${v.landedCost}</p>
              <p style={{ margin: 4 }}>Delivery: {v.deliveryDays} days</p>
              <strong>Score: {v.score} / 10</strong>
              <div style={{ marginTop: 8 }}>
                <button onClick={() => onSelect?.(v)} style={{ padding: '6px 12px', cursor: 'pointer' }}>
                  Select
                </button>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  )
}
