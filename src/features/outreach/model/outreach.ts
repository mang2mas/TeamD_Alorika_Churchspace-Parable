// Outreach Finder demo data. All churches are fictional so the demo doesn't imply any real
// church's endorsement.
import { DAY, HOUR, daysAgoKey, isoAgo } from '@/shared/lib/dates'

export const TOWNS = [
  'Calamba',
  'Santa Rosa',
  'Biñan',
  'San Pedro',
  'Cabuyao',
  'Los Baños',
  'San Pablo',
  'Sta. Cruz',
] as const
export type Town = (typeof TOWNS)[number]

export const SHARES = [
  'Venue',
  'Sound system',
  'Volunteers',
  'Food',
  'Transport',
  'Medical team',
] as const
export type Share = (typeof SHARES)[number]

export const OUTREACH_TYPES = [
  'Feeding program',
  'Medical mission',
  'Youth camp',
  'Clean-up drive',
  'VBS (kids)',
  'Relief operations',
] as const
export type OutreachType = (typeof OUTREACH_TYPES)[number]

export type ChurchStatus = 'unclaimed' | 'pending' | 'verified'

export interface Church {
  id: string
  name: string
  town: Town
  denomination: string
  size: 'Small (under 50)' | 'Medium (50–200)' | 'Large (200+)'
  about: string
  services: string
  shares: Share[]
  openTo: OutreachType[]
  status: ChurchStatus
}

export interface PartnerRequest {
  id: string
  fromChurchId: string
  toChurchId: string
  type: OutreachType
  date: string
  message: string
  status: 'pending' | 'accepted' | 'declined'
  createdAt: string
}

export interface Claim {
  id: string
  churchId: string
  claimantId: string
  claimantName: string
  role: string
  contact: string
  evidence: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
}

export const MY_CHURCH_ID = 'ch-grace'

export interface ChurchFilter {
  town: Town | 'All'
  share: Share | 'Any'
  openTo: OutreachType | 'Any'
  query: string
}

export function filterChurches(churches: Church[], f: ChurchFilter): Church[] {
  const q = f.query.trim().toLowerCase()
  return churches.filter(
    (c) =>
      (f.town === 'All' || c.town === f.town) &&
      (f.share === 'Any' || c.shares.includes(f.share)) &&
      (f.openTo === 'Any' || c.openTo.includes(f.openTo)) &&
      (!q || `${c.name} ${c.town} ${c.denomination}`.toLowerCase().includes(q)),
  )
}

/** Approving a claim verifies the church; rejecting puts it back to unclaimed. */
export function decideClaim(
  churches: Church[],
  claims: Claim[],
  claimId: string,
  approve: boolean,
): { churches: Church[]; claims: Claim[] } {
  const claim = claims.find((c) => c.id === claimId)
  if (!claim || claim.status !== 'pending') return { churches, claims }
  return {
    claims: claims.map((c) =>
      c.id === claimId ? { ...c, status: approve ? 'approved' : 'rejected' } : c,
    ),
    churches: churches.map((c) =>
      c.id === claim.churchId ? { ...c, status: approve ? 'verified' : 'unclaimed' } : c,
    ),
  }
}

export function createOutreach(now = Date.now()) {
  const church = (
    id: string,
    name: string,
    town: Town,
    denomination: string,
    size: Church['size'],
    status: ChurchStatus,
    shares: Share[],
    openTo: OutreachType[],
    about: string,
    services: string,
  ): Church => ({ id, name, town, denomination, size, status, shares, openTo, about, services })

  const churches: Church[] = [
    church(
      'ch-grace',
      'Grace Fellowship Calamba',
      'Calamba',
      'Evangelical',
      'Medium (50–200)',
      'verified',
      ['Venue', 'Sound system', 'Volunteers'],
      ['Feeding program', 'Youth camp', 'VBS (kids)'],
      'A young, growing church near the Calamba crossing with an active youth ministry.',
      'Sun 8:00 AM & 10:00 AM · Youth Night Sat 6:00 PM',
    ),
    church(
      'ch-living',
      'Living Water Church Santa Rosa',
      'Santa Rosa',
      'Baptist',
      'Large (200+)',
      'verified',
      ['Venue', 'Food', 'Transport', 'Volunteers'],
      ['Feeding program', 'Relief operations', 'Medical mission'],
      'Serves families around the Santa Rosa industrial area. Runs a weekly feeding program.',
      'Sun 9:00 AM · Wed prayer 7:00 PM',
    ),
    church(
      'ch-bethel',
      'Bethel Community Church Biñan',
      'Biñan',
      'Christian & Missionary Alliance',
      'Medium (50–200)',
      'verified',
      ['Volunteers', 'Medical team'],
      ['Medical mission', 'Clean-up drive'],
      'Has nurses and two doctors in the congregation; open to joint medical missions.',
      'Sun 8:30 AM',
    ),
    church(
      'ch-hope',
      'Hope Chapel San Pedro',
      'San Pedro',
      'Independent',
      'Small (under 50)',
      'unclaimed',
      ['Venue'],
      ['VBS (kids)', 'Feeding program'],
      'A small chapel near the San Pedro public market.',
      'Sun 9:00 AM',
    ),
    church(
      'ch-cornerstone',
      'Cornerstone Church Cabuyao',
      'Cabuyao',
      'Pentecostal',
      'Medium (50–200)',
      'verified',
      ['Sound system', 'Volunteers', 'Transport'],
      ['Youth camp', 'Clean-up drive', 'Relief operations'],
      'Known for its worship team and yearly youth camp in the Laguna highlands.',
      'Sun 10:00 AM · Fri youth 7:00 PM',
    ),
    church(
      'ch-lb',
      'Victory Hill Fellowship Los Baños',
      'Los Baños',
      'Evangelical',
      'Large (200+)',
      'verified',
      ['Venue', 'Volunteers', 'Food'],
      ['Youth camp', 'VBS (kids)', 'Medical mission'],
      'Campus ministry for UPLB students and a Sunday congregation of young families.',
      'Sun 9:00 AM & 4:00 PM',
    ),
    church(
      'ch-sanpablo',
      'Seven Lakes Bible Church San Pablo',
      'San Pablo',
      'Baptist',
      'Medium (50–200)',
      'unclaimed',
      ['Venue', 'Food'],
      ['Feeding program', 'Clean-up drive'],
      'Near Sampaloc Lake. Hosts a monthly lake clean-up with local schools.',
      'Sun 8:00 AM',
    ),
    church(
      'ch-stacruz',
      'River of Life Church Sta. Cruz',
      'Sta. Cruz',
      'Methodist',
      'Small (under 50)',
      'pending',
      ['Volunteers'],
      ['Relief operations', 'Feeding program'],
      'Helps families affected by flooding along the Santa Cruz river.',
      'Sun 9:30 AM',
    ),
    church(
      'ch-calamba2',
      'New Life Christian Center Calamba',
      'Calamba',
      'Pentecostal',
      'Large (200+)',
      'verified',
      ['Sound system', 'Transport', 'Food', 'Medical team'],
      ['Medical mission', 'Relief operations'],
      'Runs a mobile clinic with a van that visits barangays twice a month.',
      'Sun 8:00 AM, 10:30 AM, 5:00 PM',
    ),
    church(
      'ch-sr2',
      'Faith Harvest Church Santa Rosa',
      'Santa Rosa',
      'Independent',
      'Small (under 50)',
      'unclaimed',
      ['Volunteers'],
      ['VBS (kids)'],
      'A house church that meets in a subdivision clubhouse.',
      'Sun 3:00 PM',
    ),
    church(
      'ch-binan2',
      'Lighthouse Baptist Church Biñan',
      'Biñan',
      'Baptist',
      'Medium (50–200)',
      'verified',
      ['Venue', 'Food', 'Volunteers'],
      ['Feeding program', 'VBS (kids)', 'Youth camp'],
      'Has a covered court that can host up to 300 people for events.',
      'Sun 9:00 AM',
    ),
    church(
      'ch-cab2',
      'Grace Point Church Cabuyao',
      'Cabuyao',
      'Evangelical',
      'Small (under 50)',
      'unclaimed',
      ['Sound system'],
      ['Clean-up drive'],
      'A young church plant meeting in a rented hall.',
      'Sun 10:00 AM',
    ),
  ]

  const partnerRequests: PartnerRequest[] = [
    {
      id: 'pq1',
      fromChurchId: 'ch-living',
      toChurchId: MY_CHURCH_ID,
      type: 'Feeding program',
      date: daysAgoKey(-12, now),
      message:
        'We are planning a feeding program for 150 kids in Barangay Pulo. Could your youth help serve and lead games?',
      status: 'pending',
      createdAt: isoAgo(5 * HOUR, now),
    },
    {
      id: 'pq2',
      fromChurchId: 'ch-bethel',
      toChurchId: MY_CHURCH_ID,
      type: 'Medical mission',
      date: daysAgoKey(-20, now),
      message:
        'Our medical team can bring 2 doctors and 4 nurses. Could we use your venue for a free check-up day?',
      status: 'pending',
      createdAt: isoAgo(2 * DAY, now),
    },
    {
      id: 'pq3',
      fromChurchId: MY_CHURCH_ID,
      toChurchId: 'ch-cornerstone',
      type: 'Youth camp',
      date: daysAgoKey(-40, now),
      message:
        'Would you like to do a joint youth camp? We can bring 30 youth and our sound system.',
      status: 'accepted',
      createdAt: isoAgo(6 * DAY, now),
    },
  ]

  const claims: Claim[] = [
    {
      id: 'cl1',
      churchId: 'ch-stacruz',
      claimantId: 'p-ana',
      claimantName: 'Sis. Ana Reyes',
      role: 'Church secretary',
      contact: 'ana.reyes@example.com',
      evidence: 'Letter signed by Ptr. Jun Santos (letterhead).pdf',
      status: 'pending',
      createdAt: isoAgo(1 * DAY, now),
    },
  ]

  return { churches, partnerRequests, claims }
}
