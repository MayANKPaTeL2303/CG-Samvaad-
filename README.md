# CG Samvaad – Citizen Grievance & Suggestion Platform

<div align="center">

[Video Demo](https://www.canva.com/design/DAG4UveYNzA/FTYRSpPy80ku8WhNBOowwg/watch?utm_content=DAG4UveYNzA&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=h21bde1fa76) 

</div>

---

## Problem Statement

Citizens often face **difficulty in reporting civic issues** such as water leakage, potholes, garbage, or streetlight failures.  
Current systems are either offline or non-transparent — citizens rarely receive updates about their complaints, and local authorities lack tools to **analyze or prioritize** incoming issues efficiently.

---

### Impact

These challenges result in:
- Delayed resolution of civic issues
- Frustrated citizens feeling unheard
- Inefficient resource allocation by authorities
- Missed opportunities for data-driven governance

---

## Solution

CG Samvaad provides a modern, digital platform that addresses these challenges through:

### For Citizens

- Easy Complaint Submission: Submit issues with photos and location in 3 clicks
- Real-time Tracking: Track complaint status like delivery tracking
- Language Choice: Use platform in your preferred language
- Transparency: See update history and officer responses
- Feedback: Rate and review resolution quality

### For Officials

- Centralized Dashboard: All complaints in one place with filters
- AI-Powered Insights: Automatic grouping of similar complaints
- Visual Analytics: Charts, graphs, and heatmaps for decision-making
- Priority Management: Identify high-impact issues quickly
- Performance Tracking: Monitor resolution times and efficiency

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


## Features

### Core Features

#### 1. User Management
- Secure registration and JWT-based authentication
- Role-based access control (Citizen/Officer)
- Profile management with district affiliation
- Password reset functionality

#### 2. Complaint Management
- **Submit Complaints** with:
  - Title and detailed description
  - Category selection (Water, Roads, Electricity, etc.)
  - Photo upload
  - Geotagged location via interactive map
  - Address details
- **Track Status**: Pending -> In Progress -> Resolved/Rejected

#### 3. Location Features
- **Interactive Map**: OpenStreetMap integration
- **Location Picker**: Click on map to set location
- **Current Location**: Auto-detect using GPS
- **Map Views**: Toggle between list and map visualization
- **Heatmaps**: Geographic density visualization for officers

#### 4. Multilingual Support
- **3 Languages**: English, Hindi, Chhattisgarhi
- **Dynamic Switching**: Change language anytime
- **Full Translation**: All UI elements, categories, and statuses
- **Persistent Selection**: Language preference saved

#### 5. Rating & Feedback System
- **5-Star Rating**: Rate resolved complaints
- **Text Feedback**: Detailed comments on resolution
- **Quality Metrics**: Average ratings per category/officer
- **Citizen Satisfaction**: Track resolution quality

#### 6. AI-Powered Analytics

##### Complaint Clustering
- **SBERT Embeddings**: Semantic understanding of complaints
- **KMeans**: Alternative clustering algorithm
- **Keyword Extraction**: Identify key terms per cluster
- **Auto-Naming**: Generate meaningful cluster names

##### Visual Analytics
- **Category Distribution**: Bar charts showing complaint types
- **Status Overview**: Pie charts for status distribution
- **Trend Analysis**: Line charts for daily/monthly patterns
- **Top Categories**: Most frequent complaint types
- **Resolution Time**: Average time to resolve by category

#### 7. Officer Dashboard
- **Real-time Statistics**: Total, pending, in-progress, resolved counts
- **Interactive Charts**: Built with Recharts library
- **Filter & Search**: Advanced filtering options
- **Bulk Actions**: Assign multiple complaints

---

## Tech Stack

| Layer | Technology |
|--------|-------------|
| **Frontend** | HTML, CSS, JavaScript, React, Leaflet.js |
| **Backend** | Django  |
| **Database** | PostgreSQL |
| **AI Integration** | SBERT, BERTopic (Hugging Face Transformers) |
| **Mapping** | OpenStreetMap (Nominatim API + Leaflet.js) |

---

## Architecture

### System Architecture Diagram
```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│                 │         │                 │         │                 │
│  React Frontend │ ◄─────► │  Django REST    │ ◄─────► │   PostgreSQL    │
│   (Vercel)      │  HTTP   │      API        │   ORM   │    Database     │
│                 │         │   (Render)      │         │   (Render)      │
└─────────────────┘         └─────────────────┘         └─────────────────┘
                                     │
                                     │
                                     ▼
                            ┌─────────────────┐
                            │                 │
                            │   AI Service    │
                            │  SBERT +        │
                            │  BERTopic       │
                            │                 │
                            └─────────────────┘
```

## Getting Started

### Prerequisites

### Quick Start
```bash
git clone https://github.com/MayANKPaTeL2303/CG-Samvaad-
cd cg-samvaad-

cd backend
python -m venv venv
source venv/bin/activate  
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver

# In a new terminal, setup frontend
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000` to see the application running.

For detailed setup instructions, see [SETUP_GUIDE.md](./SETUP_GUIDE.md)

---

## Installation

### Backend Setup

#### 1. Create Virtual Environment
```bash
cd backend
python -m venv venv

# Activate virtual environment
# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

#### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

#### 3. Configure Database

Create PostgreSQL database:
```sql
-- In PostgreSQL shell (psql)
CREATE DATABASE cgsamvaad_db;
CREATE USER cgsamvaad_user WITH PASSWORD 'your_password';
ALTER ROLE cgsamvaad_user SET client_encoding TO 'utf8';
ALTER ROLE cgsamvaad_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE cgsamvaad_user SET timezone TO 'Asia/Kolkata';
GRANT ALL PRIVILEGES ON DATABASE cgsamvaad_db TO cgsamvaad_user;

-- For PostgreSQL 15+
\c cgsamvaad_db
GRANT ALL ON SCHEMA public TO cgsamvaad_user;
```

#### 4. Environment Variables

Create `.env` file in `backend/` directory:
```env
SECRET_KEY=your-secret-key-here
DEBUG=True
DB_NAME=cgsamvaad_db
DB_USER=cgsamvaad_user
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
```

#### 5. Update Settings

Edit `cgsamvaad/settings.py`:
```python
# Add before INSTALLED_APPS
AUTH_USER_MODEL = 'users.User'

# Update DATABASES section
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('DB_NAME'),
        'USER': os.environ.get('DB_USER'),
        'PASSWORD': os.environ.get('DB_PASSWORD'),
        'HOST': os.environ.get('DB_HOST'),
        'PORT': os.environ.get('DB_PORT'),
    }
}
```

#### 6. Run Migrations
```bash
python manage.py makemigrations users
python manage.py makemigrations complaints
python manage.py makemigrations analytics
python manage.py migrate
```

#### 7. Create Superuser
```bash
python manage.py createsuperuser
```

#### 8. Start Development Server
```bash
python manage.py runserver
```

Backend will be available at: http://localhost:8000

---

### Frontend Setup

#### 1. Install Dependencies
```bash
cd frontend
npm install
```

If you encounter peer dependency issues:
```bash
npm install --legacy-peer-deps
```

#### 2. Environment Variables

Create `.env` file in `frontend/` directory:
```env
REACT_APP_API_URL=http://localhost:8000/api
```

#### 3. Start Development Server
```bash
npm start
```

Frontend will be available at: http://localhost:3000

---

**A Code for Chhattisgarh Initiative**

</div>
