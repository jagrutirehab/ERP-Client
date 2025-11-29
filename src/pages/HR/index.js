import React from 'react'
import { Container } from 'reactstrap';
import { Route, Routes } from 'react-router-dom';

import Sidebar from './Sidebar';
import Employee from './Employee';
import HRDashboard from './HRDashboard';
import ApprovalDashboard from './ApprovalDashboard';
import NewJoining from './NewJoinning';

const HR = () => {
    return (
        <React.Fragment>
            <div className="page-conten overflow-hidden">
                <div className="patient-page">
                    <Container fluid>
                        <div className="chat-wrapper d-lg-flex gap-1 mx-n4 my-n4 mb-n5 p-1">
                            <Sidebar />
                            <Routes>
                                {/* <Route path={`/dashboard`} element={<HRDashboard />} /> */}
                                <Route path={`/employee`} element={<Employee />} />
                                {/* <Route path={`/approvals`} element={<ApprovalDashboard />} /> */}
                                <Route path={`/new-joinings`} element={<NewJoining />} />
                            </Routes>
                        </div>
                    </Container>
                </div>
            </div>
        </React.Fragment>
    )
}

export default HR;