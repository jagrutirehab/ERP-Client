import React, { useState, useEffect } from 'react'
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, FormGroup, Label, Input, Spinner } from 'reactstrap'
import { editTraining } from '../../../helpers/backend_helper'
import { toast } from 'react-toastify'
import { usePermissions } from '../../../Components/Hooks/useRoles'
import { formatFileSize } from '../Helpers/uploadTrainingForm'

const EditTrainingModal = ({ isOpen, onClose, training, onRefresh }) => {
    const [form, setForm] = useState({ trainingName: '', repeatFrequency: '' })
    const [file, setFile] = useState(null)
    const [loading, setLoading] = useState(false)


    const isInactive = training?.status === 'inactive'
    const declaration = training?.declaration || null

    useEffect(() => {
        if (training) {
            setForm({
                trainingName: training.trainingName || '',
                // repeatFrequency: training.repeatFrequency || ''
            })
            setFile(null)
        }
    }, [training])

    const callApi = async (formData) => {
        try {
            setLoading(true)
            await editTraining(training._id, formData)
            toast.success("Training updated successfully")
            onRefresh()
            onClose()
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to update")
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = () => {
        const formData = new FormData()
        formData.append('trainingName', form.trainingName)
        // if (form.repeatFrequency !== '') formData.append('repeatFrequency', form.repeatFrequency)
        if (file) formData.append('file', file)
        callApi(formData)
    }

    const handleMarkInactive = () => {
        const formData = new FormData()
        formData.append('status', 'inactive')
        callApi(formData)
    }

    const handleMarkActive = () => {
        const formData = new FormData()
        formData.append('status', 'active')
        callApi(formData)
    }

    return (
        <Modal isOpen={isOpen} toggle={onClose} centered>
            <ModalHeader toggle={onClose}>
                {isInactive ? 'Reactivate Training' : 'Edit Training'}
            </ModalHeader>
            <ModalBody>
                {isInactive ? (
                    <div className="text-center py-3">
                        <p className="text-muted small mb-4">Mark it active first to edit its details.</p>
                        <Button color="success" onClick={handleMarkActive} disabled={loading}>
                            {loading ? <Spinner size="sm" /> : '✓ Mark as Active'}
                        </Button>
                    </div>
                ) : (
                    <>
                        <FormGroup>
                            <Label className="fw-semibold small">Training Name</Label>
                            <Input
                                value={form.trainingName}
                                onChange={e => setForm({ ...form, trainingName: e.target.value })}
                                placeholder="Enter training name"
                            />
                        </FormGroup>

                        {/* <FormGroup>
                            <Label className="fw-semibold small">Replace File</Label>
                            <Input type="file" onChange={e => setFile(e.target.files[0])} />
                            {training?.files?.[0] && !file && (
                                <small className="text-muted d-block mt-1">Current: {training.files[0].originalName}</small>
                            )}
                            {file && <small className="text-success d-block mt-1">New: {file.name}</small>}
                        </FormGroup> */}

                        {/* <FormGroup>
                            <Label className="fw-semibold small">Repeat Frequency (days)</Label>
                            <Input
                                type="number"
                                value={form.repeatFrequency}
                                onChange={e => setForm({ ...form, repeatFrequency: e.target.value })}
                                placeholder="e.g. 30"
                            />
                        </FormGroup> */}

                        {declaration && (
                            <FormGroup data-testid="declaration-edit">
                                <Label className="fw-semibold small">Declaration form</Label>
                                <div className="border rounded p-2">
                                    <div className="small fw-semibold text-truncate">
                                        {declaration.originalName} <span className="badge bg-soft-secondary text-secondary ms-1">{(declaration.format || 'pdf').toUpperCase()}</span>
                                    </div>
                                    <div className="text-muted small">
                                        {formatFileSize(declaration.size || 0)}{declaration.pageCount ? ` · ${declaration.pageCount} page${declaration.pageCount !== 1 ? 's' : ''}` : ''}
                                    </div>
                                    {declaration.inactive ? (
                                        <div className="alert alert-warning py-1 px-2 small mt-2 mb-0" data-testid="declaration-inactive">
                                            Declaration inactive: place the signature box. This file cannot be changed, so create a new training with the form to use it.
                                        </div>
                                    ) : (
                                        <small className="text-muted d-block mt-2">The declaration is locked once a training is created and cannot be edited or replaced.</small>
                                    )}
                                </div>
                            </FormGroup>
                        )}

                        <hr />

                        <div className="d-flex align-items-center justify-content-between p-3 rounded" style={{ background: '#fff5f5', border: '1px solid #ffd5d5' }}>
                            <div>
                                <p className="fw-semibold mb-0 small text-danger">Mark as Inactive</p>
                                <small className="text-muted">This training will no longer appear for configured roles</small>
                            </div>
                            <Button color="danger" outline size="sm" onClick={handleMarkInactive} disabled={loading}>
                                {loading ? <Spinner size="sm" /> : 'Deactivate'}
                            </Button>
                        </div>
                    </>
                )}
            </ModalBody>

            {!isInactive && (
                <ModalFooter>
                    <Button color="primary" onClick={handleSubmit} disabled={loading}>
                        {loading ? <Spinner size="sm" /> : 'Save Changes'}
                    </Button>
                    <Button color="secondary" outline onClick={onClose}>Cancel</Button>
                </ModalFooter>
            )}
        </Modal>
    )
}

export default EditTrainingModal