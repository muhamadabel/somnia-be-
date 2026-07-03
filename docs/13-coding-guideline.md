# 13 — Coding Guideline

# Overview

This document defines the engineering standards used throughout Dream Journal Analyzer.

The objective is to maintain consistency, readability, scalability, and maintainability regardless of the selected technology stack.

---

# Engineering Principles

Every implementation should prioritize:

- Readability
- Maintainability
- Reusability
- Simplicity
- Testability
- Security

Always prefer clear code over clever code.

---

# Architecture Principles

Recommended principles:

- Separation of Concerns
- Single Responsibility
- Dependency Injection
- Clean Architecture
- Domain Driven Design
- Modular Design

Business logic should remain independent from frameworks.

---

# Naming Convention

Names should be:

- Clear
- Descriptive
- Consistent

Avoid abbreviations unless universally understood.

Examples

Good

CreateDream

GenerateReport

EmotionSummary

Poor

DoData

TempObject

Manager2

---

# Folder Organization

Each module should contain:

- Domain
- Application
- Infrastructure
- Interface

Avoid placing unrelated files in the same directory.

---

# Functions

Functions should:

- Perform one responsibility.
- Be easy to understand.
- Avoid unnecessary complexity.
- Return predictable results.

---

# Error Handling

Errors should:

- Be meaningful.
- Be logged appropriately.
- Never expose sensitive data.
- Be consistent across the application.

---

# Validation

Validation should occur before business logic executes.

Never rely solely on frontend validation.

---

# Logging

Log:

- Errors
- Warnings
- Important Events

Do not log:

- Passwords
- Secrets
- Dream Content
- AI Prompts containing sensitive information

---

# Documentation

Public modules should include documentation.

Complex logic should explain:

- Why it exists
- Business purpose
- Important assumptions

---

# Testing

The project should support:

Unit Tests

Integration Tests

End-to-End Tests

Regression Tests

Security Tests

Critical business logic should always be covered by tests.

---

# Performance

Avoid:

- Duplicate queries
- Unnecessary rendering
- Blocking operations
- Memory leaks

Optimize only after measuring.

---

# Security

Always:

Validate Input

Escape Output

Protect Secrets

Verify Permissions

Encrypt Sensitive Data

---

# Code Review Checklist

Before merging code:

✓ Tests pass

✓ No security issues

✓ Documentation updated

✓ Naming consistent

✓ Business rules respected

✓ Performance acceptable

✓ No duplicated logic

---

# Technology Selection

Technology decisions should prioritize:

Maintainability

Scalability

Developer Experience

Community Support

Performance

Long-Term Sustainability