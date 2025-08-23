export default function HomePage() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', 
      color: 'white',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '4rem 2rem',
      textAlign: 'center'
    }}>
      <h1 style={{ 
        fontSize: '4rem', 
        marginBottom: '1rem',
        background: 'linear-gradient(45deg, #10b981, #3b82f6)',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      }}>
        🦎 Omniverse Geckos
      </h1>
      
      <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem', opacity: 0.8 }}>
        Revolutionary Web3 Gaming Platform
      </h2>
      
      <p style={{ fontSize: '1.1rem', marginBottom: '3rem', opacity: 0.7, maxWidth: '600px', margin: '0 auto 3rem auto' }}>
        Play, earn, and collect in the ultimate Web3 gaming ecosystem. Tower defense meets NFT collecting.
      </p>
      
      <button style={{
        background: 'linear-gradient(45deg, #10b981, #3b82f6)',
        color: 'white',
        border: 'none',
        padding: '1rem 2rem',
        borderRadius: '8px',
        fontSize: '1.1rem',
        cursor: 'pointer',
        marginBottom: '4rem'
      }}>
        🚀 Join Early Access
      </button>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '2rem', borderRadius: '8px' }}>
          <h3 style={{ marginBottom: '1rem' }}>🎮 Play & Earn</h3>
          <p style={{ opacity: 0.8 }}>Defend your territory and earn real rewards</p>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '2rem', borderRadius: '8px' }}>
          <h3 style={{ marginBottom: '1rem' }}>🦎 Collect NFTs</h3>
          <p style={{ opacity: 0.8 }}>Unique Gecko NFTs with special abilities</p>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '2rem', borderRadius: '8px' }}>
          <h3 style={{ marginBottom: '1rem' }}>💎 Invest & Grow</h3>
          <p style={{ opacity: 0.8 }}>Join the Web3 gaming revolution</p>
        </div>
      </div>
      
      <div style={{ marginTop: '4rem', opacity: 0.6, fontSize: '0.9rem' }}>
        MVP is LIVE! 🎉 Building the future of Web3 gaming...
      </div>
    </div>
  )
}