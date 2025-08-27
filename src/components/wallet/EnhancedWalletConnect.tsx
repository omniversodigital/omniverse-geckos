'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Wallet, 
  ChevronDown, 
  ExternalLink, 
  Copy, 
  Check, 
  AlertCircle, 
  Shield, 
  Zap,
  RefreshCw,
  Settings,
  LogOut,
  Activity,
  TrendingUp,
  Coins,
  Eye,
  EyeOff,
  Network,
  Gas,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Plus
} from 'lucide-react'
import { useAccount, useBalance, useDisconnect, useChainId, useSwitchChain } from 'wagmi'
import { useConnectModal, useAccountModal, useChainModal } from '@rainbow-me/rainbowkit'
import { formatEther, parseEther } from 'viem'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { 
  shortenAddress, 
  formatTokenAmount, 
  getChainConfig, 
  estimateGasPrice,
  getRecentTransactions,
  CONTRACT_ADDRESSES
} from '@/blockchain/hooks/useWeb3'
import { cn } from '@/lib/utils'

// =============================================================================
// Enhanced Types
// =============================================================================

interface WalletStats {
  totalValue: number
  geckoTokens: number
  nftCount: number
  transactionCount: number
  gasSaved: number
  stakingRewards: number
}

interface NetworkStatus {
  isConnected: boolean
  latency: number
  gasPrice: {
    slow: bigint
    standard: bigint
    fast: bigint
  }
  blockNumber: number
}

interface EnhancedWalletConnectProps {
  className?: string
  showBalance?: boolean
  showNetworkStatus?: boolean
  showTransactionHistory?: boolean
  compact?: boolean
}

// =============================================================================
// Enhanced Wallet Connect Component
// =============================================================================

export function EnhancedWalletConnect({ 
  className,
  showBalance = true,
  showNetworkStatus = true, 
  showTransactionHistory = false,
  compact = false
}: EnhancedWalletConnectProps) {
  // Wallet state
  const { address, isConnected, connector } = useAccount()
  const { disconnect } = useDisconnect()
  const chainId = useChainId()
  const { chains, switchChain } = useSwitchChain()
  
  // Modals
  const { openConnectModal } = useConnectModal()
  const { openAccountModal } = useAccountModal()
  const { openChainModal } = useChainModal()

  // Balance queries
  const { data: ethBalance } = useBalance({ address })
  const { data: geckoBalance } = useBalance({ 
    address, 
    token: CONTRACT_ADDRESSES.GECKO_TOKEN 
  })

  // Local state
  const [copied, setCopied] = useState(false)
  const [showPrivateInfo, setShowPrivateInfo] = useState(false)
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isConnected: false,
    latency: 0,
    gasPrice: {
      slow: BigInt(0),
      standard: BigInt(0),
      fast: BigInt(0)
    },
    blockNumber: 0
  })
  const [walletStats, setWalletStats] = useState<WalletStats>({
    totalValue: 0,
    geckoTokens: 0,
    nftCount: 0,
    transactionCount: 0,
    gasSaved: 0,
    stakingRewards: 0
  })

  // Update network status
  useEffect(() => {
    if (isConnected) {
      updateNetworkStatus()
      updateWalletStats()
      
      // Update periodically
      const interval = setInterval(updateNetworkStatus, 30000)
      return () => clearInterval(interval)
    }
  }, [isConnected, chainId])

  const updateNetworkStatus = async () => {
    try {
      const startTime = Date.now()
      const gasPrice = await estimateGasPrice()
      const latency = Date.now() - startTime

      setNetworkStatus(prev => ({
        ...prev,
        isConnected: true,
        latency,
        gasPrice,
        blockNumber: prev.blockNumber + 1 // Mock increment
      }))
    } catch (error) {
      console.error('Failed to update network status:', error)
      setNetworkStatus(prev => ({ ...prev, isConnected: false }))
    }
  }

  const updateWalletStats = async () => {
    if (!address) return

    try {
      // Calculate total portfolio value
      const ethValue = ethBalance ? Number(formatEther(ethBalance.value)) * 2500 : 0 // Mock ETH price
      const geckoValue = geckoBalance ? Number(formatTokenAmount(geckoBalance.value)) * 0.01 : 0 // Mock GECKO price
      
      const recentTxs = getRecentTransactions()
      
      setWalletStats({
        totalValue: ethValue + geckoValue,
        geckoTokens: geckoBalance ? Number(formatTokenAmount(geckoBalance.value)) : 0,
        nftCount: 0, // TODO: Fetch actual NFT count
        transactionCount: recentTxs.length,
        gasSaved: 125.50, // Mock value
        stakingRewards: geckoValue * 0.15 // 15% APY mock
      })
    } catch (error) {
      console.error('Failed to update wallet stats:', error)
    }
  }

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleDisconnect = () => {
    disconnect()
    setWalletStats({
      totalValue: 0,
      geckoTokens: 0,
      nftCount: 0,
      transactionCount: 0,
      gasSaved: 0,
      stakingRewards: 0
    })
  }

  const getConnectionStatus = () => {
    if (!isConnected) return { status: 'disconnected', color: 'text-red-500' }
    if (!networkStatus.isConnected) return { status: 'network issues', color: 'text-yellow-500' }
    if (networkStatus.latency > 1000) return { status: 'slow', color: 'text-yellow-500' }
    return { status: 'connected', color: 'text-green-500' }
  }

  const getGasPriceLevel = (gasPrice: bigint) => {
    const gwei = Number(gasPrice) / 1e9
    if (gwei < 20) return { level: 'Low', color: 'text-green-500' }
    if (gwei < 50) return { level: 'Medium', color: 'text-yellow-500' }
    return { level: 'High', color: 'text-red-500' }
  }

  // Compact view for mobile/sidebar
  if (compact) {
    if (!isConnected) {
      return (
        <Button
          onClick={openConnectModal}
          className={cn("btn-game", className)}
        >
          <Wallet className="h-4 w-4 mr-2" />
          Connect
        </Button>
      )
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className={cn("flex items-center gap-2", className)}>
            <div className="w-2 h-2 bg-green-400 rounded-full" />
            <span className="text-sm font-mono">
              {shortenAddress(address!, 3)}
            </span>
            {showBalance && ethBalance && (
              <span className="text-xs text-muted-foreground">
                {Number(formatEther(ethBalance.value)).toFixed(3)} ETH
              </span>
            )}
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <div className="p-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Account</span>
              <Badge variant="secondary" className="text-xs">
                {connector?.name}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground font-mono mb-2">
              {shortenAddress(address!, 6)}
            </p>
            {showBalance && (
              <div className="space-y-1 mb-3">
                <div className="flex justify-between text-xs">
                  <span>ETH</span>
                  <span className="font-mono">
                    {ethBalance ? Number(formatEther(ethBalance.value)).toFixed(4) : '0.0000'}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>GECKO</span>
                  <span className="font-mono">
                    {walletStats.geckoTokens.toFixed(0)}
                  </span>
                </div>
              </div>
            )}
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={openAccountModal}>
            <Settings className="h-4 w-4 mr-2" />
            Account Details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={openChainModal}>
            <Network className="h-4 w-4 mr-2" />
            Switch Network
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleDisconnect} className="text-red-600">
            <LogOut className="h-4 w-4 mr-2" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  // Full enhanced wallet interface
  if (!isConnected) {
    return (
      <Card className={cn("w-full max-w-md", className)}>
        <CardContent className="p-6 text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="space-y-4"
          >
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Wallet className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2">Connect Your Wallet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Connect your wallet to start playing Omniverse Geckos and access your NFTs
              </p>
            </div>
            <Button
              onClick={openConnectModal}
              className="w-full btn-game"
              size="lg"
            >
              <Wallet className="h-4 w-4 mr-2" />
              Connect Wallet
            </Button>
            <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground">
              <div className="flex items-center">
                <Shield className="h-3 w-3 mr-1" />
                Secure
              </div>
              <div className="flex items-center">
                <Zap className="h-3 w-3 mr-1" />
                Fast
              </div>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    )
  }

  const connectionStatus = getConnectionStatus()

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main Wallet Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Wallet Overview
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-xs">
                {connector?.name}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={openAccountModal}>
                    <Settings className="h-4 w-4 mr-2" />
                    Account Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={openChainModal}>
                    <Network className="h-4 w-4 mr-2" />
                    Switch Network
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowPrivateInfo(!showPrivateInfo)}>
                    {showPrivateInfo ? (
                      <EyeOff className="h-4 w-4 mr-2" />
                    ) : (
                      <Eye className="h-4 w-4 mr-2" />
                    )}
                    {showPrivateInfo ? 'Hide' : 'Show'} Private Info
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleDisconnect} className="text-red-600">
                    <LogOut className="h-4 w-4 mr-2" />
                    Disconnect
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Address and Status */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <div className={cn("w-2 h-2 rounded-full", {
                  'bg-green-400': connectionStatus.status === 'connected',
                  'bg-yellow-400': connectionStatus.status === 'slow',
                  'bg-red-400': connectionStatus.status === 'disconnected' || connectionStatus.status === 'network issues'
                })} />
                <span className={cn("text-sm font-medium", connectionStatus.color)}>
                  {connectionStatus.status}
                </span>
                {showNetworkStatus && (
                  <Badge variant="outline" className="text-xs">
                    {networkStatus.latency}ms
                  </Badge>
                )}
              </div>
              <button
                onClick={copyAddress}
                className="flex items-center space-x-1 text-sm font-mono hover:bg-muted rounded p-1 -m-1 transition-colors"
              >
                <span>{showPrivateInfo ? address : shortenAddress(address!, 6)}</span>
                {copied ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={copyAddress}
              className="ml-2"
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Portfolio Overview */}
          {showBalance && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Value</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPrivateInfo(!showPrivateInfo)}
                    className="h-auto p-0 text-xs"
                  >
                    {showPrivateInfo ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </Button>
                </div>
                <p className="text-2xl font-bold">
                  {showPrivateInfo ? `$${walletStats.totalValue.toFixed(2)}` : '****'}
                </p>
                <p className="text-xs text-green-500 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12.5% today
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">ETH</span>
                  <span className="text-sm font-mono">
                    {ethBalance && showPrivateInfo 
                      ? Number(formatEther(ethBalance.value)).toFixed(4)
                      : '****'
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">GECKO</span>
                  <span className="text-sm font-mono">
                    {showPrivateInfo ? walletStats.geckoTokens.toFixed(0) : '****'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">NFTs</span>
                  <span className="text-sm font-mono">{walletStats.nftCount}</span>
                </div>
              </div>
            </div>
          )}

          <Separator />

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-500">{walletStats.transactionCount}</p>
              <p className="text-xs text-muted-foreground">Transactions</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-500">${walletStats.gasSaved.toFixed(0)}</p>
              <p className="text-xs text-muted-foreground">Gas Saved</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-500">${walletStats.stakingRewards.toFixed(0)}</p>
              <p className="text-xs text-muted-foreground">Staking Rewards</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Network Status Card */}
      {showNetworkStatus && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Network className="h-4 w-4" />
              Network Status
              <Button
                variant="ghost"
                size="sm"
                onClick={updateNetworkStatus}
                className="h-6 w-6 p-0 ml-auto"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Chain</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {getChainConfig(chainId)?.name || 'Unknown'}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openChainModal}
                  className="h-6 text-xs px-2"
                >
                  Switch
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Gas Prices</span>
                <span className="text-xs text-muted-foreground">Gwei</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(networkStatus.gasPrice).map(([speed, price]) => {
                  const gwei = Number(price) / 1e9
                  const gasLevel = getGasPriceLevel(price)
                  return (
                    <div key={speed} className="text-center p-2 bg-muted/50 rounded">
                      <p className="text-xs text-muted-foreground capitalize">{speed}</p>
                      <p className={cn("text-sm font-mono font-bold", gasLevel.color)}>
                        {gwei.toFixed(0)}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Network Latency</span>
              <div className="flex items-center gap-2">
                <div className={cn("w-2 h-2 rounded-full", {
                  'bg-green-400': networkStatus.latency < 500,
                  'bg-yellow-400': networkStatus.latency < 1000,
                  'bg-red-400': networkStatus.latency >= 1000
                })} />
                <span className="text-sm font-mono">{networkStatus.latency}ms</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Transactions */}
      {showTransactionHistory && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getRecentTransactions().slice(0, 5).map((tx) => (
                <div key={tx.hash} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                      {tx.type === 'mint' && <Plus className="h-4 w-4 text-green-500" />}
                      {tx.type === 'transfer' && <ArrowUpRight className="h-4 w-4 text-blue-500" />}
                      {tx.type === 'breed' && <Sparkles className="h-4 w-4 text-purple-500" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium capitalize">{tx.type}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(tx.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={tx.status === 'success' ? 'default' : tx.status === 'pending' ? 'secondary' : 'destructive'}
                      className="text-xs"
                    >
                      {tx.status}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => window.open(`${getChainConfig(chainId)?.explorerUrl}/tx/${tx.hash}`, '_blank')}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
              
              {getRecentTransactions().length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No recent transactions</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}