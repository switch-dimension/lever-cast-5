
# Build With AI Students

> 👩‍🎓 This is the repository for the LeverCast project. It is not complete and is still under development. It does not contain any seed files for the database and is not in a fully working state. It is only meant to be used as a reference for the course. As the final modules are released, I will update the repository.


## Course Module Checkpoints

To start working from a specific course module, you can checkout the corresponding commit. Follow these steps:

1. First, clone the repository if you haven't already:
   ```bash
   git clone https://github.com/yourusername/lever-cast-5.git
   cd lever-cast-5
   ```

2. List all available module tagged checkpoints (every commit has a hash and message and I'm also tagging selected points with a tage name I recommend you use)
   ```bash
   git tag
   ```

3. Checkout the desired module checkpoint as a new branch:(Creating a new branch which you can name yourself. This allows you to work on a specific module without affecting other modules, or just download the whole project and start from the latest commit, or just use the project whole as reference)
   ```bash
   git checkout -b <new_branch_name> <tag_name>
   ```

4. Install dependencies for that version: (This installs all the modules we need from the cloud for the project "Dependencies")
   ```bash
   npm install
   ```

5. Set up your environment variables as specified in the module instructions

Note: Make sure to commit or stash any changes before checking out a different checkpoint.

Latest Recommended checkpoints:
- tag "template-create-module" Commit Hash: `7852a9b30769dbb118aca129140819a2682f080f`: Feature: Enhance platform preview (This is the latest checkpoint at the Templates setup Lesson)

# LeverCast

LeverCast is a powerful social media content management platform that helps users create, manage, and publish content across multiple social media platforms using customizable templates.

## Features

- **User Authentication**: Secure authentication using Clerk
- **Content Management**: Create, edit, and manage social media posts
- **Templates**: Create and use templates for consistent content creation
- **Multi-platform Support**: Manage content for different social media platforms
- **Customizable Settings**: Configure platform-specific settings for each user

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Backend**: Next.js API routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Clerk
- **Styling**: Tailwind CSS with shadcn/ui components
- **Form Handling**: React Hook Form with Zod validation

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL database (or use Supabase as configured)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/lever-cast-5.git
   cd lever-cast-5
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```
   # Clerk
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   WEBHOOK_SECRET=your_webhook_secret

   # Database
   DATABASE_URL=your_database_connection_string
   DIRECT_URL=your_direct_database_connection_string
   ```

4. Set up the database:
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

- `/src/app`: Next.js app router pages and API routes
- `/src/components`: Reusable UI components
- `/src/lib`: Utility functions and configuration
- `/src/hooks`: Custom React hooks
- `/src/services`: Service layer for data operations
- `/prisma`: Database schema and migrations

## Database Schema

The application uses the following data models:

- **User**: User accounts linked to Clerk authentication
- **Post**: Social media posts created by users
- **Template**: Reusable content templates
- **SocialMediaPlatform**: Supported social media platforms
- **UserPlatformSettings**: User-specific settings for each platform

## Deployment

This project can be deployed on Vercel or any other Next.js-compatible hosting platform:

```bash
npm run build
npm run start
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
