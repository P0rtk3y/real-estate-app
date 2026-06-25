import Anthropic from '@anthropic-ai/sdk'
import { ScoutInsight, UserPreferences } from '@/lib/types'

const client = new Anthropic()

export async function fetchInsights(city: string, prefs: UserPreferences): Promise<ScoutInsight> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return getDemoInsights(city)

  const wantedFeatures = [
    prefs.naturalLight && 'natural light',
    prefs.highFloor && 'high floor',
    prefs.oceanView && 'ocean/water view',
    prefs.cityView && 'city view',
    prefs.mountainView && 'mountain view',
    prefs.modern && 'modern finishes',
    prefs.rooftop && 'rooftop access',
    prefs.gym && 'gym',
    prefs.pool && 'pool',
    prefs.balcony && 'balcony',
    prefs.petFriendly && 'pet-friendly',
  ].filter(Boolean).join(', ')

  const prompt = `You are Bao (🌸), a quirky, loveable Vietnamese real estate scout — imagine a Pixar character: big personality, huge heart, unstoppable enthusiasm. You grew up in Hội An, trained in Sài Gòn, and now you scout properties worldwide. You compare everything to somewhere in Việt Nam. You slip in occasional Vietnamese words/phrases naturally (always explained in context). You have STRONG opinions about natural light, good phở nearby, and feng shui. You're warm, funny, and genuinely brilliant at property analysis — think the love child of a travel writer, a property expert, and your enthusiastic Vietnamese auntie who wants only the best for you.

Write a scout report for someone looking for real estate in ${city}${wantedFeatures ? ` with preferences for: ${wantedFeatures}` : ''}.

Bao's personality markers:
- Occasional Vietnamese: "Ồ trời ơi!" (Oh heavens!), "Được quá!" (Perfect!), "Chà chà!" (Wow wow!), "đẹp lắm" (very beautiful), "ngon lành" (delicious/excellent)
- Always mentions food — specifically compares local cuisine to Vietnamese food somehow
- Has a signature move of comparing the city to somewhere in Việt Nam ("This neighborhood is very much like Hội An but with more pasta")
- Gives 100% but also gently teases you if you're making questionable property decisions
- Has very specific opinions about natural light ("ánh sáng ban mai — morning light — is non-negotiable, okay?")
- Ends with a punchy verdict that sounds like something Bao would say on a Vietnamese game show

Bao's scouting philosophy (apply this lens throughout the report):
- She hunts for AFFORDABLE value and "hidden gem" areas — up-and-coming, characterful neighborhoods over expensive trophy districts. She loves a good deal and is honest about where the money goes furthest.
- She steers people AWAY from tourist-trap zones toward authentic, local, less-crowded neighborhoods where you actually live like a local (and eat where locals eat).
- She prizes beautiful natural views — especially water (sea, lake, river, bay) and mountains/hills. When ${city} has them, she points out exactly which areas catch them and whether they're worth it.
- If ${city} is genuinely pricey or overrun by tourists, she says so plainly and points to the smarter, quieter, more affordable alternative nearby.

Return a JSON object with these exact keys:
{
  "culturalFlavor": "2-3 paragraphs of vibrant writing in Bao's voice — culturally-specific, funny, warm, with a Vietnamese perspective. She compares something about the city to Việt Nam. Be specific, evocative, and genuinely insightful about what it's like to LIVE in ${city}.",
  "tips": ["4 scout tips in Bao's voice — practical but with her personality. One should reference natural light or feng shui. One should mention food. Each begins with an emoji that Bao has chosen."],
  "bestNeighborhoods": ["3-4 neighborhoods each with a one-sentence reason in Bao's voice — she's enthusiastic and specific. Format: 'Neighborhood Name — reason'"],
  "verdict": "One punchy sentence in Bao's voice — the kind of thing she'd say dramatically while pointing at a map. Could be enthusiastic, gently cautionary, or perfectly observed.",
  "emoji": "The single most perfect emoji for ${city} as Bao would choose it",
  "localFood": "One sentence from Bao about the must-try local food — she usually compares it to something Vietnamese",
  "weatherNote": "One charming sentence from Bao about the weather and how it affects property decisions"
}

Only return valid JSON, no other text.`

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1200,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON in response')
    return JSON.parse(jsonMatch[0]) as ScoutInsight
  } catch (err) {
    console.error('Insights fetch failed:', err)
    return getDemoInsights(city)
  }
}

function getDemoInsights(city: string): ScoutInsight {
  const demos: Record<string, ScoutInsight> = {
    miami: {
      emoji: '🌴',
      culturalFlavor: `Ồ trời ơi! Miami arrived into Bao's life with the subtlety of a Vietnamese wedding — loud, colorful, absolutely everyone talking at once, and somehow more beautiful than you expected. This city doesn't ease you in. It drops a mojito in your hand and puts on bass drops before you've finished checking in. Bao compares Brickell to Quận 1 in Sài Gòn — the same towers, the same energy, the same beautiful chaos — except here the café below your apartment serves café con leche instead of cà phê sữa đá, and honestly? Both are excellent. The multicultural soul of Miami is real: Cuban abuelas and Venezuelan architects and Brazilian DJs all live within three blocks of each other, and somehow the food, the music, and the real estate all reflect this beautiful collision.\n\nThe golden rule of Miami real estate, according to Bao: follow the breeze. Bay-facing balconies catch trade winds that are worth more than granite countertops. East-facing units catch the sunrise over the Atlantic — đẹp lắm! — and west-facing catches the most dramatic daily light show since Bao watched the sun set over Hạ Long Bay. Properties within walking distance of the Underline (Miami's answer to Hà Nội's pedestrian street!) have quietly jumped in value.\n\nChà chà! One thing Bao must tell you: Miami floods. Not always, not everywhere, but "king tide" has become a real consideration. Upper floors and elevated buildings aren't just prestige — they're climate wisdom. The locals know this. Now you know too. Bao has done her job.`,
      tips: [
        '🌊 Always check floor elevation — properties above 8 feet command premium peace of mind in Miami. This is not optional advice, this is Bao speaking as your friend.',
        '☀️ Bay-facing balconies catch natural wind tunnels — ask building management about average utility bills. Natural ventilation in Miami = your AC bill goes down. Được quá!',
        '🍊 Wynwood listings near NW 2nd Avenue are the next Brickell — the coffee shops have arrived, the galleries are buzzing. Bao has scouted it. Trust her.',
        '🚗 Parking is non-negotiable in Miami. Confirm parking type (deeded vs. assigned) and EV charging policy. Bao speaks from experience. Painful experience.',
      ],
      bestNeighborhoods: [
        'Brickell — Miami\'s Quận 1: dense, walkable, full of the modern high-rises Bao loves',
        'Edgewater — the up-and-coming strip between Downtown and Wynwood with incredible waterfront condos at still-sane prices',
        'Coconut Grove — lush, bohemian, the only neighborhood where you can walk to brunch through actual trees (Bao approves)',
        'Surfside / Bal Harbour — quieter beach living with serious luxury and a neighborhood feeling that Bao finds very Đà Nẵng-ish',
      ],
      verdict: 'Miami is where the beach is your commute and sunset is the dress code — Bao says buy now before everyone else has Bao\'s same great idea!',
      localFood: 'A medianoche sandwich from a Little Havana ventanita at 2am is Miami\'s answer to bánh mì — same street energy, same perfect balance of flavors, same absolute necessity.',
      weatherNote: 'Miami\'s weather makes balconies not a luxury but a second living room for 9 months — and a hurricane shutter storage unit for the other 3, which Bao considers honest real estate disclosure.',
    },
    tokyo: {
      emoji: '🗼',
      culturalFlavor: `Chà chà! Tokyo is the only city that made Bao cry with happiness on a Tuesday morning — not because of a beautiful sunrise (though there was one), but because the train arrived at 7:42am EXACTLY ON TIME and Bao has trauma from Sài Gòn rush hour traffic. This city runs at a frequency entirely its own: 14 million people moving with the choreographed precision of a professional banh cuon roller, yet somehow the city feels intimate, gentle, almost quiet. The paradox of Tokyo is that it is simultaneously the biggest and most personal city Bao has ever scouted.\n\nReal estate here defies Western logic — and Bao, who grew up understanding that property in Việt Nam appreciates like bánh mì prices before Tết — had to completely rewire her brain. Properties in Tokyo depreciate with age. A 25-year-old building is considered old. Unlike Hà Nội, where your grandmother's French colonial house gains value every decade, here you're purchasing location, lifestyle, and the extraordinary urban machine beneath your feet. The train network is so good that Bao compares it to what she imagines Sài Gòn's future metro will be — except punctual, climate-controlled, and running at midnight.\n\nNeighborhoods have distinct personalities so sharp they feel like separate cities. Refined Azabu for diplomats (very Thảo Điền expat vibes). Creative Shimokitazawa for the vinyl record and specialty coffee crowd (imagine Tây Hồ, but colder and with better ramen). Family Jiyugaoka for French patisserie energy (Bao does not fully understand this but she respects it deeply). Always ask a building's seismic certification year — post-2000 engineering in Tokyo is world-class, and this genuinely matters.`,
      tips: [
        '🚇 Walk score in Tokyo is almost irrelevant — what matters is your nearest train station and how many lines serve it. Three lines = property gold according to Bao\'s very serious analysis.',
        '🏗️ Buildings built after 2000 have dramatically better seismic engineering. This genuinely matters. Bao is not being dramatic. She is being responsible.',
        '🌸 Ask about cherry blossom viewing access in spring — units facing parks become wildly competitive in April and Bao considers this a genuine quality-of-life metric, not sentimentality.',
        '☀️ Ánh sáng ban mai — morning light — is scarce in Tokyo\'s dense blocks. South-facing units here are rarer and worth premium. Bao\'s number one rule applies everywhere!',
      ],
      bestNeighborhoods: [
        'Minato-ku (Azabu/Hiroo) — the expat belt, polished and expensive, very much like Thảo Điền but with better infrastructure',
        'Shibuya-ku (Daikanyama/Nakameguro) — Tokyo\'s most stylish residential enclave. Bao compares it to a better-dressed Tây Hồ',
        'Minato-ku (Roppongi) — high-rise luxury with gallery culture and the most international dining scene Bao has encountered',
        'Setagaya-ku (Shimokitazawa) — bohemian, tree-lined, where Tokyo\'s creative class actually chooses to live. Đẹp lắm!',
      ],
      verdict: 'Tokyo is the only city where Bao accepted a smaller apartment without complaint — because the entire city is your living room, and what a living room it is, trời ơi!',
      localFood: 'A tamago sando from 7-Eleven at 7am will permanently recalibrate your understanding of what a convenience store can be — Bao compares the experience to discovering Vietnamese bánh mì for the first time, except colder.',
      weatherNote: 'Tokyo\'s rainy season (June-July) is real — units with balconies need excellent covered drainage, and Bao insists you ask about this before falling in love with the view.',
    },
    barcelona: {
      emoji: '🎨',
      culturalFlavor: `Được quá! Barcelona runs on a schedule that would appall a New Yorker and give Bao — who grew up eating phở at 6am and dinner at 7pm — complete spiritual peace. Lunch is at 2pm, dinner at 9:30pm, and the siesta is not ironic: it is infrastructure, wisdom, and frankly correct. Bao compares the city's energy to Hội An: the same gorgeous mix of old architecture and artistic soul, the same sense that the city itself is the most beautiful thing you will ever live inside, the same slightly anarchic relationship with schedules that somehow produces magic.\n\nThe city's genius is architectural. Gaudí's fingerprints are literally everywhere, but the Eixample grid — those famously chamfered corners that allow more light into intersections — creates interior courtyard apartments that Bao considers the greatest natural light innovation in European real estate. Bao has OPINIONS about natural light (you may have noticed) and Barcelona's south-facing Eixample apartments catch Mediterranean sun in ways that make her feel like she is back in Đà Nẵng in February.\n\nReal estate divides into two emotional registers: the romanticism of pre-war Modernista apartments (ornate plasterwork, herringbone parquet, marble fireplaces) versus the sleek new-builds in Poblenou's 22@ tech district. Bao loves both. She especially loves that the Superilles (superblock) project is turning car-choked streets into pedestrian plazas — properties near completed superblocks have seen measurable appreciation, and Bao has circled them in three different colors on her map. The sea is always within psychological reach even when you can't see it — you can feel the maritime air on every terrace, very much like standing on the balcony in Nha Trang but with better tapas.`,
      tips: [
        '☀️ South-facing apartments in Eixample get the famous Mediterranean light all day. This is Bao\'s rule number one, and it applies in Barcelona especially. Do not compromise on this!',
        '🏛️ Pre-war buildings are beautiful but check the ITE (building inspection certificate) closely — renovation assessments can be substantial. Bao learned this the hard way on behalf of a friend.',
        '🚲 The Bicing bike-share station density near a property is Bao\'s secret indicator of neighborhood livability. More docks = better infrastructure. Strange metric, 100% accurate.',
        '🥐 Barceloneta is charming but tourist-heavy. For authentic Barcelona life — the kind Bao actually envies — look at Poblenou, Sarrià, or Gràcia. Real neighbors, real community.',
      ],
      bestNeighborhoods: [
        'Eixample Esquerra — Barcelona daily life at its beautiful best, like a more stylish version of Quận 3 in Sài Gòn',
        'El Born/Sant Pere — medieval streets, world-class restaurants, bohemian cool. Bao says this is Barcelona\'s Hội An and she means it as a compliment',
        'Poblenou — the 22@ reborn: former factories as lofts, beach proximity, best new restaurants. Bao is very excited about this area',
        'Sarrià-Sant Gervasi — hilltop residential elegance with mountain views. Think Đà Lạt meets Barcelona. Lovely.',
      ],
      verdict: 'Barcelona is what happens when a city has 300 sunny days, Gaudí, and excellent tomato-rubbed bread — Bao\'s only question is why you haven\'t moved here already, chà chà!',
      localFood: 'Pan con tomate (pa amb tomàquet) — bread rubbed with fresh tomato and olive oil — is Catalonia\'s simplest genius and Bao compares it to a perfect bánh mì without the meat: fundamentally satisfying.',
      weatherNote: 'Barcelona\'s 300 sunny days make terraces absolutely mandatory — Bao refuses to show you an apartment without outdoor space here, this is non-negotiable and she will explain why at length.',
    },
    paris: {
      emoji: '🥐',
      culturalFlavor: `Ồ trời ơi, Paris! Bao cried the first time she saw the Seine at dusk and she is not embarrassed about this. This is a city that has been curated for approximately 2,000 years and it shows — every street corner, every boulangerie, every slightly exasperated waiter is performing in the most elaborate and beautiful production in human history. Bao compares Paris to Hà Nội in the best way: both cities have this quality of history pressing against daily life, of something ancient and important hiding just behind every door. Except Hà Nội has better street food (Bao is sorry but this is the truth).\n\nReal estate in Paris is simultaneously the most romantic and most stressful purchase Bao has ever witnessed. The Haussmannien apartments — those 19th-century buildings with their uniform facades, iron balconies, and herringbone parquet floors — are the most coveted properties Bao has ever scouted. Original moldings! Marble fireplaces that actually work! Ten-foot ceilings! And then you look at the maintenance charges and Bao has to sit down.\n\nThe arrondissements (city districts) have personalities as distinct as Bao's various aunties. The 16th is formal, conservative, very expensive, very Sài Gòn District 2. The Marais (3rd/4th) is fashionable and dense, like Hà Nội's Old Quarter but with better shoes. The 11th is creative and younger, like Tây Hồ but with less lake. Bao recommends arriving with clarity about which version of Paris you want to live in — they are genuinely different cities under one gorgeous municipal roof.`,
      tips: [
        '☀️ Paris apartments face interior courtyards OR the street — Bao strongly prefers street-facing for ánh sáng ban mai (morning light). Courtyard units can feel like beautiful caves.',
        '🏛️ Original Haussmannien features add genuine value — original parquet, moldings, and fireplaces are worth more than any renovation. Bao says: do not paint them, do not replace them.',
        '🚇 The Paris metro is Bao\'s dream of what Sài Gòn metro will one day be — proximity to multiple lines matters enormously for daily life quality and property value.',
        '🥐 Visit the street at 7am and at 10pm — the character of Paris changes dramatically. The charming café might be a nightclub at midnight. Bao speaks from experience.',
      ],
      bestNeighborhoods: [
        'Le Marais (3e/4e) — fashionable, historic, walkable. Bao compares it to Hội An\'s old town but with more galleries and better espresso',
        'Canal Saint-Martin (10e) — the creative, younger Paris that Bao finds most exciting right now. Like District 1 before it got expensive',
        'Montmartre (18e) — village-within-a-city with real bohemian soul. Bao finds the artists and the views very đẹp lắm',
        'Oberkampf/Bastille (11e) — young, vibrant, restaurant-dense. The neighborhood Bao would personally choose to live in. She has thought about this a lot.',
      ],
      verdict: 'Paris is where Bao realized she had been describing every other city as "nice for its version of Paris" — đó là lời khen cao nhất! That is the highest compliment!',
      localFood: 'The croissant at a neighborhood boulangerie at 8am is Bao\'s closest experience to the perfect bánh mì moment — flaky, warm, somehow simultaneously simple and technically impossible to make well.',
      weatherNote: 'Paris winters are grey and romantic in equal measure — balconies are for spring through fall, and Bao says the size of the apartment\'s radiators is more important than the balcony in November.',
    },
    sydney: {
      emoji: '🦘',
      culturalFlavor: `Chà chà! Sydney made Bao immediately phone her mẹ to say "Má ơi, tôi tìm thấy Đà Nẵng but richer and with kangaroos." The harbour, the beaches, the way every neighborhood tilts slightly toward the water — it has the same coastal generosity of spirit as the Vietnamese coast but with approximately six times the income and a very different approach to queuing. Australians, Bao has observed, are extremely good at outdoor living and extremely relaxed about most other things. This is admirable.\n\nSydney real estate is famously expensive — and Bao, who tracks prices in cities across four continents, confirms that yes, this is not your imagination. But here's what the price buys: a lifestyle so outdoor-focused that the apartment itself becomes secondary to the harbour-view terrace, the beach proximity, or the morning run through Centennial Park. Bao compares this to the Vietnamese mentality of spending more on the meal than the restaurant — the experience, not the container.\n\nThe city divides clearly: the Eastern Suburbs (Bondi, Paddington, Randwick) are expensive, beachy, and extremely desirable. The Inner West (Newtown, Glebe) is creative, multicultural, and what Bao considers Sydney's soul — very much like Sài Gòn's District 3 if District 3 had better coffee and more Vietnamese restaurants (which she considers the highest possible praise). The North Shore is leafy, family-oriented, and premium. The CBD towers are spectacular but impersonal. Bao knows which one she would choose. She is still thinking about it.`,
      tips: [
        '🌊 Ocean views add genuine, measurable value to Sydney property — but check the sightline\'s permanence. Bao has seen lovely views blocked by a new tower. Ask about development approvals nearby.',
        '☀️ North-facing apartments in Sydney get the best sun (remember: Southern Hemisphere!). This is the one thing Bao had to completely rewire her brain about. North = morning light here!',
        '🚢 Ferry access is worth more than a car parking space in Sydney. The harbour ferries are fast, beautiful, and the commute of Bao\'s actual dreams.',
        '🦘 Check your suburb\'s flood zone history and fire risk zone — climate factors affect insurance and resale in ways that are not always obvious. Bao always checks. Always.',
      ],
      bestNeighborhoods: [
        'Milsons Point / McMahons Point — harbour views with Opera House and bridge panoramas. Bao calls this the Quận 1 penthouse of Sydney',
        'Bondi / Bronte — iconic beach lifestyle. Bao compares the morning surf crowd energy to Đà Nẵng beach at 6am, but more expensive',
        'Newtown / Glebe (Inner West) — creative, multicultural, restaurant-dense. Bao\'s personal favorite Sydney neighborhood. Very good Vietnamese food here too!',
        'Balmain — historic, waterfront, village-feel. Like Hội An but with better brunch. Bao means this as the highest compliment.',
      ],
      verdict: 'Sydney is where Bao realized the Australians figured out something the rest of us are still working on — that the good life is mostly just being close to water and not taking things too seriously, ồ trời ơi!',
      localFood: 'A flat white and smashed avocado toast at a Sydney café at 9am is either Australia\'s greatest cultural contribution or an expensive way to eat breakfast — Bao enjoyed both interpretations tremendously.',
      weatherNote: 'Sydney\'s year-round warmth makes outdoor space non-optional — Bao refuses to recommend a property without a balcony, terrace, or garden access here, and she has told this to everyone who asked.',
    },
    'new york': {
      emoji: '🗽',
      culturalFlavor: `Được quá! New York City is the first city that made Bao feel like she was back in Sài Gòn — not because of the similarity, but because of the INTENSITY. The density, the noise, the absolute refusal to stop, the sense that something important is happening around every corner. Bao cried a little on the Manhattan Bridge at sunrise and she is absolutely not embarrassed about this. She was looking at the skyline and thinking about her grandmother who told her: "Go see the world, Bao. But come back for phở."\n\nNew York real estate is its own language and Bao has become fluent in it the hard way. The co-op vs. condo distinction alone took Bao three weeks to fully understand — a co-op means the building's corporation must approve your purchase, which can take months and involves a level of scrutiny that Bao finds simultaneously intrusive and oddly Vietnamese (her building committee back home had many opinions about everything). Condos are simpler, more international, and significantly more expensive for it.\n\nThe neighborhoods are chapters in a never-ending story. Manhattan is the famous chapter everyone knows. Brooklyn (Dumbo! Park Slope! Bed-Stuy!) is where Bao thinks the best real estate value and community spirit currently live — she compares Dumbo to what she imagines the most creative neighborhood in Sài Gòn feels like at its best, with the Manhattan Bridge as a visual bonus nobody in Việt Nam has. Queens is the most internationally diverse borough on earth — Bao has eaten Vietnamese, Korean, Colombian, Greek, and Moroccan food within 10 blocks of Jackson Heights and felt completely at home.`,
      tips: [
        '☀️ Southern exposure is scarce in Manhattan\'s dense canyon streets — pay significant premium for confirmed southern exposure and document which windows it affects. Bao\'s rule one applies most urgently here.',
        '🏗️ Research planned developments within 500 meters — one new tower can permanently transform your light and view. NYC planning department records are public. Bao always checks.',
        '🚇 Subway proximity matters more than square footage in Bao\'s analysis of NYC livability. A small apartment near four lines beats a large apartment near nothing.',
        '🥟 The neighborhood food diversity is a genuine quality of life metric. Queens has the best international food in America — Bao has tested this claim personally and extensively.',
      ],
      bestNeighborhoods: [
        'Dumbo, Brooklyn — Manhattan views, cobblestone streets, creative energy. Bao compares it to a more photogenic version of Hà Nội\'s Long Biên area',
        'Upper West Side, Manhattan — intellectual, cultural, Central Park access. Very đẹp. Bao finds it like a calmer version of Hà Nội\'s Ba Đình',
        'Astoria, Queens — multicultural, excellent food, undervalued, and the NYC that Bao personally finds most alive',
        'Park Slope, Brooklyn — brownstones, Prospect Park, genuinely lovely neighborhood. Bao calls it the Tây Hồ of Brooklyn.',
      ],
      verdict: 'New York is the city that made Bao understand why people choose to live somewhere difficult — because the difficulty is part of the beauty, trời ơi, it really is!',
      localFood: 'A NYC dollar slice of pizza at midnight after a concert is Bao\'s closest American experience to a bánh mì from a street cart — hot, cheap, essential, available everywhere, and somehow both simple and perfect.',
      weatherNote: 'NYC winters are genuinely brutal and Bao says this sincerely: building heat quality, window insulation, and southern exposure become life-or-death quality factors in January. Check the heating system.',
    },
    default: {
      emoji: '🌸',
      culturalFlavor: `Chào bạn! Bao has arrived in this city with her notebook, her strong opinions about natural light, and an open mind. Every city Bao scouts carries its own heartbeat — and her job (she takes it very seriously, like a phở chef takes their broth) is to read that heartbeat for you.\n\nThe neighborhoods that excite Bao the most are always the transitional ones: where the independent coffee shops have just arrived but the prices haven't caught up yet. These zones consistently offer the best combination of character, community, and upside. Bao has spotted them in every city she has ever scouted and she is very proud of this track record.\n\nLan's philosophy: cultural fit matters as much as square footage. A stunning apartment in a neighborhood that doesn't match your lifestyle will wear on you within months. Bao always asks: what will it feel like to walk out your door on a Tuesday morning? If the answer is "phở-like satisfaction" — warm, rich, exactly right — then you have found the one. Được quá!`,
      tips: [
        '☀️ Ánh sáng ban mai — morning light — is Bao\'s number one property criterion everywhere in the world. South/East facing windows. Non-negotiable. She has said this to everyone who will listen.',
        '🚌 Visit the neighborhood at rush hour and on a Sunday morning. Two completely different cities. Both important. Bao has learned this the hard way.',
        '🏗️ Research planned developments within 500 meters before falling in love with a view. One new tower can ruin everything. Bao speaks from experience. Very emotional experience.',
        '🍜 Find the market the locals actually use — not the tourist one. Let the seasonal produce and the food stalls tell you something true about where you might be living. This is Bao\'s secret research method.',
      ],
      bestNeighborhoods: [
        'The historic center — character, walkability, and the irreplaceable sense of living inside the city\'s story. Bao always feels most at home here',
        'The emerging arts district — creative energy and properties still priced for the moment. Bao\'s favorite kind of neighborhood to discover',
        'The waterfront precinct — water access consistently justifies premium and Bao feels this in her soul as a coastal Vietnamese person',
        'The residential hills — views that no future development can take away. Bao\'s backup plan for everywhere she scouts',
      ],
      verdict: 'Bao has scouted this city with her full heart and sharp eyes — now you have all her wisdom, đó là lời chúc tốt lành! (That is her gift to you!)',
      localFood: 'Find the local street food that people eat standing up — that\'s always where Bao finds the real soul of a city, and the best comparison to her morning bánh mì.',
      weatherNote: 'Understanding the seasons before you commit is essential — Bao always asks: can I have breakfast on a balcony here for at least six months of the year? If yes: proceed. If no: proceed with caution.',
    },
  }

  return demos[city.toLowerCase()] || demos['default']
}
