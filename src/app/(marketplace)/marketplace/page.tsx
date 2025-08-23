'use client'

import { useState, useEffect, useMemo } from 'react'
import { useAccount } from 'wagmi'
import { Search, Filter, Grid, List, TrendingUp, Clock, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useMarketplace } from '@/blockchain/hooks/useMarketplace'
import { useNFT } from '@/blockchain/hooks/useNFT'
import { formatEther } from 'viem'
import Image from 'next/image'
import Link from 'next/link'

// =============================================================================
// Types
// =============================================================================

interface MarketplaceListing {
  id: string
  tokenId: string
  name: string
  image: string
  price: string
  currency: 'ETH' | 'GECKO'
  seller: string
  rarity: string
  geckoType: string
  level: number
  attributes: Array<{
    trait_type: string
    value: string | number
  }>
  timeLeft?: number
  isAuction?: boolean
  currentBid?: string
  bidCount?: number
}

// =============================================================================
// Main Component
// =============================================================================

export default function MarketplacePage() {
  const { address } = useAccount()
  const { 
    listings, 
    isLoading, 
    loadListings, 
    buyItem, 
    makeOffer,
    isPending
  } = useMarketplace()
  const { getRarityColor, getGeckoTypeString } = useNFT()

  // State
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('price-low')
  const [filterRarity, setFilterRarity] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [filterPrice, setFilterPrice] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedTab, setSelectedTab] = useState('all')

  // Mock data - in production, this would come from the useMarketplace hook
  const mockListings: MarketplaceListing[] = [
    {
      id: '1',
      tokenId: '1001',
      name: 'Fire Gecko #1001',
      image: '/api/placeholder/300/300',
      price: '0.15',
      currency: 'ETH',
      seller: '0x1234...5678',
      rarity: 'RARE',
      geckoType: 'FIRE',
      level: 5,
      attributes: [
        { trait_type: 'Damage', value: 75 },
        { trait_type: 'Range', value: 120 },
        { trait_type: 'Fire Rate', value: 800 },
      ],
    },
    {
      id: '2',
      tokenId: '1002',
      name: 'Ice Gecko #1002',
      image: '/api/placeholder/300/300',
      price: '250',
      currency: 'GECKO',
      seller: '0x5678...9abc',
      rarity: 'LEGENDARY',
      geckoType: 'ICE',
      level: 12,
      attributes: [
        { trait_type: 'Damage', value: 150 },
        { trait_type: 'Range', value: 200 },
        { trait_type: 'Special', value: 'Freeze' },
      ],
      isAuction: true,
      currentBid: '0.25',
      bidCount: 7,
      timeLeft: 3600000, // 1 hour in milliseconds
    },
  ]

  // Filtered and sorted listings
  const filteredListings = useMemo(() => {
    let filtered = mockListings

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(listing =>
        listing.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.tokenId.includes(searchQuery)
      )
    }

    // Rarity filter
    if (filterRarity !== 'all') {
      filtered = filtered.filter(listing => listing.rarity === filterRarity)
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(listing => listing.geckoType === filterType)
    }

    // Price filter
    if (filterPrice !== 'all') {
      const [min, max] = filterPrice.split('-').map(Number)
      filtered = filtered.filter(listing => {
        const price = parseFloat(listing.price)
        if (max) {
          return price >= min && price <= max
        }
        return price >= min
      })
    }

    // Sort
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price))
        break
      case 'price-high':
        filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price))
        break
      case 'rarity':
        const rarityOrder = { COMMON: 1, UNCOMMON: 2, RARE: 3, EPIC: 4, LEGENDARY: 5 }
        filtered.sort((a, b) => (rarityOrder[b.rarity as keyof typeof rarityOrder] || 0) - (rarityOrder[a.rarity as keyof typeof rarityOrder] || 0))
        break
      case 'level':
        filtered.sort((a, b) => b.level - a.level)
        break
      case 'newest':
        // Would sort by creation time in production
        break
    }

    return filtered
  }, [searchQuery, filterRarity, filterType, filterPrice, sortBy, mockListings])

  // Format time left
  const formatTimeLeft = (timeLeft: number): string => {
    const hours = Math.floor(timeLeft / (1000 * 60 * 60))
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }

  // Load data on mount
  useEffect(() => {
    loadListings()
  }, [loadListings])

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Gecko Marketplace
            </h1>
            <p className="text-muted-foreground mt-2">
              Discover, collect, and trade unique Gecko NFTs
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="text-sm">
              {filteredListings.length} Items
            </Badge>
            <Link href="/marketplace/create-listing">
              <Button>
                List Your NFT
              </Button>
            </Link>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by name or token ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Select value={filterRarity} onValueChange={setFilterRarity}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Rarity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Rarities</SelectItem>
                <SelectItem value="COMMON">Common</SelectItem>
                <SelectItem value="UNCOMMON">Uncommon</SelectItem>
                <SelectItem value="RARE">Rare</SelectItem>
                <SelectItem value="EPIC">Epic</SelectItem>
                <SelectItem value="LEGENDARY">Legendary</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="FIRE">Fire</SelectItem>
                <SelectItem value="ICE">Ice</SelectItem>
                <SelectItem value="ELECTRIC">Electric</SelectItem>
                <SelectItem value="POISON">Poison</SelectItem>
                <SelectItem value="COSMIC">Cosmic</SelectItem>
                <SelectItem value="LEGENDARY">Legendary</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterPrice} onValueChange={setFilterPrice}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Price" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="0-0.1">0 - 0.1 ETH</SelectItem>
                <SelectItem value="0.1-0.5">0.1 - 0.5 ETH</SelectItem>
                <SelectItem value="0.5-1">0.5 - 1 ETH</SelectItem>
                <SelectItem value="1">1+ ETH</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rarity">Rarity</SelectItem>
                <SelectItem value="level">Level</SelectItem>
                <SelectItem value="newest">Recently Listed</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex border rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList>
            <TabsTrigger value="all">All Items</TabsTrigger>
            <TabsTrigger value="buy-now">Buy Now</TabsTrigger>
            <TabsTrigger value="auction">Auctions</TabsTrigger>
            <TabsTrigger value="offers">Has Offers</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading marketplace...</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredListings.length === 0 && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🦎</div>
          <h3 className="text-2xl font-semibold mb-2">No Geckos Found</h3>
          <p className="text-muted-foreground mb-6">
            Try adjusting your filters to see more results
          </p>
          <Button onClick={() => {
            setSearchQuery('')
            setFilterRarity('all')
            setFilterType('all')
            setFilterPrice('all')
          }}>
            Clear Filters
          </Button>
        </div>
      )}

      {/* Listings Grid */}
      {!isLoading && filteredListings.length > 0 && (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
        }>
          {filteredListings.map((listing) => (
            <NFTCard
              key={listing.id}
              listing={listing}
              viewMode={viewMode}
              onBuy={(id) => console.log('Buy', id)}
              onMakeOffer={(id) => console.log('Make offer', id)}
              getRarityColor={getRarityColor}
            />
          ))}
        </div>
      )}

      {/* Load More */}
      {!isLoading && filteredListings.length > 0 && (
        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            Load More
          </Button>
        </div>
      )}
    </div>
  )
}

// =============================================================================
// NFT Card Component
// =============================================================================

interface NFTCardProps {
  listing: MarketplaceListing
  viewMode: 'grid' | 'list'
  onBuy: (id: string) => void
  onMakeOffer: (id: string) => void
  getRarityColor: (rarity: number) => string
}

function NFTCard({ listing, viewMode, onBuy, onMakeOffer, getRarityColor }: NFTCardProps) {
  const rarityColors = {
    COMMON: '#808080',
    UNCOMMON: '#00ff00', 
    RARE: '#0080ff',
    EPIC: '#8000ff',
    LEGENDARY: '#ff8000'
  }

  if (viewMode === 'list') {
    return (
      <Card className="hover:shadow-lg transition-shadow">
        <div className="flex items-center p-6 gap-6">
          <div className="relative">
            <Image
              src={listing.image}
              alt={listing.name}
              width={80}
              height={80}
              className="rounded-lg border"
            />
            <Badge 
              className="absolute -top-2 -right-2 text-xs"
              style={{ backgroundColor: rarityColors[listing.rarity as keyof typeof rarityColors] }}
            >
              {listing.rarity}
            </Badge>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold">{listing.name}</h3>
              <Badge variant="outline">{listing.geckoType}</Badge>
              <Badge variant="secondary">Lvl {listing.level}</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              Owned by {listing.seller.slice(0, 6)}...{listing.seller.slice(-4)}
            </p>
            <div className="flex items-center gap-4">
              {listing.attributes.map((attr, index) => (
                <span key={index} className="text-xs text-muted-foreground">
                  {attr.trait_type}: {attr.value}
                </span>
              ))}
            </div>
          </div>

          <div className="text-right">
            {listing.isAuction ? (
              <div className="mb-2">
                <p className="text-sm text-muted-foreground">Current bid</p>
                <p className="text-lg font-bold">{listing.currentBid} ETH</p>
                <p className="text-xs text-muted-foreground">{listing.bidCount} bids</p>
                {listing.timeLeft && (
                  <p className="text-xs text-orange-500 flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3" />
                    {formatTimeLeft(listing.timeLeft)}
                  </p>
                )}
              </div>
            ) : (
              <div className="mb-2">
                <p className="text-sm text-muted-foreground">Price</p>
                <p className="text-lg font-bold">{listing.price} {listing.currency}</p>
              </div>
            )}
            
            <div className="flex gap-2">
              <Button size="sm" onClick={() => onBuy(listing.id)}>
                {listing.isAuction ? 'Place Bid' : 'Buy Now'}
              </Button>
              <Button size="sm" variant="outline" onClick={() => onMakeOffer(listing.id)}>
                Make Offer
              </Button>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  // Grid view
  return (
    <Card className="nft-card group cursor-pointer">
      <CardHeader className="p-0">
        <div className="relative overflow-hidden rounded-t-lg">
          <Image
            src={listing.image}
            alt={listing.name}
            width={300}
            height={300}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-3 left-3">
            <Badge 
              className="text-xs"
              style={{ backgroundColor: rarityColors[listing.rarity as keyof typeof rarityColors] }}
            >
              {listing.rarity}
            </Badge>
          </div>
          <div className="absolute top-3 right-3">
            <Badge variant="secondary" className="text-xs">
              Lvl {listing.level}
            </Badge>
          </div>
          {listing.isAuction && listing.timeLeft && (
            <div className="absolute bottom-3 left-3 right-3">
              <div className="bg-black/80 rounded-md px-2 py-1 text-white text-xs flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatTimeLeft(listing.timeLeft)} left
              </div>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold truncate">{listing.name}</h3>
          <Badge variant="outline" className="text-xs">
            {listing.geckoType}
          </Badge>
        </div>
        
        <p className="text-sm text-muted-foreground mb-3">
          {listing.seller.slice(0, 6)}...{listing.seller.slice(-4)}
        </p>

        {listing.isAuction ? (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Current bid</p>
            <p className="text-lg font-bold">{listing.currentBid} ETH</p>
            <p className="text-xs text-muted-foreground">{listing.bidCount} bids</p>
          </div>
        ) : (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Price</p>
            <p className="text-lg font-bold">{listing.price} {listing.currency}</p>
          </div>
        )}

        {/* Attributes */}
        <div className="mt-3 space-y-1">
          {listing.attributes.slice(0, 2).map((attr, index) => (
            <div key={index} className="flex justify-between text-xs">
              <span className="text-muted-foreground">{attr.trait_type}</span>
              <span className="font-medium">{attr.value}</span>
            </div>
          ))}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 space-y-2">
        <Button 
          className="w-full" 
          onClick={() => onBuy(listing.id)}
          disabled={false}
        >
          {listing.isAuction ? 'Place Bid' : 'Buy Now'}
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full" 
          onClick={() => onMakeOffer(listing.id)}
        >
          Make Offer
        </Button>
      </CardFooter>
    </Card>
  )

  function formatTimeLeft(timeLeft: number): string {
    const hours = Math.floor(timeLeft / (1000 * 60 * 60))
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }
}