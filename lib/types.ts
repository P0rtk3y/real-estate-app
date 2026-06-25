export interface Listing {
  id: string
  source: 'Realtor.com' | 'Demo'
  sourceUrl: string
  address: string | undefined
  city: string
  state: string
  country: string
  price: number
  priceDisplay: string
  listingType: 'rent' | 'buy'
  beds: number
  baths: number
  sqft: number
  photos: string[]
  lat?: number
  lng?: number
  features: ListingFeature[]
  scoutScore?: number
  propertyType: string
  yearBuilt?: number
  description?: string
  floor?: number
  totalFloors?: number
}

export type ListingFeature =
  | 'natural_light'
  | 'high_floor'
  | 'ocean_view'
  | 'city_view'
  | 'mountain_view'
  | 'modern'
  | 'historic'
  | 'balcony'
  | 'rooftop'
  | 'gym'
  | 'pool'
  | 'concierge'
  | 'pet_friendly'
  | 'parking'
  | 'storage'
  | 'in_unit_laundry'
  | 'waterfront'

export interface WeatherData {
  city: string
  temp_c: number
  temp_f: number
  feels_like_c: number
  feels_like_f: number
  description: string
  icon: string
  humidity: number
  wind_kph: number
  uv_index: number
  forecast: WeatherDay[]
}

export interface WeatherDay {
  date: string
  high_c: number
  high_f: number
  low_c: number
  low_f: number
  description: string
  icon: string
}

export interface Event {
  id: string
  name: string
  date: string
  time: string
  venue: string
  category: string
  url: string
  imageUrl?: string
  priceRange?: string
}

export interface Restaurant {
  id: string
  name: string
  cuisine: string
  rating: number
  reviewCount: number
  priceLevel: string
  address: string
  imageUrl?: string
  url: string
  phone?: string
}

export interface CityPhoto {
  id: string
  url: string
  thumb: string
  alt: string
  credit: string
  creditUrl: string
}

export interface ScoutInsight {
  culturalFlavor: string
  tips: string[]
  bestNeighborhoods: string[]
  verdict: string
  emoji: string
  localFood: string
  weatherNote: string
}

export interface UserPreferences {
  // Property features
  naturalLight: boolean
  highFloor: boolean
  minFloor?: number
  oceanView: boolean
  cityView: boolean
  mountainView: boolean
  modern: boolean
  historic: boolean
  balcony: boolean
  rooftop: boolean
  gym: boolean
  pool: boolean
  concierge: boolean
  petFriendly: boolean
  parking: boolean
  storage: boolean
  inUnitLaundry: boolean

  // Listing basics
  bedrooms: number
  bathrooms: number
  minPrice?: number
  maxPrice?: number
  minSqft?: number
  propertyTypes: string[]
  listingType: 'rent' | 'buy' | 'both'

  // Lifestyle
  walkability: boolean
  transitAccess: boolean
  bikeFriendly: boolean
  nearRestaurants: boolean
  nearParks: boolean
  nearSchools: boolean
  quietNeighborhood: boolean
  upAndComing: boolean

  // Email for alerts
  email?: string
}

export interface Alert {
  id: number
  city: string
  country?: string
  preferences: UserPreferences
  frequency: 'daily' | 'weekly' | 'monthly'
  dayOfWeek?: number
  dayOfMonth?: number
  timeOfDay: 'morning' | 'midday' | 'evening'
  notificationMethod: 'email' | 'inapp' | 'both'
  isActive: boolean
  lastScouted?: string
  createdAt: string
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  naturalLight: false,
  highFloor: false,
  minFloor: undefined,
  oceanView: false,
  cityView: false,
  mountainView: false,
  modern: false,
  historic: false,
  balcony: false,
  rooftop: false,
  gym: false,
  pool: false,
  concierge: false,
  petFriendly: false,
  parking: false,
  storage: false,
  inUnitLaundry: false,
  bedrooms: 1,
  bathrooms: 1,
  minPrice: undefined,
  maxPrice: undefined,
  minSqft: undefined,
  propertyTypes: [],
  listingType: 'both',
  walkability: false,
  transitAccess: false,
  bikeFriendly: false,
  nearRestaurants: false,
  nearParks: false,
  nearSchools: false,
  quietNeighborhood: false,
  upAndComing: false,
}

export const FEATURE_LABELS: Record<ListingFeature, { label: string; emoji: string }> = {
  natural_light: { label: 'Natural Light', emoji: '☀️' },
  high_floor: { label: 'High Floor', emoji: '🏙️' },
  ocean_view: { label: 'Ocean View', emoji: '🌊' },
  city_view: { label: 'City View', emoji: '🌃' },
  mountain_view: { label: 'Mountain View', emoji: '⛰️' },
  modern: { label: 'Modern', emoji: '✨' },
  historic: { label: 'Historic', emoji: '🏛️' },
  balcony: { label: 'Balcony', emoji: '🌿' },
  rooftop: { label: 'Rooftop', emoji: '🏗️' },
  gym: { label: 'Gym', emoji: '🏋️' },
  pool: { label: 'Pool', emoji: '🏊' },
  concierge: { label: 'Concierge', emoji: '🛎️' },
  pet_friendly: { label: 'Pet Friendly', emoji: '🐾' },
  parking: { label: 'Parking', emoji: '🚗' },
  storage: { label: 'Storage', emoji: '📦' },
  in_unit_laundry: { label: 'In-Unit Laundry', emoji: '🫧' },
  waterfront: { label: 'Waterfront', emoji: '⚓' },
}

export const CITY_EMOJIS: Record<string, string> = {
  // Bao's hidden gems
  'da nang': '🌊',
  batumi: '⛰️',
  kotor: '⛵',
  naples: '🌋',
  split: '🏖️',
  bled: '🏞️',
  tbilisi: '🍷',
  'nha trang': '🌴',
  porto: '🛵',
  antalya: '🐚',
  'da lat': '🌲',
  palermo: '🍋',
  thessaloniki: '🏛️',
  ohrid: '🦢',
  tirana: '🏔️',
  valparaiso: '🎨',
  bergen: '🗻',
  ljubljana: '🐉',
  'hoi an': '🏮',
  helsinki: '❄️',
  athens: '🏛️',
  florence: '🎭',
  santorini: '🏖️',
  milan: '👗',
  tokyo: '🗼',
  barcelona: '🎨',
  paris: '🥐',
  sydney: '🦘',
  london: '☂️',
  rome: '🍕',
  amsterdam: '🚲',
  dubai: '🏙️',
  singapore: '🦁',
  'los angeles': '🌅',
  chicago: '🌬️',
  berlin: '🎵',
  lisbon: '🛵',
  mexico: '🌮',
  istanbul: '🕌',
  bangkok: '🐘',
  seoul: '🎎',
  toronto: '🍁',
  default: '🔍',
}
