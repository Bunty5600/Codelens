# CodeLens AI — Frontend

CodeLens AI is a code analysis platform designed to help developers understand code complexity, maintainability, and quality through useful metrics and AI-powered insights.

This directory contains the frontend application.

## Tech Stack

- **React** — Building the user interface
- **Vite** — Development server and build tooling
- **Tailwind CSS** — Styling
- **Clerk** — Authentication
- **Axios** — HTTP requests
- **React Router** — Client-side navigation
- **Recharts** — Data visualization

## Prerequisites

Before getting started, make sure you have:

-- Node.js 20.19+ or 22.12+ (required by Vite 8)
- npm installed
- Git installed (if cloning the repository)
- Access to the required frontend environment configuration

You can check your Node.js and npm versions using:

```bash
node --version
npm --version
```

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Bunty5600/Codelens.git
cd Codelens/frontend
```

If you are contributing through a fork, clone your own fork instead.

### 2. Install dependencies

```bash
npm install
```

This installs the frontend dependencies listed in `package.json`.

### 3. Configure environment variables

Create a `.env` file inside the `frontend` directory.

Add the following variables:

```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_API_URL=your_backend_api_url
```

Replace the placeholder values with the appropriate configuration for your environment.

- `VITE_CLERK_PUBLISHABLE_KEY` — Clerk publishable key used for authentication.
- `VITE_API_URL` — URL of the CodeLens backend API.

**Important:** Do not commit `.env` files containing real credentials. Variables prefixed with `VITE_` are exposed to frontend code and must not contain private secrets.

### 4. Start the development server

```bash
npm run dev
```

Open the local URL displayed in your terminal to view the application.

The backend API may also need to be running for features that depend on server requests.

## Available Commands

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite development server |
| `npm run build` | Create a production build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint checks |

## Troubleshooting

### Dependencies fail to install

Check that Node.js and npm are installed correctly and that your Node.js version is compatible with the project's Vite version.

Then retry:

```bash
npm install
```

### Authentication does not work

Check that `VITE_CLERK_PUBLISHABLE_KEY` is correctly configured in your `.env` file.

Restart the development server after updating environment variables.

### API requests fail

Check that:

- `VITE_API_URL` points to the correct backend address.
- The backend service is running.
- The backend allows requests from your frontend origin.

### Changes to environment variables are not reflected

Stop the development server and restart it:

```bash
npm run dev
```

## Contributing

Contributions that improve the application, documentation, or developer experience are welcome.

1. Fork the repository.
2. Create a new branch for your changes.
3. Make and review your changes.
4. Commit with a descriptive message.
5. Open a pull request to the original repository.

For broader project setup and backend information, see the [main README](../README.md).

## License

Refer to the repository for any available licensing information.
