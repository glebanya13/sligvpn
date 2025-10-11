import { memo } from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { createRoutes } from "./router/routes";
import { useTelegramWebApp } from "./hooks/useTelegramWebApp";
import { UserProvider } from "./contexts/user.context";
import { LoadingProvider, useLoading } from "./contexts/loading.context";
import Loading from "./components/Loading";
import { useUserContext } from "./contexts/user.context";

const AppRoutes = memo(() => {
  const { isLoading, loadingText } = useLoading();
  const { loading: userLoading } = useUserContext();

  return (
    <>
      <Routes>
        {createRoutes().map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
      </Routes>
      <Loading visible={isLoading || userLoading} text="" />
    </>
  );
});

AppRoutes.displayName = "AppRoutes";

function App() {
  useTelegramWebApp();

  return (
    <UserProvider>
      <LoadingProvider>
        <Router>
          <AppRoutes />
        </Router>
      </LoadingProvider>
    </UserProvider>
  );
}

export default App;
