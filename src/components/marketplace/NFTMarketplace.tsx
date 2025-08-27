'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Star, 
  Flame, 
  TrendingUp, 
  Eye, 
  Heart,
  ShoppingCart,
  Zap,
  Crown,
  Gem,
  Trophy,
  Sparkles
} from 'lucide-react'

export interface NFTAsset {
  id: string
  name: string
  description: string
  image: string
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic'
  price: string
  priceUSD: string
  seller: string
  stats: {
    power: number
    defense: number
    speed: number
    special: number
  }
  traits: Array<{
    trait_type: string
    value: string | number
    rarity: number
  }>
  isForSale: boolean
  likes: number
  views: number
  lastSale?: string
  createdAt: string
}

const MOCK_NFTS: NFTAsset[] = [
  {
    id: '1',
    name: 'Golden Emperor',
    description: 'A majestic golden gecko with imperial powers',
    image: 'assets/geckos/gecko-nft-1.jpg',
    rarity: 'Mythic',
    price: '2.5',
    priceUSD: '$4,250',
    seller: '0x1234...5678',
    stats: { power: 95, defense: 88, speed: 92, special: 98 },
    traits: [
      { trait_type: 'Element', value: 'Gold', rarity: 2.1 },
      { trait_type: 'Background', value: 'Royal Palace', rarity: 1.8 },
      { trait_type: 'Crown', value: 'Imperial', rarity: 0.9 }
    ],
    isForSale: true,
    likes: 2847,
    views: 18392,
    lastSale: '1.8 ETH',
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    name: 'Crystal Warrior',
    description: 'Battle-hardened gecko with crystal armor',
    image: 'assets/geckos/gecko-nft-2.jpg',
    rarity: 'Legendary',
    price: '1.2',
    priceUSD: '$2,040',
    seller: '0xabcd...efgh',
    stats: { power: 89, defense: 95, speed: 78, special: 85 },
    traits: [
      { trait_type: 'Element', value: 'Crystal', rarity: 5.2 },
      { trait_type: 'Armor', value: 'Diamond', rarity: 3.1 },
      { trait_type: 'Weapon', value: 'Shard Blade', rarity: 2.7 }
    ],
    isForSale: true,
    likes: 1923,
    views: 12847,
    lastSale: '0.9 ETH',
    createdAt: '2024-02-03'
  },
  {
    id: '3',
    name: 'Shadow Assassin',
    description: 'Stealthy gecko master of darkness',
    image: 'assets/geckos/gecko-nft-3.jpg',
    rarity: 'Epic',
    price: '0.8',
    priceUSD: '$1,360',
    seller: '0x9876...5432',
    stats: { power: 78, defense: 65, speed: 98, special: 88 },
    traits: [
      { trait_type: 'Element', value: 'Shadow', rarity: 8.3 },
      { trait_type: 'Skill', value: 'Stealth', rarity: 12.5 },
      { trait_type: 'Eyes', value: 'Glowing Red', rarity: 6.9 }
    ],
    isForSale: true,
    likes: 1456,
    views: 9234,
    createdAt: '2024-02-18'
  },
  {
    id: '4',
    name: 'Fire Elemental',
    description: 'Blazing gecko with fire manipulation powers',
    image: 'assets/geckos/gecko-nft-4.jpg',
    rarity: 'Rare',
    price: '0.4',
    priceUSD: '$680',
    seller: '0x5555...1111',
    stats: { power: 85, defense: 70, speed: 82, special: 90 },
    traits: [
      { trait_type: 'Element', value: 'Fire', rarity: 15.2 },
      { trait_type: 'Aura', value: 'Flame', rarity: 18.7 },
      { trait_type: 'Pattern', value: 'Ember', rarity: 22.1 }
    ],
    isForSale: true,
    likes: 892,
    views: 5647,
    createdAt: '2024-03-05'
  },
  {
    id: '5',
    name: 'Ice Guardian',
    description: 'Frozen defender with ice powers',
    image: 'assets/geckos/gecko-nft-5.jpg',
    rarity: 'Rare',
    price: '0.35',
    priceUSD: '$595',
    seller: '0x7777...3333',
    stats: { power: 72, defense: 95, speed: 65, special: 78 },
    traits: [
      { trait_type: 'Element', value: 'Ice', rarity: 16.8 },
      { trait_type: 'Shield', value: 'Frost', rarity: 14.3 },
      { trait_type: 'Aura', value: 'Arctic', rarity: 19.5 }
    ],
    isForSale: true,
    likes: 743,
    views: 4921,
    createdAt: '2024-03-12'
  },
  {
    id: '6',
    name: 'Nature Spirit',
    description: 'Forest guardian with natural abilities',
    image: 'assets/geckos/gecko-nft-6.jpg',
    rarity: 'Common',
    price: '0.15',
    priceUSD: '$255',
    seller: '0x2222...8888',
    stats: { power: 65, defense: 72, speed: 75, special: 68 },
    traits: [
      { trait_type: 'Element', value: 'Nature', rarity: 28.5 },
      { trait_type: 'Background', value: 'Forest', rarity: 35.2 },
      { trait_type: 'Accessory', value: 'Leaf Crown', rarity: 31.7 }
    ],
    isForSale: true,
    likes: 456,
    views: 2834,
    createdAt: '2024-03-20'
  }
]

const RARITY_COLORS = {
  Common: '#6b7280',
  Rare: '#3b82f6',
  Epic: '#8b5cf6',
  Legendary: '#f59e0b',
  Mythic: '#ef4444'
}

const RARITY_ICONS = {
  Common: Sparkles,
  Rare: Gem,
  Epic: Crown,
  Legendary: Trophy,
  Mythic: Flame
}

interface NFTMarketplaceProps {
  compact?: boolean
  maxItems?: number
  showFilters?: boolean
}

export function NFTMarketplace({ 
  compact = false, 
  maxItems = 6, 
  showFilters = true 
}: NFTMarketplaceProps) {
  const [nfts, setNfts] = useState<NFTAsset[]>(MOCK_NFTS)
  const [filteredNfts, setFilteredNfts] = useState<NFTAsset[]>(MOCK_NFTS)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRarity, setSelectedRarity] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'price_low' | 'price_high' | 'newest' | 'popular'>('popular')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [likedNFTs, setLikedNFTs] = useState<Set<string>>(new Set())

  useEffect(() => {
    let filtered = [...nfts]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(nft => 
        nft.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        nft.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Rarity filter
    if (selectedRarity !== 'all') {
      filtered = filtered.filter(nft => nft.rarity === selectedRarity)
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price_low':
          return parseFloat(a.price) - parseFloat(b.price)
        case 'price_high':
          return parseFloat(b.price) - parseFloat(a.price)
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'popular':
          return b.likes - a.likes
        default:
          return 0
      }
    })

    // Limit items if compact
    if (compact && maxItems) {
      filtered = filtered.slice(0, maxItems)
    }

    setFilteredNfts(filtered)
  }, [nfts, searchQuery, selectedRarity, sortBy, compact, maxItems])

  const toggleLike = (nftId: string) => {
    const newLiked = new Set(likedNFTs)
    if (newLiked.has(nftId)) {
      newLiked.delete(nftId)
    } else {
      newLiked.add(nftId)
    }
    setLikedNFTs(newLiked)
  }

  const getRarityIcon = (rarity: NFTAsset['rarity']) => {
    const Icon = RARITY_ICONS[rarity]
    return <Icon className="w-4 h-4" />
  }

  return (
    <div className={`w-full ${compact ? 'space-y-4' : 'space-y-6'}`}>
      {/* Header */}
      {!compact && (
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">
            🦎 NFT Marketplace
          </h2>
          <p className="text-gray-400">
            Discover, collect, and trade unique Omniverse Geckos
          </p>
        </div>
      )}

      {/* Filters and Search */}
      {showFilters && (
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex flex-1 items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search NFTs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-gray-400"
              />
            </div>
            
            <select
              value={selectedRarity}
              onChange={(e) => setSelectedRarity(e.target.value)}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Rarities</option>
              <option value="Common">Common</option>
              <option value="Rare">Rare</option>
              <option value="Epic">Epic</option>
              <option value="Legendary">Legendary</option>
              <option value="Mythic">Mythic</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-green-500"
            >
              <option value="popular">Most Popular</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="newest">Newest First</option>
            </select>

            <div className="flex bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-green-600 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-green-600 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NFT Grid */}
      <div className={`
        grid gap-6
        ${viewMode === 'grid' 
          ? compact 
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
          : 'grid-cols-1'
        }
      `}>
        <AnimatePresence>
          {filteredNfts.map((nft) => (
            <motion.div
              key={nft.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className={`
                relative group
                ${viewMode === 'grid' 
                  ? 'bg-gray-900 rounded-xl overflow-hidden border border-gray-700 hover:border-green-500 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20 hover:transform hover:scale-105'
                  : 'bg-gray-900 rounded-xl p-4 border border-gray-700 hover:border-green-500 transition-all duration-300 flex items-center gap-4'
                }
              `}
            >
              {/* NFT Image */}
              <div className={`
                relative overflow-hidden
                ${viewMode === 'grid' ? 'aspect-square' : 'w-20 h-20 rounded-lg flex-shrink-0'}
              `}>
                <img
                  src={nft.image}
                  alt={nft.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                
                {/* Rarity Badge */}
                <div 
                  className="absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1"
                  style={{ 
                    backgroundColor: RARITY_COLORS[nft.rarity] + '20',
                    color: RARITY_COLORS[nft.rarity],
                    border: `1px solid ${RARITY_COLORS[nft.rarity]}40`
                  }}
                >
                  {getRarityIcon(nft.rarity)}
                  {nft.rarity}
                </div>

                {/* Like Button */}
                <button
                  onClick={() => toggleLike(nft.id)}
                  className={`
                    absolute top-2 right-2 p-2 rounded-full transition-all duration-300
                    ${likedNFTs.has(nft.id) 
                      ? 'bg-red-500 text-white' 
                      : 'bg-black/50 text-gray-300 hover:bg-red-500 hover:text-white'
                    }
                  `}
                >
                  <Heart className={`w-4 h-4 ${likedNFTs.has(nft.id) ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* NFT Info */}
              <div className={`${viewMode === 'grid' ? 'p-4' : 'flex-1'}`}>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-white truncate">{nft.name}</h3>
                  {viewMode === 'list' && (
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-400">{nft.price} ETH</div>
                      <div className="text-sm text-gray-400">{nft.priceUSD}</div>
                    </div>
                  )}
                </div>

                {viewMode === 'grid' && (
                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                    {nft.description}
                  </p>
                )}

                {/* Stats */}
                <div className={`${viewMode === 'grid' ? 'grid grid-cols-4 gap-2 mb-3' : 'flex gap-4 mb-2'}`}>
                  <div className="text-center">
                    <div className="text-xs text-gray-400">PWR</div>
                    <div className="text-sm font-bold text-red-400">{nft.stats.power}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-400">DEF</div>
                    <div className="text-sm font-bold text-blue-400">{nft.stats.defense}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-400">SPD</div>
                    <div className="text-sm font-bold text-green-400">{nft.stats.speed}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-400">SPC</div>
                    <div className="text-sm font-bold text-purple-400">{nft.stats.special}</div>
                  </div>
                </div>

                {/* Price and Actions */}
                {viewMode === 'grid' && (
                  <>
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <div className="text-lg font-bold text-green-400">{nft.price} ETH</div>
                        <div className="text-sm text-gray-400">{nft.priceUSD}</div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-sm text-gray-400">
                          <Eye className="w-3 h-3" />
                          {nft.views.toLocaleString()}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-400">
                          <Heart className="w-3 h-3" />
                          {nft.likes.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2">
                      <ShoppingCart className="w-4 h-4" />
                      Buy Now
                    </button>
                  </>
                )}

                {viewMode === 'list' && (
                  <button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4" />
                    Buy Now
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredNfts.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🦎</div>
          <h3 className="text-xl font-bold text-gray-300 mb-2">No NFTs Found</h3>
          <p className="text-gray-400">Try adjusting your search or filters</p>
        </div>
      )}

      {/* View More Button */}
      {compact && filteredNfts.length >= maxItems && (
        <div className="text-center">
          <button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300">
            View All NFTs ({MOCK_NFTS.length} total)
          </button>
        </div>
      )}
    </div>
  )
}