# Urban Sense AI

IMPORTANT — READ THIS FIRST:

Build the FRONTEND of this project based on the specifications below.

This is an actual hackathon implementation, not just a visual concept.

DO NOT:

build the YOLO model

build the Python AI pipeline

replace FastAPI

invent a different architecture

remove the H3-based approach

redesign the application into something unrelated

create unnecessary authentication or enterprise features

The frontend will eventually connect to our Python/FastAPI backend.

For now, use realistic mock data and simulated real-time events so that the complete frontend can be demonstrated.

The current AI module we are actually implementing is POTHOLE DETECTION.

The other detection categories should be represented in the UI as planned/ready-to-integrate modules, NOT falsely shown as fully implemented AI models.

Preserve this architecture:

PHONE CAMERA + GPS
↓
VIDEO STREAM
↓
LAPTOP
↓
YOLO AI
↓
GPS + EVENT PROCESSING
↓
H3 GEO-SPATIAL INDEXING
↓
FASTAPI
↓
THIS FRONTEND
↓
CITY CONTROL CENTRE DASHBOARD

The most important thing is that the frontend looks like a realistic, professional Smart City Control Centre that can actually be connected to this backend later.

Now follow the complete UI specification below.
Modify/build the frontend as a polished, realistic AI-Powered Urban Mobility Intelligence & Road Safety Control Centre.

This is a hackathon prototype that we are ACTUALLY implementing, so the UI must not look like a conceptual mockup or a generic admin dashboard.

The frontend must clearly represent a working pipeline:

SMARTPHONE / BUS CAMERA
↓
LIVE VIDEO STREAM
↓
AI / YOLO DETECTION
↓
GPS COORDINATES
↓
H3 GEO-SPATIAL ZONE
↓
ROAD + TRAFFIC RISK ANALYSIS
↓
CITY CONTROL CENTRE
↓
MAP + ALERTS + ANALYTICS + ACTION

IMPORTANT:
At the current prototype stage, POTHOLE DETECTION is the actively implemented AI detection.

The architecture and UI must nevertheless be designed to support the other detection categories later:

Potholes

Damaged roads / road surface damage

Missing or damaged traffic signs

Missing zebra crossings

Missing road dividers

Waterlogging

Traffic congestion

Pedestrians / children crossing roads

Dangerous or rash driving

Vehicles involved in incidents

Do NOT pretend that all of these AI models are already working.

Clearly distinguish:

ACTIVE / IMPLEMENTED

READY FOR INTEGRATION

NOT YET ACTIVE

For example:

Pothole Detection
● ACTIVE

Road Damage
○ READY FOR AI MODEL

Traffic Sign Detection
○ COMING SOON

This makes the prototype technically honest while showing the judges that the architecture is scalable.

==================================================

CORE PRODUCT IDENTITY
==================================================

Product name:

URBANSENSE AI

Subtitle:

"Mobile Urban Intelligence Platform"

Alternative subtitle:

"Turning Public Transport Fleets into Intelligent Urban Sensors"

The dashboard represents a centralized City Control Centre receiving intelligence from bus-mounted cameras.

For our prototype:

Phone = simulated bus camera + GPS

Laptop = city control centre + AI processing

YOLO = detection engine

FastAPI = backend/API layer

H3 = geospatial indexing

Frontend = control-centre dashboard

==================================================
2. VERY IMPORTANT — MAKE IT LOOK IMPLEMENTED

Do not create exaggerated futuristic UI.

Do not use unnecessary 3D elements.

Do not make every card glow.

Do not make the interface overly colorful.

The judges should feel:

"This is a real operational dashboard that could be connected to their AI backend."

Use:

dark professional control-centre theme

clean spacing

subtle borders

restrained shadows

blue/cyan accent

red for critical alerts

orange for warnings

green for healthy zones

neutral dark backgrounds

Use Lucide icons.

Use subtle animations only where they communicate real-time activity.

==================================================
3. NAVIGATION SYSTEM

Create a LEFT SIDEBAR.

Navigation:

Overview
Live Monitoring
Road Intelligence
Traffic Intelligence
Incidents
Fleet
Analytics
System Architecture

At the bottom:

System Status
● ALL SYSTEMS OPERATIONAL

ACTIVE TAB DESIGN

When the user clicks a sidebar item, make the selected item visually obvious.

The active navigation item should have a distinctive backside/tab/highlight treatment:

slightly lighter background

vertical accent indicator on the left

subtle glow or shadow

rounded right-side corners

active icon

active text

It should look like the selected page is physically connected to the main dashboard.

Example:

┌─────────────────────
│ ◉ Overview
│
│ ▌ Live Monitoring
│
│ Road Intelligence
│ Traffic Intelligence
└─────────────────────

The active tab must remain highlighted while the user is on that page.

Do not use excessive animation.

==================================================
4. BACK BUTTON / PAGE NAVIGATION

Every secondary page must have a clear:

← Back

button near the top-left of the page content.

Example:

← Back

Road Intelligence
City-wide road condition monitoring

The Back button should use actual browser/router history where appropriate.

If the user opens:

Overview
→ Road Intelligence
→ H3 Zone Details

they should be able to go:

← Back to Road Intelligence

and:

← Back to Overview

Do NOT make users rely only on the sidebar.

For detail views, preferably use a slide-over drawer rather than navigating away from the main dashboard.

==================================================
5. TOP HEADER

Header:

URBANSENSE AI

"City Mobility Intelligence"

Right side:

● LIVE SYSTEM

GPS
● CONNECTED

AI ENGINE
● RUNNING

BUS-042
● STREAMING

Current time

Profile/settings icon

Also include a:

[ DEMO MODE ]

toggle.

When Demo Mode is active:

● DEMO MODE ACTIVE

==================================================
6. OVERVIEW PAGE

Title:

City Mobility Intelligence

Subtitle:

"Real-time road condition, traffic and safety intelligence from mobile sensing units."

Show:

● LIVE MONITORING ACTIVE

KPI CARDS

Create clean, visually attractive cards:

ACTIVE BUSES
12
+2 from last hour

POTHOLES DETECTED
47
+8 today

ACTIVE ROAD ALERTS
19
6 high priority

MONITORED ZONES
128
H3 cells

CITY SAFETY SCORE
82/100
+4.2 today

Make the cards visually consistent.

Do NOT make them oversized.

==================================================
7. CITY SAFETY / URBAN RISK SCORE

Instead of a generic "traffic score", create a meaningful metric:

"Urban Road Safety Score"

Score:

82 / 100

Label:

GOOD

Explain:

"The score reflects detected road hazards, traffic density and pedestrian-risk events across monitored areas."

The score should dynamically respond to events.

For example:

Normal road:

score contribution

Pothole:
reduces score

Multiple potholes in same H3 zone:
larger reduction

Traffic congestion:
reduces traffic component

Waterlogging:
reduces road condition component

Pedestrian danger:
reduces safety component

Critical incident:
large reduction

Show a breakdown:

ROAD CONDITION
88/100

TRAFFIC FLOW
76/100

PEDESTRIAN SAFETY
81/100

INFRASTRUCTURE
84/100

OVERALL
82/100

Use a clean circular score visualization or horizontal score bars.

==================================================
8. EVENT IMPACT LOGIC

The UI must communicate that detections actually affect the system.

For example:

New pothole detected:

POTHOLE DETECTED
94% confidence
BUS-042
H3 Zone: 8928308280fffff

↓

Pothole count:
46 → 47

↓

Zone risk:
MEDIUM → HIGH

↓

Road Safety Score:
84 → 82

↓

H3 hexagon:
highlighted on map

This is extremely important.

The dashboard should NOT simply display static numbers.

Create state-driven mock logic that demonstrates how new detections change:

pothole count

H3 zone incident count

zone severity

road safety score

recent alerts

map visualization

==================================================
9. LIVE MONITORING PAGE

Title:

Live Monitoring

Subtitle:

"Real-time AI perception from connected urban sensing units."

Top section:

LIVE BUS CAMERA

BUS-042
ROUTE 8A
● STREAMING

Large video panel.

Use an HTML5 video component structure so a real stream can later be connected.

For now use a realistic demo video/placeholder.

Overlay:

CAM-01
LIVE

GPS:
17.4065° N
78.4772° E

SPEED:
32 km/h

AI:
ACTIVE

AI DETECTION OVERLAY

When pothole is detected, show a bounding box style overlay.

Example:

┌─────────────────┐
│ POTHOLE │
│ 94% │
└─────────────────┘

Use subtle animated detection indicators.

==================================================
10. AI DETECTION ENGINE PANEL

Beside/below the camera:

AI PERCEPTION ENGINE

Status:
● RUNNING

Model:
YOLO

Inference:
32 FPS

Confidence Threshold:
60%

Frames Processed:
18,420

Detections Today:
47

Current Detection:
POTHOLE — 94%

Then show supported detection categories:

Potholes
● ACTIVE

Road Damage
○ READY

Traffic Signs
○ READY

Zebra Crossing
○ READY

Road Dividers
○ READY

Waterlogging
○ READY

Traffic Congestion
○ READY

Pedestrian Risk
○ READY

Rash Driving
○ READY

Incident Vehicles
○ READY

This gives judges a clear view of the complete planned system without falsely claiming everything is implemented.

==================================================
11. LIVE DATA PIPELINE

Create a visually clean horizontal pipeline:

PHONE CAMERA
● CONNECTED

→ VIDEO STREAM
● RECEIVING

→ YOLO
● PROCESSING

→ GPS
17.4065, 78.4772

→ H3
8928308280fffff

→ EVENT
POTHOLE 94%

→ CITY CONTROL CENTRE
● UPDATED

Each stage should have a status indicator.

When Demo Mode runs, animate the pipeline subtly.

==================================================
12. H3 MAP — HERO FEATURE

The map should be the main visual component.

Title:

Live Urban Road Intelligence

Subtitle:

"H3-based spatial aggregation of AI detections."

Large interactive map.

Use Leaflet / React Leaflet where possible.

Use H3-compatible architecture.

The frontend should be able to receive:

latitude
longitude
h3Index
eventType
confidence
severity
timestamp
busId

H3 VISUALIZATION

Display geographic hexagonal cells.

Each H3 cell represents a geographic area.

Color/intensity:

GREEN
Normal

YELLOW
Low Risk

ORANGE
Moderate Risk

RED
High Risk

DARK RED
Critical

The H3 cells should visually change when detection events occur.

Example:

Pothole detected
→ locate coordinate
→ determine H3 cell
→ increment zone count
→ update zone risk
→ update hexagon visualization

This should be clearly represented in the frontend logic.

==================================================
13. MAP EVENT INTERACTION

When clicking a pothole:

Open a compact side drawer.

POTHOLE DETECTION

Confidence:
94%

Bus:
BUS-042

Coordinates:
17.4065, 78.4772

H3:
8928308280fffff

Detected:
12:41:32 PM

Severity:
HIGH

[ View Zone ]

[ View Incident ]

When clicking an H3 hexagon:

Open:

H3 ZONE INTELLIGENCE

Zone ID:
8928308280fffff

Risk:
HIGH

Road Health:
62/100

Potholes:
7

Road Damage:
3

Traffic:
HIGH

Last Detection:
12:43 PM

[ View Details ]

[ Mark for Maintenance ]

==================================================
14. LIVE DETECTION FEED

Create a live event stream beside the map.

LIVE AI DETECTIONS
● LIVE

New detections appear at the top.

Example:

🔴 POTHOLE
94%
BUS-042
H3: 8928308280fffff
12 sec ago

🟠 ROAD DAMAGE
87%
BUS-017
H3: 8928308280ffffa
31 sec ago

🟡 PEDESTRIAN RISK
81%
BUS-021
H3: 8928308280fffe2
1 min ago

Even though only pothole detection is currently active, the other event types can appear as disabled/mock "planned" examples if clearly marked.

==================================================
15. POTHOLE DETECTION WORKFLOW

The most important working demonstration should be:

Video arrives from phone

AI detects pothole

Confidence calculated

GPS coordinate retrieved

Timestamp attached

H3 cell identified

Pothole event created

Event appears in live feed

Pothole count increases

H3 cell updates

Zone risk changes

Urban Road Safety Score updates

Incident appears in history

The UI must make this workflow obvious.

==================================================
16. ROAD INTELLIGENCE PAGE

Title:

Road Intelligence

← Back

Large H3 map.

Filters:

Detection Type
[All]
[Potholes]
[Road Damage]
[Waterlogging]
[Traffic Signs]
[Dividers]

Severity:
[All]
[Low]
[Medium]
[High]
[Critical]

Time:
[Today]
[7 Days]
[30 Days]

Bus:
[All Buses]

ZONE SUMMARY

Top Problematic Zones

Table:

H3 Zone
Incidents
Potholes
Risk
Last Detection
Action

Add:

[ View Zone ]

==================================================
17. TRAFFIC INTELLIGENCE PAGE

Title:

Traffic Intelligence

← Back

Show:

TRAFFIC FLOW SCORE
76/100

VEHICLES DETECTED
24,831

ACTIVE BOTTLENECKS
8

AVG VEHICLE DENSITY
Medium

Traffic density map.

Show road areas as:

Low
Medium
High
Severe

Charts:

Vehicle Density by Hour

Vehicle Classification

Cars
Buses
Trucks
Motorcycles
Auto-rickshaws

Traffic bottleneck list:

Route
Location
Density
Delay
Status

Use clean, professional charts.

==================================================
18. INCIDENT MANAGEMENT

Title:

Incident Management

← Back

Table:

Incident ID
Type
Severity
Bus
Location
Confidence
Time
Status

Example:

INC-1042
Pothole
HIGH
BUS-042
17.4065, 78.4772
94%
12:41 PM
OPEN

Clicking an incident opens a right-side drawer.

Do NOT force the user onto another page for every detail.

==================================================
19. OTHER DETECTION CATEGORIES

Create a "Detection Capabilities" section.

Show all categories:

Pothole Detection
● ACTIVE

Road Damage
○ MODEL PENDING

Traffic Sign Detection
○ MODEL PENDING

Zebra Crossing Detection
○ MODEL PENDING

Road Divider Detection
○ MODEL PENDING

Waterlogging Detection
○ MODEL PENDING

Traffic Congestion
○ ANALYTICS ACTIVE

Pedestrian / Child Crossing
○ MODEL PENDING

Rash / Dangerous Driving
○ MODEL PENDING

Incident Vehicle Tracking
○ MODEL PENDING

The UI should make it clear that these are the planned capabilities of the platform and that pothole detection is currently the primary working AI module.

==================================================
20. ANALYTICS PAGE

Title:

Urban Analytics

← Back

Create beautiful, clean charts.

Do NOT make charts huge or cluttered.

CHART 1

Pothole Detections

Last 7 Days

Use a smooth bar/line chart.

CHART 2

Road Risk Distribution

Low
Medium
High
Critical

Use a donut chart.

CHART 3

Detections by Type

Potholes
Road Damage
Traffic
Waterlogging
Pedestrian Risk

Use a clean horizontal bar chart.

CHART 4

Top H3 Risk Zones

Zone
Incident Count
Risk Score

Use a horizontal bar chart.

CHART 5

Urban Road Safety Score

Show trend over time.

Example:

Monday: 76
Tuesday: 78
Wednesday: 80
Thursday: 79
Friday: 82

Charts should use consistent typography, spacing and colors.

Avoid chart overload.

==================================================
21. FLEET PAGE

Title:

Fleet Monitoring

← Back

Cards:

BUS-042
● ONLINE

Route:
8A

Speed:
32 km/h

GPS:
● Connected

Camera:
● Streaming

AI:
● Active

Detections:
14

Each bus card should look professional.

Statuses:

ONLINE
WARNING
OFFLINE

Clicking a bus opens a detail drawer/page.

==================================================
22. BUS DETAIL

BUS-042

← Back

Show:

Live camera

Current location

Route

Speed

GPS status

AI status

Inference FPS

Today's detections

Potholes detected

Recent events

Route trail on map

The route should be a visible line on the map.

==================================================
23. SYSTEM ARCHITECTURE PAGE

Title:

System Architecture

← Back

Create a clean architecture diagram.

PHONE
Camera + GPS

↓

WiFi / Local Network

↓

LAPTOP / EDGE PROCESSING

OpenCV
YOLO
GPS
Event Logic

↓

FASTAPI

↓

URBANSENSE CONTROL CENTRE

↓

H3 GEO-SPATIAL ENGINE

↓

MAP
ANALYTICS
ALERTS
INCIDENTS

Make it visually impressive but simple.

==================================================
24. IMPLEMENTATION STATUS

Create a small "System Implementation Status" panel.

CURRENTLY IMPLEMENTED

● Phone camera streaming
● GPS acquisition
● Video reception
● Pothole AI detection
● Confidence filtering
● GPS-tagged events
● H3-based location mapping
● Live event visualization

NEXT MODULES

○ Road damage
○ Traffic sign detection
○ Zebra crossing detection
○ Waterlogging
○ Pedestrian risk
○ Rash driving
○ Incident vehicle tracking

This gives judges confidence that the current prototype is real and the remaining capabilities are planned extensions.

==================================================
25. API INTEGRATION

Prepare frontend for actual FastAPI backend.

Use a centralized API service.

Conceptually support:

GET /api/events
GET /api/events/recent
GET /api/buses
GET /api/buses/:id
GET /api/zones
GET /api/zones/:h3Index
GET /api/analytics
GET /api/health

WebSocket:

ws://localhost:8000/ws

The frontend should initially use mock data.

However, structure the code so mock data can easily be replaced by API calls.

Use:

NEXT_PUBLIC_API_URL

Do not hardcode API URLs inside components.

==================================================
26. REAL-TIME EVENT STATE

Implement a realistic demo state.

Every few seconds, generate a mock pothole event.

Example:

{
id: "INC-1048",
type: "pothole",
confidence: 0.94,
latitude: 17.4065,
longitude: 78.4772,
h3Index: "8928308280fffff",
busId: "BUS-042",
severity: "high",
timestamp: "..."
}

When this event is created:

pothole count increases

live feed updates

H3 zone count increases

map hexagon changes

zone severity updates

road safety score recalculates

incident list updates

notification appears

This is essential.

==================================================
27. DEMO MODE

Create:

[ DEMO MODE ]

toggle in header.

When enabled:

simulated bus movement

simulated GPS

simulated pothole detections

simulated H3 updates

simulated live events

simulated analytics changes

Display:

● DEMO MODE ACTIVE

Make this clearly visible.

When disabled, the dashboard should be ready to connect to the real FastAPI backend.

==================================================
28. NOTIFICATION SYSTEM

When a new critical detection appears, show a small notification:

NEW ROAD HAZARD

Pothole detected

Confidence:
94%

Bus:
BUS-042

Zone:
HIGH RISK

[ View ]

Notifications should be subtle and professional.

Do not use annoying popups.

==================================================
29. RESPONSIVE DESIGN

Desktop-first.

Primary target:
1440 × 900

Also support:
1280
1024
tablet

On smaller screens:

collapse sidebar

stack cards

map remains usable

detection feed moves below map

==================================================
30. COMPONENT ARCHITECTURE

Use clean reusable components.

Suggested structure:

components/
Sidebar
Header
PageHeader
BackButton
KPIGrid
LiveMap
H3Layer
MapControls
DetectionFeed
CameraFeed
AIPerceptionPanel
DataPipeline
SafetyScore
AnalyticsCharts
IncidentTable
IncidentDrawer
ZoneDrawer
BusCard
FleetGrid
StatusBadge
Notification

lib/
api.ts
mockData.ts
h3Utils.ts
mapUtils.ts
scoring.ts

Use TypeScript.

Use React state cleanly.

==================================================
31. SCORING LOGIC

Create a frontend utility that calculates a demonstration "Urban Road Safety Score".

Do not claim it is a scientifically validated safety metric.

It is a prototype composite score.

Example conceptual weighting:

Road Condition: 40%
Traffic Flow: 25%
Pedestrian Safety: 20%
Infrastructure: 15%

The score should change when event counts change.

For example:

More potholes
→ Road Condition decreases

More congestion
→ Traffic Flow decreases

Pedestrian risk
→ Pedestrian Safety decreases

Missing infrastructure
→ Infrastructure decreases

Then calculate:

Urban Road Safety Score

Show the breakdown visually.

==================================================
32. VISUAL QUALITY

This is extremely important.

Make the dashboard:

clean

premium

spacious

consistent

realistic

professional

judge-friendly

Do NOT:

cram too many cards

use random colors

use oversized text everywhere

use excessive gradients

use excessive animations

make every section look like a separate application

use fake 3D dashboards

make graphs difficult to read

Use consistent:

border radius

spacing

typography

icon sizes

card heights

section headers

Graphs should have:

clean axis labels

readable tooltips

minimal grid lines

appropriate spacing

consistent visual language

==================================================
33. JUDGE EXPERIENCE

The first screen should communicate the complete story immediately.

A judge should see:

LIVE BUS
↓
AI DETECTION
↓
GPS
↓
H3 ZONE
↓
CITY MAP
↓
RISK SCORE
↓
ACTION

Within approximately 5 seconds, they should understand:

"Our buses are acting as mobile sensors, AI detects road problems, GPS identifies where they occur, H3 aggregates them spatially, and the city control centre turns them into actionable intelligence."

==================================================
34. MOST IMPORTANT CURRENT DEMO

The live demonstration should work like this:

STEP 1
Start phone camera stream.

STEP 2
Laptop receives video.

STEP 3
YOLO detects a pothole.

STEP 4
Backend gets GPS coordinates.

STEP 5
Backend generates/assigns H3 cell.

STEP 6
Frontend receives event.

STEP 7
Dashboard shows:

POTHOLE DETECTED
94%

STEP 8
Pothole counter changes:

46 → 47

STEP 9
The corresponding H3 hexagon becomes more severe.

STEP 10
Zone statistics update.

STEP 11
Urban Road Safety Score changes.

STEP 12
The incident appears in the live event feed.

This should feel like one continuous real-time system.

==================================================
35. FINAL REQUIREMENT

Build the frontend now with realistic mock data and fully working UI interactions.

Do not build only static screens.

Navigation must work.

Back buttons must work.

Sidebar active states must work.

Tabs/toggles must work.

Map interactions must work as far as possible.

Drawers must open and close.

Filters must update displayed data.

Demo Mode must simulate detections.

New pothole events must update counters and H3-zone state.

Charts must update when appropriate.

The final result should look like a real operational Smart City Command Centre, while honestly showing that pothole detection is the currently implemented AI module and the remaining detection categories are the next modules to integrate.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://urban-sense-live.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/0ba68900-594d-4945-980c-6bb34a6422e3).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
