import React, { useEffect } from 'react'
import { getCallOverview } from '../../../helpers/backend_helper';
import { CardBody } from 'reactstrap';
import { useMediaQuery } from '../../../Components/Hooks/useMediaQuery';
import DataTableComponent from '../../../Components/Common/DataTable';
import { overviewColumns } from './OverviewColumn';

const Call = () => {
  const isMobile = useMediaQuery("(max-width: 1000px)");

  const loadOverviews = async () => {
    try {
      const response = await getCallOverview();
      console.log("Response", response);

    } catch (error) {
      console.log(error);

    }
  }

  useEffect(() => {
    loadOverviews();
  }, []);

  return (
    <>
      <CardBody
        className="p-3 bg-white"
        style={isMobile ? { width: "100%" } : { width: "78%" }}
      >
        <div className="text-center text-md-left mb-4">
          <h1 className="display-6 fw-bold text-primary">AI OVERVIEW</h1>
        </div>

        <DataTableComponent
        columns={overviewColumns()}
        />

        </CardBody>
    </>
  )
}

export default Call