# AI Buddy - SMS Assistant

An AI-powered SMS assistant that users can communicate with via text messages. The system includes a web dashboard for configuration and monitoring.

## Features

- SMS communication with AI assistant using Vonage API
- Web dashboard for configuration and monitoring
- User authentication and management
- Analytics and logging
- Customizable AI responses

## Tech Stack

- Frontend: React.js
- Backend: Netlify Functions
- Database: Firebase
- SMS: Vonage API
- Hosting: Netlify
- Authentication: Firebase Auth

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:

   - Create a `.env` file in the root directory
   - Add the following variables:
     ```
     VONAGE_API_KEY=your_vonage_api_key
     VONAGE_API_SECRET=your_vonage_api_secret
     FIREBASE_API_KEY=your_firebase_api_key
     FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
     FIREBASE_PROJECT_ID=your_firebase_project_id
     FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
     FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
     FIREBASE_APP_ID=your_firebase_app_id
     ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
/
├── src/
│   ├── components/     # React components
│   ├── pages/         # Page components
│   ├── functions/     # Netlify functions
│   ├── services/      # API services
│   ├── utils/         # Utility functions
│   └── styles/        # CSS styles
├── public/            # Static files
└── netlify/          # Netlify configuration
```

## Component & Feature Guide

### Layout & Navigation

- **Navbar.tsx**: Main navigation bar, includes links to Dashboard, Docs, About, and Sign In/Out. Responsive for mobile and desktop.
- **SlimFooter.tsx**: Minimal footer with branding, navigation links, and copyright.
- **Layout.tsx**: (If used) Provides a wrapper for pages, including navigation and main content area.

### Dashboard Structure

- **Dashboard.tsx**: Main dashboard page. Handles user authentication, tab navigation (Overview, Messages, Settings, Pricing), data fetching, and renders all dashboard features and modals.
- **DashboardSidebar.tsx**: Sidebar navigation for dashboard tabs (Overview, Messages, Settings, Pricing).
- **DashboardHeader.tsx**: Displays a welcome message and user avatar at the top of the dashboard.
- **SlimFooter.tsx**: Renders at the bottom of the dashboard for consistent branding.

### Dashboard Tabs & Features

- **StatCards.tsx**: Shows quick stats: total messages, tokens used, average response time, and notification status.
- **DashboardCharts.tsx**: Visualizes message and response time analytics using charts.
- **ProfileInfo.tsx**: Displays user profile information: phone number, AI personality, response time, and notification status.
- **ConversationSummary.tsx**: Shows a summary of recent AI conversations.
- **Messages.tsx**: Displays user messages and conversation history.
- **AdminAnalytics.tsx**: (Admin only) Shows global analytics for all users, tokens, and messages.

### Settings & Personalization

- **Settings.tsx**: Allows users to edit personal info, customize AI personality and relationship, manage notification preferences, and upgrade to Pro (navigates to Pricing tab).

### Pricing & Plans

- **PricingSection.tsx**: Displays all available plans (Free, Pro, Pay As You Go) with a feature comparison table, plan cards, billing toggle, testimonial, and guarantee. Only one plan can be "Current Plan" at a time.

### Modals & Onboarding

- **PhoneRequiredModal.tsx**: Modal that prompts users to complete their profile (phone, name) if missing. Blocks dashboard usage until completed, uses fade-in animation, disables background scrolling, and handles validation and saving of user info.

## How Components Work Together

- The **Dashboard** page is the main entry point after login. It manages user state, tab navigation, and renders all dashboard features.
- **Sidebar** and **Header** provide navigation and context.
- **StatCards**, **Charts**, **ProfileInfo**, and **ConversationSummary** make up the Overview tab.
- **Settings** allows profile and AI customization, and can trigger navigation to Pricing.
- **PricingSection** displays all plans and handles upgrades.
- **PhoneRequiredModal** ensures users complete their profile before using the dashboard.
- **AdminAnalytics** is only visible to admin users.

## Deployment

The application is configured for automatic deployment to Netlify. Push to the main branch to trigger a deployment.

## License

MIT
