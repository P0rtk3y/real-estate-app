import { Restaurant } from '@/lib/types'

const YELP_KEY = process.env.YELP_API_KEY || ''
const FSQ_KEY = process.env.FOURSQUARE_API_KEY || ''

export async function fetchFood(city: string): Promise<Restaurant[]> {
  // Yelp is strongest for US/AU/UK
  if (YELP_KEY) {
    const results = await fetchYelp(city)
    if (results.length >= 3) return results
  }

  // Foursquare has stronger coverage in Asia, Eastern Europe, MENA
  if (FSQ_KEY) {
    const results = await fetchFoursquare(city)
    if (results.length > 0) return results
  }

  return getDemoFood(city)
}

// ── Yelp ────────────────────────────────────────────────────────────────────

interface YelpBusiness {
  id: string
  name: string
  rating: number
  review_count: number
  price?: string
  image_url?: string
  url: string
  display_phone?: string
  categories?: Array<{ title: string }>
  location?: { display_address?: string[] }
}

async function fetchYelp(city: string): Promise<Restaurant[]> {
  try {
    const url = new URL('https://api.yelp.com/v3/businesses/search')
    url.searchParams.set('location', city)
    url.searchParams.set('categories', 'restaurants')
    url.searchParams.set('sort_by', 'rating')
    url.searchParams.set('limit', '6')

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${YELP_KEY}` },
      next: { revalidate: 86400 },
    })
    if (!res.ok) return []
    const data = await res.json()
    const businesses: YelpBusiness[] = data?.businesses || []
    return businesses.slice(0, 6).map(b => ({
      id: b.id,
      name: b.name,
      cuisine: b.categories?.[0]?.title || 'Restaurant',
      rating: b.rating,
      reviewCount: b.review_count,
      priceLevel: b.price || '$$',
      address: b.location?.display_address?.join(', ') || '',
      imageUrl: b.image_url,
      url: b.url,
      phone: b.display_phone,
    }))
  } catch {
    return []
  }
}

// ── Foursquare v3 ────────────────────────────────────────────────────────────

interface FoursquarePlace {
  fsq_id: string
  name: string
  categories?: Array<{ name: string }>
  rating?: number
  stats?: { total_ratings?: number }
  price?: number
  location?: { formatted_address?: string }
  photos?: Array<{ prefix: string; suffix: string }>
  website?: string
}

const FSQ_PRICE: Record<number, string> = { 1: '$', 2: '$$', 3: '$$$', 4: '$$$$' }

async function fetchFoursquare(city: string): Promise<Restaurant[]> {
  try {
    const url = new URL('https://api.foursquare.com/v3/places/search')
    url.searchParams.set('near', city)
    url.searchParams.set('categories', '13065') // Food & Drink
    url.searchParams.set('sort', 'RATING')
    url.searchParams.set('limit', '6')
    url.searchParams.set('fields', 'fsq_id,name,categories,rating,stats,price,location,photos,website')

    const res = await fetch(url.toString(), {
      headers: { Authorization: FSQ_KEY },
      next: { revalidate: 86400 },
    })
    if (!res.ok) return []
    const data = await res.json()
    const places: FoursquarePlace[] = data?.results || []
    return places.slice(0, 6).map(p => {
      const photo = p.photos?.[0]
      return {
        id: p.fsq_id,
        name: p.name,
        cuisine: p.categories?.[0]?.name || 'Restaurant',
        rating: p.rating ? Math.round((p.rating / 2) * 10) / 10 : 4.0, // 0-10 → 0-5
        reviewCount: p.stats?.total_ratings || 0,
        priceLevel: FSQ_PRICE[p.price || 2] || '$$',
        address: p.location?.formatted_address || '',
        imageUrl: photo ? `${photo.prefix}300x200${photo.suffix}` : undefined,
        url: p.website || `https://foursquare.com/v/${p.fsq_id}`,
      }
    })
  } catch {
    return []
  }
}

// ── Demo data ────────────────────────────────────────────────────────────────

function getDemoFood(city: string): Restaurant[] {
  const demos: Record<string, Restaurant[]> = {
    // ── Bao's Hidden Gems ──────────────────────────────────────────────────
    'da nang': [
      { id: 'r1', name: 'Bà Mụa', cuisine: 'Vietnamese / Mì Quảng', rating: 4.8, reviewCount: 1840, priceLevel: '$', address: '23 Trần Phú, Hải Châu', imageUrl: 'https://images.unsplash.com/photo-1569058242567-93de6f36f8eb?w=400&q=80', url: 'https://www.tripadvisor.com' },
      { id: 'r2', name: 'Madame Lân', cuisine: 'Central Vietnamese', rating: 4.6, reviewCount: 2300, priceLevel: '$$', address: '4 Bạch Đằng, Han River', imageUrl: 'https://images.unsplash.com/photo-1562802378-063ec186a863?w=400&q=80', url: 'https://www.tripadvisor.com' },
      { id: 'r3', name: 'Mystery Garden', cuisine: 'Garden Café / Fusion', rating: 4.7, reviewCount: 980, priceLevel: '$$', address: '5 Lê Hồng Phong, Đà Nẵng', imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80', url: 'https://www.tripadvisor.com' },
      { id: 'r4', name: 'Chill Skybar', cuisine: 'Rooftop Bar & Grill', rating: 4.5, reviewCount: 1500, priceLevel: '$$$', address: '200 Võ Nguyên Giáp, Mỹ Khê Beach', imageUrl: 'https://images.unsplash.com/photo-1514190051997-0f6f39ca5cde?w=400&q=80', url: 'https://www.tripadvisor.com' },
      { id: 'r5', name: 'Bếp Cuốn', cuisine: 'Vietnamese Spring Rolls', rating: 4.9, reviewCount: 760, priceLevel: '$', address: '18 Ngô Thị Sỹ, Hải Châu', imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&q=80', url: 'https://www.tripadvisor.com' },
      { id: 'r6', name: 'Apsara', cuisine: 'Cham / Fusion', rating: 4.6, reviewCount: 1120, priceLevel: '$$', address: '222 Trần Phú, Đà Nẵng', imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&q=80', url: 'https://www.tripadvisor.com' },
    ],
    'nha trang': [
      { id: 'r1', name: 'Lanterns', cuisine: 'Vietnamese', rating: 4.7, reviewCount: 3100, priceLevel: '$$', address: '34/6 Nguyễn Thiện Thuật', imageUrl: 'https://images.unsplash.com/photo-1562802378-063ec186a863?w=400&q=80', url: 'https://www.tripadvisor.com' },
      { id: 'r2', name: 'Trần Restaurant', cuisine: 'Seafood', rating: 4.6, reviewCount: 2400, priceLevel: '$$', address: '12 Bình Trung, Nha Trang', imageUrl: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=400&q=80', url: 'https://www.tripadvisor.com' },
      { id: 'r3', name: 'Sailing Club', cuisine: 'International / Beachfront', rating: 4.5, reviewCount: 1800, priceLevel: '$$$', address: '72-74 Trần Phú Beach', imageUrl: 'https://images.unsplash.com/photo-1514190051997-0f6f39ca5cde?w=400&q=80', url: 'https://www.tripadvisor.com' },
    ],
    'hoi an': [
      { id: 'r1', name: 'Morning Glory', cuisine: 'Central Vietnamese', rating: 4.8, reviewCount: 5200, priceLevel: '$$', address: '106 Nguyễn Thái Học, Old Town', imageUrl: 'https://images.unsplash.com/photo-1562802378-063ec186a863?w=400&q=80', url: 'https://www.tripadvisor.com' },
      { id: 'r2', name: 'Mango Mango', cuisine: 'Vietnamese Fusion', rating: 4.7, reviewCount: 3800, priceLevel: '$$', address: '45 Nguyễn Phúc Tần', imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&q=80', url: 'https://www.tripadvisor.com' },
      { id: 'r3', name: 'The Cargo Club', cuisine: 'French / Patisserie', rating: 4.6, reviewCount: 4100, priceLevel: '$$$', address: '107-109 Nguyễn Thái Học', imageUrl: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&q=80', url: 'https://www.tripadvisor.com' },
    ],
    'da lat': [
      { id: 'r1', name: 'Mellow', cuisine: 'Dalat Farm-to-Table', rating: 4.8, reviewCount: 1200, priceLevel: '$$', address: '5 Đường 3 Tháng 2', imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80', url: 'https://www.tripadvisor.com' },
      { id: 'r2', name: 'Góc Hà Nội', cuisine: 'Northern Vietnamese', rating: 4.6, reviewCount: 890, priceLevel: '$', address: '12 Tăng Bạt Hổ, Đà Lạt', imageUrl: 'https://images.unsplash.com/photo-1562802378-063ec186a863?w=400&q=80', url: 'https://www.tripadvisor.com' },
      { id: 'r3', name: 'Chocolate Box', cuisine: 'Café / Artisan Chocolate', rating: 4.7, reviewCount: 1450, priceLevel: '$$', address: '9 Nguyễn Văn Trỗi', imageUrl: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&q=80', url: 'https://www.tripadvisor.com' },
    ],
    batumi: [
      { id: 'r1', name: 'Shemoikhede Genatsvale', cuisine: 'Traditional Georgian', rating: 4.8, reviewCount: 2100, priceLevel: '$$', address: '1 Piazza Batumi, Old Town', imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80', url: 'https://www.tripadvisor.com' },
      { id: 'r2', name: 'Chacha Time', cuisine: 'Wine Bar / Georgian', rating: 4.6, reviewCount: 1400, priceLevel: '$$', address: '5 Pushkin Street, Batumi', imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&q=80', url: 'https://www.tripadvisor.com' },
      { id: 'r3', name: 'Entree', cuisine: 'Modern Georgian', rating: 4.7, reviewCount: 980, priceLevel: '$$$', address: '22 Ninoshvili Street', imageUrl: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&q=80', url: 'https://www.tripadvisor.com' },
      { id: 'r4', name: 'La Piazza', cuisine: 'Italian / Black Sea Seafood', rating: 4.5, reviewCount: 1800, priceLevel: '$$$', address: 'Batumi Boulevard, Seaside', imageUrl: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=400&q=80', url: 'https://www.tripadvisor.com' },
    ],
    tbilisi: [
      { id: 'r1', name: 'Café Littera', cuisine: 'Modern Georgian Fine Dining', rating: 4.9, reviewCount: 1600, priceLevel: '$$$$', address: '13 Lado Asatiani, Old Tbilisi', imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80', url: 'https://www.tripadvisor.com' },
      { id: 'r2', name: 'Barbarestan', cuisine: 'Historic Georgian', rating: 4.8, reviewCount: 2800, priceLevel: '$$$', address: '132 David Agmashenebeli Ave', imageUrl: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&q=80', url: 'https://www.tripadvisor.com' },
      { id: 'r3', name: 'Funicular Restaurant', cuisine: 'Georgian Panoramic', rating: 4.6, reviewCount: 3200, priceLevel: '$$$', address: 'Mtatsminda Park, Tbilisi', imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&q=80', url: 'https://www.tripadvisor.com' },
      { id: 'r4', name: 'Keto & Kote', cuisine: 'Wine & Khinkali Bar', rating: 4.7, reviewCount: 1100, priceLevel: '$$', address: '7 Shardeni Street, Old Town', imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&q=80', url: 'https://www.tripadvisor.com' },
    ],
    kotor: [
      { id: 'r1', name: 'Galion', cuisine: 'Bay Seafood', rating: 4.7, reviewCount: 2400, priceLevel: '$$$', address: 'Škaljari, Bay of Kotor', imageUrl: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=400&q=80', url: 'https://www.tripadvisor.com' },
      { id: 'r2', name: 'Stari Grad', cuisine: 'Montenegrin Cuisine', rating: 4.5, reviewCount: 1800, priceLevel: '$$', address: 'Trg od Oružja, Old Town', imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80', url: 'https://www.tripadvisor.com' },
      { id: 'r3', name: 'Luna Rossa', cuisine: 'Italian–Adriatic', rating: 4.6, reviewCount: 1200, priceLevel: '$$$', address: 'Stari Grad Kotor', imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&q=80', url: 'https://www.tripadvisor.com' },
    ],
    naples: [
      { id: 'r1', name: "L'Antica Pizzeria da Michele", cuisine: 'Neapolitan Pizza', rating: 4.8, reviewCount: 8200, priceLevel: '$', address: 'Via Cesare Sersale 1, Forcella', imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80', url: 'https://www.tripadvisor.com' },
      { id: 'r2', name: 'Pizzeria Starita', cuisine: 'Classic Neapolitan', rating: 4.7, reviewCount: 5400, priceLevel: '$', address: 'Via Materdei 27, Rione Sanità', imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80', url: 'https://www.tripadvisor.com' },
      { id: 'r3', name: 'Trattoria Nennella', cuisine: 'Old-School Neapolitan', rating: 4.6, reviewCount: 4100, priceLevel: '$', address: 'Vico Lungo Teatro Nuovo 103', imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80', url: 'https://www.tripadvisor.com' },
      { id: 'r4', name: 'Palazzo Petrucci', cuisine: 'Fine Dining / Creative Neapolitan', rating: 4.8, reviewCount: 1100, priceLevel: '$$$$', address: 'Via Posillipo 16/C', imageUrl: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&q=80', url: 'https://www.tripadvisor.com' },
      { id: 'r5', name: 'Di Matteo', cuisine: 'Street Pizza & Fritti', rating: 4.7, reviewCount: 3200, priceLevel: '$', address: 'Via dei Tribunali 94, Spaccanapoli', imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80', url: 'https://www.tripadvisor.com' },
      { id: 'r6', name: 'Ristorante Il Comandante', cuisine: 'Michelin Panoramic', rating: 4.9, reviewCount: 780, priceLevel: '$$$$', address: 'Via Cristoforo Colombo 45, roof', imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80', url: 'https://www.tripadvisor.com' },
    ],
    palermo: [
      { id: 'r1', name: 'Trattoria Ai Cascinari', cuisine: 'Sicilian Home Cooking', rating: 4.8, reviewCount: 2900, priceLevel: '$$', address: "Via d'Ossuna 43-45, Capo", imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80', url: 'https://www.tripadvisor.com' },
      { id: 'r2', name: 'Ballarò Street Food', cuisine: 'Sicilian Street Food', rating: 4.7, reviewCount: 1800, priceLevel: '$', address: 'Mercato di Ballarò, Albergheria', imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&q=80', url: 'https://www.tripadvisor.com' },
      { id: 'r3', name: 'Osteria dei Vespri', cuisine: 'Fine Sicilian', rating: 4.7, reviewCount: 1400, priceLevel: '$$$', address: 'Piazza Croce dei Vespri 6', imageUrl: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&q=80', url: 'https://www.tripadvisor.com' },
    ],
    porto: [
      { id: 'r1', name: 'Cantinho do Avillez', cuisine: 'Modern Portuguese', rating: 4.7, reviewCount: 3400, priceLevel: '$$$', address: 'Rua Mouzinho da Silveira 166', imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80', url: 'https://www.tripadvisor.com' },
      { id: 'r2', name: 'Pedro Lemos', cuisine: 'Michelin Star Portuguese', rating: 4.9, reviewCount: 920, priceLevel: '$$$$', address: 'Rua do Padre Luís Cabral 974', imageUrl: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&q=80', url: 'https://www.tripadvisor.com' },
      { id: 'r3', name: 'Taberna dos Mercadores', cuisine: 'Traditional Tascas', rating: 4.6, reviewCount: 2100, priceLevel: '$$', address: 'Rua dos Mercadores 36, Ribeira', imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80', url: 'https://www.tripadvisor.com' },
      { id: 'r4', name: 'DOP', cuisine: 'Rui Paula Creative', rating: 4.8, reviewCount: 1600, priceLevel: '$$$$', address: 'Largo de São Domingos 18', imageUrl: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&q=80', url: 'https://www.tripadvisor.com' },
      { id: 'r5', name: 'Majestic Café', cuisine: 'Historic Café / Pastries', rating: 4.5, reviewCount: 5200, priceLevel: '$$', address: 'Rua de Santa Catarina 112', imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&q=80', url: 'https://www.tripadvisor.com' },
    ],
    antalya: [
      { id: 'r1', name: 'Vanilla Restaurant', cuisine: 'Panoramic Rooftop Turkish', rating: 4.7, reviewCount: 2800, priceLevel: '$$$', address: 'Cumhuriyet Cad. 33, Kaleiçi', imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80', url: 'https://www.tripadvisor.com' },
      { id: 'r2', name: 'Parlak Restaurant', cuisine: 'Meze & Seafood', rating: 4.6, reviewCount: 1900, priceLevel: '$$', address: 'Balıkpazarı, Kaleiçi Old Town', imageUrl: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=400&q=80', url: 'https://www.tripadvisor.com' },
      { id: 'r3', name: 'Yörük Çadırı', cuisine: 'Nomadic Ottoman', rating: 4.8, reviewCount: 1200, priceLevel: '$$', address: 'Atatürk Kültür Merkezi yanı', imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&q=80', url: 'https://www.tripadvisor.com' },
    ],
    helsinki: [
      { id: 'r1', name: 'Olo', cuisine: 'Nordic Fine Dining', rating: 4.9, reviewCount: 980, priceLevel: '$$$$', address: 'Pohjoisesplanadi 5, Esplanadi', imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80', url: 'https://www.tripadvisor.com' },
      { id: 'r2', name: 'Savoy', cuisine: 'Classic Finnish', rating: 4.7, reviewCount: 1400, priceLevel: '$$$$', address: 'Eteläesplanadi 14, 7th floor', imageUrl: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&q=80', url: 'https://www.tripadvisor.com' },
      { id: 'r3', name: 'Gaijin', cuisine: 'Japanese–Nordic Fusion', rating: 4.8, reviewCount: 2100, priceLevel: '$$$', address: 'Iso Roobertinkatu 8', imageUrl: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&q=80', url: 'https://www.tripadvisor.com' },
      { id: 'r4', name: 'Café Ekberg', cuisine: 'Historic Bakery / Café', rating: 4.6, reviewCount: 3200, priceLevel: '$$', address: 'Bulevardi 9, Design District', imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&q=80', url: 'https://www.tripadvisor.com' },
    ],
    split: [
      { id: 'r1', name: 'Nostromo', cuisine: 'Adriatic Seafood', rating: 4.8, reviewCount: 3400, priceLevel: '$$$', address: 'Kraj Sv. Marije 10, Old Town', imageUrl: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=400&q=80', url: 'https://www.tripadvisor.com' },
      { id: 'r2', name: 'Pojoda', cuisine: 'Traditional Dalmatian', rating: 4.7, reviewCount: 2100, priceLevel: '$$', address: 'Don Mihovila Pavlinovića 1', imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80', url: 'https://www.tripadvisor.com' },
      { id: 'r3', name: 'Maslina', cuisine: 'Dalmatian Wine & Tapas', rating: 4.6, reviewCount: 1800, priceLevel: '$$$', address: 'Obrov 7, Diocletian Palace', imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&q=80', url: 'https://www.tripadvisor.com' },
    ],
    bergen: [
      { id: 'r1', name: 'Bare Vestland', cuisine: 'New Nordic', rating: 4.8, reviewCount: 1400, priceLevel: '$$$$', address: 'Strandkaien 3, Bryggen', imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80', url: 'https://www.tripadvisor.com' },
      { id: 'r2', name: 'Fiskespiren', cuisine: 'Fresh Harbour Seafood', rating: 4.7, reviewCount: 2800, priceLevel: '$$$', address: 'Torget Fish Market, Bergen Wharf', imageUrl: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=400&q=80', url: 'https://www.tripadvisor.com' },
      { id: 'r3', name: 'Lysverket', cuisine: 'Michelin Nordic', rating: 4.9, reviewCount: 760, priceLevel: '$$$$', address: 'KODE 4, Rasmus Meyers allé 9', imageUrl: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&q=80', url: 'https://www.tripadvisor.com' },
    ],
    thessaloniki: [
      { id: 'r1', name: 'Extravaganza', cuisine: 'Creative Greek', rating: 4.7, reviewCount: 2100, priceLevel: '$$$', address: 'Leoforos Nikis 13, Waterfront', imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80', url: 'https://www.tripadvisor.com' },
      { id: 'r2', name: 'Tiffany', cuisine: 'Bougatsa & Breakfast', rating: 4.6, reviewCount: 3800, priceLevel: '$', address: 'Tsimiski 25, City Center', imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&q=80', url: 'https://www.tripadvisor.com' },
      { id: 'r3', name: 'Aristotelous Restaurant', cuisine: 'Meze & Ouzo', rating: 4.5, reviewCount: 1600, priceLevel: '$$', address: 'Aristotelous Square', imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&q=80', url: 'https://www.tripadvisor.com' },
    ],
    valparaiso: [
      { id: 'r1', name: 'Pasta e Vino', cuisine: 'Chilean–Italian Fusion', rating: 4.8, reviewCount: 2300, priceLevel: '$$$', address: 'Templeman 352, Cerro Alegre', imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&q=80', url: 'https://www.tripadvisor.com' },
      { id: 'r2', name: 'Café Vinilo', cuisine: 'Chilean Comfort', rating: 4.6, reviewCount: 1900, priceLevel: '$$', address: 'Almirante Montt 448, Cerro Alegre', imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80', url: 'https://www.tripadvisor.com' },
      { id: 'r3', name: 'El Internado', cuisine: 'Bohemian Café', rating: 4.5, reviewCount: 1400, priceLevel: '$$', address: 'Cerro Concepción, Valparaíso', imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80', url: 'https://www.tripadvisor.com' },
    ],
    // ── Major cities ───────────────────────────────────────────────────────
    miami: [
      { id: 'r1', name: 'Cvi.che 105', cuisine: 'Peruvian Fusion', rating: 4.6, reviewCount: 2841, priceLevel: '$$$', address: '105 NE 3rd Ave, Miami', imageUrl: 'https://images.unsplash.com/photo-1535400875038-7f1ed3765cc3?w=400&q=80', url: 'https://www.yelp.com' },
      { id: 'r2', name: "Joe's Stone Crab", cuisine: 'Seafood', rating: 4.4, reviewCount: 5200, priceLevel: '$$$$', address: '11 Washington Ave, Miami Beach', imageUrl: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=400&q=80', url: 'https://www.yelp.com' },
      { id: 'r3', name: 'Versailles Restaurant', cuisine: 'Cuban', rating: 4.3, reviewCount: 3100, priceLevel: '$$', address: '3555 SW 8th St, Little Havana', imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&q=80', url: 'https://www.yelp.com' },
      { id: 'r4', name: 'Zuma Miami', cuisine: 'Japanese Contemporary', rating: 4.7, reviewCount: 1800, priceLevel: '$$$$', address: '270 Biscayne Blvd Way, Brickell', imageUrl: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&q=80', url: 'https://www.yelp.com' },
      { id: 'r5', name: 'Coyo Taco', cuisine: 'Mexican', rating: 4.5, reviewCount: 2400, priceLevel: '$$', address: '2300 NW 2nd Ave, Wynwood', imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80', url: 'https://www.yelp.com' },
      { id: 'r6', name: 'KYU', cuisine: 'Asian Fusion BBQ', rating: 4.6, reviewCount: 1950, priceLevel: '$$$', address: '251 NW 25th St, Wynwood', imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80', url: 'https://www.yelp.com' },
    ],
    tokyo: [
      { id: 'r1', name: 'Sukiyabashi Jiro Honten', cuisine: 'Sushi', rating: 4.9, reviewCount: 850, priceLevel: '$$$$', address: 'Chuo City, Ginza', imageUrl: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&q=80', url: 'https://www.yelp.com' },
      { id: 'r2', name: 'Ichiran Shibuya', cuisine: 'Ramen', rating: 4.7, reviewCount: 4200, priceLevel: '$$', address: 'Shibuya, Tokyo', imageUrl: 'https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=400&q=80', url: 'https://www.yelp.com' },
      { id: 'r3', name: 'Narisawa', cuisine: 'Innovative Satoyama', rating: 4.9, reviewCount: 620, priceLevel: '$$$$', address: 'Minami-Aoyama, Minato', imageUrl: 'https://images.unsplash.com/photo-1600803907087-f56d462fd26b?w=400&q=80', url: 'https://www.yelp.com' },
      { id: 'r4', name: 'Tempura Kondo', cuisine: 'Tempura', rating: 4.8, reviewCount: 780, priceLevel: '$$$$', address: 'Ginza 9-chome', imageUrl: 'https://images.unsplash.com/photo-1535400875038-7f1ed3765cc3?w=400&q=80', url: 'https://www.yelp.com' },
    ],
    barcelona: [
      { id: 'r1', name: 'Disfrutar', cuisine: 'Creative Spanish', rating: 4.9, reviewCount: 1100, priceLevel: '$$$$', address: 'Carrer de Villarroel 163, Eixample', imageUrl: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&q=80', url: 'https://www.yelp.com' },
      { id: 'r2', name: 'Bar Cañete', cuisine: 'Spanish Tapas', rating: 4.7, reviewCount: 2400, priceLevel: '$$$', address: 'Carrer de la Unió 17, Raval', imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80', url: 'https://www.yelp.com' },
      { id: 'r3', name: 'Els Pescadors', cuisine: 'Seafood & Paella', rating: 4.7, reviewCount: 1450, priceLevel: '$$$', address: 'Plaça de Prim 1, Poblenou', imageUrl: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=400&q=80', url: 'https://www.yelp.com' },
    ],
    paris: [
      { id: 'r1', name: 'Le Cinq (Four Seasons)', cuisine: 'French Haute Cuisine', rating: 4.9, reviewCount: 730, priceLevel: '$$$$', address: '31 Av George V, 8e', imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80', url: 'https://www.yelp.com' },
      { id: 'r2', name: 'Septime', cuisine: 'Modern French', rating: 4.8, reviewCount: 2100, priceLevel: '$$$', address: '80 Rue de Charonne, 11e', imageUrl: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&q=80', url: 'https://www.yelp.com' },
      { id: 'r3', name: 'Du Pain et des Idées', cuisine: 'Artisan Bakery', rating: 4.9, reviewCount: 3800, priceLevel: '$', address: '34 Rue Yves Toudic, 10e', imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&q=80', url: 'https://www.yelp.com' },
    ],
    sydney: [
      { id: 'r1', name: 'Quay Restaurant', cuisine: 'Modern Australian', rating: 4.8, reviewCount: 1400, priceLevel: '$$$$', address: 'Upper Level Overseas Passenger Terminal', imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80', url: 'https://www.yelp.com' },
      { id: 'r2', name: 'Icebergs Dining Room', cuisine: 'Italian Coastal', rating: 4.7, reviewCount: 2200, priceLevel: '$$$$', address: '1 Notts Ave, Bondi Beach', imageUrl: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=400&q=80', url: 'https://www.yelp.com' },
    ],
  }

  return demos[city.toLowerCase()] || [
    { id: 'r1', name: 'The Local Kitchen', cuisine: 'Farm-to-Table', rating: 4.6, reviewCount: 892, priceLevel: '$$$', address: '42 Main Street, Downtown', imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80', url: '#' },
    { id: 'r2', name: 'Harbour View Brasserie', cuisine: 'Contemporary', rating: 4.5, reviewCount: 1240, priceLevel: '$$$', address: '8 Waterfront Drive', imageUrl: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&q=80', url: '#' },
    { id: 'r3', name: 'Spice Route', cuisine: 'Asian Fusion', rating: 4.7, reviewCount: 654, priceLevel: '$$', address: '156 Cultural Quarter', imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&q=80', url: '#' },
    { id: 'r4', name: 'Trattoria Bella', cuisine: 'Italian', rating: 4.4, reviewCount: 2100, priceLevel: '$$', address: '23 Vine Street, Arts District', imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&q=80', url: '#' },
  ]
}
