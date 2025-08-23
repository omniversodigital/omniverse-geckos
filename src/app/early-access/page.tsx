import type { Metadata } from 'next'
import { EarlyAccessForm } from '@/components/forms/EarlyAccessForm'
import { ParticleBackground } from '@/components/ui/ParticleBackground'

export const metadata: Metadata = {
  title: 'Early Access - Join the Future of Web3 Gaming',
  description: 'Get exclusive early access to Omniverse Geckos. Be among the first to play, earn, and collect in our revolutionary Web3 gaming ecosystem.',
  keywords: [
    'early access',
    'web3 gaming',
    'NFT games',
    'play-to-earn',
    'gaming waitlist',
    'blockchain gaming',
    'beta access'
  ],
  openGraph: {
    title: 'Early Access - Omniverse Geckos',
    description: 'Join thousands of gamers, investors, and Web3 enthusiasts in our exclusive early access program.',
    images: ['/images/early-access-og.png']
  },
  twitter: {
    title: 'Early Access - Omniverse Geckos',
    description: 'Get exclusive early access to the future of Web3 gaming 🦎🎮',
    images: ['/images/early-access-og.png']
  }
}

export default function EarlyAccessPage() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      {/* Animated Background */}
      <ParticleBackground />
      
      {/* Hero Section */}
      <div className="relative z-10 pt-20 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Content */}
          <div className="text-center mb-16">
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                <span className="text-yellow-400 mr-2">⚡</span>
                <span className="text-white text-sm font-medium">Limited Early Access Spots Available</span>
              </div>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Join the
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
                Future of Gaming
              </span>
            </h1>
            
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Get exclusive early access to <strong>Omniverse Geckos</strong> - the revolutionary Web3 gaming platform 
              where you can play, earn, and collect unique NFTs while building your digital empire.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">1,000+</div>
                <div className="text-sm text-gray-400">Early Access Spots</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">$GECKO</div>
                <div className="text-sm text-gray-400">Native Token</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">10K+</div>
                <div className="text-sm text-gray-400">Unique NFTs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">Play2Earn</div>
                <div className="text-sm text-gray-400">Mechanics</div>
              </div>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Benefits Section */}
            <div className="space-y-8">
              <h2 className="text-3xl font-bold text-white mb-8">
                Why Join Early Access?
              </h2>
              
              {/* Benefit Cards */}
              <div className="space-y-6">
                <div className="flex items-start space-x-4 p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                  <div className="flex-shrink-0 w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🎮</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Exclusive Game Access</h3>
                    <p className="text-gray-300">
                      Be among the first to experience our revolutionary tower defense gameplay with Web3 integration
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🖼️</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Limited Edition NFTs</h3>
                    <p className="text-gray-300">
                      Get priority access to rare Gecko NFTs with unique abilities and exclusive artwork
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                  <div className="flex-shrink-0 w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">💰</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Token Presale Access</h3>
                    <p className="text-gray-300">
                      Priority access to $GECKO token presale with special early bird pricing
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                  <div className="flex-shrink-0 w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🤝</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">VIP Community</h3>
                    <p className="text-gray-300">
                      Join our exclusive Discord community with direct access to the development team
                    </p>
                  </div>
                </div>
              </div>

              {/* Social Proof */}
              <div className="p-6 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-xl border border-green-500/20">
                <h3 className="text-lg font-semibold text-white mb-4">Join Thousands of Early Adopters</h3>
                <div className="flex items-center space-x-4">
                  <div className="flex -space-x-2">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full border-2 border-gray-800 flex items-center justify-center text-xs font-bold text-white"
                      >
                        🦎
                      </div>
                    ))}
                  </div>
                  <div className="text-sm text-gray-300">
                    <strong className="text-green-400">2,847+</strong> people have already joined
                  </div>
                </div>
              </div>
            </div>

            {/* Form Section */}
            <div className="lg:sticky lg:top-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8">
                <EarlyAccessForm 
                  onSuccess={() => {
                    // Optional: scroll to success message or redirect
                    console.log('Early access signup completed!')
                  }}
                />
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-20">
            <h2 className="text-3xl font-bold text-white text-center mb-12">
              Frequently Asked Questions
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="space-y-6">
                <div className="p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-3">When will early access begin?</h3>
                  <p className="text-gray-300 text-sm">
                    Early access will begin in Q1 2024. All registered members will receive email notifications 
                    with access details and instructions.
                  </p>
                </div>

                <div className="p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-3">Is early access free?</h3>
                  <p className="text-gray-300 text-sm">
                    Yes! Early access to the platform is completely free. You'll also receive exclusive 
                    bonuses and rewards for being an early supporter.
                  </p>
                </div>

                <div className="p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-3">Do I need a crypto wallet?</h3>
                  <p className="text-gray-300 text-sm">
                    While having a wallet is recommended for the full Web3 experience, it's not required 
                    to join early access. We'll provide easy onboarding for newcomers.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-3">What platforms will be supported?</h3>
                  <p className="text-gray-300 text-sm">
                    Initially, we're launching on web browsers with mobile apps coming soon after. 
                    The game will be accessible on desktop and mobile devices.
                  </p>
                </div>

                <div className="p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-3">Can I earn real money?</h3>
                  <p className="text-gray-300 text-sm">
                    Yes! Through our play-to-earn mechanics, you can earn $GECKO tokens and rare NFTs 
                    that have real-world value and can be traded on marketplaces.
                  </p>
                </div>

                <div className="p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-3">How do I get updates?</h3>
                  <p className="text-gray-300 text-sm">
                    Join our Discord community and follow us on social media for the latest updates, 
                    sneak peeks, and exclusive announcements.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-20 text-center">
            <div className="p-8 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-2xl border border-green-500/30">
              <h2 className="text-2xl font-bold text-white mb-4">
                Ready to Shape the Future of Gaming?
              </h2>
              <p className="text-gray-300 mb-6">
                Don't miss out on this opportunity to be part of something revolutionary. 
                Spots are limited and filling up fast!
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a
                  href="#early-access-form"
                  className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors"
                >
                  Join Early Access
                </a>
                <a
                  href="/whitepaper"
                  className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg border border-white/20 transition-colors"
                >
                  Read Whitepaper
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}