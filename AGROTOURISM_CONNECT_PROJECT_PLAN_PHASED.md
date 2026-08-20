# AGROTOURISM CONNECT
## Complete Phased Project Plan, Architecture, Modules & Claude Development Guide

---

# 1. Project Name

**Agrotourism Connect**

### Tagline
**Connect Land - Develop Tourism - Generate Revenue**

---

# 2. Project Vision

Agrotourism Connect will be a dynamic full-stack web application that connects:

- Landowners
- Investors
- Agro Tourism Developers
- Resort Developers
- Resort Operators
- Tourism Consultants
- Farmers
- Service Providers
- Customers / Tourists
- Internal Admin / Sales / Project Teams

The long-term objective is to manage the complete journey:

**Land -> Feasibility -> Planning -> Investment -> Development -> Tourism -> Operations -> Revenue**

The platform must not be built as only a static website.

It should ultimately contain:

1. Professional public website
2. Dynamic user application
3. Admin panel
4. CRM
5. Land and project management
6. Feasibility and project planning
7. Investor management
8. Development tracking
9. Resort operations
10. Revenue-sharing and finance
11. Marketplace
12. Automation and AI features

---

# 3. Mandatory Technology Stack

## Frontend

- React.js
- TypeScript
- Vite
- React Router
- Tailwind CSS
- React Hook Form
- Zod
- Axios
- Redux Toolkit or Zustand
- Recharts
- Lucide React

## Backend

- Node.js
- Express.js
- TypeScript
- REST API
- JWT Authentication
- bcrypt
- Zod or Joi validation
- Multer for uploads

## Database

- MongoDB
- Mongoose

## Media / Documents

Recommended:

- Cloudinary for images
- AWS S3 or secure cloud storage for private documents later

## Optional Integrations

Added in later phases:

- Google Maps
- Razorpay
- WhatsApp API
- Email
- SMS / OTP
- AI services

---

# 4. Development Principle

## DO NOT BUILD EVERYTHING AT ONCE

The application must be developed phase by phase.

Claude or any coding agent must:

1. Read the entire project plan.
2. Understand the long-term architecture.
3. Implement only the requested phase.
4. Preserve previous completed phases.
5. Test the current phase before moving to the next one.
6. Never replace real backend functionality with mock data once APIs exist.
7. Avoid creating future modules before they are required.

---

# 5. Recommended Project Architecture

```text
agrotourism-connect/
|
|-- frontend/
|   |-- src/
|   |   |-- assets/
|   |   |-- components/
|   |   |-- layouts/
|   |   |-- modules/
|   |   |-- pages/
|   |   |-- routes/
|   |   |-- services/
|   |   |-- hooks/
|   |   |-- store/
|   |   |-- types/
|   |   |-- utils/
|   |   |-- constants/
|   |-- package.json
|
|-- backend/
|   |-- src/
|   |   |-- config/
|   |   |-- middleware/
|   |   |-- modules/
|   |   |-- routes/
|   |   |-- services/
|   |   |-- utils/
|   |   |-- types/
|   |   |-- app.ts
|   |-- package.json
|
|-- docs/
|
|-- README.md
```

Each backend module should preferably follow:

```text
module-name/
|-- module.model.ts
|-- module.dto.ts
|-- module.validation.ts
|-- module.service.ts
|-- module.controller.ts
|-- module.route.ts
|-- module.types.ts
```

---

# 6. Main User Roles

## Super Admin

Full platform control.

## Admin

Manage operational platform data.

## Project Manager

Manage assigned projects and development work.

## Sales / CRM User

Manage leads, follow-ups, meetings and site visits.

## Landowner

Submit land and track project status.

## Investor

View opportunities and submit investment interest.

## Developer / Service Provider

Participate in development work.

## Resort Operator

Manage resort operations in later phases.

## Customer / Tourist

Search and book tourism properties in later phases.

---

# 7. Overall Development Roadmap

```text
PHASE 1
Core Platform + Website + Users + Land + Projects + CRM
        |
PHASE 2
Feasibility + Concept Planning + Financial Estimates
        |
PHASE 3
Investment + Development + Approvals + Project Execution
        |
PHASE 4
Resort Operations + Bookings + Guests + Activities
        |
PHASE 5
Finance + Revenue Sharing + Owner / Investor Statements
        |
PHASE 6
Public Marketplace + Tourism Discovery + Online Booking
        |
PHASE 7
Automation + Integrations + AI + Advanced Analytics
```

---

# PHASE 1 - CORE MVP

## 8. Phase 1 Objective

Create a usable business platform for:

- Public visitors
- Landowners
- Investors
- Admin team
- CRM / Sales team

The system should already allow the business to:

- Collect land opportunities
- Register landowners
- Register investors
- Create projects
- Capture enquiries
- Manage leads
- Record follow-ups
- Schedule site visits
- Store essential documents

Phase 1 should be fully operational before Phase 2 begins.

---

# 9. Phase 1 - Public Website

## Main Navigation

- Home
- About
- Agro Tourism
- Land Development
- Resort Development
- Investment Opportunities
- Projects
- Services
- Gallery
- Knowledge Center
- Contact
- Login
- Register

## Homepage

### Hero

**Turn Land Into a Revenue-Generating Tourism Asset**

Supporting concept:

Agrotourism Connect brings together landowners, investors, developers and tourism operators to create professionally planned Agro Tourism and Resort Tourism projects.

### Main CTA Buttons

- List Your Land
- Explore Projects
- Become an Investor

## Homepage Sections

1. Hero
2. What is Agro Tourism?
3. How It Works
4. Who We Connect
5. Services
6. Revenue Opportunities
7. Featured Projects
8. Investment Opportunities
9. Landowner CTA
10. Development Process
11. Agro Tourism Activities
12. Resort Development
13. Why Choose Us
14. FAQs
15. Contact CTA
16. Footer

---

# 10. Phase 1 - Authentication

## Features

- Registration
- Login
- Logout
- Forgot Password
- Reset Password
- JWT Authentication
- Role-Based Authorization
- Protected Routes

## User Fields

- Full Name
- Email
- Mobile
- Password
- Role
- City
- State
- Status

## User Status

- Active
- Inactive
- Pending Verification
- Blocked

---

# 11. Phase 1 - Landowner Module

Landowners can submit land for possible Agro Tourism / Resort development.

## Owner Details

- Owner Name
- Mobile
- Email
- Alternate Mobile

## Land Details

- Property / Land Title
- State
- District
- Taluka
- Village
- Survey / Gat Number
- Total Land Area
- Area Unit
- Agricultural / NA Status
- Current Land Use
- Asking Price if applicable

## Location

- Address
- Latitude
- Longitude
- Google Maps Link

## Connectivity

- Main Road Distance
- Highway Distance
- Railway Distance
- Airport Distance
- Nearby Tourism Destinations

## Infrastructure

- Road Access
- Road Width
- Electricity
- Water Source
- Borewell
- Well
- River / Lake / Dam Nearby

## Existing Development

- Existing Building
- Farmhouse
- Shed
- Restaurant
- Cottages
- Swimming Pool
- Plantation

## Development Interest

- Agro Tourism
- Resort
- Farm Stay
- Tourism Plotting
- Villa Development
- Wellness Tourism
- Adventure Tourism
- Nursery
- Organic Farm
- Mixed Project

## Uploads

- Land Photos
- Videos
- 7/12
- Property Card
- Survey Map
- Layout
- Other Documents

## Land Status

- Draft
- Submitted
- Under Review
- Site Visit Required
- Feasible
- Not Feasible
- Proposal Prepared
- Investor Required
- Development Started
- Operational

In Phase 1, Feasible and later statuses may be controlled by Admin even though detailed feasibility comes in Phase 2.

---

# 12. Phase 1 - Project Module

Admin can convert a land submission into a project.

## Project Fields

- Project Name
- Project Code
- Landowner
- Location
- Total Land
- Project Type
- Description
- Status
- Project Manager
- Start Date
- Expected Completion
- Project Images

## Project Types

- Agro Tourism
- Resort
- Farm Stay
- Tourism Plotting
- Villa Resort
- Wellness Resort
- Eco Resort
- Mixed Tourism Development

## Project Status

- Draft
- Planning
- Feasibility
- Investor Required
- Under Development
- Operational
- On Hold
- Closed

---

# 13. Phase 1 - Investor Module

## Investor Profile

- Investor Name
- Company
- Mobile
- Email
- City
- State
- Preferred Investment Range
- Preferred Locations
- Preferred Project Types

## Investment Ranges

- Below Rs 25 Lakh
- Rs 25-50 Lakh
- Rs 50 Lakh - Rs 1 Crore
- Rs 1-5 Crore
- Rs 5-10 Crore
- Above Rs 10 Crore

## Investor Actions

- View approved investment opportunities
- Submit Interest
- Request Callback
- Request Meeting
- Request Site Visit

Do not expose confidential documents by default.

---

# 14. Phase 1 - CRM / Lead Management

## Lead Sources

- Website
- WhatsApp
- Facebook
- Instagram
- Google Ads
- Referral
- Existing Customer
- Event
- Broker
- Other

## Lead Types

- Landowner
- Investor
- Customer
- Resort Operator
- Developer
- Service Provider

## Lead Status

- New
- Contacted
- Interested
- Follow-up
- Meeting Scheduled
- Site Visit Scheduled
- Proposal Sent
- Negotiation
- Converted
- Lost
- Not Interested

## Lead Fields

- Name
- Mobile
- Email
- Location
- Source
- Lead Type
- Requirement
- Budget
- Assigned User
- Next Follow-up Date
- Notes
- Status

## Follow-up History

Every communication should be stored with:

- Date
- Time
- Communication Type
- Notes
- Next Action
- Next Follow-up
- User Who Added It

---

# 15. Phase 1 - Site Visit Module

## Fields

- Lead / User
- Project
- Visit Date
- Visit Time
- Number of Visitors
- Assigned Employee
- Meeting Point
- Remarks
- Status

## Statuses

- Scheduled
- Confirmed
- Completed
- Cancelled
- Rescheduled
- No Show

## After Visit

- Notes
- Photos
- Customer Feedback
- Next Action

---

# 16. Phase 1 - Basic Document Management

## Categories

- Land Documents
- Project Documents
- Agreements
- Investor Requests
- Site Reports
- Other

## Features

- Upload
- Preview
- Download
- Category
- Document Number
- Issue Date
- Expiry Date
- Visibility

## Visibility

- Admin Only
- Project Team
- Landowner
- Authorized Investor

Private land documents must never be public.

---

# 17. Phase 1 - Admin Dashboard

Display:

- Total Users
- Total Landowners
- Total Investors
- Total Land Submissions
- Total Projects
- New Leads
- Follow-ups Due
- Site Visits Scheduled
- Recent Activities

## Admin Management

- Users
- Landowners
- Investors
- Land Listings
- Projects
- Leads
- Follow-ups
- Site Visits
- Documents
- Website Enquiries

---

# 18. Phase 1 - Recommended MongoDB Collections

```text
users
landSubmissions
projects
investorProfiles
investorInterests
leads
leadFollowUps
siteVisits
documents
enquiries
auditLogs
```

---

# 19. Phase 1 - Completion Criteria

Phase 1 is complete only when:

- Registration works
- Login works
- Role permissions work
- Admin can manage users
- Landowner can submit land
- Admin can review land
- Admin can create a project
- Investor can submit interest
- Website enquiry creates a lead
- CRM follow-up history works
- Site visits can be scheduled
- Documents can be uploaded securely
- Dashboard data comes from MongoDB
- No critical module depends on mock data
- TypeScript checks pass
- Production build passes
- `.env.example` exists
- Seeded Super Admin exists
- README contains setup instructions

---

# PHASE 2 THROUGH PHASE 7

Phases 2-7 (Feasibility & Planning, Investment & Development, Resort Operations, Finance & Revenue Sharing, Public Marketplace, Automation/AI) are described in full in the original project plan documents but are explicitly OUT OF SCOPE for the current build. Do not implement them until requested.

---

# 82. CLAUDE MASTER INSTRUCTION

Use this prompt before starting any phase:

```text
Read the complete AGROTOURISM_CONNECT_PROJECT_PLAN_PHASED.md file first.

This file describes the long-term architecture of Agrotourism Connect.

IMPORTANT:

1. Understand all phases so the architecture remains future-ready.
2. Implement ONLY the phase I explicitly request.
3. Do not start modules from later phases.
4. Preserve all previously working functionality.
5. Inspect the existing repository before editing.
6. Reuse existing components and patterns where appropriate.
7. Do not remove existing data or functionality unless clearly required.
8. Use React.js + TypeScript for frontend.
9. Use Node.js + Express.js + TypeScript for backend.
10. Use MongoDB + Mongoose.
11. Keep frontend and backend modular.
12. Connect frontend to real backend APIs.
13. Do not leave critical functionality using mock data.
14. Add frontend and backend validation.
15. Add correct authentication and authorization.
16. Add loading, error and empty states.
17. Use professional compact responsive UI.
18. Test the completed phase.
19. Run TypeScript checks, lint and production build.
20. Fix relevant errors before declaring the phase complete.
```

---

# 90. Final Product Vision

The central business idea remains:

# **Grow + Stay + Experience + Earn**

And the core platform message remains:

# **One Land - Multiple Businesses - Multiple Revenue Streams - Lasting Value**
