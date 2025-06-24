import React, { useState } from "react";
import PropTypes from "prop-types";
import CustomModal from "../../Components/Common/Modal";
import SearchLead from "./SearchLead";
import DataTable from "react-data-table-component";
import { connect, useDispatch } from "react-redux";
import { Button } from "reactstrap";
import { mergeLead, setUngroupLeads } from "../../store/actions";
import Divider from "../../Components/Common/Divider";
import RenderWhen from "../../Components/Common/RenderWhen";

const Merge = ({ lead, setLead, leads, centerAccess, date }) => {
  const dispatch = useDispatch();
  const [mergeWith, setMergeWith] = useState();

  const columns = [
    {
      name: "Patient Name",
      selector: (row) => row.patient?.name,
    },
    {
      name: "Patient Number",
      selector: (row) => row.patient?.phoneNumber,
    },
    {
      name: "Attended By",
      selector: (row) => row.attendedBy,
    },
    {
      name: "Location",
      selector: (row) =>
        Array.isArray(row.location)
          ? row.location.map((item) => item.title).join(", \n")
          : row.location,
    },
    {
      name: "Inquiry Details",
      selector: (row) => row.inquiry,
    },
    {
      name: "",
      selector: (row) => (
        <Button
          onClick={() => {
            setMergeWith(row);
            dispatch(setUngroupLeads({ payload: [] }));
          }}
          size="sm"
          color="success"
        >
          <i className="ri-check-line fs-5"></i>
        </Button>
      ),
    },
  ];

  const mergeLeadcolumns = [
    {
      name: "Patient Name",
      selector: (row) => row.patient?.name,
    },
    {
      name: "Patient Number",
      selector: (row) => row.patient?.phoneNumber,
    },
    {
      name: "Attended By",
      selector: (row) => row.attendedBy,
    },
    {
      name: "Location",
      selector: (row) =>
        Array.isArray(row.location)
          ? row.location.map((item) => item.title).join(", \n")
          : row.location,
    },
    {
      name: "Inquiry Details",
      selector: (row) => row.inquiry,
    },
  ];

  // const documents = () => {
  //   let lds = [];
  //   (leads || []).forEach((lead) => {
  //     lead.leads?.forEach((val) => {
  //       lds.push({ id: val._id, ...val });
  //     });
  //   });
  //   return lds;
  // };

  const toggle = () => {
    setLead(null);
    setMergeWith(null);
  };

  const merge = () => {
    dispatch(
      mergeLead({ lead, mergeWithLead: mergeWith, centerAccess, ...date })
    );
    setLead(null);
    setMergeWith(null);
  };

  return (
    <React.Fragment>
      <CustomModal
        size={"lg"}
        title={"Merge Lead"}
        isOpen={Boolean(lead)}
        toggle={toggle}
      >
        <SearchLead setMergeWith={setMergeWith} />
        <div className="overflow-auto">
          <DataTable
            style={{ height: "500px !important", backgroundColor: "#1d1d1d" }}
            fixedHeader
            columns={columns}
            data={leads || []}
            highlightOnHover
          />
        </div>
        <Divider />
        <RenderWhen isTrue={Boolean(mergeWith)}>
          <h5 className="dispaly-5">
            Merge <span className="text-success">-{lead?.patient?.name}-</span>{" "}
            With
          </h5>
          <DataTable
            fixedHeader
            columns={mergeLeadcolumns}
            data={[mergeWith] || []}
            highlightOnHover
          />
          <div className="text-end mt-4">
            <Button
              onClick={merge}
              size="sm"
              color="primary"
              className="text-white"
            >
              Merge
            </Button>
          </div>
        </RenderWhen>
      </CustomModal>
    </React.Fragment>
  );
};

Merge.propTypes = {};

const mapStateToProps = (state) => ({
  leads: state.Lead.unGroupLeads,
  searchLoading: state.Lead.searchLoading,
  centerAccess: state.User.centerAccess,
});

export default connect(mapStateToProps)(Merge);
