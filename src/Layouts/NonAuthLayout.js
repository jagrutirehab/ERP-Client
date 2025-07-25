import React, { useEffect } from 'react';
// import { withRouter } from 'react-router-dom';

//redux
import { useSelector } from "react-redux";

const NonAuthLayout = ({ children }) => {
    const {
        layoutModeType,
    } = useSelector(state => ({
        layoutModeType: state.Layout.layoutModeType,
    }));

    useEffect(() => {
        if (layoutModeType === "dark") {
            document.body.setAttribute("data-layout-mode", "dark");
        } else {
            document.body.setAttribute("data-layout-mode", "light");
        }
    }, [layoutModeType]);
    return (
        <div>
            {children}
        </div>
    );
};

export default NonAuthLayout;
// export default withRouter(NonAuthLayout);