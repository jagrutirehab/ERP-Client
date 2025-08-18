import React, { Suspense, useEffect } from "react";
import { Routes, Route } from "react-router-dom";

//helper
import "../helpers/api_helper";

//constant
import pages from "../Components/constants/pages";

//Layouts
import NonAuthLayout from "../Layouts/NonAuthLayout";
import VerticalLayout from "../Layouts/index";
//routes
import { authProtectedRoutes, publicRoutes, allElements } from "./allRoutes";
import AuthProtected, { AccessRoute } from "./AuthProtected";
// import MultiRoutes from "./MultiRoutes";
import Alerts from "../Components/Common/Alerts";
import Basic404 from "../pages/AuthenticationInner/Errors/Basic404";
import LoaderModule from "./LoaderModule";

//redux
import { useSelector } from "react-redux";
import Loader from "../Components/Common/Loader";

const Index = () => {
  //@add dynamic routes that user have been given access to
  const { userRoutes } = useSelector((state) => ({
    userRoutes: state.User?.user?.pageAccess?.pages,
  }));

  const userDynamicRoutes = (userRoutes || []).map((routeLabel) => {
    const pageInfoIndex = pages.findIndex((pg) => pg.label === routeLabel.name);
    const pageInfo = pages[pageInfoIndex];
  
    const elementIndex = allElements.findIndex(
      (el) => el.label === routeLabel.name
    );
    return {
      id: pageInfo.id,
      path: pageInfo.link,
      component: allElements[elementIndex].element,
    };
  });
  const userAuthRoutes = [...authProtectedRoutes, ...userDynamicRoutes];

  return (
    <React.Fragment>
      <Alerts />
      <LoaderModule />
      <Suspense fallback={<Loader />}>
        <Routes>
          {publicRoutes.map((route) => {
            return (
              <Route
                key={route.path}
                path={route.path}
                element={
                  <NonAuthLayout>
                    <route.component />
                  </NonAuthLayout>
                }
              />
            );
          })}

          {userAuthRoutes.map((route) => {
            return (
              <Route
                key={route.path}
                path={route.path}
                element={
                  <AuthProtected>
                    <VerticalLayout>
                      <route.component />
                    </VerticalLayout>
                  </AuthProtected>
                }
              />
            );
          })}
          <Route path="/*" element={<Basic404 />} />
          <Route path="/unauthorized" element={<Basic404 />} />
          {/* {MultiRoutes({
          paths: availablePublicRoutesPaths,
          element: (
            <NonAuthLayout>
              <Routes>
                {publicRoutes.map((route, idx) => (
                  <Route
                    path={route.path}
                    Component={<route.component />}
                    key={idx}
                  />
                ))}
              </Routes>
            </NonAuthLayout>
          ),
        })} */}
          {/* <MultiRoutes paths={availableAuthRoutesPath}>
          <NonAuthLayout>
            <Routes>
              {publicRoutes.map((route, idx) => (
                <Route
                  path={route.path}
                  Component={<route.component />}
                  key={idx}
                />
              ))}
            </Routes>
          </NonAuthLayout>
        </MultiRoutes> */}
          {/* {availablePublicRoutesPaths.map((item) => {
          return (
            <Route
              path={item}
              element={
                <NonAuthLayout>
                  <Routes>
                    {publicRoutes.map((route, idx) => (
                      <Route
                        path={route.path}
                        Component={<route.component />}
                        key={idx}
                      />
                    ))}
                  </Routes>
                </NonAuthLayout>
              }
            ></Route>
          );
        })} */}
          {/* <Route path={availablePublicRoutesPaths}>
                    <NonAuthLayout>
                        <Routes>
                            {publicRoutes.map((route, idx) => (
                                <Route
                                    path={route.path}
                                    component={route.component}
                                    key={idx}
                                    exact={true}
                                />
                            ))}
                        </Routes>
                    </NonAuthLayout>
                </Route> */}

          {/* <Route path={availableAuthRoutesPath}>
                    <AuthProtected>
                        <VerticalLayout>
                            <Routes>
                                {authProtectedRoutes.map((route, idx) => (
                                    <AccessRoute
                                        path={route.path}
                                        component={route.component}
                                        key={idx}
                                        exact={true}
                                    />
                                ))}
                            </Routes>
                        </VerticalLayout>
                    </AuthProtected>
                </Route> */}
        </Routes>
      </Suspense>
    </React.Fragment>
  );
};

export default Index;
