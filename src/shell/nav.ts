import { BookOpen, HandHeart, MapPin, MessageCircle, User, type LucideIcon } from 'lucide-react'

export interface AppLink {
  to: string
  label: string
  icon: LucideIcon
}

export const APPS: AppLink[] = [
  { to: '/forum', label: 'Forum', icon: MessageCircle },
  { to: '/daily', label: 'Daily Word', icon: BookOpen },
  { to: '/prayer', label: 'Prayer', icon: HandHeart },
  { to: '/outreach', label: 'Outreach', icon: MapPin },
]

export const ME: AppLink = { to: '/me', label: 'Me', icon: User }
