# MoyMoy 📚✨

An iOS-style AI study companion inspired by Gizmo, Quizlet, and Knowunity. Users drop in their notes and MoyMoy turns them into flashcards, quizzes, summaries, and a tutor chat — all wrapped in a soft lavender/purple gradient interface.

---

## 🎨 Design Direction

- **Palette:** Gradient `#F2E6EE → #977DDF` (soft pink → lavender purple). White cards on a tinted background, deep plum text, gentle shadows.
- **Vibe:** iOS native — rounded 20px+ corners, frosted/blur surfaces, large bold headings, generous spacing, springy tap animations, SF-style typography.
- **Navigation:** Fixed bottom tab bar (Home · Library · Study · Chat · Profile) with iOS-style icons that fill when active.
- **Motion:** Subtle scale-on-tap, smooth page slide transitions, confetti on streaks/quiz completion.

---

## 🔐 Accounts

- Email + password sign up / sign in (Lovable Cloud auth)
- Google sign-in option
- Per-user profile: display name, avatar, current streak, total XP, level
- All decks, notes, quizzes, and progress saved to the cloud and synced across devices

---

## 🧩 Core Screens

### 1. Home (Dashboard)
- Greeting + current **streak flame** 🔥 and **XP bar**
- "Continue studying" card → resumes last deck/quiz
- Quick actions: **+ New Note**, **Generate Deck**, **Start Quiz**
- Daily smart reminder card ("You usually study at 7pm — ready?")

### 2. Library
- Grid of **Notes** and **Decks** (toggle tabs at top)
- Each card shows title, subject tag, # cards, last studied
- Search bar + filter chips (subject, recent, mastered)
- Long-press → rename / delete / share

### 3. Note Editor / Uploader
- Paste text, type freely, or upload a file (PDF, DOCX, image of handwritten notes — parsed via document parsing)
- One-tap AI actions on any note:
  - **✨ Summarize** (key concepts + TL;DR)
  - **🃏 Generate Flashcards**
  - **📝 Generate Quiz** (user picks modes)
  - **💬 Ask about this note** → opens chat preloaded with note context

### 4. Study / Quiz Mode (the star feature)
When generating a quiz, user picks how many questions and **which modes to mix**:
- ✅ **Multiple Choice** — 4 options, one correct
- 🔤 **Identification** — type the answer (fuzzy-matched by AI)
- ⚖️ **Modified True or False** — if false, user types the corrected term/word
- 📋 **Enumeration** — list N items, AI grades partial credit

Quiz UI:
- One card per question, swipe/tap to advance
- Live progress bar at top
- Instant feedback (haptic-style animation, green/red flash)
- End-of-quiz results: score, XP earned, mistakes review, "Re-study wrong ones" button

Flashcard study mode (separate from quiz):
- Tap to flip card (3D flip animation)
- Swipe right "Got it" / left "Review again"
- Spaced-repetition style queue — missed cards resurface

### 5. AI Tutor Chat
- Conversational chat with markdown rendering
- Optional **note context picker** — attach one of your notes so the tutor answers based on it
- Suggested prompts: "Explain like I'm 12", "Quiz me on this", "Make a study plan"
- Streaming responses (token-by-token, iOS Messages feel)

### 6. Profile
- Avatar, name, level, total XP
- Streak calendar (heatmap of study days)
- Stats: cards studied, quizzes taken, average score
- Settings: reminder time, notification toggle, theme, sign out

---

## 🤖 AI Features (powered by Lovable AI)

| Feature | What it does |
|---|---|
| **Summarize note** | TL;DR + bullet key concepts |
| **Generate flashcards** | Q/A pairs extracted from note (structured output) |
| **Generate quiz** | Mixed-mode questions per user's selection (structured output with mode-specific schema) |
| **Grade open answers** | For Identification & Enumeration — semantic match, partial credit |
| **Tutor chat** | Streaming conversational answers, optionally grounded in a note |
| **Smart reminders** | Short, personalized motivational nudge generated daily |

All AI calls run through secure backend endpoints — no API keys on the client.

---

## 🔥 Gamification

- **Streaks:** +1 day for any study activity (quiz, flashcard session, or chat-quiz). Flame icon grows at 3, 7, 30, 100 days.
- **XP & Levels:** XP per correct answer, bonus for finishing a quiz, daily streak bonus. Level up animation.
- **Smart reminders:** Local-time daily push-style banner (in-app for now) at user-chosen time, with AI-generated motivational copy.

---

## 🗂️ Data Model

- `profiles` — display name, avatar, streak, xp, reminder_time
- `notes` — title, content (text), source_file_url (optional), subject, owner
- `decks` — title, subject, source_note_id (optional), owner
- `flashcards` — deck_id, front, back, ease/review schedule
- `quizzes` — title, source_note_id, modes_used, owner
- `quiz_questions` — quiz_id, mode, prompt, correct_answer, options (for MC)
- `quiz_attempts` — quiz_id, user, score, answers, completed_at
- `study_sessions` — user, type, duration, xp_earned, date (powers streak + stats)

Row-level security so each user only sees their own data.

---

## 🚧 Out of scope for v1 (can add later)
- Public deck library / social sharing
- Real push notifications (in-app reminders only for now)
- Voice input / TTS reading

---

Once you approve, I'll build the full app: auth, all 6 main screens, the AI endpoints (flashcards, quiz generation, grading, tutor chat, smart reminders), the gamification system, and the iOS-style design system with your lavender gradient. Tap **Implement plan** to kick it off! 💜