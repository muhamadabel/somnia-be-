# 08 — Database Design

# Overview

This document defines the logical data model for Dream Journal Analyzer.

The purpose of this document is to describe what data should be stored, how entities relate to each other, and the expected constraints.

The database technology is intentionally **not predetermined**. The implementation team or AI Agent should recommend the most appropriate solution based on scalability, consistency, analytics, maintainability, and operational cost.

---

# Design Principles

The database should prioritize:

- Data Integrity
- Scalability
- Security
- Maintainability
- Historical Tracking
- Efficient Query Performance

Personal dream journals are considered highly sensitive data.

---

# Core Entities

## User

Purpose

Represents an application user.

Core Attributes

- id
- fullName
- email
- passwordHash
- avatar
- role
- status
- timezone
- language
- createdAt
- updatedAt

Relationships

User

├── Dreams

├── Conversations

├── Reports

├── Visualizations

├── Community Posts

└── Notifications

---

## Dream

Purpose

Stores dream journals created by users.

Attributes

- id
- userId
- title
- description
- mood
- sleepDuration
- visibility
- createdAt
- updatedAt
- archivedAt

Relationships

Dream

├── Analysis

├── Visualization

├── Emotions

├── Symbols

└── Attachments

---

## Dream Analysis

Purpose

Stores AI-generated analysis.

Attributes

- id
- dreamId
- summary
- reflection
- recommendation
- confidenceScore
- generatedAt

One dream may have multiple analysis versions.

---

## Emotion

Purpose

Stores detected emotions.

Attributes

- id
- name
- description

Examples

Happy

Fear

Calm

Sad

Excited

Confused

---

## DreamEmotion

Bridge table between Dream and Emotion.

Attributes

- dreamId
- emotionId
- intensity

---

## Symbol

Purpose

Stores dream symbols.

Attributes

- id
- name
- category
- interpretation
- description

---

## DreamSymbol

Bridge table.

Attributes

- dreamId
- symbolId
- confidence

---

## Visualization

Purpose

Stores AI-generated images.

Attributes

- id
- dreamId
- imageUrl
- prompt
- provider
- createdAt

Multiple visualizations may belong to one dream.

---

## Conversation

Purpose

Stores AI Companion conversations.

Attributes

- id
- userId
- title
- createdAt

---

## Conversation Message

Purpose

Stores conversation history.

Attributes

- id
- conversationId
- role
- content
- timestamp

---

## Wellness Report

Purpose

Stores generated reports.

Attributes

- id
- userId
- period
- summary
- generatedAt

---

## Community Post

Purpose

Stores dreams shared publicly.

Attributes

- id
- userId
- dreamId
- content
- createdAt

---

## Comment

Attributes

- id
- postId
- userId
- content
- createdAt

---

## Reaction

Attributes

- id
- postId
- userId
- type

---

## Notification

Attributes

- id
- userId
- title
- message
- readAt
- createdAt

---

# Relationship Summary

User (1)

↓

Dream (N)

↓

Analysis (N)

↓

Visualization (N)

Dream (N)

↓

Emotion (N)

Dream (N)

↓

Symbol (N)

User (1)

↓

Conversation (N)

↓

Messages (N)

User (1)

↓

Reports (N)

User (1)

↓

Community Posts (N)

↓

Comments (N)

↓

Reactions (N)

---

# Index Recommendations

The implementation should consider indexing for:

- email
- createdAt
- userId
- dreamId
- conversationId
- reportPeriod
- emotion
- symbol

Additional indexes should be determined through performance profiling.

---

# Data Retention

The system should support:

- Soft Delete
- Recovery
- Audit Trail
- Version History

Historical records should remain available whenever possible.

---

# Backup Strategy

The database should support:

- Scheduled Backup
- Point-in-Time Recovery
- Disaster Recovery
- Data Validation

Backup frequency should be determined by operational requirements.

---

# Security Considerations

Sensitive fields should be protected.

Examples include:

- Password Hash
- Personal Notes
- AI Conversations
- Dream Content

Encryption at rest and in transit is strongly recommended.

---

# Future Expansion

The schema should remain flexible enough to support:

- Sleep Tracker Integration
- Wearable Devices
- Therapist Collaboration
- Offline Synchronization
- Multi-language Content
- AI Memory Improvements
- Research Mode

Database design should prioritize extensibility without requiring major structural changes.