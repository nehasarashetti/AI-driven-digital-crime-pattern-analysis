import { useState } from "react";
import axios from "axios";

import AdminDashboard from "./AdminDashboard";
import AnalysisDashboard from "./AnalysisDashboard";

function App() {

  // =====================================================
  // LOGIN
  // =====================================================

  const [isLoggedIn, setIsLoggedIn] = useState(
    Boolean(localStorage.getItem("token"))
  );

  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");

  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);


  // =====================================================
  // CURRENT PAGE
  // =====================================================

  const [activePage, setActivePage] = useState("admin");


  // =====================================================
  // LOGIN
  // =====================================================

  const handleLogin = async (e) => {

    e.preventDefault();

    setLoginError("");
    setLoginLoading(true);

    try {

      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          adminId,
          password
        }
      );

      localStorage.setItem(
        "token",
        response.data.token
      );

      setIsLoggedIn(true);

      setAdminId("");
      setPassword("");

    } catch (error) {

      console.error(error);

      setLoginError(
        error.response?.data?.message ||
        "Invalid Admin ID or password."
      );

    } finally {

      setLoginLoading(false);

    }
  };


  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {

    localStorage.removeItem("token");

    setIsLoggedIn(false);

    setActivePage("admin");
  };


  // =====================================================
  // LOGIN SCREEN
  // =====================================================

  if (!isLoggedIn) {

    return (

      <div className="login-page">

        <div className="login-background-pattern"></div>

        <div className="login-card">

          <div className="login-logo">
            🛡️
          </div>

          <div className="login-heading">

            <h1>
              AI Crime Pattern Analysis
            </h1>

            <p>
              Secure Crime Intelligence Platform
            </p>

          </div>


          <div className="login-divider"></div>


          <h2>
            Administrator Login
          </h2>

          <p className="login-description">
            Sign in to access crime records and
            analytical intelligence.
          </p>


          <form
            onSubmit={handleLogin}
            className="login-form"
          >

            <div className="login-field">

              <label>
                Admin ID
              </label>

              <div className="input-with-icon">

                <span>
                  👤
                </span>

                <input
                  type="text"
                  value={adminId}
                  onChange={(e) =>
                    setAdminId(e.target.value)
                  }
                  placeholder="Enter Admin ID"
                  required
                />

              </div>

            </div>


            <div className="login-field">

              <label>
                Password
              </label>

              <div className="input-with-icon">

                <span>
                  🔐
                </span>

                <input
                  type="password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="Enter Password"
                  required
                />

              </div>

            </div>


            {loginError && (

              <div className="login-error">
                ⚠️ {loginError}
              </div>

            )}


            <button
              type="submit"
              className="login-btn"
              disabled={loginLoading}
            >

              {loginLoading
                ? "Authenticating..."
                : "Sign In"}

            </button>

          </form>


          <div className="login-security">

            <span>
              🔒
            </span>

            <span>
              Authorized personnel only
            </span>

          </div>

        </div>

      </div>
    );
  }


  // =====================================================
  // MAIN APPLICATION
  // =====================================================

  return (

    <div className="application-shell">


      {/* ================================================
          APPLICATION HEADER
      ================================================= */}

      <header className="application-header">

        <div className="application-brand">

          <div className="application-logo">
            🛡️
          </div>

          <div>

            <h1>
              AI Crime Pattern Analysis
            </h1>

            <p>
              Crime Intelligence & Management System
            </p>

          </div>

        </div>


        <div className="header-right">

          <div className="admin-status">

            <span className="status-dot"></span>

            <span>
              Administrator
            </span>

          </div>


          <button
            className="logout-button"
            onClick={handleLogout}
          >
            ⇥ Logout
          </button>

        </div>

      </header>


      {/* ================================================
          DASHBOARD NAVIGATION
      ================================================= */}

      <div className="dashboard-navigation">

        <button
          className={
            activePage === "admin"
              ? "dashboard-nav-button active"
              : "dashboard-nav-button"
          }
          onClick={() => setActivePage("admin")}
        >

          <span className="nav-icon">
            🗂️
          </span>

          <span>
            Admin Dashboard
          </span>

        </button>


        <button
          className={
            activePage === "analysis"
              ? "dashboard-nav-button active"
              : "dashboard-nav-button"
          }
          onClick={() => setActivePage("analysis")}
        >

          <span className="nav-icon">
            📊
          </span>

          <span>
            Analysis Dashboard
          </span>

        </button>

      </div>


      {/* ================================================
          PAGE CONTENT
      ================================================= */}

      <main className="application-content">

        {activePage === "admin" && (
          <AdminDashboard />
        )}


        {activePage === "analysis" && (
          <AnalysisDashboard />
        )}

      </main>


      {/* ================================================
          FOOTER
      ================================================= */}

      <footer className="application-footer">

        <span>
          © AI Crime Pattern Analysis
        </span>

        <span>
          Secure Crime Intelligence System
        </span>

      </footer>

    </div>
  );
}

export default App;