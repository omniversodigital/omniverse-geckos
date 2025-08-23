'use client'

import { useState, useEffect } from 'react'
import { useAccount, useBalance } from 'wagmi'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Dice1, Dice2, Dice3, Dice4, Dice5, Dice6,
  Coins, Trophy, Star, Zap, Crown, Diamond,
  Play, Pause, Volume2, VolumeX, Settings,
  TrendingUp, Clock, Award
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useGeckoToken } from '@/blockchain/hooks/useGeckoToken'
import { toast } from 'sonner'

// =============================================================================
// Types
// =============================================================================

interface GameStats {
  totalPlayed: number
  totalWon: number
  totalLost: number
  biggestWin: number
  winStreak: number
  currentStreak: number
}

interface SlotSymbol {
  id: string
  icon: React.ReactNode
  value: number
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary'
  color: string
}

// =============================================================================
// Game Data
// =============================================================================

const SLOT_SYMBOLS: SlotSymbol[] = [
  { id: 'gecko-common', icon: '🦎', value: 2, rarity: 'common', color: '#808080' },
  { id: 'fire', icon: '🔥', value: 3, rarity: 'common', color: '#ff4500' },
  { id: 'ice', icon: '❄️', value: 3, rarity: 'common', color: '#87ceeb' },
  { id: 'electric', icon: '⚡', value: 4, rarity: 'uncommon', color: '#ffff00' },
  { id: 'poison', icon: '☠️', value: 4, rarity: 'uncommon', color: '#9acd32' },
  { id: 'cosmic', icon: '🌟', value: 8, rarity: 'rare', color: '#ff69b4' },
  { id: 'gecko-legendary', icon: '👑', value: 20, rarity: 'legendary', color: '#ff8000' },
  { id: 'diamond', icon: '💎', value: 50, rarity: 'legendary', color: '#00ffff' },
]

const DICE_ICONS = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6]

// =============================================================================
// Main Component
// =============================================================================

export default function CasinoPage() {
  const { address } = useAccount()
  const { balance, formatTokenAmount } = useGeckoToken()
  
  const [selectedGame, setSelectedGame] = useState<string>('slots')
  const [isPlaying, setIsPlaying] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [gameStats, setGameStats] = useState<GameStats>({
    totalPlayed: 0,
    totalWon: 0,
    totalLost: 0,
    biggestWin: 0,
    winStreak: 0,
    currentStreak: 0
  })

  // Load user stats
  useEffect(() => {
    if (address) {
      // Load from localStorage or API
      const savedStats = localStorage.getItem(`casino-stats-${address}`)
      if (savedStats) {
        setGameStats(JSON.parse(savedStats))
      }
    }
  }, [address])

  const saveStats = (newStats: GameStats) => {
    setGameStats(newStats)
    if (address) {
      localStorage.setItem(`casino-stats-${address}`, JSON.stringify(newStats))
    }
  }

  if (!address) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-20">
          <div className="text-6xl mb-6">🎰</div>
          <h2 className="text-3xl font-bold mb-4">Connect Your Wallet</h2>
          <p className="text-muted-foreground mb-6">
            Connect your wallet to access the Gecko Casino and start playing!
          </p>
          <Button size="lg">Connect Wallet</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-red-500 to-purple-600 bg-clip-text text-transparent">
              🎰 Gecko Casino
            </h1>
            <p className="text-muted-foreground mt-2">
              Play mini-games, win $GECKO tokens, and have fun!
            </p>
          </div>
          
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Your Balance</p>
            <p className="text-2xl font-bold text-green-500">
              {formatTokenAmount(balance)} $GECKO
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-500">{gameStats.totalPlayed}</div>
              <p className="text-xs text-muted-foreground">Games Played</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-500">{gameStats.totalWon}</div>
              <p className="text-xs text-muted-foreground">Games Won</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-500">{gameStats.biggestWin}</div>
              <p className="text-xs text-muted-foreground">Biggest Win</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-500">{gameStats.currentStreak}</div>
              <p className="text-xs text-muted-foreground">Win Streak</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Game Selection */}
      <Tabs value={selectedGame} onValueChange={setSelectedGame} className="mb-8">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="slots" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Slots
          </TabsTrigger>
          <TabsTrigger value="dice" className="flex items-center gap-2">
            <Dice1 className="h-4 w-4" />
            Dice
          </TabsTrigger>
          <TabsTrigger value="wheel" className="flex items-center gap-2">
            <Crown className="h-4 w-4" />
            Wheel
          </TabsTrigger>
          <TabsTrigger value="coinflip" className="flex items-center gap-2">
            <Coins className="h-4 w-4" />
            Coin Flip
          </TabsTrigger>
        </TabsList>

        <TabsContent value="slots">
          <SlotMachine 
            balance={balance} 
            onStatsUpdate={saveStats} 
            currentStats={gameStats}
            soundEnabled={soundEnabled}
          />
        </TabsContent>

        <TabsContent value="dice">
          <DiceGame 
            balance={balance} 
            onStatsUpdate={saveStats} 
            currentStats={gameStats}
            soundEnabled={soundEnabled}
          />
        </TabsContent>

        <TabsContent value="wheel">
          <WheelGame 
            balance={balance} 
            onStatsUpdate={saveStats} 
            currentStats={gameStats}
            soundEnabled={soundEnabled}
          />
        </TabsContent>

        <TabsContent value="coinflip">
          <CoinFlipGame 
            balance={balance} 
            onStatsUpdate={saveStats} 
            currentStats={gameStats}
            soundEnabled={soundEnabled}
          />
        </TabsContent>
      </Tabs>

      {/* Settings */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              <Label>Sound Effects</Label>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setSoundEnabled(!soundEnabled)}
            >
              {soundEnabled ? 'On' : 'Off'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// =============================================================================
// Slot Machine Component
// =============================================================================

interface GameProps {
  balance: string
  onStatsUpdate: (stats: GameStats) => void
  currentStats: GameStats
  soundEnabled: boolean
}

function SlotMachine({ balance, onStatsUpdate, currentStats, soundEnabled }: GameProps) {
  const [betAmount, setBetAmount] = useState('10')
  const [isSpinning, setIsSpinning] = useState(false)
  const [reels, setReels] = useState([0, 0, 0])
  const [lastWin, setLastWin] = useState(0)

  const spin = async () => {
    const bet = parseInt(betAmount)
    if (bet > parseInt(balance)) {
      toast.error('Insufficient balance!')
      return
    }

    setIsSpinning(true)
    setLastWin(0)

    // Simulate spinning animation
    const spinDuration = 2000
    const spinInterval = setInterval(() => {
      setReels([
        Math.floor(Math.random() * SLOT_SYMBOLS.length),
        Math.floor(Math.random() * SLOT_SYMBOLS.length),
        Math.floor(Math.random() * SLOT_SYMBOLS.length)
      ])
    }, 100)

    setTimeout(() => {
      clearInterval(spinInterval)
      
      // Final result
      const finalReels = [
        Math.floor(Math.random() * SLOT_SYMBOLS.length),
        Math.floor(Math.random() * SLOT_SYMBOLS.length),
        Math.floor(Math.random() * SLOT_SYMBOLS.length)
      ]
      
      setReels(finalReels)
      
      // Calculate win
      const symbols = finalReels.map(i => SLOT_SYMBOLS[i])
      let winAmount = 0
      
      // Three of a kind
      if (symbols[0].id === symbols[1].id && symbols[1].id === symbols[2].id) {
        winAmount = bet * symbols[0].value
        toast.success(`🎉 THREE OF A KIND! Won ${winAmount} $GECKO!`)
      }
      // Two of a kind
      else if (symbols[0].id === symbols[1].id || symbols[1].id === symbols[2].id || symbols[0].id === symbols[2].id) {
        const matchedSymbol = symbols[0].id === symbols[1].id ? symbols[0] : 
                             symbols[1].id === symbols[2].id ? symbols[1] : symbols[0]
        winAmount = bet * (matchedSymbol.value / 2)
        toast.success(`🎊 Two of a kind! Won ${winAmount} $GECKO!`)
      }
      
      setLastWin(winAmount)
      
      // Update stats
      const newStats = {
        ...currentStats,
        totalPlayed: currentStats.totalPlayed + 1,
        totalWon: winAmount > 0 ? currentStats.totalWon + 1 : currentStats.totalWon,
        totalLost: winAmount === 0 ? currentStats.totalLost + 1 : currentStats.totalLost,
        biggestWin: Math.max(currentStats.biggestWin, winAmount),
        currentStreak: winAmount > 0 ? currentStats.currentStreak + 1 : 0,
        winStreak: Math.max(currentStats.winStreak, winAmount > 0 ? currentStats.currentStreak + 1 : 0)
      }
      
      onStatsUpdate(newStats)
      setIsSpinning(false)
    }, spinDuration)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">🎰 Gecko Slots</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Reels */}
        <div className="flex justify-center">
          <div className="bg-gradient-to-b from-yellow-400 to-yellow-600 p-4 rounded-lg border-4 border-yellow-500">
            <div className="flex gap-2">
              {reels.map((reelIndex, i) => (
                <motion.div
                  key={i}
                  className="w-20 h-20 bg-white rounded-lg flex items-center justify-center text-3xl border-2 border-gray-300 shadow-inner"
                  animate={isSpinning ? { 
                    rotateY: [0, 360],
                    transition: { duration: 0.3, repeat: Infinity }
                  } : {}}
                >
                  <span style={{ color: SLOT_SYMBOLS[reelIndex].color }}>
                    {SLOT_SYMBOLS[reelIndex].icon}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Last Win Display */}
        <AnimatePresence>
          {lastWin > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="text-center"
            >
              <div className="text-3xl font-bold text-green-500">
                +{lastWin} $GECKO
              </div>
              <p className="text-sm text-muted-foreground">You won!</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bet Controls */}
        <div className="space-y-4">
          <div className="flex items-center gap-4 justify-center">
            <Label htmlFor="bet-amount">Bet Amount:</Label>
            <Input
              id="bet-amount"
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              min="1"
              max={balance}
              className="w-24"
              disabled={isSpinning}
            />
            <span className="text-sm text-muted-foreground">$GECKO</span>
          </div>

          <div className="flex justify-center gap-2">
            <Button onClick={() => setBetAmount('10')} variant="outline" size="sm" disabled={isSpinning}>
              10
            </Button>
            <Button onClick={() => setBetAmount('50')} variant="outline" size="sm" disabled={isSpinning}>
              50
            </Button>
            <Button onClick={() => setBetAmount('100')} variant="outline" size="sm" disabled={isSpinning}>
              100
            </Button>
            <Button onClick={() => setBetAmount(Math.floor(parseInt(balance) / 2).toString())} variant="outline" size="sm" disabled={isSpinning}>
              Half
            </Button>
          </div>

          <Button 
            onClick={spin} 
            disabled={isSpinning || parseInt(betAmount) > parseInt(balance)}
            className="w-full"
            size="lg"
          >
            {isSpinning ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Spinning...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Spin ({betAmount} $GECKO)
              </>
            )}
          </Button>
        </div>

        {/* Paytable */}
        <div className="border rounded-lg p-4">
          <h4 className="font-semibold mb-3 text-center">Paytable</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {SLOT_SYMBOLS.map((symbol) => (
              <div key={symbol.id} className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span style={{ color: symbol.color }}>{symbol.icon}</span>
                  <Badge variant="secondary" className="text-xs">3x</Badge>
                </span>
                <span className="font-medium">{symbol.value}x</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// =============================================================================
// Dice Game Component
// =============================================================================

function DiceGame({ balance, onStatsUpdate, currentStats, soundEnabled }: GameProps) {
  const [betAmount, setBetAmount] = useState('20')
  const [prediction, setPrediction] = useState<'under' | 'over'>('under')
  const [targetNumber, setTargetNumber] = useState(50)
  const [isRolling, setIsRolling] = useState(false)
  const [lastRoll, setLastRoll] = useState<number | null>(null)
  const [lastWin, setLastWin] = useState(0)

  const rollDice = async () => {
    const bet = parseInt(betAmount)
    if (bet > parseInt(balance)) {
      toast.error('Insufficient balance!')
      return
    }

    setIsRolling(true)
    setLastWin(0)

    // Simulate rolling
    setTimeout(() => {
      const roll = Math.floor(Math.random() * 100) + 1
      setLastRoll(roll)
      
      let won = false
      if (prediction === 'under' && roll < targetNumber) {
        won = true
      } else if (prediction === 'over' && roll > targetNumber) {
        won = true
      }

      let winAmount = 0
      if (won) {
        const multiplier = prediction === 'under' ? 
          (100 / targetNumber) : 
          (100 / (100 - targetNumber))
        winAmount = Math.floor(bet * multiplier * 0.95) // 5% house edge
        toast.success(`🎉 You won ${winAmount} $GECKO!`)
      } else {
        toast.error(`😅 You lost! Roll was ${roll}`)
      }

      setLastWin(winAmount)
      
      // Update stats
      const newStats = {
        ...currentStats,
        totalPlayed: currentStats.totalPlayed + 1,
        totalWon: won ? currentStats.totalWon + 1 : currentStats.totalWon,
        totalLost: won ? currentStats.totalLost : currentStats.totalLost + 1,
        biggestWin: Math.max(currentStats.biggestWin, winAmount),
        currentStreak: won ? currentStats.currentStreak + 1 : 0,
        winStreak: Math.max(currentStats.winStreak, won ? currentStats.currentStreak + 1 : 0)
      }
      
      onStatsUpdate(newStats)
      setIsRolling(false)
    }, 2000)
  }

  const winChance = prediction === 'under' ? targetNumber - 1 : 100 - targetNumber
  const multiplier = (100 / winChance) * 0.95

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">🎲 Dice Roll</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Dice Display */}
        <div className="flex justify-center">
          <motion.div
            className="w-32 h-32 bg-gradient-to-br from-red-400 to-red-600 rounded-xl flex items-center justify-center text-6xl text-white shadow-lg border-2 border-red-500"
            animate={isRolling ? { 
              rotateX: [0, 360, 720],
              rotateY: [0, 360, 720],
              transition: { duration: 2, ease: "easeInOut" }
            } : {}}
          >
            {lastRoll || '?'}
          </motion.div>
        </div>

        {/* Last Win Display */}
        <AnimatePresence>
          {lastWin > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="text-center"
            >
              <div className="text-3xl font-bold text-green-500">
                +{lastWin} $GECKO
              </div>
              <p className="text-sm text-muted-foreground">You won!</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Game Controls */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant={prediction === 'under' ? 'default' : 'outline'}
              onClick={() => setPrediction('under')}
              disabled={isRolling}
            >
              Roll Under {targetNumber}
            </Button>
            <Button
              variant={prediction === 'over' ? 'default' : 'outline'}
              onClick={() => setPrediction('over')}
              disabled={isRolling}
            >
              Roll Over {targetNumber}
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Target Number: {targetNumber}</Label>
            <input
              type="range"
              min="2"
              max="98"
              value={targetNumber}
              onChange={(e) => setTargetNumber(parseInt(e.target.value))}
              disabled={isRolling}
              className="w-full"
            />
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>Win Chance: {winChance}%</p>
            <p>Multiplier: {multiplier.toFixed(2)}x</p>
          </div>

          <div className="flex items-center gap-4 justify-center">
            <Label htmlFor="dice-bet">Bet Amount:</Label>
            <Input
              id="dice-bet"
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              min="1"
              max={balance}
              className="w-24"
              disabled={isRolling}
            />
            <span className="text-sm text-muted-foreground">$GECKO</span>
          </div>

          <Button 
            onClick={rollDice} 
            disabled={isRolling || parseInt(betAmount) > parseInt(balance)}
            className="w-full"
            size="lg"
          >
            {isRolling ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Rolling...
              </>
            ) : (
              <>
                <Dice1 className="mr-2 h-4 w-4" />
                Roll Dice ({betAmount} $GECKO)
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// =============================================================================
// Wheel Game Component
// =============================================================================

function WheelGame({ balance, onStatsUpdate, currentStats, soundEnabled }: GameProps) {
  // Simplified wheel game implementation
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">🎡 Wheel of Fortune</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-20">
          <Crown className="mx-auto h-16 w-16 text-yellow-500 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Coming Soon!</h3>
          <p className="text-muted-foreground">
            The Wheel of Fortune is under development. Check back later for this exciting game!
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

// =============================================================================
// Coin Flip Game Component
// =============================================================================

function CoinFlipGame({ balance, onStatsUpdate, currentStats, soundEnabled }: GameProps) {
  // Simplified coin flip game implementation
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">🪙 Coin Flip</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-20">
          <Coins className="mx-auto h-16 w-16 text-yellow-500 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Coming Soon!</h3>
          <p className="text-muted-foreground">
            The Coin Flip game is under development. Check back later for this classic game!
          </p>
        </div>
      </CardContent>
    </Card>
  )
}