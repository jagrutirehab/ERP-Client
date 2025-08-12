import React from 'react'
import { Container } from 'reactstrap';
import BreadCrumb from '../../Components/Common/BreadCrumb';
import { Route, Routes } from 'react-router-dom';
import Main from './Main';
import PatientDetails from './PatientDetails';

const Nurse = () => {
  
  return (
    <React.Fragment>
     <div className='page-content'>
       <Container fluid>
        <BreadCrumb title="Nurse"  pageTitle="Nurse"/>
        <Routes>
            <Route path="/" element={<Main />} />
            <Route path="/p/:id" element={<PatientDetails />} />
        </Routes>
       </Container>
     </div>
    </React.Fragment>
  )
}

export default Nurse;