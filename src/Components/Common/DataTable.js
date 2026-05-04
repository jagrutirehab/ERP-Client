import DataTable from "react-data-table-component";
import { useMediaQuery } from "../Hooks/useMediaQuery";
import { Spinner } from "reactstrap";

const DataTableComponent = ({
    columns,
    data,
    pagination,
    limit,
    setLimit,
    page,
    setPage,
    loading,
    paginationRowsPerPageOptions = [10, 15, 20, 25, 30],
    noDataComponent = "No records found",
    
}) => {
    const isMobile = useMediaQuery("(max-width: 1000px)");

    const allowLimitChange = typeof setLimit === "function";

    const tableHeight = "calc(100vh - 260px)";

    return (
        <DataTable
            columns={columns}
            data={data}
            pagination
            highlightOnHover
            striped
            fixedHeader
            fixedHeaderScrollHeight={tableHeight}
            dense={isMobile}
            responsive
            paginationServer={!!setPage}
            {...(setPage && {
                paginationTotalRows: pagination?.totalDocs || 0,
                paginationPerPage: limit,
                paginationDefaultPage: page,
                onChangePage: setPage,
            })}
            {...(allowLimitChange
                ? {
                    onChangeRowsPerPage: setLimit,
                    paginationRowsPerPageOptions: paginationRowsPerPageOptions,
                }
                : {
                    paginationRowsPerPageOptions: [],
                })}
            progressPending={loading}
            progressComponent={
                <div className="py-4 text-center">
                    <Spinner className="text-primary" />
                </div>
            }
            noDataComponent={
                <div className="py-4 text-center text-muted">{noDataComponent}</div>
            }
            customStyles={{
                table: {
                    style: { minHeight: "450px", overflowX: "auto" },
                },
                headCells: {
                    style: {
                        backgroundColor: "#f8f9fa",
                        fontWeight: "600",
                        borderBottom: "2px solid #e9ecef",
                        whiteSpace: "normal",
                    },
                },
                cells: {
                    style: {
                        lineHeight: "1.4",
                        paddingTop: "10px",
                        paddingBottom: "10px",
                    },
                },
                rows: {
                    style: {
                        minHeight: "60px",
                        borderBottom: "1px solid #f1f1f1",
                    },
                },
                paginationRowsPerPage: {
                    display: allowLimitChange ? "block" : "none",
                },
            }}
        />
    );
};

export default DataTableComponent;
