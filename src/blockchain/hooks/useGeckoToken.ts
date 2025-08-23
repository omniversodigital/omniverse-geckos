'use client'

import { useState, useCallback, useEffect } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useBalance } from 'wagmi'
import { parseEther, formatEther, type Address } from 'viem'
import { CONTRACT_ADDRESSES } from './useWeb3'
import { GeckoTokenABI } from '../abis/GeckoToken'
import { toast } from 'sonner'

// =============================================================================
// Types
// =============================================================================

export interface TokenInfo {
  totalSupply: string
  maxSupply: string
  totalMinted: string
  totalBurned: string
  totalRewardsDistributed: string
  circulatingSupply: string
}

export interface UserStats {
  balance: string
  totalEarned: string
  lastClaim: number
  canClaimDaily: boolean
  vestedAmount: string
  claimableVested: string
}

export interface VestingSchedule {
  totalAmount: string
  startTime: number
  vestingDuration: number
  claimedAmount: string
  active: boolean
}

// =============================================================================
// Custom Hook
// =============================================================================

export function useGeckoToken() {
  const { address } = useAccount()
  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash })
  
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null)
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [isLoadingInfo, setIsLoadingInfo] = useState(false)

  // =============================================================================
  // Contract Reads
  // =============================================================================

  const { data: balance, refetch: refetchBalance } = useBalance({
    address: address,
    token: CONTRACT_ADDRESSES.GECKO_TOKEN,
    query: {
      enabled: !!address,
    },
  })

  const { data: totalSupply } = useReadContract({
    address: CONTRACT_ADDRESSES.GECKO_TOKEN,
    abi: GeckoTokenABI,
    functionName: 'totalSupply',
  })

  const { data: maxSupply } = useReadContract({
    address: CONTRACT_ADDRESSES.GECKO_TOKEN,
    abi: GeckoTokenABI,
    functionName: 'MAX_SUPPLY',
  })

  const { data: dailyRewardPool } = useReadContract({
    address: CONTRACT_ADDRESSES.GECKO_TOKEN,
    abi: GeckoTokenABI,
    functionName: 'dailyRewardPool',
  })

  const { data: maxDailyRewardPerPlayer } = useReadContract({
    address: CONTRACT_ADDRESSES.GECKO_TOKEN,
    abi: GeckoTokenABI,
    functionName: 'maxDailyRewardPerPlayer',
  })

  const { data: remainingDailyPool } = useReadContract({
    address: CONTRACT_ADDRESSES.GECKO_TOKEN,
    abi: GeckoTokenABI,
    functionName: 'getRemainingDailyRewardPool',
  })

  const { data: playerRewardStatus } = useReadContract({
    address: CONTRACT_ADDRESSES.GECKO_TOKEN,
    abi: GeckoTokenABI,
    functionName: 'getPlayerDailyRewardStatus',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })

  // =============================================================================
  // Token Operations
  // =============================================================================

  const transfer = useCallback(async (to: Address, amount: string) => {
    if (!address) {
      toast.error('Wallet not connected')
      return
    }

    try {
      const amountWei = parseEther(amount)
      const result = writeContract({
        address: CONTRACT_ADDRESSES.GECKO_TOKEN,
        abi: GeckoTokenABI,
        functionName: 'transfer',
        args: [to, amountWei],
      })

      toast.success(`Transferring ${amount} $GECKO...`)
      return result
    } catch (error) {
      console.error('Transfer error:', error)
      toast.error('Failed to transfer tokens')
      throw error
    }
  }, [address, writeContract])

  const approve = useCallback(async (spender: Address, amount: string) => {
    if (!address) {
      toast.error('Wallet not connected')
      return
    }

    try {
      const amountWei = parseEther(amount)
      const result = writeContract({
        address: CONTRACT_ADDRESSES.GECKO_TOKEN,
        abi: GeckoTokenABI,
        functionName: 'approve',
        args: [spender, amountWei],
      })

      toast.success(`Approving ${amount} $GECKO...`)
      return result
    } catch (error) {
      console.error('Approve error:', error)
      toast.error('Failed to approve tokens')
      throw error
    }
  }, [address, writeContract])

  const burn = useCallback(async (amount: string) => {
    if (!address) {
      toast.error('Wallet not connected')
      return
    }

    try {
      const amountWei = parseEther(amount)
      const result = writeContract({
        address: CONTRACT_ADDRESSES.GECKO_TOKEN,
        abi: GeckoTokenABI,
        functionName: 'burn',
        args: [amountWei],
      })

      toast.success(`Burning ${amount} $GECKO...`)
      return result
    } catch (error) {
      console.error('Burn error:', error)
      toast.error('Failed to burn tokens')
      throw error
    }
  }, [address, writeContract])

  // =============================================================================
  // Vesting Operations
  // =============================================================================

  const claimVestedTokens = useCallback(async () => {
    if (!address) {
      toast.error('Wallet not connected')
      return
    }

    try {
      const result = writeContract({
        address: CONTRACT_ADDRESSES.GECKO_TOKEN,
        abi: GeckoTokenABI,
        functionName: 'claimVestedTokens',
      })

      toast.success('Claiming vested tokens...')
      return result
    } catch (error) {
      console.error('Claim vested tokens error:', error)
      toast.error('Failed to claim vested tokens')
      throw error
    }
  }, [address, writeContract])

  // =============================================================================
  // Data Loading Functions
  // =============================================================================

  const loadTokenInfo = useCallback(async () => {
    setIsLoadingInfo(true)
    try {
      // In a real implementation, you'd batch these calls
      const info: TokenInfo = {
        totalSupply: totalSupply ? formatEther(totalSupply) : '0',
        maxSupply: maxSupply ? formatEther(maxSupply) : '0',
        totalMinted: '0', // Would come from contract
        totalBurned: '0', // Would come from contract
        totalRewardsDistributed: '0', // Would come from contract
        circulatingSupply: '0', // Calculated
      }
      
      setTokenInfo(info)
    } catch (error) {
      console.error('Error loading token info:', error)
      toast.error('Failed to load token information')
    } finally {
      setIsLoadingInfo(false)
    }
  }, [totalSupply, maxSupply])

  const loadUserStats = useCallback(async () => {
    if (!address) return

    try {
      // Mock user stats - in production, would come from contract
      const stats: UserStats = {
        balance: balance ? formatEther(balance.value) : '0',
        totalEarned: '0', // Would come from contract
        lastClaim: 0, // Would come from contract
        canClaimDaily: playerRewardStatus ? playerRewardStatus[0] : false,
        vestedAmount: '0', // Would come from contract
        claimableVested: '0', // Would come from contract
      }
      
      setUserStats(stats)
    } catch (error) {
      console.error('Error loading user stats:', error)
    }
  }, [address, balance, playerRewardStatus])

  // =============================================================================
  // Utility Functions
  // =============================================================================

  const formatTokenAmount = useCallback((amount: string | bigint, decimals = 2): string => {
    if (typeof amount === 'bigint') {
      return parseFloat(formatEther(amount)).toFixed(decimals)
    }
    return parseFloat(amount).toFixed(decimals)
  }, [])

  const parseTokenAmount = useCallback((amount: string): bigint => {
    return parseEther(amount)
  }, [])

  const getCirculatingSupply = (): string => {
    if (!tokenInfo) return '0'
    // Circulating supply = total supply - locked tokens
    return tokenInfo.totalSupply
  }

  const getMarketCap = (tokenPrice: number): string => {
    const circulatingSupply = parseFloat(getCirculatingSupply())
    return (circulatingSupply * tokenPrice).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    })
  }

  const getBurnRate = (): number => {
    if (!tokenInfo || !tokenInfo.totalSupply || !tokenInfo.totalBurned) return 0
    const totalSupply = parseFloat(tokenInfo.totalSupply)
    const totalBurned = parseFloat(tokenInfo.totalBurned)
    return totalSupply > 0 ? (totalBurned / totalSupply) * 100 : 0
  }

  const getRewardPoolStatus = (): {
    remaining: string
    total: string
    percentage: number
    timeUntilReset: number
  } => {
    const remaining = remainingDailyPool ? formatEther(remainingDailyPool) : '0'
    const total = dailyRewardPool ? formatEther(dailyRewardPool) : '10000'
    const percentage = parseFloat(total) > 0 ? (parseFloat(remaining) / parseFloat(total)) * 100 : 0
    
    // Calculate time until reset (next day at 00:00 UTC)
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setUTCDate(now.getUTCDate() + 1)
    tomorrow.setUTCHours(0, 0, 0, 0)
    const timeUntilReset = tomorrow.getTime() - now.getTime()

    return {
      remaining,
      total,
      percentage,
      timeUntilReset: Math.max(0, timeUntilReset),
    }
  }

  const canReceiveReward = (): boolean => {
    return playerRewardStatus ? playerRewardStatus[0] : false
  }

  const getMaxDailyReward = (): string => {
    return maxDailyRewardPerPlayer ? formatEther(maxDailyRewardPerPlayer) : '1000'
  }

  // =============================================================================
  // Transaction Helpers
  // =============================================================================

  const waitForConfirmation = useCallback(async () => {
    if (!hash) return false

    try {
      // Transaction is already being waited for by wagmi hook
      return true
    } catch (error) {
      console.error('Transaction failed:', error)
      return false
    }
  }, [hash])

  // =============================================================================
  // Effects
  // =============================================================================

  useEffect(() => {
    loadTokenInfo()
  }, [loadTokenInfo])

  useEffect(() => {
    if (address) {
      loadUserStats()
    } else {
      setUserStats(null)
    }
  }, [address, loadUserStats])

  // Auto-refresh balance after transactions
  useEffect(() => {
    if (hash && !isConfirming) {
      // Delay to allow blockchain to update
      setTimeout(() => {
        refetchBalance()
        loadUserStats()
        loadTokenInfo()
      }, 2000)
    }
  }, [hash, isConfirming, refetchBalance, loadUserStats, loadTokenInfo])

  // =============================================================================
  // Return Hook Interface
  // =============================================================================

  return {
    // State
    tokenInfo,
    userStats,
    isLoadingInfo,
    
    // Balance
    balance: balance ? formatEther(balance.value) : '0',
    formattedBalance: balance ? formatTokenAmount(balance.value) : '0.00',
    
    // Contract data
    totalSupply: totalSupply ? formatEther(totalSupply) : '0',
    maxSupply: maxSupply ? formatEther(maxSupply) : '0',
    dailyRewardPool: dailyRewardPool ? formatEther(dailyRewardPool) : '10000',
    maxDailyRewardPerPlayer: maxDailyRewardPerPlayer ? formatEther(maxDailyRewardPerPlayer) : '1000',
    
    // Transaction states
    isPending,
    isConfirming,
    hash,
    
    // Operations
    transfer,
    approve,
    burn,
    claimVestedTokens,
    
    // Data loading
    loadTokenInfo,
    loadUserStats,
    refetchBalance,
    
    // Utilities
    formatTokenAmount,
    parseTokenAmount,
    getCirculatingSupply,
    getMarketCap,
    getBurnRate,
    getRewardPoolStatus,
    canReceiveReward,
    getMaxDailyReward,
    waitForConfirmation,
  }
}

// =============================================================================
// Additional Hooks
// =============================================================================

export function useTokenAllowance(spender: Address) {
  const { address } = useAccount()

  const { data: allowance, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.GECKO_TOKEN,
    abi: GeckoTokenABI,
    functionName: 'allowance',
    args: address && spender ? [address, spender] : undefined,
    query: {
      enabled: !!(address && spender),
    },
  })

  const hasAllowance = (amount: string): boolean => {
    if (!allowance) return false
    return allowance >= parseEther(amount)
  }

  const getAllowanceString = (): string => {
    return allowance ? formatEther(allowance) : '0'
  }

  return {
    allowance: allowance ? formatEther(allowance) : '0',
    allowanceWei: allowance || BigInt(0),
    hasAllowance,
    getAllowanceString,
    refetch,
  }
}

export function useTokenPrice() {
  const [price, setPrice] = useState<number>(0)
  const [priceChange24h, setPriceChange24h] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(false)

  const fetchPrice = useCallback(async () => {
    setIsLoading(true)
    try {
      // In production, you'd fetch from a price API like CoinGecko
      // For now, we'll use mock data
      setPrice(0.05) // $0.05 per GECKO
      setPriceChange24h(2.5) // +2.5%
    } catch (error) {
      console.error('Error fetching token price:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPrice()
    // Set up price polling
    const interval = setInterval(fetchPrice, 30000) // Every 30 seconds
    return () => clearInterval(interval)
  }, [fetchPrice])

  return {
    price,
    priceChange24h,
    isLoading,
    fetchPrice,
    priceFormatted: price.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 4,
    }),
  }
}