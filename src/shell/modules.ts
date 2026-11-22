export const MODULES = ['Sanctuary', 'Mentorship', 'Outreach'] as const
export type Module = (typeof MODULES)[number]
