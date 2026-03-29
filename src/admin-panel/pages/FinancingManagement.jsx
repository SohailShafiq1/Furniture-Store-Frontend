import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAdminAuth } from '../context/AdminAuthContext';
import './FinancingManagement.css';

const FinancingManagement = () => {
  const [companies, setCompanies] = useState([]);
  const [companyName, setCompanyName] = useState('');
  const [applyLink, setApplyLink] = useState('');
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [detailsPoints, setDetailsPoints] = useState(['']);
  const [conditions, setConditions] = useState([{ title: '', description: '', points: [''] }]);
  const [logo, setLogo] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({
    companyName: '',
    applyLink: '',
    title: '',
    details: '',
    conditions: [{ title: '', description: '', points: [''] }],
    logo: null,
  });
  const [editDetailsPoints, setEditDetailsPoints] = useState(['']);
  const [editLogoPreview, setEditLogoPreview] = useState('');
  const [logoPreview, setLogoPreview] = useState(null);
  const { token } = useAdminAuth();
  const navigate = useNavigate();

  // Endpoints
  const apiEndpoint = `${import.meta.env.VITE_API_URL}/financing-companies`;
  const backendRoot = import.meta.env.VITE_API_URL.replace('/api', '');

  const config = { headers: { Authorization: `Bearer ${token}` } };
  const multipartConfig = { headers: { Authorization: `Bearer ${token}` } };

  const fetchCompanies = async () => {
    try {
      const res = await axios.get(`${apiEndpoint}/all`, config);
      setCompanies(res.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch financing companies');
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const parseDetailsPoints = (rawDetails) => {
    if (typeof rawDetails !== 'string') return [''];

    const parsed = rawDetails
      .split(/\r?\n|\u2022/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    return parsed.length > 0 ? parsed : [''];
  };

  const buildDetailsString = (points) => {
    const cleaned = (points || []).map((p) => p.trim()).filter((p) => p.length > 0);
    return cleaned.join('\n');
  };

  const handleAddDetailsPoint = () => {
    if (editingId) {
      setEditDetailsPoints((prev) => [...prev, '']);
      return;
    }
    setDetailsPoints((prev) => [...prev, '']);
  };

  const handleRemoveDetailsPoint = (index) => {
    if (editingId) {
      setEditDetailsPoints((prev) => {
        const next = prev.filter((_, i) => i !== index);
        return next.length > 0 ? next : [''];
      });
      return;
    }

    setDetailsPoints((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next.length > 0 ? next : [''];
    });
  };

  const handleDetailsPointChange = (index, value) => {
    if (editingId) {
      setEditDetailsPoints((prev) => prev.map((item, i) => (i === index ? value : item)));
      return;
    }
    setDetailsPoints((prev) => prev.map((item, i) => (i === index ? value : item)));
  };

  const handleAddCondition = () => {
    setConditions([...conditions, { title: '', description: '', points: [''] }]);
  };

  const handleRemoveCondition = (index) => {
    const newConditions = conditions.filter((_, i) => i !== index);
    setConditions(newConditions);
  };

  const handleConditionChange = (index, field, value) => {
    const newConditions = [...conditions];
    newConditions[index][field] = value;
    setConditions(newConditions);
  };

  const handleAddPoint = (conditionIndex) => {
    const newConditions = [...conditions];
    newConditions[conditionIndex].points.push('');
    setConditions(newConditions);
  };

  const handleRemovePoint = (conditionIndex, pointIndex) => {
    const newConditions = [...conditions];
    newConditions[conditionIndex].points = newConditions[conditionIndex].points.filter(
      (_, i) => i !== pointIndex
    );
    setConditions(newConditions);
  };

  const handlePointChange = (conditionIndex, pointIndex, value) => {
    const newConditions = [...conditions];
    newConditions[conditionIndex].points[pointIndex] = value;
    setConditions(newConditions);
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogo(file);
      const preview = URL.createObjectURL(file);
      setLogoPreview(preview);
    }
  };

  const handleCreateCompany = async (e) => {
    e.preventDefault();
    if (!companyName.trim() || !applyLink.trim() || !title.trim()) {
      setError('Company name, apply link, and title are required');
      return;
    }

    if (!token) {
      setError('Not authenticated. Please log in.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('companyName', companyName);
      formData.append('applyLink', applyLink);
      formData.append('title', title);
      formData.append('details', buildDetailsString(detailsPoints));
      formData.append('conditions', JSON.stringify(
        conditions.filter(c => c.title.trim() || c.description.trim())
      ));
      if (logo) formData.append('logo', logo);

      await axios.post(`${apiEndpoint}/create`, formData, multipartConfig);
      setMessage('Financing company created successfully!');
      setCompanyName('');
      setApplyLink('');
      setTitle('');
      setDetails('');
      setDetailsPoints(['']);
      setConditions([{ title: '', description: '', points: [''] }]);
      setLogo(null);
      setLogoPreview(null);
      setError('');
      fetchCompanies();
    } catch (err) {
      console.error('Error creating company:', err.response?.data || err.message);
      setError(err.response?.data?.message || err.message || 'Error creating company');
      setMessage('');
    }
  };

  const handleStartEdit = (company) => {
    setEditingId(company._id);
    setEditData({
      companyName: company.companyName,
      applyLink: company.applyLink,
      title: company.title,
      details: company.details || '',
      conditions: company.conditions && company.conditions.length > 0 
        ? company.conditions 
        : [{ title: '', description: '', points: [''] }],
      logo: null,
    });
    setEditDetailsPoints(parseDetailsPoints(company.details || ''));
    setEditLogoPreview(company.logo ? `${backendRoot}/${company.logo}` : '');
  };

  const handleEditConditionChange = (index, field, value) => {
    const newConditions = [...editData.conditions];
    newConditions[index][field] = value;
    setEditData({ ...editData, conditions: newConditions });
  };

  const handleAddEditCondition = () => {
    setEditData({
      ...editData,
      conditions: [...editData.conditions, { title: '', description: '', points: [''] }],
    });
  };

  const handleRemoveEditCondition = (index) => {
    const newConditions = editData.conditions.filter((_, i) => i !== index);
    setEditData({ ...editData, conditions: newConditions });
  };

  const handleAddEditPoint = (conditionIndex) => {
    const newConditions = [...editData.conditions];
    newConditions[conditionIndex].points.push('');
    setEditData({ ...editData, conditions: newConditions });
  };

  const handleRemoveEditPoint = (conditionIndex, pointIndex) => {
    const newConditions = [...editData.conditions];
    newConditions[conditionIndex].points = newConditions[conditionIndex].points.filter(
      (_, i) => i !== pointIndex
    );
    setEditData({ ...editData, conditions: newConditions });
  };

  const handleEditPointChange = (conditionIndex, pointIndex, value) => {
    const newConditions = [...editData.conditions];
    newConditions[conditionIndex].points[pointIndex] = value;
    setEditData({ ...editData, conditions: newConditions });
  };

  const handleEditLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditData({ ...editData, logo: file });
      const preview = URL.createObjectURL(file);
      setEditLogoPreview(preview);
    }
  };

  const handleUpdateCompany = async (e) => {
    e.preventDefault();
    if (!editData.companyName.trim() || !editData.applyLink.trim() || !editData.title.trim()) {
      setError('Company name, apply link, and title are required');
      return;
    }

    if (!token) {
      setError('Not authenticated. Please log in.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('companyName', editData.companyName);
      formData.append('applyLink', editData.applyLink);
      formData.append('title', editData.title);
      formData.append('details', buildDetailsString(editDetailsPoints));
      formData.append('conditions', JSON.stringify(
        editData.conditions.filter(c => c.title.trim() || c.description.trim())
      ));
      if (editData.logo) formData.append('logo', editData.logo);

      await axios.put(`${apiEndpoint}/${editingId}`, formData, multipartConfig);
      setMessage('Company updated successfully!');
      setEditingId(null);
      setEditData({ companyName: '', applyLink: '', title: '', details: '', conditions: [{ title: '', description: '', points: [''] }], logo: null });
      setEditDetailsPoints(['']);
      setEditLogoPreview('');
      setError('');
      fetchCompanies();
    } catch (err) {
      console.error('Error updating company:', err.response?.data || err.message);
      setError(err.response?.data?.message || err.message || 'Error updating company');
      setMessage('');
    }
  };

  const handleDeleteCompany = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      await axios.delete(`${apiEndpoint}/${id}`, config);
      setMessage('Company deleted successfully!');
      setError('');
      fetchCompanies();
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting company');
      setMessage('');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({ companyName: '', applyLink: '', title: '', details: '', conditions: [''], logo: null });
    setEditDetailsPoints(['']);
    setEditLogoPreview('');
  };

  return (
    <div className="financing-management">
      <h1>Financing Company Management</h1>

      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}

      <div className="financing-form-container">
        <h2>{editingId ? 'Edit Financing Company' : 'Add New Financing Company'}</h2>
        <form onSubmit={editingId ? handleUpdateCompany : handleCreateCompany} className="financing-form">
          <div className="form-group">
            <label htmlFor="companyName">Company Name *</label>
            <input
              id="companyName"
              type="text"
              placeholder="Enter company name"
              value={editingId ? editData.companyName : companyName}
              onChange={(e) => editingId ? setEditData({ ...editData, companyName: e.target.value }) : setCompanyName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="applyLink">Apply Link *</label>
            <input
              id="applyLink"
              type="url"
              placeholder="https://example.com/apply"
              value={editingId ? editData.applyLink : applyLink}
              onChange={(e) => editingId ? setEditData({ ...editData, applyLink: e.target.value }) : setApplyLink(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              id="title"
              type="text"
              placeholder="Enter financing title"
              value={editingId ? editData.title : title}
              onChange={(e) => editingId ? setEditData({ ...editData, title: e.target.value }) : setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Details Points (shown under In-Store & Online)</label>
            <div className="details-points-list">
              {(editingId ? editDetailsPoints : detailsPoints).map((point, idx) => (
                <div key={idx} className="point-item">
                  <input
                    type="text"
                    placeholder={`Detail point ${idx + 1}`}
                    value={point}
                    onChange={(e) => handleDetailsPointChange(idx, e.target.value)}
                  />
                  {(editingId ? editDetailsPoints : detailsPoints).length > 1 && (
                    <button
                      type="button"
                      className="remove-point-btn"
                      onClick={() => handleRemoveDetailsPoint(idx)}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button type="button" className="add-point-btn" onClick={handleAddDetailsPoint}>
              + Add Detail Point
            </button>
          </div>

          <div className="form-group">
            <label>Conditions & Terms</label>
            <div className="conditions-list">
              {(editingId ? editData.conditions : conditions).map((condition, condIdx) => (
                <div key={condIdx} className="condition-block">
                  <div className="condition-header">
                    <h4>Condition #{condIdx + 1}</h4>
                    {(editingId ? editData.conditions : conditions).length > 1 && (
                      <button
                        type="button"
                        className="remove-condition-btn"
                        onClick={() =>
                          editingId ? handleRemoveEditCondition(condIdx) : handleRemoveCondition(condIdx)
                        }
                      >
                        ✕ Remove Condition
                      </button>
                    )}
                  </div>

                  <div className="condition-input-group">
                    <label>Title</label>
                    <input
                      type="text"
                      placeholder="e.g., Pay over 3, 6, or 12 months"
                      value={condition.title}
                      onChange={(e) =>
                        editingId
                          ? handleEditConditionChange(condIdx, 'title', e.target.value)
                          : handleConditionChange(condIdx, 'title', e.target.value)
                      }
                    />
                  </div>

                  <div className="condition-input-group">
                    <label>Description</label>
                    <textarea
                      placeholder="Enter the description for this condition..."
                      value={condition.description}
                      onChange={(e) =>
                        editingId
                          ? handleEditConditionChange(condIdx, 'description', e.target.value)
                          : handleConditionChange(condIdx, 'description', e.target.value)
                      }
                      rows={3}
                    />
                  </div>

                  <div className="condition-input-group">
                    <label>Bullet Points</label>
                    <div className="points-list">
                      {condition.points.map((point, pointIdx) => (
                        <div key={pointIdx} className="point-item">
                          <input
                            type="text"
                            placeholder={`Point ${pointIdx + 1}`}
                            value={point}
                            onChange={(e) =>
                              editingId
                                ? handleEditPointChange(condIdx, pointIdx, e.target.value)
                                : handlePointChange(condIdx, pointIdx, e.target.value)
                            }
                          />
                          {condition.points.length > 1 && (
                            <button
                              type="button"
                              className="remove-point-btn"
                              onClick={() =>
                                editingId
                                  ? handleRemoveEditPoint(condIdx, pointIdx)
                                  : handleRemovePoint(condIdx, pointIdx)
                              }
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="add-point-btn"
                      onClick={() =>
                        editingId ? handleAddEditPoint(condIdx) : handleAddPoint(condIdx)
                      }
                    >
                      + Add Point
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="add-condition-btn"
              onClick={() => (editingId ? handleAddEditCondition() : handleAddCondition())}
            >
              + Add Condition/Section
            </button>
          </div>

          <div className="form-group">
            <label htmlFor="logo">Company Logo</label>
            <input
              id="logo"
              type="file"
              accept="image/*"
              onChange={(e) => (editingId ? handleEditLogoChange(e) : handleLogoChange(e))}
            />
            {(editingId ? editLogoPreview : logoPreview) && (
              <div className="logo-preview">
                <img src={editingId ? editLogoPreview : logoPreview} alt="Logo preview" />
              </div>
            )}
          </div>

          <div className="form-buttons">
            <button type="submit" className="submit-btn">
              {editingId ? 'Update Company' : 'Create Company'}
            </button>
            {editingId && (
              <button type="button" className="cancel-btn" onClick={handleCancel}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="companies-list">
        <h2>Existing Financing Companies</h2>
        {companies.length === 0 ? (
          <p>No financing companies added yet.</p>
        ) : (
          <div className="companies-table-wrapper">
            <table className="companies-table">
              <thead>
                <tr>
                  <th>Logo</th>
                  <th>Company Name</th>
                  <th>Title</th>
                  <th>Apply Link</th>
                  <th>Details</th>
                  <th>Conditions</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((company) => (
                  <tr key={company._id}>
                    <td>
                      {company.logo ? (
                        <img src={`${backendRoot}/${company.logo}`} alt={company.companyName} className="admin-company-logo-preview" />
                      ) : (
                        <span>No logo</span>
                      )}
                    </td>
                    <td>{company.companyName}</td>
                    <td>{company.title}</td>
                    <td>
                      <a href={company.applyLink} target="_blank" rel="noopener noreferrer">
                        {company.applyLink}
                      </a>
                    </td>
                    <td>
                      {company.details ? (
                        <ul className="details-points-preview">
                          {parseDetailsPoints(company.details).map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td>
                      <div className="conditions-display">
                        {company.conditions && company.conditions.length > 0
                          ? company.conditions.map((condition, i) => (
                              <div key={i} className="condition-summary">
                                {condition.title && <strong>{condition.title}</strong>}
                                {condition.description && <p>{condition.description}</p>}
                                {condition.points && condition.points.length > 0 && (
                                  <ul>
                                    {condition.points.map((point, j) => (
                                      <li key={j}>{point}</li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            ))
                          : <span>No conditions</span>}
                      </div>
                    </td>
                    <td className="actions">
                      <button
                        className="edit-btn"
                        onClick={() => handleStartEdit(company)}
                        disabled={editingId !== null}
                      >
                        Edit
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteCompany(company._id, company.companyName)}
                        disabled={editingId !== null}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancingManagement;
