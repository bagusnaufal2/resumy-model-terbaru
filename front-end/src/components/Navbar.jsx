import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import ThemeToggle from './ThemeToggle';

const IT_TREND_URL = 'https://resumy.streamlit.app/';

function Navbar() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeHash, setActiveHash] = useState(() =>
    typeof window === 'undefined' ? '' : window.location.hash,
  );
  const isResultPage = location.pathname === '/result';
  const isCVBuilderPage = location.pathname === '/cv-builder';
  const isRoadmapPage = location.pathname === '/roadmap';
  const isHomePage = location.pathname === '/';
  const isAboutActive = isHomePage && (!activeHash || activeHash === '#about');
  const isAnalyzeActive = isHomePage && activeHash === '#upload-cv';
  const navClass = (isActive = false) =>
    `nav-link${isActive ? ' is-active' : ''}`;

  return (
    <header className='navbar'>
      <Link
        className='logo'
        to='/'
        aria-label='ResuMy home'
        onClick={() => {
          setActiveHash('');
          setIsMenuOpen(false);
        }}
      >
        Resu<span>My</span>
      </Link>

      <nav
        className={`nav-menu${isMenuOpen ? ' is-open' : ''}`}
        id='primary-navigation'
        onClick={() => setIsMenuOpen(false)}
      >
        {isResultPage ? (
          <>
            <span className={navClass(true)} aria-current='page'>
              My Result
            </span>
            <a
              className={navClass()}
              href={IT_TREND_URL}
              target='_blank'
              rel='noopener noreferrer'
            >
              IT Trend
            </a>
            <Link
              className={navClass()}
              to='/roadmap'
              onClick={() => setActiveHash('')}
            >
              Roadmap Generator
            </Link>
            <Link className={navClass()} to='/' onClick={() => setActiveHash('')}>
              Back to Home
            </Link>
          </>
        ) : isCVBuilderPage ? (
          <>
            <span className={navClass(true)} aria-current='page'>
              CV Builder
            </span>
            <a
              className={navClass()}
              href={IT_TREND_URL}
              target='_blank'
              rel='noopener noreferrer'
            >
              IT Trend
            </a>
            <Link
              className={navClass()}
              to='/roadmap'
              onClick={() => setActiveHash('')}
            >
              Roadmap Generator
            </Link>
            <Link className={navClass()} to='/' onClick={() => setActiveHash('')}>
              Back to Home
            </Link>
          </>
        ) : isRoadmapPage ? (
          <>
            <Link
              className={navClass()}
              to='/cv-builder'
              onClick={() => setActiveHash('')}
            >
              CV Builder
            </Link>
            <a
              className={navClass()}
              href={IT_TREND_URL}
              target='_blank'
              rel='noopener noreferrer'
            >
              IT Trend
            </a>
            <span className={navClass(true)} aria-current='page'>
              Roadmap Generator
            </span>
            <Link className={navClass()} to='/' onClick={() => setActiveHash('')}>
              Back to Home
            </Link>
          </>
        ) : (
          <>
            <a
              className={navClass(isAboutActive)}
              href='#about'
              onClick={() => setActiveHash('#about')}
            >
              Home
            </a>
            <a
              className={navClass(isAnalyzeActive)}
              href='#upload-cv'
              onClick={() => setActiveHash('#upload-cv')}
            >
              Analyze
            </a>
            <Link
              className={navClass()}
              to='/cv-builder'
              onClick={() => setActiveHash('')}
            >
              CV Builder
            </Link>
            <a
              className={navClass()}
              href={IT_TREND_URL}
              target='_blank'
              rel='noopener noreferrer'
            >
              IT Trend
            </a>
            <Link
              className={navClass()}
              to='/roadmap'
              onClick={() => setActiveHash('')}
            >
              Roadmap Generator
            </Link>
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
