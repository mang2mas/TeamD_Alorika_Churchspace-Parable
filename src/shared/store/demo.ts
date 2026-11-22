// One persisted store for the whole demo. Everything lives in localStorage so the demo
// survives a refresh; Settings → "Reset demo data" restores the seed.
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  createDiscipleship,
  type Disciple,
  type Nudge,
} from '@/features/daily-word/model/disciples'
import { computeStreak } from '@/features/daily-word/model/streak'
import { computeBadges } from '@/features/forum/model/badges'
import { AI_TAKEAWAYS, createFeed } from '@/features/forum/model/seedData'
import { createTasks, type Skill, type TechTask } from '@/features/forum/model/tasks'
import type { FeedItem, NewPost, Question } from '@/features/forum/model/types'
import {
  MY_CHURCH_ID,
  createOutreach,
  decideClaim,
  type Church,
  type Claim,
  type OutreachType,
  type PartnerRequest,
} from '@/features/outreach/model/outreach'
import {
  checkIn,
  createPrayer,
  markAnswered,
  promote,
  submitRequest,
  type NewPrayerRequest,
  type PrayerGroup,
  type PrayerRequest,
} from '@/features/prayer/model/prayer'
import { can, userById } from '@/shared/demo/users'
import { dayKey } from '@/shared/lib/dates'
import { toast } from './toast'

export interface DemoData {
  userId: string
  dataSaver: boolean
  feed: FeedItem[]
  tasks: TechTask[]
  ideaSeedOffset: number
  activity: Record<string, string[]>
  disciples: Disciple[]
  nudges: Nudge[]
  prayerGroups: PrayerGroup[]
  prayerRequests: PrayerRequest[]
  churches: Church[]
  partnerRequests: PartnerRequest[]
  claims: Claim[]
}

interface DemoActions {
  setUser: (id: string) => void
  setDataSaver: (on: boolean) => void
  resetDemo: () => void
  // Forum
  addQuestion: (post: NewPost) => void
  reply: (questionId: string, text: string) => void
  toggleHelpful: (id: string) => void
  report: (id: string) => void
  moderate: (id: string, keep: boolean) => void
  moreIdeas: () => void
  postTask: (input: { title: string; description: string; skills: Skill[]; dueOn?: string }) => void
  claimTask: (id: string) => void
  markTaskDone: (id: string) => void
  confirmTask: (id: string) => void
  // Daily Word
  logReading: () => void
  nudge: (discipleId: string, message: string) => void
  markReplied: (discipleId: string) => void
  // Prayer
  submitPrayer: (input: Omit<NewPrayerRequest, 'requesterId'>) => PrayerRequest
  prayFor: (id: string) => void
  checkInPrayer: (id: string, text: string) => void
  answerPrayer: (id: string, note: string) => void
  setCap: (groupId: string, cap: number) => void
  // Outreach
  requestPartner: (toChurchId: string, type: OutreachType, date: string, message: string) => void
  respondPartner: (id: string, accept: boolean) => void
  claimChurch: (
    churchId: string,
    input: { role: string; contact: string; evidence: string },
  ) => void
  decideClaim: (claimId: string, approve: boolean) => void
}

export type DemoState = DemoData & DemoActions

export function createSeed(now = Date.now()): DemoData {
  const discipleship = createDiscipleship(now)
  const prayer = createPrayer(now)
  const outreach = createOutreach(now)
  return {
    userId: 'u-jessa',
    dataSaver: false,
    feed: createFeed(now),
    tasks: createTasks(now),
    ideaSeedOffset: 0,
    activity: discipleship.activity,
    disciples: discipleship.disciples,
    nudges: discipleship.nudges,
    prayerGroups: prayer.groups,
    prayerRequests: prayer.requests,
    churches: outreach.churches,
    partnerRequests: outreach.partnerRequests,
    claims: outreach.claims,
  }
}

const uid = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`

const questionsOf = (feed: FeedItem[]) => feed.filter((i): i is Question => i.type === 'question')

const badgeIds = (userId: string, feed: FeedItem[], tasks: TechTask[]) =>
  new Set(computeBadges(userId, questionsOf(feed), tasks).map((b) => b.id))

function announceNewBadges(
  userId: string,
  before: Set<string>,
  feed: FeedItem[],
  tasks: TechTask[],
) {
  const earned = computeBadges(userId, questionsOf(feed), tasks).filter((b) => !before.has(b.id))
  const first = earned[0]
  if (first) toast(`🏅 ${userById(userId).name} earned the “${first.label}” badge`)
}

export const useDemo = create<DemoState>()(
  persist(
    (set, get) => ({
      ...createSeed(),

      setUser: (userId) => set({ userId }),
      setDataSaver: (dataSaver) => set({ dataSaver }),
      resetDemo: () => set(createSeed()),

      addQuestion: ({ title, body, topic, anonymous }) => {
        const user = userById(get().userId)
        const question: Question = {
          id: uid('q'),
          type: 'question',
          author: anonymous ? 'Anonymous Youth' : user.name,
          authorId: anonymous ? undefined : user.id,
          church: 'Calamba',
          status: 'unanswered',
          createdAt: new Date().toISOString(),
          title: title.trim(),
          body: body.trim(),
          topic,
          ai: AI_TAKEAWAYS[topic],
          helpful: 0,
          helped: false,
          comments: [],
          reports: [],
          hidden: false,
        }
        set((s) => ({ feed: [question, ...s.feed] }))
      },

      reply: (questionId, text) => {
        const { userId, feed, tasks } = get()
        const user = userById(userId)
        const byLeader = can.markAnswered(user.role)
        const before = badgeIds(userId, feed, tasks)
        const next = feed.map((x) =>
          x.id === questionId && x.type === 'question'
            ? {
                ...x,
                status: byLeader ? ('answered' as const) : x.status,
                comments: [
                  ...x.comments,
                  {
                    id: uid('c'),
                    author: user.name,
                    authorId: user.id,
                    byLeader,
                    text,
                    createdAt: new Date().toISOString(),
                  },
                ],
              }
            : x,
        )
        set({ feed: next })
        announceNewBadges(userId, before, next, tasks)
      },

      toggleHelpful: (id) =>
        set((s) => ({
          feed: s.feed.map((x) =>
            x.id === id && x.type === 'question'
              ? { ...x, helped: !x.helped, helpful: x.helpful + (x.helped ? -1 : 1) }
              : x,
          ),
        })),

      report: (id) =>
        set((s) => ({
          feed: s.feed.map((x) => {
            if (x.id !== id || x.type !== 'question' || x.reports.includes(s.userId)) return x
            const reports = [...x.reports, s.userId]
            return { ...x, reports, hidden: x.hidden || reports.length >= 3 }
          }),
        })),

      moderate: (id, keep) =>
        set((s) => ({
          feed: s.feed.map((x) =>
            x.id === id && x.type === 'question' ? { ...x, reports: [], hidden: !keep } : x,
          ),
        })),

      moreIdeas: () => set((s) => ({ ideaSeedOffset: s.ideaSeedOffset + 1 })),

      postTask: ({ title, description, skills, dueOn }) =>
        set((s) => ({
          tasks: [
            {
              id: uid('t'),
              church: userById(s.userId).church,
              title: title.trim(),
              description: description.trim(),
              skills,
              status: 'open',
              createdBy: s.userId,
              createdAt: new Date().toISOString(),
              dueOn,
            },
            ...s.tasks,
          ],
        })),

      claimTask: (id) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id && t.status === 'open'
              ? { ...t, status: 'claimed', claimedBy: s.userId }
              : t,
          ),
        })),

      markTaskDone: (id) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id && t.status === 'claimed' && t.claimedBy === s.userId
              ? { ...t, status: 'done' }
              : t,
          ),
        })),

      confirmTask: (id) => {
        const { tasks, feed } = get()
        const task = tasks.find((t) => t.id === id)
        if (!task || task.status !== 'done' || !task.claimedBy) return
        const before = badgeIds(task.claimedBy, feed, tasks)
        const next = tasks.map((t) => (t.id === id ? { ...t, status: 'confirmed' as const } : t))
        set({ tasks: next })
        announceNewBadges(task.claimedBy, before, feed, next)
      },

      logReading: () => {
        const { userId, activity } = get()
        const today = dayKey()
        const days = activity[userId] ?? []
        if (days.includes(today)) return
        const next = { ...activity, [userId]: [...days, today] }
        set({ activity: next })
        const { current } = computeStreak(next[userId] ?? [], today)
        toast(`🔥 ${current}-day streak! See you tomorrow.`)
      },

      nudge: (discipleId, message) => {
        const at = new Date().toISOString()
        set((s) => ({
          nudges: [{ id: uid('n'), discipleId, disciplerId: s.userId, message, at }, ...s.nudges],
          disciples: s.disciples.map((d) => (d.id === discipleId ? { ...d, lastNudgeAt: at } : d)),
        }))
      },

      markReplied: (discipleId) =>
        set((s) => ({
          disciples: s.disciples.map((d) =>
            d.id === discipleId ? { ...d, repliedAt: new Date().toISOString() } : d,
          ),
        })),

      submitPrayer: (input) => {
        const { prayerRequests, prayerGroups, userId } = get()
        const { requests, request } = submitRequest(
          prayerRequests,
          prayerGroups,
          { ...input, requesterId: userId },
          uid('pr'),
        )
        set({ prayerRequests: requests })
        return request
      },

      prayFor: (id) =>
        set((s) => ({
          prayerRequests: s.prayerRequests.map((r) =>
            r.id === id && !r.prayedBy.includes(s.userId)
              ? { ...r, prayedBy: [...r.prayedBy, s.userId] }
              : r,
          ),
        })),

      checkInPrayer: (id, text) =>
        set((s) => ({
          prayerRequests: checkIn(s.prayerRequests, id, userById(s.userId).name, text),
        })),

      answerPrayer: (id, note) =>
        set((s) => ({
          prayerRequests: markAnswered(
            s.prayerRequests,
            s.prayerGroups,
            id,
            userById(s.userId).name,
            note,
          ),
        })),

      setCap: (groupId, cap) =>
        set((s) => {
          const groups = s.prayerGroups.map((g) =>
            g.id === groupId ? { ...g, cap: Math.max(1, Math.min(20, cap)) } : g,
          )
          return {
            prayerGroups: groups,
            prayerRequests: promote(s.prayerRequests, groups, groupId),
          }
        }),

      requestPartner: (toChurchId, type, date, message) =>
        set((s) => ({
          partnerRequests: [
            {
              id: uid('pq'),
              fromChurchId: MY_CHURCH_ID,
              toChurchId,
              type,
              date,
              message,
              status: 'pending',
              createdAt: new Date().toISOString(),
            },
            ...s.partnerRequests,
          ],
        })),

      respondPartner: (id, accept) =>
        set((s) => ({
          partnerRequests: s.partnerRequests.map((p) =>
            p.id === id ? { ...p, status: accept ? 'accepted' : 'declined' } : p,
          ),
        })),

      claimChurch: (churchId, { role, contact, evidence }) =>
        set((s) => ({
          claims: [
            {
              id: uid('cl'),
              churchId,
              claimantId: s.userId,
              claimantName: userById(s.userId).name,
              role,
              contact,
              evidence,
              status: 'pending',
              createdAt: new Date().toISOString(),
            },
            ...s.claims,
          ],
          churches: s.churches.map((c) => (c.id === churchId ? { ...c, status: 'pending' } : c)),
        })),

      decideClaim: (claimId, approve) =>
        set((s) => decideClaim(s.churches, s.claims, claimId, approve)),
    }),
    { name: 'parable-demo', version: 1 },
  ),
)

export const useCurrentUser = () => userById(useDemo((s) => s.userId))
