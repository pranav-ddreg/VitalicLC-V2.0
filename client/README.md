# VitalicLC Client

A Next.js project with TypeScript, Tailwind CSS, and Yarn package management.

## Prerequisites

- Node.js >= 18.0.0
- Yarn >= 1.22.0
- Git

## Setup Instructions

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd vitalic-LC/client
   ```

2. **Install dependencies:**

   ```bash
   yarn install
   ```

   ⚠️ **Important:** This project uses Yarn only. NPM commands will be blocked with "Please install Yarn instead" error.

3. **Initialize Git hooks:**

   ```bash
   yarn husky init ../.git  # Run this once to set up hooks
   ```

4. **Verify Git configuration:**
   - **Main Git repo:** `vitalicLC-V2.0/.git/` (parent directory)
   - **Client project's Git:** Uses parent directory git
   - **Git commands:** Run from `vitalicLC-V2.0/` or `vitalicLC-V2.0/client/` both work

5. **Git workflow:**

   ```bash
   # Stage all changes
   git add .

   # Commit changes (auto-runs quality checks via Husky)
   git commit -m "Your commit message"

   # Push to remote
   git push origin main
   ```

6. **Start development server:**

   ```bash
   yarn dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to view the application.

## Available Scripts

| Command             | Description                                            |
| ------------------- | ------------------------------------------------------ |
| `yarn dev`          | Start development server                               |
| `yarn build`        | Build for production                                   |
| `yarn start`        | Start production server                                |
| `yarn check-types`  | Run TypeScript type checking                           |
| `yarn check-format` | Check code formatting                                  |
| `yarn check-lint`   | Run ESLint                                             |
| `yarn lint`         | Run ESLint with auto-fix                               |
| `yarn format`       | Format code with Prettier                              |
| `yarn test-all`     | Run full quality check (format + lint + types + build) |

## Project Structure

```
client/
├── app/              # Next.js app router pages
├── public/           # Static assets
├── styles/           # Global styles
├── components/       # Reusable components
├── lib/              # Utility functions
└── types/            # TypeScript type definitions
```

## Tech Stack

- **Framework:** Next.js 15.5.5 with App Router
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4
- **Package Manager:** Yarn 1.22.19
- **Linting:** ESLint with Prettier
- **Git Hooks:** Husky for pre-commit checks

## Development Guidelines

1. **Package Installation:** Always use `yarn add` for dependencies
2. **Code Formatting:** Run `yarn format` before committing
3. **Linting:** Run `yarn lint` to fix issues
4. **Type Checking:** Run `yarn check-types` regularly
5. **Full Check:** Run `yarn test-all` before pushing

## Git Hooks (Automatic)

- Pre-commit hooks are set up automatically via Husky
- Runs linting and formatting checks
- Prevents commits with linting errors

## Environment Variables

Create a `.env.local` file in the client directory:

```env
NEXT_PUBLIC_APP_NAME=VitalicLC
# Add other environment variables here
```

## Deployment

```bash
# Build for production
yarn build

# Start production server
yarn start
```

## Troubleshooting

**npm install not working?**

- This project requires Yarn. Install Yarn and use `yarn install`.

**Git hooks not working?**

- Run `yarn install` to initialize Husky hooks.

**Port 3000 in use?**

- Change port: `yarn dev -p 3001`
