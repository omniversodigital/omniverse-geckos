'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAccount, useBalance, useChainId, usePublicClient, useWalletClient } from 'wagmi'
import { formatEther, parseEther, type Address } from 'viem'
import { 
  CONTRACT_ADDRESSES, 
  getRecentTransactions, 
  saveRecentTransaction, 
  updateTransactionStatus,
  type RecentTransaction 
} from './useWeb3'

// =============================================================================
// Enhanced Types
// =============================================================================

interface WalletMetrics {
  totalValue: number
  ethBalance: number
  geckoBalance: number
  nftCount: number
  transactionCount: number
  gasSaved: number
  stakingRewards: number
  averageGasPrice: number
  totalGasUsed: number
}

interface NetworkHealth {
  isHealthy: boolean
  latency: number
  gasPrice: {
    slow: bigint
    standard: bigint
    fast: bigint
  }
  blockNumber: bigint
  congestionLevel: 'low' | 'medium' | 'high'
}

interface TransactionPreview {
  estimatedGas: bigint
  gasPrice: bigint
  totalCost: bigint
  confirmationTime: number
  success_probability: number
}

interface WalletSecurity {
  score: number
  risks: Array<{
    type: 'low' | 'medium' | 'high'
    message: string
    suggestion: string
  }>
  recommendations: string[]
}

// =============================================================================
// Enhanced Wallet Hook
// =============================================================================

export function useEnhancedWallet() {
  // Wagmi hooks
  const { address, isConnected, connector } = useAccount()
  const chainId = useChainId()
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()
  
  // Balance hooks
  const { data: ethBalance, refetch: refetchEthBalance } = useBalance({ address })
  const { data: geckoBalance, refetch: refetchGeckoBalance } = useBalance({ 
    address, 
    token: CONTRACT_ADDRESSES.GECKO_TOKEN 
  })

  // Enhanced state
  const [metrics, setMetrics] = useState<WalletMetrics>({
    totalValue: 0,
    ethBalance: 0,
    geckoBalance: 0,
    nftCount: 0,
    transactionCount: 0,
    gasSaved: 0,
    stakingRewards: 0,
    averageGasPrice: 0,
    totalGasUsed: 0
  })

  const [networkHealth, setNetworkHealth] = useState<NetworkHealth>({
    isHealthy: true,
    latency: 0,
    gasPrice: {
      slow: BigInt(0),
      standard: BigInt(0),
      fast: BigInt(0)
    },
    blockNumber: BigInt(0),
    congestionLevel: 'low'
  })

  const [security, setSecurity] = useState<WalletSecurity>({
    score: 85,
    risks: [],
    recommendations: []
  })

  const [isLoading, setIsLoading] = useState(false)
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([])

  // Update metrics when balances change
  useEffect(() => {
    if (isConnected && address) {
      updateWalletMetrics()
      updateNetworkHealth()
      updateSecurityScore()
      loadRecentTransactions()
    }
  }, [isConnected, address, ethBalance, geckoBalance])

  // Update wallet metrics
  const updateWalletMetrics = useCallback(async () => {
    if (!address || !ethBalance) return

    try {
      // Calculate portfolio value with mock prices
      const ethPrice = 2500 // Mock ETH price
      const geckoPrice = 0.01 // Mock GECKO price
      
      const ethValue = Number(formatEther(ethBalance.value)) * ethPrice
      const geckoValue = geckoBalance 
        ? Number(formatEther(geckoBalance.value)) * geckoPrice 
        : 0

      // Get transaction history for metrics
      const txHistory = getRecentTransactions()
      const totalGasUsed = txHistory.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0)
      
      setMetrics({
        totalValue: ethValue + geckoValue,
        ethBalance: Number(formatEther(ethBalance.value)),
        geckoBalance: geckoBalance ? Number(formatEther(geckoBalance.value)) : 0,
        nftCount: 0, // TODO: Implement NFT counting
        transactionCount: txHistory.length,
        gasSaved: calculateGasSaved(txHistory),
        stakingRewards: geckoValue * 0.15, // 15% APY estimate
        averageGasPrice: calculateAverageGasPrice(txHistory),
        totalGasUsed
      })
    } catch (error) {
      console.error('Failed to update wallet metrics:', error)
    }
  }, [address, ethBalance, geckoBalance])

  // Update network health
  const updateNetworkHealth = useCallback(async () => {
    if (!publicClient) return

    try {
      const startTime = Date.now()
      
      // Get current gas price
      const gasPrice = await publicClient.getGasPrice()
      const blockNumber = await publicClient.getBlockNumber()
      
      const latency = Date.now() - startTime
      
      // Calculate gas price tiers
      const gasPrices = {
        slow: (gasPrice * BigInt(90)) / BigInt(100),
        standard: gasPrice,
        fast: (gasPrice * BigInt(120)) / BigInt(100)
      }

      // Determine congestion level
      const gwei = Number(gasPrice) / 1e9
      const congestionLevel: NetworkHealth['congestionLevel'] = 
        gwei < 20 ? 'low' : gwei < 50 ? 'medium' : 'high'

      setNetworkHealth({
        isHealthy: latency < 5000 && gwei < 100,
        latency,
        gasPrice: gasPrices,
        blockNumber,
        congestionLevel
      })
    } catch (error) {
      console.error('Failed to update network health:', error)
      setNetworkHealth(prev => ({ ...prev, isHealthy: false }))
    }
  }, [publicClient])

  // Update security score
  const updateSecurityScore = useCallback(async () => {
    if (!address) return

    const risks = []
    const recommendations = []
    let score = 100

    try {
      // Check if wallet has high value (security risk)
      if (metrics.totalValue > 10000) {
        risks.push({
          type: 'medium' as const,
          message: 'High value wallet detected',
          suggestion: 'Consider using a hardware wallet for added security'
        })
        recommendations.push('Use hardware wallet for large amounts')
        score -= 10
      }

      // Check transaction frequency
      if (recentTransactions.length > 20) {
        risks.push({
          type: 'low' as const,
          message: 'High transaction frequency',
          suggestion: 'Monitor for unusual activity'
        })
        score -= 5
      }

      // Check for failed transactions
      const failedTxs = recentTransactions.filter(tx => tx.status === 'failed')
      if (failedTxs.length > 3) {
        risks.push({
          type: 'medium' as const,
          message: 'Multiple failed transactions detected',
          suggestion: 'Review transaction parameters and gas settings'
        })
        recommendations.push('Optimize gas settings')
        score -= 15
      }

      // Network security check
      if (!networkHealth.isHealthy) {
        risks.push({
          type: 'high' as const,
          message: 'Network connectivity issues',
          suggestion: 'Check internet connection and RPC endpoints'
        })
        score -= 20
      }

      setSecurity({
        score: Math.max(0, score),
        risks,
        recommendations
      })
    } catch (error) {
      console.error('Failed to update security score:', error)
    }
  }, [address, metrics, networkHealth, recentTransactions])

  // Load recent transactions
  const loadRecentTransactions = useCallback(() => {
    const transactions = getRecentTransactions()
    setRecentTransactions(transactions)
  }, [])

  // Calculate gas saved (mock implementation)
  const calculateGasSaved = (transactions: RecentTransaction[]): number => {
    // Mock calculation - in real implementation, compare with standard gas usage
    return transactions.length * 0.002 * 2500 // Mock savings
  }

  // Calculate average gas price
  const calculateAverageGasPrice = (transactions: RecentTransaction[]): number => {
    if (transactions.length === 0) return 0
    
    const totalGas = transactions.reduce((sum, tx) => {
      // Mock gas price extraction - in real implementation, get actual gas used
      return sum + 25 // Mock 25 gwei average
    }, 0)
    
    return totalGas / transactions.length
  }

  // Enhanced transaction methods
  const previewTransaction = async (
    to: Address,
    value: bigint,
    data?: `0x${string}`
  ): Promise<TransactionPreview> => {
    if (!publicClient || !address) {
      throw new Error('Client not ready')
    }

    try {
      // Estimate gas
      const gasEstimate = await publicClient.estimateGas({
        account: address,
        to,
        value,
        data
      })

      const gasPrice = await publicClient.getGasPrice()
      const totalCost = gasEstimate * gasPrice + value

      // Estimate confirmation time based on gas price
      const gwei = Number(gasPrice) / 1e9
      const confirmationTime = gwei < 20 ? 15 : gwei < 50 ? 30 : 60 // seconds

      // Calculate success probability based on network conditions
      const success_probability = networkHealth.isHealthy ? 
        (gwei < 100 ? 0.95 : 0.85) : 0.70

      return {
        estimatedGas: gasEstimate,
        gasPrice,
        totalCost,
        confirmationTime,
        success_probability
      }
    } catch (error) {
      console.error('Transaction preview failed:', error)
      throw error
    }
  }

  // Send transaction with enhanced tracking
  const sendTransaction = async (
    to: Address,
    value: bigint,
    data?: `0x${string}`,
    type: RecentTransaction['type'] = 'transfer'
  ) => {
    if (!walletClient || !address) {
      throw new Error('Wallet not connected')
    }

    setIsLoading(true)

    try {
      const hash = await walletClient.sendTransaction({
        account: address,
        to,
        value,
        data
      })

      // Save transaction to local storage
      const transaction: RecentTransaction = {
        hash,
        type,
        timestamp: Date.now(),
        amount: formatEther(value),
        status: 'pending'
      }

      saveRecentTransaction(transaction)
      setRecentTransactions(prev => [transaction, ...prev])

      // Monitor transaction status
      monitorTransaction(hash)

      return hash
    } catch (error) {
      console.error('Transaction failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Monitor transaction status
  const monitorTransaction = async (hash: `0x${string}`) => {
    if (!publicClient) return

    try {
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      const status = receipt.status === 'success' ? 'success' : 'failed'
      
      updateTransactionStatus(hash, status)
      setRecentTransactions(prev => 
        prev.map(tx => tx.hash === hash ? { ...tx, status } : tx)
      )

      // Refresh balances after successful transaction
      if (status === 'success') {
        await Promise.all([
          refetchEthBalance(),
          refetchGeckoBalance()
        ])
      }
    } catch (error) {
      console.error('Failed to monitor transaction:', error)
      updateTransactionStatus(hash, 'failed')
    }
  }

  // Refresh all wallet data
  const refreshWalletData = useCallback(async () => {
    setIsLoading(true)
    try {
      await Promise.all([
        refetchEthBalance(),
        refetchGeckoBalance(),
        updateWalletMetrics(),
        updateNetworkHealth(),
        updateSecurityScore()
      ])
    } finally {
      setIsLoading(false)
    }
  }, [refetchEthBalance, refetchGeckoBalance, updateWalletMetrics, updateNetworkHealth, updateSecurityScore])

  // Get wallet health score
  const getHealthScore = useCallback(() => {
    let score = 100

    // Network health impact
    if (!networkHealth.isHealthy) score -= 30
    if (networkHealth.latency > 1000) score -= 10
    if (networkHealth.congestionLevel === 'high') score -= 15

    // Transaction success rate
    const failedTxs = recentTransactions.filter(tx => tx.status === 'failed').length
    const successRate = recentTransactions.length > 0 
      ? (recentTransactions.length - failedTxs) / recentTransactions.length 
      : 1
    score = score * successRate

    // Security score impact
    score = Math.min(score, security.score)

    return Math.max(0, Math.round(score))
  }, [networkHealth, recentTransactions, security])

  return {
    // Basic wallet info
    address,
    isConnected,
    connector,
    chainId,
    
    // Enhanced metrics
    metrics,
    networkHealth,
    security,
    recentTransactions,
    
    // State
    isLoading,
    
    // Methods
    refreshWalletData,
    previewTransaction,
    sendTransaction,
    getHealthScore,
    
    // Calculated values
    healthScore: getHealthScore(),
    
    // Balance utilities
    formatBalance: (balance: bigint | undefined, decimals = 4) => 
      balance ? Number(formatEther(balance)).toFixed(decimals) : '0.0000',
    
    // Network utilities
    isNetworkCongested: networkHealth.congestionLevel === 'high',
    estimatedTxTime: networkHealth.congestionLevel === 'low' ? '~15s' : 
                     networkHealth.congestionLevel === 'medium' ? '~30s' : '~60s+',
                     
    // Security utilities
    hasSecurityRisks: security.risks.length > 0,
    criticalRisks: security.risks.filter(risk => risk.type === 'high').length
  }
}