'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAccount } from 'wagmi'
import { analytics, useInvestmentTracking } from '@/lib/analytics'
import { 
  Play, 
  Zap, 
  Trophy, 
  Coins, 
  Users, 
  TrendingUp,
  Star,
  Gamepad2,
  Wallet,
  Shield,
  Sparkles,
  ArrowRight,
  ChevronDown
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { HeroSection } from '@/components/sections/HeroSection'
import { FeaturesSection } from '@/components/sections/FeaturesSection'
import { StatsSection } from '@/components/sections/StatsSection'
import { RoadmapSection } from '@/components/sections/RoadmapSection'
import { TokenomicsSection } from '@/components/sections/TokenomicsSection'
import { TeamSection } from '@/components/sections/TeamSection'
import { ParticleBackground } from '@/components/ui/ParticleBackground'
import { AIAssistant, AIInsightsWidget, AIRecommendationsPanel } from '@/components/ai/AIAssistant'
import { useGeckoToken } from '@/blockchain/hooks/useGeckoToken'
import { useNFT } from '@/blockchain/hooks/useNFT'
import { usePersonalizationAI, useSmartRecommendations } from '@/ai/hooks/useAI'
import Image from 'next/image'
import Link from 'next/link'

// =============================================================================
// Main Component
// =============================================================================

export default function HomePage() {
  const { address } = useAccount()
  const { balance, formatTokenAmount } = useGeckoToken()
  const { ownedNFTs, totalSupply, maxSupply } = useNFT()
  const { trackPresaleView, trackWhitepaperDownload, trackInvestorDeckView } = useInvestmentTracking()
  
  const [currentSection, setCurrentSection] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  
  // Track investment page view
  useEffect(() => {
    trackPresaleView()
    analytics.track({
      category: 'investment',
      action: 'view_homepage',
      metadata: {
        page: 'homepage',
        walletConnected: !!address
      }
    })
  }, [trackPresaleView, address])
  
  // AI Integration
  const { personalizedExperience, generatePersonalizedExperience } = usePersonalizationAI()
  const { recommendations, generateRecommendations } = useSmartRecommendations()

  // Animation on mount
  useEffect(() => {
    setIsVisible(true)
    
    // Generate personalized experience when user connects
    if (address && !personalizedExperience) {
      generatePersonalizedExperience({
        current_session: {
          duration: 0,
          actions_taken: [],
          mood_indicators: ['Engaged'],
          performance_metrics: {
            success_rate: 0.8,
            efficiency_score: 0.7,
            engagement_level: 0.9
          }
        },
        recent_history: {
          last_7_days: {
            sessions: 5,
            achievements: [],
            purchases: [],
            social_activity: 0.3
          },
          trends: {
            engagement_trend: 'Increasing',
            skill_progression: 'Improving',
            spending_trend: 'Stable'
          }
        },
        contextual_factors: {
          time_of_day: new Date().getHours().toString(),
          day_of_week: new Date().toLocaleDateString('en', { weekday: 'long' }),
          seasonal_factors: ['Gaming Peak Hours'],
          device_type: 'Desktop',
          connection_quality: 'Good'
        }
      })
      
      // Generate smart recommendations
      generateRecommendations({
        currentActivity: 'homepage_browse',
        recentHistory: [],
        preferences: personalizedExperience?.ui_customization || {},
        performance: { winRate: 0.8, averageScore: 1200 }
      })
    }
  }, [address, personalizedExperience])

  // Scroll to section handler
  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ 
      behavior: 'smooth' 
    })
  }

  return (
    <>
      {/* Particle Background */}
      <ParticleBackground />
      
      <div className="relative overflow-hidden">
        {/* Hero Section */}
        <section id="hero" className="relative min-h-screen flex items-center justify-center">
          <div className="container mx-auto px-4 py-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-center max-w-6xl mx-auto"
            >
              {/* Main Title */}
              <div className="mb-8">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                  className="text-8xl mb-4"
                >
                  🦎
                </motion.div>
                <h1 className="text-6xl md:text-8xl font-bold mb-6 text-gradient neon-glow">
                  Omniverse Geckos
                </h1>
                <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
                  The ultimate Web3 gaming ecosystem where{' '}
                  <span className="text-primary font-semibold">tower defense</span> meets{' '}
                  <span className="text-purple-400 font-semibold">NFT collecting</span> with{' '}
                  <span className="text-yellow-400 font-semibold">play-to-earn</span> mechanics
                </p>
                
                {/* Investment Highlights */}
                <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                  <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm border border-green-500/30 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-400 mb-1">10,000 NFTs</div>
                    <div className="text-sm text-muted-foreground">Limited Supply Collection</div>
                  </div>
                  <div className="bg-gradient-to-r from-yellow-500/20 to-amber-500/20 backdrop-blur-sm border border-yellow-500/30 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-400 mb-1">$GECKO Token</div>
                    <div className="text-sm text-muted-foreground">Utility & Governance</div>
                  </div>
                  <div className="bg-gradient-to-r from-purple-500/20 to-violet-500/20 backdrop-blur-sm border border-purple-500/30 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-purple-400 mb-1">AI-Powered</div>
                    <div className="text-sm text-muted-foreground">Next-Gen Gaming</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
              >
                <Link href="/game">
                  <Button size="lg" className="btn-game text-lg px-8 py-6 h-auto">
                    <Play className="mr-2 h-5 w-5" />
                    Start Playing
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                
                <Link href="/marketplace">
                  <Button size="lg" variant="outline" className="text-lg px-8 py-6 h-auto">
                    <Sparkles className="mr-2 h-5 w-5" />
                    Explore NFTs
                  </Button>
                </Link>
                
                {!address && (
                  <Button size="lg" variant="secondary" className="text-lg px-8 py-6 h-auto">
                    <Wallet className="mr-2 h-5 w-5" />
                    Connect Wallet
                  </Button>
                )}
              </motion.div>

              {/* Live Stats */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
              >
                <div className="game-card p-6 text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {totalSupply.toLocaleString()}
                  </div>
                  <p className="text-sm text-muted-foreground">Geckos Minted</p>
                  <Progress 
                    value={(totalSupply / maxSupply) * 100} 
                    className="mt-2 h-2"
                  />
                </div>

                <div className="game-card p-6 text-center">
                  <div className="text-3xl font-bold text-yellow-400 mb-2">
                    15.7K+
                  </div>
                  <p className="text-sm text-muted-foreground">Active Players</p>
                </div>

                <div className="game-card p-6 text-center">
                  <div className="text-3xl font-bold text-green-400 mb-2">
                    $2.4M
                  </div>
                  <p className="text-sm text-muted-foreground">Total Rewards</p>
                </div>

                <div className="game-card p-6 text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-2">
                    847 ETH
                  </div>
                  <p className="text-sm text-muted-foreground">Trading Volume</p>
                </div>
              </motion.div>

              {/* Scroll Indicator */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 0.6 }}
                className="absolute bottom-8 left-1/2 transform -translate-x-1/2 cursor-pointer"
                onClick={() => scrollToSection('features')}
              >
                <ChevronDown className="h-8 w-8 text-muted-foreground animate-bounce" />
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Investment Opportunity Section */}
        <section className="py-20 bg-gradient-to-b from-primary/5 to-transparent">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-6xl font-bold mb-6 text-gradient">
                Investment Opportunity
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Early access to a revolutionary gaming ecosystem with multiple revenue streams and deflationary tokenomics
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
              {/* $GECKO Token */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="game-card p-8"
              >
                <div className="text-center mb-8">
                  <div className="text-6xl mb-4">💰</div>
                  <h3 className="text-3xl font-bold mb-4">$GECKO Token</h3>
                  <p className="text-muted-foreground mb-6">
                    Multi-utility token with deflationary mechanics and governance rights
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="font-medium">Total Supply</span>
                    <span className="text-primary font-bold">1,000,000,000</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="font-medium">Initial Burn</span>
                    <span className="text-orange-400 font-bold">10% Burned</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="font-medium">Play-to-Earn Pool</span>
                    <span className="text-green-400 font-bold">30%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="font-medium">Staking Rewards</span>
                    <span className="text-purple-400 font-bold">15% APY</span>
                  </div>
                </div>

                <div className="mt-8">
                  <h4 className="font-bold mb-4 text-yellow-400">Token Utility:</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Coins className="h-4 w-4 text-yellow-400" />
                      In-game purchases and upgrades
                    </li>
                    <li className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-orange-400" />
                      Tournament entry fees and prizes
                    </li>
                    <li className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-400" />
                      DAO governance voting rights
                    </li>
                    <li className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-purple-400" />
                      NFT breeding and evolution
                    </li>
                  </ul>
                </div>
              </motion.div>

              {/* NFT Collection */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="game-card p-8"
              >
                <div className="text-center mb-8">
                  <div className="text-6xl mb-4">🦎</div>
                  <h3 className="text-3xl font-bold mb-4">Genesis Geckos</h3>
                  <p className="text-muted-foreground mb-6">
                    Limited collection of 10,000 unique playable NFTs with utility and breeding mechanics
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="font-medium">Collection Size</span>
                    <span className="text-primary font-bold">10,000 NFTs</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="font-medium">Mint Price</span>
                    <span className="text-green-400 font-bold">0.08 ETH</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="font-medium">Rarities</span>
                    <span className="text-purple-400 font-bold">5 Levels</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="font-medium">Breeding System</span>
                    <span className="text-pink-400 font-bold">AI-Enhanced</span>
                  </div>
                </div>

                <div className="mt-8">
                  <h4 className="font-bold mb-4 text-purple-400">NFT Utility:</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-blue-400" />
                      Functional towers in tower defense
                    </li>
                    <li className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-yellow-400" />
                      Unique abilities and power-ups
                    </li>
                    <li className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-orange-400" />
                      Breeding to create new generations
                    </li>
                    <li className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-400" />
                      Passive income through gameplay
                    </li>
                  </ul>
                </div>
              </motion.div>
            </div>

            {/* Call to Action */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="text-center mt-16"
            >
              <div className="bg-gradient-to-r from-primary/20 to-purple-500/20 backdrop-blur-sm border border-primary/30 rounded-2xl p-8 max-w-2xl mx-auto">
                <h3 className="text-2xl font-bold mb-4">Early Investor Benefits</h3>
                <p className="text-muted-foreground mb-6">
                  Join our presale and get exclusive access to discounted tokens, rare NFTs, and founder privileges
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="btn-game">
                    <Coins className="mr-2 h-5 w-5" />
                    Buy $GECKO Tokens
                  </Button>
                  <Button size="lg" variant="outline" className="border-purple-500/50 text-purple-400 hover:bg-purple-500/20">
                    <Sparkles className="mr-2 h-5 w-5" />
                    Mint Genesis NFTs
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 relative">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-6xl font-bold mb-6 text-gradient">
                Game Features
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Experience the future of gaming with innovative Web3 mechanics and engaging gameplay
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1: Tower Defense */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="game-card h-full">
                  <CardHeader>
                    <div className="text-4xl mb-4">🏰</div>
                    <CardTitle className="text-xl">Epic Tower Defense</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Deploy your Gecko NFTs as powerful towers with unique abilities. 
                      Defend against waves of enemies in strategic battles.
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-yellow-400" />
                        50+ challenging levels
                      </li>
                      <li className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-blue-400" />
                        6 unique Gecko types
                      </li>
                      <li className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-400" />
                        Progressive difficulty
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Feature 2: NFT Collection */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <Card className="game-card h-full">
                  <CardHeader>
                    <div className="text-4xl mb-4">🎨</div>
                    <CardTitle className="text-xl">Collectible NFTs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Collect 10,000 unique Gecko NFTs with procedurally generated 
                      traits and abilities. Each one is functional in-game!
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-400" />
                        5 rarity levels
                      </li>
                      <li className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-purple-400" />
                        Breeding system
                      </li>
                      <li className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-400" />
                        Level up through gameplay
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Feature 3: Play to Earn */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
              >
                <Card className="game-card h-full">
                  <CardHeader>
                    <div className="text-4xl mb-4">💰</div>
                    <CardTitle className="text-xl">Play-to-Earn</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Earn $GECKO tokens by playing games, completing challenges, 
                      and participating in tournaments.
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <Coins className="h-4 w-4 text-yellow-400" />
                        Daily rewards
                      </li>
                      <li className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-orange-400" />
                        Tournament prizes
                      </li>
                      <li className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-400" />
                        Guild competitions
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Feature 4: Marketplace */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
              >
                <Card className="game-card h-full">
                  <CardHeader>
                    <div className="text-4xl mb-4">🏪</div>
                    <CardTitle className="text-xl">NFT Marketplace</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Trade your Geckos on our decentralized marketplace. 
                      Buy, sell, and auction with ETH or $GECKO tokens.
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-yellow-400" />
                        Instant trading
                      </li>
                      <li className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-blue-400" />
                        Secure escrow
                      </li>
                      <li className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-400" />
                        Price discovery
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Feature 5: Casino Games */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                viewport={{ once: true }}
              >
                <Card className="game-card h-full">
                  <CardHeader>
                    <div className="text-4xl mb-4">🎰</div>
                    <CardTitle className="text-xl">Mini-Games Casino</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Try your luck in our casino with slots, dice, and other 
                      exciting games using your $GECKO tokens.
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <Gamepad2 className="h-4 w-4 text-purple-400" />
                        Multiple games
                      </li>
                      <li className="flex items-center gap-2">
                        <Coins className="h-4 w-4 text-yellow-400" />
                        $GECKO betting
                      </li>
                      <li className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-orange-400" />
                        Jackpot prizes
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Feature 6: DAO Governance */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                viewport={{ once: true }}
              >
                <Card className="game-card h-full">
                  <CardHeader>
                    <div className="text-4xl mb-4">🗳️</div>
                    <CardTitle className="text-xl">DAO Governance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Shape the future of Omniverse Geckos by voting on proposals 
                      and participating in community governance.
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-400" />
                        Community voting
                      </li>
                      <li className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-green-400" />
                        Proposal system
                      </li>
                      <li className="flex items-center gap-2">
                        <Coins className="h-4 w-4 text-yellow-400" />
                        Token-based power
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Revenue Model Section */}
        <section className="py-20 bg-muted/20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-6xl font-bold mb-6 text-gradient">
                Revenue Streams
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Multiple revenue streams create sustainable value for token holders and NFT owners
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {/* Revenue Stream 1 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
                className="game-card p-6 text-center h-full"
              >
                <div className="text-4xl mb-4">💰</div>
                <h3 className="text-xl font-bold mb-3">Play-to-Earn</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Players earn $GECKO tokens through gameplay, creating constant token demand
                </p>
                <div className="text-2xl font-bold text-green-400">$50K+</div>
                <div className="text-xs text-muted-foreground">Monthly Distribution</div>
              </motion.div>

              {/* Revenue Stream 2 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="game-card p-6 text-center h-full"
              >
                <div className="text-4xl mb-4">🎰</div>
                <h3 className="text-xl font-bold mb-3">Casino Revenue</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  House edge from casino games generates consistent revenue
                </p>
                <div className="text-2xl font-bold text-yellow-400">2%</div>
                <div className="text-xs text-muted-foreground">House Edge</div>
              </motion.div>

              {/* Revenue Stream 3 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
                className="game-card p-6 text-center h-full"
              >
                <div className="text-4xl mb-4">🏪</div>
                <h3 className="text-xl font-bold mb-3">Marketplace Fees</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Transaction fees from NFT trading and marketplace activity
                </p>
                <div className="text-2xl font-bold text-purple-400">5%</div>
                <div className="text-xs text-muted-foreground">Trading Fee</div>
              </motion.div>

              {/* Revenue Stream 4 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
                className="game-card p-6 text-center h-full"
              >
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-xl font-bold mb-3">Breeding Fees</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  AI-powered breeding system generates fees and burns tokens
                </p>
                <div className="text-2xl font-bold text-pink-400">$25</div>
                <div className="text-xs text-muted-foreground">Per Breeding</div>
              </motion.div>
            </div>

            {/* Value Proposition */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              viewport={{ once: true }}
              className="mt-16 text-center"
            >
              <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 backdrop-blur-sm border border-primary/20 rounded-2xl p-8 max-w-4xl mx-auto">
                <h3 className="text-3xl font-bold mb-6">Why Omniverse Geckos?</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div>
                    <div className="text-2xl font-bold text-green-400 mb-2">Deflationary</div>
                    <p className="text-sm text-muted-foreground">
                      Token burns reduce supply, increasing scarcity and value over time
                    </p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-400 mb-2">AI-Enhanced</div>
                    <p className="text-sm text-muted-foreground">
                      First gaming platform with fully integrated AI personalization
                    </p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-400 mb-2">Sustainable</div>
                    <p className="text-sm text-muted-foreground">
                      Multiple revenue streams ensure long-term ecosystem health
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 bg-muted/20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-6xl font-bold mb-6 text-gradient">
                How It Works
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Get started in 3 simple steps and begin your Gecko adventure
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Step 1 */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="game-card p-8 mb-6">
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-primary">1</span>
                  </div>
                  <Wallet className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">Connect Wallet</h3>
                  <p className="text-muted-foreground">
                    Connect your Web3 wallet to start playing and earning
                  </p>
                </div>
              </motion.div>

              {/* Step 2 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="game-card p-8 mb-6">
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-primary">2</span>
                  </div>
                  <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">Get Your Geckos</h3>
                  <p className="text-muted-foreground">
                    Mint or buy unique Gecko NFTs to use as towers in the game
                  </p>
                </div>
              </motion.div>

              {/* Step 3 */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="game-card p-8 mb-6">
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-primary">3</span>
                  </div>
                  <Play className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">Play & Earn</h3>
                  <p className="text-muted-foreground">
                    Battle enemies, earn $GECKO tokens, and climb the leaderboards
                  </p>
                </div>
              </motion.div>
            </div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="text-center mt-12"
            >
              <Link href="/game">
                <Button size="lg" className="btn-game text-lg px-12 py-6 h-auto">
                  <Play className="mr-2 h-5 w-5" />
                  Start Your Journey
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* User Dashboard Preview (if connected) */}
        {address && (
          <section className="py-20">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <h2 className="text-4xl md:text-6xl font-bold mb-6 text-gradient">
                  Your Dashboard
                </h2>
                <p className="text-xl text-muted-foreground">
                  Welcome back, Gecko Master! Here's your current status
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="game-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">$GECKO Balance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-yellow-400">
                      {formatTokenAmount(balance)}
                    </div>
                    <p className="text-xs text-muted-foreground">Available for spending</p>
                  </CardContent>
                </Card>

                <Card className="game-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">NFTs Owned</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-400">
                      {ownedNFTs.length}
                    </div>
                    <p className="text-xs text-muted-foreground">Unique Geckos</p>
                  </CardContent>
                </Card>

                <Card className="game-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Games Played</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-400">
                      {/* This would come from user stats */}
                      42
                    </div>
                    <p className="text-xs text-muted-foreground">Total battles</p>
                  </CardContent>
                </Card>

                <Card className="game-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-400">
                      78%
                    </div>
                    <p className="text-xs text-muted-foreground">Victory percentage</p>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-8 text-center">
                <Link href="/dashboard">
                  <Button variant="outline" size="lg">
                    View Full Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Roadmap Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-6xl font-bold mb-6 text-gradient">
                Development Roadmap
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Our strategic plan to build the most advanced Web3 gaming ecosystem
              </p>
            </motion.div>

            <div className="max-w-4xl mx-auto">
              {/* Q4 2024 */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="game-card p-6 mb-8">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                      <span className="text-green-400 font-bold">✓</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Phase 1: Foundation (Q4 2024)</h3>
                      <div className="text-sm text-green-400">COMPLETED</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        Smart contracts deployment
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        Core game mechanics
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        NFT collection launch
                      </li>
                    </ul>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        Web3 integration
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        AI system integration
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        Initial marketplace
                      </li>
                    </ul>
                  </div>
                </div>
              </motion.div>

              {/* Q1 2025 */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="game-card p-6 mb-8">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
                      <span className="text-yellow-400 font-bold">⚡</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Phase 2: Expansion (Q1 2025)</h3>
                      <div className="text-sm text-yellow-400">IN PROGRESS</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                        Public token launch
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                        Advanced breeding system
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                        Tournament system
                      </li>
                    </ul>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                        Mobile app beta
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                        Partnership announcements
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                        DAO governance launch
                      </li>
                    </ul>
                  </div>
                </div>
              </motion.div>

              {/* Q2 2025 */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="game-card p-6 mb-8">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                      <span className="text-purple-400 font-bold">🚀</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Phase 3: Scale (Q2 2025)</h3>
                      <div className="text-sm text-purple-400">PLANNED</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                        Multi-chain expansion
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                        Advanced AI features
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                        Guild system launch
                      </li>
                    </ul>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                        Esports tournaments
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                        VR/AR integration
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                        Major exchange listings
                      </li>
                    </ul>
                  </div>
                </div>
              </motion.div>

              {/* Q3 2025 */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="game-card p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <span className="text-blue-400 font-bold">🌟</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Phase 4: Domination (Q3 2025)</h3>
                      <div className="text-sm text-blue-400">VISION</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        Metaverse integration
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        AI NPCs and companions
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        Custom game modes
                      </li>
                    </ul>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        Global championships
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        Educational partnerships
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        Ecosystem expansion
                      </li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Investment Call to Action */}
        <section className="py-20 bg-gradient-to-r from-primary/10 via-purple-500/10 to-primary/10">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-6xl font-bold mb-6 text-gradient">
                Join the Revolution
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                Don't miss your chance to invest in the future of gaming. Get early access to $GECKO tokens 
                and Genesis NFTs before public launch.
              </p>
              
              {/* Investment Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-12">
                <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 backdrop-blur-sm border border-green-500/20 rounded-xl p-6">
                  <div className="text-3xl font-bold text-green-400 mb-2">500%</div>
                  <div className="text-sm text-muted-foreground">Projected ROI Year 1</div>
                </div>
                <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 backdrop-blur-sm border border-yellow-500/20 rounded-xl p-6">
                  <div className="text-3xl font-bold text-yellow-400 mb-2">72 hours</div>
                  <div className="text-sm text-muted-foreground">Until Presale Ends</div>
                </div>
                <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6">
                  <div className="text-3xl font-bold text-purple-400 mb-2">15% APY</div>
                  <div className="text-sm text-muted-foreground">Staking Rewards</div>
                </div>
                <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 backdrop-blur-sm border border-blue-500/20 rounded-xl p-6">
                  <div className="text-3xl font-bold text-blue-400 mb-2">$2.4M</div>
                  <div className="text-sm text-muted-foreground">Total Value Locked</div>
                </div>
              </div>
              
              {/* Main CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Button size="lg" className="btn-game text-lg px-12 py-6 h-auto group">
                  <Coins className="mr-2 h-6 w-6 group-hover:animate-pulse" />
                  Buy $GECKO Tokens
                  <span className="ml-2 bg-yellow-400/20 text-yellow-400 px-2 py-1 rounded-full text-xs">
                    20% Bonus
                  </span>
                </Button>
                
                <Button size="lg" variant="outline" className="text-lg px-12 py-6 h-auto border-purple-500/50 text-purple-400 hover:bg-purple-500/20 group">
                  <Sparkles className="mr-2 h-6 w-6 group-hover:animate-spin" />
                  Mint Genesis NFTs
                  <span className="ml-2 bg-purple-400/20 text-purple-400 px-2 py-1 rounded-full text-xs">
                    Limited
                  </span>
                </Button>
              </div>
              
              {/* Security Badges */}
              <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-400" />
                  Smart Contracts Audited
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-400" />
                  Instant Liquidity
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-400" />
                  15K+ Community
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-purple-400" />
                  Deflationary Model
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  )
}