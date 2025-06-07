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

## Deployment

The application is configured for automatic deployment to Netlify. Push to the main branch to trigger a deployment.

## License

MIT 