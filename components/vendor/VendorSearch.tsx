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

export default function VendorSearch({ demand, preferences, onSelect }: Props) {
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
      const res = await fetch(`/api/vendors?sku=${sku}`)
      const data: Vendor[] = await res.json()
      const scored = scoreVendors(data, demand, preferences)
      // Keep best on top, followed by rest in desc order (already sorted)
      setVendors(scored)
    } catch (err) {
      console.error('Failed fetching vendors', err)
      setVendors([])
    } finally {
      setLoading(false)
    }
  }

  function scoreVendors(vendorList: Vendor[], demand: Demand, prefs: string[]) {
    const w = averageWeights(prefs)

    const costs = vendorList.map(v => v.landedCost || 0)
    const maxCost = Math.max(...costs, 1)
    const minCost = Math.min(...costs, 0)

    return vendorList
      .map(v => {
        const S_qty = Math.exp(-Math.abs((v.availableQty || 0) - (demand.quantity || 0)) / Math.max(1, (demand.quantity || 1)))
        const S_cost = (maxCost - (v.landedCost || 0)) / (maxCost - minCost || 1)
        const S_delivery = v.deliveryDays ? 1 / v.deliveryDays : 0
        const S_quality = (v.qualityScore || 0) / 10
        const S_reliability = (v.reliabilityScore || 0) / 10

        const finalScore =
          w.qty * S_qty +
          w.cost * S_cost +
          w.delivery * S_delivery +
          w.quality * S_quality +
          w.reliability * S_reliability

        return {
          ...v,
          score: Number((finalScore * 10).toFixed(2))
        }
      })
      .sort((a, b) => b.score - a.score)
  }

  if (loading) return <p>Searching vendors...</p>

  if (!vendors || vendors.length === 0) return <p>No vendors found for this medicine.</p>

  const top = vendors[0]
  const rest = vendors.slice(1)

  return (
    <div>
      <h4>Top recommendation</h4>
      <div style={{ border: '2px solid #2b6cb0', padding: 8, marginBottom: 8 }}>
        <h3>{top.name}</h3>
        <p>Country: {top.country}</p>
        <p>Available: {top.availableQty}</p>
        <p>Landed Cost: ₹{top.landedCost}</p>
        <p>Delivery: {top.deliveryDays} days</p>
        <strong>Score: {top.score} / 10</strong>
        <div style={{ marginTop: 8 }}>
          <button onClick={() => onSelect?.(top)}>Select this vendor</button>
        </div>
      </div>

      <h4>Other options</h4>
      {rest.map(v => (
        <div key={v.vendorId} style={{ border: '1px solid #ccc', margin: 8, padding: 8 }}>
          <h4>{v.name}</h4>
          <p>Country: {v.country}</p>
          <p>Available: {v.availableQty}</p>
          <p>Landed Cost: ₹{v.landedCost}</p>
          <p>Delivery: {v.deliveryDays} days</p>
          <strong>Score: {v.score} / 10</strong>
          <div style={{ marginTop: 8 }}>
            <button onClick={() => onSelect?.(v)}>Select</button>
          </div>
        </div>
      ))}
    </div>
  )
}
