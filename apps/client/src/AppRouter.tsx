import { Outlet, RouterProvider, createBrowserRouter } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { DailyDashboardPage } from "./components/pages/DailyDashboardPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Layout>
        <Outlet />
      </Layout>
    ),
    children: [
      {
        index: true,
        element: <DailyDashboardPage />,
      },
    ],
  },
]);

export const AppRouter = () => <RouterProvider router={router} />;
