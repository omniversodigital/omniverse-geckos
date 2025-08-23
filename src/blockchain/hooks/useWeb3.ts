'use client'

import { createConfig, http } from 'wagmi'
import { mainnet, sepolia, hardhat } from 'wagmi/chains'
import { injected, metaMask, walletConnect } from 'wagmi/connectors'
import { createPublicClient, createWalletClient, custom } from 'viem'

// =============================================================================
// Wagmi Configuration
// =============================================================================

export const config = createConfig({
  chains: [mainnet, sepolia, hardhat],
  connectors: [
    injected(),
    metaMask(),
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
    }),
  ],
  transports: {
    [mainnet.id]: http(process.env.NEXT_PUBLIC_RPC_URL),
    [sepolia.id]: http(),
    [hardhat.id]: http(),
  },
})

// =============================================================================
// Contract Addresses
// =============================================================================

export const CONTRACT_ADDRESSES = {
  GECKO_TOKEN: process.env.NEXT_PUBLIC_GECKO_TOKEN_ADDRESS as `0x${string}`,
  GECKO_NFT: process.env.NEXT_PUBLIC_GECKO_NFT_ADDRESS as `0x${string}`,
  MARKETPLACE: process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS as `0x${string}`,
  STAKING: process.env.NEXT_PUBLIC_STAKING_ADDRESS as `0x${string}`,
} as const

// =============================================================================
// Chain Configuration
// =============================================================================

export const SUPPORTED_CHAINS = {
  [mainnet.id]: {
    name: 'Ethereum',
    currency: 'ETH',
    explorerUrl: 'https://etherscan.io',
    rpcUrl: process.env.NEXT_PUBLIC_RPC_URL,
  },
  [sepolia.id]: {
    name: 'Sepolia',
    currency: 'ETH',
    explorerUrl: 'https://sepolia.etherscan.io',
    rpcUrl: 'https://rpc.sepolia.org',
  },
  [hardhat.id]: {
    name: 'Hardhat',
    currency: 'ETH',
    explorerUrl: 'http://localhost:8545',
    rpcUrl: 'http://localhost:8545',
  },
} as const

// =============================================================================
// Utility Functions
// =============================================================================

export const getChainConfig = (chainId: number) => {
  return SUPPORTED_CHAINS[chainId as keyof typeof SUPPORTED_CHAINS]
}

export const isValidAddress = (address: string): address is `0x${string}` => {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

export const shortenAddress = (address: string, chars = 4): string => {
  if (!isValidAddress(address)) return address
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
}

export const formatTokenAmount = (
  amount: bigint | string | number,
  decimals = 18,
  displayDecimals = 2
): string => {
  const value = typeof amount === 'bigint' ? amount : BigInt(amount)
  const divisor = BigInt(10 ** decimals)
  const quotient = value / divisor
  const remainder = value % divisor
  
  const wholeNumber = quotient.toString()
  const fraction = remainder.toString().padStart(decimals, '0').slice(0, displayDecimals)
  
  return displayDecimals > 0 ? `${wholeNumber}.${fraction}` : wholeNumber
}

export const parseTokenAmount = (amount: string | number, decimals = 18): bigint => {
  const amountString = amount.toString()
  const [whole = '0', fraction = '0'] = amountString.split('.')
  
  const paddedFraction = fraction.padEnd(decimals, '0').slice(0, decimals)
  return BigInt(whole + paddedFraction)
}

// =============================================================================
// Transaction Utilities
// =============================================================================

export interface TransactionResult {
  hash: string
  success: boolean
  error?: string
}

export const waitForTransaction = async (
  hash: `0x${string}`,
  confirmations = 1
): Promise<TransactionResult> => {
  try {
    const publicClient = createPublicClient({
      chain: mainnet,
      transport: http(),
    })

    const receipt = await publicClient.waitForTransactionReceipt({
      hash,
      confirmations,
    })

    return {
      hash,
      success: receipt.status === 'success',
    }
  } catch (error) {
    return {
      hash,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// =============================================================================
// Gas Estimation Utilities
// =============================================================================

export const estimateGasPrice = async (): Promise<{
  slow: bigint
  standard: bigint
  fast: bigint
}> => {
  try {
    const publicClient = createPublicClient({
      chain: mainnet,
      transport: http(),
    })

    const gasPrice = await publicClient.getGasPrice()
    
    return {
      slow: (gasPrice * BigInt(90)) / BigInt(100), // 90% of current
      standard: gasPrice,
      fast: (gasPrice * BigInt(110)) / BigInt(100), // 110% of current
    }
  } catch (error) {
    console.error('Failed to estimate gas price:', error)
    // Fallback values in gwei
    return {
      slow: BigInt('20000000000'), // 20 gwei
      standard: BigInt('25000000000'), // 25 gwei
      fast: BigInt('30000000000'), // 30 gwei
    }
  }
}

// =============================================================================
// Error Handling
// =============================================================================

export interface Web3Error {
  code: number
  message: string
  type: 'user_rejected' | 'insufficient_funds' | 'network_error' | 'contract_error' | 'unknown'
}

export const parseWeb3Error = (error: any): Web3Error => {
  const message = error?.message || error?.toString() || 'Unknown error'
  
  // User rejected transaction
  if (message.includes('User denied') || message.includes('rejected') || error?.code === 4001) {
    return {
      code: 4001,
      message: 'Transaction rejected by user',
      type: 'user_rejected',
    }
  }
  
  // Insufficient funds
  if (message.includes('insufficient funds') || message.includes('exceeds balance')) {
    return {
      code: -32000,
      message: 'Insufficient funds for transaction',
      type: 'insufficient_funds',
    }
  }
  
  // Network errors
  if (message.includes('network') || message.includes('connection')) {
    return {
      code: -32002,
      message: 'Network connection error',
      type: 'network_error',
    }
  }
  
  // Contract execution errors
  if (message.includes('execution reverted') || message.includes('revert')) {
    return {
      code: -32015,
      message: 'Contract execution failed',
      type: 'contract_error',
    }
  }
  
  return {
    code: error?.code || -1,
    message,
    type: 'unknown',
  }
}

// =============================================================================
// Local Storage Utilities
// =============================================================================

const STORAGE_KEYS = {
  RECENT_TRANSACTIONS: 'gecko_recent_transactions',
  USER_PREFERENCES: 'gecko_user_preferences',
  GAME_PROGRESS: 'gecko_game_progress',
} as const

export const saveToLocalStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.warn('Failed to save to localStorage:', error)
  }
}

export const loadFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.warn('Failed to load from localStorage:', error)
    return defaultValue
  }
}

export const clearLocalStorage = (key?: string): void => {
  try {
    if (key) {
      localStorage.removeItem(key)
    } else {
      Object.values(STORAGE_KEYS).forEach(storageKey => {
        localStorage.removeItem(storageKey)
      })
    }
  } catch (error) {
    console.warn('Failed to clear localStorage:', error)
  }
}

// =============================================================================
// Recent Transactions Management
// =============================================================================

export interface RecentTransaction {
  hash: string
  type: 'mint' | 'transfer' | 'breed' | 'marketplace' | 'game'
  timestamp: number
  amount?: string
  tokenId?: string
  status: 'pending' | 'success' | 'failed'
}

export const saveRecentTransaction = (transaction: RecentTransaction): void => {
  const recent = loadFromLocalStorage<RecentTransaction[]>(STORAGE_KEYS.RECENT_TRANSACTIONS, [])
  const updated = [transaction, ...recent.slice(0, 49)] // Keep last 50
  saveToLocalStorage(STORAGE_KEYS.RECENT_TRANSACTIONS, updated)
}

export const updateTransactionStatus = (
  hash: string, 
  status: RecentTransaction['status']
): void => {
  const recent = loadFromLocalStorage<RecentTransaction[]>(STORAGE_KEYS.RECENT_TRANSACTIONS, [])
  const updated = recent.map(tx => 
    tx.hash === hash ? { ...tx, status } : tx
  )
  saveToLocalStorage(STORAGE_KEYS.RECENT_TRANSACTIONS, updated)
}

export const getRecentTransactions = (): RecentTransaction[] => {
  return loadFromLocalStorage<RecentTransaction[]>(STORAGE_KEYS.RECENT_TRANSACTIONS, [])
}

// =============================================================================
// Network Detection
// =============================================================================

export const detectNetwork = async (): Promise<{
  chainId: number
  isSupported: boolean
  needsSwitch: boolean
}> => {
  try {
    if (typeof window !== 'undefined' && window.ethereum) {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' })
      const numericChainId = parseInt(chainId, 16)
      
      return {
        chainId: numericChainId,
        isSupported: numericChainId in SUPPORTED_CHAINS,
        needsSwitch: ![mainnet.id, sepolia.id, hardhat.id].includes(numericChainId),
      }
    }
    
    return {
      chainId: 0,
      isSupported: false,
      needsSwitch: true,
    }
  } catch (error) {
    console.error('Failed to detect network:', error)
    return {
      chainId: 0,
      isSupported: false,
      needsSwitch: true,
    }
  }
}

// =============================================================================
// Type Definitions
// =============================================================================

export type SupportedChainId = keyof typeof SUPPORTED_CHAINS

export interface Web3Context {
  isConnected: boolean
  address: string | null
  chainId: number | null
  balance: bigint | null
  isLoading: boolean
  error: Web3Error | null
}

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>
      on: (event: string, callback: (...args: any[]) => void) => void
      removeListener: (event: string, callback: (...args: any[]) => void) => void
    }
  }
}