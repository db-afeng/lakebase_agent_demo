#!/usr/bin/env bash
#
# Lakebase Branch Management Script
# ==================================
# This script creates a Lakebase branch for local development, following the
# naming convention: {username}/{git_branch}
#
# Usage:
#   ./scripts/lakebase-branch.sh [--source BRANCH] [--force]
#
# Options:
#   --source BRANCH   Source branch to create from (default: production)
#   --force           Force recreation of existing branch
#
# Requirements:
#   - Databricks CLI >= 0.285 (with postgres commands)
#   - jq
#   - Authenticated to Databricks workspace

set -euo pipefail

# Configuration
PROJECT_ID="9e2e7ee4-bc9e-4753-8249-f8f49f8ac26d"
PROJECT_PATH="projects/${PROJECT_ID}"
DEFAULT_SOURCE_BRANCH_ID="br-ancient-star-d17umpql"  # Production branch ID
DEFAULT_SOURCE_BRANCH="${PROJECT_PATH}/branches/${DEFAULT_SOURCE_BRANCH_ID}"
# TODO: Use TTL when CLI bug is fixed: BRANCH_TTL="21600s"  # 6 hours
ENV_FILE=".env"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Parse arguments
SOURCE_BRANCH="$DEFAULT_SOURCE_BRANCH"
SOURCE_BRANCH_EXPLICIT=false
FORCE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --source)
            SOURCE_BRANCH="$2"
            SOURCE_BRANCH_EXPLICIT=true
            shift 2
            ;;
        --force)
            FORCE=true
            shift
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
    esac
done

echo -e "${BLUE}🚀 Lakebase Branch Manager${NC}"
echo "=================================="

# Check for required tools
check_requirements() {
    echo -e "\n${YELLOW}Checking requirements...${NC}"
    
    if ! command -v databricks &> /dev/null; then
        echo -e "${RED}❌ Databricks CLI not found. Install it first.${NC}"
        exit 1
    fi
    
    CLI_VERSION=$(databricks version 2>/dev/null | grep -oE 'v[0-9]+\.[0-9]+\.[0-9]+' | head -1 || echo "unknown")
    echo -e "  Databricks CLI: ${GREEN}${CLI_VERSION}${NC}"
    
    if ! command -v jq &> /dev/null; then
        echo -e "${RED}❌ jq not found. Install it: brew install jq${NC}"
        exit 1
    fi
    echo -e "  jq: ${GREEN}installed${NC}"
    
    # Check if postgres commands are available
    if ! databricks postgres --help &> /dev/null; then
        echo -e "${RED}❌ Databricks CLI postgres commands not available.${NC}"
        echo -e "   Upgrade to CLI version 0.285 or later.${NC}"
        exit 1
    fi
    echo -e "  Postgres commands: ${GREEN}available${NC}"
}

# Get current user info
get_user_info() {
    echo -e "\n${YELLOW}Getting user info...${NC}"
    
    USER_JSON=$(databricks current-user me -o json 2>/dev/null)
    if [[ -z "$USER_JSON" ]]; then
        echo -e "${RED}❌ Failed to get current user. Check your Databricks authentication.${NC}"
        exit 1
    fi
    
    USER_EMAIL=$(echo "$USER_JSON" | jq -r '.userName')
    # Sanitize email to be valid for branch name (lowercase, dots to hyphens)
    USER_NAME=$(echo "$USER_EMAIL" | cut -d'@' -f1 | tr '.' '-' | tr '[:upper:]' '[:lower:]')
    
    echo -e "  User: ${GREEN}${USER_EMAIL}${NC}"
    echo -e "  Sanitized: ${GREEN}${USER_NAME}${NC}"
}

# Get the parent git branch (the branch we were on when this branch was created)
get_parent_git_branch() {
    echo -e "\n${YELLOW}Detecting parent git branch...${NC}"
    
    PARENT_GIT_BRANCH=""
    
    # Use git reflog to find the branch we were on when this branch was created
    # Look for "checkout: moving from X to Y" where Y is our current branch
    CURRENT_BRANCH=$(git branch --show-current 2>/dev/null)
    
    if [[ -n "$CURRENT_BRANCH" ]]; then
        # Find the checkout entry that moved TO the current branch
        PARENT_GIT_BRANCH=$(git reflog show --format='%gs' HEAD 2>/dev/null | \
            grep "checkout: moving from .* to ${CURRENT_BRANCH}$" | \
            head -1 | \
            sed 's/checkout: moving from \([^ ]*\) to .*/\1/')
    fi
    
    if [[ -n "$PARENT_GIT_BRANCH" ]]; then
        echo -e "  Parent git branch: ${GREEN}${PARENT_GIT_BRANCH}${NC}"
    else
        echo -e "  ${YELLOW}Could not detect parent git branch from reflog${NC}"
    fi
}

# Get current git branch or worktree name
get_git_branch() {
    echo -e "\n${YELLOW}Getting git branch...${NC}"
    
    if ! git rev-parse --is-inside-work-tree &> /dev/null; then
        echo -e "${RED}❌ Not in a git repository${NC}"
        exit 1
    fi
    
    # Try to get the current branch name
    GIT_BRANCH=$(git branch --show-current 2>/dev/null)
    
    if [[ -z "$GIT_BRANCH" ]]; then
        # Detached HEAD - common in worktrees
        echo -e "  ${YELLOW}Detached HEAD detected (worktree)${NC}"
        
        # Get the worktree directory name
        WORKTREE_DIR=$(basename "$(git rev-parse --show-toplevel)")
        
        # Try to get the parent branch from the main worktree
        # git worktree list shows: /path/to/repo <commit> [branch] or (detached HEAD)
        MAIN_WORKTREE_INFO=$(git worktree list --porcelain 2>/dev/null | head -20)
        
        # Find the first worktree that has a branch (the main one usually)
        PARENT_BRANCH=""
        while IFS= read -r line; do
            if [[ "$line" == branch\ refs/heads/* ]]; then
                PARENT_BRANCH="${line#branch refs/heads/}"
                break
            fi
        done <<< "$MAIN_WORKTREE_INFO"
        
        if [[ -n "$PARENT_BRANCH" ]]; then
            # Combine parent branch + worktree dir for unique naming
            GIT_BRANCH="${PARENT_BRANCH}-worktree-${WORKTREE_DIR}"
            echo -e "  Parent branch: ${GREEN}${PARENT_BRANCH}${NC}"
        else
            # Fallback: just use worktree directory name
            GIT_BRANCH="worktree-${WORKTREE_DIR}"
            echo -e "  ${YELLOW}Could not determine parent branch${NC}"
        fi
        
        echo -e "  Worktree: ${GREEN}${WORKTREE_DIR}${NC}"
    fi
    
    # Sanitize branch name (lowercase, slashes/underscores to hyphens)
    SANITIZED_GIT_BRANCH=$(echo "$GIT_BRANCH" | tr '/' '-' | tr '_' '-' | tr '[:upper:]' '[:lower:]')
    
    echo -e "  Git branch: ${GREEN}${GIT_BRANCH}${NC}"
    echo -e "  Sanitized: ${GREEN}${SANITIZED_GIT_BRANCH}${NC}"
}

# Resolve the source Lakebase branch to use for branching
# Tries to find the user's Lakebase branch for the parent git branch, falls back to DEFAULT_SOURCE_BRANCH
resolve_source_branch() {
    echo -e "\n${YELLOW}Resolving source Lakebase branch...${NC}"
    
    # If --source was explicitly provided, use that and skip auto-detection
    if [[ "$SOURCE_BRANCH_EXPLICIT" == "true" ]]; then
        echo -e "  Using explicitly provided source: ${GREEN}${SOURCE_BRANCH}${NC}"
        return
    fi
    
    # If we detected a parent git branch, try to find its corresponding Lakebase branch
    if [[ -n "$PARENT_GIT_BRANCH" ]]; then
        # Sanitize the parent branch name the same way we sanitize git branches
        SANITIZED_PARENT=$(echo "$PARENT_GIT_BRANCH" | tr '/' '-' | tr '_' '-' | tr '[:upper:]' '[:lower:]')
        PARENT_LAKEBASE_NAME="${USER_NAME}-${SANITIZED_PARENT}"
        PARENT_LAKEBASE_PATH="${PROJECT_PATH}/branches/${PARENT_LAKEBASE_NAME}"
        
        echo -e "  Looking for parent Lakebase branch: ${BLUE}${PARENT_LAKEBASE_NAME}${NC}"
        
        # Try to get the parent Lakebase branch
        PARENT_BRANCH_JSON=$(databricks postgres get-branch "${PARENT_LAKEBASE_PATH}" -o json 2>/dev/null) || PARENT_BRANCH_JSON=""
        
        if [[ -n "$PARENT_BRANCH_JSON" ]]; then
            # Extract the full branch path from the name field (format: projects/{id}/branches/{branch_id})
            PARENT_BRANCH_FULL_PATH=$(echo "$PARENT_BRANCH_JSON" | jq -r '.name')
            
            if [[ -n "$PARENT_BRANCH_FULL_PATH" && "$PARENT_BRANCH_FULL_PATH" != "null" ]]; then
                SOURCE_BRANCH="$PARENT_BRANCH_FULL_PATH"
                echo -e "  ${GREEN}✓ Found parent Lakebase branch${NC}"
                echo -e "  Source branch: ${GREEN}${SOURCE_BRANCH}${NC}"
                return
            fi
        fi
        
        echo -e "  ${YELLOW}Parent Lakebase branch not found${NC}"
    fi
    
    # Fall back to default source branch
    SOURCE_BRANCH="$DEFAULT_SOURCE_BRANCH"
    echo -e "  Falling back to default: ${GREEN}${SOURCE_BRANCH}${NC}"
}

# Generate branch name
generate_branch_name() {
    # Format: {user}/{git_branch}
    LAKEBASE_BRANCH="${USER_NAME}-${SANITIZED_GIT_BRANCH}"
    LAKEBASE_BRANCH_PATH="${PROJECT_PATH}/branches/${LAKEBASE_BRANCH}"
    
    echo -e "\n${YELLOW}Lakebase branch name:${NC}"
    echo -e "  ${GREEN}${LAKEBASE_BRANCH}${NC}"
}

# Check if branch exists
check_branch_exists() {
    echo -e "\n${YELLOW}Checking if branch exists...${NC}"
    
    if databricks postgres get-branch "${LAKEBASE_BRANCH_PATH}" -o json &> /dev/null; then
        if [[ "$FORCE" == "true" ]]; then
            echo -e "  Branch exists. ${YELLOW}Force mode: will delete and recreate.${NC}"
            echo -e "  Deleting existing branch..."
            databricks postgres delete-branch "${LAKEBASE_BRANCH_PATH}" --no-wait || true
            sleep 5
        else
            echo -e "  Branch already exists! ${GREEN}Skipping creation.${NC}"
            BRANCH_EXISTS=true
            return
        fi
    fi
    BRANCH_EXISTS=false
}

# Create Lakebase branch
create_branch() {
    if [[ "$BRANCH_EXISTS" == "true" ]]; then
        return
    fi
    
    echo -e "\n${YELLOW}Creating Lakebase branch...${NC}"
    echo -e "  Source: ${BLUE}${SOURCE_BRANCH}${NC}"
    
    # Create branch from source
    # Note: Fields must be nested under "spec"
    # TODO: Add TTL when CLI bug is fixed: {"spec": {"ttl": {"seconds": 21600}}}
    BRANCH_RESULT=$(databricks postgres create-branch "${PROJECT_PATH}" "${LAKEBASE_BRANCH}" \
        --json '{"spec": {"source_branch": "'"${SOURCE_BRANCH}"'", "no_expiry": true}}' \
        -o json 2>&1) || {
        echo -e "${RED}❌ Failed to create branch${NC}"
        echo "$BRANCH_RESULT"
        exit 1
    }
    
    echo -e "  ${GREEN}✓ Branch created${NC}"
}

# Get or create endpoint
get_or_create_endpoint() {
    echo -e "\n${YELLOW}Setting up endpoint...${NC}"
    
    # Check for existing endpoints
    ENDPOINTS_JSON=$(databricks postgres list-endpoints "${LAKEBASE_BRANCH_PATH}" -o json 2>/dev/null || echo "[]")
    ENDPOINT_COUNT=$(echo "$ENDPOINTS_JSON" | jq 'length')
    
    if [[ "$ENDPOINT_COUNT" -gt 0 ]]; then
        # Use existing endpoint
        ENDPOINT_NAME=$(echo "$ENDPOINTS_JSON" | jq -r '.[0].name')
        ENDPOINT_HOST=$(echo "$ENDPOINTS_JSON" | jq -r '.[0].status.hosts.host')
        echo -e "  Using existing endpoint: ${GREEN}${ENDPOINT_HOST}${NC}"
    else
        # Create new endpoint
        echo -e "  Creating new endpoint..."
        ENDPOINT_RESULT=$(databricks postgres create-endpoint "${LAKEBASE_BRANCH_PATH}" "dev" \
            --json '{"spec": {"endpoint_type": "ENDPOINT_TYPE_READ_WRITE", "autoscaling_limit_min_cu": 0.5, "autoscaling_limit_max_cu": 2.0}}' \
            -o json 2>&1) || {
            echo -e "${RED}❌ Failed to create endpoint${NC}"
            echo "$ENDPOINT_RESULT"
            exit 1
        }
        
        ENDPOINT_NAME=$(echo "$ENDPOINT_RESULT" | jq -r '.name')
        # Need to get the endpoint again to get the host
        sleep 2
        ENDPOINT_JSON=$(databricks postgres get-endpoint "${ENDPOINT_NAME}" -o json)
        ENDPOINT_HOST=$(echo "$ENDPOINT_JSON" | jq -r '.status.hosts.host')
        echo -e "  ${GREEN}✓ Endpoint created${NC}"
    fi
    
    echo -e "  Host: ${GREEN}${ENDPOINT_HOST}${NC}"
}

# Generate database credentials
generate_credentials() {
    echo -e "\n${YELLOW}Generating database credentials...${NC}"
    
    CREDS_JSON=$(databricks postgres generate-database-credential "${ENDPOINT_NAME}" -o json 2>&1) || {
        echo -e "${RED}❌ Failed to generate credentials${NC}"
        echo "$CREDS_JSON"
        exit 1
    }
    
    # Lakebase uses OAuth tokens for auth
    # Username is the email, password is the OAuth token
    DB_USER="${USER_EMAIL}"
    DB_PASSWORD=$(echo "$CREDS_JSON" | jq -r '.token')
    CREDS_EXPIRE=$(echo "$CREDS_JSON" | jq -r '.expire_time')
    
    echo -e "  ${GREEN}✓ Credentials generated${NC}"
    echo -e "  Token expires: ${YELLOW}${CREDS_EXPIRE}${NC}"
}

# Write .env file
write_env_file() {
    echo -e "\n${YELLOW}Writing .env file...${NC}"
    
    cat > "$ENV_FILE" << EOF
# Lakebase Database Configuration
# Generated by scripts/lakebase-branch.sh
# Branch: ${LAKEBASE_BRANCH}
# Created: $(date -u +"%Y-%m-%dT%H:%M:%SZ")

LAKEBASE_AGENT_DEMO_DB_HOST=${ENDPOINT_HOST}
LAKEBASE_AGENT_DEMO_DB_PORT=5432
LAKEBASE_AGENT_DEMO_DB_NAME=databricks_postgres
LAKEBASE_AGENT_DEMO_DB_USER=${DB_USER}
LAKEBASE_AGENT_DEMO_DB_PASSWORD=${DB_PASSWORD}
LAKEBASE_AGENT_DEMO_DB_SSLMODE=require
EOF
    
    echo -e "  ${GREEN}✓ .env file written${NC}"
}

# # Run migrations
# run_migrations() {
#     echo -e "\n${YELLOW}Running database migrations...${NC}"
    
#     if command -v uv &> /dev/null; then
#         if uv run alembic upgrade head 2>&1; then
#             echo -e "  ${GREEN}✓ Migrations applied${NC}"
#         else
#             echo -e "  ${YELLOW}⚠ Migration failed (this may be expected for fresh branches)${NC}"
#             echo -e "  ${YELLOW}  If you see 'permission denied for schema public', ensure your user${NC}"
#             echo -e "  ${YELLOW}  has CREATE privileges on the database. For new Lakebase projects,${NC}"
#             echo -e "  ${YELLOW}  you may need to run migrations from the production branch first.${NC}"
#             echo -e "  ${YELLOW}  Run manually: uv run alembic upgrade head${NC}"
#         fi
#     else
#         echo -e "  ${YELLOW}⚠ uv not found, skipping migrations${NC}"
#         echo -e "  Run manually: uv run alembic upgrade head"
#     fi
# }

# Main execution
main() {
    check_requirements
    get_user_info
    get_git_branch
    get_parent_git_branch
    resolve_source_branch
    generate_branch_name
    check_branch_exists
    create_branch
    get_or_create_endpoint
    generate_credentials
    write_env_file
    # run_migrations
    
    echo -e "\n${GREEN}=================================="
    echo -e "✅ Lakebase branch setup complete!"
    echo -e "==================================${NC}"
    echo -e "\nBranch: ${BLUE}${LAKEBASE_BRANCH}${NC}"
    echo -e "Host:   ${BLUE}${ENDPOINT_HOST}${NC}"
    echo -e "\nYou can now start the dev server:"
    echo -e "  ${YELLOW}uv run apx dev start${NC}"
}

main
