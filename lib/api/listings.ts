import { Listing, UserPreferences } from '@/lib/types'

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || ''
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST || 'realtor-com4.p.rapidapi.com'

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
  if (!RAPIDAPI_KEY) {
    return getDemoListings(city, prefs)
  }

  try {
    const url = new URL(`https://${RAPIDAPI_HOST}/properties/search-buy`)
    url.searchParams.set('city', city)
    url.searchParams.set('limit', '12')
    if (prefs.bedrooms) url.searchParams.set('beds_min', String(prefs.bedrooms))
    if (prefs.maxPrice) url.searchParams.set('price_max', String(prefs.maxPrice))
    if (prefs.minPrice) url.searchParams.set('price_min', String(prefs.minPrice))

    const res = await fetch(url.toString(), {
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': RAPIDAPI_HOST,
      },
      next: { revalidate: 3600 },
    })

    if (!res.ok) throw new Error(`Realtor API error: ${res.status}`)
    const data = await res.json()
    const items: RealtorListing[] = data?.data?.results || data?.results || []
    return items.slice(0, 12).map(item => normalizeRealtor(item, city, prefs))
  } catch (err) {
    console.error('Listings fetch failed, using demo data:', err)
    return getDemoListings(city, prefs)
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
