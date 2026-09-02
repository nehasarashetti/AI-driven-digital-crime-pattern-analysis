import { useEffect, useState } from "react";
import axios from "axios";

function AdminDashboard() {

  const [crimes, setCrimes] = useState([]);

  const [showForm, setShowForm] = useState(false);

  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    crimeType: "",
    location: "",
    date: "",
    time: "",
    criminal: "",
    description: ""
  });


  // =====================================================
  // TOKEN
  // =====================================================

  const getToken = () => {
    return localStorage.getItem("token");
  };


  // =====================================================
  // GET ALL CRIMES
  // =====================================================

  const fetchCrimes = async () => {

    try {

      setLoading(true);
      setError("");

      const token = getToken();

      const response = await axios.get(
        "http://localhost:5000/api/crimes",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setCrimes(response.data);

    } catch (error) {

      console.error(error);

      setError(
        error.response?.data?.message ||
        "Unable to load crime records."
      );

    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {
    fetchCrimes();
  }, []);


  // =====================================================
  // FORM CHANGE
  // =====================================================

  const handleChange = (e) => {

    const {
      name,
      value
    } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));
  };


  // =====================================================
  // RESET
  // =====================================================

  const resetForm = () => {

    setFormData({
      crimeType: "",
      location: "",
      date: "",
      time: "",
      criminal: "",
      description: ""
    });

    setEditingId(null);

    setShowForm(false);
  };


  // =====================================================
  // OPEN ADD
  // =====================================================

  const openAddForm = () => {

    setFormData({
      crimeType: "",
      location: "",
      date: "",
      time: "",
      criminal: "",
      description: ""
    });

    setEditingId(null);

    setError("");
    setSuccess("");

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };


  // =====================================================
  // ADD / UPDATE
  // =====================================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      setError("");
      setSuccess("");

      const token = getToken();


      if (editingId) {

        await axios.put(
          `http://localhost:5000/api/crimes/${editingId}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        setSuccess(
          "Crime record updated successfully."
        );

      } else {

        await axios.post(
          "http://localhost:5000/api/crimes",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        setSuccess(
          "Crime record added successfully."
        );
      }


      resetForm();

      await fetchCrimes();

    } catch (error) {

      console.error(error);

      setError(
        error.response?.data?.message ||
        "Unable to save crime record."
      );
    }
  };


  // =====================================================
  // EDIT
  // =====================================================

  const handleEdit = (crime) => {

    setEditingId(crime._id);

    setFormData({
      crimeType: crime.crimeType || "",

      location: crime.location || "",

      date: crime.date
        ? new Date(crime.date)
            .toISOString()
            .split("T")[0]
        : "",

      time: crime.time || "",

      criminal: crime.criminal || "",

      description: crime.description || ""
    });

    setShowForm(true);

    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };


  // =====================================================
  // DELETE
  // =====================================================

  const handleDelete = async (id) => {

    const confirmed = window.confirm(
      "Are you sure you want to delete this crime record?"
    );

    if (!confirmed) {
      return;
    }

    try {

      const token = getToken();

      await axios.delete(
        `http://localhost:5000/api/crimes/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setSuccess(
        "Crime record deleted successfully."
      );

      await fetchCrimes();

    } catch (error) {

      console.error(error);

      setError(
        error.response?.data?.message ||
        "Unable to delete crime record."
      );
    }
  };


  // =====================================================
  // DATE
  // =====================================================

  const formatDate = (date) => {

    if (!date) {
      return "—";
    }

    return new Date(date).toLocaleDateString(
      "en-IN"
    );
  };


  // =====================================================
  // PAGE
  // =====================================================

  return (

    <div className="crime-management-page">


      {/* =================================================
          PAGE HEADING
      ================================================= */}

      <section className="page-heading">

        <div>

          <span className="section-label">
            ADMINISTRATION
          </span>

          <h2>
            Crime Management
          </h2>

          <p>
            Add, retrieve, update and delete crime
            records from the central database.
          </p>

        </div>


        <button
          className="add-crime-button"
          onClick={openAddForm}
        >
          <span>＋</span>
          Add Crime Record
        </button>

      </section>


      {/* =================================================
          STAT CARDS
      ================================================= */}

      <section className="crime-statistics">

        <div className="crime-stat-card">

          <div className="stat-card-icon blue">
            📁
          </div>

          <div>

            <span>
              Total Records
            </span>

            <strong>
              {crimes.length}
            </strong>

          </div>

        </div>


        <div className="crime-stat-card">

          <div className="stat-card-icon purple">
            🛡️
          </div>

          <div>

            <span>
              Access Level
            </span>

            <strong>
              Admin
            </strong>

          </div>

        </div>


        <div className="crime-stat-card">

          <div className="stat-card-icon green">
            ●
          </div>

          <div>

            <span>
              Database
            </span>

            <strong>
              Connected
            </strong>

          </div>

        </div>

      </section>


      {/* =================================================
          MESSAGE
      ================================================= */}

      {success && (

        <div className="system-message success">
          ✓ {success}
        </div>

      )}


      {error && (

        <div className="system-message error">
          ⚠ {error}
        </div>

      )}


      {/* =================================================
          FORM
      ================================================= */}

      {showForm && (

        <section className="crime-form">

          <div className="crime-form-header">

            <div>

              <span className="section-label">
                RECORD MANAGEMENT
              </span>

              <h3>
                {editingId
                  ? "Update Crime Record"
                  : "Add New Crime Record"}
              </h3>

            </div>


            <button
              className="close-form-button"
              onClick={resetForm}
            >
              ✕
            </button>

          </div>


          <form onSubmit={handleSubmit}>

            <div className="crime-form-grid">


              <div className="form-field">

                <label>
                  Crime Type
                </label>

                <input
                  type="text"
                  name="crimeType"
                  value={formData.crimeType}
                  onChange={handleChange}
                  placeholder="e.g. Theft"
                  required
                />

              </div>


              <div className="form-field">

                <label>
                  Location
                </label>

                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Bagalkot"
                  required
                />

              </div>


              <div className="form-field">

                <label>
                  Date
                </label>

                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />

              </div>


              <div className="form-field">

                <label>
                  Time
                </label>

                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                />

              </div>


              <div className="form-field full-width">

                <label>
                  Criminal / Suspect
                </label>

                <input
                  type="text"
                  name="criminal"
                  value={formData.criminal}
                  onChange={handleChange}
                  placeholder="e.g. Unknown / Known suspect"
                />

              </div>


              <div className="form-field full-width">

                <label>
                  Description
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter complete crime description..."
                  rows="4"
                  required
                />

              </div>

            </div>


            <div className="form-buttons">

              <button
                type="submit"
                className="save-record-button"
              >
                {editingId
                  ? "✓ Update Record"
                  : "＋ Save Record"}
              </button>


              <button
                type="button"
                className="cancel-button"
                onClick={resetForm}
              >
                Cancel
              </button>

            </div>

          </form>

        </section>

      )}


      {/* =================================================
          RECORDS
      ================================================= */}

      <section className="crime-records-section">

        <div className="records-heading">

          <div>

            <span className="section-label">
              DATABASE
            </span>

            <h3>
              Crime Records
            </h3>

            <p>
              {crimes.length} record
              {crimes.length !== 1 ? "s" : ""} found
            </p>

          </div>


          <button
            className="refresh-button"
            onClick={fetchCrimes}
          >
            ↻ Refresh
          </button>

        </div>


        {/* LOADING */}

        {loading && (

          <div className="records-loading">

            <div className="loading-spinner"></div>

            <p>
              Loading records...
            </p>

          </div>

        )}


        {/* EMPTY */}

        {!loading &&
          crimes.length === 0 &&
          !error && (

            <div className="records-empty">

              <div>
                📂
              </div>

              <h4>
                No Crime Records
              </h4>

              <p>
                No records are currently available.
              </p>

              <button
                className="add-crime-button"
                onClick={openAddForm}
              >
                ＋ Add First Record
              </button>

            </div>

          )}


        {/* TABLE */}

        {!loading &&
          crimes.length > 0 && (

            <div className="crime-table-wrapper">

              <table className="professional-crime-table">

                <thead>

                  <tr>

                    <th className="column-number">
                      #
                    </th>

                    <th>
                      Crime Type
                    </th>

                    <th>
                      Location
                    </th>

                    <th>
                      Date
                    </th>

                    <th>
                      Time
                    </th>

                    <th>
                      Criminal / Suspect
                    </th>

                    <th className="description-column">
                      Description
                    </th>

                    <th className="actions-column">
                      Actions
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {crimes.map(
                    (crime, index) => (

                      <tr key={crime._id}>

                        <td className="column-number">
                          {index + 1}
                        </td>


                        <td>

                          <span className="crime-type">
                            {crime.crimeType}
                          </span>

                        </td>


                        <td>
                          <span className="location-text">
                            📍 {crime.location || "—"}
                          </span>
                        </td>


                        <td>
                          {formatDate(crime.date)}
                        </td>


                        <td>

                          <span className="time-text">
                            🕒 {crime.time || "—"}
                          </span>

                        </td>


                        <td>
                          {crime.criminal ||
                            "Not yet found"}
                        </td>


                        <td className="description-column">

                          <span className="description-text">
                            {crime.description ||
                              "No description"}
                          </span>

                        </td>


                        <td className="actions-column">

                          <div className="table-actions">

                            <button
                              className="table-edit-button"
                              onClick={() =>
                                handleEdit(crime)
                              }
                            >
                              ✏ Edit
                            </button>


                            <button
                              className="table-delete-button"
                              onClick={() =>
                                handleDelete(
                                  crime._id
                                )
                              }
                            >
                              🗑 Delete
                            </button>

                          </div>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

      </section>

    </div>
  );
}

export default AdminDashboard;