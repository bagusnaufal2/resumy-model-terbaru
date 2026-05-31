import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import ThemeToggle from './ThemeToggle';

const IT_TREND_URL = 'https://resumy.streamlit.app/';

function Navbar() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isResultPage = location.pathname === '/result';
  const isCVBuilderPage = location.pathname === '/cv-builder';
  const isRoadmapPage = location.pathname === '/roadmap';

  return (
    <header className='navbar'>
      <Link className='logo' to='/' aria-label='ResuMy home'>
        Resu<span>My</span>
      </Link>

      <nav
        className={`nav-menu${isMenuOpen ? ' is-open' : ''}`}
        id='primary-navigation'
        onClick={() => setIsMenuOpen(false)}
      >
        {isResultPage ? (
          <>
            <span className='nav-context'>My Result</span>
            <a href={IT_TREND_URL} target='_blank' rel='noopener noreferrer'>
              IT Trend
            </a>
            <Link to='/roadmap'>Roadmap Generator</Link>
            <Link to='/'>Back to Home</Link>
          </>
        ) : isCVBuilderPage ? (
          <>
            <span className='nav-context'>ATS CV Builder</span>
            <a href={IT_TREND_URL} target='_blank' rel='noopener noreferrer'>
              IT Trend
            </a>
            <Link to='/roadmap'>Roadmap Generator</Link>
            <Link to='/'>Back to Home</Link>
          </>
        ) : isRoadmapPage ? (
          <>
            <Link to='/cv-builder'>CV Builder</Link>
            <a href={IT_TREND_URL} target='_blank' rel='noopener noreferrer'>
              IT Trend
            </a>
            <span className='nav-context'>Roadmap Generator</span>
            <Link to='/'>Back to Home</Link>
          </>
        ) : (
          <>
            <a href='#about'>Home</a>
            <a href='#upload-cv'>Analyze</a>
            <Link to='/cv-builder'>CV Builder</Link>
            <a href={IT_TREND_URL} target='_blank' rel='noopener noreferrer'>
              IT Trend
            </a>
            <Link to='/roadmap'>Roadmap Generator</Link>
          </>
        )}
      </nav>

      <div className='navbar-actions'>
        <ThemeToggle />
        <button
          type='button'
          className='nav-toggle'
          aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isMenuOpen}
          aria-controls='primary-navigation'
          onClick={() => setIsMenuOpen((current) => !current)}
        >
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>
    </header>
  );
}

export default Navbar;
