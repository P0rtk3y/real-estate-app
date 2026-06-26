export interface Listing {
  id: string
  source: 'Realtor.com' | 'Idealista' | 'Demo'
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

  // Display
  currency: string

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
  currency: 'USD',
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

// Verified local real-estate portals per country/city
export interface CityPortal {
  name: string
  url: string
  flag: string
  description: string
}

export const CITY_PORTALS: Record<string, CityPortal[]> = {
  // Vietnam
  'da nang':    [{ name: 'BatDongSan', url: 'https://batdongsan.com.vn/ban-nha-dat-da-nang', flag: '🇻🇳', description: "Vietnam's largest property marketplace" }, { name: 'Nha.vn', url: 'https://nha.vn/mua-ban/da-nang', flag: '🇻🇳', description: 'Verified listings across Vietnam' }],
  'nha trang':  [{ name: 'BatDongSan', url: 'https://batdongsan.com.vn/ban-nha-dat-khanh-hoa', flag: '🇻🇳', description: "Vietnam's largest property marketplace" }, { name: 'Nha.vn', url: 'https://nha.vn/mua-ban/khanh-hoa', flag: '🇻🇳', description: 'Verified listings across Vietnam' }],
  'da lat':     [{ name: 'BatDongSan', url: 'https://batdongsan.com.vn/ban-nha-dat-lam-dong', flag: '🇻🇳', description: "Vietnam's largest property marketplace" }, { name: 'Nha.vn', url: 'https://nha.vn/mua-ban/lam-dong', flag: '🇻🇳', description: 'Verified listings across Vietnam' }],
  'hoi an':     [{ name: 'BatDongSan', url: 'https://batdongsan.com.vn/ban-nha-dat-quang-nam', flag: '🇻🇳', description: "Vietnam's largest property marketplace" }, { name: 'Nha.vn', url: 'https://nha.vn/mua-ban/quang-nam', flag: '🇻🇳', description: 'Verified listings across Vietnam' }],
  // Georgia
  'batumi':     [{ name: 'MyHome.ge', url: 'https://www.myhome.ge/en/s/Batumi', flag: '🇬🇪', description: "Georgia's most trusted property portal" }, { name: 'SS.ge', url: 'https://ss.ge/en/real-estate?city=batumi', flag: '🇬🇪', description: 'Major Georgian classifieds' }],
  'tbilisi':    [{ name: 'MyHome.ge', url: 'https://www.myhome.ge/en/s/Tbilisi', flag: '🇬🇪', description: "Georgia's most trusted property portal" }, { name: 'SS.ge', url: 'https://ss.ge/en/real-estate?city=tbilisi', flag: '🇬🇪', description: 'Major Georgian classifieds' }],
  // Montenegro
  'kotor':      [{ name: 'Montenegro Real Estate', url: 'https://www.montenegrorealty.com/buy/', flag: '🇲🇪', description: 'Specialised Montenegro property' }, { name: 'Advertproperty', url: 'https://www.advertproperty.com/property-for-sale/montenegro/', flag: '🇲🇪', description: 'International listings in Montenegro' }],
  // Italy
  'naples':     [{ name: 'Immobiliare.it', url: 'https://www.immobiliare.it/vendita-case/napoli/', flag: '🇮🇹', description: "Italy's #1 property portal" }, { name: 'Idealista', url: 'https://www.idealista.it/vendita-immobili/napoli-citta/', flag: '🇮🇹', description: 'Major European property search' }],
  'palermo':    [{ name: 'Immobiliare.it', url: 'https://www.immobiliare.it/vendita-case/palermo/', flag: '🇮🇹', description: "Italy's #1 property portal" }, { name: 'Idealista', url: 'https://www.idealista.it/vendita-immobili/palermo-citta/', flag: '🇮🇹', description: 'Major European property search' }],
  // Finland
  'helsinki':   [{ name: 'Oikotie', url: 'https://asunnot.oikotie.fi/myytavat-asunnot?locations=Helsinki', flag: '🇫🇮', description: "Finland's leading homes portal" }, { name: 'Etuovi', url: 'https://www.etuovi.com/myytavat-asunnot/helsinki/', flag: '🇫🇮', description: 'Finnish real estate listings' }],
  // Croatia
  'split':      [{ name: 'Njuskalo', url: 'https://www.njuskalo.hr/nekretnine-prodaja?grad=split', flag: '🇭🇷', description: "Croatia's largest classifieds" }, { name: 'Crozilla', url: 'https://www.crozilla.com/for-sale/split/', flag: '🇭🇷', description: 'Croatian property search' }],
  // Slovenia
  'bled':       [{ name: 'Nepremicnine.net', url: 'https://www.nepremicnine.net/oglasi-prodaja/gorenjska/', flag: '🇸🇮', description: "Slovenia's #1 property portal" }],
  'ljubljana':  [{ name: 'Nepremicnine.net', url: 'https://www.nepremicnine.net/oglasi-prodaja/ljubljana/', flag: '🇸🇮', description: "Slovenia's #1 property portal" }],
  // Portugal
  'porto':      [{ name: 'Idealista', url: 'https://www.idealista.pt/comprar-casas/porto/', flag: '🇵🇹', description: 'Major European property portal' }, { name: 'Imovirtual', url: 'https://www.imovirtual.com/comprar/apartamento/porto/', flag: '🇵🇹', description: 'Portugal property marketplace' }],
  // Turkey
  'antalya':    [{ name: 'Sahibinden', url: 'https://www.sahibinden.com/satilik-daire/antalya', flag: '🇹🇷', description: "Turkey's largest classifieds" }, { name: 'Hepsiemlak', url: 'https://www.hepsiemlak.com/antalya-satilik', flag: '🇹🇷', description: 'Major Turkish property portal' }],
  // Greece
  'thessaloniki': [{ name: 'Spitogatos', url: 'https://www.spitogatos.gr/en/buy/apartments/thessaloniki/', flag: '🇬🇷', description: "Greece's top property portal" }, { name: 'XE.gr', url: 'https://www.xe.gr/property/results?transaction_name=buy&item_type=re_residence&geo_place_ids%5B%5D=10&price_to=&price_from=&area_from=&area_to=', flag: '🇬🇷', description: 'Greek real estate search' }],
  // North Macedonia
  'ohrid':      [{ name: 'Pazar3', url: 'https://www.pazar3.mk/en/real-estate/', flag: '🇲🇰', description: 'North Macedonia classifieds' }],
  // Albania
  'tirana':     [{ name: 'MerrJep', url: 'https://www.merrjep.al/pasuri-te-paluajtshme', flag: '🇦🇱', description: "Albania's leading classifieds" }, { name: 'Remax Albania', url: 'https://www.remax.al/buy-property/', flag: '🇦🇱', description: 'International agent network' }],
  // Chile
  'valparaiso': [{ name: 'Portal Inmobiliario', url: 'https://www.portalinmobiliario.com/venta/departamento/valparaiso/', flag: '🇨🇱', description: "Chile's #1 property portal" }, { name: 'Yapo', url: 'https://www.yapo.cl/valparaiso/inmuebles', flag: '🇨🇱', description: 'Major Chilean classifieds' }],
  // Norway
  'bergen':     [{ name: 'Finn.no', url: 'https://www.finn.no/realestate/homes/search.html?q=Bergen', flag: '🇳🇴', description: "Norway's dominant listings platform" }],
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
