import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOwnerVisitDate } from "../../../store/features/miReporting/miReportingSlice";
import { Card, CardBody, Col, Container, Row, Table } from "reactstrap";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import Loader from "../../../Components/Common/Loader";
import Flatpickr from "react-flatpickr";
import moment from "moment";
import "flatpickr/dist/plugins/monthSelect/style.css";
import monthSelectPlugin from "flatpickr/dist/plugins/monthSelect";

const OwnerVisitDate = () => {
  const dispatch = useDispatch();
  const { ownerVisitDate, loading } = useSelector((state) => state.MIReporting);
  const [date, setDate] = useState(moment().format("YYYY-MM"));

  useEffect(() => {
    dispatch(fetchOwnerVisitDate({ date }));
  }, [dispatch, date]);

  const handleDateChange = (selectedDates) => {
    if (selectedDates.length > 0) {
      const selectedDate = moment(selectedDates[0]).format("YYYY-MM");
      setDate(selectedDate);
    }
  };

  // Helper to get all unique dates from the data for column headers
  const getAllDates = () => {
    const dates = new Set();
    ownerVisitDate.forEach((item) => {
      item.dates.forEach((d) => dates.add(d.date));
    });
    return Array.from(dates).sort();
  };

  const uniqueDates = getAllDates();

  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb title="Owner Visit Date" pageTitle="MI Reporting" />
        <Row>
          <Col lg={12}>
            <Card>
              <CardBody>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4 className="card-title mb-0">
                    Owner Visit Date Analytics
                  </h4>
                  <div className="d-flex gap-2">
                    <Flatpickr
                      className="form-control"
                      options={{
                        mode: "single",
                        dateFormat: "Y-m",
                        defaultDate: [date],
                        plugins: [
                          new monthSelectPlugin({
                            shorthand: true,
                            dateFormat: "Y-m",
                            altFormat: "F Y",
                            theme: "light",
                          }),
                        ],
                      }}
                      onChange={handleDateChange}
                    />
                  </div>
                </div>

                {loading ? (
                  <Loader />
                ) : (
                  <div className="table-responsive">
                    <Table className="table-bordered table-nowrap table-hover">
                      <thead>
                        <tr>
                          <th>Owner Name</th>
                          {uniqueDates.map((d) => (
                            <th key={d}>{d}</th>
                          ))}
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ownerVisitDate.length > 0 ? (
                          ownerVisitDate.map((item, index) => (
                            <tr key={index}>
                              <td>{item.ownerName}</td>
                              {uniqueDates.map((d) => {
                                const dateData = item.dates.find(
                                  (x) => x.date === d
                                );
                                return (
                                  <td key={d}>
                                    {dateData ? dateData.count : 0}
                                  </td>
                                );
                              })}
                              <td className="fw-bold">{item.total}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan={uniqueDates.length + 2}
                              className="text-center"
                            >
                              No data available
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </div>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default OwnerVisitDate;
