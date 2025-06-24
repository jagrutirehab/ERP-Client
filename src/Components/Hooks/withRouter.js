import { useNavigate, useLocation, useParams, Route } from "react-router-dom";
import React from "react";

const withRouter = (Component) => {
  const Wrapper = (props) => {
    const history = useNavigate();
    const location = useLocation();
    const params = useParams();

    return (
      <Component
        history={history}
        location={location}
        params={params}
        {...props}
      />
    );
  };

  return Wrapper;
};

// export default withRouter

/**
 * A public higher-order component to access the imperative API
 */
// function withRouter(Component) {
//     const displayName = `withRouter(${Component.displayName || Component.name})`;
//     const C = props => {
//       const { wrappedComponentRef, ...remainingProps } = props;

//       return (
//         <RouterContext.Consumer>
//           {context => {
//             invariant(
//               context,
//               `You should not use <${displayName} /> outside a <Router>`
//             );
//             return (
//               <Component
//                 {...remainingProps}
//                 {...context}
//                 ref={wrappedComponentRef}
//               />
//             );
//           }}
//         </RouterContext.Consumer>
//       );
//     };

//     C.displayName = displayName;
//     C.WrappedComponent = Component;

//     if (__DEV__) {
//       C.propTypes = {
//         wrappedComponentRef: PropTypes.oneOfType([
//           PropTypes.string,
//           PropTypes.func,
//           PropTypes.object
//         ])
//       };
//     }

//     return hoistStatics(C, Component);
//   }

export default withRouter;
