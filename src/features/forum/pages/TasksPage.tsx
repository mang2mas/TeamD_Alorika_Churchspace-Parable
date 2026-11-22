import { useState } from 'react'
import { Award, Building2, CalendarDays, Plus, Wrench } from 'lucide-react'
import { can, userById } from '@/shared/demo/users'
import { formatDate } from '@/shared/lib/dates'
import { useCurrentUser, useDemo } from '@/shared/store/demo'
import { toast } from '@/shared/store/toast'
import { DemoNote, EmptyState, Modal, Page, PageHeader } from '@/shared/ui'
import { btn, card, chip, field, tag } from '@/shared/ui/styles'
import { SKILL_LEVELS } from '../model/badges'
import { SKILLS, SKILL_LABEL, STATUS_LABEL, type Skill, type TechTask } from '../model/tasks'

type View = 'open' | 'mine' | 'all'

const statusTag = (t: TechTask) =>
  t.status === 'open' ? tag.green : t.status === 'confirmed' ? tag.neutral : tag.amber

export default function TasksPage() {
  const user = useCurrentUser()
  const tasks = useDemo((s) => s.tasks)
  const { claimTask, markTaskDone, confirmTask } = useDemo.getState()
  const [view, setView] = useState<View>('open')
  const [posting, setPosting] = useState(false)

  const shown = tasks.filter((t) =>
    view === 'open'
      ? t.status === 'open'
      : view === 'mine'
        ? t.claimedBy === user.id || t.createdBy === user.id
        : true,
  )
  const awaiting = tasks.filter((t) => t.status === 'done').length

  return (
    <Page>
      <PageHeader
        title="Church tech tasks"
        subtitle="Churches post tech jobs. Students with the skills claim them, and earn skill badges when the church confirms the work."
        action={
          can.postTask(user.role) && (
            <button className={btn.primary} onClick={() => setPosting(true)}>
              <Plus size={16} /> Post a task
            </button>
          )
        }
      />
      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-5">
        {(
          [
            ['open', 'Open tasks'],
            ['mine', 'My tasks'],
            ['all', 'All'],
          ] as const
        ).map(([v, label]) => (
          <button
            key={v}
            className={chip(view === v)}
            onClick={() => setView(v)}
            aria-pressed={view === v}
          >
            {label}
          </button>
        ))}
      </div>
      {can.confirmTask(user.role) && awaiting > 0 && (
        <p className="mb-4 rounded-xl bg-amber/10 border border-amber/40 px-4 py-2.5 text-sm text-warn">
          {awaiting} task{awaiting === 1 ? ' is' : 's are'} waiting for your confirmation.
        </p>
      )}
      <div className="grid gap-5 md:grid-cols-2">
        {shown.map((t) => (
          <article key={t.id} className={`${card} p-6 flex flex-col gap-3`}>
            <div className="flex items-center justify-between gap-2 text-xs text-sage">
              <span className="flex items-center gap-1.5">
                <Building2 size={13} /> {t.church}
              </span>
              <span className={statusTag(t)}>{STATUS_LABEL[t.status]}</span>
            </div>
            <h2 className="font-serif text-xl font-semibold text-fg leading-snug">{t.title}</h2>
            <p className="text-sm text-fg/70">{t.description}</p>
            <div className="flex flex-wrap gap-1.5">
              {t.skills.map((s) => (
                <span key={s} className={tag.neutral}>
                  <Wrench size={11} className="inline mr-1" />
                  {SKILL_LABEL[s]}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs text-sage">
              <span className="flex items-center gap-1.5">
                {t.dueOn && (
                  <>
                    <CalendarDays size={13} /> Due {formatDate(t.dueOn)}
                  </>
                )}
                {t.claimedBy && <> · Claimed by {userById(t.claimedBy).name}</>}
              </span>
              <TaskAction
                task={t}
                onClaim={() => {
                  claimTask(t.id)
                  toast('Task claimed. The church admin can see you are on it.')
                }}
                onDone={() => {
                  markTaskDone(t.id)
                  toast('Marked as done. Waiting for the church admin to confirm.')
                }}
                onConfirm={() => confirmTask(t.id)}
              />
            </div>
          </article>
        ))}
      </div>
      {!shown.length && <EmptyState title="No tasks here" body="Try another view." />}
      <div className={`${card} mt-6 p-5`}>
        <h2 className="font-serif text-lg text-fg flex items-center gap-2">
          <Award size={18} className="text-warn" /> How skill badges work
        </h2>
        <p className="text-sm text-sage mt-1">
          A skill badge (Designer, Videographer, Social Media Helper…) unlocks after{' '}
          {SKILL_LEVELS[1]} confirmed task with that skill, and level II after {SKILL_LEVELS[2]}.
          Topic badges (Encourager) come from replying to 3 questions in one topic on the Freedom
          Wall. Badges show on your profile and on named posts, never on anonymous ones.
        </p>
      </div>
      <div className="mt-4">
        <DemoNote>
          Try it: as Jessa, mark “Instagram story templates” done, then switch to Ptr. Daniel and
          confirm it. Jessa earns the Designer badge.
        </DemoNote>
      </div>
      {posting && <PostTaskModal onClose={() => setPosting(false)} />}
    </Page>
  )
}

function TaskAction({
  task,
  onClaim,
  onDone,
  onConfirm,
}: {
  task: TechTask
  onClaim: () => void
  onDone: () => void
  onConfirm: () => void
}) {
  const user = useCurrentUser()
  if (task.status === 'open' && can.claimTask(user.role))
    return (
      <button className={btn.primary} onClick={onClaim}>
        Claim task
      </button>
    )
  if (task.status === 'claimed' && task.claimedBy === user.id)
    return (
      <button className={btn.primary} onClick={onDone}>
        Mark as done
      </button>
    )
  if (task.status === 'done' && can.confirmTask(user.role))
    return (
      <button className={btn.primary} onClick={onConfirm}>
        Confirm completed
      </button>
    )
  return null
}

function PostTaskModal({ onClose }: { onClose: () => void }) {
  const postTask = useDemo((s) => s.postTask)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [skills, setSkills] = useState<Skill[]>([])
  const [dueOn, setDueOn] = useState('')
  const toggle = (s: Skill) =>
    setSkills((xs) => (xs.includes(s) ? xs.filter((x) => x !== s) : [...xs, s]))
  const ok = title.trim() && description.trim() && skills.length > 0

  return (
    <Modal title="Post a tech task" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <label className="text-sm">
          What do you need?
          <input
            className={`${field} mt-1`}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Design a poster for our outreach"
          />
        </label>
        <label className="text-sm">
          Details
          <textarea
            rows={3}
            className={`${field} mt-1 resize-none`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Size, deadline, tools, who to contact..."
          />
        </label>
        <fieldset className="text-sm">
          <legend>Skills needed</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {SKILLS.map((s) => (
              <button
                key={s}
                type="button"
                className={chip(skills.includes(s))}
                aria-pressed={skills.includes(s)}
                onClick={() => toggle(s)}
              >
                {SKILL_LABEL[s]}
              </button>
            ))}
          </div>
        </fieldset>
        <label className="text-sm">
          Due date (optional)
          <input
            type="date"
            className={`${field} mt-1`}
            value={dueOn}
            onChange={(e) => setDueOn(e.target.value)}
          />
        </label>
        <button
          className={btn.primary}
          disabled={!ok}
          onClick={() => {
            postTask({ title, description, skills, dueOn: dueOn || undefined })
            toast('Task posted. Students with these skills can claim it.')
            onClose()
          }}
        >
          Post task
        </button>
      </div>
    </Modal>
  )
}
