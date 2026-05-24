'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ChevronDown, Plus, Building, Check, Loader2, X } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Business } from '@/types'

export default function BusinessSwitcher({ userId }: { userId: string }) {
  const router = useRouter()
  const supabase = createClient()

  const [isOpen, setIsOpen] = useState(false)
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [activeBiz, setActiveBiz] = useState<Business | null>(null)
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [newBizName, setNewBizName] = useState('')
  const [creating, setCreating] = useState(false)

  const dropdownRef = useRef<HTMLDivElement>(null)

  // Fetch businesses
  useEffect(() => {
    const loadBusinesses = async () => {
      try {
        const { data: bizData, error: bizError } = await supabase
          .from('businesses')
          .select('*')
          .order('name', { ascending: true })

        if (bizError) throw bizError

        const { data: profData, error: profError } = await supabase
          .from('profiles')
          .select('active_business_id')
          .eq('id', userId)
          .single()

        if (profError) throw profError

        setBusinesses(bizData || [])

        const active = bizData?.find((b) => b.id === profData?.active_business_id) || bizData?.[0] || null
        setActiveBiz(active)

        // If profile has no active_business_id but we have a business, set it
        if (active && profData?.active_business_id !== active.id) {
          await supabase
            .from('profiles')
            .update({ active_business_id: active.id })
            .eq('id', userId)
        }
      } catch (err: any) {
        console.error('Error loading businesses:', err.message)
      } finally {
        setLoading(false)
      }
    }

    if (userId) loadBusinesses()
  }, [userId, supabase])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSwitch = async (bizId: string) => {
    setIsOpen(false)
    setLoading(true)
    const { error } = await supabase
      .from('profiles')
      .update({ active_business_id: bizId })
      .eq('id', userId)

    if (error) {
      toast.error('Failed to switch business')
      setLoading(false)
    } else {
      toast.success('Switched business profile')
      router.refresh()
      window.location.reload() // reload to ensure all states / queries fetch fresh business data
    }
  }

  const handleCreateBusiness = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newBizName.trim()) return
    setCreating(true)

    try {
      const { data: newBiz, error: bizError } = await supabase
        .from('businesses')
        .insert({
          user_id: userId,
          name: newBizName.trim(),
          currency: 'USD',
          country: 'US',
        })
        .select()
        .single()

      if (bizError) throw bizError

      // Set active
      const { error: profError } = await supabase
        .from('profiles')
        .update({ active_business_id: newBiz.id })
        .eq('id', userId)

      if (profError) throw profError

      toast.success(`Business "${newBizName}" created!`)
      setNewBizName('')
      setCreateOpen(false)
      router.refresh()
      window.location.reload()
    } catch (err: any) {
      toast.error(err.message || 'Failed to create business')
    } finally {
      setCreating(false)
    }
  }

  if (loading && !activeBiz) {
    return (
      <div className="h-12 flex items-center px-4 border-b border-slate-100 animate-pulse">
        <div className="w-6 h-6 rounded-md bg-slate-200 mr-2" />
        <div className="w-24 h-4 bg-slate-200 rounded" />
      </div>
    )
  }

  return (
    <div className="relative border-b border-slate-100" ref={dropdownRef}>
      {/* Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-16 flex items-center justify-between px-5 hover:bg-slate-50 transition-colors text-left focus:outline-none"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm shadow-blue-200 shrink-0">
            <Building className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider leading-none mb-1">Active Business</p>
            <p className="font-bold text-slate-800 text-sm truncate leading-none">
              {activeBiz?.name || 'My Business'}
            </p>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-[102%] inset-x-3 bg-white border border-slate-200/80 rounded-xl shadow-xl z-50 py-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="max-h-60 overflow-y-auto">
            {businesses.map((biz) => {
              const isActive = biz.id === activeBiz?.id
              return (
                <button
                  key={biz.id}
                  onClick={() => !isActive && handleSwitch(biz.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm text-left transition-colors ${
                    isActive
                      ? 'text-blue-700 bg-blue-50/50 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <span className="truncate pr-2">{biz.name}</span>
                  {isActive && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                </button>
              )
            })}
          </div>

          <div className="border-t border-slate-100 mt-1.5 pt-1.5 px-2">
            <button
              onClick={() => {
                setIsOpen(false)
                setCreateOpen(true)
              }}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors border border-slate-200/60"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Business Profile
            </button>
          </div>
        </div>
      )}

      {/* Create Business Modal */}
      {createOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="w-full max-w-sm bg-white rounded-2xl border border-slate-100 shadow-2xl p-6 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setCreateOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-slate-900 text-base mb-1">New Business Profile</h3>
            <p className="text-slate-500 text-xs mb-5">Create a separate profile for billing, clients, and templates.</p>

            <form onSubmit={handleCreateBusiness} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Business Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maruti Digital Agency"
                  value={newBizName}
                  onChange={(e) => setNewBizName(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  autoFocus
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !newBizName.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Create Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
