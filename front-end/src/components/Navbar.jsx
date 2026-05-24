import { Link, useLocation } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

const IT_TREND_URL =
  "https://dashboard-capstone-byrbw6njgamqleehs8t6tb.streamlit.app/";

function Navbar() {
  const location = useLocation();
  const isResultPage = location.pathname === "/result";
  const isCVBuilderPage = location.pathname === "/cv-builder";

  return (
    <header className="navbar">
      <Link className="logo" to="/" aria-label="ResuMy home">
        Resu<span>My</span>
      </Link>

      <nav className="nav-menu">
        {isResultPage ? (
          <>
            <span className="nav-context">My Result</span>
            <a href={IT_TREND_URL} target="_blank" rel="noopener noreferrer">
              IT Trend
            </a>
            <Link to="/">Back to Home</Link>
          </>
        ) : isCVBuilderPage ? (
          <>
            <span className="nav-context">ATS CV Builder</span>
            <a href={IT_TREND_URL} target="_blank" rel="noopener noreferrer">
              IT Trend
            </a>
            <Link to="/">Back to Home</Link>
          </>
        ) : (
          <>
            <a href="#about">Home</a>
            <a href="#upload-cv">Analyze</a>
            <Link to="/cv-builder">CV Builder</Link>
            <a href={IT_TREND_URL} target="_blank" rel="noopener noreferrer">
              IT Trend
            </a>
          </>
        )}

        <ThemeToggle />
      </nav>
    </header>
  );
}

export default Navbar;
