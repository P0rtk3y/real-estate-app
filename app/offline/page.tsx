'use client'
export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center bg-gray-50">
      <div className="text-7xl mb-6">🌸</div>
      <h1 className="text-2xl font-black text-gray-900 mb-3">
        Ồ không! No internet!
      </h1>
      <p className="text-gray-500 max-w-sm leading-relaxed mb-6">
        Bao is trying to find you a beautiful home but the wifi is not cooperating right now.
        Check your connection and she will be right back with new listings, she promises!
      </p>
      <div className="bg-white border border-gray-100 rounded-2xl p-5 max-w-xs shadow-sm">
        <p className="text-sm text-gray-600 leading-relaxed">
          <span className="font-semibold text-rose-600">Bao&apos;s tip:</span>{' '}
          In Sài Gòn, when the internet goes down, you go downstairs for phở.
          Consider this a phở break. 🍜
        </p>
      </div>
      <button
        onClick={() => window.location.reload()}
        className="mt-6 px-6 py-3 rounded-xl text-white font-medium"
        style={{ background: 'linear-gradient(135deg, #B5179E, #7209B7)' }}
      >
        Try Again
      </button>
    </div>
  )
}
