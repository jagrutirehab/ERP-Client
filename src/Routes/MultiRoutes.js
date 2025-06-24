import { Route } from "react-router-dom";

const MultiRoutes = ({ paths, element: Element, ...rest }) =>
  paths.map((path) => (
    <Route key={path} path={path} {...rest} element={Element} />
  ));

export default MultiRoutes;
