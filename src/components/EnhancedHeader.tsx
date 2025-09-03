import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const EnhancedHeader: React.FC = () => {
  const location = useLocation();
  const [showShiny, setShowShiny] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const savedShiny = localStorage.getItem('showShiny') === 'true';
    setShowShiny(savedShiny);

    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Pokédex', icon: '📖' },
    { path: '/teams', label: 'Teams', icon: '👥' },
    { path: '/comparison', label: 'Compare', icon: '⚖️' },
    { path: '/calculator', label: 'Calculator', icon: '🧮' },
    { path: '/favorites', label: 'Favorites', icon: '❤️' },
  ];

  const toggleShiny = () => {
    const newValue = !showShiny;
    setShowShiny(newValue);
    localStorage.setItem('showShiny', newValue.toString());
    window.dispatchEvent(new CustomEvent('shinyToggle', { detail: newValue }));
  };

  return (
    <>
      <motion.header 
        className={`enhanced-header ${scrolled ? 'scrolled' : ''}`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 100 }}
      >
        <div className="header-container">
          <Link to="/" className="logo-section">
            <motion.img 
              src="/pokeball.svg" 
              alt="Pokéball" 
              className="pokeball-logo"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            />
            <div className="logo-text">
              <h1 className="logo-title">Pokédex</h1>
              <span className="logo-subtitle">Professional Edition</span>
            </div>
          </Link>

          <nav className="nav-section">
            {navItems.map((item, index) => (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link 
                  to={item.path} 
                  className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                  {isActive(item.path) && (
                    <motion.div 
                      className="active-indicator"
                      layoutId="activeIndicator"
                      transition={{ type: 'spring', stiffness: 500 }}
                    />
                  )}
                </Link>
              </motion.div>
            ))}
          </nav>

          <div className="actions-section">
            <motion.button 
              className={`shiny-button ${showShiny ? 'active' : ''}`}
              onClick={toggleShiny}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="shiny-icon">✨</span>
              <span className="shiny-text">{showShiny ? 'Shiny' : 'Normal'}</span>
            </motion.button>

            <button className="theme-button" title="Theme (Coming Soon)">
              🌙
            </button>

            <button className="settings-button" title="Settings (Coming Soon)">
              ⚙️
            </button>
          </div>
        </div>
      </motion.header>

      <style jsx>{`
        .enhanced-header {
          position: sticky;
          top: 0;
          z-index: 1000;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }

        .enhanced-header.scrolled {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          backdrop-filter: blur(10px);
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.15);
        }

        .header-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 1rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 3rem;
        }

        .logo-section {
          display: flex;
          align-items: center;
          gap: 1rem;
          text-decoration: none;
          color: white;
          transition: transform 0.2s;
        }

        .logo-section:hover {
          transform: translateY(-2px);
        }

        .pokeball-logo {
          width: 45px;
          height: 45px;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
        }

        .logo-text {
          display: flex;
          flex-direction: column;
        }

        .logo-title {
          margin: 0;
          font-size: 1.8rem;
          font-weight: 800;
          letter-spacing: -0.5px;
          background: linear-gradient(to right, #fff, #f0f0f0);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .logo-subtitle {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.8);
          font-weight: 500;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .nav-section {
          display: flex;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.1);
          padding: 0.5rem;
          border-radius: 16px;
          backdrop-filter: blur(10px);
        }

        .nav-item {
          position: relative;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          color: rgba(255, 255, 255, 0.9);
          text-decoration: none;
          border-radius: 12px;
          transition: all 0.2s;
          font-weight: 500;
          font-size: 0.95rem;
        }

        .nav-item:hover {
          background: rgba(255, 255, 255, 0.15);
          color: white;
          transform: translateY(-1px);
        }

        .nav-item.active {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          font-weight: 600;
        }

        .nav-icon {
          font-size: 1.2rem;
          display: inline-flex;
          align-items: center;
        }

        .nav-label {
          position: relative;
        }

        .active-indicator {
          position: absolute;
          bottom: -2px;
          left: 50%;
          transform: translateX(-50%);
          width: 30px;
          height: 3px;
          background: white;
          border-radius: 2px;
        }

        .actions-section {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .shiny-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          background: rgba(255, 255, 255, 0.15);
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 12px;
          color: white;
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.2s;
          backdrop-filter: blur(10px);
        }

        .shiny-button:hover {
          background: rgba(255, 255, 255, 0.25);
          border-color: rgba(255, 255, 255, 0.5);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .shiny-button.active {
          background: white;
          color: #764ba2;
          border-color: white;
        }

        .shiny-button.active .shiny-icon {
          animation: sparkle 1s ease-in-out infinite;
        }

        @keyframes sparkle {
          0%, 100% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.2) rotate(180deg); }
        }

        .shiny-icon {
          font-size: 1.2rem;
        }

        .theme-button,
        .settings-button {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.15);
          border: 2px solid rgba(255, 255, 255, 0.3);
          color: white;
          font-size: 1.2rem;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .theme-button:hover,
        .settings-button:hover {
          background: rgba(255, 255, 255, 0.25);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        @media (max-width: 1024px) {
          .header-container {
            padding: 1rem;
          }

          .nav-section {
            gap: 0.25rem;
          }

          .nav-item {
            padding: 0.6rem 1rem;
          }

          .nav-label {
            display: none;
          }

          .logo-subtitle {
            display: none;
          }
        }

        @media (max-width: 768px) {
          .header-container {
            flex-direction: column;
            gap: 1rem;
            padding: 1rem;
          }

          .nav-section {
            width: 100%;
            justify-content: space-around;
          }

          .actions-section {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </>
  );
};

export default EnhancedHeader;