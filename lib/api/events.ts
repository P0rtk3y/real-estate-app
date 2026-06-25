import { Event } from '@/lib/types'

const TM_KEY = process.env.TICKETMASTER_API_KEY || ''
const EB_KEY = process.env.EVENTBRITE_API_KEY || ''

// Cities where Ticketmaster has no meaningful coverage
const TM_BLIND_SPOTS = new Set([
  'da nang', 'nha trang', 'hoi an', 'da lat',
  'batumi', 'tbilisi',
  'kotor',
  'ohrid', 'tirana',
  'valparaiso',
])

export async function fetchEvents(city: string): Promise<Event[]> {
  const cityLower = city.toLowerCase()
  const skipTM = TM_BLIND_SPOTS.has(cityLower)

  if (TM_KEY && !skipTM) {
    const results = await fetchTicketmaster(city)
    if (results.length > 0) return results
  }

  // Eventbrite covers Asia, Eastern Europe, Latin America well
  if (EB_KEY) {
    const results = await fetchEventbrite(city)
    if (results.length > 0) return results
  }

  return getDemoEvents(city)
}

// ── Ticketmaster ─────────────────────────────────────────────────────────────

interface TicketmasterEvent {
  id: string
  name: string
  url: string
  dates?: { start?: { localDate?: string; localTime?: string } }
  _embedded?: { venues?: Array<{ name: string }> }
  classifications?: Array<{ segment?: { name: string } }>
  images?: Array<{ ratio: string; width: number; url: string }>
  priceRanges?: Array<{ min: number; max: number }>
}

async function fetchTicketmaster(city: string): Promise<Event[]> {
  try {
    const url = new URL('https://app.ticketmaster.com/discovery/v2/events.json')
    url.searchParams.set('apikey', TM_KEY)
    url.searchParams.set('city', city)
    url.searchParams.set('size', '8')
    url.searchParams.set('sort', 'date,asc')
    url.searchParams.set('startDateTime', new Date().toISOString().split('.')[0] + 'Z')

    const res = await fetch(url.toString(), { next: { revalidate: 7200 } })
    if (!res.ok) return []
    const data = await res.json()
    const items: TicketmasterEvent[] = data?._embedded?.events || []
    return items.slice(0, 8).map(e => ({
      id: e.id,
      name: e.name,
      date: e.dates?.start?.localDate || '',
      time: e.dates?.start?.localTime || '',
      venue: e._embedded?.venues?.[0]?.name || 'TBA',
      category: e.classifications?.[0]?.segment?.name || 'Entertainment',
      url: e.url,
      imageUrl: e.images?.find(img => img.ratio === '16_9' && img.width > 500)?.url,
      priceRange: e.priceRanges ? `$${e.priceRanges[0].min}–$${e.priceRanges[0].max}` : undefined,
    }))
  } catch {
    return []
  }
}

// ── Eventbrite ───────────────────────────────────────────────────────────────

interface EventbriteEvent {
  id: string
  name: { text: string }
  url: string
  start: { local: string }
  logo?: { url: string }
  category?: { name: string }
  venue?: { name: string }
  ticket_classes?: Array<{ cost?: { display: string } }>
}

async function fetchEventbrite(city: string): Promise<Event[]> {
  try {
    const url = new URL('https://www.eventbriteapi.com/v3/events/search/')
    url.searchParams.set('location.address', city)
    url.searchParams.set('location.within', '50km')
    url.searchParams.set('sort_by', 'date')
    url.searchParams.set('start_date.range_start', new Date().toISOString().split('.')[0] + 'Z')
    url.searchParams.set('expand', 'venue,ticket_classes,category')
    url.searchParams.set('page_size', '8')
    url.searchParams.set('status', 'live')

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${EB_KEY}` },
      next: { revalidate: 7200 },
    })
    if (!res.ok) return []
    const data = await res.json()
    const events: EventbriteEvent[] = data?.events || []
    return events.slice(0, 8).map(e => {
      const dt = e.start?.local || ''
      const [date, time] = dt.split('T')
      const prices = e.ticket_classes?.map(tc => tc.cost?.display).filter(Boolean)
      return {
        id: e.id,
        name: e.name?.text || '',
        date,
        time: time?.slice(0, 5) || '',
        venue: e.venue?.name || 'TBA',
        category: e.category?.name || 'Event',
        url: e.url,
        imageUrl: e.logo?.url,
        priceRange: prices?.[0],
      }
    })
  } catch {
    return []
  }
}

// ── Demo data ────────────────────────────────────────────────────────────────

function getDemoEvents(city: string): Event[] {
  const demos: Record<string, Event[]> = {
    // ── Bao's Hidden Gems ──────────────────────────────────────────────────
    'da nang': [
      { id: 'e1', name: 'Da Nang International Fireworks Festival', date: '2026-06-06', time: '21:00:00', venue: 'Han River Bridge Viewing Area', category: 'Festival', url: 'https://www.danangfireworks.com.vn', imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&q=80' },
      { id: 'e2', name: 'Da Nang Cuisine Festival', date: '2026-08-15', time: '10:00:00', venue: 'Asia Park, Da Nang', category: 'Food & Drink', url: 'https://www.danang.gov.vn', imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=80' },
      { id: 'e3', name: 'Dragon Boat Race Festival', date: '2026-05-01', time: '08:00:00', venue: 'Han River, Da Nang', category: 'Sports', url: 'https://www.danang.gov.vn', imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80' },
    ],
    'nha trang': [
      { id: 'e1', name: 'Nha Trang Sea Festival', date: '2026-06-10', time: '09:00:00', venue: 'Tran Phu Beach Promenade', category: 'Festival', url: 'https://www.nhatrang-travel.com', imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&q=80' },
      { id: 'e2', name: 'Ponagar Temple Festival', date: '2026-04-20', time: '07:00:00', venue: 'Po Nagar Cham Towers', category: 'Cultural', url: 'https://www.nhatrang-travel.com', imageUrl: 'https://images.unsplash.com/photo-1541367777708-7905fe3296c0?w=400&q=80' },
    ],
    'hoi an': [
      { id: 'e1', name: 'Hoi An Lantern Festival', date: '2026-07-14', time: '19:00:00', venue: 'Thu Bon River, Hội An Old Town', category: 'Cultural', url: 'https://www.hoianworldheritage.org', imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&q=80' },
      { id: 'e2', name: 'Hoi An International Food Festival', date: '2026-03-22', time: '10:00:00', venue: 'An Hoi Peninsula', category: 'Food & Drink', url: 'https://www.hoianfoodfestival.com', imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=80' },
    ],
    'da lat': [
      { id: 'e1', name: 'Da Lat Flower Festival', date: '2026-12-21', time: '09:00:00', venue: 'Xuan Huong Lake, Da Lat', category: 'Festival', url: 'https://www.dalat.gov.vn', imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&q=80' },
      { id: 'e2', name: 'Da Lat Night Market', date: '2026-07-04', time: '18:00:00', venue: 'Da Lat Market Square', category: 'Market', url: 'https://www.dalat.gov.vn', imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=80' },
    ],
    batumi: [
      { id: 'e1', name: 'Black Sea Jazz Festival', date: '2026-07-12', time: '20:00:00', venue: 'Batumi Boulevard, Piazza', category: 'Music', url: 'https://www.bsjf.ge', imageUrl: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=400&q=80' },
      { id: 'e2', name: 'Batumi Art-Gen Festival', date: '2026-08-08', time: '12:00:00', venue: 'Batumi Old Town Square', category: 'Arts', url: 'https://www.artgen.ge', imageUrl: 'https://images.unsplash.com/photo-1541367777708-7905fe3296c0?w=400&q=80' },
      { id: 'e3', name: 'Georgian Wine Festival', date: '2026-10-03', time: '11:00:00', venue: 'Batumi Botanical Garden', category: 'Food & Drink', url: 'https://www.georgia.travel', imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&q=80' },
    ],
    tbilisi: [
      { id: 'e1', name: 'Tbilisi International Festival of Theatre', date: '2026-10-15', time: '19:00:00', venue: 'Rustaveli National Theatre', category: 'Arts', url: 'https://www.georgia.travel', imageUrl: 'https://images.unsplash.com/photo-1541367777708-7905fe3296c0?w=400&q=80' },
      { id: 'e2', name: 'Tbilisoba City Festival', date: '2026-10-25', time: '10:00:00', venue: 'Old Tbilisi, Rike Park', category: 'Cultural', url: 'https://www.georgia.travel', imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&q=80' },
      { id: 'e3', name: 'New Wine Festival', date: '2026-05-10', time: '12:00:00', venue: 'Rike Park, Tbilisi', category: 'Food & Drink', url: 'https://www.georgia.travel', imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&q=80' },
    ],
    kotor: [
      { id: 'e1', name: 'Kotor Carnival', date: '2026-02-14', time: '14:00:00', venue: 'Kotor Old Town, Arms Square', category: 'Cultural', url: 'https://www.visit-montenegro.com', imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&q=80' },
      { id: 'e2', name: 'Kotor Music Festival', date: '2026-08-22', time: '20:00:00', venue: 'St. Tryphon Cathedral Square', category: 'Music', url: 'https://www.visit-montenegro.com', imageUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&q=80' },
      { id: 'e3', name: "Fasinada – Boka Night", date: '2026-08-15', time: '21:00:00', venue: 'Bay of Kotor, Perast', category: 'Cultural', url: 'https://www.visit-montenegro.com', imageUrl: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=400&q=80' },
    ],
    naples: [
      { id: 'e1', name: 'Napoli Pizza Village', date: '2026-06-06', time: '12:00:00', venue: 'Lungomare Caracciolo, Naples Seafront', category: 'Food & Drink', url: 'https://www.pizzavillage.it', imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80', priceRange: 'Free' },
      { id: 'e2', name: 'Maggio dei Monumenti', date: '2026-05-03', time: '10:00:00', venue: 'Historic Naples (various sites)', category: 'Cultural', url: 'https://www.comune.napoli.it', imageUrl: 'https://images.unsplash.com/photo-1541367777708-7905fe3296c0?w=400&q=80', priceRange: 'Free' },
      { id: 'e3', name: 'Naples Film Festival', date: '2026-09-19', time: '18:00:00', venue: 'Teatro Palapartenope', category: 'Arts', url: 'https://www.naplesfilmfest.com', imageUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&q=80', priceRange: '€10–€25' },
    ],
    palermo: [
      { id: 'e1', name: 'Festa di Santa Rosalia (U Festino)', date: '2026-07-15', time: '18:00:00', venue: 'Corso Vittorio Emanuele, Palermo', category: 'Cultural', url: 'https://www.comune.palermo.it', imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&q=80', priceRange: 'Free' },
      { id: 'e2', name: 'Palermo International Puppet Festival', date: '2026-05-16', time: '10:00:00', venue: 'Teatro Massimo Bellini area', category: 'Arts', url: 'https://www.comune.palermo.it', imageUrl: 'https://images.unsplash.com/photo-1541367777708-7905fe3296c0?w=400&q=80' },
    ],
    porto: [
      { id: 'e1', name: 'Festa de São João do Porto', date: '2026-06-23', time: '20:00:00', venue: 'Throughout Porto — streets, bridges', category: 'Cultural', url: 'https://www.visitporto.travel', imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&q=80', priceRange: 'Free' },
      { id: 'e2', name: 'NOS Primavera Sound Porto', date: '2026-06-04', time: '15:00:00', venue: 'Parque da Cidade, Porto', category: 'Music', url: 'https://www.nosprimaverasound.com', imageUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&q=80', priceRange: '€85–€250' },
      { id: 'e3', name: 'Porto Wine Fest', date: '2026-09-18', time: '17:00:00', venue: 'Palácio de Cristal Gardens', category: 'Food & Drink', url: 'https://www.visitporto.travel', imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&q=80', priceRange: '€20–€45' },
    ],
    antalya: [
      { id: 'e1', name: 'Aspendos International Opera & Ballet Festival', date: '2026-06-12', time: '20:30:00', venue: 'Aspendos Roman Theatre (45 min from Antalya)', category: 'Arts', url: 'https://www.aspendosfestival.gov.tr', imageUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&q=80', priceRange: '€30–€120' },
      { id: 'e2', name: 'Antalya Golden Orange Film Festival', date: '2026-10-10', time: '18:00:00', venue: 'Antalya Cultural Center', category: 'Arts', url: 'https://www.altinportakal.org.tr', imageUrl: 'https://images.unsplash.com/photo-1541367777708-7905fe3296c0?w=400&q=80' },
      { id: 'e3', name: 'Antalya Marathon', date: '2026-11-14', time: '08:00:00', venue: 'Antalya City Center', category: 'Sports', url: 'https://www.antalyamarathon.org', imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80', priceRange: '€30' },
    ],
    helsinki: [
      { id: 'e1', name: 'Helsinki Festival', date: '2026-08-14', time: '12:00:00', venue: 'Various Helsinki Venues', category: 'Arts', url: 'https://www.helsinkifestival.fi', imageUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&q=80', priceRange: '€15–€75' },
      { id: 'e2', name: 'Flow Festival Helsinki', date: '2026-08-07', time: '14:00:00', venue: 'Suvilahti, Helsinki', category: 'Music', url: 'https://www.flowfestival.com', imageUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&q=80', priceRange: '€145–€285' },
      { id: 'e3', name: 'Lux Helsinki Light Festival', date: '2027-01-06', time: '17:00:00', venue: 'Helsinki City Center', category: 'Arts', url: 'https://www.luxhelsinki.fi', imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&q=80', priceRange: 'Free' },
    ],
    split: [
      { id: 'e1', name: 'Ultra Europe Festival', date: '2026-07-10', time: '18:00:00', venue: 'Poljud Stadium, Split', category: 'Music', url: 'https://ultraeurope.com', imageUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&q=80', priceRange: '€130–€350' },
      { id: 'e2', name: 'Split Summer Festival', date: '2026-07-18', time: '20:00:00', venue: 'Diocletian Palace & Prokurative', category: 'Arts', url: 'https://www.splitsko-ljeto.hr', imageUrl: 'https://images.unsplash.com/photo-1541367777708-7905fe3296c0?w=400&q=80', priceRange: '€15–€45' },
      { id: 'e3', name: 'Spaladium Arena Concerts', date: '2026-09-05', time: '20:00:00', venue: 'Spaladium Arena, Split', category: 'Music', url: 'https://www.splitsko-ljeto.hr', imageUrl: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=400&q=80' },
    ],
    bergen: [
      { id: 'e1', name: 'Bergen International Festival (Festspillene)', date: '2026-05-22', time: '19:00:00', venue: 'Grieg Hall & Bergen venues', category: 'Arts', url: 'https://www.fib.no', imageUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&q=80', priceRange: 'kr200–kr800' },
      { id: 'e2', name: 'Bergen Food Festival', date: '2026-08-27', time: '11:00:00', venue: 'Torgallmenningen, Bergen Centre', category: 'Food & Drink', url: 'https://www.bergenfoodfestival.no', imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=80', priceRange: 'Free' },
    ],
    thessaloniki: [
      { id: 'e1', name: 'Thessaloniki International Film Festival', date: '2026-11-05', time: '18:00:00', venue: 'Olympion Cinema, Aristotelous Square', category: 'Arts', url: 'https://www.filmfestival.gr', imageUrl: 'https://images.unsplash.com/photo-1541367777708-7905fe3296c0?w=400&q=80', priceRange: '€5–€12' },
      { id: 'e2', name: 'Dimitria Festival', date: '2026-10-10', time: '20:00:00', venue: 'Various Thessaloniki venues', category: 'Cultural', url: 'https://www.thessaloniki.gr', imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&q=80' },
    ],
    valparaiso: [
      { id: 'e1', name: 'New Year Fireworks Valparaíso', date: '2027-01-01', time: '00:00:00', venue: 'Valparaíso Bay (world famous)', category: 'Festival', url: 'https://www.visitvalparaiso.cl', imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&q=80', priceRange: 'Free' },
      { id: 'e2', name: 'Festival Puerto de Ideas', date: '2026-11-06', time: '10:00:00', venue: 'Teatro Municipal, Valparaíso', category: 'Cultural', url: 'https://www.puertodeideas.cl', imageUrl: 'https://images.unsplash.com/photo-1541367777708-7905fe3296c0?w=400&q=80' },
    ],
    ohrid: [
      { id: 'e1', name: 'Ohrid Summer Festival', date: '2026-07-12', time: '20:00:00', venue: 'Ancient Theatre of Ohrid', category: 'Arts', url: 'https://www.ohrid.gov.mk', imageUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&q=80' },
    ],
    // ── Major cities ────────────────────────────────────────────────────────
    miami: [
      { id: 'e1', name: 'Art Basel Miami Beach', date: '2026-12-04', time: '14:00:00', venue: 'Miami Beach Convention Center', category: 'Arts', url: 'https://www.artbasel.com', imageUrl: 'https://images.unsplash.com/photo-1541367777708-7905fe3296c0?w=400&q=80', priceRange: '$50–$500' },
      { id: 'e2', name: 'Miami Music Week', date: '2026-03-18', time: '22:00:00', venue: 'Various Venues, South Beach', category: 'Music', url: 'https://www.ultramusicfestival.com', imageUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&q=80', priceRange: '$75–$350' },
      { id: 'e3', name: 'Calle Ocho Festival', date: '2026-03-08', time: '11:00:00', venue: 'Little Havana, SW 8th Street', category: 'Cultural', url: 'https://www.carnavalmiami.com', imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&q=80' },
    ],
    tokyo: [
      { id: 'e1', name: 'Sumida River Fireworks Festival', date: '2026-07-25', time: '19:00:00', venue: 'Sumida River, Asakusa', category: 'Festival', url: 'https://www.jnto.go.jp', imageUrl: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=400&q=80' },
      { id: 'e2', name: 'Tokyo Jazz Festival', date: '2026-09-05', time: '12:00:00', venue: 'NHK Hall, Shibuya', category: 'Music', url: 'https://www.tokyo-jazz.com', imageUrl: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=400&q=80' },
    ],
    barcelona: [
      { id: 'e1', name: 'Primavera Sound', date: '2026-05-28', time: '17:00:00', venue: 'Parc del Fòrum', category: 'Music', url: 'https://www.primaverasound.com', imageUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&q=80', priceRange: '€85–€295' },
      { id: 'e2', name: 'La Mercè Festival', date: '2026-09-24', time: '10:00:00', venue: 'Throughout Barcelona', category: 'Cultural', url: 'https://lamerce.barcelona', imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80' },
    ],
    paris: [
      { id: 'e1', name: 'Paris Fashion Week', date: '2026-09-28', time: '10:00:00', venue: 'Various Paris Venues', category: 'Fashion', url: 'https://www.fhcm.paris', imageUrl: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=400&q=80' },
      { id: 'e2', name: 'Nuit Blanche', date: '2026-10-03', time: '19:00:00', venue: 'Throughout Paris', category: 'Arts', url: 'https://quefaire.paris.fr', imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&q=80' },
    ],
    sydney: [
      { id: 'e1', name: 'Sydney Festival', date: '2026-01-08', time: '10:00:00', venue: 'Various Sydney Venues', category: 'Arts', url: 'https://www.sydneyfestival.org.au', imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80' },
      { id: 'e2', name: 'Vivid Sydney', date: '2026-05-22', time: '18:00:00', venue: 'Sydney CBD & Harbour', category: 'Festival', url: 'https://www.vividsydney.com', imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&q=80' },
    ],
  }

  return demos[city.toLowerCase()] || [
    { id: 'e1', name: 'International Food & Wine Festival', date: '2026-07-12', time: '12:00:00', venue: 'City Central Park', category: 'Food & Drink', url: '#', imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=80' },
    { id: 'e2', name: 'Summer Jazz Series', date: '2026-07-18', time: '20:00:00', venue: 'Riverside Amphitheater', category: 'Music', url: '#', imageUrl: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=400&q=80' },
    { id: 'e3', name: 'Night Market: Artisan Crafts', date: '2026-07-25', time: '17:00:00', venue: 'Historic District', category: 'Market', url: '#', imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&q=80' },
  ]
}
