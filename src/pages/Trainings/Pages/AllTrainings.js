import React, { useEffect, useState } from 'react'
import { CardBody, Spinner, Nav, NavItem, NavLink, Card, Card as RCard, Collapse, Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap'
import { getAllTrainings } from '../../../helpers/backend_helper'
import { toast } from 'react-toastify'
import { useMediaQuery } from '../../../Components/Hooks/useMediaQuery'
import EditTrainingModal from '../Components/EditTrainingModal'
import { usePermissions } from '../../../Components/Hooks/useRoles'

const roleBadgeColors = ['#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#14b8a6']

const AllTrainings = () => {
    const isMobile = useMediaQuery("(max-width: 1000px)")
    const [trainings, setTrainings] = useState([])
    const [loading, setLoading] = useState(false)
    const [page, setPage] = useState(1)
    const [pagination, setPagination] = useState({})
    const [activeTab, setActiveTab] = useState("active")
    const [openAccordions, setOpenAccordions] = useState({})
    const [editTraining, setEditTraining] = useState(null)
    const [fileModal, setFileModal] = useState({ open: false, file: null })
    const token = JSON.parse(localStorage.getItem("user"))?.token;
    const { hasPermission } = usePermissions(token);
    const hasUserPermission = hasPermission("TRAININGS", "ALL_TRAININGS", "READ");
    const hasWritePermission = hasPermission("TRAININGS", "ALL_TRAININGS", "WRITE");
    const hasDeletePermission = hasPermission("TRAININGS", "ALL_TRAININGS", "DELETE");

    const canEdit = hasWritePermission || hasDeletePermission;
    const limit = 10

    const loadTrainings = async (pageNum = 1, tab = activeTab) => {
        try {
            setLoading(true)
            const response = await getAllTrainings({ page: pageNum, limit, status: tab })
            setTrainings(response?.data || [])
            setPagination(response?.pagination || {})
        } catch {
            toast.error("Failed to load trainings")
        } finally {
            setLoading(false)
        }
    }

    const handleTabChange = (tab) => {
        setActiveTab(tab)
        setPage(1)
        setOpenAccordions({})
        loadTrainings(1, tab)
    }

    const handlePageChange = (newPage) => {
        setPage(newPage)
        loadTrainings(newPage)
    }

    const toggleAccordion = (id) => setOpenAccordions(prev => ({ ...prev, [id]: !prev[id] }))

    useEffect(() => { loadTrainings() }, [])

    const file = fileModal.file

    return (
        <CardBody className="p-4 bg-white" style={isMobile ? { width: "100%" } : { width: "78%" }}>
            <style>{`
                .ack-table { width: 100%; border-collapse: collapse; font-size: 13px; }
                .ack-table th { padding: 10px 16px; background: #f8fafc; color: #6b7280; font-weight: 600; text-align: left; border-bottom: 1px solid #e5e7eb; }
                .ack-table td { padding: 10px 16px; border-bottom: 1px solid #f1f5f9; color: #374151; }
                .ack-table tr:last-child td { border-bottom: none; }
                .ack-table tr:hover td { background: #f9fafb; }
                .ack-avatar { width: 28px; height: 28px; border-radius: 50%; background: #eff6ff; color: #3b82f6; display: inline-flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; margin-right: 8px; }
            `}</style>

            <div className="d-flex align-items-center justify-content-between mb-4">
                <h4 className="fw-bold mb-0" style={{ color: '#111827' }}>All Trainings</h4>
                <span className="text-muted small">{pagination.totalCount || 0} total</span>
            </div>

            <Nav tabs className="mb-4">
                {["active", "inactive"].map(tab => (
                    <NavItem key={tab}>
                        <NavLink
                            className={activeTab === tab ? "active fw-semibold" : "text-muted"}
                            style={{ cursor: "pointer", textTransform: 'capitalize' }}
                            onClick={() => handleTabChange(tab)}
                        >
                            {tab}
                        </NavLink>
                    </NavItem>
                ))}
            </Nav>

            {loading ? (
                <div className="text-center py-5"><Spinner color="primary" /></div>
            ) : trainings.length === 0 ? (
                <p className="text-muted text-center py-5">No {activeTab} trainings found.</p>
            ) : (
                <>
                    {trainings.map(training => {
                        const tFile = training.files?.[0]
                        return (
                            <Card key={training._id} className="mb-3">
                                <CardBody>
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        <div>
                                            <h6 className="fw-bold mb-1">{training.trainingName}</h6>
                                            <div className="d-flex align-items-center gap-2 flex-wrap">
                                                <small className="text-muted fs-10">Author : {training.author?.name}</small>
                                                <span className="text-muted">·</span>
                                                <small className="text-muted">{new Date(training.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</small>
                                                {training.repeatFrequency && (
                                                    <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa' }}>
                                                        Every {training.repeatFrequency}d
                                                    </span>
                                                )}
                                                {training.roles?.map((role, idx) => (
                                                    <span key={role} style={{
                                                        padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                                                        background: roleBadgeColors[idx % roleBadgeColors.length] + '18',
                                                        color: roleBadgeColors[idx % roleBadgeColors.length],
                                                        border: `1px solid ${roleBadgeColors[idx % roleBadgeColors.length]}30`
                                                    }}>{role}</span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="d-flex gap-2 flex-shrink-0">
                                            <Button color="secondary" outline size="sm" onClick={() => toggleAccordion(training._id)}>
                                                <i className="ri-group-line me-1" />
                                                {training.acknowledgedBy?.length || 0}
                                                <i className={`ri-arrow-${openAccordions[training._id] ? 'up' : 'down'}-s-line ms-1`} />
                                            </Button>
                                            {canEdit && <Button color="primary" outline size="sm" onClick={() => setEditTraining(training)}>
                                                <i className="ri-edit-line me-1" /> Edit
                                            </Button>}
                                        </div>
                                    </div>

                                    {tFile && (
                                        <Button color="primary" outline size="sm" className="mb-2" onClick={() => setFileModal({ open: true, file: tFile })}>
                                            View File
                                        </Button>
                                    )}

                                    <Collapse isOpen={!!openAccordions[training?._id]}>
                                        <div className="mt-3" style={{ borderTop: '1px solid #f1f5f9', paddingTop: 12 }}>
                                            {training.acknowledgedBy?.length === 0 ? (
                                                <p className="text-muted small text-center py-3">No one has acknowledged this training yet.</p>
                                            ) : (
                                                <table className="ack-table">
                                                    <thead>
                                                        <tr>
                                                            <th>Employee</th>
                                                            <th>E-Code</th>
                                                            <th>Email</th>
                                                            <th>Acknowledged On</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {training?.acknowledgedBy?.map(ack => (
                                                            <tr key={ack._id}>
                                                                <td>
                                                                    {/* <span className="ack-avatar">{ack.employee?.name?.[0]?.toUpperCase() || '?'}</span> */}
                                                                    {ack.employee?.name || '—'}
                                                                </td>
                                                                <td style={{ color: '#6b7280' }}>{ack.employee?.eCode || '—'}</td>
                                                                <td style={{ color: '#6b7280' }}>{ack.employee?.email || '—'}</td>
                                                                <td style={{ color: '#16a34a', fontWeight: 500 }}>
                                                                    {ack.acknowledgedOn ? new Date(ack.acknowledgedOn).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            )}
                                        </div>
                                    </Collapse>
                                </CardBody>
                            </Card>
                        )
                    })}

                    {pagination.totalPages > 1 && (
                        <div className="d-flex justify-content-center align-items-center gap-2 mt-4">
                            <button className="btn btn-outline-primary btn-sm" disabled={!pagination.hasPrevPage} onClick={() => handlePageChange(page - 1)}>← Previous</button>
                            <span className="text-muted small">Page {pagination.currentPage} of {pagination.totalPages}</span>
                            <button className="btn btn-outline-primary btn-sm" disabled={!pagination.hasNextPage} onClick={() => handlePageChange(page + 1)}>Next →</button>
                        </div>
                    )}
                </>
            )}

            <Modal isOpen={fileModal.open} toggle={() => setFileModal({ open: false, file: null })} size="xl" centered>
                <ModalHeader toggle={() => setFileModal({ open: false, file: null })}>{file?.originalName || file?.name}</ModalHeader>
                <ModalBody>
                    {file?.type === 'application/pdf' && (
                        <object
                            data={file.url}
                            type="application/pdf"
                            width="100%"
                            height="600px"
                            style={{ border: 'none' }}
                        >
                            <a href={file.url} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm">Open PDF</a>
                        </object>
                    )}
                    {file?.type?.startsWith('image/') && (
                        <img src={file?.url} alt={file?.originalName} className="img-fluid" />
                    )}
                    {/* 3. WORD DOCUMENT VIEWER */}
                    {((file?.originalName || file?.name)?.toLowerCase().endsWith('.doc') ||
                        (file?.originalName || file?.name)?.toLowerCase().endsWith('.docx')) && (
                            <iframe
                                src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(file.url)}`}
                                width="100%"
                                height="600px"
                                style={{ border: 'none' }}
                                title="Document Viewer"
                            ></iframe>
                        )}

                    {/* 4. FALLBACK FOR UNSUPPORTED FILES */}
                    {!file?.type?.startsWith('image/') &&
                        file?.type !== 'application/pdf' &&
                        !(file?.originalName || file?.name)?.toLowerCase().endsWith('.doc') &&
                        !(file?.originalName || file?.name)?.toLowerCase().endsWith('.docx') && (
                            <p className="text-muted text-center py-5">Preview not available for this file type</p>
                        )}

                </ModalBody>
                <ModalFooter>
                    <a href={file?.url} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm">Download</a>
                    <Button color="secondary" size="sm" onClick={() => setFileModal({ open: false, file: null })}>Close</Button>
                </ModalFooter>
            </Modal>

            <EditTrainingModal
                isOpen={!!editTraining}
                training={editTraining}
                onClose={() => setEditTraining(null)}
                onRefresh={() => loadTrainings(page)}
            />
        </CardBody>
    )
}

export default AllTrainings