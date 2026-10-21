# Agents & Collaboration Guide

## Project Context
**AI-Powered Application Validation, Document Authentication and Regulatory Compliance Verification** (SIH 2026)

This repository contains an end-to-end regulatory document scrutiny platform built with FastAPI (Python) and Vanilla JS/CSS.

## Guidelines for Collaborating Agents

### 1. Codebase Architecture
- `app/`: FastAPI application backend
  - `models/`: SQLAlchemy declarative database models
  - `routers/`: REST API endpoints (Auth, Applications, Documents, Validation, Findings, Rules, Dashboard, Audit)
  - `services/`: Business logic, document storage, text extraction (PyMuPDF / OCR), validation engine, verification adapters
  - `schemas/`: Pydantic models for validation and response serialization
- `frontend/`: Static web UI assets (`index.html`, `styles.css`, `app.js`)
- `storage/`: Local secure document storage directory (auto-created on startup)
- `tests/`: Automated test suite with Pytest
- `scripts/`: Utilities for database seeding, synthetic document generation, and demo setup
- `docs/`: System documentation (PRD, Technical Design, Implementation Plan, Test Plan, Decisions)

### 2. Implementation Rules
- **No Paid APIs / No Cloud Dependencies**: Everything must operate cleanly in a self-contained local environment.
- **Explainability**: Every finding produced by the validation engine must include rule references, evidence snippets, and human-readable explanations.
- **Non-blocking Uncertainty**: Make documented, sensible decisions rather than blocking on minor details.
- **Deterministic Rules & Heuristics**: Distinguish between hard deterministic compliance checks (completeness, expired dates) and heuristic flags (tampering indicators, fuzzy mismatches).
- **Security**: Never trust client-supplied filenames or MIME types. Compute SHA-256 hashes immediately. Validate role-based authorization on the backend.
