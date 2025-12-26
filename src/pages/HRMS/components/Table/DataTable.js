import DataTable from "react-data-table-component";
import { useMediaQuery } from "../../../../Components/Hooks/useMediaQuery";
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
}) => {
    const isMobile = useMediaQuery("(max-width: 1000px)");

    const allowLimitChange = typeof setLimit === "function";

    return (
        <DataTable
            columns={columns}
            data={data}
            pagination
            highlightOnHover
            striped
            fixedHeader
            fixedHeaderScrollHeight="500px"
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
            customStyles={{
                table: {
                    style: { minHeight: "450px" },
                },
                headCells: {
                    style: {
                        backgroundColor: "#f8f9fa",
                        fontWeight: "600",
                        borderBottom: "2px solid #e9ecef",
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
