# ARDA Frontend Console

The **ARDA Frontend Console** is the web management interface for the ARDA autonomous agent governance platform. It provides dedicated role-based consoles for platform super administrators, organization administrators, agent developers, and human calibration reviewers.

---

## 1. Role-Based Consoles

ARDA enforces strict role-based access control (RBAC). Upon signing in, users are automatically routed to their role's primary operational workspace:

| Role | Landing Path | Core Capabilities |
| :--- | :--- | :--- |
| **Super Admin** | `/platform` | Cluster-wide tenant administration, real-time platform health, organization suspension & reactivation, global cluster configuration, operator provisioning, and platform audit trail. |
| **Company Admin** | `/org` | Tenant member directory, role promotions, team invitations, and organization credential management (Vault BYOK). |
| **Agent Developer** | `/agents` | Agent registration, version configuration (LLM provider, execution mode, system prompt, baseline confidence threshold, MCP tool servers), and run inspection. |
| **Reviewer** | `/reviews` | Human-in-the-Loop review queue, confidence gate escalations, precedent similarity inspection, decision resolution (Approve / Reject), and conflict audit trail. |

---

## 2. Tech Stack & Architecture

- **UI Framework**: [React 19](https://react.dev/) with [TypeScript](https://www.typescriptlang.org/)
- **Build Engine**: [Vite](https://vite.dev/) with fast HMR and optimized production bundles
- **State Management**:
  - **Server State**: [@tanstack/react-query](https://tanstack.com/query) v5 for caching, background refetching, and mutation invalidation
  - **Client State**: [Zustand](https://github.com/pmndrs/zustand) for persistent user identity, JWT session storage, and role routing
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with a dark-mode first, high-density operations palette
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 3. Getting Started

### Prerequisites

- Node.js 20+
- npm or pnpm
- Running ARDA Gateway service (`http://127.0.0.1:8000`)

### Installation & Development

```bash
# Install dependencies
npm install

# Start local development server (defaults to port 5174)
npm run dev

# Run Oxlint / TypeScript type-check
npm run lint

# Build for production
npm run build
```

---

## 4. Environment Variables

Create a `.env` or `.env.local` file in the root of `arda-frontend`:

```env
# URL of the running ARDA API Gateway
VITE_API_BASE_URL=http://localhost:8000/api/v1

# Direct link to Temporal Web UI for workflow execution trees
VITE_TEMPORAL_UI_URL=http://localhost:8088
```

---

## 5. Directory Structure

```
src/
├── app/
│   ├── router/          # Route definitions and role-based route guards
│   └── main.tsx         # Application entry point
├── components/
│   └── shared/          # TopNav, modals, badges, and shared UI primitives
├── features/
│   ├── agents/          # Agent registration, versioning, MCP configuration
│   ├── auth/            # Auth store, JWT persistence, login & signup state
│   ├── organization/    # Member directory, invitations, role management
│   ├── platform/        # Super admin health, tenant controls, cluster config
│   ├── reviews/         # Human-in-the-Loop review queue and case resolution
│   └── runs/            # Dispatcher modal, run history, and execution inspector
├── pages/
│   ├── auth/            # Login, registration, and OTP verification pages
│   ├── guide/           # Interactive developer onboarding guide
│   └── landing/         # ARDA product overview and architecture diagrams
└── services/
    └── api.ts           # Axios client configured with JWT interceptors
```
