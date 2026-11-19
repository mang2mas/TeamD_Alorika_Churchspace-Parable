import { useState } from 'react'
import { X } from 'lucide-react'
import { TOPICS } from '../data/seedData.js'

export default function ComposerModal({ onClose, onPublish }) {
  const [f, setF] = useState({ title: '', body: '', topic: 'Doubt', anonymous: true })
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }))
  const ok = f.title.trim() && f.body.trim()
  const field = 'w-full rounded-xl bg-fg/5 border border-line px-4 py-2.5 text-sm placeholder:text-sage/60 focus:outline-none focus:border-emerald'

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm grid place-items-center p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()} className="pop w-full max-w-lg rounded-2xl bg-card border border-line shadow-card p-7">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-serif text-2xl font-semibold text-fg">Ask or share</h2>
          <button onClick={onClose} aria-label="Close"><X size={20} /></button>
        </div>
        <div className="flex flex-col gap-4">
          <label className="text-sm">Title<input className={`${field} mt-1`} value={f.title} onChange={(e) => set('title', e.target.value)} placeholder="What is on your heart?" /></label>
          <label className="text-sm">Your question or thought<textarea rows={4} className={`${field} mt-1 resize-none`} value={f.body} onChange={(e) => set('body', e.target.value)} placeholder="Share as much or as little as you like." /></label>
          <label className="text-sm">Topic
            <select className={`${field} mt-1`} value={f.topic} onChange={(e) => set('topic', e.target.value)}>
              {TOPICS.map((t) => <option key={t} value={t} className="bg-card">{t}</option>)}
            </select>
          </label>
          <div className="flex items-center justify-between text-sm">
            <span>Post Anonymously</span>
            <button role="switch" aria-checked={f.anonymous} onClick={() => set('anonymous', !f.anonymous)}
              className={`relative h-6 w-11 rounded-full transition-colors ${f.anonymous ? 'bg-emerald' : 'bg-fg/20'}`}>
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${f.anonymous ? 'left-[22px]' : 'left-0.5'}`} />
            </button>
          </div>
          <button disabled={!ok} onClick={() => onPublish(f)} className="rounded-full bg-emerald text-[#071917] font-semibold py-2.5 disabled:opacity-40">Publish</button>
        </div>
      </div>
    </div>
  )
}
