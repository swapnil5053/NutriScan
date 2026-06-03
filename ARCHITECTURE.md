# Architecture

This document covers the technical implementation and design decisions behind NutriScan's backend and data flow.

## Client-Server Separation

Built as a single-page application backed by a FastAPI server.

- **Frontend**: React app running in the browser. Handles all UI rendering, state management, and user interactions. State is currently transient (in-memory only).
- **Backend**: FastAPI server with two responsibilities — serving the built SPA in production, and proxying requests to the Gemini API. No API keys are ever sent to or stored in the client.

## Request Lifecycle

1. **Image Upload** — User drops or selects a meal photo via the drag-and-drop interface.
2. **FormData Payload** — Frontend constructs a `multipart/form-data` request and POSTs it to `/api/analyze-v2`, optionally including a context string.
3. **Parsing & Validation** — FastAPI reads the file into memory. A 10MB limit is enforced before any API call is made.
4. **Prompt Orchestration** — The backend builds a structured system prompt that forces the model to reason step-by-step through ingredient identification and portion estimation before producing final numbers (Chain-of-Thought).
5. **Schema Enforcement** — The Gemini call uses a strict response schema, so the client always receives predictably structured JSON rather than free-form text.
6. **Response Delivery** — The structured payload is returned directly to the client and rendered.

## State Management

All meal history and user goals live in React `useState` hooks — fast, zero-config, but ephemeral. A hard refresh clears everything.

Adding persistence would mean wiring a database (PostgreSQL, Firestore, etc.) into the existing API endpoints before returning responses.

## External Services

Gemini is called server-side only, over an authenticated connection using the `google-genai` Python SDK.

- Model chosen for low latency over raw capability — keeps the upload-to-result interaction snappy.
- The prompt explicitly requests low-confidence flags when images are unclear, so the UI can surface that to the user rather than silently showing unreliable numbers.
