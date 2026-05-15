# 🌾 Smart Farmer Assistant
### Crop Advisory & Farming Support System
**Final Year CSE Project | Full-Stack Web Application**

---

## 📋 Table of Contents
1. [Project Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Features](#features)
4. [Folder Structure](#folder-structure)
5. [Setup Instructions](#setup)
6. [How Features Work](#how-it-works)
7. [API Integration Guide](#apis)
8. [Sample Data](#sample-data)
9. [Backend Code (Node.js + Express)](#backend)
10. [Database Schema (MongoDB)](#database)

---

## 📌 Project Overview <a name="overview"></a>

Smart Farmer Assistant is an AI-powered agricultural advisory web application designed for Indian farmers. It provides:
- 🌱 **Crop Recommendations** based on soil type, season, and location
- 🔬 **Plant Disease Detection** via image upload
- ⛅ **Weather & Irrigation Advice** with smart scheduling
- 📊 **Live Market/Mandi Prices** for 12+ major crops
- 📁 **User Dashboard** with history and saved recommendations

---

## 🛠 Tech Stack <a name="tech-stack"></a>

| Layer     | Technology                              |
|-----------|----------------------------------------|
| Frontend  | React.js (JSX, Hooks, localStorage)    |
| Charts    | Recharts                               |
| Icons     | Lucide React                           |
| Fonts     | Google Fonts (Fraunces + Plus Jakarta) |
| Backend*  | Node.js + Express.js                   |
| Database* | MongoDB (via Mongoose)                 |
| Auth*     | JWT (JSON Web Tokens)                  |
| AI/ML     | Rule-based engine (upgradeable to TF.js)|

*Backend and database are explained below for reference; the React app is self-contained with localStorage.

---

## ✨ Features <a name="features"></a>

### 🌱 Crop Recommendation
- Inputs: Soil type (6 types), Season (Kharif/Rabi/Zaid), State, pH, Irrigation source
- Engine: Rule-based lookup table with 30+ crop-soil-season combinations
- Output: Top 3 matching crops with confidence %, fertilizer NPK advice, water needs, yield estimate

### 🔬 Disease Detection
- Image upload with drag-and-drop support
- Simulates AI analysis (replace with Plant.id API in production)
- Returns: Disease name, severity, symptoms, treatment, prevention tips

### ⛅ Weather & Irrigation
- Mock weather for 10 major Indian cities
- Smart irrigation advice: rule-based logic using temperature + humidity + rainfall
- Crop-specific irrigation tips (Rice, Wheat, Cotton, etc.)
- 5-day forecast display

### 📊 Market Prices
- 12 major crops with current price, MSP comparison, 30-day change
- Interactive 8-month price trend chart (AreaChart via Recharts)
- MSP compliance badge (Above/Below MSP)

### 👤 User Dashboard
- localStorage-based auth (register, login, logout)
- Query history (last 20 searches)
- Activity stats and seasonal planner

---

## 📁 Folder Structure <a name="folder-structure"></a>

```
smart-farmer-assistant/
│
├── frontend/                          # React.js Application
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.jsx                   # ← Main file (SmartFarmerAssistant.jsx)
│   │   ├── index.js
│   │   ├── components/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── Alert.jsx
│   │   │   └── ProgressBar.jsx
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── CropPage.jsx
│   │   │   ├── DiseasePage.jsx
│   │   │   ├── WeatherPage.jsx
│   │   │   ├── MarketPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   └── AuthPage.jsx
│   │   ├── data/
│   │   │   ├── cropDatabase.js       # Rule-based crop lookup table
│   │   │   ├── diseaseDatabase.js    # Disease info + solutions
│   │   │   ├── marketData.js         # Mock mandi prices
│   │   │   └── weatherData.js        # Mock weather for cities
│   │   └── utils/
│   │       ├── storage.js            # localStorage helpers
│   │       └── irrigationLogic.js    # Rule-based irrigation engine
│   └── package.json
│
├── backend/                           # Node.js + Express API
│   ├── server.js                     # Entry point
│   ├── routes/
│   │   ├── auth.js                   # POST /api/auth/register, /login
│   │   ├── crops.js                  # GET /api/crops/recommend
│   │   ├── disease.js                # POST /api/disease/detect
│   │   ├── weather.js                # GET /api/weather/:city
│   │   └── market.js                 # GET /api/market/prices
│   ├── models/
│   │   ├── User.js                   # Mongoose User schema
│   │   ├── CropData.js               # Crop recommendation logs
│   │   ├── DiseaseData.js            # Disease detection logs
│   │   └── MarketPrice.js            # Mandi price records
│   ├── middleware/
│   │   └── auth.js                   # JWT verification middleware
│   ├── .env                          # Environment variables
│   └── package.json
│
├── README.md                         # ← This file
└── .gitignore
```

---

## ⚙️ Setup Instructions <a name="setup"></a>

### Option A: Run as React Artifact (Quickest)

The file `SmartFarmerAssistant.jsx` is a complete self-contained React component.
You can run it directly in the Claude.ai artifact viewer — no installation needed.

---

### Option B: Run as Full React App

#### Prerequisites
- Node.js v18+ (https://nodejs.org)
- npm or yarn

#### Step 1 — Create React App

```bash
npx create-react-app smart-farmer-assistant
cd smart-farmer-assistant
```

#### Step 2 — Install Dependencies

```bash
npm install recharts lucide-react
```

#### Step 3 — Replace App.js

Copy the contents of `SmartFarmerAssistant.jsx` into `src/App.js`

#### Step 4 — Start the App

```bash
npm start
```

Open http://localhost:3000 in your browser.

---

### Option C: Full Stack (React + Node.js + MongoDB)

#### Backend Setup

```bash
mkdir backend && cd backend
npm init -y
npm install express mongoose bcryptjs jsonwebtoken cors dotenv multer axios
```

Create `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smartfarmer
JWT_SECRET=your_super_secret_key_here
OPENWEATHER_API_KEY=your_openweathermap_key
PLANTID_API_KEY=your_plantid_key
```

Start MongoDB:
```bash
mongod --dbpath /data/db
```

Start backend:
```bash
node server.js
# Server running on http://localhost:5000
```

#### Frontend — Update API Base URL

In `src/utils/api.js`:
```javascript
export const API_BASE = "http://localhost:5000/api";
```

---

## 🧠 How Features Work <a name="how-it-works"></a>

### 1. Crop Recommendation Engine

```
Algorithm: Rule-Based Lookup (Decision Table)

Input:  soilType + season  →  lookup key  →  crop list
         "loam" + "rabi"   →  "loam-rabi" →  [Wheat (97%), Potato (91%), Onion (86%)]

The engine:
  1. Normalizes inputs: "Loam" → "loam", "Rabi (Nov–Mar)" → "rabi"
  2. Constructs a key: soilKey + "-" + seasonKey
  3. Fetches the pre-defined crop array from CROP_DATABASE
  4. Returns crops sorted by confidence score
  5. Includes NPK fertilizer advice for each crop

Confidence scores are based on agronomy research data for Indian conditions.
In production: replace with a trained ML model (scikit-learn Random Forest or XGBoost).
```

### 2. Disease Detection

```
Algorithm: Simulated AI Detection (Mock for Demo)

Input:  Plant image file
Steps:
  1. Read image with FileReader API (browser)
  2. Display preview to user
  3. Simulate API call with 2.2s delay
  4. Randomly select from DISEASE_DATABASE (8 diseases)
  5. Assign confidence score: 75–95% (randomized)
  6. Return: disease name, severity, symptoms, treatment, prevention

In Production — Replace with:
  Option A: Plant.id API
    POST https://plant.id/api/v3/health_assessment
    Headers: { "Api-Key": "YOUR_KEY" }
    Body: { "images": ["base64_encoded_image"], "health": "all" }

  Option B: TensorFlow.js
    Load model: tf.loadLayersModel('/models/plant_disease/model.json')
    Preprocess: resize to 224x224, normalize [0,1]
    Predict: model.predict(tensor).dataSync()
    Map output index → disease name from class_names.json

  Option C: Custom Flask API
    POST /api/disease/detect (multipart/form-data)
    Uses ResNet50 or MobileNetV2 fine-tuned on PlantVillage dataset
```

### 3. Weather & Irrigation Logic

```
Irrigation Rule Engine:

  IF rainfall > 10mm:
    → "Skip irrigation for 2-3 days"
  ELIF rainfall > 0:
    → "Reduce irrigation by 40%"
  ELSE:
    → "Normal irrigation schedule"

  IF temperature > 38°C:
    → "Water early morning (5-7 AM)"

  IF humidity > 75%:
    → "Watch for fungal disease. Avoid overhead irrigation."

  IF humidity < 35%:
    → "Increase irrigation frequency by 20%"

  PLUS crop-specific rules:
    Rice   → Maintain 5-10cm standing water
    Wheat  → 4-5 critical irrigations at specific growth stages
    etc.

In Production: Use OpenWeatherMap API
  GET https://api.openweathermap.org/data/2.5/weather?q={city}&appid={KEY}&units=metric
```

### 4. Market Price Data

```
Data Flow:
  Static mock data → Table display + Recharts AreaChart

In Production: Use data.gov.in Agmarknet API
  GET https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070
  Parameters: api-key, format=json, filters[commodity]=Wheat

Alternatively: AgriMarket API (paid), or scrape from agmarknet.gov.in
```

---

## 🔌 API Integration Guide <a name="apis"></a>

| Feature        | Free API                    | Endpoint                                           |
|----------------|-----------------------------|----------------------------------------------------|
| Weather        | OpenWeatherMap (free tier)  | `/data/2.5/weather?q={city}&appid={KEY}`           |
| Disease        | Plant.id (30 free/month)    | `POST /api/v3/health_assessment`                  |
| Market Prices  | data.gov.in (free, API key) | Agmarknet dataset endpoint                         |
| Soil Data      | NBSS (ICAR)                 | Manual dataset integration                         |

---

## 📦 Backend Code Reference <a name="backend"></a>

### server.js
```javascript
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth',    require('./routes/auth'));
app.use('/api/crops',   require('./routes/crops'));
app.use('/api/disease', require('./routes/disease'));
app.use('/api/weather', require('./routes/weather'));
app.use('/api/market',  require('./routes/market'));

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected ✓'))
  .catch(err => console.error('DB Error:', err));

app.listen(process.env.PORT || 5000, () =>
  console.log(`Server running on port ${process.env.PORT || 5000}`));
```

### routes/auth.js
```javascript
const router = require('express').Router();
const User   = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (await User.findOne({ email }))
      return res.status(400).json({ error: 'Email already registered' });
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hash });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name, email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !await bcrypt.compare(password, user.password))
      return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
```

### routes/crops.js
```javascript
const router   = require('express').Router();
const CropData = require('../models/CropData');
const authMiddleware = require('../middleware/auth');

// GET /api/crops/recommend?soil=loam&season=rabi&location=Punjab
router.get('/recommend', authMiddleware, async (req, res) => {
  try {
    const { soil, season, location } = req.query;
    // Import your CROP_DATABASE from a shared JS file
    const key    = `${soil.toLowerCase()}-${season.toLowerCase()}`;
    const crops  = CROP_DATABASE[key] || [];
    // Save to DB
    await CropData.create({ userId: req.user.id, soil, season, location, crops });
    res.json({ crops, soil, season, location });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
```

### routes/disease.js (with file upload)
```javascript
const router  = require('express').Router();
const multer  = require('multer');
const axios   = require('axios');
const DiseaseData = require('../models/DiseaseData');
const auth    = require('../middleware/auth');

const upload = multer({ dest: 'uploads/', limits: { fileSize: 10*1024*1024 } });

// POST /api/disease/detect (multipart form: field "image")
router.post('/detect', auth, upload.single('image'), async (req, res) => {
  try {
    const fs = require('fs');
    const imageBase64 = fs.readFileSync(req.file.path, { encoding: 'base64' });

    // Call Plant.id API
    const response = await axios.post(
      'https://plant.id/api/v3/health_assessment',
      { images: [`data:image/jpeg;base64,${imageBase64}`], health: 'all' },
      { headers: { 'Api-Key': process.env.PLANTID_API_KEY, 'Content-Type': 'application/json' }}
    );

    const disease = response.data.health_assessment?.diseases?.[0];
    const result  = {
      disease:    disease?.name || 'Unknown',
      confidence: Math.round((disease?.probability || 0) * 100),
      treatment:  disease?.details?.treatment?.chemical?.[0] || 'Consult KVK',
      description:disease?.description || ''
    };

    await DiseaseData.create({ userId: req.user.id, imagePath: req.file.path, result });
    fs.unlinkSync(req.file.path); // cleanup
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
```

---

## 🗄 Database Schema (MongoDB) <a name="database"></a>

```javascript
// models/User.js
const UserSchema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true },
  email:     { type: String, required: true, unique: true, lowercase: true },
  password:  { type: String, required: true },           // bcrypt hashed
  location:  { type: String, default: '' },
  createdAt: { type: Date,   default: Date.now }
});

// models/CropData.js
const CropDataSchema = new mongoose.Schema({
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  soil:       String,    // "Loam", "Clay", etc.
  season:     String,    // "Kharif", "Rabi", "Zaid"
  location:   String,    // Indian state
  crops:      Array,     // Array of recommended crop objects
  createdAt:  { type: Date, default: Date.now }
});

// models/DiseaseData.js
const DiseaseDataSchema = new mongoose.Schema({
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  imagePath:  String,
  result:     {
    disease:    String,
    confidence: Number,
    treatment:  String,
    severity:   String
  },
  createdAt:  { type: Date, default: Date.now }
});

// models/MarketPrice.js
const MarketPriceSchema = new mongoose.Schema({
  crop:       String,
  price:      Number,       // INR per quintal
  location:   String,       // Mandi location
  date:       { type: Date, default: Date.now },
  source:     String        // "Agmarknet", "Manual", etc.
});
```

---

## 🧪 Sample Test Data

**Crop Recommendation Tests:**
| Soil  | Season | Expected Top Crop |
|-------|--------|-------------------|
| Clay  | Kharif | Rice (95%)        |
| Loam  | Rabi   | Wheat (97%)       |
| Sandy | Kharif | Groundnut (93%)   |
| Black | Kharif | Cotton (97%)      |

**Demo Login:** `demo@farmer.in` / `demo123`

---

## 🚀 Deployment

### Frontend (Vercel / Netlify)
```bash
npm run build
# Deploy the /build folder to Vercel or Netlify
```

### Backend (Render / Railway)
```bash
# Set environment variables in dashboard
# Connect GitHub repo → auto-deploy
```

### MongoDB Atlas (Free Cloud DB)
1. Create account at https://cloud.mongodb.com
2. Create free M0 cluster
3. Get connection string → put in MONGODB_URI env var

---

## 📚 References

- ICAR Crop Production Guidelines: https://icar.org.in
- Plant.id Disease Detection API: https://plant.id
- OpenWeatherMap API: https://openweathermap.org/api
- data.gov.in Agmarknet: https://data.gov.in
- PlantVillage Dataset (ML training): https://plantvillage.psu.edu

---

*Built as a Final Year CSE Major Project | Smart Agriculture using AI & Web Technologies*
