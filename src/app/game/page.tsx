'use client'

import { useState, useEffect, useRef } from 'react'
import { useAccount } from 'wagmi'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Settings, 
  Volume2, 
  VolumeX,
  Zap,
  Shield,
  Heart,
  Clock,
  Star,
  Trophy,
  Gamepad2,
  Target,
  Users,
  Coins
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useGame, useGameControls, useGameSettings } from '@/components/providers/GameProvider'
import { useGeckoToken } from '@/blockchain/hooks/useGeckoToken'
import { useNFT } from '@/blockchain/hooks/useNFT'
import { toast } from 'sonner'

// =============================================================================
// Game UI Components
// =============================================================================

function GameHUD({ gameState }: { gameState: any }) {
  if (!gameState) return null

  return (
    <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-start">
      {/* Left Side - Game Stats */}
      <div className="space-y-2">
        <Card className="game-hud">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-500" />
                <span className="font-bold text-red-500">
                  {gameState.lives || 20}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4 text-yellow-500" />
                <span className="font-bold text-yellow-500">
                  {gameState.gold || 100}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-purple-500" />
                <span className="font-bold">
                  {gameState.score || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="game-hud">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4" />
              <span className="text-sm font-medium">Wave {gameState.wave || 1}</span>
            </div>
            <Progress value={(gameState.waveProgress || 0) * 100} className="h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Right Side - Game Controls */}
      <div className="space-y-2">
        <GameControls />
      </div>
    </div>
  )
}

function GameControls() {
  const { isGameRunning, startGame, pauseGame, resumeGame, restartGame } = useGameControls()
  const { settings, updateSettings } = useGameSettings()
  const [gameSpeed, setGameSpeed] = useState(1)

  const handleSpeedChange = (speed: number) => {
    setGameSpeed(speed)
    // Apply speed to game engine
  }

  return (
    <Card className="game-hud">
      <CardContent className="p-4">
        <div className="flex items-center gap-2">
          {/* Play/Pause */}
          {isGameRunning ? (
            <Button size="sm" onClick={pauseGame} variant="outline">
              <Pause className="h-4 w-4" />
            </Button>
          ) : (
            <Button size="sm" onClick={resumeGame} className="btn-game">
              <Play className="h-4 w-4" />
            </Button>
          )}

          {/* Restart */}
          <Button size="sm" onClick={restartGame} variant="outline">
            <RotateCcw className="h-4 w-4" />
          </Button>

          {/* Speed Controls */}
          <div className="flex gap-1">
            {[1, 2, 4].map((speed) => (
              <Button
                key={speed}
                size="sm"
                variant={gameSpeed === speed ? "default" : "outline"}
                onClick={() => handleSpeedChange(speed)}
                className="w-8 h-8 p-0"
              >
                {speed}x
              </Button>
            ))}
          </div>

          {/* Sound Toggle */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
          >
            {settings.soundEnabled ? (
              <Volume2 className="h-4 w-4" />
            ) : (
              <VolumeX className="h-4 w-4" />
            )}
          </Button>

          {/* Settings */}
          <Button size="sm" variant="outline">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function TowerSelection({ onTowerSelect }: { onTowerSelect: (towerId: string) => void }) {
  const { ownedNFTs } = useNFT()
  
  const towers = [
    { id: 'fire-gecko', name: 'Fire Gecko', cost: 50, damage: 25, range: 80, emoji: '🔥', rarity: 'common' },
    { id: 'ice-gecko', name: 'Ice Gecko', cost: 75, damage: 20, range: 90, emoji: '❄️', rarity: 'uncommon' },
    { id: 'electric-gecko', name: 'Electric Gecko', cost: 100, damage: 35, range: 70, emoji: '⚡', rarity: 'rare' },
    { id: 'poison-gecko', name: 'Poison Gecko', cost: 125, damage: 30, range: 85, emoji: '☠️', rarity: 'epic' },
    { id: 'cosmic-gecko', name: 'Cosmic Gecko', cost: 200, damage: 50, range: 100, emoji: '🌟', rarity: 'legendary' }
  ]

  return (
    <div className="absolute bottom-4 left-4 right-4 z-10">
      <Card className="game-hud">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Deploy Towers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-2">
            {towers.map((tower) => (
              <motion.button
                key={tower.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onTowerSelect(tower.id)}
                className={`
                  p-3 rounded-lg border-2 transition-all duration-200 text-center
                  ${tower.rarity === 'common' ? 'border-gray-400 bg-gray-100/10' :
                    tower.rarity === 'uncommon' ? 'border-green-400 bg-green-100/10' :
                    tower.rarity === 'rare' ? 'border-blue-400 bg-blue-100/10' :
                    tower.rarity === 'epic' ? 'border-purple-400 bg-purple-100/10' :
                    'border-orange-400 bg-orange-100/10'}
                  hover:bg-white/20
                `}
              >
                <div className="text-2xl mb-1">{tower.emoji}</div>
                <div className="text-xs font-medium">{tower.name}</div>
                <div className="text-xs text-yellow-400 font-bold">{tower.cost}G</div>
                <div className="flex justify-between text-xs mt-1">
                  <span>⚔️{tower.damage}</span>
                  <span>🎯{tower.range}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// =============================================================================
// Main Game Component
// =============================================================================

export default function GamePage() {
  const { address, isConnected } = useAccount()
  const { balance } = useGeckoToken()
  const { ownedNFTs } = useNFT()
  const { gameEngine, gameState, isGameLoaded, isGameRunning } = useGame()
  
  const [selectedTower, setSelectedTower] = useState<string | null>(null)
  const [showInstructions, setShowInstructions] = useState(true)
  const gameCanvasRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Initialize game canvas when component mounts
    if (gameCanvasRef.current && gameEngine && isGameLoaded) {
      gameEngine.attachToContainer(gameCanvasRef.current)
    }
  }, [gameEngine, isGameLoaded])

  // Handle tower selection
  const handleTowerSelect = (towerId: string) => {
    setSelectedTower(towerId)
    toast.success(`Selected ${towerId}! Click on the battlefield to place it.`)
  }

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="min-h-screen flex items-center justify-center">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <div className="text-6xl mb-4">🦎</div>
              <CardTitle>Connect Your Wallet</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-6">
                You need to connect your wallet to play Omniverse Geckos and earn rewards.
              </p>
              <Button className="w-full btn-game">
                <Zap className="mr-2 h-4 w-4" />
                Connect Wallet
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (ownedNFTs.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="min-h-screen flex items-center justify-center">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <div className="text-6xl mb-4">🎮</div>
              <CardTitle>No Geckos Found</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-6">
                You need at least one Gecko NFT to play the game. Visit the marketplace to get your first Gecko!
              </p>
              <div className="space-y-3">
                <Button className="w-full btn-game" onClick={() => window.location.href = '/marketplace'}>
                  <Shield className="mr-2 h-4 w-4" />
                  Buy Geckos
                </Button>
                <Button variant="outline" className="w-full">
                  <Star className="mr-2 h-4 w-4" />
                  Mint Free Gecko
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-slate-900 to-slate-800 overflow-hidden">
      {/* Instructions Modal */}
      <AnimatePresence>
        {showInstructions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <Card className="max-w-2xl mx-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gamepad2 className="h-5 w-5" />
                    How to Play Omniverse Geckos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Target className="h-4 w-4 text-blue-500" />
                        Objective
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Defend your base by placing Gecko towers along the path. Defeat all enemies to win!
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Shield className="h-4 w-4 text-green-500" />
                        Towers
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Use your NFT Geckos as towers. Each type has unique abilities and stats.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Coins className="h-4 w-4 text-yellow-500" />
                        Economy
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Earn gold by defeating enemies. Spend it on new towers and upgrades.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-purple-500" />
                        Rewards
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Earn $GECKO tokens for victories and high scores!
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex justify-center pt-4">
                    <Button 
                      onClick={() => setShowInstructions(false)}
                      className="btn-game"
                    >
                      <Play className="mr-2 h-4 w-4" />
                      Start Playing!
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Canvas Container */}
      <div 
        ref={gameCanvasRef}
        className="w-full h-full bg-gradient-to-br from-green-900/20 via-blue-900/20 to-purple-900/20"
        style={{
          backgroundImage: `
            radial-gradient(circle at 25% 25%, rgba(34, 197, 94, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)
          `
        }}
      >
        {/* Loading State */}
        {!isGameLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Card className="game-hud">
              <CardContent className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-lg font-semibold">Loading Game Engine...</p>
                <p className="text-sm text-muted-foreground">
                  Initializing Phaser.js and game systems
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Game is ready but not started */}
        {isGameLoaded && !isGameRunning && !gameState && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Card className="game-hud">
              <CardContent className="p-8 text-center">
                <div className="text-6xl mb-4">🦎</div>
                <h2 className="text-2xl font-bold mb-4">Ready to Battle!</h2>
                <p className="text-muted-foreground mb-6">
                  Your Geckos are ready for action. Choose your strategy and defend the realm!
                </p>
                <Button 
                  onClick={() => {/* Start game logic */}}
                  className="btn-game"
                  size="lg"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Begin Defense
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Game UI Overlay */}
      {isGameLoaded && (
        <>
          <GameHUD gameState={gameState} />
          <TowerSelection onTowerSelect={handleTowerSelect} />
        </>
      )}

      {/* Player Stats Sidebar */}
      <div className="absolute top-4 right-4 w-64 space-y-4 z-20">
        <Card className="game-hud">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Player Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>$GECKO Balance:</span>
              <span className="font-bold text-green-500">{balance}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Owned Geckos:</span>
              <span className="font-bold text-purple-500">{ownedNFTs.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Games Played:</span>
              <span className="font-bold">42</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Win Rate:</span>
              <span className="font-bold text-blue-500">78%</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}