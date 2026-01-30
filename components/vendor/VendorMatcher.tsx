import React, { useState } from 'react'
import VendorSearch from './VendorSearch'

type Demand = {
  id?: string
  sku?: string
  inn_name?: string
  quantity?: number
}

type Props = {
  demands: Demand[]
}

export default function VendorMatcher({ demands }: Props) {
  const [openIdx, setOpenIdx] = useState<number | null>(null)
  const [prefs, setPrefs] = useState<string[]>([]) // selected preference options
  const [selections, setSelections] = useState<Record<string, any>>({})

  const togglePref = (p: string) => {
    setPrefs(prev => (prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]))
  }

  const handleSelect = (demand: Demand, vendor: any) => {
    setSelections(s => ({ ...s, [demand.sku || demand.inn_name || demand.id || '']: vendor }))
  }

  return (
    <div>
      <h2>Vendor Matcher</h2>
      <div style={{ marginBottom: 12 }}>
        <strong>Preferences:</strong>
        <label style={{ marginLeft: 8 }}>
          <input type="checkbox" checked={prefs.includes('time')} onChange={() => togglePref('time')} /> Time
        </label>
        <label style={{ marginLeft: 8 }}>
          <input type="checkbox" checked={prefs.includes('quality')} onChange={() => togglePref('quality')} /> Quality
        </label>
        <label style={{ marginLeft: 8 }}>
          <input type="checkbox" checked={prefs.includes('quantity')} onChange={() => togglePref('quantity')} /> Quantity
        </label>
        <label style={{ marginLeft: 8 }}>
          <input type="checkbox" checked={prefs.includes('resource-saving')} onChange={() => togglePref('resource-saving')} /> Resource-saving
        </label>
      </div>

      <div>
        {demands.map((d, i) => {
          const key = d.sku || d.inn_name || d.id || String(i)
          const selected = selections[key]
          return (
            <div key={key} style={{ border: '1px solid #ddd', marginBottom: 8, padding: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ cursor: 'pointer' }} onClick={() => setOpenIdx(openIdx === i ? null : i)}>
                    {d.inn_name || d.sku || `Medicine ${i + 1}`}
                  </strong>
                  <div>Qty: {d.quantity || '—'}</div>
                </div>
                <div>
                  {selected ? (
                    <div>
                      <div>Selected: {selected.name}</div>
                      <div>Score: {selected.score}</div>
                    </div>
                  ) : (
                    <div style={{ color: '#666' }}>No vendor selected</div>
                  )}
                </div>
              </div>

              {openIdx === i && (
                <div style={{ marginTop: 8 }}>
                  <VendorSearch demand={d} preferences={prefs} onSelect={(v) => handleSelect(d, v)} />
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div style={{ marginTop: 16 }}>
        <h3>Selections</h3>
        {Object.keys(selections).length === 0 && <div>No selections yet</div>}
        {Object.entries(selections).map(([k, v]) => (
          <div key={k} style={{ borderBottom: '1px dashed #eee', padding: 6 }}>
            <strong>{k}</strong>: {v.name} — Score: {v.score}
          </div>
        ))}
      </div>
    </div>
  )
}
