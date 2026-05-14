import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { CardBody, Spinner, Collapse } from 'reactstrap'
import Select from 'react-select'
import { useSelector } from 'react-redux'
import { getTrainingHistoryDetail } from '../../../helpers/backend_helper'
import { toast } from 'react-toastify'
import exportTrainingHistory from '../Components/exportTrainingHistory'

const TrainingHistoryDetail = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const user = useSelector(state => state.User)

    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [selectedCenter, setSelectedCenter] = useState("ALL")
    const [from, setFrom] = useState("")
    const [to, setTo] = useState("")
    const [appliedFrom, setAppliedFrom] = useState("")
    const [appliedTo, setAppliedTo] = useState("")
    const [currentOpen, setCurrentOpen] = useState(true)
    const [openCycles, setOpenCycles] = useState({})

    const centerOptions = [
        ...(user?.centerAccess?.length > 1 ? [{ value: "ALL", label: "All Centers" }] : []),
        ...(user?.centerAccess?.map(cid => {
            const center = user?.userCenters?.find(c => c._id === cid)
            return { value: cid, label: center?.title || "Unknown Center" }
        }) || [])
    ]

    const loadData = async () => {
        try {
            setLoading(true)
            let centers = []
            if (selectedCenter === "ALL") centers = user?.centerAccess || []
            else if (selectedCenter) centers = [selectedCenter]

            const response = await getTrainingHistoryDetail({
                id,
                ...(centers?.length && { centers: centers.join(',') }),
                ...(appliedFrom && { from: appliedFrom }),
                ...(appliedTo && { to: appliedTo })
            })
            setData(response?.data)
        } catch {
            toast.error("Failed to load training history")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (!user?.centerAccess) return
        loadData()
    }, [id, selectedCenter, appliedFrom, appliedTo, user?.centerAccess])

    const handleApplyFilter = () => {
        setAppliedFrom(from)
        setAppliedTo(to)
    }

    const handleClearDates = () => {
        setFrom('')
        setTo('')
        setAppliedFrom('')
        setAppliedTo('')
    }

    const toggleCycle = (cycle) => setOpenCycles(prev => ({ ...prev, [cycle]: !prev[cycle] }))

    const AckTable = ({ list }) => {
        if (!list?.length) return (
            <div className="text-center py-4">
                <i className="ri-user-unfollow-line" style={{ fontSize: 28, color: '#d1d5db', display: 'block', marginBottom: 8 }} />
                <p className="text-muted small mb-0">No acknowledgements for this period.</p>
            </div>
        )
        return (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                    <tr>
                        {['#', 'Name', 'Email', 'Role', 'Center', 'Acknowledged On'].map(h => (
                            <th key={h} style={{ padding: '9px 12px', background: '#f8fafc', color: '#6b7280', fontWeight: 600, textAlign: 'left', borderBottom: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {list?.map((ack, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '9px 12px', color: '#9ca3af' }}>{i + 1}</td>
                            <td style={{ padding: '9px 12px', fontWeight: 600, color: '#111827' }}>{ack?.employee?.name || '—'}</td>
                            <td style={{ padding: '9px 12px', color: '#6b7280' }}>{ack?.employee?.email || '—'}</td>
                            <td style={{ padding: '9px 12px' }}>
                                <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: '#eff6ff', color: '#3b82f6', border: '1px solid #bfdbfe' }}>
                                    {ack?.employee?.role || '—'}
                                </span>
                            </td>
                            <td style={{ padding: '9px 12px', color: '#6b7280' }}>{ack?.employee?.center?.title || '—'}</td>
                            <td style={{ padding: '9px 12px', color: '#16a34a', fontWeight: 500, whiteSpace: 'nowrap' }}>
                                {ack?.acknowledgedOn ? new Date(ack.acknowledgedOn).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        )
    }

    const CycleHeader = ({ label, count, subtitle, isOpen, onToggle, isCurrentCycle }) => (
        <div
            onClick={onToggle}
            style={{
                padding: '14px 18px',
                background: isCurrentCycle ? '#eff6ff' : '#f9fafb',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                cursor: 'pointer',
                borderBottom: isOpen ? `1px solid ${isCurrentCycle ? '#bfdbfe' : '#e5e7eb'}` : 'none'
            }}
        >
            <div className="d-flex align-items-center gap-3">
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: isCurrentCycle ? '#3b82f6' : '#9ca3af', display: 'inline-block', flexShrink: 0 }} />
                <div>
                    <span className="fw-semibold" style={{ color: isCurrentCycle ? '#1d4ed8' : '#374151', fontSize: 14 }}>{label}</span>
                    <span style={{ fontSize: 12, color: '#6b7280', marginLeft: 10 }}>
                        {count > 0 ? `Completed by ${count} employee${count > 1 ? 's' : ''}` : 'No completions'}
                    </span>
                </div>
            </div>
            <div className="d-flex align-items-center gap-3">
                {subtitle && <small className="text-muted">{subtitle}</small>}
                <i className={`ri-arrow-${isOpen ? 'up' : 'down'}-s-line text-muted`} />
            </div>
        </div>
    )

    return (
        <CardBody className="p-4 bg-white" style={{ width: '78%' }}>
            <div className="d-flex align-items-center gap-3 mb-4">
                <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate(-1)}>
                    <i className="ri-arrow-left-line" />
                </button>
                <div style={{ flex: 1 }}>
                    <h5 className="fw-bold mb-0">{data?.trainingName || 'Training History'}</h5>
                    {data && (
                        <small className="text-muted">
                            {data?.roles?.join(', ')}
                            {data?.repeatFrequency && ` · Repeats every ${data.repeatFrequency} day${data.repeatFrequency > 1 ? 's' : ''}`}
                        </small>
                    )}
                </div>
                {data?.status && (
                    <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: data?.status === 'active' ? '#f0fdf4' : '#f9fafb', color: data?.status === 'active' ? '#16a34a' : '#6b7280', border: `1px solid ${data?.status === 'active' ? '#bbf7d0' : '#e5e7eb'}` }}>
                        {data?.status}
                    </span>
                )}
                {data && (
                    <button className="btn btn-success btn-sm" onClick={() => exportTrainingHistory(data)}>
                        <i className="ri-file-excel-line me-1" />
                        Export Excel
                    </button>
                )}
            </div>



            <div className="d-flex gap-2 flex-wrap mb-4">
                <Select
                    options={centerOptions}
                    value={centerOptions?.find(c => c.value === selectedCenter) || null}
                    onChange={s => setSelectedCenter(s?.value || "ALL")}
                    placeholder="Select Center"
                    styles={{ container: base => ({ ...base, width: 200 }) }}
                />
                <input
                    type="date"
                    className="form-control"
                    style={{ width: 160 }}
                    value={from}
                    max={to || undefined}
                    onChange={e => setFrom(e.target.value)}
                />
                <input
                    type="date"
                    className="form-control"
                    style={{ width: 160 }}
                    value={to}
                    min={from || undefined}
                    onChange={e => setTo(e.target.value)}
                />
                <button className="btn btn-primary btn-sm" onClick={handleApplyFilter}>
                    Apply
                </button>
                {(appliedFrom || appliedTo) && (
                    <button className="btn btn-outline-secondary btn-sm" onClick={handleClearDates}>Clear</button>
                )}
            </div>

            {loading ? (
                <div className="text-center py-5"><Spinner color="primary" /></div>
            ) : !data ? (
                <p className="text-muted text-center py-5">No data found.</p>
            ) : (
                <>
                    <div style={{ border: '2px solid #3b82f6', borderRadius: 10, marginBottom: 16, overflow: 'hidden' }}>
                        <CycleHeader
                            label="Current Cycle"
                            count={data?.currentCycle?.acknowledged?.length || 0}
                            subtitle={data?.lastResetAt ? `Since ${new Date(data.lastResetAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}` : null}
                            isOpen={currentOpen}
                            onToggle={() => setCurrentOpen(p => !p)}
                            isCurrentCycle
                        />
                        <Collapse isOpen={currentOpen}>
                            <div style={{ padding: 16 }}>
                                <AckTable list={data?.currentCycle?.acknowledged} />
                            </div>
                        </Collapse>
                    </div>

                    {data?.history?.length > 0 && (
                        <>
                            <p className="fw-semibold small text-muted mb-3" style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>Past Cycles</p>
                            {[...data?.history].reverse().map(h => (
                                <div key={h?.cycle} style={{ border: '1px solid #e5e7eb', borderRadius: 10, marginBottom: 10, overflow: 'hidden' }}>
                                    <CycleHeader
                                        label={`Cycle ${h?.cycle}`}
                                        count={h?.acknowledged?.length || 0}
                                        subtitle={`Reset on ${new Date(h?.resetDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`}
                                        isOpen={!!openCycles[h?.cycle]}
                                        onToggle={() => toggleCycle(h?.cycle)}
                                        isCurrentCycle={false}
                                    />
                                    <Collapse isOpen={!!openCycles[h?.cycle]}>
                                        <div style={{ padding: 16 }}>
                                            <AckTable list={h?.acknowledged} />
                                        </div>
                                    </Collapse>
                                </div>
                            ))}
                        </>
                    )}

                    {data?.history?.length === 0 && (
                        <p className="text-muted small text-center py-3">No past cycles yet.</p>
                    )}
                </>
            )}
        </CardBody>
    )
}

export default TrainingHistoryDetail