import React, { useEffect, useState } from 'react'
import { getCallRecordingOverview } from '../../../../helpers/backend_helper';
import { CardBody } from 'reactstrap';
import { useMediaQuery } from '../../../../Components/Hooks/useMediaQuery';
import DataTableComponent from '../../../../Components/Common/DataTable';
import { CallRecordingsOverviewColumns } from '../../Columns/CallOverview';

const Call = () => {
  const isMobile = useMediaQuery("(max-width: 1000px)");
  const [overviews, setOverviews] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalDocs: 0
  });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const loadCallRecordingOverviews = async () => {
    try {
      const response = await getCallRecordingOverview();
      console.log("Response", response);
      setOverviews(response?.data);
      setPagination(response?.pagination)

    } catch (error) {
      console.log(error);

    }
  }
  useEffect(() => { loadCallRecordingOverviews() }, [])

  return (
    <>
      <CardBody
        className="p-3 bg-white"
        style={isMobile ? { width: "100%" } : { width: "78%" }}
      >
        <div className="text-center text-md-left mb-4">
          <h1 className="display-6 fw-bold text-primary">CALL RECORDINGS AI - OVERVIEW</h1>
        </div>

        <DataTableComponent
          columns={CallRecordingsOverviewColumns()}
          data={overviews}
          pagination={pagination}
          page={page}
          setPage={setPage}
          limit={limit}
          setLimit={setLimit}
        />
      </CardBody>
    </>
  )
}

export default Call