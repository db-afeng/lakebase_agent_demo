# Lakebase Agent Demo

A demo showing how to use **Databricks Lakebase branching** with AI agent coding tools (Cursor, Codex, Claude Code, etc.). Each agent worktree automatically gets its own isolated Lakebase database branch, so agents can make schema changes, seed data, and run migrations without interfering with each other or your main database.

## What This Demo Does

The repo sets up a simple e-commerce app ("Data & Bricks Store") with:

- **Backend:** Python + FastAPI
- **Frontend:** React + shadcn/ui
- **Database:** Databricks Lakebase (PostgreSQL)
- **API Client:** Auto-generated TypeScript client from OpenAPI schema

The app itself is intentionally simple. The real value is the **Lakebase branching workflow** -- showing how every developer and every agent worktree gets a fully isolated, copy-on-write database branch.

## How Lakebase Branching Works

```
production (default branch)
  |
  +-- jane-doe-main          (Jane's local dev branch)
  |     +-- jane-doe-main-worktree-abc123   (agent worktree branch)
  |     +-- jane-doe-main-worktree-def456   (another agent worktree)
  |
  +-- john-smith-feature-x   (John's feature branch)
```

Each branch is a **copy-on-write** clone of its parent. Reads are instant (shared storage), and writes are isolated. When an agent creates a worktree, the post-checkout git hook automatically creates a new Lakebase branch for that worktree. The agent can freely modify the database, and those changes stay isolated to its branch.

## Prerequisites

- **Databricks workspace** with Lakebase enabled and a Lakebase project created
- **Databricks CLI** >= 0.287.0 (with `postgres` commands) -- [install guide](https://docs.databricks.com/dev-tools/cli/install.html)
- **uv** -- Python package manager ([install](https://docs.astral.sh/uv/getting-started/installation/))
- **jq** -- JSON processor (`brew install jq` on macOS)
- **Authenticated Databricks CLI** profile (`databricks auth login`)

## Quick Start

### 1. Clone the repo

```bash
git clone <this-repo-url>
cd lakebase_agent_demo
```

### 2. Configure your Lakebase project

```bash
cp lakebase.config.example lakebase.config
```

Edit `lakebase.config` and set your Lakebase project ID:

```bash
LAKEBASE_PROJECT_ID="your-project-id-here"
```

You can find your project ID in the Databricks workspace under the Lakebase section.

### 3. Install dependencies and enable git hooks

```bash
uv run apx bun install
```

This installs frontend dependencies and enables the post-checkout git hook that automatically creates Lakebase branches for new worktrees.

### 4. Create your Lakebase branch

```bash
./scripts/lakebase-branch.sh
```

This creates your isolated Lakebase branch (named `{your-username}-{git-branch}`), sets up an endpoint, generates credentials, and writes them to `.env`.

### 5. Apply database migrations

```bash
uv run alembic upgrade head
```

### 6. Start development servers

```bash
uv run apx dev start
```

This starts the backend, frontend, and OpenAPI watcher. Visit the URL shown in the output.

## Try It With an AI Agent

Open this project in [Cursor](https://cursor.com) (or your preferred AI coding IDE) and try this prompt:

---

Implement product reviews for the websites. Here are the requirements:

- The Main Grid: Update the product cards on the homepage to display an aggregated star rating and review count (e.g., "★ 4.8 (42 reviews)") near the price.
- Product Details: When a user clicks "View Details," add a popup modal that shows the product info and lists all reviews for that item. there should be a way for the user to go the a full fledged details page for each product from the modal. In full page, Add a simple form on the details page allowing users to submit a rating (1-5 stars) and a comment.
- Funny Data: Please seed the database with 3-4 dummy reviews for each product. Since this is a satirical store, make the reviews humorous and technical. Examples: "The JSON was crisp and perfectly nested," "This brick has terrible latency," or "The SQL dump smelled like fresh tables."
- Design: Ensure the new UI elements match the existing dark mode and orange color scheme.

After implementing, run the lakebase-branch.sh script and start the dev app, checking the logs if everything is working.

---

The agent will create a worktree, which triggers the git hook to automatically set up an isolated Lakebase branch. The agent can then make database changes, run migrations, and modify the app -- all on its own isolated branch.

## How Branching Works (Details)

### Branch Naming Convention

| Context | Lakebase Branch Name |
|---------|---------------------|
| Production (deployed app) | `production` (default branch) |
| Local dev on `main` | `{username}-main` |
| Local dev on `feature-x` | `{username}-feature-x` |
| Agent worktree | `{username}-{parent-branch}-worktree-{worktree-dir}` |

Branch names are sanitized: dots become hyphens, slashes become hyphens, all lowercase.

### Branch TTL

By default, dev branches are created with a 6-hour TTL. You can change this in `lakebase.config` by setting `LAKEBASE_BRANCH_TTL`. Set to `"0"` for no expiry.

### Automatic Setup via Git Hook

When you run `bun install`, a post-checkout git hook is enabled. This hook runs `./scripts/lakebase-branch.sh` automatically whenever you:

- Check out a new branch
- Create a new worktree (e.g., when an agent creates one)

This means agents get their own database branch without any manual steps.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python, FastAPI |
| Frontend | React, Vite, shadcn/ui |
| Routing | @tanstack/react-router |
| Database | Databricks Lakebase (PostgreSQL) |
| Migrations | Alembic |
| API Client | Auto-generated from OpenAPI schema |
| Build Tool | [apx](https://github.com/databricks-solutions/apx) |

## Development Commands

```bash
uv run apx dev start      # Start all dev servers
uv run apx dev stop       # Stop all dev servers
uv run apx dev status     # Check server status
uv run apx dev check      # TypeScript + Python error checking
uv run apx dev logs       # View recent logs
uv run apx dev logs -f    # Stream logs in real-time
uv run apx build          # Build for production
```

## Deployment

Update the placeholder values in `databricks.yml` with your production Lakebase endpoint, then deploy:

```bash
databricks bundle deploy -p <your-profile>
```

For OAuth mode (recommended), configure these as Databricks App secrets: `DATABRICKS_CLIENT_ID`, `DATABRICKS_CLIENT_SECRET`, `DATABRICKS_HOST`.

---

Built with [apx](https://github.com/databricks-solutions/apx)
