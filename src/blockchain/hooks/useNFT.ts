'use client'

import { useState, useCallback, useEffect } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, formatEther, type Address } from 'viem'
import { CONTRACT_ADDRESSES } from './useWeb3'
import { GeckoNFTABI } from '../abis/GeckoNFT'
import { toast } from 'sonner'

// =============================================================================
// Types
// =============================================================================

export interface GeckoTraits {
  geckoType: number
  rarity: number
  level: bigint
  experience: bigint
  damage: bigint
  range: bigint
  fireRate: bigint
  birthTime: bigint
  lastEvolution: bigint
  canBreed: boolean
  breedCount: bigint
  kills: bigint
  totalDamageDealt: bigint
  specialAbilities: string[]
}

export interface NFTMetadata {
  name: string
  description: string
  image: string
  attributes: Array<{
    trait_type: string
    value: string | number
  }>
  animation_url?: string
}

export interface GeckoNFT {
  tokenId: string
  owner: string
  traits: GeckoTraits
  metadata?: NFTMetadata
  isListed?: boolean
  price?: string
}

// =============================================================================
// Custom Hook
// =============================================================================

export function useNFT() {
  const { address } = useAccount()
  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash })
  
  const [ownedNFTs, setOwnedNFTs] = useState<GeckoNFT[]>([])
  const [isLoadingNFTs, setIsLoadingNFTs] = useState(false)
  const [mintingCount, setMintingCount] = useState(1)

  // =============================================================================
  // Contract Reads
  // =============================================================================

  const { data: totalSupply } = useReadContract({
    address: CONTRACT_ADDRESSES.GECKO_NFT,
    abi: GeckoNFTABI,
    functionName: 'totalSupply',
  })

  const { data: mintPrice } = useReadContract({
    address: CONTRACT_ADDRESSES.GECKO_NFT,
    abi: GeckoNFTABI,
    functionName: 'mintPrice',
  })

  const { data: maxSupply } = useReadContract({
    address: CONTRACT_ADDRESSES.GECKO_NFT,
    abi: GeckoNFTABI,
    functionName: 'MAX_SUPPLY',
  })

  const { data: maxMintsPerWallet } = useReadContract({
    address: CONTRACT_ADDRESSES.GECKO_NFT,
    abi: GeckoNFTABI,
    functionName: 'maxMintsPerWallet',
  })

  const { data: walletMintCount } = useReadContract({
    address: CONTRACT_ADDRESSES.GECKO_NFT,
    abi: GeckoNFTABI,
    functionName: 'walletMintCount',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })

  // =============================================================================
  // NFT Operations
  // =============================================================================

  const mintNFT = useCallback(async (quantity: number = 1) => {
    if (!address || !mintPrice) {
      toast.error('Wallet not connected or mint price not loaded')
      return
    }

    if (quantity < 1 || quantity > 10) {
      toast.error('Invalid quantity. Must be between 1 and 10')
      return
    }

    const totalCost = mintPrice * BigInt(quantity)

    try {
      const result = writeContract({
        address: CONTRACT_ADDRESSES.GECKO_NFT,
        abi: GeckoNFTABI,
        functionName: 'mint',
        args: [address, quantity],
        value: totalCost,
      })

      toast.success(`Minting ${quantity} Gecko${quantity > 1 ? 's' : ''}...`)
      return result
    } catch (error) {
      console.error('Mint error:', error)
      toast.error('Failed to mint NFT')
      throw error
    }
  }, [address, mintPrice, writeContract])

  const breedGeckos = useCallback(async (parent1Id: string, parent2Id: string) => {
    if (!address) {
      toast.error('Wallet not connected')
      return
    }

    try {
      const result = writeContract({
        address: CONTRACT_ADDRESSES.GECKO_NFT,
        abi: GeckoNFTABI,
        functionName: 'breedGeckos',
        args: [BigInt(parent1Id), BigInt(parent2Id)],
      })

      toast.success('Breeding Geckos...')
      return result
    } catch (error) {
      console.error('Breeding error:', error)
      toast.error('Failed to breed Geckos')
      throw error
    }
  }, [address, writeContract])

  // =============================================================================
  // NFT Data Loading
  // =============================================================================

  const loadOwnedNFTs = useCallback(async () => {
    if (!address) return

    setIsLoadingNFTs(true)
    try {
      // This would typically call a subgraph or indexing service
      // For now, we'll simulate loading owned NFTs
      const mockNFTs: GeckoNFT[] = []
      
      // In production, you'd call:
      // const tokenIds = await readContract({
      //   address: CONTRACT_ADDRESSES.GECKO_NFT,
      //   abi: GeckoNFTABI,
      //   functionName: 'getGeckosByOwner',
      //   args: [address],
      // })

      setOwnedNFTs(mockNFTs)
    } catch (error) {
      console.error('Error loading NFTs:', error)
      toast.error('Failed to load your NFTs')
    } finally {
      setIsLoadingNFTs(false)
    }
  }, [address])

  const loadNFTTraits = useCallback(async (tokenId: string): Promise<GeckoTraits | null> => {
    try {
      // This would call the contract
      const traits = null // await readContract(...)
      return traits
    } catch (error) {
      console.error('Error loading NFT traits:', error)
      return null
    }
  }, [])

  const loadNFTMetadata = useCallback(async (tokenId: string): Promise<NFTMetadata | null> => {
    try {
      // This would fetch from IPFS
      const tokenURI = '' // await getTokenURI(tokenId)
      // const response = await fetch(tokenURI)
      // const metadata = await response.json()
      return null
    } catch (error) {
      console.error('Error loading NFT metadata:', error)
      return null
    }
  }, [])

  // =============================================================================
  // Utility Functions
  // =============================================================================

  const getGeckoTypeString = (geckoType: number): string => {
    const types = ['FIRE', 'ICE', 'ELECTRIC', 'POISON', 'COSMIC', 'LEGENDARY']
    return types[geckoType] || 'UNKNOWN'
  }

  const getRarityString = (rarity: number): string => {
    const rarities = ['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY']
    return rarities[rarity] || 'UNKNOWN'
  }

  const getRarityColor = (rarity: number): string => {
    const colors = ['#808080', '#00ff00', '#0080ff', '#8000ff', '#ff8000']
    return colors[rarity] || '#808080'
  }

  const calculateMintCost = (quantity: number): string => {
    if (!mintPrice) return '0'
    const totalCost = mintPrice * BigInt(quantity)
    return formatEther(totalCost)
  }

  const canMint = (): boolean => {
    if (!address || !walletMintCount || !maxMintsPerWallet) return false
    return walletMintCount < maxMintsPerWallet
  }

  const getRemainingMints = (): number => {
    if (!walletMintCount || !maxMintsPerWallet) return 0
    return Number(maxMintsPerWallet - walletMintCount)
  }

  const getMintProgress = (): { current: number; max: number; percentage: number } => {
    const current = Number(totalSupply || 0)
    const max = Number(maxSupply || 10000)
    const percentage = max > 0 ? (current / max) * 100 : 0

    return { current, max, percentage }
  }

  // =============================================================================
  // Breeding Utilities
  // =============================================================================

  const canBreed = (gecko1: GeckoNFT, gecko2: GeckoNFT): boolean => {
    return (
      gecko1.tokenId !== gecko2.tokenId &&
      gecko1.traits.canBreed &&
      gecko2.traits.canBreed &&
      Number(gecko1.traits.breedCount) < 3 &&
      Number(gecko2.traits.breedCount) < 3
    )
  }

  const getBreedingCooldown = (tokenId: string): number => {
    // This would check the contract for cooldown
    return 0 // seconds remaining
  }

  // =============================================================================
  // Effects
  // =============================================================================

  useEffect(() => {
    if (address) {
      loadOwnedNFTs()
    } else {
      setOwnedNFTs([])
    }
  }, [address, loadOwnedNFTs])

  // =============================================================================
  // Return Hook Interface
  // =============================================================================

  return {
    // State
    ownedNFTs,
    isLoadingNFTs,
    mintingCount,
    setMintingCount,
    
    // Contract data
    totalSupply: Number(totalSupply || 0),
    mintPrice: mintPrice ? formatEther(mintPrice) : '0',
    maxSupply: Number(maxSupply || 10000),
    maxMintsPerWallet: Number(maxMintsPerWallet || 5),
    walletMintCount: Number(walletMintCount || 0),
    
    // Transaction states
    isPending,
    isConfirming,
    hash,
    
    // Operations
    mintNFT,
    breedGeckos,
    
    // Data loading
    loadOwnedNFTs,
    loadNFTTraits,
    loadNFTMetadata,
    
    // Utilities
    getGeckoTypeString,
    getRarityString,
    getRarityColor,
    calculateMintCost,
    canMint,
    getRemainingMints,
    getMintProgress,
    
    // Breeding
    canBreed,
    getBreedingCooldown,
  }
}

// =============================================================================
// Additional Hooks
// =============================================================================

export function useNFTDetails(tokenId: string) {
  const [nft, setNft] = useState<GeckoNFT | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const { data: traits } = useReadContract({
    address: CONTRACT_ADDRESSES.GECKO_NFT,
    abi: GeckoNFTABI,
    functionName: 'getGeckoTraits',
    args: tokenId ? [BigInt(tokenId)] : undefined,
    query: {
      enabled: !!tokenId,
    },
  })

  const { data: owner } = useReadContract({
    address: CONTRACT_ADDRESSES.GECKO_NFT,
    abi: GeckoNFTABI,
    functionName: 'ownerOf',
    args: tokenId ? [BigInt(tokenId)] : undefined,
    query: {
      enabled: !!tokenId,
    },
  })

  const { data: tokenURI } = useReadContract({
    address: CONTRACT_ADDRESSES.GECKO_NFT,
    abi: GeckoNFTABI,
    functionName: 'tokenURI',
    args: tokenId ? [BigInt(tokenId)] : undefined,
    query: {
      enabled: !!tokenId,
    },
  })

  useEffect(() => {
    const loadNFTData = async () => {
      if (!tokenId || !traits || !owner) return

      setIsLoading(true)
      try {
        let metadata: NFTMetadata | undefined

        if (tokenURI) {
          try {
            const response = await fetch(tokenURI)
            metadata = await response.json()
          } catch (error) {
            console.warn('Failed to load metadata:', error)
          }
        }

        setNft({
          tokenId,
          owner: owner as string,
          traits: traits as GeckoTraits,
          metadata,
        })
      } catch (error) {
        console.error('Error loading NFT details:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadNFTData()
  }, [tokenId, traits, owner, tokenURI])

  return {
    nft,
    isLoading,
    traits,
    owner,
    tokenURI,
  }
}