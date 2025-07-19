import React, { useEffect, useState } from "react";
import { connect, useDispatch } from "react-redux";
import { Card, CardBody, Alert } from "reactstrap";
import { fetchHubspotContacts } from "../../../../store/actions";
import {
  HubspotContactsTable,
  HubspotContactsPagination,
  HubspotContactsHeader,
  HubspotContactsFilters,
} from "./components";

const HubspotContacts = ({ Hubspot }) => {
  const dispatch = useDispatch();
  const { contacts, pagination, loading, error } = Hubspot || {};

  console.log("Hubspot State:", Hubspot);
  console.log("Contacts:", contacts);
  console.log("Pagination:", pagination);
  console.log("Loading:", loading);
  console.log("Error:", error);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [currentPage, itemsPerPage]);

  const fetchData = () => {
    console.log("Fetching HubSpot contacts with params:", {
      page: currentPage,
      limit: itemsPerPage,
      search,
    });

    dispatch(
      fetchHubspotContacts({ page: currentPage, limit: itemsPerPage, search })
    );
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchData();
  };

  const handleRefresh = () => {
    fetchData();
  };

  const handleToggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const totalPages = pagination?.totalPages || 1;

  return (
    <div className="mt-4">
      <Card>
        <CardBody>
          {error && (
            <Alert color="danger" className="mb-3">
              <strong>Connection Error:</strong> {error}
              <br />
              <small>
                Please check if the HubSpot API is properly configured and the
                access token is valid.
              </small>
            </Alert>
          )}

          <HubspotContactsFilters
            onRefresh={handleRefresh}
            showFilters={showFilters}
            onToggleFilters={handleToggleFilters}
          />

          <HubspotContactsHeader
            search={search}
            onSearchChange={handleSearchChange}
            onSearch={handleSearch}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={handleItemsPerPageChange}
            totalItems={pagination?.totalItems}
          />

          <HubspotContactsTable
            contacts={contacts}
            loading={loading}
            error={error}
          />

          {!loading && !error && contacts && contacts.length > 0 && (
            <HubspotContactsPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </CardBody>
      </Card>
    </div>
  );
};

const mapStateToProps = (state) => ({
  Hubspot: state.HubspotContacts,
});

export default connect(mapStateToProps)(HubspotContacts);
