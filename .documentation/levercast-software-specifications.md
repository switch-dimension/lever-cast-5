# System Design
- Web application for busy entrepreneurs to capture, format, and publish content ideas.
- Supports raw text input and image uploads.
- Uses LLM-powered templates to generate platform-specific content (initially for LinkedIn and Twitter).
- Provides styled previews mimicking final social media appearance.
- Includes a dashboard for creating, editing, and managing content.
- Enables one-click publishing via OAuth integrations.

# Architecture pattern
- **Frontend:** Single Page Application (SPA) using React and Next.js.
- **Backend:** Serverless/microservices architecture hosted on Vercel.
- LLM integration as a dedicated service for content formatting.
- Clear separation between client (UI) and server (API) layers.

# State management
- Local UI state managed with React state/hooks.
- Global state management via Context API (or Redux if scaling demands).
- Real-time preview updates through client-side caching.
- Synchronization with server state from Supabase.

# Data flow
- **Input:** User submits raw text and optional image.
- **Processing:** Data is sent to the LLM service for content formatting.
- **Output:** Formatted content is displayed in styled previews.
- **Editing:** Users can make inline edits before finalizing.
- **Publishing:** Final content is sent to the backend, stored in Supabase, and pushed to social media via OAuth.
- **Review:** Content and status (draft, pending, published) are accessible from a dashboard.

# Technical Stack
- **Frontend:** React, Next.js, Tailwind CSS, Shadcn UI, Lucide Icons, Sonner Toast.
- **Backend:** Prisma, Supabase, Vercel.
- **Authentication & Payment:** Clerk Auth, Stripe.
- **Integrations:** OAuth for social media (LinkedIn, Twitter).

# Authentication Process
- User registration and login managed via Clerk Auth.
- Social media account integration via OAuth (initially LinkedIn and Twitter).
- Secure session management with token storage.
- Role-based access control for content creation and management.

# Route Design
- **/dashboard:** Central hub for accessing all features.
- **/edit-post:** Content creation interface for entering text and uploading images.
- **/posts:** List/grid view for recent posts with status indicators.
- **/settings:** User and app configuration options.
- **/templates:** Display of available LLM-powered content templates.
- Additional routes for OAuth callback and authentication flows.

# API Design
- **Content Endpoints:** CRUD operations for posts (create, read, update, delete).
- **Formatting Endpoint:** Endpoint to process content using LLM-powered templates.
- **Authentication Endpoints:** Manage user sessions and OAuth integrations.
- **Publishing Endpoint:** Trigger one-click publish to connected social platforms.
- JSON-based request/response structure with appropriate error handling.

# Database Design ERD
- **Users Table:**  
  - User ID, name, email, authentication tokens.
- **Posts Table:**  
  - Post ID, user ID (foreign key), raw content, formatted content, image URL, status (draft, pending, published), timestamps.
- **Templates Table:**  
  - Template ID, name, prompt details, associated metadata.
- **Social Integrations Table:**  
  - Integration ID, user ID (foreign key), platform (LinkedIn, Twitter), OAuth tokens, integration status.
- **Audit Logs Table (Optional):**  
  - Log ID, user ID, action type, timestamp, description.
