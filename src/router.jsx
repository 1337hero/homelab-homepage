import {
  createRouter,
  createRoute,
  createRootRoute,
  Outlet,
  createHashHistory,
} from "@tanstack/react-router"
import { lazy, Suspense } from "preact/compat"
import MainLayout from "@/components/layouts/MainLayout"

const Dashboard = lazy(() => import("@/pages/Dashboard"))

const rootRoute = createRootRoute({
  component: () => (
    <MainLayout>
      <Suspense fallback={
        <div class="min-h-screen flex items-center justify-center">
          <div class="text-4xl animate-float">🏠</div>
        </div>
      }>
        <Outlet />
      </Suspense>
    </MainLayout>
  ),
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Dashboard,
})

const routeTree = rootRoute.addChildren([indexRoute])

const hashHistory = createHashHistory()

export const router = createRouter({ routeTree, history: hashHistory })
