'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useAccount, useNetwork, useBalance } from 'wagmi'
import { toast } from 'sonner'

// =============================================================================
// Types
// =============================================================================

interface Web3ContextType {
  isConnected: boolean
  address: string | undefined
  chainId: number | undefined
  isCorrectNetwork: boolean
  balance: string
  isLoading: boolean
  error: string | null
  connectWallet: () => Promise<void>
  disconnectWallet: () => Promise<void>
  switchToCorrectNetwork: () => Promise<void>
  refreshBalance: () => Promise<void>
}

interface Web3ProviderProps {
  children: ReactNode
}

// =============================================================================
// Constants
// =============================================================================

const SUPPORTED_CHAIN_IDS = [1, 5, 31337] // Mainnet, Goerli, Hardhat
const DEFAULT_CHAIN_ID = 5 // Goerli for development

// =============================================================================
// Context
// =============================================================================

const Web3Context = createContext<Web3ContextType | undefined>(undefined)

// =============================================================================
// Web3 Provider Component
// =============================================================================

export function Web3Provider({ children }: Web3ProviderProps) {
  const { address, isConnected } = useAccount()
  const { chain } = useNetwork()
  const { data: balanceData, refetch: refetchBalance } = useBalance({
    address: address,
    enabled: !!address,
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check if on correct network
  const isCorrectNetwork = chain?.id ? SUPPORTED_CHAIN_IDS.includes(chain.id) : false
  const balance = balanceData?.formatted || '0'

  // Handle connection state changes
  useEffect(() => {
    if (isConnected && address) {
      setError(null)
      toast.success('Wallet connected successfully!')
    }
  }, [isConnected, address])

  // Handle network changes
  useEffect(() => {
    if (isConnected && chain) {
      if (!isCorrectNetwork) {
        setError(`Unsupported network. Please switch to a supported network.`)
        toast.error('Please switch to a supported network')
      } else {
        setError(null)
      }
    }
  }, [isConnected, chain, isCorrectNetwork])

  // Wallet connection functions
  const connectWallet = async () => {
    try {
      setIsLoading(true)
      setError(null)
      // Connection is handled by RainbowKit
      // This function can be used for additional logic
    } catch (error: any) {
      setError(error.message || 'Failed to connect wallet')
      toast.error('Failed to connect wallet')
    } finally {
      setIsLoading(false)
    }
  }

  const disconnectWallet = async () => {
    try {
      setIsLoading(true)
      setError(null)
      // Disconnection is handled by RainbowKit
      toast.info('Wallet disconnected')
    } catch (error: any) {
      setError(error.message || 'Failed to disconnect wallet')
      toast.error('Failed to disconnect wallet')
    } finally {
      setIsLoading(false)
    }
  }

  const switchToCorrectNetwork = async () => {
    try {
      setIsLoading(true)
      setError(null)

      if (typeof window.ethereum !== 'undefined') {
        // Request network switch
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${DEFAULT_CHAIN_ID.toString(16)}` }],
        })
        toast.success('Network switched successfully!')
      } else {
        throw new Error('MetaMask is not installed')
      }
    } catch (error: any) {
      // If the network doesn't exist, add it
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${DEFAULT_CHAIN_ID.toString(16)}`,
              chainName: 'Goerli Test Network',
              nativeCurrency: {
                name: 'Goerli Ether',
                symbol: 'ETH',
                decimals: 18
              },
              rpcUrls: ['https://goerli.infura.io/v3/YOUR_INFURA_KEY'],
              blockExplorerUrls: ['https://goerli.etherscan.io/']
            }]
          })
          toast.success('Network added and switched successfully!')
        } catch (addError: any) {
          setError(addError.message || 'Failed to add network')
          toast.error('Failed to add network')
        }
      } else {
        setError(error.message || 'Failed to switch network')
        toast.error('Failed to switch network')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const refreshBalance = async () => {
    try {
      await refetchBalance()
      toast.success('Balance refreshed!')
    } catch (error: any) {
      setError(error.message || 'Failed to refresh balance')
      toast.error('Failed to refresh balance')
    }
  }

  const contextValue: Web3ContextType = {
    isConnected,
    address,
    chainId: chain?.id,
    isCorrectNetwork,
    balance,
    isLoading,
    error,
    connectWallet,
    disconnectWallet,
    switchToCorrectNetwork,
    refreshBalance
  }

  return (
    <Web3Context.Provider value={contextValue}>
      {children}
    </Web3Context.Provider>
  )
}

// =============================================================================
// Hook
// =============================================================================

export function useWeb3(): Web3ContextType {
  const context = useContext(Web3Context)
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider')
  }
  return context
}

// =============================================================================
// Network Status Hook
// =============================================================================

export function useNetworkStatus() {
  const { chainId, isCorrectNetwork, switchToCorrectNetwork } = useWeb3()
  
  return {
    chainId,
    isCorrectNetwork,
    switchToCorrectNetwork,
    supportedChainIds: SUPPORTED_CHAIN_IDS
  }
}

// =============================================================================
// Connection Status Hook
// =============================================================================

export function useConnectionStatus() {
  const { isConnected, address, connectWallet, disconnectWallet, isLoading } = useWeb3()
  
  return {
    isConnected,
    address,
    connectWallet,
    disconnectWallet,
    isLoading
  }
}

// =============================================================================
// Balance Hook
// =============================================================================

export function useWalletBalance() {
  const { balance, refreshBalance } = useWeb3()
  
  return {
    balance,
    refreshBalance,
    formattedBalance: parseFloat(balance).toFixed(4)
  }
}