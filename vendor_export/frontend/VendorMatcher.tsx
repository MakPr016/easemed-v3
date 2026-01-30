import React, { useState } from 'react'
import VendorSearch from './VendorSearch'

type Demand = {
  id?: string
  sku?: string
  inn_name?: string
  line_item_id?: number
  dosage?: string
  form?: string
  quantity?: number
}

type Props = {
  demands: Demand[]
  apiBase?: string
}

export default function VendorMatcher({ demands, apiBase = 'http://127.0.0.1:5002' }: Props) {
  const [openIdx, setOpenIdx] = useState<number | null>(null)
  const [prefs, setPrefs] = useState<string[]>([]) // selected preference options
  const [selections, setSelections] = useState<Record<string, any>>({})

  const togglePref = (p: string) => {
    setPrefs(prev => (prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]))
  }

  const handleSelect = (demand: Demand, vendor: any) => {
    const key = demand.sku || demand.inn_name || demand.id || String(demand.line_item_id) || ''
    setSelections(s => ({ ...s, [key]: vendor }))
  }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 900, margin: '0 auto', padding: 16 }}>
      <h2>Vendor Matcher</h2>
      
      <div style={{ marginBottom: 16, padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
        <strong>Preferences (select multiple):</strong>
        <div style={{ marginTop: 8, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <label style={{ cursor: 'pointer' }}>
            <input type="checkbox" checked={prefs.includes('time')} onChange={() => togglePref('time')} />
            {' '}Time (fast delivery)
          </label>
          <label style={{ cursor: 'pointer' }}>
            <input type="checkbox" checked={prefs.includes('quality')} onChange={() => togglePref('quality')} />
            {' '}Quality
          </label>
          <label style={{ cursor: 'pointer' }}>
            <input type="checkbox" checked={prefs.includes('quantity')} onChange={() => togglePref('quantity')} />
            {' '}Quantity (availability)
          </label>
          <label style={{ cursor: 'pointer' }}>
            <input type="checkbox" checked={prefs.includes('resource-saving')} onChange={() => togglePref('resource-saving')} />
            {' '}Resource-saving (cost)
          </label>
        </div>
      </div>

      <div>
        {demands.map((d, i) => {
          const key = d.sku || d.inn_name || d.id || String(d.line_item_id) || String(i)
          const selected = selections[key]
          return (
            <div key={key} style={{ border: '1px solid #ddd', marginBottom: 8, padding: 12, borderRadius: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong 
                    style={{ cursor: 'pointer', color: '#2b6cb0' }} 
                    onClick={() => setOpenIdx(openIdx === i ? null : i)}
                  >
                    {d.inn_name || d.sku || `Medicine ${i + 1}`}
                    {openIdx === i ? ' ▼' : ' ▶'}
                  </strong>
                  <div style={{ fontSize: 14, color: '#666' }}>
                    {d.dosage && <span>Dosage: {d.dosage} | </span>}
                    {d.form && <span>Form: {d.form} | </span>}
                    Qty: {d.quantity || '—'}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  {selected ? (
                    <div style={{ color: '#2f855a' }}>
                      <div>✓ {selected.name}</div>
                      <div style={{ fontSize: 12 }}>Score: {selected.score}</div>
                    </div>
                  ) : (
                    <div style={{ color: '#999' }}>No vendor selected</div>
                  )}
                </div>
              </div>

              {openIdx === i && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #eee' }}>
                  <VendorSearch 
                    demand={d} 
                    preferences={prefs} 
                    onSelect={(v) => handleSelect(d, v)} 
                    apiBase={apiBase}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div style={{ marginTop: 24, padding: 12, background: '#f9f9f9', borderRadius: 4 }}>
        <h3>Selections Summary</h3>
        {Object.keys(selections).length === 0 && <div style={{ color: '#999' }}>No selections yet</div>}
        {Object.entries(selections).map(([k, v]) => (
          <div key={k} style={{ borderBottom: '1px dashed #eee', padding: 8 }}>
            <strong>{k}</strong>: {v.name} — Score: {v.score}
          </div>
        ))}
      </div>
    </div>
  )
}
