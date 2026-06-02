# Technical Architecture

This document describes the technical implementation and design decisions behind the application's backend architecture and data flow.

## Client-Server Separation

The project is built as a single-page application (SPA) supported by a custom Express backend. 

*   **Frontend**: The React application runs entirely in the browser and handles UI rendering, state management (currently transient), and user interactions.
*   **Backend**: The Express server fulfills two primary roles: serving the static SPA assets in production and securely brokering requests to external APIs. No external API keys are exposed or configured in the React client.

## Request Lifecycle

1.  **Image Upload**: The user selects an image on the frontend via a drag-and-drop interface.
2.  **FormData Payload**: The frontend constructs a `multipart/form-data` payload containing the file and posts it to the Express endpoint (`/api/analyze-v2`).
3.  **Parsing & Validation**: The backend parses the incoming request using `multer`. Memory storage is used since images are immediately converted to a payload format required by the downstream model.
4.  **Prompt Orchestration**: The backend constructs a highly constrained system prompt. This prompt explicitly forces the model to reason through identification and portion estimation *before* outputting its final calculation, improving reliability through Chain-of-Thought (CoT).
5.  **Schema Enforcement**: Downstream generation is forced into a strict JSON schema via API configuration, ensuring the client receives consistently structured, strongly-typed data rather than free-form text.
6.  **Response Delivery**: The structured payload is returned to the client and rendered dynamically. 

## Storage & State Management

**Current Implementation**: Storage is handled in-memory within standard React state hooks (`useState`).
*   **Benefits**: Extremely rapid interaction, zero setup required for prototyping, and immediate reactivity.
*   **Limitations**: Data is lost on a hard refresh. Cross-device syncing is impossible.

**Future Considerations**: Replacing the transient React state with a durable data store (e.g., PostgreSQL, Firestore) would require injecting intermediate database read/write logic into the existing API endpoints before responding to the client.

## External Services

The backend integrates with external generative models (Gemini) strictly via an authenticated server-to-server connection.
*   **Model Selection**: A sub-second latency model is selected over higher-capability reasoning models to ensure the image upload interaction feels responsive.
*   **Confidence Fallbacks**: The prompt instructions explicitly demand lower confidence scores when images are blurry, obscured, or abstract, minimizing hallucinatory outputs and surfacing those warnings to the user interface.
