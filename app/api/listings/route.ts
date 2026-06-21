import { NextRequest, NextResponse } from 'next/server'
import { fetchListings } from '@/lib/api/listings'
import { DEFAULT_PREFERENCES, UserPreferences } from '@/lib/types'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const city = searchParams.get('city')

  if (!city) {
    return NextResponse.json({ error: 'city is required' }, { status: 400 })
  }

  const prefs: UserPreferences = {
    ...DEFAULT_PREFERENCES,
    naturalLight: searchParams.get('naturalLight') === 'true',
    highFloor: searchParams.get('highFloor') === 'true',
    oceanView: searchParams.get('oceanView') === 'true',
    cityView: searchParams.get('cityView') === 'true',
    mountainView: searchParams.get('mountainView') === 'true',
    modern: searchParams.get('modern') === 'true',
    historic: searchParams.get('historic') === 'true',
    balcony: searchParams.get('balcony') === 'true',
    rooftop: searchParams.get('rooftop') === 'true',
    gym: searchParams.get('gym') === 'true',
    pool: searchParams.get('pool') === 'true',
    concierge: searchParams.get('concierge') === 'true',
    petFriendly: searchParams.get('petFriendly') === 'true',
    parking: searchParams.get('parking') === 'true',
    storage: searchParams.get('storage') === 'true',
    inUnitLaundry: searchParams.get('inUnitLaundry') === 'true',
    bedrooms: Number(searchParams.get('bedrooms') || 1),
    bathrooms: Number(searchParams.get('bathrooms') || 1),
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    minSqft: searchParams.get('minSqft') ? Number(searchParams.get('minSqft')) : undefined,
    listingType: (searchParams.get('listingType') as UserPreferences['listingType']) || 'both',
    propertyTypes: searchParams.get('propertyTypes')?.split(',').filter(Boolean) || [],
    walkability: searchParams.get('walkability') === 'true',
    transitAccess: searchParams.get('transitAccess') === 'true',
    bikeFriendly: searchParams.get('bikeFriendly') === 'true',
    nearRestaurants: searchParams.get('nearRestaurants') === 'true',
    nearParks: searchParams.get('nearParks') === 'true',
    nearSchools: searchParams.get('nearSchools') === 'true',
    quietNeighborhood: searchParams.get('quietNeighborhood') === 'true',
    upAndComing: searchParams.get('upAndComing') === 'true',
  }

  try {
    const listings = await fetchListings(city, prefs)
    return NextResponse.json({ listings, source: 'Realtor.com', disclaimer: 'Always verify listings directly with the listing agent. Your Scout provides search assistance only.' })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 })
  }
}
