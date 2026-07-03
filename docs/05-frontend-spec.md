# 05 — Frontend Specification

# Overview

This document defines the functional specification for the frontend application.

The frontend should prioritize simplicity, responsiveness, accessibility, and a calming user experience. It should present AI-generated insights in a clear and digestible manner without overwhelming users.

Business logic must remain on the backend. The frontend is responsible only for presentation, interaction, and state management.

---

# Frontend Goals

The frontend should:

- Provide an intuitive experience.
- Minimize cognitive load.
- Encourage consistent dream journaling.
- Present AI insights visually.
- Support responsive layouts.
- Be accessible.
- Maintain consistent design language.

---

# Application Layout

The application consists of:

- Authentication
- Main Dashboard
- Dream Management
- AI Analysis
- Visualization Gallery
- Emotional Trends
- Calendar
- Reports
- Community
- AI Companion
- Settings

---

# Global Navigation

Navigation should remain consistent across the application.

Main Navigation

Dashboard

Dreams

Analysis

Calendar

Gallery

Reports

Community

AI Companion

Settings

Profile

---

# Global Components

The following reusable components should exist.

## Button

Supports:

Primary

Secondary

Danger

Ghost

Loading

Disabled

---

## Input

Supports:

Text

Textarea

Password

Email

Search

Date

Time

---

## Modal

Used for:

Delete Confirmation

Generate Image

Share Dream

Logout

---

## Card

Used throughout the application.

Examples:

Dream Card

Insight Card

Emotion Card

Statistic Card

Report Card

Community Card

---

## Empty State

Every page should include a meaningful empty state.

Example

"No dreams yet."

"Start by recording your first dream."

---

## Skeleton Loading

Every API request should display skeleton loading instead of blank pages.

---

## Toast Notification

Used for:

Save success

Delete success

Errors

Warnings

---

# Authentication Pages

## Login

Purpose

Authenticate existing users.

Components

Email

Password

Remember Me

Forgot Password

Login Button

Register Link

States

Loading

Invalid Credentials

Success

---

## Register

Components

Name

Email

Password

Confirm Password

Register Button

---

# Dashboard

Purpose

Provide an overview of user activity.

Widgets

Dream Streak

Recent Dreams

Weekly Insight

Emotion Summary

Quick Actions

Upcoming Reminder

Navigation Shortcuts

Actions

Record Dream

Generate Report

Continue Conversation

---

# Dream List

Purpose

Display all recorded dreams.

Functions

Search

Sort

Filter

Pagination

Archive

Delete

Restore

---

# Dream Detail

Sections

Dream Content

Mood

Sleep Information

AI Summary

Detected Emotion

Detected Symbols

Reflection

Visualization

History

Actions

Edit

Delete

Regenerate Analysis

Generate Image

Share

---

# Record Dream

Fields

Title

Dream Description

Optional Image

Mood

Sleep Duration

Notes

Buttons

Save Draft

Save Dream

Cancel

Validation

Required description

Maximum content length

Supported image format

---

# AI Analysis

Purpose

Present AI-generated insights.

Sections

Summary

Emotion

Detected Symbols

Pattern Analysis

Reflection

Recommendations

History Comparison

Regenerate Button

---

# Visualization Gallery

Grid Layout

Image Preview

Dream Reference

Creation Date

Download

Regenerate

Delete

Search

Filter

---

# Emotional Trends

Charts

Daily

Weekly

Monthly

Yearly

Widgets

Dominant Emotion

Emotion Distribution

Pattern Summary

AI Observation

---

# Dream Calendar

Views

Month

Week

Day

Features

Emotion Indicators

Dream Preview

Filters

Navigation

---

# Reports

Display

Weekly Report

Monthly Report

Yearly Report

Functions

Preview

Export

Download

History

---

# Community

Feed

Post Detail

Comment

Reaction

Report

Search

Filter

Pagination

---

# AI Companion

Chat Layout

Conversation History

Suggested Questions

Typing Indicator

Streaming Response

Message Status

Context Indicator

The AI Companion should answer using the user's historical dream records whenever relevant.

---

# Settings

Sections

Profile

Security

Notifications

Privacy

Appearance

Language

Connected Services

---

# User Profile

Display

Avatar

Name

Email

Dream Statistics

Achievements

Account Information

---

# State Management

The frontend should manage:

Authentication State

User Profile

Dream List

Dashboard

Conversation

Notifications

Theme

Temporary Drafts

---

# Error Handling

Every page should provide:

Loading State

Empty State

Error State

Retry Option

Offline Message

---

# Responsive Design

Support:

Desktop

Laptop

Tablet

Mobile

Layouts should adapt without losing functionality.

---

# Accessibility

The interface should support:

Keyboard Navigation

Screen Readers

High Contrast

Readable Typography

Focus Indicators

Accessible Forms

---

# Frontend Performance

The frontend should:

Minimize unnecessary API requests.

Lazy load heavy content.

Optimize images.

Cache appropriate data.

Prevent layout shifts.

---

# Frontend Architecture Requirements

The implementation should recommend the most appropriate:

Framework

Routing Strategy

State Management

Data Fetching

Form Library

Validation Library

Component Library

Build Tool

Testing Framework

Selection should consider:

Developer Experience

Performance

Scalability

Maintainability

Long-term support