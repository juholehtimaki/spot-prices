import { Outlet, RouterProvider, createBrowserRouter } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { DailyPricesPage } from "./components/pages/DailyPricesPage";

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
        element: <DailyPricesPage />,
      },
    ],
  },
]);

export const AppRouter = () => <RouterProvider router={router} />;
