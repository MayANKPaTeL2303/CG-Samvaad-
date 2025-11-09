# CG Samvaad – Citizen Grievance & Suggestion Platform

## Problem Statement

Citizens often face **difficulty in reporting civic issues** such as water leakage, potholes, garbage, or streetlight failures.  
Current systems are either offline or non-transparent — citizens rarely receive updates about their complaints, and local authorities lack tools to **analyze or prioritize** incoming issues efficiently.

---

## Solution

**CG Samvaad** is a multilingual (English, Hindi, and Chhattisgarhi) web platform designed to bridge the gap between **citizens and local authorities**.  
It allows users to:

- Submit complaints with **title, description, photo, and geotagged location**
- Select issue category (e.g., Water Supply, Roads, Electricity)
- Track the **status** of complaints like delivery tracking
- Rate the **resolution quality**
- Enable authorities to detect common issues with the help of **AI-based clustering and summarization** 

> The platform aims to make civic governance **transparent, data-driven, and citizen-friendly**.

---

## Current Implementation 
- Citizen/Authorities can register or login in the website
- Citizen can List down there all issue and can upload photos and location 
- Citizen can see his issues and current status of that issue, and all the issues are seen by authorities
- Multilinguality UI, so that every user can understands the language easily

## Future Implementation

### AI Complaint Summarization (Planned)
In the upcoming part, we plan to use **SBERT (Sentence-BERT)** and **BERTopic** to:
- Group similar complaints using **semantic similarity** with the help of clustering and vector embeddings.
- Generate concise **summaries** of frequently reported issues.
- Help district officers **prioritize problems** intelligently.

### Officer Dashboard (Planned)
District officers will have access to:
- **Complaint analytics** (by category, region, and priority)
- **Map-based visualization** of complaints
- **Status tracking** (Pending / In-Progress / Resolved)
- **AI insights** (most common issues & hotspots)

---

## Tech Stack

| Layer | Technology |
|--------|-------------|
| **Frontend** | HTML, CSS, JavaScript, React, Leaflet.js |
| **Backend** | Django  |
| **Database** | PostgreSQL |
| **AI Layer (Planned)** | SBERT, BERTopic (Hugging Face Transformers) |
| **Mapping** | OpenStreetMap (Nominatim API + Leaflet.js) |

---
