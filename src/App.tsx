import { useState, useEffect, useRef } from 'react'

type Screen = 'scan' | 'vehicle' | 'success'

interface BikeData {
  id: string
  battery: number
  range: number
  isRecommended: boolean
  reward?: number
}

const CURRENT_BIKE: BikeData = { id: '8657001234', battery: 80, range: 24, isRecommended: false }
const RECOMMENDED_BIKE: BikeData = { id: '8657005678', battery: 40, range: 12, isRecommended: true, reward: 0.5 }

function BatteryIcon({ level }: { level: number }) {
  const color = level >= 60 ? '#16a34a' : level >= 30 ? '#ea580c' : '#dc2626'
  const segments = Math.round((level / 100) * 5)
  return (
    <svg width="22" height="14" viewBox="0 0 22 14" fill="none">
      <rect x="0.5" y="0.5" width="18" height="13" rx="2.5" stroke={color} strokeWidth="1.2" fill="none"/>
      <rect x="19" y="4" width="3" height="6" rx="1" fill={color}/>
      {[0,1,2,3,4].map(i => (
        <rect key={i} x={2 + i * 3.2} y={2.5} width={2.4} height={9} rx={0.8}
          fill={i < segments ? color : '#e5e7eb'}/>
      ))}
    </svg>
  )
}

function BatteryBar({ level }: { level: number }) {
  const color = level >= 60 ? 'bg-green-500' : level >= 30 ? 'bg-orange-500' : 'bg-red-500'
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${level}%` }}/>
      </div>
      <span className="text-xs text-gray-400">{level}%</span>
    </div>
  )
}

function MockMap() {
  const bikes = [
    { x: 52, y: 38, active: true },
    { x: 74, y: 22, active: false },
    { x: 30, y: 55, active: false },
    { x: 68, y: 62, active: false },
    { x: 18, y: 30, active: false },
    { x: 82, y: 45, active: false },
  ]
  return (
    <div className="relative w-full h-full overflow-hidden bg-[#e8f0e8]">
      {/* Roads */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Water */}
        <path d="M0 40 Q15 35 25 42 Q35 48 40 44 Q50 38 55 42 Q65 48 75 44 Q85 40 100 45 L100 60 Q85 55 75 58 Q65 62 55 56 Q45 50 35 58 Q25 64 15 58 Q5 52 0 55Z" fill="#a8d4f0" opacity="0.6"/>
        {/* Main roads */}
        <line x1="0" y1="50" x2="100" y2="50" stroke="white" strokeWidth="3"/>
        <line x1="50" y1="0" x2="50" y2="100" stroke="white" strokeWidth="3"/>
        <line x1="0" y1="25" x2="100" y2="35" stroke="white" strokeWidth="2"/>
        <line x1="20" y1="0" x2="30" y2="100" stroke="white" strokeWidth="2"/>
        <line x1="70" y1="0" x2="80" y2="100" stroke="white" strokeWidth="2"/>
        <line x1="0" y1="72" x2="100" y2="68" stroke="white" strokeWidth="2"/>
        {/* Blocks */}
        <rect x="55" y="52" width="12" height="12" fill="#c8d8b8" rx="1" opacity="0.8"/>
        <rect x="32" y="52" width="14" height="14" fill="#c8d8b8" rx="1" opacity="0.8"/>
        <rect x="55" y="28" width="12" height="18" fill="#c8d8b8" rx="1" opacity="0.8"/>
        <rect x="32" y="28" width="14" height="18" fill="#c8d8b8" rx="1" opacity="0.8"/>
        <rect x="82" y="52" width="14" height="12" fill="#c8d8b8" rx="1" opacity="0.8"/>
        <rect x="82" y="38" width="14" height="10" fill="#c8d8b8" rx="1" opacity="0.8"/>
        <rect x="4" y="52" width="12" height="14" fill="#c8d8b8" rx="1" opacity="0.8"/>
        <rect x="4" y="28" width="12" height="18" fill="#c8d8b8" rx="1" opacity="0.8"/>
      </svg>
      {/* User location */}
      <div className="absolute" style={{ left: '52%', top: '38%', transform: 'translate(-50%,-50%)' }}>
        <div className="absolute inset-0 -m-4 rounded-full bg-blue-500/20 animate-ping"/>
        <div className="w-4 h-4 rounded-full bg-[#2563EB] border-2 border-white shadow-md relative z-10"/>
      </div>
      {/* Bike markers */}
      {bikes.map((b, i) => (
        <div key={i} className="absolute" style={{ left: `${b.x}%`, top: `${b.y}%`, transform: 'translate(-50%,-100%)' }}>
          <div className={`flex items-center justify-center w-8 h-8 rounded-full shadow-md border-2 ${
            b.active ? 'bg-[#2563EB] border-[#1d4ed8]' : 'bg-white border-gray-200'}`}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="5.5" cy="17.5" r="3" stroke={b.active ? 'white' : '#2563EB'} strokeWidth="2"/>
              <circle cx="18.5" cy="17.5" r="3" stroke={b.active ? 'white' : '#2563EB'} strokeWidth="2"/>
              <path d="M5.5 17.5L9 9h8l-2.5 8.5" stroke={b.active ? 'white' : '#2563EB'} strokeWidth="2" strokeLinecap="round"/>
              <path d="M9 9l2-4" stroke={b.active ? 'white' : '#2563EB'} strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div className={`w-0.5 h-2 mx-auto ${b.active ? 'bg-[#2563EB]' : 'bg-gray-300'}`}/>
        </div>
      ))}
    </div>
  )
}

function ScanScreen({ onScan }: { onScan: () => void }) {
  const [scanning, setScanning] = useState(false)

  const handleScan = () => {
    setScanning(true)
    setTimeout(onScan, 1200)
  }

  return (
    <div className="screen-enter flex flex-col min-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4">
        <button className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M15 19l-7-7 7-7" stroke="#374151" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <span className="text-base font-semibold text-gray-900">Scan to Unlock</span>
        <button className="text-[#2563EB] text-sm font-medium">Help</button>
      </div>

      {/* Bike image */}
      <div className="flex justify-center px-8 py-4 bg-gradient-to-b from-blue-50 to-white">
        <img
          src="https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=400&h=240&fit=crop&auto=format"
          alt="E-bike"
          className="w-full max-w-xs h-44 object-cover rounded-2xl shadow-sm"
        />
      </div>

      {/* QR scanner area */}
      <div className="flex-1 flex flex-col items-center px-8 py-2">
        <div className="relative w-52 h-52 mt-2">
          {/* Corner brackets */}
          {[['top-0 left-0','border-t-2 border-l-2'],['top-0 right-0','border-t-2 border-r-2'],
            ['bottom-0 left-0','border-b-2 border-l-2'],['bottom-0 right-0','border-b-2 border-r-2']].map(([pos,border],i)=>(
            <div key={i} className={`absolute ${pos} w-7 h-7 border-[#2563EB] ${border} rounded-sm`}/>
          ))}
          {/* Camera area */}
          <div className="absolute inset-3 bg-gray-900 rounded-lg overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=300&h=300&fit=crop&auto=format"
              alt="QR code camera view"
              className="w-full h-full object-cover opacity-80"
            />
            {/* Scan line */}
            {scanning && (
              <div className="scan-line absolute left-0 right-0 h-0.5 bg-[#2563EB] shadow-[0_0_6px_#2563EB]"/>
            )}
            {/* QR overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={`w-20 h-20 border-2 rounded-lg ${scanning ? 'border-[#2563EB]' : 'border-white/60'} transition-colors duration-300`}>
                <div className="w-full h-full grid grid-cols-3 gap-0.5 p-1 opacity-60">
                  {Array(9).fill(0).map((_,i)=>(
                    <div key={i} className={`rounded-sm ${[0,2,6,8].includes(i)?'bg-white':'bg-white/30'}`}/>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-4 text-sm text-gray-500 font-medium">Scan the QR code on the vehicle</p>
        <p className="text-xs text-gray-400 mt-1 font-medium">8657001234</p>

        {/* Simulate button */}
        <button
          onClick={handleScan}
          disabled={scanning}
          className="mt-5 w-full max-w-xs py-3.5 bg-[#2563EB] text-white font-semibold rounded-2xl shadow-md active:scale-98 transition-all disabled:opacity-70 text-sm"
        >
          {scanning ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4"/>
                <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Scanning...
            </span>
          ) : 'Simulate QR Scan'}
        </button>

        {/* Bottom tools */}
        <div className="flex w-full max-w-xs mt-5 border-t border-gray-100">
          <button className="flex-1 flex flex-col items-center gap-1.5 py-4">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="7" height="7" rx="1" stroke="#6b7280" strokeWidth="1.8"/>
              <rect x="14" y="3" width="7" height="7" rx="1" stroke="#6b7280" strokeWidth="1.8"/>
              <rect x="3" y="14" width="7" height="7" rx="1" stroke="#6b7280" strokeWidth="1.8"/>
              <rect x="14" y="17" width="3" height="3" rx="0.5" fill="#6b7280"/>
              <rect x="18" y="14" width="3" height="3" rx="0.5" fill="#6b7280"/>
              <rect x="18" y="18" width="3" height="3" rx="0.5" fill="#6b7280"/>
            </svg>
            <span className="text-xs text-gray-500 font-medium">Enter Code</span>
          </button>
          <div className="w-px bg-gray-100 my-3"/>
          <button className="flex-1 flex flex-col items-center gap-1.5 py-4">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M9 2H7a2 2 0 00-2 2v16a2 2 0 002 2h10a2 2 0 002-2V4a2 2 0 00-2-2h-2" stroke="#6b7280" strokeWidth="1.8" strokeLinecap="round"/>
              <rect x="9" y="1" width="6" height="4" rx="1" stroke="#6b7280" strokeWidth="1.8"/>
              <circle cx="12" cy="14" r="3" stroke="#f59e0b" strokeWidth="1.8"/>
              <path d="M12 11V9" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            <span className="text-xs text-gray-500 font-medium">Turn On Flashlight</span>
          </button>
        </div>
      </div>
    </div>
  )
}

function VehicleScreen({ onConfirm }: { onConfirm: () => void }) {
  return (
    <div className="screen-enter flex flex-col min-h-screen bg-[#f8fafc]">
      {/* Map area */}
      <div className="relative h-64 bg-gray-200">
        <MockMap/>
        {/* Top nav overlay */}
        <div className="absolute top-0 left-0 right-0 flex justify-between items-center px-4 pt-12 pb-3">
          <button className="w-9 h-9 flex items-center justify-center rounded-full bg-white shadow-md">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="#374151" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="12" cy="7" r="4" stroke="#374151" strokeWidth="2"/>
            </svg>
          </button>
          <button className="w-9 h-9 flex items-center justify-center rounded-full bg-white shadow-md">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M3 18v-6a9 9 0 0118 0v6" stroke="#374151" strokeWidth="2" strokeLinecap="round"/>
              <path d="M21 19a2 2 0 01-2 2H5a2 2 0 01-2-2v-1a2 2 0 012-2h14a2 2 0 012 2v1z" stroke="#374151" strokeWidth="2"/>
            </svg>
          </button>
        </div>
        {/* Bottom map controls */}
        <div className="absolute bottom-3 right-3 flex flex-col gap-2">
          <button className="w-9 h-9 bg-white rounded-full shadow-md flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="3" fill="#2563EB"/>
              <path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="#2563EB" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
          <button className="w-9 h-9 bg-white rounded-full shadow-md flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 22s8-4 8-10a8 8 0 00-16 0c0 6 8 10 8 10z" stroke="#6b7280" strokeWidth="1.8"/>
              <circle cx="12" cy="12" r="3" stroke="#6b7280" strokeWidth="1.8"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Bottom sheet */}
      <div className="flex-1 bg-white rounded-t-3xl -mt-4 shadow-xl flex flex-col">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-gray-200 rounded-full"/>
        </div>

        <div className="px-5 pb-6 flex flex-col flex-1">
          {/* Status & ID row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-[#2563EB] text-white text-xs font-semibold rounded-full">Ready to Unlock</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className="font-medium">E-bike ID {CURRENT_BIKE.id}</span>
              <button>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <rect x="9" y="9" width="13" height="13" rx="2" stroke="#9ca3af" strokeWidth="2"/>
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="#9ca3af" strokeWidth="2"/>
                </svg>
              </button>
              <button className="text-[#2563EB] font-medium ml-1">Pricing Details ›</button>
            </div>
          </div>

          {/* Stats + bike image */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <div className="flex gap-6">
                <div>
                  <div className="flex items-end gap-0.5">
                    <span className="text-3xl font-bold text-gray-900">80</span>
                    <span className="text-base text-gray-500 mb-0.5 font-medium">%</span>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <BatteryIcon level={80}/>
                    <span className="text-xs text-gray-400 font-medium">Battery Level</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="#d1d5db" strokeWidth="2"/>
                      <path d="M12 16v-4M12 8h.01" stroke="#d1d5db" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <BatteryBar level={80}/>
                </div>
                <div>
                  <div className="flex items-end gap-0.5">
                    <span className="text-3xl font-bold text-gray-900">24</span>
                    <span className="text-base text-gray-500 mb-0.5 font-medium">km</span>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                      <path d="M3 12l1.5 1.5L9 9l4.5 6L18 9l1.5 3" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="text-xs text-gray-400 font-medium">Remaining Range</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="#d1d5db" strokeWidth="2"/>
                      <path d="M12 16v-4M12 8h.01" stroke="#d1d5db" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden mt-1.5">
                    <div className="h-full rounded-full bg-green-500" style={{ width: '80%' }}/>
                  </div>
                </div>
              </div>
            </div>
            <img
              src="https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=160&h=100&fit=crop&auto=format"
              alt="E-bike"
              className="w-28 h-20 object-cover rounded-xl"
            />
          </div>

          {/* Tags */}
          <div className="flex gap-2 mb-5">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-orange-200 bg-orange-50">
              <span className="text-orange-400 text-xs">👑</span>
              <span className="text-xs text-orange-600 font-medium">Level 3 • 2% OFF</span>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 bg-gray-50">
              <span className="text-xs text-gray-600 font-medium">Pricing Details</span>
              <span className="text-gray-400 text-xs">›</span>
            </button>
          </div>

          {/* Confirm button */}
          <button
            onClick={onConfirm}
            className="w-full py-4 bg-[#2563EB] text-white font-bold text-base rounded-2xl shadow-lg shadow-blue-200 active:scale-98 transition-transform"
          >
            Confirm Unlock
          </button>
        </div>
      </div>
    </div>
  )
}

function RecommendationModal({ onDecline, onAccept }: { onDecline: () => void; onAccept: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onDecline}/>
      <div className="relative w-full max-w-sm mx-4 bg-white rounded-3xl shadow-2xl p-5 mb-6 sm:mb-0 animate-[slideUp_0.35s_cubic-bezier(0.4,0,0.2,1)_forwards]"
        style={{ animation: 'slideUp 0.35s cubic-bezier(0.4,0,0.2,1) forwards' }}>
        <style>{`@keyframes slideUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }`}</style>

        {/* Compare header */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            { label: 'Current e-bike', bike: CURRENT_BIKE },
            { label: 'Recommended e-bike', bike: RECOMMENDED_BIKE },
          ].map(({ label, bike }) => (
            <div key={bike.id} className="text-center">
              <p className="text-xs font-semibold text-gray-500 mb-2">{label}</p>
              <div className="bg-gray-50 rounded-xl p-2 mb-2 h-20 flex items-center justify-center overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=160&h=100&fit=crop&auto=format"
                  alt="E-bike"
                  className="h-16 object-contain"
                />
              </div>
              <div className="flex items-center justify-center gap-1 mb-1">
                <BatteryIcon level={bike.battery}/>
                <span className="text-2xl font-bold text-gray-900">{bike.battery}</span>
                <span className="text-sm text-gray-400 font-medium">%</span>
              </div>
              <BatteryBar level={bike.battery}/>
              <p className="text-xs text-gray-400 mt-1.5">Remaining Range: {bike.range} km</p>
            </div>
          ))}
        </div>

        {/* Reward banner */}
        <div className="flex items-start gap-2 bg-blue-50 rounded-xl px-3.5 py-3 mb-4 border border-blue-100">
          <span className="text-lg mt-0.5">✨</span>
          <div>
            <p className="text-sm font-semibold text-gray-800">
              You've earned a <span className="text-[#2563EB]">€{RECOMMENDED_BIKE.reward}</span> cash reward
            </p>
            <p className="text-xs text-gray-500 mt-0.5">Ride the recommended e-bike nearby to earn your reward.</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onDecline}
            className="py-3.5 rounded-2xl border-2 border-gray-200 text-gray-700 font-semibold text-sm active:bg-gray-50 transition-colors"
          >
            No Thanks
          </button>
          <button
            onClick={onAccept}
            className="py-3.5 rounded-2xl bg-[#2563EB] text-white font-semibold text-sm shadow-md shadow-blue-200 active:scale-98 transition-transform"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}

function useTimer() {
  const [elapsed, setElapsed] = useState(0)
  const ref = useRef<ReturnType<typeof setInterval> | null>(null)
  useEffect(() => {
    ref.current = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => { if (ref.current) clearInterval(ref.current) }
  }, [])
  const mins = String(Math.floor(elapsed / 60)).padStart(2, '0')
  const secs = String(elapsed % 60).padStart(2, '0')
  return `${mins}:${secs}`
}

function SuccessScreen({ bike, earnedReward, onReset }: { bike: BikeData; earnedReward: boolean; onReset: () => void }) {
  const timer = useTimer()
  return (
    <div className="screen-enter flex flex-col min-h-screen bg-[#2563EB]">
      {/* Top success area */}
      <div className="flex flex-col items-center pt-16 pb-8 px-6 text-center">
        {/* Check icon */}
        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-5 ring-4 ring-white/30">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path d="M5 12l5 5L20 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white mb-1.5">Vehicle Unlocked</h1>
        <p className="text-white/70 text-sm font-medium">Successfully! Have a great ride 🎉</p>
      </div>

      {/* Main card */}
      <div className="flex-1 bg-white rounded-t-3xl px-5 pt-6 pb-8 flex flex-col gap-4">
        {/* Vehicle info card */}
        <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-4">
          <img
            src="https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=160&h=100&fit=crop&auto=format"
            alt="E-bike"
            className="w-24 h-16 object-cover rounded-xl"
          />
          <div className="flex-1">
            <p className="text-xs text-gray-400 font-medium mb-1">E-bike ID</p>
            <p className="text-base font-bold text-gray-900 mb-2">{bike.id}</p>
            <div className="flex gap-3">
              <div>
                <div className="flex items-center gap-1">
                  <BatteryIcon level={bike.battery}/>
                  <span className="text-sm font-bold text-gray-900">{bike.battery}%</span>
                </div>
                <p className="text-xs text-gray-400">Battery</p>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{bike.range} km</p>
                <p className="text-xs text-gray-400">Range</p>
              </div>
            </div>
          </div>
        </div>

        {/* Reward card (if earned) */}
        {earnedReward && (
          <div className="flex items-center gap-3 bg-green-50 border border-green-100 rounded-2xl p-4">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-xl flex-shrink-0">🎁</div>
            <div>
              <p className="text-sm font-semibold text-green-800">Reward Earned!</p>
              <p className="text-xs text-green-600 mt-0.5">€{RECOMMENDED_BIKE.reward} credit added to your wallet</p>
            </div>
            <div className="ml-auto text-xl font-bold text-green-600">+€{RECOMMENDED_BIKE.reward}</div>
          </div>
        )}

        {/* Timer card */}
        <div className="bg-[#2563EB]/5 border border-[#2563EB]/15 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium mb-1">Rental Duration</p>
            <p className="timer-tick text-3xl font-bold text-[#2563EB]">{timer}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 font-medium mb-1">Rate</p>
            <p className="text-sm font-semibold text-gray-700">€0.15<span className="text-xs font-normal text-gray-400">/min</span></p>
          </div>
        </div>

        {/* Pricing info */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Unlock Fee', value: '€1.00' },
            { label: 'Rate / min', value: '€0.15' },
            { label: 'Est. 30 min', value: '€5.50' },
          ].map(item => (
            <div key={item.label} className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-base font-bold text-gray-900">{item.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{item.label}</p>
            </div>
          ))}
        </div>

        <div className="flex-1"/>

        {/* End ride button */}
        <button
          onClick={onReset}
          className="w-full py-4 bg-red-500 text-white font-bold text-base rounded-2xl shadow-md shadow-red-100 active:scale-98 transition-transform"
        >
          End Ride
        </button>
      </div>
    </div>
  )
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('scan')
  const [showModal, setShowModal] = useState(false)
  const [selectedBike, setSelectedBike] = useState<BikeData>(CURRENT_BIKE)
  const [earnedReward, setEarnedReward] = useState(false)

  const handleConfirmUnlock = () => setShowModal(true)
  const handleDecline = () => {
    setShowModal(false)
    setSelectedBike(CURRENT_BIKE)
    setEarnedReward(false)
    setScreen('success')
  }
  const handleAccept = () => {
    setShowModal(false)
    setSelectedBike(RECOMMENDED_BIKE)
    setEarnedReward(true)
    setScreen('success')
  }
  const handleReset = () => {
    setScreen('scan')
    setShowModal(false)
    setSelectedBike(CURRENT_BIKE)
    setEarnedReward(false)
  }

  return (
    <div className="min-h-screen flex items-start justify-center bg-slate-200">
      <div className="w-full max-w-[390px] min-h-screen relative overflow-hidden bg-white shadow-2xl">
        {screen === 'scan' && <ScanScreen onScan={() => setScreen('vehicle')}/>}
        {screen === 'vehicle' && <VehicleScreen onConfirm={handleConfirmUnlock}/>}
        {screen === 'success' && <SuccessScreen bike={selectedBike} earnedReward={earnedReward} onReset={handleReset}/>}
        {showModal && <RecommendationModal onDecline={handleDecline} onAccept={handleAccept}/>}
      </div>
    </div>
  )
}
