import { Link, useLocation } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

function Navbar() {
  const location = useLocation();
  const isResultPage = location.pathname === "/result";
  const isCVBuilderPage = location.pathname === "/cv-builder";

  return (
    <header className="navbar">
      <h1 className="logo">ResuMy</h1>

      <nav className="nav-menu">
        {isResultPage ? (
          <>
            <p>My Result</p>
            <Link to="/">Back to Home</Link>
            <ThemeToggle />
          </>
        ) : isCVBuilderPage ? (
          <>
            <p>Build Your ATS CV</p>
            <Link to="/">Back to Home</Link>
            <ThemeToggle />
          </>
        ) : (
          <>
            <a href="#about">Home</a>
            <a href="#upload-cv">Analyze</a>
            <Link to="/cv-builder">CV Builder</Link>
            <ThemeToggle />
          </>
        )}
      </nav>
    </header>
  );
}

export default Navbar;
