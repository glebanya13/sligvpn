import { memo } from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { createRoutes } from "./router/routes";
import { useTelegramWebApp } from "./hooks/useTelegramWebApp";
import { UserProvider } from "./contexts/user.context";

const AppRoutes = memo(() => (
  <Routes>
    {createRoutes().map(route => (
      <Route key={route.path} path={route.path} element={route.element} />
    ))}
  </Routes>
));

AppRoutes.displayName = "AppRoutes";

function App() {
  useTelegramWebApp();

  return (
    <UserProvider>
      <Router>
        <AppRoutes />
      </Router>
    </UserProvider>
  );
}

export default App;
