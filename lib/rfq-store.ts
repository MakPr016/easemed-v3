import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface VendorRFQ {
    vendorId: string
    vendorName: string
    requirements: {
        line_item_id: number
        inn_name: string
        brand_name: string
        dosage: string
        form: string
        quantity: number
        unit_of_issue: string
    }[]
    procurementMode: string
    sentAt: string
    status: 'sent' | 'viewed' | 'responded'
}

interface RFQData {
    rfqId: string
    rfqTitle: string
    deadline: string
    vendors: VendorRFQ[]
    createdAt: string
}

interface RFQStore {
    rfqs: Record<string, RFQData>
    addRFQ: (rfqId: string, data: Omit<RFQData, 'rfqId'>) => void
    addVendorsToRFQ: (rfqId: string, vendors: VendorRFQ[]) => void
    getRFQ: (rfqId: string) => RFQData | undefined
    updateVendorStatus: (rfqId: string, vendorId: string, status: 'sent' | 'viewed' | 'responded') => void
}

export const useRFQStore = create<RFQStore>()(
    persist(
        (set, get) => ({
            rfqs: {},

            addRFQ: (rfqId, data) => set((state) => ({
                rfqs: {
                    ...state.rfqs,
                    [rfqId]: { ...data, rfqId }
                }
            })),

            addVendorsToRFQ: (rfqId, vendors) => set((state) => {
                const existingRFQ = state.rfqs[rfqId]
                if (!existingRFQ) return state

                return {
                    rfqs: {
                        ...state.rfqs,
                        [rfqId]: {
                            ...existingRFQ,
                            vendors: [...existingRFQ.vendors, ...vendors]
                        }
                    }
                }
            }),

            getRFQ: (rfqId) => get().rfqs[rfqId],

            updateVendorStatus: (rfqId, vendorId, status) => set((state) => {
                const rfq = state.rfqs[rfqId]
                if (!rfq) return state

                return {
                    rfqs: {
                        ...state.rfqs,
                        [rfqId]: {
                            ...rfq,
                            vendors: rfq.vendors.map(v =>
                                v.vendorId === vendorId ? { ...v, status } : v
                            )
                        }
                    }
                }
            })
        }),
        {
            name: 'rfq-storage',
        }
    )
)
