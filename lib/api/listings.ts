import { Listing, UserPreferences } from '@/lib/types'

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || ''
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST || 'realtor-com4.p.rapidapi.com'
const IDEALISTA_HOST = 'idealista2.p.rapidapi.com'

// Cities covered by Idealista (Spain, Italy, Portugal only)
const IDEALISTA_CITIES: Record<string, 'it' | 'es' | 'pt'> = {
  naples: 'it',
  palermo: 'it',
  florence: 'it',
  rome: 'it',
  milan: 'it',
  porto: 'pt',
  lisbon: 'pt',
  barcelona: 'es',
  madrid: 'es',
  seville: 'es',
  valencia: 'es',
  malaga: 'es',
}

// US/CA cities that Realtor.com covers well
const REALTOR_CITIES = new Set([
  'miami', 'new york', 'los angeles', 'chicago', 'san francisco',
  'seattle', 'austin', 'denver', 'boston', 'atlanta', 'houston',
  'phoenix', 'san diego', 'portland', 'nashville', 'toronto', 'vancouver',
])

function buildFeatures(listing: RealtorListing): Listing['features'] {
  const features: Listing['features'] = []
  const tags = (listing.tags || []).map((t: string) => t.toLowerCase())
  const desc = (listing.description?.text || '').toLowerCase()
  const combined = [...tags, desc]

  if (combined.some(t => t.includes('natural light') || t.includes('sun') || t.includes('bright'))) features.push('natural_light')
  if ((listing.location?.address?.unit || '').match(/\d+/) && parseInt(listing.location?.address?.unit || '0') > 10) features.push('high_floor')
  if (combined.some(t => t.includes('ocean') || t.includes('sea') || t.includes('water view'))) features.push('ocean_view')
  if (combined.some(t => t.includes('city view') || t.includes('skyline'))) features.push('city_view')
  if (combined.some(t => t.includes('mountain'))) features.push('mountain_view')
  if (combined.some(t => t.includes('modern') || t.includes('renovated') || t.includes('updated'))) features.push('modern')
  if (combined.some(t => t.includes('historic') || t.includes('classic') || t.includes('vintage'))) features.push('historic')
  if (combined.some(t => t.includes('balcony') || t.includes('terrace') || t.includes('patio'))) features.push('balcony')
  if (combined.some(t => t.includes('rooftop') || t.includes('roof deck'))) features.push('rooftop')
  if (combined.some(t => t.includes('gym') || t.includes('fitness'))) features.push('gym')
  if (combined.some(t => t.includes('pool') || t.includes('swimming'))) features.push('pool')
  if (combined.some(t => t.includes('concierge') || t.includes('doorman'))) features.push('concierge')
  if (combined.some(t => t.includes('pet') || t.includes('dog') || t.includes('cat'))) features.push('pet_friendly')
  if (combined.some(t => t.includes('parking') || t.includes('garage'))) features.push('parking')
  if (combined.some(t => t.includes('storage'))) features.push('storage')
  if (combined.some(t => t.includes('laundry') || t.includes('washer') || t.includes('dryer'))) features.push('in_unit_laundry')
  if (combined.some(t => t.includes('waterfront') || t.includes('marina') || t.includes('bay'))) features.push('waterfront')

  return features
}

function computeScoutScore(features: Listing['features'], prefs: UserPreferences): number {
  const checks: Array<[boolean, ListingFeature]> = [
    [prefs.naturalLight, 'natural_light'],
    [prefs.highFloor, 'high_floor'],
    [prefs.oceanView, 'ocean_view'],
    [prefs.cityView, 'city_view'],
    [prefs.mountainView, 'mountain_view'],
    [prefs.modern, 'modern'],
    [prefs.historic, 'historic'],
    [prefs.balcony, 'balcony'],
    [prefs.rooftop, 'rooftop'],
    [prefs.gym, 'gym'],
    [prefs.pool, 'pool'],
    [prefs.concierge, 'concierge'],
    [prefs.petFriendly, 'pet_friendly'],
    [prefs.parking, 'parking'],
    [prefs.storage, 'storage'],
    [prefs.inUnitLaundry, 'in_unit_laundry'],
  ]

  const wanted = checks.filter(([v]) => v)
  if (!wanted.length) return 70
  const matched = wanted.filter(([, f]) => features.includes(f as ListingFeature)).length
  return Math.round((matched / wanted.length) * 100)
}

type ListingFeature = Listing['features'][number]

interface RealtorListing {
  property_id?: string
  listing_id?: string
  permalink?: string
  list_price?: number
  list_price_max?: number
  primary_photo?: { href?: string }
  photos?: Array<{ href?: string }>
  location?: {
    address?: {
      line?: string
      city?: string
      state_code?: string
      country?: string
      unit?: string
    }
    county?: {
      name?: string
    }
  }
  description?: {
    beds?: number
    baths_consolidated?: number
    sqft?: number
    text?: string
    type?: string
    year_built?: number
  }
  tags?: string[]
  flags?: { is_price_reduced?: boolean }
}

function normalizeRealtor(item: RealtorListing, cityQuery: string, prefs: UserPreferences): Listing {
  const features = buildFeatures(item)
  const photos: string[] = []
  if (item.primary_photo?.href) photos.push(item.primary_photo.href)
  ;(item.photos || []).slice(0, 5).forEach((p) => { if (p.href && !photos.includes(p.href)) photos.push(p.href) })

  const listing: Listing = {
    id: item.property_id || item.listing_id || Math.random().toString(36).slice(2),
    source: 'Realtor.com',
    sourceUrl: item.permalink ? `https://www.realtor.com/realestateandhomes-detail/${item.permalink}` : 'https://www.realtor.com',
    address: item.location?.address?.line || 'Address not available',
    city: item.location?.address?.city || cityQuery,
    state: item.location?.address?.state_code || '',
    country: item.location?.address?.country || '',
    price: item.list_price || 0,
    priceDisplay: item.list_price ? `$${item.list_price.toLocaleString()}` : 'Price on request',
    listingType: 'buy',
    beds: item.description?.beds || 0,
    baths: item.description?.baths_consolidated || 0,
    sqft: item.description?.sqft || 0,
    photos,
    features,
    scoutScore: computeScoutScore(features, prefs),
    propertyType: item.description?.type || 'property',
    yearBuilt: item.description?.year_built,
    description: item.description?.text,
  }
  return listing
}

export async function fetchListings(city: string, prefs: UserPreferences): Promise<Listing[]> {
  if (!RAPIDAPI_KEY) return getDemoListings(city, prefs)

  const cityLower = city.toLowerCase()

  // Route to the right data source based on city
  if (IDEALISTA_CITIES[cityLower]) {
    const results = await fetchIdealista(city, IDEALISTA_CITIES[cityLower], prefs)
    if (results.length > 0) return results
  } else if (REALTOR_CITIES.has(cityLower) || !IDEALISTA_CITIES[cityLower]) {
    const results = await fetchRealtor(city, prefs)
    if (results.length > 0) return results
  }

  return getDemoListings(city, prefs)
}

async function fetchRealtor(city: string, prefs: UserPreferences): Promise<Listing[]> {
  try {
    const url = new URL(`https://${RAPIDAPI_HOST}/properties/search-buy`)
    url.searchParams.set('city', city)
    url.searchParams.set('limit', '12')
    if (prefs.bedrooms) url.searchParams.set('beds_min', String(prefs.bedrooms))
    if (prefs.maxPrice) url.searchParams.set('price_max', String(prefs.maxPrice))
    if (prefs.minPrice) url.searchParams.set('price_min', String(prefs.minPrice))

    const res = await fetch(url.toString(), {
      headers: { 'X-RapidAPI-Key': RAPIDAPI_KEY, 'X-RapidAPI-Host': RAPIDAPI_HOST },
      next: { revalidate: 3600 },
    })
    if (!res.ok) return []
    const data = await res.json()
    const items: RealtorListing[] = data?.data?.results || data?.results || []
    return items.slice(0, 12).map(item => normalizeRealtor(item, city, prefs))
  } catch (err) {
    console.error('Realtor fetch failed:', err)
    return []
  }
}

// ── Idealista (Italy / Spain / Portugal) ─────────────────────────────────────

interface IdealistaProperty {
  propertyCode: string
  url?: string
  thumbnail?: string
  price?: number
  rooms?: number
  bathrooms?: number
  size?: number
  exterior?: boolean
  floor?: string
  hasElevator?: boolean
  hasTerrace?: boolean
  hasGarden?: boolean
  hasSwimmingPool?: boolean
  hasGarage?: boolean
  address?: string
  district?: string
  neighborhood?: string
  description?: string
  images?: Array<{ url: string }>
  province?: string
  municipality?: string
  priceByArea?: number
}

function normalizeIdealista(item: IdealistaProperty, cityName: string, country: string, prefs: UserPreferences): Listing {
  const currencySymbol = country === 'pt' || country === 'es' || country === 'it' ? '€' : '€'
  const features: Listing['features'] = []
  if (item.exterior) features.push('natural_light')
  if (item.hasTerrace) features.push('balcony')
  if (item.hasGarden) features.push('balcony')
  if (item.hasSwimmingPool) features.push('pool')
  if (item.hasGarage) features.push('parking')
  const floorNum = parseInt(item.floor || '0')
  if (floorNum > 4) features.push('high_floor')
  const desc = (item.description || '').toLowerCase()
  if (desc.includes('vista') || desc.includes('view') || desc.includes('panoram')) features.push('city_view')
  if (desc.includes('mare') || desc.includes('sea') || desc.includes('ocean') || desc.includes('mar')) features.push('ocean_view')
  if (desc.includes('modern') || desc.includes('nuovo') || desc.includes('ristrutturato')) features.push('modern')
  if (desc.includes('storico') || desc.includes('historic') || desc.includes('antico')) features.push('historic')

  const price = item.price || 0
  const priceDisplay = price ? `${currencySymbol}${price.toLocaleString()}` : 'Price on request'
  const photos: string[] = []
  if (item.thumbnail) photos.push(item.thumbnail)
  ;(item.images || []).slice(0, 5).forEach(img => { if (img.url && !photos.includes(img.url)) photos.push(img.url) })

  return {
    id: item.propertyCode || Math.random().toString(36).slice(2),
    source: 'Idealista',
    sourceUrl: item.url || `https://www.idealista.it`,
    address: item.address || item.district || item.neighborhood || 'Address available on Idealista',
    city: item.municipality || cityName,
    state: item.province || '',
    country: country.toUpperCase(),
    price,
    priceDisplay,
    listingType: 'buy',
    beds: item.rooms || 0,
    baths: item.bathrooms || 0,
    sqft: item.size ? Math.round(item.size * 10.764) : 0,
    photos,
    features,
    scoutScore: computeScoutScore(features, prefs),
    propertyType: 'apartment',
    description: item.description,
  }
}

async function fetchIdealista(city: string, country: 'it' | 'es' | 'pt', prefs: UserPreferences): Promise<Listing[]> {
  try {
    // Step 1: resolve location ID
    const locUrl = new URL(`https://${IDEALISTA_HOST}/locations/list`)
    locUrl.searchParams.set('location', city)
    locUrl.searchParams.set('country', country)
    locUrl.searchParams.set('locale', 'en')

    const locRes = await fetch(locUrl.toString(), {
      headers: { 'X-RapidAPI-Key': RAPIDAPI_KEY, 'X-RapidAPI-Host': IDEALISTA_HOST },
      next: { revalidate: 86400 },
    })
    if (!locRes.ok) return []
    const locData = await locRes.json()
    const locations: Array<{ locationId: string; subTypeStr: string }> = locData || []
    const cityLoc = locations.find(l => l.subTypeStr === 'city' || l.subTypeStr === 'municipality') || locations[0]
    if (!cityLoc?.locationId) return []

    // Step 2: fetch properties
    const propUrl = new URL(`https://${IDEALISTA_HOST}/properties/list`)
    propUrl.searchParams.set('locationId', cityLoc.locationId)
    propUrl.searchParams.set('operation', 'sale')
    propUrl.searchParams.set('country', country)
    propUrl.searchParams.set('numPage', '1')
    propUrl.searchParams.set('maxItems', '12')
    propUrl.searchParams.set('order', 'priceDown')
    propUrl.searchParams.set('locale', 'en')
    if (prefs.bedrooms) propUrl.searchParams.set('minRooms', String(prefs.bedrooms))
    if (prefs.maxPrice) propUrl.searchParams.set('maxPrice', String(prefs.maxPrice))
    if (prefs.minPrice) propUrl.searchParams.set('minPrice', String(prefs.minPrice))

    const propRes = await fetch(propUrl.toString(), {
      headers: { 'X-RapidAPI-Key': RAPIDAPI_KEY, 'X-RapidAPI-Host': IDEALISTA_HOST },
      next: { revalidate: 3600 },
    })
    if (!propRes.ok) return []
    const propData = await propRes.json()
    const items: IdealistaProperty[] = propData?.elementList || []
    return items.slice(0, 12).map(item => normalizeIdealista(item, city, country, prefs))
  } catch (err) {
    console.error('Idealista fetch failed:', err)
    return []
  }
}

function getDemoListings(city: string, prefs: UserPreferences): Listing[] {
  const cityLower = city.toLowerCase()
  const templates = DEMO_TEMPLATES[cityLower] || DEMO_TEMPLATES['default']

  return templates.map((t, i) => {
    const features = (t.features || []) as Listing['features']
    const listing: Listing = {
      id: `demo-${cityLower}-${i}`,
      source: 'Demo',
      sourceUrl: 'https://www.realtor.com',
      address: t.address,
      city,
      state: t.state || '',
      country: t.country || '',
      price: t.price || 0,
      priceDisplay: t.priceDisplay || '',
      listingType: (t.listingType as Listing['listingType']) || 'buy',
      beds: t.beds || 0,
      baths: t.baths || 0,
      sqft: t.sqft || 0,
      photos: t.photos || [],
      features,
      scoutScore: computeScoutScore(features, prefs),
      propertyType: t.propertyType || 'property',
      yearBuilt: t.yearBuilt,
      description: t.description,
    }
    return listing
  })
}

const DEMO_TEMPLATES: Record<string, Partial<Listing>[]> = {
  // ── Bao's Hidden Gems ────────────────────────────────────────────────────
  'da nang': [
    {
      address: '88 Võ Nguyên Giáp, Mỹ Khê Beach',
      price: 2800000000,
      priceDisplay: '₫2.8B (~$112k)',
      listingType: 'buy',
      beds: 2,
      baths: 2,
      sqft: 860,
      propertyType: 'apartment',
      yearBuilt: 2022,
      photos: [
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
        'https://images.unsplash.com/photo-1540541338537-71d037969ae5?w=800&q=80',
      ],
      features: ['ocean_view', 'modern', 'balcony', 'gym', 'pool', 'natural_light'],
      state: 'Da Nang',
      country: 'VN',
      description: "Steps from Mỹ Khê beach — consistently rated Asia's best urban beach. Floor-to-ceiling ocean-view windows, brand-new kitchen, building pool. Rental yields of 8-10% are typical in this corridor.",
    },
    {
      address: 'Sơn Trà Peninsula, An Thượng Area',
      price: 5500000000,
      priceDisplay: '₫5.5B (~$220k)',
      listingType: 'buy',
      beds: 3,
      baths: 2,
      sqft: 1400,
      propertyType: 'villa',
      yearBuilt: 2021,
      photos: [
        'https://images.unsplash.com/photo-1540541338537-71d037969ae5?w=800&q=80',
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
      ],
      features: ['ocean_view', 'mountain_view', 'modern', 'pool', 'balcony', 'parking', 'natural_light'],
      state: 'Da Nang',
      country: 'VN',
      description: "Private villa on the Sơn Trà hillside — panoramic views of Da Nang Bay and the Marble Mountains. Landscaped garden, private pool, and direct access to jungle trails. Exceptionally rare at this price.",
    },
    {
      address: 'Hải Châu District, Da Nang City Center',
      price: 1200000000,
      priceDisplay: '₫1.2B (~$48k)',
      listingType: 'buy',
      beds: 1,
      baths: 1,
      sqft: 480,
      propertyType: 'apartment',
      yearBuilt: 2019,
      photos: [
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
      ],
      features: ['modern', 'natural_light', 'city_view', 'high_floor'],
      state: 'Da Nang',
      country: 'VN',
      description: "Affordable entry into Da Nang's booming market. Central location near Han River with city views, 10 minutes to beach by motorbike. Perfect as a starter home or rental investment.",
    },
  ],
  'nha trang': [
    {
      address: 'Trần Phú Street, Nha Trang Beachfront',
      price: 3200000000,
      priceDisplay: '₫3.2B (~$128k)',
      listingType: 'buy',
      beds: 2,
      baths: 2,
      sqft: 900,
      propertyType: 'apartment',
      yearBuilt: 2020,
      photos: [
        'https://images.unsplash.com/photo-1540541338537-71d037969ae5?w=800&q=80',
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
      ],
      features: ['ocean_view', 'modern', 'balcony', 'pool', 'gym', 'high_floor'],
      state: 'Khánh Hòa',
      country: 'VN',
      description: "Front-row seat to the South China Sea. High-rise apartment with unobstructed ocean views, resort-grade pool, and direct beach access. Strong short-term rental demand from domestic tourists.",
    },
    {
      address: 'Lộc Thọ Ward, Nha Trang',
      price: 1800000000,
      priceDisplay: '₫1.8B (~$72k)',
      listingType: 'buy',
      beds: 2,
      baths: 1,
      sqft: 720,
      propertyType: 'apartment',
      yearBuilt: 2018,
      photos: [
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
      ],
      features: ['modern', 'natural_light', 'balcony', 'parking'],
      state: 'Khánh Hòa',
      country: 'VN',
      description: "Quiet residential neighborhood, 5 minutes walk to the beach and night market. Well-maintained building, Vietnamese ownership allowed. Great for those wanting to live like a local.",
    },
  ],
  'hoi an': [
    {
      address: 'Cẩm Châu Ward, near Hội An Old Town',
      price: 4200000000,
      priceDisplay: '₫4.2B (~$168k)',
      listingType: 'buy',
      beds: 3,
      baths: 2,
      sqft: 1600,
      propertyType: 'house',
      yearBuilt: 2020,
      photos: [
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
        'https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=800&q=80',
      ],
      features: ['natural_light', 'modern', 'balcony', 'pool', 'parking', 'pet_friendly'],
      state: 'Quảng Nam',
      country: 'VN',
      description: "10-minute bicycle ride to Hội An's lantern-lit Old Town. Spacious garden villa with rice paddy views, private pool, and traditional-meets-modern architecture. UNESCO World Heritage living.",
    },
  ],
  'da lat': [
    {
      address: 'Ward 4, Near Xuan Huong Lake, Đà Lạt',
      price: 3800000000,
      priceDisplay: '₫3.8B (~$152k)',
      listingType: 'buy',
      beds: 3,
      baths: 2,
      sqft: 1500,
      propertyType: 'house',
      yearBuilt: 1960,
      photos: [
        'https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=800&q=80',
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
      ],
      features: ['mountain_view', 'historic', 'natural_light', 'balcony', 'parking', 'pet_friendly'],
      state: 'Lâm Đồng',
      country: 'VN',
      description: "Classic French colonial villa near Xuan Huong Lake — the kind of property that defines why Đà Lạt feels like Vietnam's Little Paris. Pine trees, rose gardens, mountain views, cool year-round climate.",
    },
    {
      address: 'Phường 10, Đà Lạt City',
      price: 1600000000,
      priceDisplay: '₫1.6B (~$64k)',
      listingType: 'buy',
      beds: 2,
      baths: 1,
      sqft: 680,
      propertyType: 'apartment',
      yearBuilt: 2021,
      photos: [
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
      ],
      features: ['mountain_view', 'modern', 'natural_light', 'balcony'],
      state: 'Lâm Đồng',
      country: 'VN',
      description: "Modern apartment in Đà Lạt's up-and-coming residential zone. Valley and pine forest views, cool climate year-round (18-24°C), growing digital nomad community. No air conditioning needed — ever.",
    },
  ],
  batumi: [
    {
      address: 'Boulevard Side, Batumi, Adjara',
      price: 115000,
      priceDisplay: '$115,000',
      listingType: 'buy',
      beds: 2,
      baths: 2,
      sqft: 820,
      propertyType: 'apartment',
      yearBuilt: 2022,
      photos: [
        'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&q=80',
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
      ],
      features: ['ocean_view', 'modern', 'balcony', 'gym', 'high_floor', 'natural_light'],
      state: 'Adjara',
      country: 'GE',
      description: "Breathtaking Black Sea views from this newly built tower on Batumi's legendary boulevard. Foreigners can buy freehold property in Georgia — no restrictions. Rental yields of 10-14% for short-term lets.",
    },
    {
      address: 'Batumi Old Town (Apkhazeti St area)',
      price: 65000,
      priceDisplay: '$65,000',
      listingType: 'buy',
      beds: 1,
      baths: 1,
      sqft: 480,
      propertyType: 'apartment',
      yearBuilt: 2019,
      photos: [
        'https://images.unsplash.com/photo-1571056536109-5c7f7e9898c4?w=800&q=80',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
      ],
      features: ['modern', 'natural_light', 'city_view', 'balcony', 'historic'],
      state: 'Adjara',
      country: 'GE',
      description: "Walking distance to Old Town's Art Nouveau architecture, the Batumi Piazza, and the Black Sea boulevard. Compact but smartly designed — perfect pied-à-terre or income-generating rental.",
    },
    {
      address: 'New Boulevard, Batumi Tech Hub Zone',
      price: 175000,
      priceDisplay: '$175,000',
      listingType: 'buy',
      beds: 3,
      baths: 2,
      sqft: 1200,
      propertyType: 'apartment',
      yearBuilt: 2023,
      photos: [
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
        'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&q=80',
      ],
      features: ['ocean_view', 'modern', 'gym', 'pool', 'concierge', 'high_floor', 'balcony', 'parking'],
      state: 'Adjara',
      country: 'GE',
      description: "Flagship development on Batumi's new boulevard — rooftop infinity pool with Caucasus mountain and Black Sea panoramas, full concierge, EV parking. Georgia's most talked-about emerging market.",
    },
  ],
  tbilisi: [
    {
      address: 'Vera District, Tbilisi',
      price: 145000,
      priceDisplay: '$145,000',
      listingType: 'buy',
      beds: 2,
      baths: 1,
      sqft: 980,
      propertyType: 'apartment',
      yearBuilt: 1960,
      photos: [
        'https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?w=800&q=80',
        'https://images.unsplash.com/photo-1571056536109-5c7f7e9898c4?w=800&q=80',
      ],
      features: ['natural_light', 'historic', 'balcony', 'city_view', 'pet_friendly'],
      state: 'Tbilisi',
      country: 'GE',
      description: "Soviet-era apartment with original parquet floors, high ceilings, and a wrought-iron balcony overlooking leafy Vera. Tbilisi's most bohemian neighborhood — galleries, wine bars, and Georgian restaurants at ground level.",
    },
    {
      address: 'Old Tbilisi (Kala), near Narikala Fortress',
      price: 220000,
      priceDisplay: '$220,000',
      listingType: 'buy',
      beds: 3,
      baths: 2,
      sqft: 1400,
      propertyType: 'apartment',
      yearBuilt: 2020,
      photos: [
        'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&q=80',
        'https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?w=800&q=80',
      ],
      features: ['mountain_view', 'city_view', 'modern', 'balcony', 'natural_light', 'historic'],
      state: 'Tbilisi',
      country: 'GE',
      description: "Panoramic views of the Mtkvari River, Narikala Fortress, and the Mother of Georgia statue from this renovated Old Town apartment. Tbilisi's most photogenic neighborhood — sulphur bath district within walking distance.",
    },
  ],
  kotor: [
    {
      address: 'Stari Grad (Old Town), Kotor, Montenegro',
      price: 185000,
      priceDisplay: '€185,000',
      listingType: 'buy',
      beds: 2,
      baths: 1,
      sqft: 750,
      propertyType: 'apartment',
      yearBuilt: 1750,
      photos: [
        'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80',
        'https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?w=800&q=80',
      ],
      features: ['historic', 'natural_light', 'city_view', 'balcony'],
      state: 'Bay of Kotor',
      country: 'ME',
      description: "Inside the medieval UNESCO-listed walled city — cobblestone streets, Venetian architecture, cathedral bells. Stone vaulted ceilings, exposed beams, and a terrace overlooking the ancient square. Property inside the walls rarely comes to market.",
    },
    {
      address: 'Dobrota village, Bay of Kotor',
      price: 340000,
      priceDisplay: '€340,000',
      listingType: 'buy',
      beds: 3,
      baths: 2,
      sqft: 1600,
      propertyType: 'house',
      yearBuilt: 2018,
      photos: [
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
        'https://images.unsplash.com/photo-1540541338537-71d037969ae5?w=800&q=80',
      ],
      features: ['ocean_view', 'mountain_view', 'modern', 'pool', 'balcony', 'parking', 'waterfront'],
      state: 'Bay of Kotor',
      country: 'ME',
      description: "Stone villa directly on the Bay of Kotor — infinity pool merging with the fjord-like bay, mountains rising on all sides. 3km from Kotor's old walls. Montenegro's best natural setting, half the price of Croatia.",
    },
    {
      address: 'Muo village, Kotor Bay',
      price: 142000,
      priceDisplay: '€142,000',
      listingType: 'buy',
      beds: 1,
      baths: 1,
      sqft: 520,
      propertyType: 'apartment',
      yearBuilt: 2015,
      photos: [
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
        'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80',
      ],
      features: ['ocean_view', 'natural_light', 'balcony', 'mountain_view'],
      state: 'Bay of Kotor',
      country: 'ME',
      description: "Peaceful fishing village apartment on the water's edge — bay and St. George Island views from every room. 5-minute water taxi to Kotor's old town. Montenegro allows EU & non-EU freehold purchase.",
    },
  ],
  naples: [
    {
      address: 'Posillipo Hill, Via Posillipo 120, Napoli',
      price: 420000,
      priceDisplay: '€420,000',
      listingType: 'buy',
      beds: 3,
      baths: 2,
      sqft: 1600,
      propertyType: 'apartment',
      yearBuilt: 2018,
      photos: [
        'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80',
        'https://images.unsplash.com/photo-1540541338537-71d037969ae5?w=800&q=80',
      ],
      features: ['ocean_view', 'modern', 'balcony', 'parking', 'natural_light', 'high_floor'],
      state: 'Campania',
      country: 'IT',
      description: "Posillipo — Naples' most prestigious residential hill. Sweeping Gulf of Naples and Vesuvius panoramas from the terrace. Modern finishes, underground parking, and the kind of view that makes every meal feel like an occasion.",
    },
    {
      address: 'Spaccanapoli, Via dei Tribunali area, Napoli Centro',
      price: 195000,
      priceDisplay: '€195,000',
      listingType: 'buy',
      beds: 2,
      baths: 1,
      sqft: 880,
      propertyType: 'apartment',
      yearBuilt: 1880,
      photos: [
        'https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?w=800&q=80',
        'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&q=80',
      ],
      features: ['historic', 'natural_light', 'city_view', 'high_floor'],
      state: 'Campania',
      country: 'IT',
      description: "Inside the UNESCO-listed historic center — the world's oldest continuously inhabited city district. 4-meter ceilings, original terracotta floors, and a balcony over the most chaotic, beautiful street in Italy. Rome's answer is not this good.",
    },
    {
      address: 'Chiaia Seafront, Via Caracciolo, Napoli',
      price: 580000,
      priceDisplay: '€580,000',
      listingType: 'buy',
      beds: 3,
      baths: 2,
      sqft: 1900,
      propertyType: 'apartment',
      yearBuilt: 1920,
      photos: [
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
        'https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?w=800&q=80',
      ],
      features: ['ocean_view', 'historic', 'natural_light', 'balcony', 'concierge', 'high_floor'],
      state: 'Campania',
      country: 'IT',
      description: "Belle Époque building on the celebrated Lungomare promenade — Naples' answer to the Côte d'Azur. Castel dell'Ovo and Vesuvius in direct view. Period details preserved: marble stairs, art nouveau ironwork, coffered ceilings.",
    },
  ],
  palermo: [
    {
      address: 'Kalsa District, Via Alloro, Palermo',
      price: 165000,
      priceDisplay: '€165,000',
      listingType: 'buy',
      beds: 2,
      baths: 1,
      sqft: 900,
      propertyType: 'apartment',
      yearBuilt: 1880,
      photos: [
        'https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?w=800&q=80',
        'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&q=80',
      ],
      features: ['historic', 'natural_light', 'city_view', 'balcony'],
      state: 'Sicily',
      country: 'IT',
      description: "In Palermo's most historically rich quarter — Arab-Norman architecture, the Palazzo Chiaramonte, and the best street food in Sicily one floor below. Original terrazzo floors, 4-meter ceilings, period moldings. Sicily's undervalued answer to Naples.",
    },
    {
      address: 'Mondello Seafront, Via Mondello, Palermo',
      price: 320000,
      priceDisplay: '€320,000',
      listingType: 'buy',
      beds: 3,
      baths: 2,
      sqft: 1400,
      propertyType: 'apartment',
      yearBuilt: 1960,
      photos: [
        'https://images.unsplash.com/photo-1540541338537-71d037969ae5?w=800&q=80',
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
      ],
      features: ['ocean_view', 'natural_light', 'balcony', 'parking', 'waterfront'],
      state: 'Sicily',
      country: 'IT',
      description: "Mondello — the Sicilian riviera that Romans fought over. Seafront apartment with Monte Pellegrino views, private beach access through the building, and Art Nouveau Liberty-style architecture. Palermo's most coveted beach address.",
    },
  ],
  porto: [
    {
      address: 'Ribeira Waterfront, Cais da Ribeira, Porto',
      price: 295000,
      priceDisplay: '€295,000',
      listingType: 'buy',
      beds: 2,
      baths: 1,
      sqft: 900,
      propertyType: 'apartment',
      yearBuilt: 1890,
      photos: [
        'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80',
        'https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?w=800&q=80',
      ],
      features: ['waterfront', 'historic', 'natural_light', 'ocean_view', 'balcony', 'city_view'],
      state: 'Norte',
      country: 'PT',
      description: "UNESCO World Heritage Ribeira district — waking up to Douro River views and the Dom Luís I Bridge. Renovated azulejo tile façade with original stone interior, modern kitchen and bathroom. Europe's most romantic waterfront address at this price point.",
    },
    {
      address: 'Bonfim, Rua de Bonfim, Porto',
      price: 175000,
      priceDisplay: '€175,000',
      listingType: 'buy',
      beds: 2,
      baths: 1,
      sqft: 780,
      propertyType: 'apartment',
      yearBuilt: 2019,
      photos: [
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
        'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800&q=80',
      ],
      features: ['modern', 'natural_light', 'rooftop', 'city_view', 'in_unit_laundry'],
      state: 'Norte',
      country: 'PT',
      description: "Bonfim — Porto's fastest-rising neighborhood where local families and international creatives coexist. Rooftop terrace with city and river views, fully renovated, 15-minute walk to Ribeira. Best value in the city right now.",
    },
    {
      address: 'Foz do Douro, Via Douro, Porto',
      price: 495000,
      priceDisplay: '€495,000',
      listingType: 'buy',
      beds: 3,
      baths: 2,
      sqft: 1500,
      propertyType: 'apartment',
      yearBuilt: 2020,
      photos: [
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
      ],
      features: ['ocean_view', 'modern', 'balcony', 'gym', 'pool', 'parking', 'natural_light', 'waterfront'],
      state: 'Norte',
      country: 'PT',
      description: "Atlantic Ocean meets the Douro River at Foz — Porto's premium residential address. Modern apartment with double ocean/river terrace, heated pool, full fitness suite. 5 minutes' walk to the boardwalk along the Atlantic.",
    },
  ],
  antalya: [
    {
      address: 'Kaleiçi Old Town, Antalya',
      price: 145000,
      priceDisplay: '$145,000',
      listingType: 'buy',
      beds: 2,
      baths: 1,
      sqft: 820,
      propertyType: 'apartment',
      yearBuilt: 2015,
      photos: [
        'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80',
        'https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?w=800&q=80',
      ],
      features: ['historic', 'natural_light', 'ocean_view', 'balcony', 'city_view'],
      state: 'Antalya Province',
      country: 'TR',
      description: "Inside Kaleiçi's Roman-era city walls — Hadrian's Gate is a 5-minute walk. Renovated Ottoman house with original stone arches, private courtyard, and Taurus Mountain views. Foreigners can buy Turkish property freely since 2012.",
    },
    {
      address: 'Lara Beach District, Antalya',
      price: 220000,
      priceDisplay: '$220,000',
      listingType: 'buy',
      beds: 3,
      baths: 2,
      sqft: 1350,
      propertyType: 'apartment',
      yearBuilt: 2021,
      photos: [
        'https://images.unsplash.com/photo-1540541338537-71d037969ae5?w=800&q=80',
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
      ],
      features: ['ocean_view', 'modern', 'gym', 'pool', 'balcony', 'parking', 'concierge'],
      state: 'Antalya Province',
      country: 'TR',
      description: "Resort-grade residential complex on Lara Beach — Turkey's Riviera. Mediterranean views from the balcony, infinity pool, Turkish bath (hammam) in the building, direct beach access. Antalya gets 300+ sunny days annually.",
    },
  ],
  helsinki: [
    {
      address: 'Design District, Punavuori, Helsinki',
      price: 310000,
      priceDisplay: '€310,000',
      listingType: 'buy',
      beds: 2,
      baths: 1,
      sqft: 720,
      propertyType: 'apartment',
      yearBuilt: 1930,
      photos: [
        'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&q=80',
        'https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?w=800&q=80',
      ],
      features: ['natural_light', 'historic', 'balcony', 'city_view', 'in_unit_laundry'],
      state: 'Uusimaa',
      country: 'FI',
      description: "Art Nouveau apartment in Helsinki's creative heartland — Marimekko boutiques, Alvar Aalto architecture, and the city's best coffee culture outside your door. Original hardwood floors, 3.2m ceilings, and a south-facing balcony that's worth everything in Finnish winter.",
    },
    {
      address: 'Kruununhaka, Helsinki Old Town',
      price: 540000,
      priceDisplay: '€540,000',
      listingType: 'buy',
      beds: 3,
      baths: 2,
      sqft: 1200,
      propertyType: 'apartment',
      yearBuilt: 1910,
      photos: [
        'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80',
        'https://images.unsplash.com/photo-1555636222-cae831e670b3?w=800&q=80',
      ],
      features: ['waterfront', 'historic', 'natural_light', 'city_view', 'ocean_view', 'balcony', 'concierge'],
      state: 'Uusimaa',
      country: 'FI',
      description: "Helsinki's most prestigious old district — neoclassical facades, government buildings, Senate Square, and the Baltic Sea at the end of every street. Restored Art Nouveau staircase, Baltic views, and the Market Square at your doorstep.",
    },
  ],
  split: [
    {
      address: "Diocletian's Palace, Split Old Town",
      price: 195000,
      priceDisplay: '€195,000',
      listingType: 'buy',
      beds: 1,
      baths: 1,
      sqft: 540,
      propertyType: 'apartment',
      yearBuilt: 305,
      photos: [
        'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80',
        'https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?w=800&q=80',
      ],
      features: ['historic', 'natural_light', 'city_view', 'ocean_view'],
      state: 'Dalmatia',
      country: 'HR',
      description: "Inside Diocletian's Palace — a living Roman emperor's villa that became a city. Stone walls dating to 305 AD, a rooftop terrace with Adriatic views, and Riva promenade nightlife below. You literally live inside UNESCO heritage.",
    },
    {
      address: 'Meje seafront, Split Residential',
      price: 340000,
      priceDisplay: '€340,000',
      listingType: 'buy',
      beds: 3,
      baths: 2,
      sqft: 1400,
      propertyType: 'apartment',
      yearBuilt: 2019,
      photos: [
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
        'https://images.unsplash.com/photo-1540541338537-71d037969ae5?w=800&q=80',
      ],
      features: ['ocean_view', 'modern', 'balcony', 'pool', 'parking', 'natural_light', 'waterfront'],
      state: 'Dalmatia',
      country: 'HR',
      description: "Meje — Split's most exclusive residential neighborhood. Adriatic Sea views, private pool, 10-minute walk to Bačvice Beach and the old town. Croatia's best value luxury coastal market before the full tourist premium kicks in.",
    },
  ],
  bergen: [
    {
      address: 'Bryggen Wharf, Bergen Sentrum',
      price: 4200000,
      priceDisplay: 'NOK 4,200,000 (~€365k)',
      listingType: 'buy',
      beds: 2,
      baths: 1,
      sqft: 780,
      propertyType: 'apartment',
      yearBuilt: 1700,
      photos: [
        'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80',
        'https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?w=800&q=80',
      ],
      features: ['historic', 'waterfront', 'natural_light', 'ocean_view', 'city_view'],
      state: 'Vestland',
      country: 'NO',
      description: "Bryggen — Bergen's Hanseatic wharf district and one of Norway's most iconic UNESCO sites. Restored timber merchant house with waterfront views, original post-and-beam construction, and Vågeno harbour below. Bergen's most atmospheric address.",
    },
    {
      address: 'Sandviken, Bergen Fjordside',
      price: 5800000,
      priceDisplay: 'NOK 5,800,000 (~€505k)',
      listingType: 'buy',
      beds: 3,
      baths: 2,
      sqft: 1500,
      propertyType: 'house',
      yearBuilt: 2020,
      photos: [
        'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&q=80',
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
      ],
      features: ['mountain_view', 'ocean_view', 'modern', 'balcony', 'parking', 'natural_light', 'waterfront'],
      state: 'Vestland',
      country: 'NO',
      description: "Modern villa perched above Bergen's fjord with dramatic views of Puddefjorden and the Seven Mountains. Private dock, all-day natural light, triple-glazed Norwegian windows. Bergen delivers fjord life with proper city infrastructure.",
    },
  ],
  thessaloniki: [
    {
      address: 'Kalamaria, Thessaloniki Seafront',
      price: 195000,
      priceDisplay: '€195,000',
      listingType: 'buy',
      beds: 2,
      baths: 1,
      sqft: 850,
      propertyType: 'apartment',
      yearBuilt: 2018,
      photos: [
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
        'https://images.unsplash.com/photo-1540541338537-71d037969ae5?w=800&q=80',
      ],
      features: ['ocean_view', 'modern', 'balcony', 'natural_light', 'parking'],
      state: 'Macedonia',
      country: 'GR',
      description: "Kalamaria's seafront — Thermaic Gulf views, Mount Olympus on the horizon on clear days. Modern apartment with full-length balcony, 20 minutes to Thessaloniki's White Tower by waterfront promenade. Greece's most underrated coastal city.",
    },
    {
      address: 'Ano Poli (Upper Town), Thessaloniki',
      price: 145000,
      priceDisplay: '€145,000',
      listingType: 'buy',
      beds: 2,
      baths: 1,
      sqft: 720,
      propertyType: 'apartment',
      yearBuilt: 1950,
      photos: [
        'https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?w=800&q=80',
        'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&q=80',
      ],
      features: ['historic', 'city_view', 'ocean_view', 'natural_light', 'mountain_view'],
      state: 'Macedonia',
      country: 'GR',
      description: "Ano Poli — the Byzantine upper city with Ottoman-era timber houses and the best views in Thessaloniki: city, gulf, and Mount Olympus in one sweep. The neighborhood the Greeks haven't told tourists about yet.",
    },
  ],
  valparaiso: [
    {
      address: 'Cerro Alegre, Valparaíso, Chile',
      price: 145000,
      priceDisplay: '$145,000',
      listingType: 'buy',
      beds: 2,
      baths: 1,
      sqft: 860,
      propertyType: 'apartment',
      yearBuilt: 1920,
      photos: [
        'https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?w=800&q=80',
        'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&q=80',
      ],
      features: ['ocean_view', 'historic', 'natural_light', 'balcony', 'city_view'],
      state: 'Valparaíso Region',
      country: 'CL',
      description: "Cerro Alegre — Valparaíso's most storied hilltop. Neo-classical house with Pacific Ocean views, original wooden staircase, and murals covering every surface in the street below. The city that inspired Pablo Neruda. UNESCO World Heritage.",
    },
    {
      address: 'Cerro Concepción, Valparaíso',
      price: 185000,
      priceDisplay: '$185,000',
      listingType: 'buy',
      beds: 3,
      baths: 2,
      sqft: 1300,
      propertyType: 'house',
      yearBuilt: 1910,
      photos: [
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
        'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&q=80',
      ],
      features: ['ocean_view', 'historic', 'balcony', 'natural_light', 'mountain_view', 'city_view'],
      state: 'Valparaíso Region',
      country: 'CL',
      description: "Victorian-era merchant's house on Cerro Concepción with 270° Pacific views. Original imported tiles from Germany, a wraparound veranda, and one of Valparaíso's famous funicular rides (ascensores) steps away. South America's most dramatic coastal city.",
    },
  ],
  ohrid: [
    {
      address: 'Old Town, Ohrid, North Macedonia',
      price: 92000,
      priceDisplay: '€92,000',
      listingType: 'buy',
      beds: 2,
      baths: 1,
      sqft: 620,
      propertyType: 'apartment',
      yearBuilt: 1890,
      photos: [
        'https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?w=800&q=80',
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
      ],
      features: ['waterfront', 'ocean_view', 'historic', 'natural_light', 'balcony'],
      state: 'Ohrid Municipality',
      country: 'MK',
      description: "Steps from Lake Ohrid — described by UNESCO as the 'European Jerusalem.' Traditional Macedonian house with a lakeside terrace view of St. John's church and the ancient city walls. One of Europe's most beautiful lake towns at a fraction of Croatian prices.",
    },
  ],
  tirana: [
    {
      address: 'Blloku District, Tirana',
      price: 115000,
      priceDisplay: '€115,000',
      listingType: 'buy',
      beds: 2,
      baths: 1,
      sqft: 680,
      propertyType: 'apartment',
      yearBuilt: 2019,
      photos: [
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
      ],
      features: ['modern', 'natural_light', 'city_view', 'balcony', 'parking'],
      state: 'Tirana County',
      country: 'AL',
      description: "Blloku — Tirana's trendiest neighborhood, once reserved for Communist Party elite and now the city's beating heart. Rooftop bars, boutique cafés, and art galleries have replaced the old propaganda. Albania joined NATO in 2009 and EU candidacy is advancing rapidly.",
    },
  ],
  // ── Major Cities ─────────────────────────────────────────────────────────
  miami: [
    {
      address: '1000 Brickell Ave, Unit 3201',
      price: 1850000,
      priceDisplay: '$1,850,000',
      listingType: 'buy',
      beds: 2,
      baths: 2,
      sqft: 1420,
      propertyType: 'condo',
      yearBuilt: 2019,
      photos: [
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
      ],
      features: ['ocean_view', 'modern', 'gym', 'pool', 'concierge', 'high_floor', 'balcony'],
      state: 'FL',
      country: 'US',
      description: 'Stunning bay views from this ultra-modern Brickell high-rise. Floor-to-ceiling glass, European kitchen, spa bath. Building amenities include rooftop pool, fitness center, and concierge.',
    },
    {
      address: '300 Collins Ave, Unit 802',
      price: 975000,
      priceDisplay: '$975,000',
      listingType: 'buy',
      beds: 1,
      baths: 1,
      sqft: 780,
      propertyType: 'condo',
      yearBuilt: 2015,
      photos: [
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
        'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=800&q=80',
      ],
      features: ['ocean_view', 'modern', 'balcony', 'natural_light', 'pet_friendly'],
      state: 'FL',
      country: 'US',
      description: 'One block from South Beach. This sleek studio with partial ocean views is a Miami Beach classic. Bright interiors, updated kitchen, and building pool access.',
    },
    {
      address: '2900 NE 7th Ave, Unit 2105',
      price: 620000,
      priceDisplay: '$620,000',
      listingType: 'buy',
      beds: 2,
      baths: 2,
      sqft: 1100,
      propertyType: 'condo',
      yearBuilt: 2020,
      photos: [
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
      ],
      features: ['city_view', 'modern', 'gym', 'rooftop', 'high_floor', 'in_unit_laundry'],
      state: 'FL',
      country: 'US',
      description: 'Edgewater gem with sparkling city and bay views. Rooftop pool and lounge, state-of-the-art gym, Italian kitchen. Walking distance to Wynwood.',
    },
  ],
  tokyo: [
    {
      address: '2-7-1 Roppongi, Minato-ku',
      price: 145000000,
      priceDisplay: '¥145,000,000',
      listingType: 'buy',
      beds: 2,
      baths: 1,
      sqft: 850,
      propertyType: 'apartment',
      yearBuilt: 2021,
      photos: [
        'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80',
        'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=800&q=80',
      ],
      features: ['city_view', 'modern', 'gym', 'concierge', 'high_floor', 'natural_light'],
      state: 'Tokyo',
      country: 'JP',
      description: 'Sophisticated Roppongi tower apartment with panoramic Tokyo Tower views. Smart home system, designer finishes, and full concierge service. Moments from the finest dining and galleries.',
    },
    {
      address: '1-2-3 Shimokitazawa, Setagaya-ku',
      price: 72000000,
      priceDisplay: '¥72,000,000',
      listingType: 'buy',
      beds: 3,
      baths: 1,
      sqft: 1100,
      propertyType: 'house',
      yearBuilt: 2018,
      photos: [
        'https://images.unsplash.com/photo-1571566882372-1598d88abd90?w=800&q=80',
        'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800&q=80',
      ],
      features: ['natural_light', 'balcony', 'modern', 'pet_friendly', 'in_unit_laundry'],
      state: 'Tokyo',
      country: 'JP',
      description: 'Charming machiya-inspired modern home in the beloved Shimokitazawa neighborhood. Lush private garden, tatami-inspired master suite, and soaring ceilings. Tokyo\'s hippest village awaits.',
    },
    {
      address: '4-1-8 Minami-Azabu, Minato-ku',
      price: 98000000,
      priceDisplay: '¥98,000,000',
      listingType: 'buy',
      beds: 2,
      baths: 2,
      sqft: 950,
      propertyType: 'apartment',
      yearBuilt: 2022,
      photos: [
        'https://images.unsplash.com/photo-1601455763557-db1bea8a9a5a?w=800&q=80',
        'https://images.unsplash.com/photo-1555636222-cae831e670b3?w=800&q=80',
      ],
      features: ['modern', 'gym', 'concierge', 'rooftop', 'city_view', 'high_floor'],
      state: 'Tokyo',
      country: 'JP',
      description: 'Prestige address in Azabu — Tokyo\'s most coveted residential enclave. Walking distance to French Embassy quarter, top restaurants, and the Imperial Palace gardens.',
    },
  ],
  barcelona: [
    {
      address: 'Carrer de Provença 185, Eixample',
      price: 875000,
      priceDisplay: '€875,000',
      listingType: 'buy',
      beds: 3,
      baths: 2,
      sqft: 1400,
      propertyType: 'apartment',
      yearBuilt: 1905,
      photos: [
        'https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?w=800&q=80',
        'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&q=80',
      ],
      features: ['natural_light', 'historic', 'balcony', 'city_view', 'in_unit_laundry'],
      state: 'Catalonia',
      country: 'ES',
      description: 'Classic Modernista apartment with original Gaudí-era details — ornate ceiling moldings, herringbone parquet floors, and a dreamy interior courtyard. Steps from Passeig de Gràcia.',
    },
    {
      address: 'Carrer de la Marina 55, Born',
      price: 650000,
      priceDisplay: '€650,000',
      listingType: 'buy',
      beds: 2,
      baths: 1,
      sqft: 900,
      propertyType: 'apartment',
      yearBuilt: 2019,
      photos: [
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
        'https://images.unsplash.com/photo-1556912998-c57cc6b63cd7?w=800&q=80',
      ],
      features: ['modern', 'rooftop', 'natural_light', 'city_view', 'balcony'],
      state: 'Catalonia',
      country: 'ES',
      description: 'Sleek loft conversion in the heart of El Born. Polished concrete floors, architect kitchen, and a private rooftop terrace with views of Santa Maria del Mar. Bohemian chic at its finest.',
    },
    {
      address: 'Avinguda del Tibidabo 8, Sarrià',
      price: 1250000,
      priceDisplay: '€1,250,000',
      listingType: 'buy',
      beds: 4,
      baths: 3,
      sqft: 2200,
      propertyType: 'house',
      yearBuilt: 1965,
      photos: [
        'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
      ],
      features: ['mountain_view', 'city_view', 'balcony', 'pool', 'parking', 'pet_friendly', 'natural_light'],
      state: 'Catalonia',
      country: 'ES',
      description: 'Palatial villa climbing the slopes of Tibidabo with all-day Montserrat mountain views and a shimmering Mediterranean panorama. Lush private garden, heated pool, and double garage.',
    },
  ],
  paris: [
    {
      address: '14 Rue de Rivoli, 4e Arrondissement',
      price: 1100000,
      priceDisplay: '€1,100,000',
      listingType: 'buy',
      beds: 2,
      baths: 1,
      sqft: 980,
      propertyType: 'apartment',
      yearBuilt: 1880,
      photos: [
        'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80',
        'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&q=80',
      ],
      features: ['natural_light', 'historic', 'city_view', 'balcony'],
      state: 'Île-de-France',
      country: 'FR',
      description: 'Haussmannien masterpiece with direct views of the Seine and Notre-Dame. Original herringbone parquet, marble fireplaces, and 10-foot ornate ceilings. Paris doesn\'t get more timeless than this.',
    },
    {
      address: '8 Rue du Faubourg Saint-Antoine, 11e',
      price: 680000,
      priceDisplay: '€680,000',
      listingType: 'buy',
      beds: 3,
      baths: 2,
      sqft: 1300,
      propertyType: 'apartment',
      yearBuilt: 2017,
      photos: [
        'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80',
        'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800&q=80',
      ],
      features: ['modern', 'natural_light', 'in_unit_laundry', 'rooftop', 'city_view'],
      state: 'Île-de-France',
      country: 'FR',
      description: 'Architect-designed loft in le Marais. Exposed stone walls meet Bulthaup kitchen perfection. A rooftop terrace with Eiffel glimpses makes this the ultimate Parisian pied-à-terre.',
    },
  ],
  sydney: [
    {
      address: '88 Alfred Street South, Milsons Point',
      price: 2200000,
      priceDisplay: 'A$2,200,000',
      listingType: 'buy',
      beds: 2,
      baths: 2,
      sqft: 1200,
      propertyType: 'apartment',
      yearBuilt: 2018,
      photos: [
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
      ],
      features: ['ocean_view', 'modern', 'gym', 'pool', 'concierge', 'high_floor', 'balcony', 'natural_light'],
      state: 'NSW',
      country: 'AU',
      description: 'Legendary Sydney Harbour and Opera House views from this luxurious Milsons Point tower. Wake up to sails and bridge every morning. Resort-style amenities and impeccable finishes throughout.',
    },
    {
      address: '12 Marine Parade, Bondi Beach',
      price: 3500000,
      priceDisplay: 'A$3,500,000',
      listingType: 'buy',
      beds: 3,
      baths: 2,
      sqft: 1800,
      propertyType: 'house',
      yearBuilt: 2020,
      photos: [
        'https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=800&q=80',
        'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80',
      ],
      features: ['ocean_view', 'modern', 'rooftop', 'natural_light', 'balcony', 'pet_friendly'],
      state: 'NSW',
      country: 'AU',
      description: 'Iconic Bondi Beach house with unobstructed Pacific Ocean views. Designed for the indoor-outdoor Sydney lifestyle — bi-fold doors open to an al fresco terrace steps from the sand.',
    },
  ],
  'new york': [
    {
      address: '432 Park Avenue, Unit 46A',
      price: 8500000,
      priceDisplay: '$8,500,000',
      listingType: 'buy',
      beds: 3,
      baths: 3.5,
      sqft: 2400,
      propertyType: 'condo',
      yearBuilt: 2015,
      photos: [
        'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800&q=80',
        'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&q=80',
      ],
      features: ['city_view', 'modern', 'gym', 'concierge', 'high_floor', 'natural_light', 'storage'],
      state: 'NY',
      country: 'US',
      description: 'Soaring above Midtown on the 46th floor of one of Manhattan\'s most prestigious addresses. 10-foot ceilings, Central Park and Hudson River views, and white-glove services define this trophy apartment.',
    },
    {
      address: '200 Water Street, Unit 8B, DUMBO',
      price: 2200000,
      priceDisplay: '$2,200,000',
      listingType: 'buy',
      beds: 2,
      baths: 2,
      sqft: 1600,
      propertyType: 'loft',
      yearBuilt: 2016,
      photos: [
        'https://images.unsplash.com/photo-1449844908441-8829872d2607?w=800&q=80',
        'https://images.unsplash.com/photo-1555636222-cae831e670b3?w=800&q=80',
      ],
      features: ['city_view', 'ocean_view', 'modern', 'gym', 'rooftop', 'natural_light', 'in_unit_laundry'],
      state: 'NY',
      country: 'US',
      description: 'Dramatic Brooklyn Bridge and Manhattan skyline loft in coveted DUMBO. 12-foot ceilings, industrial-chic finishes, and a building rooftop with 360° views. The creative class\'s dream home.',
    },
    {
      address: '88 Morningside Drive, Unit 3D, Harlem',
      price: 895000,
      priceDisplay: '$895,000',
      listingType: 'buy',
      beds: 2,
      baths: 1,
      sqft: 1050,
      propertyType: 'apartment',
      yearBuilt: 1924,
      photos: [
        'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&q=80',
        'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800&q=80',
      ],
      features: ['historic', 'natural_light', 'city_view', 'pet_friendly'],
      state: 'NY',
      country: 'US',
      description: 'Pre-war gem overlooking Morningside Park. Original millwork, beamed ceilings, and a wood-burning fireplace. Steps from Columbia University and Harlem\'s legendary jazz scene.',
    },
  ],
  default: [
    {
      address: '100 Grand Avenue, Downtown',
      price: 750000,
      priceDisplay: '$750,000',
      listingType: 'buy',
      beds: 2,
      baths: 2,
      sqft: 1100,
      propertyType: 'condo',
      yearBuilt: 2020,
      photos: [
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
      ],
      features: ['modern', 'natural_light', 'gym', 'city_view', 'high_floor'],
      state: '',
      country: '',
      description: 'Contemporary downtown condo with floor-to-ceiling windows and sweeping city views. Chef\'s kitchen, spa bath, and building amenities include a rooftop deck and state-of-the-art fitness center.',
    },
    {
      address: '55 Waterfront Drive, Unit 12A',
      price: 1250000,
      priceDisplay: '$1,250,000',
      listingType: 'buy',
      beds: 3,
      baths: 2,
      sqft: 1800,
      propertyType: 'condo',
      yearBuilt: 2018,
      photos: [
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
      ],
      features: ['ocean_view', 'waterfront', 'modern', 'balcony', 'gym', 'pool', 'concierge'],
      state: '',
      country: '',
      description: 'Spectacular waterfront residence with panoramic water views from every room. Private balcony, designer finishes throughout, and resort-style amenities in one of the city\'s most sought-after buildings.',
    },
    {
      address: '320 Heritage Lane, Old Town',
      price: 520000,
      priceDisplay: '$520,000',
      listingType: 'buy',
      beds: 2,
      baths: 1,
      sqft: 950,
      propertyType: 'apartment',
      yearBuilt: 1930,
      photos: [
        'https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?w=800&q=80',
        'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&q=80',
      ],
      features: ['historic', 'natural_light', 'balcony', 'pet_friendly', 'in_unit_laundry'],
      state: '',
      country: '',
      description: 'Lovingly restored heritage apartment in the historic quarter. Original hardwood floors, exposed brick, and a private wrought-iron balcony overlooking the cobblestone streets below.',
    },
  ],
}
