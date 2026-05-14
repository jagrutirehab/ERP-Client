import React, { useEffect, useState } from 'react'
import { CardBody, Spinner, FormGroup, Input, Label, Button } from 'reactstrap'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { acknowledgeTraining, getTrainingById } from '../../../helpers/backend_helper'
import { toast } from 'react-toastify'
import ConfirmModal from '../Components/ConfirmModal'

const TrainingDetail = () => {
    const { id } = useParams()
    const { state } = useLocation()
    const navigate = useNavigate()
    const activeTab = state?.activeTab || 'pending'
    const canEdit = state?.canEdit

    const [training, setTraining] = useState(null)
    const [loading, setLoading] = useState(true)
    const [checked, setChecked] = useState(false)
    const [confirmModal, setConfirmModal] = useState(false)
    const [ackLoading, setAckLoading] = useState(false)
    const [fileLoading, setFileLoading] = useState(true)

    const file = training?.files?.[0]

    useEffect(() => {
        const load = async () => {
            try {
                const response = await getTrainingById(id)
                setTraining(response?.data)

                // If there are no files, immediately set fileLoading to false
                if (!response?.data?.files || response.data.files.length === 0) {
                    setFileLoading(false)
                }
            } catch {
                toast.error("Failed to load training")
            } finally {
                setLoading(false) // This is your main page loading state
            }
        }
        load()
    }, [id])

    // useEffect(() => {
    //     if (file?.type === 'application/pdf' && file?.url) {
    //         const link = document.createElement('link')
    //         link.rel = 'prefetch'
    //         link.href = `https://docs.google.com/viewer?url=${encodeURIComponent(file.url)}&embedded=true`
    //         document.head.appendChild(link)
    //     }
    // }, [file?.url])

    const handleAcknowledge = async () => {
        try {
            setAckLoading(true)
            await acknowledgeTraining(id)
            toast.success("Acknowledged successfully")
            navigate(-1)
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to acknowledge")
        } finally {
            setAckLoading(false)
            setConfirmModal(false)
        }
    }

    if (loading) return <div className="text-center py-5"><Spinner color="primary" /></div>

    return (
        <CardBody className="p-3 bg-white">
            <div className="d-flex align-items-center gap-3 mb-4">
                <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate(-1)}>
                    <i className="ri-arrow-left-line" />
                </button>
                <h5 className="fw-bold mb-0">{training?.trainingName}</h5>
            </div>

            {file?.type === 'application/pdf' && (
                <div className="mb-4">
                    {fileLoading && (
                        <div className="text-center py-5">
                            <Spinner color="primary" />
                            <p className="text-muted small mt-2">Loading PDF...</p>
                        </div>
                    )}
                    <object
                        data={file.url}
                        type="application/pdf"
                        width="100%"
                        height={fileLoading ? '0px' : '700px'}
                        style={{ border: 'none' }}
                        onLoad={() => setFileLoading(false)}
                    >
                        <a href={file.url} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm">Open PDF</a>
                    </object>
                </div>
            )}

            {file?.type?.startsWith('image/') && (
                <div className="mb-4">
                    {fileLoading && (
                        <div className="text-center py-5">
                            <Spinner color="primary" />
                            <p className="text-muted small mt-2">Loading Image...</p>
                        </div>
                    )}
                    <img
                        src={file.url}
                        alt={file.originalName}
                        className="img-fluid"
                        onLoad={() => setFileLoading(false)}
                        style={{ display: fileLoading ? 'none' : 'block' }}
                    />
                </div>
            )}

            {/* WORD DOCUMENT VIEWER */}
            {(file?.originalName?.toLowerCase().endsWith('.doc') || file?.originalName?.toLowerCase().endsWith('.docx')) && (
                <div className="mb-4">
                    {fileLoading && (
                        <div className="text-center py-5">
                            <Spinner color="primary" />
                            <p className="text-muted small mt-2">Loading Document...</p>
                        </div>
                    )}
                    <iframe
                        src={`https://docs.google.com/viewer?url=${encodeURIComponent(file.url)}&embedded=true`}
                        width="100%"
                        height={fileLoading ? '0px' : '700px'}
                        style={{ border: 'none' }}
                        onLoad={() => setFileLoading(false)}
                        title="Document Viewer"
                    ></iframe>
                    
                    {/* Fallback download link just in case the viewer fails */}
                    <div className="mt-2 text-end">
                        <a href={file.url} target="_blank" rel="noreferrer" className="btn btn-outline-primary btn-sm">
                            Download Document
                        </a>
                    </div>
                </div>
            )}

            {activeTab === 'pending' && canEdit && !fileLoading && (
                <div className="p-3 border rounded">
                    <FormGroup check className="mb-3">
                        <Input type="checkbox" checked={checked} onChange={e => setChecked(e.target.checked)} />
                        <Label check className="small">
                            I acknowledge that I have read, understood, and will adhere to the instructions and policies described in this manual.
                        </Label>
                    </FormGroup>
                    <Button color="primary" disabled={!checked} onClick={() => setConfirmModal(true)}>
                        I Acknowledge
                    </Button>
                </div>
            )}

            {activeTab === 'acknowledged' && (
                <div className="d-flex align-items-center gap-2 text-success p-3 border rounded">
                    <i className="ri-checkbox-circle-fill fs-5" />
                    <span className="small fw-semibold">You have acknowledged this training</span>
                </div>
            )}

            <ConfirmModal
                isOpen={confirmModal}
                onConfirm={handleAcknowledge}
                onCancel={() => setConfirmModal(false)}
                loading={ackLoading}
            />
        </CardBody>
    )
}

export default TrainingDetail