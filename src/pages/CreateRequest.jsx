import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { getUser } from '../utils/auth';

const CreateRequest = () => {
  const navigate = useNavigate();
  const user = getUser();

  const [agencies, setAgencies] = useState([]);

  const [form, setForm] = useState({
    RequestType: 'Records Inventory Submission',
    AgencyUniqueID: '',
    Remarks: '',
  });

  const [loading, setLoading] = useState(false);
  const [loadingAgencies, setLoadingAgencies] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAgencies = async () => {
      try {
        const response = await axiosClient.get('/agency-forms');
        setAgencies(response.data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load agencies');
      } finally {
        setLoadingAgencies(false);
      }
    };

    fetchAgencies();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError('');

      const response = await axiosClient.post('/requests', {
        RequestType: form.RequestType,
        AgencyUniqueID: form.AgencyUniqueID,
        RequestedBy: user?.UserID,
        Remarks: form.Remarks,
      });

      const createdRequest = response.data.data;

      navigate(`/requests/${createdRequest.RequestID}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={() => navigate('/requests')} style={styles.backBtn}>
        ← Back to Requests
      </button>

      <h1>Create Request</h1>

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.card}>
        <form onSubmit={handleSubmit}>
          <label>Request Type</label>
          <select
            name="RequestType"
            value={form.RequestType}
            onChange={handleChange}
            style={styles.input}
          >
            <option value="Records Inventory Submission">
              Records Inventory Submission
            </option>
            <option value="Records Retrieval Request">
              Records Retrieval Request
            </option>
            <option value="Records Transfer Request">
              Records Transfer Request
            </option>
            <option value="Records Disposal Request">
              Records Disposal Request
            </option>
            <option value="Digitization Request">
              Digitization Request
            </option>
          </select>

          <label>Agency</label>
          <select
            name="AgencyUniqueID"
            value={form.AgencyUniqueID}
            onChange={handleChange}
            style={styles.input}
            disabled={loadingAgencies}
          >
            <option value="">
              {loadingAgencies ? 'Loading agencies...' : 'Select agency'}
            </option>

            {agencies.map((agency) => (
              <option
                key={agency.AgencyUniqueID}
                value={agency.AgencyUniqueID}
              >
                {agency.AgencyName}
              </option>
            ))}
          </select>

          <label>Remarks</label>
          <textarea
            name="Remarks"
            value={form.Remarks}
            onChange={handleChange}
            style={styles.textarea}
            placeholder="Add request remarks..."
          />

          <button
            type="submit"
            disabled={loading || !form.AgencyUniqueID}
            style={styles.button}
          >
            {loading ? 'Creating...' : 'Create Request'}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  backBtn: {
    marginBottom: '16px',
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    background: '#fff',
    cursor: 'pointer',
  },
  card: {
    maxWidth: '600px',
    background: '#fff',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 8px 20px rgba(0,0,0,0.06)',
  },
  input: {
    width: '100%',
    padding: '10px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    margin: '6px 0 14px',
  },
  textarea: {
    width: '100%',
    minHeight: '100px',
    padding: '10px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    margin: '6px 0 14px',
  },
  button: {
    padding: '10px 16px',
    border: 'none',
    borderRadius: '8px',
    background: '#2563eb',
    color: '#fff',
    cursor: 'pointer',
  },
  error: {
    padding: '12px',
    borderRadius: '8px',
    background: '#fee2e2',
    color: '#991b1b',
    marginBottom: '16px',
  },
};

export default CreateRequest;