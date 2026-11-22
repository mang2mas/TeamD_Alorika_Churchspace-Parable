# ChurchSpace: Safety, Privacy and Product Constraints

**Status:** Step 3. Team decisions recorded on 2026-11-22 (limited mode for unconfirmed minors, crisis on-call); awaiting final review. Builds on [ARCHITECTURE.md](ARCHITECTURE.md).

Items marked ⚖️ need review by a lawyer or Data Protection Officer before launch. Nothing here is legal advice.

---

## 1. Safety and moderation

### 1.1 Roles involved
| Role | Scope | Who | Requirements |
|---|---|---|---|
| **Safeguarding lead** (new church role) | One church | Named by the church admin, ideally 2 per church | 18+, multi-factor authentication (MFA) on, has completed our short safeguarding guide |
| **Church moderator** | Content routed to one church | Named by the church admin | 18+, MFA on |
| **Platform moderator** | All content | Core team volunteers | 18+, MFA on, vetted by the team |
| **Platform admin** | Everything, plus church verification | Core team, at most 3 people | MFA on |

- **MFA is enforced in the database.** Moderator actions only work when the user's session token shows MFA (`auth.jwt()->>'aal' = 'aal2'` in RLS and function checks).
- **This adds one value to the architecture.** `church_roles.role` gains `safeguarding_lead`.

### 1.2 What every piece of user text goes through
This applies to questions, answers, prayer requests, prayer updates, tech tasks and partner requests. Everything runs inside one shared Edge Function module, `_shared/moderation.ts`.

1. **Validate** with Zod. Length limits:

   | Field | Max characters |
   |---|---|
   | Title | 120 |
   | Body | 2,000 |
   | Answer or update | 2,000 |

2. **Rate limit.** Accounts younger than 24 hours get half these limits.

   | Action | Limit |
   |---|---|
   | Questions | 3 per day |
   | Answers | 20 per day |
   | Prayer requests | 3 per day |
   | Reports | 20 per day |
   | AI generations | 10 per day |

3. **Local filter (no network call):**
   - **Wordlist:** English plus Tagalog/Taglish, reviewed by local youth leaders. Mild profanity is masked; slurs and sexual terms hold the post.
   - **Contact-detail detector:** phone numbers, emails, social handles and street addresses hold the post. This protects youth from doxxing themselves or others and blocks spam.
4. **AI classifier.** A Claude call with structured output returns a category (`ok | spam | harassment | sexual | violence_threat | self_harm | abuse_disclosure`) and a severity from 0 to 3.
5. **Decision:**

   | Result | Action |
   |---|---|
   | ok | Publish |
   | Filter hit, spam, harassment, or severity ≥ 2 on anything | **Hold** for review |
   | `self_harm` or `abuse_disclosure` | **Crisis** flow |

6. **If the classifier fails** (timeout or error): **anonymous posts and posts from minors are held**. Other posts are published and queued for a background re-check.

### 1.3 Crisis flow
**1. The asker sees help at once,** on the same screen right after submitting:
- A calm, full-screen support card.
- Philippine crisis hotlines with tap-to-call buttons: NCMH Crisis Hotline **1553**, plus the mobile numbers. ⚖️ All numbers must be verified before launch and re-checked every quarter.
- "Talk to a leader now (optional)." The asker can **choose** to share their name with their church's safeguarding lead. Revealing themselves is always the asker's own act, which keeps the "no one ever" anonymity rule intact.

**2. The post stays out of the public feed.** Only the asker (through their device token), safeguarding leads and platform moderators can see it.

**3. Leaders are alerted:**
- Safeguarding leads of the routed church get a push and an email immediately. With no routed church, the platform on-call gets them.
- **During the pilot, the platform on-call is a rotation of 2–3 core team members** with MFA on and trained with the safeguarding guide (team decision).
- Quiet hours never apply to crisis alerts.

**4. Escalation and response:**
- **Escalation:** if no one acknowledges within **2 hours** (7am–10pm) or by 8am overnight, it escalates to all platform moderators.
- **Response:** the leader replies in the thread. The reply is visible only to the asker's token and to moderators.

**Logged:** every step goes to `audit_log`.

⚖️ **Abuse disclosures involving minors:** what are a church's and the platform's legal reporting duties under Philippine child-protection law (for example RA 7610), given that we can't identify an anonymous asker?

### 1.4 Reports
- **Who can report:** any signed-in user can report a question, answer, profile, prayer request, task or partner request. Reasons: spam, harassment, inappropriate, misinformation, "someone may be in danger" (goes straight to the crisis queue), other.
- **Auto-hide:** **3 reports from different accounts** hide the item until a moderator reviews it.
- **Reporter privacy:** moderators can see who reported; the reported user can't.

### 1.5 Review queue (`/mod`)
- **Tabs:** Crisis, Held, Reported, and Appeals. Each item shows content, reason, classifier output and history.
- **Actions:**
  - Approve, redact (for example remove a phone number), or remove.
  - Warn, suspend for 24 hours or 7 days, or ban. These apply only to non-anonymous authors.
  - Bans require a platform moderator.
- **Every action records** a reason and an `audit_log` entry.
- **Author notice:** removed content shows a notice to the author, delivered through the device token for anonymous posts. Authors get one appeal.
- **Volume targets:**

  | Queue | Cleared within |
  |---|---|
  | Held | 12 hours |
  | Reported | 24 hours |

### 1.6 Product rules that reduce risk
- **No direct messages in v1.** All conversation happens in public, moderated threads. This removes the main channel for adults grooming minors.
- **Minors are protected by default:**
  - Profiles of users aged 13–17 are hidden from search.
  - Anonymous posting is on by default for them.
  - Their streaks and badges aren't shown publicly.
- **Anonymous posts carry no identifying signals:** no badges, no streak, no church name, and only coarse time ("today").
- **Badges never reward volume of answers to minors.** Badges reward accepted leader answers and completed tasks, not raw reply counts. This avoids pressure to farm replies.

---

## 2. Privacy (RA 10173, the Data Privacy Act)

### 2.1 Why this is serious for us
**Religious affiliation is *sensitive personal information* under the Act**, and every user of this app reveals it. Prayer requests often hold health and family details, which are also sensitive. Processing sensitive personal information needs **explicit, specific consent** for each purpose.

⚖️ **Confirm whether we must:**
- Register with the National Privacy Commission (NPC).
- Appoint a Data Protection Officer (DPO). Planned regardless: name one team member as DPO.
- Run a Privacy Impact Assessment (planned before the pilot).

### 2.2 Data we collect (and nothing else)
| Data | Why | Who sees it | Kept for |
|---|---|---|---|
| Email | Login | The user; the system | While the account exists |
| Display name (a nickname is allowed) | Shown on non-anonymous posts | Signed-in users | While the account exists |
| Birth year and month | Age gate, minor protections, the 18th-birthday switch | System only; the UI shows only an age group | While the account exists |
| Town (optional) | Local matching | The user and their church admins | While the account exists |
| Church membership and roles | Group features | Members of that church | While the account exists |
| Guardian email (users 13–17) | Consent confirmation | System only | Until the user turns 18, plus 1 year |
| Prayer requests and updates | The feature itself | Per visibility setting | **Purged 90 days after closing** |
| Reviews and activity days | Streaks, discipler dashboard | The user and their assigned discipler | While the account exists |
| Moderation and crisis records | Safety | Moderators | 1 year after resolution ⚖️ |
| Audit log | Accountability | Platform admins | 1 year ⚖️ |
| Church-claim evidence | Verification | Platform admins | **Deleted 30 days after the decision** |
| Rate-limit counters | Abuse prevention | System only | 1 day |

We don't collect: phone number, full birthdate, exact location, contacts, or analytics that identify individuals. Analytics come later as privacy-preserving, aggregate counts only.

### 2.3 Consent
- **Privacy notice:** layered (a short summary, then the full text), written in **English and Filipino**, with versions. Accepting a new version is required before continuing.
- **Separate consents, stored in `consents`:**

  | Consent | Status |
  |---|---|
  | Account terms | Required |
  | Processing of religious affiliation | Required for church features |
  | Notifications | Optional |
  | AI processing disclosure (text goes to Anthropic for moderation and card generation) | Shown, not optional, because moderation depends on it |

- **Withdrawing a consent** is possible in Settings. The app explains what stops working.

### 2.4 Minors (13–17)
- **Age gate:** under 13 is blocked; ages 13–17 enter the guardian flow.
- **Guardian flow:**
  1. The teen enters a guardian email.
  2. The guardian gets a plain-language explanation and a confirmation link.
  3. The confirmation is recorded with a timestamp.
- **While waiting for confirmation:** the account works in **limited mode** (team decision): Daily Word (private flashcards and streaks) and reading the forum. No posting, no joining groups, no prayer requests.
- **At 18:** minor protections lift automatically, and the user is told.
- ⚖️ Is an emailed guardian confirmation enough? How should we handle a false age?

### 2.5 User rights
- **Access and export:** Settings → "Download my data" gives a JSON file of everything tied to the account.
- **Correction:** edit the profile at any time.
- **Deletion:** Settings → "Delete my account."
  1. **Immediately:** the account is soft-deleted and signed out everywhere.
  2. **After a 7-day grace period:** hard-delete of the profile, roles, consents, prayer data, reviews, push subscriptions and guardian email.
  3. **Non-anonymous answers** become "Deleted user." The deletion screen offers to remove them entirely.
- **Anonymous questions are already unlinked**, so we can't find them by account. The deletion screen tells the user to delete them from that device first.
- **Backups:** deleted data can linger in Supabase backups until they roll over. The privacy notice says how long ⚖️.

### 2.6 Security
- **RLS on every table:** a pgTAP test in CI fails if any table in `public` has RLS disabled.
- **Private files:** storage buckets are private by default and served through short-lived signed URLs.
- **Server-only secrets:** the service-role key and the API keys for Anthropic, Resend and VAPID (web push) exist only as Edge Function secrets.
- **MFA:** required for moderators, safeguarding leads and admins.
- **Breach response:** a written plan, including notifying the NPC and affected users within the legally required window (⚖️ confirm it; we believe it is 72 hours).
- **Data processing agreements** with every company that handles our users' data: Supabase, Cloudflare, Anthropic and Resend ⚖️.
- **Cross-border data transfer:** data is stored in Singapore, and the Claude API is outside the Philippines. This is disclosed in the notice ⚖️.

---

## 3. Auth, roles and permissions

### 3.1 Sign-in and joining a church
- **Sign-in:** an email magic link or one-time code, or Google.
- **Onboarding:** age, then consents, then (for 13–17) the guardian step.
- **Joining a church is a request.** A church admin or discipler of that church approves it. A stranger can't join a youth group and read its prayer requests.

### 3.2 Permission matrix (enforced by RLS and functions, mirrored in the UI)
| Action | Member | Discipler / Leader | Media Volunteer | Church Admin | Safeguarding | Church Mod | Platform Mod / Admin |
|---|---|---|---|---|---|---|---|
| Ask a question (anonymous or named) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Answer; answer counts as "Answered" | ✅ / — | ✅ / ✅ | ✅ / — | ✅ / ✅ | ✅ / ✅ | ✅ / — | ✅ / — |
| Report content | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create a tech task for the church | — | ✅ | ✅ | ✅ | — | — | — |
| Claim a tech task | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| Submit a prayer request to own group | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| See group prayer requests | group-visible only | as group leader: all | group-visible only | ✅ (admin can't see "leaders only" requests unless also a leader) | — | — | moderation only |
| Set group prayer cap; manage groups | — | as group leader | — | ✅ | — | — | — |
| Discipler dashboard | — | own disciples only | — | assign disciplers | — | — | — |
| Sunday Message to Cards; approve cards | — | — | ✅ / — | ✅ / ✅ | — | — | — |
| Edit church profile and outreach listing | — | — | — | ✅ (verified church only) | — | — | admin |
| Grant church roles | — | — | — | ✅ | — | — | admin |
| Review queue (crisis, held, reported) | — | — | — | — | crisis for own church | held and reported for own church | ✅ all |
| Approve church claims | — | — | — | — | — | — | admin only |

Every ✅ row gets a pgTAP test for the allowed role and one denied role.

---

## 4. Church verification ("Claim your church")
1. **Find the listing.** The user finds their church, or adds it as a new **unverified listing**.
2. **Fill in the claim form:**
   - Their role at the church.
   - The church's public phone number.
   - One evidence document: a letter on letterhead signed by the senior pastor, or a denomination or SEC registration. It goes to a private bucket.
3. **Prove control of an official channel.** We give a one-time code to post on the church's official Facebook page, or the user replies from the church's official email.
4. **A platform admin reviews the claim:**
   - Checks the evidence and the code.
   - **Calls the church's public number,** found independently and not the one in the form.
   - Approves or rejects, with a reason.
5. **On approval:**
   - The claimant becomes `church_admin`.
   - The church shows a "Verified" badge.
   - The claim evidence is deleted 30 days later.

**Rules:**
- **Pending claims grant nothing.**
- **Claims are rate-limited:** 2 per user per 30 days.
- **A second claim on a verified church** alerts the existing admins and a platform admin, and nothing changes automatically.
- **Partner requests** to unverified listings are kept and delivered once the church is claimed. The requester is told this.
- **Ownership transfer** needs a platform admin.

---

## 5. Low bandwidth and low-end phones
- **Budgets, enforced in CI:**

  | What | Budget |
  |---|---|
  | Shell + Forum (initial JS) | ≤ 150 KB gzipped |
  | Each other app (lazy chunk) | ≤ 80 KB |

  **Lighthouse mobile performance ≥ 90.** **Largest Contentful Paint < 2.5 s** on a mid-range Android over slow 4G.
- **Fonts:** at most 2 families, self-hosted as woff2 subsets with `font-display: swap`. Parable's Lora and Inter qualify; the prototype loaded 3 families from Google Fonts.
- **No animation library.** The prototype used `motion`; we use CSS transitions only, which respect `prefers-reduced-motion`.
- **Images:**
  - Resized on upload, about 40 KB WebP per card.
  - `srcset` and `loading="lazy"`.
  - A **Data saver** toggle stops images from loading until tapped.
- **Lists:** cursor pagination, 20 items per page.
- **Offline:**
  - The app shell is cached.
  - Daily Word caches today plus the next 7 days, and offline reviews sync later.
  - Recently viewed forum threads can be read offline.
  - An offline banner appears.
  - Other writes are disabled offline, with a clear message instead of silent failure.

## 6. Accessibility (target: WCAG 2.2 AA)
- **Route changes** move focus to the page `<h1>` and announce the new title in a polite live region.
- **Sheets and dialogs** use Radix (focus trap, Escape, focus return, `aria-labelledby`). A dialog with unsaved text asks before closing.
- **The bottom tab bar** is a `<nav>` with `aria-current="page"`. Every tab has a visible label, not just an icon.
- **Touch targets** are at least 44 × 44 px, and no action appears only on hover.
- **Contrast** is checked by a **unit test that computes the ratio of every text/background token pair**, in both themes (≥ 4.5:1 for body text, ≥ 3:1 for large text and UI).
- **Text stays selectable.** The prototype's `select-none` on `<body>` stopped users copying verses. It is not carried over.
- **Content is in English and Filipino.** `lang` is set on Filipino content.
- **Testing:** axe checks run in every Playwright test. Each phase gets a manual TalkBack (Android) pass and a keyboard-only pass.

## 7. Notifications
- **Channels:**
  - Web Push (VAPID) is the primary channel.
  - An **in-app inbox** receives every notification. It's the fallback for iOS users who haven't installed the app.
  - Email (Resend) is for leaders' daily digests and account mail.
- **How they're sent:** `notification_jobs` is a queue table. pg_cron calls the `send-notifications` Edge Function every 15 minutes, and crisis alerts are sent immediately.

| Kind | Trigger | To | Default |
|---|---|---|---|
| Streak reminder | No activity today by 7pm Manila time | The user | Opt-in, at most once a day |
| Discipler nudge | A disciple has been quiet for 3+ days | Their discipler | Daily 8am digest |
| Prayer check-in | Active request with no update for 3+ days | Group leader (and the requester, optional) | On |
| Unanswered question | 12 hours with no leader answer | Leaders of the routed church, or all leaders | On |
| Crisis | Crisis flow | Safeguarding leads, then platform moderators | Always on, ignores quiet hours |

**Limits:**
- **Quiet hours:** 10pm–7am, and **9pm–7am for minors**.
- **Cap:** at most 3 non-crisis pushes per user per day.
- **Opting out:** each kind can be turned off separately.
- **Anonymous questions get no push** (explained in ARCHITECTURE.md).

---

## ⚖️ Legal review checklist (bring this to a lawyer or DPO)
1. Whether we need NPC registration, a DPO appointment, and a Privacy Impact Assessment.
2. Whether our explicit consent for religious affiliation and health data is valid as designed.
3. Guardian consent for ages 13–17, and how to handle false ages.
4. Duties when a minor discloses abuse anonymously (RA 7610 and related laws).
5. Cross-border transfer (Singapore hosting, the Claude API) and the data processing agreements.
6. Retention periods: moderation records, audit log, backups.
7. Breach-notification window and procedure.
8. Bible translation licences (KJV, WEB and Ang Biblia 1905 are public domain; MBB, NIV and ESV need permission).
9. Terms of service and community guidelines, in English and Filipino.
10. Crisis hotline numbers (verified, with a named person re-checking them each quarter).
