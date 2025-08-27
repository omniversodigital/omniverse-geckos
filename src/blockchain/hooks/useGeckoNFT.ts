'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAccount, usePublicClient, useWalletClient, useContractRead, useContractWrite, usePrepareContractWrite } from 'wagmi'
import { type Address, formatEther, parseEther } from 'viem'
import { toast } from 'sonner'

// =============================================================================
// Types
// =============================================================================

export interface GeckoNFT {
  tokenId: string
  name: string
  description: string
  image: string
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary'
  geckoType: 'Fire' | 'Ice' | 'Electric' | 'Poison' | 'Cosmic' | 'Legendary'
  level: number
  experience: number
  stats: {
    damage: number
    range: number
    fireRate: number
  }
  traits: Array<{
    trait_type: string
    value: string | number
    rarity: number
  }>
  canBreed: boolean
  breedCount: number
  lastBreeding?: number
  isForSale?: boolean
  price?: string
  owner: string
  securityVerified: boolean
}

export interface BreedingPair {
  parent1: GeckoNFT
  parent2: GeckoNFT
  estimatedChild?: {
    rarity: string
    stats: GeckoNFT['stats']
    traits: GeckoNFT['traits']
  }
  cost: string
  cooldownRemaining: number
}

export interface MintingOptions {
  quantity: number
  useSecureRandomness: boolean
  priorityFee?: bigint
}

// =============================================================================
// Contract Configuration
// =============================================================================

const GECKO_NFT_ADDRESS = '0x1234567890123456789012345678901234567890' as Address

const GECKO_NFT_ABI = [
  // Read functions
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'getGeckoTraits',
    outputs: [
      {
        components: [
          { name: 'geckoType', type: 'uint8' },
          { name: 'rarity', type: 'uint8' },
          { name: 'level', type: 'uint256' },
          { name: 'experience', type: 'uint256' },
          { name: 'damage', type: 'uint256' },
          { name: 'range', type: 'uint256' },
          { name: 'fireRate', type: 'uint256' },
          { name: 'birthTime', type: 'uint256' },
          { name: 'canBreed', type: 'bool' },
          { name: 'breedCount', type: 'uint256' },
          { name: 'securityHash', type: 'uint256' },
          { name: 'isLegitimate', type: 'bool' }
        ],
        name: 'traits',
        type: 'tuple'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'getGeckosByOwner',
    outputs: [{ name: '', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'mintPrice',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'verifyGeckoSecurity',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  },
  // Write functions
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'quantity', type: 'uint256' }
    ],
    name: 'mintSecure',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      { name: 'parent1Id', type: 'uint256' },
      { name: 'parent2Id', type: 'uint256' }
    ],
    name: 'breedGeckos',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  }
] as const

// =============================================================================
// Enhanced NFT Hook
// =============================================================================

export function useGeckoNFT() {
  const { address, isConnected } = useAccount()
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()

  // State
  const [userNFTs, setUserNFTs] = useState<GeckoNFT[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [mintingState, setMintingState] = useState<{
    isActive: boolean
    progress: number
    stage: string
  }>({
    isActive: false,
    progress: 0,
    stage: 'idle'
  })

  // Contract reads
  const { data: totalSupply } = useContractRead({
    address: GECKO_NFT_ADDRESS,
    abi: GECKO_NFT_ABI,
    functionName: 'totalSupply',
  })

  const { data: mintPrice } = useContractRead({
    address: GECKO_NFT_ADDRESS,
    abi: GECKO_NFT_ABI,
    functionName: 'mintPrice',
  })

  const { data: userTokenIds } = useContractRead({
    address: GECKO_NFT_ADDRESS,
    abi: GECKO_NFT_ABI,
    functionName: 'getGeckosByOwner',
    args: address ? [address] : undefined,
    enabled: !!address,
  })

  // =============================================================================
  // NFT Data Loading
  // =============================================================================

  const loadNFTMetadata = useCallback(async (tokenIds: readonly bigint[]) => {
    if (!tokenIds || tokenIds.length === 0) return []

    setIsLoading(true)
    const nfts: GeckoNFT[] = []

    try {
      for (const tokenId of tokenIds) {
        // Get traits from contract
        const traits = await publicClient?.readContract({
          address: GECKO_NFT_ADDRESS,
          abi: GECKO_NFT_ABI,
          functionName: 'getGeckoTraits',
          args: [tokenId],
        })

        if (traits) {
          // Verify security
          const isVerified = await publicClient?.readContract({
            address: GECKO_NFT_ADDRESS,
            abi: GECKO_NFT_ABI,
            functionName: 'verifyGeckoSecurity',
            args: [tokenId],
          })

          // Map contract data to our interface
          const nft: GeckoNFT = {
            tokenId: tokenId.toString(),
            name: `Gecko #${tokenId}`,
            description: `A unique Omniverse Gecko with special abilities`,
            image: `/images/nfts/gecko-${traits.geckoType}-${traits.rarity}.jpg`,
            rarity: mapRarity(Number(traits.rarity)),
            geckoType: mapGeckoType(Number(traits.geckoType)),
            level: Number(traits.level),
            experience: Number(traits.experience),
            stats: {
              damage: Number(traits.damage),
              range: Number(traits.range),
              fireRate: Number(traits.fireRate)
            },
            traits: generateTraitsFromContract(traits),
            canBreed: traits.canBreed,
            breedCount: Number(traits.breedCount),
            owner: address || '',
            securityVerified: Boolean(isVerified && traits.isLegitimate)
          }

          nfts.push(nft)
        }
      }

      return nfts
    } catch (error) {
      console.error('Failed to load NFT metadata:', error)
      toast.error('Failed to load NFT data')
      return []
    } finally {
      setIsLoading(false)
    }
  }, [publicClient, address])

  // Load user's NFTs when data changes
  useEffect(() => {
    if (userTokenIds && userTokenIds.length > 0) {
      loadNFTMetadata(userTokenIds).then(setUserNFTs)
    } else {
      setUserNFTs([])
    }
  }, [userTokenIds, loadNFTMetadata])

  // =============================================================================
  // Minting Functions
  // =============================================================================

  const mintNFT = useCallback(async (options: MintingOptions) => {
    if (!walletClient || !address || !mintPrice) {
      throw new Error('Wallet not connected or mint price not loaded')
    }

    const { quantity, useSecureRandomness = true } = options
    const totalCost = mintPrice * BigInt(quantity)

    setMintingState({
      isActive: true,
      progress: 10,
      stage: 'Preparing transaction...'
    })

    try {
      // Estimate gas first
      setMintingState(prev => ({ ...prev, progress: 30, stage: 'Estimating gas...' }))
      
      const gasEstimate = await publicClient?.estimateContractGas({
        address: GECKO_NFT_ADDRESS,
        abi: GECKO_NFT_ABI,
        functionName: 'mintSecure',
        args: [address, BigInt(quantity)],
        account: address,
        value: totalCost,
      })

      setMintingState(prev => ({ ...prev, progress: 50, stage: 'Sending transaction...' }))

      // Send transaction
      const hash = await walletClient.writeContract({
        address: GECKO_NFT_ADDRESS,
        abi: GECKO_NFT_ABI,
        functionName: 'mintSecure',
        args: [address, BigInt(quantity)],
        value: totalCost,
        gas: gasEstimate,
      })

      setMintingState(prev => ({ ...prev, progress: 70, stage: 'Waiting for confirmation...' }))

      // Wait for confirmation
      const receipt = await publicClient?.waitForTransactionReceipt({ hash })

      if (receipt?.status === 'success') {
        setMintingState(prev => ({ ...prev, progress: 90, stage: 'Processing VRF...' }))
        
        toast.success(`Successfully minted ${quantity} Gecko${quantity > 1 ? 's' : ''}!`, {
          description: 'Traits will be revealed once Chainlink VRF responds'
        })

        // Wait a bit for VRF to process (in real app, listen for events)
        setTimeout(() => {
          setMintingState(prev => ({ ...prev, progress: 100, stage: 'Complete!' }))
          
          // Reset after delay
          setTimeout(() => {
            setMintingState({ isActive: false, progress: 0, stage: 'idle' })
          }, 2000)
        }, 3000)

        return hash
      } else {
        throw new Error('Transaction failed')
      }

    } catch (error: any) {
      console.error('Minting failed:', error)
      
      let errorMessage = 'Minting failed'
      if (error.message.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for minting'
      } else if (error.message.includes('user rejected')) {
        errorMessage = 'Transaction rejected by user'
      }
      
      toast.error(errorMessage)
      setMintingState({ isActive: false, progress: 0, stage: 'idle' })
      throw error
    }
  }, [walletClient, address, mintPrice, publicClient])

  // =============================================================================
  // Breeding Functions
  // =============================================================================

  const simulateBreeding = useCallback((parent1: GeckoNFT, parent2: GeckoNFT): BreedingPair => {
    // Check if breeding is possible
    if (!parent1.canBreed || !parent2.canBreed) {
      throw new Error('One or both parents cannot breed')
    }

    if (parent1.breedCount >= 3 || parent2.breedCount >= 3) {
      throw new Error('Parent has reached maximum breeding count')
    }

    // Calculate estimated child traits
    const avgDamage = Math.floor((parent1.stats.damage + parent2.stats.damage) / 2)
    const avgRange = Math.floor((parent1.stats.range + parent2.stats.range) / 2)
    const avgFireRate = Math.floor((parent1.stats.fireRate + parent2.stats.fireRate) / 2)

    // Add variation (-10% to +20%)
    const damageVariation = Math.random() * 30 - 10
    const rangeVariation = Math.random() * 30 - 10

    const estimatedChild = {
      rarity: estimateChildRarity(parent1.rarity, parent2.rarity),
      stats: {
        damage: Math.floor(avgDamage * (1 + damageVariation / 100)),
        range: Math.floor(avgRange * (1 + rangeVariation / 100)),
        fireRate: avgFireRate
      },
      traits: combineTraits(parent1.traits, parent2.traits)
    }

    return {
      parent1,
      parent2,
      estimatedChild,
      cost: '0.01', // 0.01 ETH breeding cost
      cooldownRemaining: 0 // Calculate based on last breeding time
    }
  }, [])

  const breedGeckos = useCallback(async (parent1Id: string, parent2Id: string) => {
    if (!walletClient || !address) {
      throw new Error('Wallet not connected')
    }

    try {
      toast.loading('Starting breeding process...', { id: 'breeding' })

      const hash = await walletClient.writeContract({
        address: GECKO_NFT_ADDRESS,
        abi: GECKO_NFT_ABI,
        functionName: 'breedGeckos',
        args: [BigInt(parent1Id), BigInt(parent2Id)],
      })

      // Wait for confirmation
      const receipt = await publicClient?.waitForTransactionReceipt({ hash })

      if (receipt?.status === 'success') {
        toast.success('Breeding successful! New Gecko will be revealed soon.', { id: 'breeding' })
        return hash
      } else {
        throw new Error('Breeding transaction failed')
      }

    } catch (error: any) {
      console.error('Breeding failed:', error)
      toast.error('Breeding failed. Please try again.', { id: 'breeding' })
      throw error
    }
  }, [walletClient, address, publicClient])

  // =============================================================================
  // Utility Functions
  // =============================================================================

  const getBreedingCooldown = useCallback((gecko: GeckoNFT): number => {
    if (!gecko.lastBreeding) return 0
    
    const cooldownTime = 7 * 24 * 60 * 60 * 1000 // 7 days in ms
    const elapsed = Date.now() - gecko.lastBreeding
    
    return Math.max(0, cooldownTime - elapsed)
  }, [])

  const canBreedPair = useCallback((gecko1: GeckoNFT, gecko2: GeckoNFT): boolean => {
    return gecko1.canBreed && 
           gecko2.canBreed && 
           gecko1.breedCount < 3 && 
           gecko2.breedCount < 3 &&
           getBreedingCooldown(gecko1) === 0 &&
           getBreedingCooldown(gecko2) === 0
  }, [getBreedingCooldown])

  const refreshNFTs = useCallback(async () => {
    if (userTokenIds && userTokenIds.length > 0) {
      const updatedNFTs = await loadNFTMetadata(userTokenIds)
      setUserNFTs(updatedNFTs)
    }
  }, [userTokenIds, loadNFTMetadata])

  // =============================================================================
  // Return Hook Interface
  // =============================================================================

  return {
    // NFT Data
    userNFTs,
    totalSupply: totalSupply ? Number(totalSupply) : 0,
    mintPrice: mintPrice ? formatEther(mintPrice) : '0',
    
    // Loading States
    isLoading,
    mintingState,
    
    // Minting
    mintNFT,
    canMint: isConnected && !!address && !!mintPrice,
    
    // Breeding
    simulateBreeding,
    breedGeckos,
    canBreedPair,
    getBreedingCooldown,
    
    // Utilities
    refreshNFTs,
    
    // Filters and sorting
    getBreedableNFTs: () => userNFTs.filter(nft => nft.canBreed && nft.breedCount < 3),
    getNFTsByRarity: (rarity: GeckoNFT['rarity']) => userNFTs.filter(nft => nft.rarity === rarity),
    getNFTsByType: (type: GeckoNFT['geckoType']) => userNFTs.filter(nft => nft.geckoType === type),
    
    // Security
    getVerifiedNFTs: () => userNFTs.filter(nft => nft.securityVerified),
    getUnverifiedNFTs: () => userNFTs.filter(nft => !nft.securityVerified),
    
    // Stats
    getTotalValue: () => userNFTs.reduce((sum, nft) => sum + (parseFloat(nft.price || '0')), 0),
    getAverageLevel: () => userNFTs.length > 0 
      ? userNFTs.reduce((sum, nft) => sum + nft.level, 0) / userNFTs.length 
      : 0,
    getRarityDistribution: () => {
      const distribution: Record<string, number> = {}
      userNFTs.forEach(nft => {
        distribution[nft.rarity] = (distribution[nft.rarity] || 0) + 1
      })
      return distribution
    }
  }
}

// =============================================================================
// Helper Functions
// =============================================================================

function mapRarity(rarityIndex: number): GeckoNFT['rarity'] {
  const rarities: GeckoNFT['rarity'][] = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary']
  return rarities[rarityIndex] || 'Common'
}

function mapGeckoType(typeIndex: number): GeckoNFT['geckoType'] {
  const types: GeckoNFT['geckoType'][] = ['Fire', 'Ice', 'Electric', 'Poison', 'Cosmic', 'Legendary']
  return types[typeIndex] || 'Fire'
}

function generateTraitsFromContract(contractTraits: any): GeckoNFT['traits'] {
  return [
    {
      trait_type: 'Element',
      value: mapGeckoType(Number(contractTraits.geckoType)),
      rarity: getRarityPercentage(contractTraits.rarity)
    },
    {
      trait_type: 'Power Level',
      value: Number(contractTraits.damage),
      rarity: calculateStatRarity(Number(contractTraits.damage), 'damage')
    },
    {
      trait_type: 'Range',
      value: Number(contractTraits.range),
      rarity: calculateStatRarity(Number(contractTraits.range), 'range')
    }
  ]
}

function getRarityPercentage(rarity: number): number {
  const percentages = [60, 25, 10, 4, 1] // Common to Legendary
  return percentages[rarity] || 60
}

function calculateStatRarity(value: number, statType: string): number {
  // Mock implementation - in real app, calculate based on distribution
  if (value > 80) return 5
  if (value > 60) return 15
  if (value > 40) return 30
  return 50
}

function estimateChildRarity(parent1Rarity: string, parent2Rarity: string): string {
  const rarityValues: Record<string, number> = {
    'Common': 1,
    'Uncommon': 2,
    'Rare': 3,
    'Epic': 4,
    'Legendary': 5
  }

  const avg = (rarityValues[parent1Rarity] + rarityValues[parent2Rarity]) / 2
  const variance = Math.random() * 1 - 0.5 // -0.5 to +0.5
  const result = Math.round(avg + variance)

  const rarityNames = ['', 'Common', 'Uncommon', 'Rare', 'Epic', 'Legendary']
  return rarityNames[Math.max(1, Math.min(5, result))]
}

function combineTraits(traits1: GeckoNFT['traits'], traits2: GeckoNFT['traits']): GeckoNFT['traits'] {
  // Simple trait combination - inherit random traits from parents
  const combined = []
  
  // Take some traits from each parent
  const parent1Traits = traits1.slice(0, Math.ceil(traits1.length / 2))
  const parent2Traits = traits2.slice(0, Math.floor(traits2.length / 2))
  
  return [...parent1Traits, ...parent2Traits]
}