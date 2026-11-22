import { DAY, HOUR, daysAgoKey, isoAgo } from '@/shared/lib/dates'

export const SKILLS = ['design', 'video', 'social', 'web', 'sound'] as const
export type Skill = (typeof SKILLS)[number]

export const SKILL_LABEL: Record<Skill, string> = {
  design: 'Design',
  video: 'Video',
  social: 'Social media',
  web: 'Web',
  sound: 'Sound & stream',
}

export type TaskStatus = 'open' | 'claimed' | 'done' | 'confirmed'

export interface TechTask {
  id: string
  church: string
  title: string
  description: string
  skills: Skill[]
  status: TaskStatus
  createdBy: string
  claimedBy?: string
  createdAt: string
  dueOn?: string
}

export const STATUS_LABEL: Record<TaskStatus, string> = {
  open: 'Open',
  claimed: 'Claimed',
  done: 'Waiting for confirmation',
  confirmed: 'Completed',
}

export function createTasks(now = Date.now()): TechTask[] {
  return [
    {
      id: 't1',
      church: 'Grace Fellowship Calamba',
      title: 'Design a poster for Youth Night',
      description:
        'One square post and one story for our Youth Night on Saturday, 6 PM. Theme: "Known". Church colors are green and cream.',
      skills: ['design'],
      status: 'open',
      createdBy: 'u-daniel',
      createdAt: isoAgo(6 * HOUR, now),
      dueOn: daysAgoKey(-5, now),
    },
    {
      id: 't2',
      church: 'Living Water Church Santa Rosa',
      title: 'Help set up a simple livestream for Sunday service',
      description:
        'We have a laptop and a phone tripod. We need someone to set up OBS and teach two volunteers how to run it.',
      skills: ['video', 'sound'],
      status: 'open',
      createdBy: 'u-daniel',
      createdAt: isoAgo(1 * DAY, now),
      dueOn: daysAgoKey(-9, now),
    },
    {
      id: 't3',
      church: 'Grace Fellowship Calamba',
      title: 'Make 3 Instagram story templates for Advent',
      description:
        'Reusable templates for weekly Advent verses. Canva is fine. Hand over the editable link when done.',
      skills: ['design', 'social'],
      status: 'claimed',
      createdBy: 'u-daniel',
      claimedBy: 'u-jessa',
      createdAt: isoAgo(3 * DAY, now),
      dueOn: daysAgoKey(-3, now),
    },
    {
      id: 't4',
      church: 'Bethel Community Church Biñan',
      title: 'Update our Facebook page: service times and map pin',
      description:
        'Our page still shows the old schedule. Add the new 8 AM and 10 AM services and fix the location pin.',
      skills: ['social', 'web'],
      status: 'open',
      createdBy: 'u-daniel',
      createdAt: isoAgo(2 * DAY, now),
    },
    {
      id: 't5',
      church: 'Grace Fellowship Calamba',
      title: 'Edit a 60-second Sunday highlight reel',
      description: 'Raw clips are in the shared drive. Add captions so it works without sound.',
      skills: ['video'],
      status: 'done',
      createdBy: 'u-daniel',
      claimedBy: 'u-migs',
      createdAt: isoAgo(5 * DAY, now),
    },
    ...[1, 2, 3].map((n): TechTask => ({
      id: `t-old-${n}`,
      church: 'Grace Fellowship Calamba',
      title: `Weekly sermon clip #${n}`,
      description: 'Cut a short clip from the Sunday message.',
      skills: ['video'],
      status: 'confirmed',
      createdBy: 'u-daniel',
      claimedBy: 'u-migs',
      createdAt: isoAgo((20 + n * 7) * DAY, now),
    })),
  ]
}
