# 07 — API Contract

# Overview

This document defines the communication contract between the Frontend and Backend.

The API should remain:

- Consistent
- Predictable
- Versionable
- Secure
- Easy to document

This document intentionally does not prescribe REST, GraphQL, tRPC, or other communication styles. The implementation team should recommend the most appropriate approach.

---

# General Principles

Every endpoint should:

- Validate incoming requests.
- Return consistent responses.
- Return meaningful error messages.
- Support future versioning.
- Never expose internal implementation details.

---

# Standard Response Format

Success Response

{
    "success": true,
    "message": "...",
    "data": {},
    "meta": {}
}

---

Error Response

{
    "success": false,
    "message": "...",
    "errors": [],
    "requestId": "...",
    "timestamp": "..."
}

---

# Authentication

Protected endpoints require authentication.

Authentication strategy should support:

- Session
- Token
- Refresh
- OAuth readiness

---

# API Modules

Authentication

User

Dream

Dream Analysis

Visualization

Calendar

Emotion

Report

Community

Conversation

Notification

Administration

---

# Authentication APIs

Register

Login

Logout

Refresh Session

Forgot Password

Reset Password

Verify Email

Current Session

---

# User APIs

Get Profile

Update Profile

Update Avatar

Update Preferences

Update Privacy

Delete Account

Activity Summary

---

# Dream APIs

Create Dream

Update Dream

Delete Dream

Archive Dream

Restore Dream

Get Dream Detail

Get Dream List

Search Dreams

Filter Dreams

Bookmark Dream

---

# Dream Analysis APIs

Generate Analysis

Regenerate Analysis

Get Analysis

Analysis History

Compare Analysis

---

# Visualization APIs

Generate Image

Regenerate Image

Get Gallery

Delete Image

Download Image

Image Detail

---

# Calendar APIs

Monthly Calendar

Weekly Calendar

Daily Calendar

Dream By Date

Calendar Statistics

---

# Emotion APIs

Emotion Summary

Emotion Trend

Emotion Frequency

Dominant Emotion

Emotion Timeline

---

# Symbol APIs

Detected Symbols

Search Symbol

Bookmarked Symbols

Related Dreams

Trending Symbols

---

# Wellness Report APIs

Generate Report

Weekly Report

Monthly Report

Yearly Report

Download Report

Report History

---

# AI Companion APIs

Start Conversation

Continue Conversation

Conversation History

Delete Conversation

Suggested Questions

Conversation Context

---

# Community APIs

Feed

Create Post

Update Post

Delete Post

Comment

Delete Comment

Reaction

Report Content

Search Posts

---

# Notification APIs

Notification List

Read Notification

Delete Notification

Update Preferences

Reminder Configuration

---

# Administration APIs

Dashboard

User Management

Content Moderation

Reports

System Logs

Analytics

---

# Pagination

Endpoints returning collections should support:

Page

Limit

Cursor (optional)

Sorting

Filtering

Searching

---

# Sorting

Supported fields should be documented individually.

Default sorting should prioritize recent data.

---

# Filtering

Common filters include:

Date

Emotion

Symbol

Mood

Visibility

Status

---

# Search

Search should support:

Keyword

Title

Dream Content

Detected Symbol

Emotion

Date Range

---

# Versioning

The API should support future version upgrades without breaking existing clients.

Backward compatibility should be considered whenever possible.

---

# Validation

Every request should validate:

Required Fields

Data Type

Ownership

Permissions

Business Rules

Uploaded Files

---

# File Upload

Supported uploads may include:

Dream Images

Profile Pictures

Generated Images

Reports

Implementation should validate:

Type

Size

Security

Virus Scanning (recommended)

---

# Error Codes

Common error categories:

Authentication

Authorization

Validation

Resource Not Found

Conflict

Rate Limit

Server Error

External Service Failure

---

# Rate Limiting

Sensitive endpoints should support request limits.

Examples:

Authentication

AI Generation

Image Generation

Community Posting

Password Reset

---

# Idempotency

Critical operations should prevent accidental duplication.

Examples:

Payments (future)

Image Generation

Report Generation

AI Requests

---

# API Security

All communication should:

Use HTTPS

Validate Authentication

Validate Authorization

Sanitize Input

Protect Against Injection

Protect Sensitive Data

---

# Logging

Every request should generate:

Request ID

Timestamp

Response Status

Execution Time

Sensitive payloads should never appear inside logs.

---

# Performance

The API should:

Support pagination

Avoid unnecessary payloads

Compress responses

Cache appropriate resources

Optimize repeated queries

---

# Future Expansion

The API should remain flexible enough to support:

Mobile Applications

Desktop Applications

Third-party Integrations

Research Dashboard

Wearable Devices

External AI Providers

Public APIs (future)