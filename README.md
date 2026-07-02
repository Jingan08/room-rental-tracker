# 🏢 Room Rental Tracker

A modern, responsive, and computationally efficient web application designed to help users organize, analyze, compare, and track rental room listings. Built as a fast, client-side Single Page Application (SPA) using React, Vite, Vanilla CSS, and Chart.js.

The application runs entirely in the browser and persists data using `localStorage`—ensuring zero server-side CPU overhead, immediate responsiveness, and complete offline capability.

---

## ✨ Key Features

### 📊 1. Airbnb-Style Dashboard
- **Summary Metrics**: Instantly view saved rooms, availability status, rooms contacted, visits scheduled, and bookmarks.
- **Rent Benchmarks**: Live tracking of Lowest Rent, Average Rent, and Highest Rent.
- **Scoring Weights Panel**: Customize match-scoring weight percentages (Rent, Commute, Amenities, Size, Furnishing, WiFi, Rating) with immediate calculations.
- **Locations & Recents**: View popular neighborhoods and a feed of recently added listings.

### ⚖️ 2. Comparative Matrix (Up to 5 Rooms)
- Side-by-side comparison sheet of up to **5 rooms** simultaneously.
- Automated highlight triggers:
  - **Lowest Rent** highlighted in success green.
  - **Best Value** (highest smart score) highlighted with a trophy badge.
  - **Closest Commute** and **Top Ratings** highlighted.
- Native print layout configuration—allowing users to export comparative tables straight to PDF reports.

### 🎯 3. Smart Matching Score (out of 100)
Calculates a recommendation score using a customizable weighted algorithm:
- **Monthly Rent** (30% default) - Scaled linearly (lower rent yields higher score).
- **Transit Commute** (25% default) - Shorter distances to school/workplace yield higher score.
- **Amenities Count** (20% default) - Counts facilities (Aircon, Private Bathroom, Washer, Parking, Refrigerator, Wardrobe).
- **Room Size** (10% default) - Larger rooms scale up to 300 sqft.
- **Furnishing** (5% default) - Full furnished = 100 pts, Semi = 50 pts, Unfurnished = 0 pts.
- **WiFi Availability** (5% default) - Included internet yields 100 pts.
- **Personal Rating** (5% default) - Direct multiplier of user's 1-5 rating.

### 💰 4. Budget & Expense Calculator
- Link listings to calculate the total monthly cost of living:
  $$\text{Total Expense} = \text{Base Rent} + \text{Utilities} + \text{Parking} + \text{Internet} + \text{Transportation} + \text{Food Budget}$$
- Responsive **Doughnut Chart** breakdown displaying the monthly spending distribution.

### 📅 5. Schedule Calendar & Timeline
- Monthly grid calendar overlaying landlord visits, deposit deadlines, and listing expiries.
- Timeline log on each room details sheet—allowing chronological notes of transitions (e.g. from Interested $\rightarrow$ Contacted $\rightarrow$ Viewed $\rightarrow$ Negotiating).

### 🔍 6. Advanced Filters & Sorting
- Live query bar searching titles, properties, areas, and notes.
- Sliders for commute radius, rent limits, status, and amenities checkboxes.
- Sort listings by **Lowest Rent**, **Highest Rent**, **Newest**, **Commute**, or **Rating**.

### 🤖 7. Future AI Features Sandbox
A playground highlighting sandbox flows for upcoming automated integrations:
- **Link Scraper**: Extract details (rent, coordinates, amenities) from real-estate URL links.
- **OCR Scanner**: Parse screenshots of landlord chats or listings to create records.
- **Pros & Cons Summarizer**: Analyze personal observations to output structured summaries.

---

## 🛠️ Technology Stack
- **Framework**: React 19 (JavaScript)
- **Bundler & Server**: Vite 8
- **Visualization**: Chart.js & `react-chartjs-2`
- **Icons**: `lucide-react`
- **Styling**: Vanilla CSS (CSS Variables, Flexbox, CSS Grid, Backdrop filters, responsive queries)
- **Data Store**: Client-side `localStorage`

---

## 🚀 Running the Project Locally

Follow these steps to download, install, and run the project:

### 📋 Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed (version 18+ recommended).

### 1. Install Dependencies
Navigate into the project directory and install the required modules:
```bash
npm install
```

### 2. Run the Development Server
Launch the local Vite server:
```bash
npm run dev
```

### 3. Open in Browser
Vite will host the application at:
```
http://localhost:5173/
```
Open this address in your web browser to play with the tracker!

### 4. Build for Production
To build a highly optimized static bundle:
```bash
npm run build
```
The output assets will be saved to the `/dist` folder, ready for deployment on static hosting providers (GitHub Pages, Vercel, Netlify).

---

## 📂 Project Directory Structure
```
room-rental-tracker/
├── index.html                   # HTML entry point (SEO headings)
├── package.json                 # Project dependencies & run scripts
├── vite.config.js               # Vite configurations
├── src/
│   ├── main.jsx                 # Mounts App element
│   ├── index.css                # CSS Design system variables, light/dark themes
│   ├── App.jsx                  # State manager, views routing, filter engines
│   ├── components/
│   │   ├── AddRoomModal.jsx     # Tabbed form panel to create/edit listings
│   │   ├── RoomCard.jsx         # Card item showing scores and badge metrics
│   │   ├── RoomDetailModal.jsx  # Detailed tabs page (Interactive markdown checklists, timeline)
│   │   ├── ComparePanel.jsx     # Comparison sheets with best value highlights
│   │   ├── ExpenseCalculator.jsx# Household budget builder & Doughnut chart
│   │   ├── StatisticsTab.jsx    # Analytics dashboard (Grouped rent, amenities bar graphs)
│   │   ├── CalendarTab.jsx      # Agenda calendars
│   │   ├── CustomTags.jsx       # Tags manager
│   │   ├── ImageGallery.jsx     # Image carousels and zoom lightboxes
│   │   └── Toast.jsx            # Toast alerts
│   └── utils/
│       ├── scoring.js           # Weighted score calculators
│       └── mockData.js          # Predefined listings data
```
