import React, { useEffect, useState } from 'react'
import { CardBody, Spinner } from 'reactstrap'
import { createTrainings, getRolesDisctinct, sopGetRoles } from '../../../helpers/backend_helper'
import { toast } from 'react-toastify'
import { useMediaQuery } from '../../../Components/Hooks/useMediaQuery'
import { usePermissions } from '../../../Components/Hooks/useRoles'

const Upload = () => {
  const [forms, setForms] = useState([{ id: 0, trainingName: '', roles: [], repeatFrequency: '' }])
  const [files, setFiles] = useState({})
  const [allRoles, setAllRoles] = useState([])
  const [loading, setLoading] = useState(false)
  const isMobile = useMediaQuery("(max-width: 1000px)");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const token = JSON.parse(localStorage.getItem("user"))?.token;
  const { hasPermission } = usePermissions(token);
  const hasUserPermission = hasPermission("TRAININGS", "UPLOAD_TRAININGS", "READ");
  const hasWritePermission = hasPermission("TRAININGS", "UPLOAD_TRAININGS", "WRITE");
  const hasDeletePermission = hasPermission("TRAININGS", "UPLOAD_TRAININGS", "DELETE");

  const canEdit = hasWritePermission || hasDeletePermission;

  const getRoles = async () => {
    try {
      const response = await getRolesDisctinct()
      // getRolesDisctinct
      if (response?.data) {
        setAllRoles(response.data)
      }
    } catch (error) {
      console.log("FAILED", error)
    }
  }

  useEffect(() => {
    getRoles()
  }, [])

  const addForm = () => {
    const newId = Math.max(...forms.map(f => f.id), -1) + 1
    setForms([...forms, { id: newId, trainingName: '', roles: [], repeatFrequency: '' }])
  }

  const removeForm = (id) => {
    setForms(forms.filter(f => f.id !== id))
    const newFiles = { ...files }
    delete newFiles[id]
    setFiles(newFiles)
  }

  const handleChange = (id, field, value) => {
    setForms(forms.map(f => f.id === id ? { ...f, [field]: value } : f))
  }

  const handleRoleChange = (id, roleName) => {
    setForms(forms.map(f => {
      if (f.id === id) {
        const updatedRoles = f.roles.includes(roleName)
          ? f.roles.filter(r => r !== roleName)
          : [...f.roles, roleName]
        return { ...f, roles: updatedRoles }
      }
      return f
    }))
  }

  const handleFile = (id, file) => {
    setFiles({ ...files, [id]: file })
  }

  const isFormValid = forms.every(form => {
    return (
      form.trainingName.trim() !== '' &&
      form.roles.length > 0 &&
      files[form.id] !== undefined
    )
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitted(true)

    if (!isFormValid) return

    const formData = new FormData()

    forms.forEach((form, index) => {
      formData.append(`trainings[${index}][trainingName]`, form.trainingName)
      formData.append(`trainings[${index}][roles]`, JSON.stringify(form.roles))
      formData.append(`trainings[${index}][repeatFrequency]`, form.repeatFrequency || '')

      if (files[form.id]) {
        formData.append(`file_${index}`, files[form.id])
      }
    })

    try {
      setLoading(true)
      const response = await createTrainings(formData);
      console.log("Response", response);

      toast.success(response?.message || 'Trainings created successfully!!')
      setForms([{ id: 0, trainingName: '', roles: [], repeatFrequency: '' }])
      setFiles({})
      setIsSubmitted(false)
    } catch (error) {
      toast.error('Error: ' + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <CardBody className="p-3 bg-white" style={isMobile ? { width: "100%" } : { width: "78%" }}>
        <div className="text-center text-md-left mb-4">
          <h1 className="display-6 fw-bold text-primary">UPLOAD TRAININGS</h1>
        </div>

        <form onSubmit={handleSubmit} noValidate style={{ maxHeight: '80vh', overflowY: 'auto', overflowX: 'hidden' }}>
          {forms.map((form) => (
            <div key={form.id} className="mb-4 p-3 border rounded">
              <h5>Training {form.id + 1}</h5>

              <div className="mb-3">
                <label className="form-label">Training Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.trainingName}
                  onChange={(e) => handleChange(form.id, 'trainingName', e.target.value)}
                />
                {isSubmitted && form.trainingName.trim() === '' && (
                  <small className="text-danger d-block mt-2">Training Name is required</small>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label">Select Roles</label>
                <div className="border p-3 rounded" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  <div className="form-check border-bottom pb-2 mb-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`select-all-${form.id}`}
                      checked={form.roles.length === allRoles.length}
                      onChange={() => {
                        const allSelected = form.roles.length === allRoles.length
                        setForms(forms.map(f =>
                          f.id === form.id
                            ? { ...f, roles: allSelected ? [] : allRoles.map(r => r.name) }
                            : f
                        ))
                      }}
                    />
                    <label className="form-check-label fw-semibold" htmlFor={`select-all-${form.id}`}>
                      Select All
                    </label>
                  </div>
                  {allRoles.length > 0 ? (
                    allRoles.map((role) => (
                      <div key={role._id} className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`role-${form.id}-${role._id}`}
                          checked={form.roles.includes(role.name)}
                          onChange={() => handleRoleChange(form.id, role.name)}
                        />
                        <label className="form-check-label" htmlFor={`role-${form.id}-${role._id}`}>
                          {role.name}
                        </label>
                      </div>
                    ))
                  ) : (
                    <small className="text-muted">No roles available</small>
                  )}
                </div>
                {isSubmitted && form.roles.length === 0 && (
                  <small className="text-danger d-block mt-2">Select at least one role</small>
                )}
                {form.roles.length > 0 && (
                  <small className="text-success d-block mt-2">Selected: {form.roles.join(', ')}</small>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label">Repeat Frequency (days)</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.repeatFrequency}
                  onChange={(e) => {
                    const val = e.target.value
                    if (/^\d*$/.test(val) && (val === '' || parseInt(val) >= 1)) {
                      handleChange(form.id, 'repeatFrequency', val)
                    }
                  }}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">File *</label>
                <input
                  type="file"
                  className="form-control"
                  accept="image/*, application/pdf, .doc, .docx"
                  onChange={(e) => {
                    const file = e.target.files[0];

                    if (!file) return;

                    const isImage = file.type.startsWith('image/');
                    const isPDF = file.type === 'application/pdf';
                    const isDoc = file.name.toLowerCase().endsWith('.doc') || file.name.toLowerCase().endsWith('.docx');

                    if (!isImage && !isPDF && !isDoc) {
                      toast.error("Invalid file type! Only Images, PDFs, and Word docs are allowed.");
                      e.target.value = '';
                      return;
                    }

                    handleFile(form.id, file);
                  }}
                />

                {files[form.id] ? (
                  <small className="d-block mt-2 text-success">
                    ✓ {files[form.id].name} ({(files[form.id].size / 1024).toFixed(2)} KB)
                  </small>
                ) : isSubmitted ? (
                  <small className="d-block mt-2 text-danger">No file selected</small>
                ) : null}
              </div>

              {forms.length > 1 && (
                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => removeForm(form.id)}
                >
                  Remove
                </button>
              )}
            </div>
          ))}

          {canEdit && <div className="d-flex gap-2 mb-4">
            <button type="button" className="btn btn-outline-primary" onClick={addForm}>
              + Add Training
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading || !isFormValid}>
              {loading ? <Spinner size="sm" /> : 'Submit'}
            </button>
          </div>}
        </form>
      </CardBody>
    </>
  )
}

export default Upload