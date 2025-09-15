# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

### Development

```bash
pnpm dev          # Start development server with Turbopack
pnpm build        # Build for production with Turbopack
pnpm start        # Start production server
```

### Code Quality

```bash
pnpm lint         # Run ESLint
pnpm lint:fix     # Fix ESLint issues
pnpm format       # Format code with Prettier
pnpm fix          # Run both lint:fix and format (recommended)
pnpm typecheck    # TypeScript type checking
```

## Project Architecture

This is a **Next.js 15.5.3** drone show control system using the **App Router** with the following key architectural decisions:

### Core Technologies

- **Framework**: Next.js 15.5.3 with App Router and Turbopack
- **UI Libraries**: Material-UI v7 + Tailwind CSS v4 (with preflight disabled)
- **3D Rendering**: Three.js via React Three Fiber + Drei
- **Maps**: MapLibre GL (v4.7.1)
- **State Management**: Zustand
- **GraphQL Client**: Apollo Client v4 (configured but not actively used)
- **Package Manager**: pnpm

### Important Setup Notes

- **Apollo Provider Issue**: The current Apollo setup in `src/lib/apollo/ApolloProvider.tsx:3` imports `ApolloProvider` incorrectly. It should import from `@apollo/client/react` instead of `@apollo/client`.
- **Tailwind Config**: Uses `important: '#__next'` to work with Material-UI and has `preflight: false`

### Key Architecture Patterns

#### Layout Structure

- **Root Layout**: `src/app/layout.tsx` provides providers (Apollo, Theme) and main layout with Sidebar + Header
- **Page Structure**: Uses App Router with pages in `src/app/[route]/page.tsx`
- **Navigation**: Sidebar-based navigation with Header component

#### Data Layer

- **Mock Data**: Currently uses dummy data in `useDroneData.ts` hook
- **Apollo Setup**: GraphQL client configured for `http://localhost:4000/graphql` but not actively used
- **State Management**: Zustand for client-side state

#### 3D Visualization (`src/components/3d/DroneScene.tsx`)

- **Coordinate System**: GPS coordinates converted to 3D space (centered on Tokyo: 139.6503, 35.6762)
- **Rendering**: Uses React Three Fiber with custom Drone3D components
- **Features**: Orbit controls, fog effects, ground plane with grid, drone status colors

#### Type System (`src/types/drone.ts`)

- **Comprehensive Types**: Extensive drone-related types including formations, commands, flight plans
- **Status Types**: 'active' | 'inactive' | 'warning' | 'error'
- **Advanced Features**: Support for show sequences, waypoints, performance metrics

### File Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Dashboard (homepage)
│   ├── 3d/page.tsx        # 3D visualization
│   ├── map/page.tsx       # Map view
│   └── patterns/page.tsx  # Pattern management
├── components/
│   ├── 3d/DroneScene.tsx  # Three.js drone visualization
│   ├── map/DroneMap.tsx   # MapLibre GL integration
│   ├── layout/            # Header, Sidebar components
│   └── patterns/          # Pattern generation/demo
├── hooks/
│   └── useDroneData.ts    # Drone data management hook
├── lib/
│   ├── apollo/            # GraphQL client setup
│   ├── theme/            # Material-UI theme system
│   └── drone-utils.ts    # Drone utility functions
└── types/
    └── drone.ts          # TypeScript type definitions
```

### Development Workflow

- **Pre-commit Hooks**: Husky + lint-staged automatically runs linting/formatting
- **Code Quality**: ESLint + Prettier with strict TypeScript configuration
- **Japanese Documentation**: README.md is in Japanese, reflecting the project's target market
