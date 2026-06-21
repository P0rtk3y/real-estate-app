import { Restaurant } from '@/lib/types'

const YELP_KEY = process.env.YELP_API_KEY || ''

export async function fetchFood(city: string): Promise<Restaurant[]> {
  if (!YELP_KEY) return getDemoFood(city)

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
    if (!res.ok) throw new Error(`Yelp error: ${res.status}`)
    const data = await res.json()
    const businesses = data?.businesses || []

    return businesses.slice(0, 6).map((b: YelpBusiness) => ({
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
  } catch (err) {
    console.error('Food fetch failed:', err)
    return getDemoFood(city)
  }
}

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

function getDemoFood(city: string): Restaurant[] {
  const demos: Record<string, Restaurant[]> = {
    miami: [
      { id: 'r1', name: 'Cvi.che 105', cuisine: 'Peruvian Fusion', rating: 4.6, reviewCount: 2841, priceLevel: '$$$', address: '105 NE 3rd Ave, Miami', imageUrl: 'https://images.unsplash.com/photo-1535400875038-7f1ed3765cc3?w=400&q=80', url: 'https://www.yelp.com' },
      { id: 'r2', name: 'Joe\'s Stone Crab', cuisine: 'Seafood', rating: 4.4, reviewCount: 5200, priceLevel: '$$$$', address: '11 Washington Ave, Miami Beach', imageUrl: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=400&q=80', url: 'https://www.yelp.com' },
      { id: 'r3', name: 'Versailles Restaurant', cuisine: 'Cuban', rating: 4.3, reviewCount: 3100, priceLevel: '$$', address: '3555 SW 8th St, Little Havana', imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&q=80', url: 'https://www.yelp.com' },
      { id: 'r4', name: 'Zuma Miami', cuisine: 'Japanese Contemporary', rating: 4.7, reviewCount: 1800, priceLevel: '$$$$', address: '270 Biscayne Blvd Way, Brickell', imageUrl: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&q=80', url: 'https://www.yelp.com' },
      { id: 'r5', name: 'Coyo Taco', cuisine: 'Mexican', rating: 4.5, reviewCount: 2400, priceLevel: '$$', address: '2300 NW 2nd Ave, Wynwood', imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80', url: 'https://www.yelp.com' },
      { id: 'r6', name: 'KYU', cuisine: 'Asian Fusion BBQ', rating: 4.6, reviewCount: 1950, priceLevel: '$$$', address: '251 NW 25th St, Wynwood', imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80', url: 'https://www.yelp.com' },
    ],
    tokyo: [
      { id: 'r1', name: 'Sukiyabashi Jiro Honten', cuisine: 'Sushi', rating: 4.9, reviewCount: 850, priceLevel: '$$$$', address: 'Chuo City, Ginza', imageUrl: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&q=80', url: 'https://www.yelp.com' },
      { id: 'r2', name: 'Ichiran Shibuya', cuisine: 'Ramen', rating: 4.7, reviewCount: 4200, priceLevel: '$$', address: 'Shibuya, Tokyo', imageUrl: 'https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=400&q=80', url: 'https://www.yelp.com' },
      { id: 'r3', name: 'Tsuta Ramen', cuisine: 'Michelin Ramen', rating: 4.8, reviewCount: 1200, priceLevel: '$$$', address: 'Sugamo, Tokyo', imageUrl: 'https://images.unsplash.com/photo-1569958082619-2d2a0b0a7e28?w=400&q=80', url: 'https://www.yelp.com' },
      { id: 'r4', name: 'Narisawa', cuisine: 'Innovative Satoyama', rating: 4.9, reviewCount: 620, priceLevel: '$$$$', address: 'Minami-Aoyama, Minato', imageUrl: 'https://images.unsplash.com/photo-1600803907087-f56d462fd26b?w=400&q=80', url: 'https://www.yelp.com' },
      { id: 'r5', name: 'Tempura Kondo', cuisine: 'Tempura', rating: 4.8, reviewCount: 780, priceLevel: '$$$$', address: 'Ginza 9-chome', imageUrl: 'https://images.unsplash.com/photo-1535400875038-7f1ed3765cc3?w=400&q=80', url: 'https://www.yelp.com' },
      { id: 'r6', name: 'Afuri Ebisu', cuisine: 'Yuzu Ramen', rating: 4.6, reviewCount: 2800, priceLevel: '$$', address: 'Ebisu, Shibuya', imageUrl: 'https://images.unsplash.com/photo-1569958082619-2d2a0b0a7e28?w=400&q=80', url: 'https://www.yelp.com' },
    ],
    barcelona: [
      { id: 'r1', name: 'Disfrutar', cuisine: 'Creative Spanish', rating: 4.9, reviewCount: 1100, priceLevel: '$$$$', address: 'Carrer de Villarroel 163, Eixample', imageUrl: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&q=80', url: 'https://www.yelp.com' },
      { id: 'r2', name: 'Bar Cañete', cuisine: 'Spanish Tapas', rating: 4.7, reviewCount: 2400, priceLevel: '$$$', address: 'Carrer de la Unió 17, Raval', imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80', url: 'https://www.yelp.com' },
      { id: 'r3', name: 'La Pepita', cuisine: 'Montaditos', rating: 4.6, reviewCount: 3200, priceLevel: '$$', address: 'Carrer de Montserrat 22, Born', imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&q=80', url: 'https://www.yelp.com' },
      { id: 'r4', name: 'El Xampanyet', cuisine: 'Cava & Pintxos', rating: 4.5, reviewCount: 1900, priceLevel: '$$', address: 'Carrer de Montcada 22, Born', imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80', url: 'https://www.yelp.com' },
      { id: 'r5', name: 'Bodega Sepúlveda', cuisine: 'Catalan Wine Bar', rating: 4.6, reviewCount: 980, priceLevel: '$$', address: 'Carrer de Sepúlveda 170, Eixample', imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&q=80', url: 'https://www.yelp.com' },
      { id: 'r6', name: 'Els Pescadors', cuisine: 'Seafood & Paella', rating: 4.7, reviewCount: 1450, priceLevel: '$$$', address: 'Plaça de Prim 1, Poblenou', imageUrl: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=400&q=80', url: 'https://www.yelp.com' },
    ],
    paris: [
      { id: 'r1', name: 'Le Cinq (Four Seasons)', cuisine: 'French Haute Cuisine', rating: 4.9, reviewCount: 730, priceLevel: '$$$$', address: '31 Av George V, 8e', imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80', url: 'https://www.yelp.com' },
      { id: 'r2', name: 'Septime', cuisine: 'Modern French', rating: 4.8, reviewCount: 2100, priceLevel: '$$$', address: '80 Rue de Charonne, 11e', imageUrl: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&q=80', url: 'https://www.yelp.com' },
      { id: 'r3', name: 'Au Pied de Cochon', cuisine: 'Classic Brasserie', rating: 4.5, reviewCount: 4200, priceLevel: '$$$', address: '6 Rue Coquillière, 1er', imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80', url: 'https://www.yelp.com' },
      { id: 'r4', name: 'Du Pain et des Idées', cuisine: 'Artisan Bakery', rating: 4.9, reviewCount: 3800, priceLevel: '$', address: '34 Rue Yves Toudic, 10e', imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&q=80', url: 'https://www.yelp.com' },
    ],
    sydney: [
      { id: 'r1', name: 'Quay Restaurant', cuisine: 'Modern Australian', rating: 4.8, reviewCount: 1400, priceLevel: '$$$$', address: 'Upper Level Overseas Passenger Terminal', imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80', url: 'https://www.yelp.com' },
      { id: 'r2', name: 'Icebergs Dining Room', cuisine: 'Italian Coastal', rating: 4.7, reviewCount: 2200, priceLevel: '$$$$', address: '1 Notts Ave, Bondi Beach', imageUrl: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=400&q=80', url: 'https://www.yelp.com' },
      { id: 'r3', name: 'Momofuku Seiobo', cuisine: 'David Chang Asian', rating: 4.8, reviewCount: 980, priceLevel: '$$$$', address: 'The Star Sydney, Pyrmont', imageUrl: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&q=80', url: 'https://www.yelp.com' },
      { id: 'r4', name: 'Rockpool Bar & Grill', cuisine: 'Steakhouse', rating: 4.6, reviewCount: 3100, priceLevel: '$$$$', address: '66 Hunter St, CBD', imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80', url: 'https://www.yelp.com' },
    ],
  }

  return demos[city.toLowerCase()] || [
    { id: 'r1', name: 'The Local Kitchen', cuisine: 'Farm-to-Table', rating: 4.6, reviewCount: 892, priceLevel: '$$$', address: '42 Main Street, Downtown', imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80', url: '#' },
    { id: 'r2', name: 'Harbour View Brasserie', cuisine: 'Contemporary', rating: 4.5, reviewCount: 1240, priceLevel: '$$$', address: '8 Waterfront Drive', imageUrl: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&q=80', url: '#' },
    { id: 'r3', name: 'Spice Route', cuisine: 'Asian Fusion', rating: 4.7, reviewCount: 654, priceLevel: '$$', address: '156 Cultural Quarter', imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&q=80', url: '#' },
    { id: 'r4', name: 'Trattoria Bella', cuisine: 'Italian', rating: 4.4, reviewCount: 2100, priceLevel: '$$', address: '23 Vine Street, Arts District', imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&q=80', url: '#' },
  ]
}
