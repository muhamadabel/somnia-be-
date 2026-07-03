# 02 — Domain Model

# Overview

The Domain Model defines the core business entities used throughout Dream Journal Analyzer.

This document intentionally describes the business domain instead of database implementation.

Technology choices (SQL, NoSQL, ORM, etc.) should be recommended by the implementation team based on project requirements.

---

# Domain Overview

The application revolves around one central concept:

User Reflection.

Everything inside the system exists to help users better understand themselves through dream journaling and AI-assisted reflection.

The primary business flow is:

User

↓

Dream

↓

AI Analysis

↓

Insights

↓

Reflection

↓

Long-term Wellness

---

# Core Entities

## User

### Description

Represents an individual using the application.

A user owns all personal data generated inside the platform.

### Responsibilities

- Authentication
- Profile Management
- Dream Ownership
- Privacy Preferences
- Notification Preferences

### Relationships

User

├── Dreams

├── Reports

├── Visualizations

├── Bookmarks

├── Conversations

└── Community Posts

---

## Dream

### Description

A dream is the central entity of the application.

Every AI feature depends on Dream records.

### Responsibilities

Store:

- title
- description
- created time
- sleep information
- mood after waking
- optional image

Each dream belongs to exactly one user.

A dream may generate multiple analyses over time.

---

## Dream Analysis

### Description

Represents AI-generated insights for a dream.

Analysis should never overwrite the original dream.

Instead, analysis is treated as generated knowledge.

### Contains

- summary
- dominant emotion
- detected symbols
- repeated themes
- reflection
- recommendations
- confidence metadata

Each analysis belongs to one dream.

---

## Emotion

### Description

Represents emotions detected inside dreams.

Emotion is considered structured data instead of free text.

Examples:

- Happy
- Calm
- Fear
- Sadness
- Anxiety
- Excitement
- Curiosity

A dream may contain multiple emotions.

---

## Dream Symbol

### Description

Represents important recurring objects, characters, places or events.

Examples

- Water
- Forest
- Flying
- Falling
- Snake
- Fire

Each symbol contains:

- name
- description
- interpretation
- related emotions

Symbols can appear in many dreams.

---

## Visualization

### Description

Represents AI-generated artwork created from dream descriptions.

Visualization belongs to a single dream.

Multiple visualizations may exist for one dream.

Example

Dream

↓

Visualization v1

Visualization v2

Visualization v3

---

## Wellness Report

### Description

Represents long-term summaries generated from historical dream data.

Reports aggregate information across multiple dreams.

Possible sections include:

- dream frequency
- emotional trend
- recurring symbols
- AI observations
- weekly reflection
- monthly reflection

---

## Conversation

### Description

Represents conversations between users and the AI Companion.

Unlike traditional chatbots,

conversation context includes historical dreams.

Conversation should support long-term memory.

---

## Community Post

### Description

Represents dreams shared publicly.

Community posts are separate from private dream journals.

Users explicitly choose which dreams become public.

---

## Comment

Represents discussions inside community posts.

---

## Bookmark

Stores saved dream symbols for future reference.

---

# Business Relationships

User

↓

Dream

↓

Analysis

↓

Visualization

↓

Reflection

User

↓

Conversation

↓

AI Companion

User

↓

Community Post

↓

Comment

Dream

↓

Emotion

Dream

↓

Symbol

Dream

↓

Visualization

Dream

↓

Analysis

Report

↓

Dream

↓

Analysis

↓

Emotion

↓

Symbol

---

# Ownership Rules

A user owns:

- Dreams
- Reports
- AI Conversations
- Visualizations
- Bookmarks

Community content follows community visibility rules.

---

# Business Rules

## Rule 1

A Dream cannot exist without a User.

---

## Rule 2

Analysis cannot exist without a Dream.

---

## Rule 3

Deleting a Dream should determine whether related analyses and visualizations are deleted or archived based on system policy.

---

## Rule 4

Community posts never expose private dreams unless explicitly shared by the user.

---

## Rule 5

AI conversations may reference previous dreams only with user permission.

---

## Rule 6

Reports summarize historical data but never modify original records.

---

# Aggregate Boundaries

User Aggregate

- Profile
- Preferences
- Authentication

Dream Aggregate

- Dream
- Analysis
- Visualization
- Emotion
- Symbol

Community Aggregate

- Post
- Comment
- Reaction

AI Aggregate

- Conversation
- Prompt History
- AI Memory

---

# Domain Events

Potential business events include:

DreamCreated

DreamUpdated

DreamDeleted

AnalysisGenerated

VisualizationGenerated

ReportGenerated

ConversationStarted

CommunityPostPublished

CommentAdded

BookmarkCreated

UserRegistered

UserLoggedIn

---

# Future Domain Expansion

The model should remain flexible enough to support:

- Sleep tracking integration
- Wearable devices
- Therapist collaboration
- Multi-user research mode
- AI memory improvements
- Voice dream recording
- Advanced emotion analytics

No current implementation should prevent these future capabilities.