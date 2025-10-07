import HomePage from "../views/home";
import PaymentPage from "../views/payment";
import ProfilePage from "../views/profile";
import PurchasePage from "../views/purchase";
import SetupPage from "../views/setup";
import { AppRoute } from "../helpers/types";

export const createRoutes = (): AppRoute[] => [
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/profile",
    element: <ProfilePage />,
  },
  {
    path: "profile/money",
    element: <PaymentPage />,
  },
  {
    path: "/setup/android",
    element: <SetupPage />,
  },
  {
    path: "/purchase",
    element: <PurchasePage />,
  },
];
