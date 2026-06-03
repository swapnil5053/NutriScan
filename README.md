# NutriScan

AI-powered meal analysis, nutrition insights, and personalized dietary coaching using Gemini Vision.

## Overview

NutriScan explores how multimodal AI can replace traditional food-classification pipelines by reasoning directly about meals, nutritional composition, and dietary patterns from a single image.

Users can upload a meal photo, receive structured nutritional insights, track eating habits, and interact with an AI coach grounded in their meal history.

---

## System Architecture

```mermaid
flowchart LR

    A[Meal Image] --> B[Gemini 2.5 Flash]

    B --> C[Visual Decomposition]
    B --> D[Portion Estimation]
    B --> E[Nutrition Reasoning]

    C --> F[Structured Meal Analysis]
    D --> F
    E --> F

    F --> G[Nutrition Intelligence]
    F --> H[Meal History]
    F --> I[AI Nutrition Coach]
```

---

## Screenshots

### Meal Analysis

![Meal Analysis Upload](./Img/Screenshot%202026-06-03%20020546.png)

![Meal Analysis Detail](./Img/image.png)

### Meal History

![Meal History](./Img/Screenshot%202026-06-03%20020735.png)

### Nutrition Coach

![Nutrition Coach](./Img/Screenshot%202026-06-03%20022136.png)

---

## Features

* Meal recognition from images
* Portion-size estimation
* Nutrition and health scoring
* Dietary flag detection
* Behavioral nutrition insights
* Historical meal tracking
* AI-powered nutrition coaching

---

## Tech Stack

| Layer     | Technology          |
| --------- | ------------------- |
| Frontend  | React, Tailwind CSS |
| Backend   | Node.js, Express    |
| AI        | Gemini 2.5 Flash    |
| Animation | Framer Motion       |
| Language  | TypeScript          |

---

## Setup

```bash
git clone <repository-url>
cd nutriscan

npm install
npm run dev
```

Create a `.env` file:

```env
GEMINI_API_KEY=your_api_key
```

---

## Future Roadmap

* Daily nutrition dashboard
* Long-term dietary analytics
* Smart meal planning
* Grocery recommendations
* Wearable integrations

---

## Known Limitations

* Nutrition values are estimates and depend on image quality.
* Portion-size estimation remains an approximation.
* Results should not be considered medical advice.

```
```
