import { useEffect, useState } from "react";
import axios from "axios";
import { FaEye } from "react-icons/fa";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";


function AnalysisDashboard() {

  // ============================================================
  // STATE
  // ============================================================

  const [summary, setSummary] = useState(null);

  const [crimeTypes, setCrimeTypes] = useState([]);

  const [locations, setLocations] = useState([]);

  const [monthly, setMonthly] = useState([]);

  const [timePattern, setTimePattern] = useState([]);

  const [weapons, setWeapons] = useState([]);

  const [weaponRelationships, setWeaponRelationships] = useState([]);

  const [relatedCases, setRelatedCases] = useState([]);

  const [selectedCase, setSelectedCase] = useState(null);

  const [loadingRelatedCases, setLoadingRelatedCases] = useState(false);

  const [crimeInput, setCrimeInput] = useState("ASSAULT");
  const [weaponInput, setWeaponInput] = useState("Firearm");
  const [cityInput, setCityInput] = useState("Delhi");
  const [domainInput, setDomainInput] = useState("Violent Crime");
  const [hourInput, setHourInput] = useState(17);


  // ============================================================
  // LOAD ANALYSIS
  // ============================================================
  const loadRelatedCases = async () => {
  try {
    setLoadingRelatedCases(true);
    const headers = {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    };

    const relatedRes = await axios.post(
      "http://localhost:5000/api/analysis/related-cases",
      {
        crime: crimeInput,
        weapon: weaponInput,
        city: cityInput,
        domain: domainInput,
        hour: hourInput,
        limit: 5,
      },
      { headers }
    );

    const cases = relatedRes.data.data || [];
    const filteredCases = cases.filter(
      (item) => Number(item.similarity_score) >= 90
    );
    setRelatedCases(filteredCases);

    console.log(
      "RELATED CASES:",
      relatedRes.data.data
    );

  } catch (error) {
    console.error("Related Cases Error:", error);
  }finally {
    setLoadingRelatedCases(false);
  }
};
  useEffect(() => {

    const loadAnalysis = async () => {

      try {

        const headers = {
          Authorization:
            `Bearer ${localStorage.getItem("token")}`,
        };


        // --------------------------------------------------------
        // Existing MongoDB summary
        // Keeps the existing summary cards working.
        // --------------------------------------------------------

        const summaryRes = await axios.get(
          "http://localhost:5000/api/analysis/summary",
          { headers }
        );


        // --------------------------------------------------------
        // NEW: Historical crime dataset analysis
        // 40,160 cleaned records
        // --------------------------------------------------------

        const datasetRes = await axios.get(
          "http://localhost:5000/api/analysis/dataset-analysis",
          { headers }
        );


        const dataset = datasetRes.data.data;
        console.log("HISTORICAL DATASET:", dataset);
        // ========================================================
        // SUMMARY
        // ========================================================

        setSummary(summaryRes.data);


        // ========================================================
        // CRIME TYPES
        // From cleaned_indian_crimes.csv
        // ========================================================

        if (dataset.crime_distribution) {

          setCrimeTypes(
            dataset.crime_distribution.map(item => ({
              name: item.crime,
              count: item.count,
            }))
          );

        }


        // ========================================================
        // LOCATIONS
        // From cleaned_indian_crimes.csv
        // ========================================================

        if (dataset.city_distribution) {

          setLocations(
            dataset.city_distribution.map(item => ({
              name: item.city,
              count: item.count,
            }))
          );

        }


        // ========================================================
        // MONTHLY CRIME TREND
        // ========================================================

        if (dataset.monthly_trend) {
          setMonthly(
            dataset.monthly_trend.map(item => ({
              name: item.period,
              count: item.count,
            }))
          );
        }


        // ========================================================
        // TIME PATTERN
        // ========================================================

        if (dataset.hour_distribution) {

          setTimePattern(
            dataset.hour_distribution.map(item => ({
              hour: `${item.hour}:00`,
              count: item.count,
            }))
          );

        }
        // ============================================================
        // WEAPON USAGE
        // ============================================================

        if (dataset.weapon_distribution) {
          setWeapons(
            dataset.weapon_distribution.map(item => ({
              name: item.weapon,
              count: item.count,
            }))
          );
        }

        // ============================================================
        // CRIME + WEAPON RELATIONSHIP
        // ============================================================
        if (dataset.weapon_crime_relationship) {
          setWeaponRelationships(
            dataset.weapon_crime_relationship.map(item => ({
              crime: item.crime,
              weapon: item.weapon,
              count: item.count,
            }))
          );
        }

      } catch (error) {

        console.error(
          "Analysis Dashboard Error:",
          error
        );

      }

    };


    loadAnalysis();

  }, []);


  // ============================================================
  // LOADING
  // ============================================================

  if (!summary) {

    return (
      <div className="loading">
        Loading analysis...
      </div>
    );

  }


  // ============================================================
  // DASHBOARD
  // ============================================================

  return (

    <div className="analysis-page">

      <div className="section-heading">

        <div>

          <h2>
            Analysis Dashboard
          </h2>

          <p>
            Crime patterns and statistics
          </p>

        </div>

      </div>


      {/* ========================================================
          SUMMARY CARDS
          ======================================================== */}

      <div className="stats-grid">

        <div className="stat-card">

          <span>📁</span>

          <h3>
            Total Crimes
          </h3>

          <strong>
            {summary.totalCrimes}
          </strong>

        </div>


        <div className="stat-card">

          <span>👤</span>

          <h3>
            Known Criminals
          </h3>

          <strong>
            {summary.knownCriminals}
          </strong>

        </div>


        <div className="stat-card">

          <span>❓</span>

          <h3>
            Unknown Criminals
          </h3>

          <strong>
            {summary.unknownCriminals}
          </strong>

        </div>


        <div className="stat-card">

          <span>🚨</span>

          <h3>
            Most Common
          </h3>

          <strong>
            {summary.mostCommonCrime}
          </strong>

        </div>


        <div className="stat-card">

          <span>📍</span>

          <h3>
            Top Location
          </h3>

          <strong>
            {summary.mostAffectedLocation}
          </strong>

        </div>

      </div>


      {/* ========================================================
          CHARTS
          ======================================================== */}

      <div className="charts-grid">


        {/* ======================================================
            CRIMES BY TYPE
            ====================================================== */}

        <div className="chart-card">

          <h3>
            Crimes by Type
          </h3>

          <ResponsiveContainer
            width="100%"
            height={300}
          >

            <BarChart
              data={crimeTypes}
            >

              <CartesianGrid
                strokeDasharray="3 3"
              />

              <XAxis
                dataKey="name"
              />

              <YAxis />

              <Tooltip />

              <Bar
                dataKey="count"
              />

            </BarChart>

          </ResponsiveContainer>

        </div>


        {/* ======================================================
            CRIMES BY LOCATION
            ====================================================== */}

        <div className="chart-card">

          <h3>
            Crimes by Location
          </h3>

          <ResponsiveContainer
            width="100%"
            height={300}
          >

            <BarChart
              data={locations}
            >

              <CartesianGrid
                strokeDasharray="3 3"
              />

              <XAxis
                dataKey="name"
              />

              <YAxis />

              <Tooltip />

              <Bar
                dataKey="count"
              />

            </BarChart>

          </ResponsiveContainer>

        </div>


        {/* ======================================================
            MONTHLY CRIME TREND
            ====================================================== */}

        <div className="chart-card">

          <h3>
            Monthly Crime Trend
          </h3>

          <ResponsiveContainer
            width="100%"
            height={300}
          >

            <LineChart
              data={monthly}
            >

              <CartesianGrid
                strokeDasharray="3 3"
              />

              <XAxis
                dataKey="name"
              />

              <YAxis />

              <Tooltip />

              <Line
                type="monotone"
                dataKey="count"
                strokeWidth={3}
              />

            </LineChart>

          </ResponsiveContainer>

        </div>


        {/* ======================================================
            CRIME BY TIME
            ====================================================== */}

        <div className="chart-card">

          <h3>
            Crime by Time
          </h3>

          <ResponsiveContainer
            width="100%"
            height={300}
          >

            <BarChart
              data={timePattern}
            >

              <CartesianGrid
                strokeDasharray="3 3"
              />

              <XAxis
                dataKey="hour"
              />

              <YAxis />

              <Tooltip />

              <Bar
                dataKey="count"
              />

            </BarChart>

          </ResponsiveContainer>

        </div>

        {/* Weapon Usage */}
        <div className="chart-card">
          <h3>Weapon Usage</h3>
          <ResponsiveContainer
          width="100%"
          height={300}
          >
            <BarChart
            data={weapons}
            >
              <CartesianGrid
              strokeDasharray="3 3"
              />
              <XAxis
              dataKey="name"
              />
              <YAxis />
              <Tooltip />
              <Bar
              dataKey="count"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* Crime + Weapon Relationship */}
        <div className="relationship-card">
          <h3>
            Crime & Weapon Relationship
            </h3>
            <p className="relationship-subtitle">
              Most frequently associated weapon for each crime
              </p>
              <div className="table-container">
                <table className="relationship-table">
                  <thead>
                    <tr>
                      <th>Crime</th>
                      <th>Weapon</th>
                      <th>Cases</th>
                    </tr>
                  </thead>
                  <tbody>
                    {weaponRelationships.map(
                      (item, index) => (
                        <tr key={index}>
                          <td>
                            {item.crime}
                          </td>
                          <td>
                            {item.weapon}
                          </td>
                          <td>
                            {item.count}
                          </td>
                        </tr>
                        )
                      )}
                  </tbody>
                </table>
              </div>
        </div>
      </div>
      {/* RELATED CASES */}
      <div className="related-cases-section">
        <div className="related-search-panel">
          <h3>Find Related Cases</h3>
          <div className="search-grid">
            <div>
              <label>Crime</label>
              <input
              value={crimeInput}
              onChange={(e) => setCrimeInput(e.target.value)}
              placeholder="Enter crime"
              />
            </div>
            <div>
              <label>Weapon</label>
              <input
              value={weaponInput}
              onChange={(e) => setWeaponInput(e.target.value)}
              placeholder="Enter weapon"
              />
            </div>
            <div>
              <label>City</label>
              <input
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              placeholder="Enter city"
              />
            </div>
            <div>
              <label>Crime Domain</label>
              <input
              value={domainInput}
              onChange={(e) => setDomainInput(e.target.value)}
              placeholder="Enter crime domain"
              />
            </div>
            <div>
              <label>Hour</label>
              <input
              type="number"
              min="0"
              max="23"
              value={hourInput}
              onChange={(e) => setHourInput(e.target.value)}
              />
            </div>
          </div>
          <button
          onClick={loadRelatedCases}
          disabled={loadingRelatedCases}
          >
            {loadingRelatedCases ? "Loading..." : "Find Related Cases"}
          </button>
        </div>
        <h2>Related Historical Cases</h2>
        <p>
          Cases similar to the selected crime based on crime type,
          weapon, location, domain, and time.
        </p>
        <div className="related-cases-table">
          <table>
            <thead>
              <tr>
               <th>Crime</th>
               <th>Weapon</th>
               <th>City</th>
               <th>Similarity</th>
               <th>Date</th>
               <th>Status</th>
               <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {relatedCases.length > 0 ? (
                relatedCases.map((item, index) => (
                <tr key={item.report_number || index}>
                  <td>{item.crime}</td>
                  <td>{item.weapon}</td>
                  <td>{item.city}</td>
                  <td>
                    <strong>{item.similarity_score}%</strong>
                  </td>
                  <td>
                    {item.date
                    ? String(item.date).slice(0, 10)
                    : "N/A"}
                  </td>
                  <td>{item.status ? "Yes" : "No"}</td>
                  <td>
                    <button
                    className="view-details-btn"
                    onClick={() => setSelectedCase(item)}
                    >
                      <FaEye /> 
                      <span>View Details</span>
                    </button>
                  </td>
                </tr>
                ))
                ) : (
                <tr>
                  <td colSpan="7">
                    No related cases found. Try different search criteria.
                  </td>
                </tr>
             )}
            </tbody>
          </table>
        </div>
      </div>
      {selectedCase && (
        <div
        className="case-modal-overlay"
        onClick={() => setSelectedCase(null)}
        >
          <div
          className="case-modal"
          onClick={(e) => e.stopPropagation()}
          >
            <div className="case-modal-header">
              <h2>Case Details</h2>
              <button
              className="close-modal-btn"
              onClick={() => setSelectedCase(null)}
              >
                ×
              </button>
            </div>
            <div className="case-details-grid">
              <div>
                <span>Report Number</span>
                <strong>{selectedCase.report_number || "N/A"}</strong>
              </div>
              <div>
                <span>Similarity</span>
                <strong>{selectedCase.similarity_score}%</strong>
              </div>
              <div>
                <span>Crime</span>
                <strong>{selectedCase.crime || "N/A"}</strong>
              </div>
              <div>
                <span>Weapon</span>
                <strong>{selectedCase.weapon || "N/A"}</strong>
              </div>
              <div>
                <span>City</span>
                <strong>{selectedCase.city || "N/A"}</strong>
              </div>
              <div>
                <span>Crime Domain</span>
                <strong>{selectedCase.domain || "N/A"}</strong>
              </div>
              <div>
                <span>Date</span>
                <strong>
                  {selectedCase.date
                  ? String(selectedCase.date).slice(0, 10)
                  : "N/A"}
                </strong>
              </div>
              <div>
                <span>Time</span>
                <strong>{selectedCase.time
                ? String(selectedCase.time).slice(-5)
                : "N/A"}
                </strong>
              </div>
              <div>
                <span>Victim Age</span>
                <strong>{selectedCase.victim_age || "N/A"}</strong>
              </div>
              <div>
                <span>Victim Gender</span>
                <strong>{selectedCase.victim_gender || "N/A"}</strong>
              </div>
              <div>
                <span>Case Closed</span>
                <strong>{selectedCase.case_closed || "N/A"}</strong>
              </div>
            </div>
         </div>
       </div>
      )}

    </div>

  );

}


export default AnalysisDashboard;