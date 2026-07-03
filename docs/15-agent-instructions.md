# 15 — Agent Instructions

# Overview

This document defines how AI coding agents should understand and contribute to Dream Journal Analyzer.

---

# Before Writing Code

Always:

1. Read every file inside `/docs`.
2. Understand the business domain.
3. Understand user flows.
4. Understand business rules.
5. Review API contracts.
6. Review database requirements.

Never generate code without understanding the project context.

---

# Primary Objective

The objective is NOT simply to write code.

The objective is to build a maintainable, scalable, secure, and user-friendly AI-powered application.

---

# Technology Recommendation

Technology choices are intentionally left open.

Before selecting any framework, language, database, AI provider, or infrastructure, evaluate:

- Scalability
- Performance
- Security
- Cost
- Maintainability
- Community Support
- Developer Experience

Explain trade-offs before making recommendations.

---

# Coding Rules

Always:

- Write modular code.
- Follow clean architecture.
- Reuse components.
- Avoid duplication.
- Respect business rules.
- Handle errors consistently.
- Write readable code.

---

# Frontend Guidelines

Prioritize:

- Accessibility
- Responsive Design
- Smooth UX
- Loading States
- Empty States
- Error States

Do not place business logic in the frontend.

---

# Backend Guidelines

Prioritize:

- Validation
- Security
- Modular Services
- Consistent API Contracts
- Background Processing

---

# AI Guidelines

The AI must:

- Encourage self-reflection.
- Avoid medical diagnosis.
- Avoid deterministic conclusions.
- Use historical dream context.
- Explain reasoning whenever possible.

---

# Documentation

Whenever a feature changes:

Update the corresponding documentation before or together with the implementation.

Documentation is part of the product.

---

# General Principles

When multiple implementation options exist:

Recommend the best approach.

Explain advantages and disadvantages.

Avoid making assumptions without justification.