# MiniCom Cursor Build Plan
## Exact File by File Implementation Order
## Adjusted for `next.js/examples/with-supabase`

This project starts from the Vercel `with-supabase` example, which already includes:
1. `app/`
2. `components/`
3. `lib/`
4. Tailwind
5. shadcn setup
6. Supabase starter wiring
7. `.env.example`

So do not recreate base framework files unless needed. Extend the template cleanly.

---

## 0. First rule for this template

Keep the existing starter structure and adapt to it.

Do not rebuild:
1. base Next.js scaffold
2. Tailwind setup
3. shadcn setup
4. Supabase env pattern
5. root app structure

Instead:
1. inspect existing `app/`, `components/`, and `lib/`
2. preserve useful starter utilities
3. add MiniCom specific files around the template

---

## Phase 1. Inspect and minimally adjust the template foundation

### 1. `.env.example`
Update the env file to preserve template compatibility.

Use:
1. `NEXT_PUBLIC_SUPABASE_URL=`
2. `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=`

Optional compatibility fallback:
3. `NEXT_PUBLIC_SUPABASE_ANON_KEY=`

Rule:
Prefer `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` everywhere in docs and setup, because that is what the template documents.  [oai_citation:1‡GitHub](https://github.com/vercel/next.js/tree/canary/examples/with-supabase)

### 2. `package.json`
Keep existing dependencies from the starter and add only what MiniCom needs.

Add:
1. `zustand`
2. `zod`
3. `@tanstack/react-virtual`
4. `date-fns`
5. `nanoid`
6. `lucide-react`
7. `vitest`
8. `@testing-library/react`
9. `@testing-library/jest-dom`
10. `@testing-library/user-event`
11. `jsdom`

Only add `clsx` or `tailwind-merge` if they are not already present.

### 3. `src/app/globals.css` or `app/globals.css`
Keep the starter tokens and add only MiniCom styles if needed.

Do not replace the starter styles.
Only extend them.

### 4. `src/app/layout.tsx` or `app/layout.tsx`
Keep the starter root layout and metadata unless it conflicts.
Only add:
1. MiniCom metadata
2. optional theme class support
3. global error or shell wrappers if needed later

---

## Phase 2. Reuse and adapt existing Supabase helpers from the template

The template already contains `lib/` Supabase helpers, so inspect before creating duplicates. The starter is designed to support Supabase across the Next.js stack.  [oai_citation:2‡GitHub](https://github.com/vercel/next.js/tree/canary/examples/with-supabase)

### 5. `src/lib/supabase/` or existing template `lib` Supabase files
Inspect existing files first.

Expected goal:
1. identify browser client helper
2. identify server client helper
3. identify auth or cookie helpers
4. keep what is useful
5. avoid duplicate client factories

### 6. `src/lib/supabase/browser.ts`
Create this only if the template does not already provide an equivalent browser client helper.

Responsibility:
1. single browser Supabase client for MiniCom client components

### 7. `src/lib/supabase/server.ts`
Create only if needed for server side reads or seed helpers and not already present in the template.

Responsibility:
1. optional server side thread fetches
2. optional route or server action support later

### 8. `src/lib/supabase/mappers.ts`
Add MiniCom specific row to domain mappers:
1. `mapProfileRowToParticipant`
2. `mapThreadRowToThread`
3. `mapMessageRowToMessage`
4. `mapThreadReadRowToReadState`

### 9. `src/lib/supabase/queries.ts`
MiniCom specific Supabase query layer:
1. `ensureVisitorProfile`
2. `getAgentProfile`
3. `getThreadsForAgent`
4. `getThreadById`
5. `getMessagesForThread`
6. `createThread`
7. `insertMessage`
8. `markThreadRead`
9. `getThreadReadState`
10. `assignAgentIfNeeded`
11. `updateThreadSummary`

### 10. `src/lib/supabase/subscriptions.ts`
Realtime database subscriptions:
1. subscribe to thread messages
2. subscribe to thread updates
3. subscribe to inbox updates
4. cleanup helpers

### 11. `src/lib/supabase/presence.ts`
Thread scoped presence helpers:
1. join thread channel
2. track local presence
3. read counterpart presence
4. cleanup

### 12. `src/lib/supabase/typing.ts`
Typing broadcast helpers:
1. send typing start
2. send typing stop
3. subscribe to typing events
4. cleanup

---

## Phase 3. Core types and schemas

Place these under the template’s `lib/` and new `types/` structure without fighting the starter.

### 13. `src/types/chat.ts`
Define:
1. `ParticipantRole`
2. `MessageStatus`
3. `Participant`
4. `Thread`
5. `Message`
6. `ThreadReadState`
7. `TypingPayload`
8. `InboxSortMode`
9. `ConnectionState`

### 14. `src/types/database.ts`
MiniCom row types if generated types are not used.

Define:
1. `ProfileRow`
2. `ThreadRow`
3. `MessageRow`
4. `ThreadReadRow`

### 15. `src/lib/schemas/participant.ts`
### 16. `src/lib/schemas/thread.ts`
### 17. `src/lib/schemas/message.ts`
### 18. `src/lib/schemas/thread-read.ts`

Use Zod validation for:
1. local hydration safety
2. mapper sanity
3. test fixtures

---

## Phase 4. Session and identity

The starter has auth oriented Supabase patterns, but for this challenge you want lightweight identity without full auth.

### 19. `src/lib/session.ts`
Implement visitor session helpers:
1. load visitor id
2. save visitor id
3. load widget state if desired
4. persist theme if desired

### 20. `src/lib/get-or-create-visitor.ts`
Implement:
1. read local visitor id
2. upsert visitor profile in Supabase
3. persist id locally
4. return participant

### 21. `src/lib/get-default-agent.ts`
Implement:
1. fetch seeded demo agent
2. create if missing in development if desired

---

## Phase 5. Zustand store layer

### 22. `src/store/chat-store.ts`
Create Zustand store with:
1. viewer
2. selectedThreadId
3. visitorThreadId
4. threadsById
5. messagesByThreadId
6. participantsById
7. optimisticMessagesByThreadId
8. presenceByThreadId
9. typingByThreadId
10. inboxSortMode
11. connectionState

Actions:
1. `setViewer`
2. `hydrateThreads`
3. `hydrateMessages`
4. `upsertThread`
5. `upsertThreads`
6. `upsertMessage`
7. `upsertMessages`
8. `addOptimisticMessage`
9. `reconcileOptimisticMessage`
10. `markOptimisticMessageFailed`
11. `removeOptimisticMessage`
12. `selectThread`
13. `setVisitorThreadId`
14. `setPresenceSnapshot`
15. `setTypingState`
16. `setInboxSortMode`
17. `setConnectionState`
18. `markThreadReadLocal`

### 23. `src/store/selectors.ts`
Create selectors for:
1. merged thread messages
2. sorted inbox
3. unread count
4. selected thread
5. selected thread messages
6. current typing state
7. current presence state

---

## Phase 6. Pure utilities before UI

### 24. `src/lib/chat/sort-messages.ts`
Implement `sortMessagesForRender(messages)`.

### 25. `src/lib/chat/group-messages.ts`
Optional message grouping helper.

### 26. `src/lib/chat/reconcile-messages.ts`
Pure reconciliation helpers:
1. merge optimistic and confirmed messages
2. match by `clientId`
3. avoid duplicates

### 27. `src/lib/chat/inbox-sort.ts`
Pure inbox sorting helper:
1. recent
2. unread
3. stable sort rules

### 28. `src/lib/chat/read-state.ts`
Helpers for:
1. unread count
2. last read logic
3. visible read updates

---

## Phase 7. Feature hooks and orchestration

### 29. `src/hooks/use-chat-thread.ts`
Responsible for:
1. loading thread messages
2. subscribing to message inserts
3. joining presence
4. listening for typing
5. cleanup

### 30. `src/hooks/use-send-message.ts`
Responsible for:
1. optimistic send
2. Supabase insert
3. reconciliation
4. failure
5. retry

### 31. `src/hooks/use-visitor-thread.ts`
Responsible for:
1. visitor identity
2. thread creation
3. thread hydration
4. visitor subscription setup

### 32. `src/hooks/use-agent-inbox.ts`
Responsible for:
1. fetch threads
2. subscribe to inbox updates
3. update previews and unread counts

### 33. `src/hooks/use-auto-scroll.ts`
Chat auto scroll rules.

### 34. `src/hooks/use-typing-state.ts`
Local input typing state.

### 35. `src/hooks/use-typing-broadcast.ts`
Bridges typing to Supabase broadcast.

### 36. `src/hooks/use-user-presence.ts`
Tracks local presence in active thread.

### 37. `src/hooks/use-thread-presence.ts`
Reads remote presence state from store.

---

## Phase 8. Use the template’s component approach

The starter ships with shadcn initialized, so prefer building MiniCom UI on top of that instead of inventing a second design system.  [oai_citation:3‡GitHub](https://github.com/vercel/next.js/tree/canary/examples/with-supabase)

### 38. `src/components/ui/` existing folder
Inspect existing starter UI primitives first.

Only add missing primitives.

### 39. `src/components/ui/status-dot.tsx`
### 40. `src/components/ui/offline-banner.tsx`
### 41. `src/components/ui/empty-state.tsx`
### 42. `src/components/ui/error-fallback.tsx`

Do not recreate `button`, `input`, `textarea`, or similar if the template already has them.

---

## Phase 9. Visitor chat components

### 43. `src/components/minicom/message-status.tsx`
### 44. `src/components/minicom/message-item.tsx`
### 45. `src/components/minicom/typing-indicator.tsx`
### 46. `src/components/minicom/message-list.tsx`
### 47. `src/components/minicom/message-composer.tsx`
### 48. `src/components/minicom/chat-header.tsx`
### 49. `src/components/minicom/chat-widget.tsx`
### 50. `src/components/minicom/chat-launcher.tsx`

Reason:
Keep MiniCom app specific UI grouped instead of scattering feature components everywhere into the starter.

---

## Phase 10. Agent components

### 51. `src/components/minicom/unread-badge.tsx`
### 52. `src/components/minicom/inbox-list-item.tsx`
### 53. `src/components/minicom/inbox-toolbar.tsx`
### 54. `src/components/minicom/inbox-list.tsx`
### 55. `src/components/minicom/thread-header.tsx`
### 56. `src/components/minicom/thread-panel.tsx`

---

## Phase 11. Route composition inside the template’s App Router

The template already uses `app/`, so keep routes thin and compositional.  [oai_citation:4‡GitHub](https://github.com/vercel/next.js/tree/canary/examples/with-supabase)

### 57. `src/app/page.tsx`
Replace or adapt starter homepage into:
1. mock marketing page
2. floating MiniCom chat launcher
3. visitor widget integration

### 58. `src/app/agent/page.tsx`
Create standalone agent app route:
1. inbox sidebar
2. thread panel
3. responsive layout

### 59. `src/app/error.tsx`
Global app error boundary UI.

### 60. `src/app/not-found.tsx`
Optional polished not found page.

---

## Phase 12. Database schema and Supabase setup

### 61. `supabase/schema.sql`
Create tables:
1. `profiles`
2. `threads`
3. `messages`
4. `thread_reads`

Also add:
1. indexes
2. constraints
3. optional updated_at trigger
4. basic RLS starter policies or at least documented placeholders

### 62. `supabase/seed.sql`
Seed:
1. one demo agent profile
2. optional sample thread data for development

### 63. `README.md`
Add setup steps for:
1. creating tables
2. seeding agent
3. env setup
4. running locally

---

## Phase 13. Testing

### 64. `vitest.config.ts`
### 65. `src/tests/setup.ts`
### 66. `src/tests/visitor-chat.test.tsx`
### 67. `src/tests/state-transition.test.ts`
### 68. `src/tests/out-of-order-messages.test.ts`

Mock Supabase boundaries in unit tests.

---

## Phase 14. Final polish pass

### 69. `src/components/minicom/chat-widget.tsx`
Polish:
1. accessibility
2. spacing
3. empty states
4. mobile behavior

### 70. `src/components/minicom/thread-panel.tsx`
Polish:
1. loading states
2. connection state
3. retry affordances

### 71. `src/components/minicom/inbox-list.tsx`
Polish keyboard navigation.

### 72. `README.md`
Finalize:
1. overview
2. architecture diagram
3. Supabase decisions
4. Zustand tradeoffs
5. AI usage
6. future improvements

---

## Updated structural rules for this template

### Rule 1
Prefer the template’s existing `lib` Supabase helpers over new duplicates.

### Rule 2
Prefer the template’s existing `components/ui` primitives over new base UI primitives.

### Rule 3
Keep MiniCom specific UI under `src/components/minicom/` so the starter stays recognizable.

### Rule 4
Keep route files thin.
No business logic in `app/page.tsx` or `app/agent/page.tsx`.

### Rule 5
Do not introduce a second parallel Supabase architecture.
Extend the starter’s pattern.

---

## Updated Cursor batching for this template

### Batch 1
Files 1 through 18

Goal:
Template inspected, env aligned, core types and Supabase integration layer ready.

### Batch 2
Files 19 through 28

Goal:
Identity, store, selectors, and pure utilities ready.

### Batch 3
Files 29 through 37

Goal:
Hooks and orchestration ready.

### Batch 4
Files 38 through 50

Goal:
Visitor chat UI works.

### Batch 5
Files 51 through 60

Goal:
Agent app works.

### Batch 6
Files 61 through 68

Goal:
Database schema and tests ready.

### Batch 7
Files 69 through 72

Goal:
Polish and submission ready README.

---

## Definition of done for the template based build

### Milestone 1
After file 18:
Template is adapted, not replaced.

### Milestone 2
After file 37:
Supabase, store, and hooks are ready.

### Milestone 3
After file 50:
Visitor chat works end to end.

### Milestone 4
After file 60:
Agent inbox works end to end.

### Milestone 5
After file 68:
Schema and tests are complete.

### Milestone 6
After file 72:
Project is interview ready and aligned with the starter.

---

## Important implementation note for Cursor

Before creating any new file, inspect whether the template already contains an equivalent and reuse it if possible.

Priority order:
1. extend existing template utilities
2. add MiniCom specific files
3. avoid duplication
4. keep architecture clean and obvious to reviewers