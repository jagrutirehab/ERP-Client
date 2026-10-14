import React, { useEffect, useState } from 'react'
import { useAuthError } from '../../../../Components/Hooks/useAuthError';
import { toast } from 'react-toastify';
import { getMySalaryData } from '../../../../helpers/backend_helper';
import { format } from 'date-fns';
import RefreshButton from '../../../../Components/Common/RefreshButton';
import { CardBody, Spinner } from 'reactstrap';
import { useMediaQuery } from '../../../../Components/Hooks/useMediaQuery';
import { formatCurrency } from '../../../../utils/formatCurrency';
import { capitalizeWords } from '../../../../utils/toCapitalize';

// 
const MySalaryData = () => {
    const handleAuthError = useAuthError();
    const isMobile = useMediaQuery("(max-width: 1000px)");
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchMySalaryData = async () => {
        setLoading(true);
        try {
            const res = await getMySalaryData();
            if (!res?.success) { toast.error("Failed to fetch salary data"); return; }
            setData(res.data);
        } catch (error) {
            if (!handleAuthError(error)) toast.error(error?.message || "Failed to fetch salary data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchMySalaryData(); }, []);

    return (
        <CardBody className="bg-white p-2 p-md-3" style={isMobile ? { width: "100%" } : { width: "78%" }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold text-primary mb-0">MY SALARY DATA</h4>
                <RefreshButton loading={loading} onRefresh={fetchMySalaryData} />
            </div>

            {loading ? (
                <div className="d-flex justify-content-center align-items-center gap-2 py-5 text-muted">
                    <Spinner size="sm" />
                    <span>Loading...</span>
                </div>
            ) : data.length === 0 ? (
                <div className="text-center py-5 text-muted">No salary data found</div>
            ) : (
                <div className="d-flex flex-column gap-4">
                    {data.map((record) => (
                        <SalaryCard key={record._id} record={record} />
                    ))}
                </div>
            )}
        </CardBody>
    );
};

const SalaryCard = ({ record }) => {
    const fd = record.financeDetails;

    const Section = ({ title, children }) => (
        <div className="mb-3">
            <p className="text-muted fw-semibold mb-2" style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>{title}</p>
            <div className="row g-2">{children}</div>
        </div>
    );

    const Field = ({ label, value }) => (
        <div className="col-6 col-md-3">
            <div className="p-2 rounded" style={{ background: "var(--bs-light, #f8f9fa)" }}>
                <p className="text-muted mb-1" style={{ fontSize: "0.7rem" }}>{label}</p>
                <p className="fw-semibold mb-0" style={{ fontSize: "0.85rem" }}>{value || "—"}</p>
            </div>
        </div>
    );

    return (
        <div className="border rounded-3 p-3 p-md-4 bg-white shadow-sm">
            <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                    <span className={`badge me-2 ${record.changeType === "JOINING" ? "bg-success" : "bg-primary"}`}>
                        {capitalizeWords(record.changeType?.replace(/_/g, " "))}
                    </span>
                    <span className={`badge ${record.isActive ? "bg-success" : "bg-danger"}`}>
                        {record.isActive ? "Active" : "Inactive"}
                    </span>
                </div>
                <small className="text-muted">{record.createdAt ? format(new Date(record.createdAt), "dd MMM yyyy") : "—"}</small>
            </div>

            <div className="row g-2 mb-3">
                <div className="col-6 col-md-3">
                    <p className="text-muted mb-1" style={{ fontSize: "0.75rem" }}>Center</p>
                    <p className="fw-semibold mb-0">{record.employee?.center?.title || "—"}</p>
                </div>
                <div className="col-6 col-md-3">
                    <p className="text-muted mb-1" style={{ fontSize: "0.75rem" }}>Designation</p>
                    <p className="fw-semibold mb-0">{capitalizeWords(record.employee?.designation?.name?.replace(/_/g, " ")) || "—"}</p>
                </div>
                <div className="col-6 col-md-3">
                    <p className="text-muted mb-1" style={{ fontSize: "0.75rem" }}>Department</p>
                    <p className="fw-semibold mb-0">{capitalizeWords(record.employee?.department?.department?.replace(/_/g, " ")) || "—"}</p>
                </div>
                <div className="col-6 col-md-3">
                    <p className="text-muted mb-1" style={{ fontSize: "0.75rem" }}>Position</p>
                    <p className="fw-semibold mb-0">{capitalizeWords(record.employee?.position?.name?.replace(/_/g, " ")) || "—"}</p>
                </div>
                <div className="col-6 col-md-3">
                    <p className="text-muted mb-1" style={{ fontSize: "0.75rem" }}>Employment Type</p>
                    <p className="fw-semibold mb-0">{capitalizeWords(record.employee?.employmentType?.replace(/_/g, " ")) || "—"}</p>
                </div>
                <div className="col-6 col-md-3">
                    <p className="text-muted mb-1" style={{ fontSize: "0.75rem" }}>Author</p>
                    <p className="fw-semibold mb-0">{record.author?.name || "—"}</p>
                </div>
            </div>

            {fd ? (
                <>
                    <hr className="my-3" />
                    <Section title="Earnings">
                        <Field label="Gross Salary" value={formatCurrency(fd.grossSalary)} />
                        <Field label="Basic Amount" value={formatCurrency(fd.basicAmount)} />
                        <Field label="HRA" value={formatCurrency(fd.HRAAmount)} />
                        <Field label="SPL Allowance" value={formatCurrency(fd.SPLAllowance)} />
                        <Field label="Conveyance" value={formatCurrency(fd.conveyanceAllowance)} />
                        <Field label="Statutory Bonus" value={formatCurrency(fd.statutoryBonus)} />
                        <Field label="In Hand Salary" value={formatCurrency(fd.inHandSalary)} />
                        <Field label="Total CTC" value={formatCurrency(fd.totalCostToCompany)} />
                    </Section>

                    <Section title="Deductions">
                        <Field label="PF Employee" value={formatCurrency(fd.PFEmployee)} />
                        <Field label="PF Employer" value={formatCurrency(fd.PFEmployer)} />
                        <Field label="ESIC Employee" value={formatCurrency(fd.ESICEmployee)} />
                        <Field label="ESIC Employer" value={formatCurrency(fd.ESICEmployer)} />
                        <Field label="PT" value={formatCurrency(fd.PT)} />
                        <Field label="Insurance" value={formatCurrency(fd.insurance)} />
                        <Field label="Gratuity" value={formatCurrency(fd.gratuity)} />
                    </Section>

                    <Section title="Other Details">
                        <Field label="Employee Group" value={capitalizeWords(fd.employeeGroups?.replace(/_/g, " "))} />
                        <Field label="Account Type" value={capitalizeWords(fd.account?.replace(/_/g, " "))} />
                        <Field label="Basic %" value={fd.basicPercentage ? `${fd.basicPercentage}%` : "—"} />
                        <Field label="HRA %" value={fd.HRAPercentage ? `${fd.HRAPercentage}%` : "—"} />
                        <Field label="Increment Issued" value={fd.incrementIssued ? format(new Date(fd.incrementIssued), "dd MMM yyyy") : "—"} />
                        {fd.incrementLetter && (
                            <div className="col-6 col-md-3">
                                <div className="p-2 rounded" style={{ background: "var(--bs-light, #f8f9fa)" }}>
                                    <p className="text-muted mb-1" style={{ fontSize: "0.7rem" }}>Increment Letter</p>
                                    <a href={fd.incrementLetter} target="_blank" rel="noreferrer" className="fw-semibold" style={{ fontSize: "0.85rem" }}>View</a>
                                </div>
                            </div>
                        )}
                    </Section>
                </>
            ) : (
                <>
                    <hr className="my-3" />
                    <div className="text-center py-3 text-muted" style={{ fontSize: "0.85rem" }}>
                        No finance details found
                    </div>
                </>
            )}

            {record.endedAt && (
                <p className="text-muted mt-2 mb-0" style={{ fontSize: "0.75rem" }}>
                    Ended: {format(new Date(record.endedAt), "dd MMM yyyy")}
                </p>
            )}
        </div>
    );
};

export default MySalaryData;