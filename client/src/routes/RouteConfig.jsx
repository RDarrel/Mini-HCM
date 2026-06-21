import { createElement } from "react";
import { Route } from "react-router-dom";

import ACCESS from "../pages/platforms/access";

const RouteConfig = (role) => {
  const handleRoutes = () => {
    const routes = ACCESS[role] || [];
    return routes.map(({ path, component, children }, x) => {
      const handleRoute = (key, path, Component) => (
        <Route key={key} path={path} element={createElement(Component)} />
      );

      if (children) {
        return children.map((child, y) =>
          handleRoute(
            `route-${x}-${y}`,
            `/platforms/${path}${child.path}`,
            child.component,
          ),
        );
      }

      return handleRoute(`route-${x}`, `/platforms${path}`, component);
    });
  };
  return handleRoutes();
};

export default RouteConfig;
