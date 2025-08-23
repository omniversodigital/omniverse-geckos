export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            🦎 Omniverse Geckos
          </h1>
          <h2 className="text-2xl mb-8 text-slate-300">
            Revolutionary Web3 Gaming Platform
          </h2>
          <p className="text-lg mb-12 text-slate-400 max-w-2xl mx-auto">
            Play, earn, and collect in the ultimate Web3 gaming ecosystem. 
            Tower defense meets NFT collecting with play-to-earn mechanics.
          </p>
          
          <div className="space-y-4">
            <button className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-all">
              🚀 Join Early Access
            </button>
            <div className="text-slate-500">
              MVP is LIVE! More features coming soon...
            </div>
          </div>
        </div>
        
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="bg-slate-800/50 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-3">🎮 Play & Earn</h3>
            <p className="text-slate-400">Defend your territory and earn real rewards</p>
          </div>
          <div className="bg-slate-800/50 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-3">🦎 Collect NFTs</h3>
            <p className="text-slate-400">Unique Gecko NFTs with special abilities</p>
          </div>
          <div className="bg-slate-800/50 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-3">💎 Invest & Grow</h3>
            <p className="text-slate-400">Join the Web3 gaming revolution</p>
          </div>
        </div>
      </div>
    </div>
  )
}