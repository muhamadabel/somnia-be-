# 03 — User Flow

# Overview

This document defines the primary user journeys throughout Dream Journal Analyzer.

The goal is to ensure every feature supports a smooth, intuitive, and reflective user experience.

User flows should minimize cognitive load while encouraging consistent dream journaling.

---

# Primary User Journey

```

Landing Page

↓

Register

↓

Email Verification (optional)

↓

Onboarding

↓

Dashboard

↓

Record Dream

↓

AI Analysis

↓

Dream Visualization

↓

Dashboard Update

↓

Historical Insights

↓

Weekly Report

↓

Community

↓

Repeat

```

---

# First-Time User Flow

## Step 1

User opens the application.

System introduces the purpose of the platform.

Primary CTA

Start Your Dream Journal

---

## Step 2

User creates an account.

Required

- Email
- Password

Optional

- Display Name
- Avatar

---

## Step 3

User completes onboarding.

The onboarding should explain:

- dreams remain private
- AI provides reflection only
- reports improve over time
- consistent journaling increases insight quality

---

## Step 4

User reaches an empty dashboard.

Instead of empty charts, display:

Welcome message

Quick explanation

Record First Dream button

No analytics are shown yet.

---

# Dream Recording Flow

Dashboard

↓

Click

Record Dream

↓

Write dream

↓

(Optional)

Upload image

↓

(Optional)

Choose mood

↓

Save

↓

Dream Stored

↓

Generate AI Analysis

↓

Return Analysis

↓

Update Dashboard

---

# AI Analysis Flow

Dream Selected

↓

Prepare Prompt

↓

Load Previous Dreams

↓

Context Builder

↓

AI Processing

↓

Summary

↓

Emotion Detection

↓

Symbol Detection

↓

Pattern Detection

↓

Reflection

↓

Store Analysis

↓

Display Results

---

# Dream Visualization Flow

Dream Detail

↓

Generate Visualization

↓

AI Image Service

↓

Image Generated

↓

Preview

↓

Accept

↓

Save

↓

Gallery Updated

↓

Download Available

---

# Dashboard Flow

User Login

↓

Dashboard

↓

Load Statistics

↓

Recent Dreams

↓

Emotion Summary

↓

Weekly Insight

↓

Upcoming Reminder

↓

Quick Actions

---

# Calendar Flow

Dashboard

↓

Calendar

↓

Choose Month

↓

Dream Preview

↓

Filter

Emotion

↓

Filter

Symbols

↓

Open Dream

↓

Dream Detail

---

# Emotional Trend Flow

Dashboard

↓

Trends

↓

Daily

↓

Weekly

↓

Monthly

↓

Yearly

↓

AI Observation

↓

Reflection

---

# AI Companion Flow

Dashboard

↓

Open AI Companion

↓

User Asks Question

↓

Load Conversation

↓

Retrieve Previous Dreams

↓

Retrieve Previous Analyses

↓

Build Context

↓

AI Response

↓

Save Conversation

↓

Continue Chat

The AI Companion should answer based on the user's historical dream records instead of responding like a general-purpose chatbot.

---

# Wellness Report Flow

Scheduled Period

↓

Collect Dreams

↓

Collect Analyses

↓

Collect Emotions

↓

Collect Symbols

↓

Generate Report

↓

Display Report

↓

Export PDF

---

# Community Flow

Dashboard

↓

Community

↓

Browse Posts

↓

Open Dream

↓

Comment

↓

React

↓

Report

↓

Return Feed

Users explicitly choose which dreams become public.

Private dreams are never shared automatically.

---

# Search Flow

Dashboard

↓

Search

↓

Keyword

↓

Emotion

↓

Symbol

↓

Date

↓

Results

↓

Dream Detail

---

# Notification Flow

Reminder Trigger

↓

Send Notification

↓

User Opens App

↓

Dashboard

↓

Quick Record

---

# Error Flow

AI Service Unavailable

↓

Display Friendly Message

↓

Retry

↓

Fallback

↓

Continue Using Journal

The application should remain usable even if AI features are temporarily unavailable.

---

# Empty States

## Dashboard

No dreams recorded yet.

Display

Start Your First Dream Journal

---

## Calendar

No dreams this month.

Display encouragement message.

---

## Reports

Not enough data yet.

Explain why reports require multiple dream entries.

---

## Community

No posts available.

Encourage users to share their first dream.

---

# Edge Cases

## User deletes a dream

System updates:

- dashboard
- reports
- emotional trends
- AI memory (according to retention policy)

---

## AI generation fails

Dream remains saved.

Analysis can be regenerated later.

---

## User logs in on another device

Dream history synchronizes automatically.

---

## Offline

If supported by implementation,

dreams should be stored locally and synchronized once internet connectivity returns.

---

# UX Principles

Every user journey should prioritize:

- Simplicity
- Reflection
- Clarity
- Minimal cognitive load
- Calm visual experience
- Fast interactions
- Transparent AI behavior

The user should never feel overwhelmed by excessive information.

Instead, insights should be revealed progressively as more dream history becomes available.