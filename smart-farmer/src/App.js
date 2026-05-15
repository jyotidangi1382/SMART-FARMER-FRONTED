/**
 * ============================================================
 * SMART FARMER ASSISTANT - Crop Advisory & Farming Support
 * ============================================================
 * Tech Stack: React.js (Single Page Application)
 * Features:
 *   - Crop Recommendation (Rule-based AI logic)
 *   - Disease Detection (Simulated with confidence scoring)
 *   - Weather & Irrigation Advice (Mock API)
 *   - Market/Mandi Prices (Static dataset + charts)
 *   - User Dashboard (localStorage persistence)
 *   - Login / Register (localStorage auth)
 *
 * HOW CROP RECOMMENDATION WORKS:
 *   A lookup table maps [soilType + season] pairs to suitable crops.
 *   The rule engine filters by location climate zone for extra precision.
 *   Each crop entry includes NPK fertilizer advice and yield notes.
 *
 * HOW DISEASE DETECTION WORKS:
 *   User uploads a plant image → file is read in the browser.
 *   A rule engine picks from a curated disease database,
 *   assigns a simulated confidence score, and returns treatment advice.
 *   (In production: replace with a Plant.id / TensorFlow.js call)
 *
 * API USAGE (replace mocks with real endpoints):
 *   - Weather: OpenWeatherMap /weather?q={city}&appid={KEY}
 *   - Market:  data.gov.in Agmarknet API or AGMARKET API
 *   - Disease: Plant.id API  https://plant.id/api/v3/health_assessment
 * ============================================================
 */

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Sun, Cloud, CloudRain, Wind, Droplets, Thermometer,
  Leaf, Bug, TrendingUp, BarChart2, User, LogIn, LogOut,
  Home, Menu, X, ChevronRight, ChevronDown, Upload,
  Search, Bell, Settings, Star, Clock, MapPin, Sprout,
  FlaskConical, ShieldCheck, AlertTriangle, CheckCircle2,
  ArrowRight, Loader2, Eye, EyeOff, Plus, Trash2,
  BookOpen, Award, Activity, Package, RefreshCw
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, Legend
} from "recharts";

// ─── GLOBAL STYLES ───────────────────────────────────────────
const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,600;0,700;0,900;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --forest: #1a4a2e;
    --forest-mid: #2d6a4f;
    --forest-light: #52b788;
    --forest-pale: #d8f3dc;
    --amber: #e9841a;
    --amber-light: #f5a623;
    --amber-pale: #fff3d6;
    --cream: #faf7f2;
    --brown: #5c3d11;
    --soil: #8b6914;
    --sky: #3a86b4;
    --sky-pale: #dbeeff;
    --red-alert: #c0392b;
    --red-pale: #fdecea;
    --text-dark: #1c1c1e;
    --text-mid: #4a4a52;
    --text-muted: #8e8e93;
    --border: #e5e0d8;
    --shadow: 0 2px 20px rgba(26,74,46,0.08);
    --shadow-hover: 0 8px 40px rgba(26,74,46,0.15);
    --radius: 16px;
    --radius-sm: 10px;
  }

  html { scroll-behavior: smooth; }
  body { font-family: 'Plus Jakarta Sans', sans-serif; background: var(--cream); color: var(--text-dark); -webkit-font-smoothing: antialiased; }

  h1,h2,h3 { font-family: 'Fraunces', serif; }

  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: var(--cream); }
  ::-webkit-scrollbar-thumb { background: var(--forest-mid); border-radius: 3px; }

  .fade-in { animation: fadeIn 0.45s ease forwards; }
  .slide-up { animation: slideUp 0.4s ease forwards; }
  .scale-in { animation: scaleIn 0.3s ease forwards; }

  @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
  @keyframes slideUp { from { opacity:0; transform:translateY(24px) } to { opacity:1; transform:translateY(0) } }
  @keyframes scaleIn { from { opacity:0; transform:scale(0.94) } to { opacity:1; transform:scale(1) } }
  @keyframes spin { to { transform: rotate(360deg) } }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
  @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }

  .spin { animation: spin 1s linear infinite; }
  .pulse-anim { animation: pulse 2s ease infinite; }

  input, select, textarea {
    font-family: 'Plus Jakarta Sans', sans-serif;
    outline: none;
    transition: border 0.2s, box-shadow 0.2s;
  }
  input:focus, select:focus, textarea:focus {
    border-color: var(--forest-mid) !important;
    box-shadow: 0 0 0 3px rgba(82,183,136,0.2) !important;
  }
  button { cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; }

  .tag {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 3px 10px; border-radius: 20px;
    font-size: 12px; font-weight: 600; letter-spacing: 0.3px;
  }
  .tag-green { background: var(--forest-pale); color: var(--forest); }
  .tag-amber { background: var(--amber-pale); color: var(--soil); }
  .tag-blue { background: var(--sky-pale); color: var(--sky); }
  .tag-red { background: var(--red-pale); color: var(--red-alert); }

  .card {
    background: #fff; border-radius: var(--radius);
    box-shadow: var(--shadow); border: 1px solid var(--border);
    transition: box-shadow 0.25s, transform 0.25s;
  }
  .card:hover { box-shadow: var(--shadow-hover); }

  .btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 10px 22px; border-radius: 10px; border: none;
    font-size: 14px; font-weight: 600; transition: all 0.2s;
  }
  .btn-primary {
    background: var(--forest); color: #fff;
  }
  .btn-primary:hover { background: var(--forest-mid); transform: translateY(-1px); box-shadow: 0 6px 20px rgba(26,74,46,0.25); }
  .btn-secondary {
    background: transparent; color: var(--forest);
    border: 2px solid var(--forest-pale);
  }
  .btn-secondary:hover { background: var(--forest-pale); }
  .btn-amber { background: var(--amber); color: #fff; }
  .btn-amber:hover { background: var(--amber-light); transform: translateY(-1px); }
  .btn-outline { background: transparent; color: var(--text-mid); border: 1.5px solid var(--border); }
  .btn-outline:hover { border-color: var(--forest-mid); color: var(--forest); }

  .form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 18px; }
  .form-label { font-size: 13px; font-weight: 600; color: var(--text-mid); }
  .form-input {
    padding: 11px 14px; border: 1.5px solid var(--border);
    border-radius: var(--radius-sm); font-size: 14px; color: var(--text-dark);
    background: #fff; width: 100%;
  }
  .form-select {
    padding: 11px 14px; border: 1.5px solid var(--border);
    border-radius: var(--radius-sm); font-size: 14px; color: var(--text-dark);
    background: #fff; width: 100%; appearance: none;
  }

  .section-title {
    font-family: 'Fraunces', serif; font-size: 28px; font-weight: 700;
    color: var(--forest); line-height: 1.2;
  }
  .section-sub { font-size: 15px; color: var(--text-muted); margin-top: 6px; line-height: 1.6; }

  .divider { height: 1px; background: var(--border); margin: 24px 0; }

  .nav-item {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 14px; border-radius: var(--radius-sm);
    font-size: 14px; font-weight: 500; color: var(--text-mid);
    cursor: pointer; transition: all 0.18s; border: none; background: none; width: 100%; text-align: left;
  }
  .nav-item:hover { background: var(--forest-pale); color: var(--forest); }
  .nav-item.active { background: var(--forest); color: #fff; }
  .nav-item.active svg { color: var(--forest-pale); }

  .stat-card {
    background: #fff; border-radius: var(--radius); padding: 20px;
    border: 1px solid var(--border); box-shadow: var(--shadow);
  }

  .progress-bar {
    height: 8px; background: var(--forest-pale); border-radius: 4px; overflow: hidden;
  }
  .progress-fill {
    height: 100%; background: var(--forest-mid); border-radius: 4px;
    transition: width 1s ease;
  }

  .table-wrap { overflow-x: auto; border-radius: var(--radius-sm); border: 1px solid var(--border); }
  table { width: 100%; border-collapse: collapse; font-size: 14px; }
  thead tr { background: var(--forest); color: #fff; }
  thead th { padding: 12px 16px; text-align: left; font-weight: 600; font-size: 13px; }
  tbody tr { border-bottom: 1px solid var(--border); transition: background 0.15s; }
  tbody tr:hover { background: var(--forest-pale); }
  tbody td { padding: 11px 16px; color: var(--text-dark); }
  tbody tr:last-child { border-bottom: none; }

  .upload-zone {
    border: 2px dashed var(--border); border-radius: var(--radius);
    padding: 40px 20px; text-align: center; cursor: pointer;
    transition: all 0.25s; background: var(--cream);
  }
  .upload-zone:hover, .upload-zone.drag-over {
    border-color: var(--forest-mid); background: var(--forest-pale);
  }

  .weather-card {
    background: linear-gradient(135deg, var(--sky) 0%, #1e6fa8 100%);
    border-radius: var(--radius); color: #fff; padding: 28px;
    position: relative; overflow: hidden;
  }
  .weather-card::before {
    content: ''; position: absolute; top: -40px; right: -40px;
    width: 180px; height: 180px; border-radius: 50%;
    background: rgba(255,255,255,0.08);
  }

  @media (max-width: 768px) {
    .section-title { font-size: 22px; }
    .hide-mobile { display: none !important; }
    .sidebar { transform: translateX(-100%); position: fixed !important; z-index: 1000; transition: transform 0.3s; }
    .sidebar.open { transform: translateX(0); }
    .main-layout { padding-left: 0 !important; }
  }
`;

// ─── DATA LAYER ──────────────────────────────────────────────

/** CROP RECOMMENDATION ENGINE
 * Rule-based: maps soil type + season → best crops
 * Each entry has fertilizer advice, water needs, and yield info
 */
const CROP_DATABASE = {
  "clay-kharif":   [
    { name: "Rice",    emoji:"🌾", confidence:95, fertilizer:"Urea 120kg/ha + DAP 60kg/ha", water:"High (daily irrigation)", days:120, yield:"4-6 tonnes/ha", notes:"Ideal for waterlogged clay soils." },
    { name: "Maize",   emoji:"🌽", confidence:85, fertilizer:"NPK 120:60:40 kg/ha", water:"Moderate (every 5 days)", days:90, yield:"5-7 tonnes/ha", notes:"Well-drained clay gives best results." },
    { name: "Cotton",  emoji:"🌿", confidence:78, fertilizer:"NPK 100:50:50 + Micronutrients", water:"Moderate-High", days:160, yield:"2-3 tonnes/ha", notes:"Black cotton soil preferred." },
  ],
  "clay-rabi": [
    { name: "Wheat",   emoji:"🌾", confidence:96, fertilizer:"Urea 150kg/ha + DAP 100kg/ha", water:"Low-Moderate (3-4 irrigations)", days:135, yield:"3-5 tonnes/ha", notes:"Best crop for clay in winter." },
    { name: "Mustard", emoji:"🌻", confidence:88, fertilizer:"NPK 80:40:40 kg/ha", water:"Low (2-3 irrigations)", days:105, yield:"1.5-2 tonnes/ha", notes:"Good income crop; needs well-prepared seedbed." },
    { name: "Gram",    emoji:"🫘", confidence:82, fertilizer:"DAP 50kg/ha + Rhizobium inoculant", water:"Very Low", days:115, yield:"1.2-1.8 tonnes/ha", notes:"Nitrogen-fixing; improves soil." },
  ],
  "clay-zaid": [
    { name: "Sunflower",emoji:"🌻",confidence:88, fertilizer:"NPK 80:60:40 kg/ha", water:"Moderate", days:85, yield:"1.5-2 tonnes/ha", notes:"Short duration; good for gap filling." },
    { name: "Mung Bean",emoji:"🫛",confidence:84, fertilizer:"DAP 25kg/ha only", water:"Low-Moderate", days:65, yield:"0.8-1 tonne/ha", notes:"Fixes nitrogen for next crop." },
  ],
  "loam-kharif": [
    { name: "Soybean",  emoji:"🫘", confidence:94, fertilizer:"NPK 30:60:40 kg/ha + Rhizobium", water:"Moderate", days:95, yield:"2-3 tonnes/ha", notes:"Excellent on well-drained loam." },
    { name: "Groundnut",emoji:"🥜", confidence:90, fertilizer:"Gypsum 400kg/ha + NPK 20:60:0", water:"Moderate", days:115, yield:"2-3 tonnes/ha", notes:"Rich in oil; good market value." },
    { name: "Maize",    emoji:"🌽", confidence:88, fertilizer:"NPK 120:60:40 kg/ha", water:"Moderate", days:90, yield:"6-8 tonnes/ha", notes:"Best yields on loam soil." },
  ],
  "loam-rabi": [
    { name: "Wheat",    emoji:"🌾", confidence:97, fertilizer:"NPK 150:75:40 kg/ha", water:"Moderate (4-5 irrigations)", days:135, yield:"4-6 tonnes/ha", notes:"Loam is the gold standard for wheat." },
    { name: "Potato",   emoji:"🥔", confidence:91, fertilizer:"NPK 180:90:120 kg/ha", water:"High (every 7-10 days)", days:90, yield:"25-30 tonnes/ha", notes:"Very profitable on loam." },
    { name: "Onion",    emoji:"🧅", confidence:86, fertilizer:"NPK 100:50:50 kg/ha", water:"Moderate", days:120, yield:"20-25 tonnes/ha", notes:"High-value cash crop." },
  ],
  "loam-zaid": [
    { name: "Cucumber", emoji:"🥒", confidence:89, fertilizer:"NPK 80:40:40 kg/ha", water:"High (every 3-4 days)", days:60, yield:"20-25 tonnes/ha", notes:"Fast growing; excellent summer crop." },
    { name: "Watermelon",emoji:"🍉",confidence:86, fertilizer:"NPK 60:40:40 kg/ha", water:"Moderate-High", days:75, yield:"30-40 tonnes/ha", notes:"High demand in summer." },
  ],
  "sandy-kharif": [
    { name: "Groundnut",emoji:"🥜", confidence:93, fertilizer:"NPK 20:60:0 + Gypsum 200kg/ha", water:"Moderate (every 7 days)", days:115, yield:"1.5-2.5 tonnes/ha", notes:"Sandy loam suits groundnut best." },
    { name: "Pearl Millet",emoji:"🌾",confidence:91, fertilizer:"NPK 60:30:0 kg/ha", water:"Low (drought-tolerant)", days:75, yield:"2-3 tonnes/ha", notes:"Ideal for arid/semi-arid sandy soils." },
    { name: "Sesame",   emoji:"🌿", confidence:84, fertilizer:"NPK 30:15:0 kg/ha", water:"Low", days:85, yield:"0.5-0.8 tonnes/ha", notes:"High oil content; good export value." },
  ],
  "sandy-rabi": [
    { name: "Mustard",  emoji:"🌻", confidence:87, fertilizer:"NPK 80:40:20 kg/ha", water:"Low-Moderate", days:105, yield:"1-1.5 tonnes/ha", notes:"Good on sandy loam in semi-arid zones." },
    { name: "Barley",   emoji:"🌾", confidence:90, fertilizer:"NPK 80:40:20 kg/ha", water:"Low (drought-hardy)", days:110, yield:"2-3.5 tonnes/ha", notes:"Excellent for sandy, slightly saline soils." },
    { name: "Gram",     emoji:"🫘", confidence:83, fertilizer:"DAP 40kg/ha + Rhizobium", water:"Very Low", days:110, yield:"0.8-1.2 tonnes/ha", notes:"Thrives with minimal irrigation." },
  ],
  "sandy-zaid": [
    { name: "Watermelon",emoji:"🍉",confidence:92, fertilizer:"NPK 60:40:40 kg/ha + organic matter", water:"Moderate", days:80, yield:"25-35 tonnes/ha", notes:"Sandy soil drains well; ideal for melons." },
    { name: "Mung Bean", emoji:"🫛",confidence:85, fertilizer:"DAP 20kg/ha", water:"Low", days:60, yield:"0.6-0.9 tonnes/ha", notes:"Short duration; suits sandy soils well." },
  ],
  "black-kharif": [
    { name: "Cotton",   emoji:"🌿", confidence:97, fertilizer:"NPK 120:60:60 + Zinc Sulphate 20kg/ha", water:"Moderate (every 7-10 days)", days:180, yield:"2.5-4 tonnes/ha", notes:"Black (Vertisol) soil is famous for cotton." },
    { name: "Sorghum",  emoji:"🌾", confidence:88, fertilizer:"NPK 80:40:0 kg/ha", water:"Low-Moderate", days:105, yield:"3-4 tonnes/ha", notes:"Excellent feed crop; drought-tolerant." },
  ],
  "black-rabi": [
    { name: "Wheat",    emoji:"🌾", confidence:91, fertilizer:"NPK 120:60:40 kg/ha", water:"Moderate (3-4 irrigations)", days:130, yield:"3-5 tonnes/ha", notes:"Retains moisture well in rabi season." },
    { name: "Gram",     emoji:"🫘", confidence:94, fertilizer:"DAP 60kg/ha + Rhizobium inoculant", water:"Very Low (residual moisture)", days:110, yield:"1.5-2 tonnes/ha", notes:"Classic black soil rabi crop." },
    { name: "Linseed",  emoji:"🌿", confidence:80, fertilizer:"NPK 40:30:0 kg/ha", water:"Low", days:110, yield:"0.8-1.2 tonnes/ha", notes:"Industrial + edible value." },
  ],
  "red-kharif": [
    { name: "Finger Millet",emoji:"🌾",confidence:90, fertilizer:"NPK 60:30:20 kg/ha", water:"Moderate (every 7-10 days)", days:90, yield:"2-3 tonnes/ha", notes:"Ideal for acidic red soils." },
    { name: "Groundnut",emoji:"🥜", confidence:88, fertilizer:"NPK 20:60:0 + Gypsum 250kg/ha", water:"Moderate", days:115, yield:"1.5-2 tonnes/ha", notes:"Good on well-drained red soils." },
    { name: "Maize",    emoji:"🌽", confidence:85, fertilizer:"NPK 100:50:30 + Lime (if acidic)", water:"Moderate-High", days:90, yield:"4-5 tonnes/ha", notes:"Correct pH to 6.0–6.5 for best results." },
  ],
  "red-rabi": [
    { name: "Groundnut",emoji:"🥜", confidence:82, fertilizer:"Gypsum 300kg/ha + DAP 50kg/ha", water:"Low-Moderate", days:115, yield:"1.2-1.8 tonnes/ha", notes:"Summer peanut in red soils does well." },
    { name: "Sunflower", emoji:"🌻",confidence:86, fertilizer:"NPK 80:60:60 kg/ha + Boron 1kg/ha", water:"Moderate", days:90, yield:"1.5-2 tonnes/ha", notes:"High oil crop; excellent return." },
    { name: "Sorghum",  emoji:"🌾", confidence:84, fertilizer:"NPK 80:40:0 kg/ha", water:"Low", days:105, yield:"2.5-3.5 tonnes/ha", notes:"Tolerates acidity well." },
  ],
  "silt-kharif": [
    { name: "Jute",     emoji:"🌿", confidence:91, fertilizer:"NPK 60:30:30 kg/ha", water:"High", days:105, yield:"2-3 tonnes/ha", notes:"Silt-rich river belts are ideal for jute." },
    { name: "Rice",     emoji:"🌾", confidence:96, fertilizer:"Urea 100kg/ha + DAP 50kg/ha", water:"High", days:120, yield:"5-7 tonnes/ha", notes:"Alluvial silt gives excellent rice yields." },
    { name: "Maize",    emoji:"🌽", confidence:87, fertilizer:"NPK 120:60:40 kg/ha", water:"Moderate", days:90, yield:"6-9 tonnes/ha", notes:"Silty loam top yields for maize." },
  ],
  "silt-rabi": [
    { name: "Wheat",    emoji:"🌾", confidence:95, fertilizer:"NPK 150:75:40 kg/ha", water:"Moderate (4 irrigations)", days:135, yield:"5-7 tonnes/ha", notes:"Alluvial silt = highest wheat yields in India." },
    { name: "Mustard",  emoji:"🌻", confidence:89, fertilizer:"NPK 80:40:0 kg/ha", water:"Low-Moderate (2-3 irrigations)", days:100, yield:"2-2.5 tonnes/ha", notes:"Excellent oil content on alluvial soils." },
    { name: "Lentil",   emoji:"🫘", confidence:85, fertilizer:"DAP 40kg/ha + Rhizobium", water:"Low", days:115, yield:"1.0-1.5 tonnes/ha", notes:"Nitrogen-fixing legume." },
  ],
};

/** DISEASE DETECTION DATABASE
 * Used when user uploads a plant image
 */
const DISEASE_DATABASE = [
  { id:"d1", crop:"Wheat",   disease:"Wheat Rust (Brown Rust)",     emoji:"🟤", severity:"High",
    symptoms:"Orange-brown pustules on leaves and stems. Rapid spread in humid conditions.",
    solution:"Apply Propiconazole 25% EC @ 0.1% solution. Remove infected plant debris. Use rust-resistant varieties like HD-2967.",
    prevention:"Timely sowing, balanced fertilization, monitor field weekly from tillering stage.",
    confidence: 91 },
  { id:"d2", crop:"Rice",    disease:"Rice Blast",                   emoji:"💀", severity:"High",
    symptoms:"Diamond-shaped lesions with gray centers and brown borders on leaves and neck.",
    solution:"Spray Tricyclazole 75% WP @ 0.6g/L or Isoprothiolane @ 1.5ml/L. Remove infected plants.",
    prevention:"Use resistant varieties (Pusa Basmati 1121). Avoid excessive nitrogen. Maintain proper spacing.",
    confidence: 88 },
  { id:"d3", crop:"Tomato",  disease:"Early Blight (Alternaria)",    emoji:"🟡", severity:"Medium",
    symptoms:"Dark brown concentric ring spots on lower leaves. Yellow halo around lesions.",
    solution:"Apply Mancozeb 75% WP @ 2.5g/L or Copper Oxychloride @ 3g/L. Spray every 7-10 days.",
    prevention:"Crop rotation (3 years), remove infected leaves, stake plants for air circulation.",
    confidence: 85 },
  { id:"d4", crop:"Cotton",  disease:"Cotton Leaf Curl Virus (CLCuV)",emoji:"🔴", severity:"Critical",
    symptoms:"Upward or downward curling of leaves, dark veins, small crinkled leaves, stunted growth.",
    solution:"No direct cure. Remove infected plants. Control whitefly vector with Imidacloprid 17.8% SL @ 0.3ml/L.",
    prevention:"Use CLCuV-resistant varieties. Monitor for whitefly from early growth stage.",
    confidence: 93 },
  { id:"d5", crop:"Potato",  disease:"Late Blight (Phytophthora)",   emoji:"🟫", severity:"Critical",
    symptoms:"Dark water-soaked spots on leaves expanding rapidly. White mold on undersides in humid weather.",
    solution:"Spray Metalaxyl-M + Mancozeb @ 2.5g/L immediately. Repeat every 7 days. Destroy infected tubers.",
    prevention:"Use certified seed, apply preventive fungicide before disease onset, ensure field drainage.",
    confidence: 90 },
  { id:"d6", crop:"Maize",   disease:"Maize Stalk Rot",              emoji:"🌽", severity:"Medium",
    symptoms:"Lower leaves turn yellow and die prematurely. Stalk becomes soft and brown inside.",
    solution:"No fungicide effective once established. Remove affected plants. Ensure balanced K nutrition.",
    prevention:"Balanced NPK fertilization (don't over-apply N), proper plant spacing, use tolerant hybrids.",
    confidence: 82 },
  { id:"d7", crop:"Soybean", disease:"Soybean Rust",                 emoji:"🟠", severity:"High",
    symptoms:"Small tan to reddish-brown lesions on lower leaf surface with numerous pustules.",
    solution:"Spray Tebuconazole 25.9% EC @ 0.1% or Azoxystrobin 23% SC @ 1ml/L at first sign.",
    prevention:"Use tolerant varieties, scout fields weekly from pod-fill stage, apply fungicide preventively.",
    confidence: 87 },
  { id:"d8", crop:"Chilli",  disease:"Chilli Anthracnose",           emoji:"🌶️", severity:"Medium",
    symptoms:"Circular sunken lesions with salmon-colored spore masses on fruits. Fruit rot.",
    solution:"Spray Carbendazim 50% WP @ 1g/L or Copper Hydroxide @ 3g/L. Harvest fruits promptly.",
    prevention:"Use disease-free seeds, avoid wounding fruits, maintain drainage in field.",
    confidence: 84 },
];

/** MARKET PRICE DATA (Mock Mandi Rates - INR per quintal) */
const MARKET_DATA = {
  crops: [
    { name:"Wheat",    current:2350, msp:2275, unit:"₹/qtl", change:+3.2, trend:"up",   state:"Madhya Pradesh" },
    { name:"Rice",     current:2200, msp:2183, unit:"₹/qtl", change:+1.8, trend:"up",   state:"Punjab" },
    { name:"Soybean",  current:4750, msp:4600, unit:"₹/qtl", change:-2.1, trend:"down", state:"Maharashtra" },
    { name:"Cotton",   current:6800, msp:6620, unit:"₹/qtl", change:+4.5, trend:"up",   state:"Gujarat" },
    { name:"Maize",    current:2150, msp:2090, unit:"₹/qtl", change:+0.9, trend:"up",   state:"Karnataka" },
    { name:"Groundnut",current:5900, msp:5850, unit:"₹/qtl", change:-1.3, trend:"down", state:"Andhra Pradesh" },
    { name:"Mustard",  current:5500, msp:5450, unit:"₹/qtl", change:+2.4, trend:"up",   state:"Rajasthan" },
    { name:"Gram",     current:5300, msp:5440, unit:"₹/qtl", change:-0.8, trend:"down", state:"Rajasthan" },
    { name:"Onion",    current:2800, msp:null,  unit:"₹/qtl", change:+8.5, trend:"up",   state:"Maharashtra" },
    { name:"Potato",   current:1250, msp:null,  unit:"₹/qtl", change:-4.2, trend:"down", state:"Uttar Pradesh" },
    { name:"Tomato",   current:3500, msp:null,  unit:"₹/qtl", change:+15.3,trend:"up",   state:"Himachal Pradesh" },
    { name:"Sugarcane",current:315,  msp:315,   unit:"₹/qtl", change:0,    trend:"stable",state:"Uttar Pradesh" },
  ],
  history: {
    "Wheat":  [2050,2100,2180,2200,2250,2280,2310,2350],
    "Rice":   [1950,2000,2060,2100,2130,2160,2190,2200],
    "Soybean":[4900,4850,4800,4790,4780,4760,4750,4750],
    "Cotton": [6200,6300,6400,6500,6550,6650,6700,6800],
    "Maize":  [2020,2040,2060,2080,2090,2110,2130,2150],
    "Onion":  [1500,1800,2100,2300,2500,2600,2700,2800],
  },
  months: ["Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr"],
};

/** WEATHER DATA (Mock API response for Indian cities) */
const WEATHER_DATA = {
  "Delhi":        { temp:34, humidity:45, wind:15, condition:"Partly Cloudy", rain:0,   uv:8, forecast:[{day:"Today",hi:34,lo:22,icon:"☁️"},{day:"Tue",hi:36,lo:24,icon:"☀️"},{day:"Wed",hi:33,lo:21,icon:"🌦️"},{day:"Thu",hi:31,lo:20,icon:"🌧️"},{day:"Fri",hi:35,lo:23,icon:"☀️"}] },
  "Mumbai":       { temp:30, humidity:78, wind:22, condition:"Humid & Cloudy", rain:15, uv:6, forecast:[{day:"Today",hi:30,lo:26,icon:"🌧️"},{day:"Tue",hi:29,lo:25,icon:"🌧️"},{day:"Wed",hi:31,lo:26,icon:"⛅"},{day:"Thu",hi:32,lo:27,icon:"⛅"},{day:"Fri",hi:30,lo:25,icon:"🌦️"}] },
  "Pune":         { temp:28, humidity:60, wind:18, condition:"Pleasant",       rain:5,  uv:7, forecast:[{day:"Today",hi:28,lo:19,icon:"⛅"},{day:"Tue",hi:30,lo:20,icon:"☀️"},{day:"Wed",hi:29,lo:19,icon:"🌦️"},{day:"Thu",hi:27,lo:18,icon:"🌧️"},{day:"Fri",hi:31,lo:21,icon:"☀️"}] },
  "Bhopal":       { temp:31, humidity:50, wind:12, condition:"Clear",          rain:0,  uv:9, forecast:[{day:"Today",hi:31,lo:20,icon:"☀️"},{day:"Tue",hi:33,lo:22,icon:"☀️"},{day:"Wed",hi:35,lo:23,icon:"☀️"},{day:"Thu",hi:34,lo:21,icon:"⛅"},{day:"Fri",hi:32,lo:20,icon:"⛅"}] },
  "Jaipur":       { temp:37, humidity:30, wind:20, condition:"Hot & Dry",      rain:0,  uv:10,forecast:[{day:"Today",hi:37,lo:24,icon:"☀️"},{day:"Tue",hi:39,lo:25,icon:"☀️"},{day:"Wed",hi:38,lo:24,icon:"☀️"},{day:"Thu",hi:36,lo:23,icon:"⛅"},{day:"Fri",hi:40,lo:26,icon:"☀️"}] },
  "Hyderabad":    { temp:32, humidity:55, wind:16, condition:"Partly Sunny",   rain:3,  uv:8, forecast:[{day:"Today",hi:32,lo:22,icon:"⛅"},{day:"Tue",hi:34,lo:24,icon:"☀️"},{day:"Wed",hi:33,lo:22,icon:"⛅"},{day:"Thu",hi:31,lo:21,icon:"🌦️"},{day:"Fri",hi:35,lo:23,icon:"☀️"}] },
  "Bengaluru":    { temp:25, humidity:65, wind:14, condition:"Pleasant",       rain:8,  uv:6, forecast:[{day:"Today",hi:25,lo:18,icon:"🌦️"},{day:"Tue",hi:27,lo:19,icon:"⛅"},{day:"Wed",hi:26,lo:18,icon:"🌧️"},{day:"Thu",hi:24,lo:17,icon:"🌧️"},{day:"Fri",hi:28,lo:19,icon:"⛅"}] },
  "Lucknow":      { temp:33, humidity:48, wind:11, condition:"Clear",          rain:0,  uv:8, forecast:[{day:"Today",hi:33,lo:21,icon:"☀️"},{day:"Tue",hi:35,lo:22,icon:"☀️"},{day:"Wed",hi:36,lo:23,icon:"☀️"},{day:"Thu",hi:34,lo:21,icon:"⛅"},{day:"Fri",hi:33,lo:20,icon:"⛅"}] },
  "Chandigarh":   { temp:29, humidity:52, wind:13, condition:"Breezy",         rain:2,  uv:7, forecast:[{day:"Today",hi:29,lo:18,icon:"⛅"},{day:"Tue",hi:31,lo:19,icon:"☀️"},{day:"Wed",hi:30,lo:18,icon:"⛅"},{day:"Thu",hi:28,lo:17,icon:"🌦️"},{day:"Fri",hi:32,lo:20,icon:"☀️"}] },
  "Kolkata":      { temp:33, humidity:72, wind:18, condition:"Muggy",          rain:20, uv:5, forecast:[{day:"Today",hi:33,lo:26,icon:"🌧️"},{day:"Tue",hi:32,lo:25,icon:"🌧️"},{day:"Wed",hi:34,lo:26,icon:"🌦️"},{day:"Thu",hi:35,lo:27,icon:"⛅"},{day:"Fri",hi:33,lo:25,icon:"🌧️"}] },
};

/** IRRIGATION ADVICE LOGIC
 * Rule-based: derives irrigation schedule from weather + crop
 */
function getIrrigationAdvice(weather, cropName) {
  if (!weather) return [];
  const { temp, humidity, rain } = weather;
  const advice = [];
  if (rain > 10)  advice.push({ type:"skip",    text:"Skip irrigation for next 2-3 days — rainfall is sufficient." });
  else if (rain > 0) advice.push({ type:"reduce", text:"Reduce irrigation by 40% — light rainfall expected." });
  else              advice.push({ type:"water",  text:"Normal irrigation schedule. No rainfall expected." });
  if (temp > 38)  advice.push({ type:"warning", text:"Extreme heat alert! Water early morning (5–7 AM) to reduce evaporation." });
  if (humidity > 75) advice.push({ type:"info",  text:"High humidity — watch for fungal disease. Avoid overhead irrigation." });
  if (humidity < 35) advice.push({ type:"water",  text:"Low humidity + dry spell — increase irrigation frequency by 20%." });
  if (cropName) {
    const cropAdvice = {
      "Rice":     "Rice requires 5-10 cm standing water. Maintain flood irrigation schedule.",
      "Wheat":    "Wheat: critical irrigations at CRI (21 days), tillering (45 days), and grain fill (90 days).",
      "Cotton":   "Cotton: avoid waterlogging. Irrigate at flowering and boll development stages.",
      "Maize":    "Maize: critical water needs at knee-high, tasseling, and silking stages.",
      "Soybean":  "Soybean: ensure moisture at flowering and pod-fill stage.",
      "Potato":   "Potato: frequent light irrigations (every 7-10 days). Critical at tuber initiation.",
    };
    if (cropAdvice[cropName]) advice.push({ type:"crop", text: cropAdvice[cropName] });
  }
  return advice;
}

// ─── STORAGE HELPERS ─────────────────────────────────────────
const storage = {
  get: (k, def=null) => { try { const v=localStorage.getItem(k); return v?JSON.parse(v):def; } catch{return def;} },
  set: (k,v) => { try { localStorage.setItem(k,JSON.stringify(v)); } catch{} },
};

// ─── SMALL REUSABLE COMPONENTS ───────────────────────────────

function Spinner({ size=18, color="var(--forest)" }) {
  return <Loader2 size={size} style={{ color, animation:"spin 1s linear infinite" }} />;
}

function Badge({ children, variant="green" }) {
  return <span className={`tag tag-${variant}`}>{children}</span>;
}

function Alert({ type="info", children }) {
  const cfg = {
    info:    { bg:"var(--sky-pale)",   border:"var(--sky)",       icon:<Activity size={16}/>,      color:"var(--sky)" },
    success: { bg:"var(--forest-pale)",border:"var(--forest-mid)",icon:<CheckCircle2 size={16}/>,  color:"var(--forest)" },
    warning: { bg:"var(--amber-pale)", border:"var(--amber)",     icon:<AlertTriangle size={16}/>, color:"var(--soil)" },
    error:   { bg:"var(--red-pale)",   border:"var(--red-alert)", icon:<AlertTriangle size={16}/>, color:"var(--red-alert)" },
  }[type];
  return (
    <div style={{ background:cfg.bg, border:`1.5px solid ${cfg.border}`, borderRadius:10, padding:"12px 16px", display:"flex", gap:10, alignItems:"flex-start", color:cfg.color, fontSize:14 }}>
      <span style={{ flexShrink:0, marginTop:1 }}>{cfg.icon}</span>
      <span style={{ color:"var(--text-dark)", lineHeight:1.6 }}>{children}</span>
    </div>
  );
}

function ProgressBar({ value, max=100, color="var(--forest-mid)" }) {
  const pct = Math.min(100, Math.round((value/max)*100));
  return (
    <div className="progress-bar">
      <div className="progress-fill" style={{ width:`${pct}%`, background:color }} />
    </div>
  );
}

// ─── NAVIGATION / SIDEBAR ────────────────────────────────────
const NAV_ITEMS = [
  { id:"home",     label:"Home",             icon:<Home size={17}/> },
  { id:"crops",    label:"Crop Recommendation",icon:<Sprout size={17}/> },
  { id:"disease",  label:"Disease Detection", icon:<Bug size={17}/> },
  { id:"weather",  label:"Weather & Irrigation",icon:<Cloud size={17}/> },
  { id:"market",   label:"Market Prices",     icon:<TrendingUp size={17}/> },
  { id:"dashboard",label:"My Dashboard",      icon:<BarChart2 size={17}/> },
];

function Sidebar({ currentPage, setPage, user, onLogout, isOpen, onClose }) {
  return (
    <>
      {isOpen && <div onClick={onClose} style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",zIndex:999 }} />}
      <aside className={`sidebar ${isOpen?"open":""}`}
        style={{ width:240, background:"#fff", borderRight:"1px solid var(--border)", height:"100vh", position:"sticky", top:0, display:"flex", flexDirection:"column", flexShrink:0, overflowY:"auto" }}>
        {/* Logo */}
        <div style={{ padding:"20px 18px", borderBottom:"1px solid var(--border)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:40,height:40,borderRadius:12,background:"var(--forest)",display:"flex",alignItems:"center",justifyContent:"center" }}>
              <Sprout size={22} color="#fff" />
            </div>
            <div>
              <div style={{ fontFamily:"Fraunces,serif",fontWeight:700,fontSize:15,color:"var(--forest)",lineHeight:1.1 }}>Smart Farmer</div>
              <div style={{ fontSize:11,color:"var(--text-muted)" }}>Crop Advisory System</div>
            </div>
          </div>
        </div>
        {/* Nav */}
        <nav style={{ padding:"12px 10px", flex:1 }}>
          <div style={{ fontSize:11,fontWeight:700,color:"var(--text-muted)",padding:"6px 8px",letterSpacing:"0.8px",textTransform:"uppercase" }}>Menu</div>
          {NAV_ITEMS.map(item => (
            <button key={item.id} className={`nav-item ${currentPage===item.id?"active":""}`} onClick={() => { setPage(item.id); onClose(); }}>
              {item.icon} {item.label}
            </button>
          ))}
        </nav>
        {/* User area */}
        <div style={{ padding:"14px 10px", borderTop:"1px solid var(--border)" }}>
          {user ? (
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 10px", background:"var(--forest-pale)", borderRadius:10 }}>
                <div style={{ width:34,height:34,borderRadius:"50%",background:"var(--forest)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:14 }}>
                  {user.name?.[0]?.toUpperCase()||"U"}
                </div>
                <div>
                  <div style={{ fontSize:13,fontWeight:600,color:"var(--forest)" }}>{user.name}</div>
                  <div style={{ fontSize:11,color:"var(--text-muted)" }}>{user.email}</div>
                </div>
              </div>
              <button className="btn btn-outline" onClick={onLogout} style={{ width:"100%", justifyContent:"center", fontSize:13 }}>
                <LogOut size={14}/> Sign Out
              </button>
            </div>
          ) : (
            <button className="btn btn-primary" onClick={() => { setPage("login"); onClose(); }} style={{ width:"100%", justifyContent:"center" }}>
              <LogIn size={14}/> Sign In
            </button>
          )}
        </div>
      </aside>
    </>
  );
}

function Header({ onMenuClick, page, user, setPage }) {
  const titles = { home:"Home", crops:"Crop Recommendation", disease:"Disease Detection", weather:"Weather & Irrigation", market:"Market Prices (Mandi Rates)", dashboard:"My Dashboard", login:"Sign In / Register" };
  return (
    <header style={{ background:"#fff", borderBottom:"1px solid var(--border)", padding:"14px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100, boxShadow:"0 1px 8px rgba(0,0,0,0.04)" }}>
      <div style={{ display:"flex", alignItems:"center", gap:14 }}>
        <button onClick={onMenuClick} style={{ background:"none",border:"none",display:"flex",alignItems:"center",color:"var(--text-mid)" }} className="hide-desktop">
          <Menu size={22}/>
        </button>
        <h1 style={{ fontFamily:"Fraunces,serif",fontSize:18,fontWeight:700,color:"var(--forest)" }}>{titles[page]||"Smart Farmer"}</h1>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ fontSize:12, color:"var(--text-muted)", display:"flex", alignItems:"center", gap:5 }}>
          <MapPin size={12}/> India
        </div>
        {user && (
          <div style={{ width:34,height:34,borderRadius:"50%",background:"var(--forest)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer" }} onClick={()=>setPage("dashboard")}>
            {user.name?.[0]?.toUpperCase()||"U"}
          </div>
        )}
      </div>
    </header>
  );
}

// ─── PAGE: HOME ───────────────────────────────────────────────
function HomePage({ setPage, user }) {
  const features = [
    { id:"crops",   emoji:"🌱", title:"Crop Recommendation", desc:"Get AI-powered crop suggestions based on soil, season & location.", color:"var(--forest-pale)", accent:"var(--forest)" },
    { id:"disease", emoji:"🔬", title:"Disease Detection",    desc:"Upload a plant photo to identify diseases and get cure advice.",  color:"#e8f4fd",           accent:"var(--sky)" },
    { id:"weather", emoji:"⛅", title:"Weather & Irrigation", desc:"Real-time weather + smart irrigation schedule for your crops.",   color:"var(--amber-pale)", accent:"var(--amber)" },
    { id:"market",  emoji:"📊", title:"Market Prices",        desc:"Live Mandi rates and price trends for 12+ major crops.",          color:"var(--red-pale)",   accent:"var(--red-alert)" },
  ];
  const stats = [
    { label:"Crop Varieties", value:"50+", icon:<Sprout size={20}/> },
    { label:"Diseases Covered", value:"8+", icon:<Bug size={20}/> },
    { label:"Indian States", value:"28", icon:<MapPin size={20}/> },
    { label:"Market Crops", value:"12+", icon:<TrendingUp size={20}/> },
  ];
  return (
    <div className="fade-in" style={{ padding:"28px 24px", maxWidth:860, margin:"0 auto" }}>
      {/* Hero */}
      <div style={{ background:"linear-gradient(135deg,var(--forest) 0%,var(--forest-mid) 60%,#40916c 100%)", borderRadius:20, padding:"40px 36px", color:"#fff", marginBottom:32, position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute",top:-30,right:-30,width:220,height:220,borderRadius:"50%",background:"rgba(255,255,255,0.06)" }} />
        <div style={{ position:"absolute",bottom:-50,right:80,width:160,height:160,borderRadius:"50%",background:"rgba(255,255,255,0.04)" }} />
        <Badge variant="amber">🇮🇳 Made for Indian Farmers</Badge>
        <h1 style={{ fontFamily:"Fraunces,serif",fontSize:"clamp(26px,4vw,40px)",fontWeight:900,marginTop:16,marginBottom:12,lineHeight:1.15 }}>
          Smart Farming,<br/><em style={{ fontStyle:"italic",color:"#95d5b2" }}>Better Harvests.</em>
        </h1>
        <p style={{ fontSize:15,opacity:0.85,maxWidth:500,lineHeight:1.7,marginBottom:28 }}>
          Your AI-powered agricultural advisor. Get crop recommendations, detect plant diseases, check live market prices, and plan irrigation — all in one place.
        </p>
        <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
          <button className="btn btn-amber" onClick={() => setPage("crops")} style={{ fontSize:15,padding:"12px 26px" }}>
            Get Started <ArrowRight size={16}/>
          </button>
          {!user && (
            <button onClick={() => setPage("login")} style={{ background:"rgba(255,255,255,0.15)",border:"1.5px solid rgba(255,255,255,0.3)",color:"#fff",padding:"12px 26px",borderRadius:10,fontWeight:600,fontSize:15,cursor:"pointer" }}>
              Sign In / Register
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:14, marginBottom:32 }}>
        {stats.map((s,i) => (
          <div key={i} className="stat-card" style={{ textAlign:"center", padding:"18px 14px" }}>
            <div style={{ color:"var(--forest)", marginBottom:6 }}>{s.icon}</div>
            <div style={{ fontSize:24,fontFamily:"Fraunces,serif",fontWeight:700,color:"var(--forest)" }}>{s.value}</div>
            <div style={{ fontSize:12,color:"var(--text-muted)",fontWeight:500 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Feature Cards */}
      <h2 style={{ fontFamily:"Fraunces,serif",fontSize:22,color:"var(--text-dark)",marginBottom:16 }}>What can I help you with?</h2>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))", gap:16, marginBottom:32 }}>
        {features.map(f => (
          <div key={f.id} className="card" style={{ padding:"22px 20px", cursor:"pointer" }} onClick={() => setPage(f.id)}>
            <div style={{ width:46,height:46,borderRadius:14,background:f.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,marginBottom:14 }}>{f.emoji}</div>
            <h3 style={{ fontSize:16,fontWeight:700,marginBottom:6,color:"var(--text-dark)" }}>{f.title}</h3>
            <p style={{ fontSize:13,color:"var(--text-muted)",lineHeight:1.6 }}>{f.desc}</p>
            <div style={{ marginTop:14,display:"flex",alignItems:"center",gap:4,fontSize:13,fontWeight:600,color:f.accent }}>
              Open <ChevronRight size={14}/>
            </div>
          </div>
        ))}
      </div>

      {/* Info banner */}
      <Alert type="info">
        <strong>💡 Tip:</strong> This system uses rule-based AI for crop recommendations and simulated disease detection. For production use, connect to Plant.id API and OpenWeatherMap for real-time data. See the <code style={{ background:"var(--sky-pale)",padding:"1px 5px",borderRadius:4,fontSize:12 }}>README.md</code> for setup instructions.
      </Alert>
    </div>
  );
}

// ─── PAGE: CROP RECOMMENDATION ────────────────────────────────
function CropPage({ user, addHistory }) {
  const [form, setForm] = useState({ soil:"", season:"", location:"", ph:"", irrigation:"" });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(0);

  const soils   = ["Clay","Loam","Sandy","Black","Red","Silt"];
  const seasons = ["Kharif (June–October)","Rabi (November–March)","Zaid (March–June)"];
  const states  = ["Andhra Pradesh","Assam","Bihar","Chhattisgarh","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Odisha","Punjab","Rajasthan","Tamil Nadu","Telangana","Uttar Pradesh","Uttarakhand","West Bengal"];

  const handleSubmit = () => {
    if (!form.soil || !form.season) return;
    setLoading(true);
    setTimeout(() => {
      const seasonKey = form.season.toLowerCase().includes("kharif") ? "kharif" : form.season.toLowerCase().includes("rabi") ? "rabi" : "zaid";
      const soilKey = form.soil.toLowerCase();
      const key = `${soilKey}-${seasonKey}`;
      const crops = CROP_DATABASE[key] || CROP_DATABASE[`loam-${seasonKey}`] || [];
      setResults({ crops, soil: form.soil, season: form.season, location: form.location });
      setSelected(0);
      setLoading(false);
      if (user && crops.length > 0) {
        addHistory({ type:"crop", date:new Date().toLocaleDateString(), summary:`${form.soil} soil, ${seasonKey} season → ${crops[0]?.name}`, detail: form });
      }
    }, 1500);
  };

  return (
    <div className="fade-in" style={{ padding:"24px", maxWidth:880, margin:"0 auto" }}>
      <div style={{ marginBottom:24 }}>
        <h2 className="section-title">🌱 Crop Recommendation</h2>
        <p className="section-sub">Enter your field details to get AI-powered crop suggestions with fertilizer advice.</p>
      </div>

      {/* Input form */}
      <div className="card" style={{ padding:24, marginBottom:24 }}>
        <h3 style={{ fontWeight:700, marginBottom:20, fontSize:16 }}>Field Information</h3>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:16 }}>
          <div className="form-group" style={{ margin:0 }}>
            <label className="form-label">Soil Type *</label>
            <select className="form-select" value={form.soil} onChange={e=>setForm({...form,soil:e.target.value})}>
              <option value="">Select soil type</option>
              {soils.map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ margin:0 }}>
            <label className="form-label">Season *</label>
            <select className="form-select" value={form.season} onChange={e=>setForm({...form,season:e.target.value})}>
              <option value="">Select season</option>
              {seasons.map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ margin:0 }}>
            <label className="form-label">State / Region</label>
            <select className="form-select" value={form.location} onChange={e=>setForm({...form,location:e.target.value})}>
              <option value="">Select state</option>
              {states.map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ margin:0 }}>
            <label className="form-label">Soil pH (optional)</label>
            <input className="form-input" type="number" placeholder="e.g. 6.5" min="4" max="9" step="0.1" value={form.ph} onChange={e=>setForm({...form,ph:e.target.value})}/>
          </div>
          <div className="form-group" style={{ margin:0 }}>
            <label className="form-label">Irrigation Source</label>
            <select className="form-select" value={form.irrigation} onChange={e=>setForm({...form,irrigation:e.target.value})}>
              <option value="">Select source</option>
              <option>Canal</option><option>Tube Well / Borewell</option><option>Rain-fed</option><option>Drip/Sprinkler</option>
            </select>
          </div>
        </div>
        <div style={{ marginTop:20 }}>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={!form.soil||!form.season||loading} style={{ minWidth:160, justifyContent:"center" }}>
            {loading ? <><Spinner size={16} color="#fff"/> Analyzing…</> : <><Search size={16}/> Get Recommendation</>}
          </button>
        </div>
      </div>

      {/* Results */}
      {results && (
        <div className="slide-up">
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
            <h3 style={{ fontFamily:"Fraunces,serif",fontSize:20,color:"var(--forest)" }}>Recommended Crops</h3>
            <Badge variant="green">✅ {results.crops.length} matches found</Badge>
          </div>

          {/* Crop tabs */}
          <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" }}>
            {results.crops.map((c,i) => (
              <button key={i} onClick={() => setSelected(i)}
                style={{ padding:"8px 16px", borderRadius:20, border:`2px solid ${selected===i?"var(--forest)":"var(--border)"}`, background:selected===i?"var(--forest)":"#fff", color:selected===i?"#fff":"var(--text-mid)", fontWeight:600, fontSize:13, cursor:"pointer", transition:"all 0.2s" }}>
                {c.emoji} {c.name}
              </button>
            ))}
          </div>

          {/* Selected crop detail */}
          {results.crops[selected] && (() => {
            const c = results.crops[selected];
            return (
              <div className="card scale-in" style={{ padding:24 }}>
                <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:20, flexWrap:"wrap", gap:12 }}>
                  <div>
                    <div style={{ fontSize:40 }}>{c.emoji}</div>
                    <h2 style={{ fontFamily:"Fraunces,serif",fontSize:26,color:"var(--forest)",marginTop:6 }}>{c.name}</h2>
                    <p style={{ color:"var(--text-muted)",fontSize:14 }}>{c.notes}</p>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontSize:12,color:"var(--text-muted)",marginBottom:4 }}>AI Confidence</div>
                    <div style={{ fontFamily:"Fraunces,serif",fontSize:32,fontWeight:700,color:"var(--forest)" }}>{c.confidence}%</div>
                    <ProgressBar value={c.confidence} />
                  </div>
                </div>

                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:14, marginBottom:20 }}>
                  {[
                    { icon:<Clock size={15}/>, label:"Growing Duration", val:c.days+" days" },
                    { icon:<Package size={15}/>, label:"Expected Yield",  val:c.yield },
                    { icon:<Droplets size={15}/>, label:"Water Needs",    val:c.water },
                  ].map((d,i) => (
                    <div key={i} style={{ background:"var(--cream)",borderRadius:10,padding:"12px 14px" }}>
                      <div style={{ display:"flex",alignItems:"center",gap:6,fontSize:12,color:"var(--text-muted)",marginBottom:4 }}>{d.icon}{d.label}</div>
                      <div style={{ fontWeight:700,fontSize:14,color:"var(--text-dark)" }}>{d.val}</div>
                    </div>
                  ))}
                </div>

                <div style={{ background:"var(--amber-pale)",borderRadius:12,padding:"16px 18px",border:"1.5px solid var(--amber-light)" }}>
                  <div style={{ display:"flex",alignItems:"center",gap:8,fontWeight:700,color:"var(--soil)",marginBottom:6 }}>
                    <FlaskConical size={16}/> Fertilizer Advice
                  </div>
                  <p style={{ fontSize:14,color:"var(--text-dark)",lineHeight:1.7 }}>{c.fertilizer}</p>
                </div>
              </div>
            );
          })()}

          {/* Soil + Season info */}
          <div style={{ marginTop:14 }}>
            <Alert type="success">
              Analysis for <strong>{results.soil} soil</strong> in <strong>{results.season}</strong>{results.location ? ` (${results.location})` : ""}. Recommendation uses rule-based agronomy data validated for Indian conditions.
            </Alert>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── PAGE: DISEASE DETECTION ──────────────────────────────────
function DiseasePage({ user, addHistory }) {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();

  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setImage(file);
    setResult(null);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const analyze = () => {
    if (!image) return;
    setLoading(true);
    // Simulate AI analysis — in production: POST image to Plant.id API
    setTimeout(() => {
      const idx = Math.floor(Math.random() * DISEASE_DATABASE.length);
      const disease = { ...DISEASE_DATABASE[idx], confidence: 75 + Math.floor(Math.random()*20) };
      setResult(disease);
      setLoading(false);
      if (user) addHistory({ type:"disease", date:new Date().toLocaleDateString(), summary:`${disease.crop} — ${disease.disease}`, detail: disease });
    }, 2200);
  };

  const severityColor = { Critical:"var(--red-alert)", High:"var(--amber)", Medium:"var(--soil)", Low:"var(--forest)" };

  return (
    <div className="fade-in" style={{ padding:"24px", maxWidth:860, margin:"0 auto" }}>
      <div style={{ marginBottom:24 }}>
        <h2 className="section-title">🔬 Plant Disease Detection</h2>
        <p className="section-sub">Upload a clear photo of the affected plant leaf or stem. Our AI will identify the disease and provide treatment advice.</p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24 }}>
        {/* Upload panel */}
        <div>
          <div className={`upload-zone ${dragOver?"drag-over":""}`}
            onDragOver={e=>{e.preventDefault();setDragOver(true)}}
            onDragLeave={()=>setDragOver(false)}
            onDrop={e=>{e.preventDefault();setDragOver(false);handleFile(e.dataTransfer.files[0])}}
            onClick={()=>fileRef.current?.click()}>
            {preview ? (
              <div>
                <img src={preview} alt="plant" style={{ maxWidth:"100%", maxHeight:220, borderRadius:10, objectFit:"contain" }}/>
                <div style={{ marginTop:10,fontSize:13,color:"var(--text-muted)" }}>Click to replace image</div>
              </div>
            ) : (
              <>
                <Upload size={40} color="var(--forest-mid)" style={{ marginBottom:14 }}/>
                <div style={{ fontWeight:700,color:"var(--text-dark)",marginBottom:6 }}>Drop image here</div>
                <div style={{ fontSize:13,color:"var(--text-muted)",marginBottom:14 }}>or click to browse<br/><small>JPG, PNG, WEBP — max 10MB</small></div>
                <button className="btn btn-secondary" onClick={e=>{e.stopPropagation();fileRef.current?.click()}}>
                  <Upload size={14}/> Choose File
                </button>
              </>
            )}
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={e=>handleFile(e.target.files[0])}/>
          </div>

          {image && (
            <div style={{ marginTop:14 }}>
              <div style={{ background:"var(--forest-pale)",borderRadius:10,padding:"10px 14px",marginBottom:12,fontSize:13,display:"flex",alignItems:"center",gap:8 }}>
                <CheckCircle2 size={14} color="var(--forest)"/>
                <span><strong>{image.name}</strong> — {(image.size/1024).toFixed(1)} KB</span>
              </div>
              <button className="btn btn-primary" onClick={analyze} disabled={loading} style={{ width:"100%",justifyContent:"center",padding:14 }}>
                {loading ? <><Spinner size={16} color="#fff"/> Analyzing with AI…</> : <><Bug size={16}/> Detect Disease</>}
              </button>
            </div>
          )}

          {/* Sample instructions */}
          <div className="card" style={{ padding:16, marginTop:16 }}>
            <div style={{ fontWeight:700, fontSize:13, marginBottom:10 }}>📸 Photo Tips</div>
            {["Take photo in good natural light","Focus clearly on the affected area","Include both healthy & diseased parts","Clean the lens before clicking"].map((t,i)=>(
              <div key={i} style={{ display:"flex",alignItems:"center",gap:8,fontSize:13,color:"var(--text-mid)",marginBottom:6 }}>
                <span style={{ width:18,height:18,borderRadius:"50%",background:"var(--forest-pale)",color:"var(--forest)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,flexShrink:0 }}>{i+1}</span>{t}
              </div>
            ))}
          </div>
        </div>

        {/* Result panel */}
        <div>
          {loading && (
            <div className="card" style={{ padding:40, textAlign:"center" }}>
              <div style={{ animation:"spin 2s linear infinite", display:"inline-block", marginBottom:16 }}>
                <Bug size={40} color="var(--forest-mid)"/>
              </div>
              <div style={{ fontWeight:700, marginBottom:6 }}>Analyzing plant image…</div>
              <div style={{ fontSize:13,color:"var(--text-muted)" }}>Running disease detection model</div>
            </div>
          )}

          {!result && !loading && (
            <div className="card" style={{ padding:32, textAlign:"center", opacity:0.6 }}>
              <Leaf size={48} color="var(--border)" style={{ marginBottom:14 }}/>
              <div style={{ fontWeight:600,color:"var(--text-muted)" }}>Upload an image to begin analysis</div>
            </div>
          )}

          {result && !loading && (
            <div className="card scale-in" style={{ padding:22 }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16 }}>
                <div>
                  <Badge variant={result.severity==="Critical"?"red":result.severity==="High"?"amber":"green"}>
                    {result.severity} Severity
                  </Badge>
                  <h3 style={{ fontFamily:"Fraunces,serif",fontSize:20,marginTop:10,lineHeight:1.2 }}>{result.disease}</h3>
                  <div style={{ fontSize:13,color:"var(--text-muted)",marginTop:3 }}>Detected crop: <strong>{result.crop}</strong></div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:11,color:"var(--text-muted)" }}>Confidence</div>
                  <div style={{ fontFamily:"Fraunces,serif",fontSize:28,fontWeight:700,color:severityColor[result.severity]||"var(--forest)" }}>{result.confidence}%</div>
                </div>
              </div>

              <div className="divider" style={{ margin:"14px 0" }}/>

              <div style={{ marginBottom:14 }}>
                <div style={{ fontSize:12,fontWeight:700,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:6 }}>Symptoms Observed</div>
                <p style={{ fontSize:14,lineHeight:1.7,color:"var(--text-dark)" }}>{result.symptoms}</p>
              </div>

              <div style={{ background:"var(--red-pale)",borderRadius:10,padding:"14px 16px",marginBottom:12,border:"1.5px solid #f5c6cb" }}>
                <div style={{ fontWeight:700,color:"var(--red-alert)",marginBottom:6,display:"flex",alignItems:"center",gap:6 }}>
                  <ShieldCheck size={14}/> Immediate Treatment
                </div>
                <p style={{ fontSize:13,lineHeight:1.7,color:"var(--text-dark)" }}>{result.solution}</p>
              </div>

              <div style={{ background:"var(--forest-pale)",borderRadius:10,padding:"14px 16px",border:"1.5px solid var(--forest-light)" }}>
                <div style={{ fontWeight:700,color:"var(--forest)",marginBottom:6,display:"flex",alignItems:"center",gap:6 }}>
                  <CheckCircle2 size={14}/> Prevention Tips
                </div>
                <p style={{ fontSize:13,lineHeight:1.7,color:"var(--text-dark)" }}>{result.prevention}</p>
              </div>

              <div style={{ marginTop:12,fontSize:12,color:"var(--text-muted)",fontStyle:"italic" }}>
                ⚠ This is an AI-assisted analysis. Consult your local Krishi Vigyan Kendra (KVK) for expert confirmation.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Disease quick reference */}
      <div style={{ marginTop:28 }}>
        <h3 style={{ fontFamily:"Fraunces,serif",fontSize:18,marginBottom:14 }}>Common Crop Diseases — Quick Reference</h3>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Disease</th><th>Crop</th><th>Severity</th><th>Key Symptom</th></tr></thead>
            <tbody>
              {DISEASE_DATABASE.map(d=>(
                <tr key={d.id}>
                  <td><strong>{d.emoji} {d.disease}</strong></td>
                  <td>{d.crop}</td>
                  <td><Badge variant={d.severity==="Critical"?"red":d.severity==="High"?"amber":"green"}>{d.severity}</Badge></td>
                  <td style={{ fontSize:13,color:"var(--text-muted)" }}>{d.symptoms.substring(0,60)}…</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── PAGE: WEATHER & IRRIGATION ───────────────────────────────
function WeatherPage() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [crop, setCrop] = useState("");
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState([]);
  const cities = Object.keys(WEATHER_DATA);
  const crops = ["Rice","Wheat","Cotton","Maize","Soybean","Potato","Mustard","Onion"];

  const fetchWeather = () => {
    if (!city) return;
    setLoading(true);
    setTimeout(() => {
      const w = WEATHER_DATA[city] || WEATHER_DATA["Delhi"];
      setWeather(w);
      setAdvice(getIrrigationAdvice(w, crop));
      setLoading(false);
    }, 1000);
  };

  const conditionIcon = (c="") => c.includes("Rain")||c.includes("Muggy")?"🌧️":c.includes("Cloudy")||c.includes("Partly")?"⛅":c.includes("Dry")||c.includes("Hot")?"☀️":"⛅";
  const adviceIcon = { skip:"✅", reduce:"⚡", water:"💧", warning:"🔥", info:"ℹ️", crop:"🌱" };
  const adviceBg  = { skip:"var(--forest-pale)", reduce:"var(--amber-pale)", water:"var(--sky-pale)", warning:"var(--red-pale)", info:"#f0f4ff", crop:"var(--forest-pale)" };

  return (
    <div className="fade-in" style={{ padding:"24px", maxWidth:900, margin:"0 auto" }}>
      <div style={{ marginBottom:24 }}>
        <h2 className="section-title">⛅ Weather & Irrigation Advice</h2>
        <p className="section-sub">Check real-time weather for your city and get AI-powered irrigation scheduling for your crops.</p>
      </div>

      {/* Search */}
      <div className="card" style={{ padding:20, marginBottom:24, display:"flex", gap:14, flexWrap:"wrap", alignItems:"flex-end" }}>
        <div className="form-group" style={{ margin:0, flex:1, minWidth:180 }}>
          <label className="form-label">City / District</label>
          <select className="form-select" value={city} onChange={e=>setCity(e.target.value)}>
            <option value="">Select a city</option>
            {cities.map(c=><option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="form-group" style={{ margin:0, flex:1, minWidth:160 }}>
          <label className="form-label">Current Crop (optional)</label>
          <select className="form-select" value={crop} onChange={e=>setCrop(e.target.value)}>
            <option value="">Select crop</option>
            {crops.map(c=><option key={c}>{c}</option>)}
          </select>
        </div>
        <button className="btn btn-primary" onClick={fetchWeather} disabled={!city||loading}>
          {loading ? <><Spinner size={14} color="#fff"/>Loading…</> : <><RefreshCw size={14}/> Get Weather</>}
        </button>
      </div>

      {weather && (
        <div className="slide-up">
          {/* Main weather card */}
          <div className="weather-card" style={{ marginBottom:22 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:16 }}>
              <div>
                <div style={{ fontSize:13,opacity:0.75,marginBottom:4,display:"flex",alignItems:"center",gap:5 }}><MapPin size={12}/> {city}, India</div>
                <div style={{ fontSize:60 }}>{conditionIcon(weather.condition)}</div>
                <div style={{ fontFamily:"Fraunces,serif",fontSize:54,fontWeight:700,lineHeight:1 }}>{weather.temp}°C</div>
                <div style={{ fontSize:16,marginTop:6,opacity:0.85 }}>{weather.condition}</div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, paddingTop:8 }}>
                {[
                  { icon:<Droplets size={18}/>, label:"Humidity",   val:`${weather.humidity}%` },
                  { icon:<Wind size={18}/>,     label:"Wind Speed",  val:`${weather.wind} km/h` },
                  { icon:<CloudRain size={18}/>,label:"Rainfall",    val:`${weather.rain} mm` },
                  { icon:<Sun size={18}/>,      label:"UV Index",    val:weather.uv+"/10" },
                ].map((d,i)=>(
                  <div key={i} style={{ background:"rgba(255,255,255,0.15)",borderRadius:10,padding:"10px 14px" }}>
                    <div style={{ opacity:0.75,marginBottom:4 }}>{d.icon}</div>
                    <div style={{ fontSize:17,fontWeight:700 }}>{d.val}</div>
                    <div style={{ fontSize:11,opacity:0.7 }}>{d.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 5-day forecast */}
          <div style={{ display:"flex", gap:12, marginBottom:22, overflowX:"auto", paddingBottom:4 }}>
            {weather.forecast.map((f,i)=>(
              <div key={i} style={{ background:"#fff",borderRadius:14,padding:"14px 16px",border:"1px solid var(--border)",textAlign:"center",minWidth:90,flex:"0 0 auto" }}>
                <div style={{ fontWeight:700,fontSize:13,marginBottom:6 }}>{f.day}</div>
                <div style={{ fontSize:24,marginBottom:6 }}>{f.icon}</div>
                <div style={{ fontSize:13,color:"var(--text-dark)" }}>{f.hi}°</div>
                <div style={{ fontSize:12,color:"var(--text-muted)" }}>{f.lo}°</div>
              </div>
            ))}
          </div>

          {/* Irrigation advice */}
          {advice.length > 0 && (
            <div className="card" style={{ padding:22, marginBottom:20 }}>
              <h3 style={{ fontFamily:"Fraunces,serif",fontSize:18,marginBottom:16,display:"flex",alignItems:"center",gap:8 }}>
                <Droplets size={20} color="var(--sky)"/> Irrigation Advice
                {crop && <Badge variant="blue">{crop}</Badge>}
              </h3>
              <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
                {advice.map((a,i)=>(
                  <div key={i} style={{ background:adviceBg[a.type],borderRadius:10,padding:"12px 16px",display:"flex",gap:10,alignItems:"flex-start",fontSize:14,lineHeight:1.6 }}>
                    <span style={{ fontSize:18,flexShrink:0 }}>{adviceIcon[a.type]}</span>
                    <span>{a.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* General farming tips */}
          <div className="card" style={{ padding:20 }}>
            <h3 style={{ fontWeight:700, marginBottom:14, fontSize:15 }}>🌾 Today's Farming Tips</h3>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:12 }}>
              {[
                { icon:"🌡️", tip: weather.temp>35 ? "Heat stress likely — provide shade nets for horticulture crops." : weather.temp<15 ? "Cold wave alert — protect seedlings with straw mulch." : "Moderate temperature — good for field operations." },
                { icon:"💨", tip: weather.wind>25 ? "High winds — delay pesticide spraying to avoid drift." : "Calm winds — ideal conditions for pesticide application." },
                { icon:"🌿", tip: weather.humidity>70 ? "High humidity — scout for fungal diseases in all crops." : "Low humidity — monitor for sucking pest outbreaks." },
              ].map((t,i)=>(
                <div key={i} style={{ background:"var(--cream)",borderRadius:10,padding:"12px 14px",display:"flex",gap:10 }}>
                  <span style={{ fontSize:20 }}>{t.icon}</span>
                  <span style={{ fontSize:13,lineHeight:1.6,color:"var(--text-dark)" }}>{t.tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!weather && (
        <div style={{ textAlign:"center", padding:"60px 20px", color:"var(--text-muted)" }}>
          <Cloud size={52} color="var(--border)" style={{ marginBottom:14 }}/>
          <div style={{ fontWeight:600 }}>Select a city to view weather forecast</div>
          <div style={{ fontSize:13, marginTop:4 }}>Available for 10 major Indian cities</div>
        </div>
      )}
    </div>
  );
}

// ─── PAGE: MARKET PRICES ──────────────────────────────────────
function MarketPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCrop, setSelectedCrop] = useState("Wheat");
  const [sortBy, setSortBy] = useState("name");

  const filtered = MARKET_DATA.crops
    .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a,b) => sortBy==="price" ? b.current-a.current : a.name.localeCompare(b.name));

  const chartData = MARKET_DATA.history[selectedCrop]?.map((price, i) => ({
    month: MARKET_DATA.months[i], price
  })) || [];

  return (
    <div className="fade-in" style={{ padding:"24px", maxWidth:900, margin:"0 auto" }}>
      <div style={{ marginBottom:24 }}>
        <h2 className="section-title">📊 Market Prices (Mandi Rates)</h2>
        <p className="section-sub">Daily wholesale prices for major crops across India. MSP = Minimum Support Price set by Government of India.</p>
      </div>

      {/* Summary cards */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:14,marginBottom:24 }}>
        {[
          { label:"Avg. Price Change",  val:"+1.8%",    color:"var(--forest)", bg:"var(--forest-pale)", icon:<TrendingUp size={18}/> },
          { label:"Crops Above MSP",    val:"8 / 10",   color:"var(--amber)",  bg:"var(--amber-pale)",  icon:<Award size={18}/> },
          { label:"Best Performer",     val:"Tomato",   color:"var(--red-alert)",bg:"var(--red-pale)",  icon:<Star size={18}/> },
          { label:"Data Updated",       val:"Today",    color:"var(--sky)",    bg:"var(--sky-pale)",    icon:<RefreshCw size={18}/> },
        ].map((s,i)=>(
          <div key={i} style={{ background:s.bg,borderRadius:var_r,padding:"16px 18px",border:`1px solid ${s.color}30` }}>
            <div style={{ color:s.color,marginBottom:6 }}>{s.icon}</div>
            <div style={{ fontFamily:"Fraunces,serif",fontSize:22,fontWeight:700,color:s.color }}>{s.val}</div>
            <div style={{ fontSize:12,color:"var(--text-muted)",fontWeight:500 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Price chart */}
      <div className="card" style={{ padding:22, marginBottom:24 }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10 }}>
          <h3 style={{ fontFamily:"Fraunces,serif",fontSize:18 }}>Price Trend (8-Month)</h3>
          <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
            {Object.keys(MARKET_DATA.history).map(c=>(
              <button key={c} onClick={()=>setSelectedCrop(c)}
                style={{ padding:"5px 12px",borderRadius:16,border:`1.5px solid ${selectedCrop===c?"var(--forest)":"var(--border)"}`,background:selectedCrop===c?"var(--forest)":"transparent",color:selectedCrop===c?"#fff":"var(--text-mid)",fontWeight:600,fontSize:12,cursor:"pointer" }}>
                {c}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="var(--forest-mid)" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="var(--forest-mid)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/>
            <XAxis dataKey="month" tick={{ fontSize:12 }}/>
            <YAxis tick={{ fontSize:12 }} tickFormatter={v=>`₹${v}`}/>
            <Tooltip formatter={v=>[`₹${v}/qtl`,"Price"]} contentStyle={{ borderRadius:8,border:"1px solid var(--border)",fontSize:13 }}/>
            <Area type="monotone" dataKey="price" stroke="var(--forest-mid)" strokeWidth={2.5} fill="url(#priceGrad)"/>
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Search & Table */}
      <div style={{ display:"flex",gap:12,marginBottom:16,flexWrap:"wrap",alignItems:"center" }}>
        <div style={{ flex:1,minWidth:200,position:"relative" }}>
          <Search size={15} style={{ position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:"var(--text-muted)" }}/>
          <input className="form-input" placeholder="Search crop…" style={{ paddingLeft:36 }} value={searchTerm} onChange={e=>setSearchTerm(e.target.value)}/>
        </div>
        <select className="form-select" style={{ width:"auto" }} value={sortBy} onChange={e=>setSortBy(e.target.value)}>
          <option value="name">Sort: Name</option>
          <option value="price">Sort: Price</option>
        </select>
        <Badge variant="green">{filtered.length} crops</Badge>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Crop</th><th>Current Price</th><th>MSP</th><th>Change (30D)</th><th>Lead State</th><th>Status</th></tr>
          </thead>
          <tbody>
            {filtered.map((c,i)=>(
              <tr key={i} style={{ cursor:"pointer" }} onClick={()=>MARKET_DATA.history[c.name]&&setSelectedCrop(c.name)}>
                <td><strong style={{ fontSize:14 }}>{c.name}</strong></td>
                <td><strong style={{ color:"var(--forest)",fontSize:15 }}>{c.current.toLocaleString("en-IN")} {c.unit}</strong></td>
                <td style={{ color:"var(--text-muted)", fontSize:13 }}>{c.msp ? `${c.msp.toLocaleString("en-IN")} ₹/qtl` : "—"}</td>
                <td>
                  <span style={{ color:c.change>0?"var(--forest)":c.change<0?"var(--red-alert)":"var(--text-muted)", fontWeight:700 }}>
                    {c.change>0?"+":""}{c.change}%
                  </span>
                </td>
                <td style={{ fontSize:13, color:"var(--text-muted)" }}>{c.state}</td>
                <td>
                  {c.msp && c.current >= c.msp
                    ? <Badge variant="green">✅ Above MSP</Badge>
                    : c.msp
                    ? <Badge variant="red">⚠ Below MSP</Badge>
                    : <Badge variant="amber">No MSP</Badge>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop:12,fontSize:12,color:"var(--text-muted)" }}>
        * Prices are indicative mock data for demonstration. In production, integrate with <strong>data.gov.in</strong> Agmarknet API for live Mandi rates.
      </div>
    </div>
  );
}

// trick to inline var
const var_r = "var(--radius-sm)";

// ─── PAGE: USER DASHBOARD ─────────────────────────────────────
function DashboardPage({ user, history, clearHistory }) {
  if (!user) return (
    <div className="fade-in" style={{ padding:"60px 24px", textAlign:"center", maxWidth:500, margin:"0 auto" }}>
      <User size={52} color="var(--border)" style={{ marginBottom:16 }}/>
      <h2 style={{ fontFamily:"Fraunces,serif",fontSize:22,marginBottom:8 }}>Sign in to view your Dashboard</h2>
      <p style={{ color:"var(--text-muted)",fontSize:14,lineHeight:1.7 }}>Your search history, saved recommendations, and personalized insights are stored here once you sign in.</p>
    </div>
  );

  const cropCount    = history.filter(h=>h.type==="crop").length;
  const diseaseCount = history.filter(h=>h.type==="disease").length;
  const recentCrop   = history.filter(h=>h.type==="crop")[0];

  return (
    <div className="fade-in" style={{ padding:"24px", maxWidth:880, margin:"0 auto" }}>
      {/* Welcome banner */}
      <div style={{ background:"linear-gradient(135deg,var(--forest) 0%,var(--forest-mid) 100%)",borderRadius:18,padding:"28px 28px",color:"#fff",marginBottom:24,position:"relative",overflow:"hidden" }}>
        <div style={{ position:"absolute",top:-20,right:-20,width:160,height:160,borderRadius:"50%",background:"rgba(255,255,255,0.07)" }}/>
        <div style={{ fontSize:11,opacity:0.7,textTransform:"uppercase",letterSpacing:"0.8px",marginBottom:6 }}>Welcome back</div>
        <h2 style={{ fontFamily:"Fraunces,serif",fontSize:28,fontWeight:700 }}>Hello, {user.name}! 👋</h2>
        <div style={{ fontSize:14,opacity:0.8,marginTop:6 }}>{user.email} • Farmer Profile</div>
        <div style={{ display:"flex",gap:20,marginTop:20,flexWrap:"wrap" }}>
          {[{val:cropCount+"",label:"Crop Analyses"},{val:diseaseCount+"",label:"Disease Checks"},{val:history.length+"",label:"Total Queries"}].map((s,i)=>(
            <div key={i} style={{ background:"rgba(255,255,255,0.15)",borderRadius:10,padding:"10px 18px",textAlign:"center" }}>
              <div style={{ fontFamily:"Fraunces,serif",fontSize:22,fontWeight:700 }}>{s.val}</div>
              <div style={{ fontSize:11,opacity:0.75 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:14,marginBottom:24 }}>
        {[
          { icon:<Sprout size={20}/>, label:"Crops Analyzed",    val:cropCount,    color:"var(--forest)",bg:"var(--forest-pale)" },
          { icon:<Bug size={20}/>,    label:"Disease Detections", val:diseaseCount, color:"var(--red-alert)",bg:"var(--red-pale)" },
          { icon:<BookOpen size={20}/>,label:"Saved Reports",    val:history.length,color:"var(--sky)",bg:"var(--sky-pale)" },
          { icon:<Activity size={20}/>,label:"Active Season",    val:"Rabi",       color:"var(--amber)",bg:"var(--amber-pale)" },
        ].map((s,i)=>(
          <div key={i} style={{ background:s.bg,borderRadius:var_r,padding:"16px",border:`1px solid ${s.color}25` }}>
            <div style={{ color:s.color,marginBottom:6 }}>{s.icon}</div>
            <div style={{ fontFamily:"Fraunces,serif",fontSize:22,fontWeight:700,color:s.color }}>{s.val}</div>
            <div style={{ fontSize:12,color:"var(--text-muted)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Recent history */}
      <div className="card" style={{ padding:22, marginBottom:20 }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16 }}>
          <h3 style={{ fontFamily:"Fraunces,serif",fontSize:18 }}>Recent Activity</h3>
          {history.length > 0 && (
            <button className="btn btn-outline" onClick={clearHistory} style={{ fontSize:12,padding:"6px 12px" }}>
              <Trash2 size={13}/> Clear All
            </button>
          )}
        </div>
        {history.length === 0 ? (
          <div style={{ textAlign:"center",padding:"30px 0",color:"var(--text-muted)" }}>
            <Clock size={32} color="var(--border)" style={{ marginBottom:10 }}/>
            <div style={{ fontWeight:600 }}>No activity yet</div>
            <div style={{ fontSize:13,marginTop:4 }}>Use Crop Recommendation or Disease Detection to see history here.</div>
          </div>
        ) : (
          <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
            {history.map((h,i)=>(
              <div key={i} style={{ display:"flex",alignItems:"center",gap:14,padding:"12px 14px",background:"var(--cream)",borderRadius:10,border:"1px solid var(--border)" }}>
                <div style={{ width:36,height:36,borderRadius:"50%",background:h.type==="crop"?"var(--forest-pale)":"var(--red-pale)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                  {h.type==="crop" ? <Sprout size={16} color="var(--forest)"/> : <Bug size={16} color="var(--red-alert)"/>}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14,fontWeight:600,color:"var(--text-dark)" }}>{h.summary}</div>
                  <div style={{ fontSize:12,color:"var(--text-muted)",marginTop:1 }}>{h.type==="crop"?"Crop Recommendation":"Disease Detection"} • {h.date}</div>
                </div>
                <Badge variant={h.type==="crop"?"green":"red"}>{h.type==="crop"?"Crop":"Disease"}</Badge>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Season planner */}
      {recentCrop && (
        <div className="card" style={{ padding:22 }}>
          <h3 style={{ fontFamily:"Fraunces,serif",fontSize:18,marginBottom:14 }}>📅 Quick Planner</h3>
          <Alert type="info">
            Based on your last search ({recentCrop.detail?.soil} soil, {recentCrop.detail?.season?.split(" ")[0]} season), consider planning for the next season now. Rabi season crops like Wheat and Mustard should be planted in October–November.
          </Alert>
        </div>
      )}
    </div>
  );
}

// ─── PAGE: LOGIN / REGISTER ───────────────────────────────────
function AuthPage({ onLogin }) {
  const [tab, setTab]     = useState("login");
  const [form, setForm]   = useState({ name:"", email:"", password:"", confirmPassword:"" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = "Enter a valid email address";
    if (form.password.length < 6)  e.password = "Password must be at least 6 characters";
    if (tab==="register") {
      if (!form.name.trim()) e.name = "Name is required";
      if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      if (tab === "register") {
        const users = storage.get("sfa_users", []);
        if (users.find(u=>u.email===form.email)) {
          setErrors({ email:"Account with this email already exists." });
          setLoading(false); return;
        }
        const newUser = { id:Date.now(), name:form.name, email:form.email, password:form.password };
        storage.set("sfa_users", [...users, newUser]);
        storage.set("sfa_current_user", newUser);
        onLogin(newUser);
      } else {
        const users = storage.get("sfa_users", []);
        const user  = users.find(u=>u.email===form.email && u.password===form.password);
        if (!user) { setErrors({ password:"Invalid email or password." }); setLoading(false); return; }
        storage.set("sfa_current_user", user);
        onLogin(user);
      }
      setLoading(false);
    }, 1000);
  };

  const demo = () => { setForm({ ...form, email:"demo@farmer.in", password:"demo123" }); };

  return (
    <div className="fade-in" style={{ padding:"32px 20px", maxWidth:440, margin:"0 auto" }}>
      <div style={{ textAlign:"center", marginBottom:28 }}>
        <div style={{ width:60,height:60,borderRadius:16,background:"var(--forest)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px" }}>
          <Sprout size={28} color="#fff"/>
        </div>
        <h2 style={{ fontFamily:"Fraunces,serif",fontSize:26,color:"var(--forest)" }}>Smart Farmer</h2>
        <p style={{ color:"var(--text-muted)",fontSize:14,marginTop:4 }}>Your personal crop advisory system</p>
      </div>

      {/* Tabs */}
      <div style={{ display:"flex",background:"var(--cream)",borderRadius:12,padding:4,marginBottom:24,border:"1px solid var(--border)" }}>
        {["login","register"].map(t=>(
          <button key={t} onClick={()=>{setTab(t);setErrors({})}}
            style={{ flex:1,padding:"10px",borderRadius:9,border:"none",fontWeight:700,fontSize:14,cursor:"pointer",background:tab===t?"#fff":"transparent",color:tab===t?"var(--forest)":"var(--text-muted)",boxShadow:tab===t?"0 1px 6px rgba(0,0,0,0.1)":"none",transition:"all 0.2s" }}>
            {t==="login" ? "Sign In" : "Register"}
          </button>
        ))}
      </div>

      <div className="card" style={{ padding:26 }}>
        {tab==="register" && (
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input className="form-input" placeholder="e.g. Ramesh Kumar" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} style={{ borderColor:errors.name?"var(--red-alert)":"" }}/>
            {errors.name && <span style={{ fontSize:12,color:"var(--red-alert)" }}>{errors.name}</span>}
          </div>
        )}
        <div className="form-group">
          <label className="form-label">Email Address *</label>
          <input className="form-input" type="email" placeholder="you@example.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} style={{ borderColor:errors.email?"var(--red-alert)":"" }}/>
          {errors.email && <span style={{ fontSize:12,color:"var(--red-alert)" }}>{errors.email}</span>}
        </div>
        <div className="form-group" style={{ position:"relative" }}>
          <label className="form-label">Password *</label>
          <div style={{ position:"relative" }}>
            <input className="form-input" type={showPass?"text":"password"} placeholder="Min. 6 characters" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} style={{ borderColor:errors.password?"var(--red-alert)":"", paddingRight:42 }}/>
            <button onClick={()=>setShowPass(!showPass)} style={{ position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"var(--text-muted)" }}>
              {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
            </button>
          </div>
          {errors.password && <span style={{ fontSize:12,color:"var(--red-alert)" }}>{errors.password}</span>}
        </div>
        {tab==="register" && (
          <div className="form-group">
            <label className="form-label">Confirm Password *</label>
            <input className="form-input" type="password" placeholder="Repeat password" value={form.confirmPassword} onChange={e=>setForm({...form,confirmPassword:e.target.value})} style={{ borderColor:errors.confirmPassword?"var(--red-alert)":"" }}/>
            {errors.confirmPassword && <span style={{ fontSize:12,color:"var(--red-alert)" }}>{errors.confirmPassword}</span>}
          </div>
        )}

        <button className="btn btn-primary" onClick={handleSubmit} disabled={loading} style={{ width:"100%",justifyContent:"center",padding:14,fontSize:15,marginTop:4 }}>
          {loading ? <><Spinner size={16} color="#fff"/>{tab==="login"?"Signing In…":"Creating Account…"}</> : tab==="login" ? <><LogIn size={16}/>Sign In</> : <><Plus size={16}/>Create Account</>}
        </button>

        <div style={{ textAlign:"center",marginTop:14 }}>
          <button onClick={demo} style={{ background:"none",border:"none",fontSize:13,color:"var(--sky)",cursor:"pointer",textDecoration:"underline" }}>
            Use demo credentials
          </button>
        </div>
      </div>

      {tab==="login" && (
        <div style={{ marginTop:16 }}>
          <Alert type="info">
            <strong>Demo account:</strong> Use <code style={{ background:"var(--sky-pale)",padding:"1px 5px",borderRadius:3 }}>demo@farmer.in</code> / <code style={{ background:"var(--sky-pale)",padding:"1px 5px",borderRadius:3 }}>demo123</code>. Or register a new account.
          </Alert>
        </div>
      )}
    </div>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────
export default function App() {
  const [page, setPage]       = useState("home");
  const [user, setUser]       = useState(null);
  const [history, setHistory] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);

  // Initialize demo user & load state from localStorage
  useEffect(() => {
    const u = storage.get("sfa_current_user");
    if (u) { setUser(u); setHistory(storage.get(`sfa_history_${u.id}`,[])); }
    // Pre-seed demo user
    const users = storage.get("sfa_users",[]);
    if (!users.find(u=>u.email==="demo@farmer.in")) {
      storage.set("sfa_users",[...users,{ id:999, name:"Demo Farmer", email:"demo@farmer.in", password:"demo123" }]);
    }
  }, []);

  const handleLogin = useCallback((u) => {
    setUser(u);
    setHistory(storage.get(`sfa_history_${u.id}`,[]));
    setPage("home");
  }, []);

  const handleLogout = useCallback(() => {
    storage.set("sfa_current_user", null);
    setUser(null); setHistory([]); setPage("home");
  }, []);

  const addHistory = useCallback((item) => {
    setHistory(prev => {
      const next = [item, ...prev].slice(0,20);
      if (user) storage.set(`sfa_history_${user.id}`, next);
      return next;
    });
  }, [user]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    if (user) storage.set(`sfa_history_${user.id}`, []);
  }, [user]);

  const renderPage = () => {
    switch (page) {
      case "home":      return <HomePage setPage={setPage} user={user}/>;
      case "crops":     return <CropPage user={user} addHistory={addHistory}/>;
      case "disease":   return <DiseasePage user={user} addHistory={addHistory}/>;
      case "weather":   return <WeatherPage/>;
      case "market":    return <MarketPage/>;
      case "dashboard": return <DashboardPage user={user} history={history} clearHistory={clearHistory}/>;
      case "login":     return <AuthPage onLogin={handleLogin}/>;
      default:          return <HomePage setPage={setPage} user={user}/>;
    }
  };

  return (
    <>
      <style>{globalCSS}</style>
      <div style={{ display:"flex", minHeight:"100vh" }}>
        <Sidebar
          currentPage={page}
          setPage={setPage}
          user={user}
          onLogout={handleLogout}
          isOpen={menuOpen}
          onClose={() => setMenuOpen(false)}
        />
        <div className="main-layout" style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0 }}>
          <Header
            onMenuClick={() => setMenuOpen(true)}
            page={page}
            user={user}
            setPage={setPage}
          />
          <main style={{ flex:1, overflowY:"auto" }}>
            {renderPage()}
          </main>
          <footer style={{ background:"#fff",borderTop:"1px solid var(--border)",padding:"12px 24px",textAlign:"center",fontSize:12,color:"var(--text-muted)" }}>
            Smart Farmer Assistant © 2024 • Built with React.js •
            <span style={{ color:"var(--forest)",fontWeight:600 }}> Final Year CSE Project</span> •
            Data is for demonstration purposes only
          </footer>
        </div>
      </div>
    </>
  );
}
