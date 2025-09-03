import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { TYPE_COLORS } from '../constants/typeColors';

interface FavoritePokemon {
  id: number;
  name: string;
  sprites: {
    front_default: string;
    front_shiny: string;
  };
  types: Array<{
    type: {
      name: string;
    };
  }>;
  stats: Array<{
    base_stat: number;
    stat: {
      name: string;
    };
  }>;
}

const EnhancedFavorites: React.FC = () => {
  const [favorites, setFavorites] = useState<FavoritePokemon[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'id' | 'name' | 'recent'>('recent');
  const [filterType, setFilterType] = useState<string>('all');
  const [showShiny, setShowShiny] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    loadFavorites();
    
    const handleShinyToggle = (e: CustomEvent) => {
      setShowShiny(e.detail);
    };
    
    window.addEventListener('shinyToggle', handleShinyToggle as EventListener);
    window.addEventListener('favoritesUpdated', loadFavorites);
    
    return () => {
      window.removeEventListener('shinyToggle', handleShinyToggle as EventListener);
      window.removeEventListener('favoritesUpdated', loadFavorites);
    };
  }, []);

  const loadFavorites = () => {
    const saved = localStorage.getItem('favoritePokemon');
    if (saved) {
      setFavorites(JSON.parse(saved));
    }
  };

  const removeFavorite = (pokemonId: number) => {
    const newFavorites = favorites.filter(p => p.id !== pokemonId);
    localStorage.setItem('favoritePokemon', JSON.stringify(newFavorites));
    setFavorites(newFavorites);
    window.dispatchEvent(new CustomEvent('favoritesUpdated'));
  };

  const clearAllFavorites = () => {
    if (window.confirm('Are you sure you want to clear all favorites?')) {
      localStorage.removeItem('favoritePokemon');
      setFavorites([]);
      window.dispatchEvent(new CustomEvent('favoritesUpdated'));
    }
  };

  const exportFavorites = () => {
    const dataStr = JSON.stringify(favorites, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'pokemon_favorites.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importFavorites = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        localStorage.setItem('favoritePokemon', JSON.stringify(imported));
        setFavorites(imported);
        window.dispatchEvent(new CustomEvent('favoritesUpdated'));
      } catch (error) {
        console.error('Error importing favorites:', error);
      }
    };
    reader.readAsText(file);
  };

  const filteredAndSortedFavorites = React.useMemo(() => {
    let filtered = favorites.filter(pokemon => {
      const matchesSearch = pokemon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           pokemon.id.toString().includes(searchTerm);
      const matchesType = filterType === 'all' || 
                         pokemon.types.some(t => t.type.name === filterType);
      return matchesSearch && matchesType;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'id':
          return a.id - b.id;
        default: // recent
          return 0; // Keep original order (most recent first)
      }
    });

    return filtered;
  }, [favorites, searchTerm, filterType, sortBy]);

  const allTypes = React.useMemo(() => {
    const types = new Set<string>();
    favorites.forEach(p => p.types.forEach(t => types.add(t.type.name)));
    return Array.from(types).sort();
  }, [favorites]);

  const getTotalStats = (pokemon: FavoritePokemon) => {
    return pokemon.stats.reduce((sum, stat) => sum + stat.base_stat, 0);
  };

  return (
    <div className="enhanced-favorites">
      {/* Hero Section */}
      <motion.div 
        className="favorites-hero"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="favorites-title">
          My Favorites
          <span className="favorites-subtitle">Your Personal Collection</span>
        </h1>
        <p className="favorites-description">
          {favorites.length} Pokémon in your collection
        </p>
      </motion.div>

      {/* Actions Bar */}
      <motion.div 
        className="favorites-actions"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <button 
          className="action-btn primary"
          onClick={exportFavorites}
          disabled={favorites.length === 0}
        >
          <span className="btn-icon">📤</span>
          Export Collection
        </button>
        <label className="action-btn secondary">
          <span className="btn-icon">📥</span>
          Import Collection
          <input 
            type="file" 
            accept=".json"
            onChange={importFavorites}
            style={{ display: 'none' }}
          />
        </label>
        <button 
          className="action-btn danger"
          onClick={clearAllFavorites}
          disabled={favorites.length === 0}
        >
          <span className="btn-icon">🗑️</span>
          Clear All
        </button>
        <div className="collection-stats">
          <div className="stat-item">
            <span className="stat-number">{favorites.length}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{allTypes.length}</span>
            <span className="stat-label">Types</span>
          </div>
        </div>
      </motion.div>

      {favorites.length > 0 ? (
        <>
          {/* Filters Section */}
          <motion.div 
            className="filters-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="search-wrapper">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="enhanced-search-bar"
                placeholder="Search your favorites..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button 
                  className="clear-search"
                  onClick={() => setSearchTerm('')}
                >
                  ✕
                </button>
              )}
            </div>

            <div className="filter-controls">
              <div className="filter-group">
                <label>Type</label>
                <select 
                  value={filterType} 
                  onChange={(e) => setFilterType(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Types</option>
                  {allTypes.map(type => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Sort By</label>
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value as 'id' | 'name' | 'recent')}
                  className="filter-select"
                >
                  <option value="recent">Recently Added</option>
                  <option value="id">Number</option>
                  <option value="name">Name</option>
                </select>
              </div>

              <div className="filter-group">
                <label>View</label>
                <div className="view-toggle">
                  <button 
                    className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                    onClick={() => setViewMode('grid')}
                  >
                    ⊞
                  </button>
                  <button 
                    className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                    onClick={() => setViewMode('list')}
                  >
                    ☰
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Favorites Grid/List */}
          <AnimatePresence mode="wait">
            <motion.div 
              className={`favorites-container ${viewMode}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {filteredAndSortedFavorites.map((pokemon, index) => (
                <motion.div
                  key={pokemon.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="favorite-card"
                >
                  <button 
                    className="remove-btn"
                    onClick={() => removeFavorite(pokemon.id)}
                    title="Remove from favorites"
                  >
                    ❤️
                  </button>
                  
                  <Link to={`/pokemon/${pokemon.id}`} className="favorite-link">
                    <div className="pokemon-number">#{String(pokemon.id).padStart(3, '0')}</div>
                    <div className="pokemon-image-container">
                      <img
                        src={showShiny ? pokemon.sprites.front_shiny : pokemon.sprites.front_default}
                        alt={pokemon.name}
                        className="pokemon-image"
                      />
                      {showShiny && <span className="shiny-indicator">✨</span>}
                    </div>
                    <h3 className="pokemon-name">{pokemon.name}</h3>
                    <div className="pokemon-types">
                      {pokemon.types.map((type) => (
                        <span
                          key={type.type.name}
                          className="type-badge"
                          style={{ backgroundColor: TYPE_COLORS[type.type.name] }}
                        >
                          {type.type.name}
                        </span>
                      ))}
                    </div>
                    <div className="pokemon-stats">
                      <div className="stat-bar-container">
                        <span className="stat-label">Total</span>
                        <div className="stat-bar">
                          <div 
                            className="stat-bar-fill"
                            style={{ 
                              width: `${(getTotalStats(pokemon) / 720) * 100}%`,
                              background: 'linear-gradient(90deg, #667eea, #764ba2)'
                            }}
                          />
                        </div>
                        <span className="stat-value">{getTotalStats(pokemon)}</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {filteredAndSortedFavorites.length === 0 && searchTerm && (
            <div className="no-results">
              <span className="no-results-icon">🔍</span>
              <h3>No favorites found</h3>
              <p>Try adjusting your search or filters</p>
            </div>
          )}
        </>
      ) : (
        <motion.div 
          className="empty-favorites-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="empty-favorites-content">
            <span className="empty-icon">💔</span>
            <h2>No Favorites Yet</h2>
            <p>Start building your collection by clicking the heart icon on any Pokémon!</p>
            <Link to="/" className="browse-btn">
              Browse Pokémon
            </Link>
          </div>
        </motion.div>
      )}

      <style jsx>{`
        .enhanced-favorites {
          padding: 2rem 0;
          min-height: 100vh;
        }

        .favorites-hero {
          text-align: center;
          padding: 3rem 2rem;
          background: linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%);
          border-radius: 24px;
          margin-bottom: 3rem;
          color: white;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }

        .favorites-title {
          font-size: 3rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .favorites-subtitle {
          font-size: 1.5rem;
          font-weight: 400;
          opacity: 0.9;
        }

        .favorites-description {
          font-size: 1.2rem;
          opacity: 0.8;
          margin-top: 1rem;
        }

        .favorites-actions {
          display: flex;
          gap: 1.5rem;
          align-items: center;
          padding: 2rem;
          background: white;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
          margin-bottom: 2rem;
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.5rem;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .action-btn.primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .action-btn.primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
        }

        .action-btn.secondary {
          background: #f8f9fa;
          color: #333;
          border: 2px solid #e0e0e0;
        }

        .action-btn.secondary:hover:not(:disabled) {
          background: white;
          border-color: #667eea;
        }

        .action-btn.danger {
          background: #ff6b6b;
          color: white;
        }

        .action-btn.danger:hover:not(:disabled) {
          background: #ff5252;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(255, 107, 107, 0.3);
        }

        .btn-icon {
          font-size: 1.2rem;
        }

        .collection-stats {
          margin-left: auto;
          display: flex;
          gap: 2rem;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .stat-number {
          font-size: 1.8rem;
          font-weight: 700;
          color: #667eea;
        }

        .stat-label {
          font-size: 0.9rem;
          color: #666;
        }

        .filters-section {
          background: white;
          padding: 2rem;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
          margin-bottom: 2rem;
        }

        .search-wrapper {
          position: relative;
          margin-bottom: 2rem;
        }

        .search-icon {
          position: absolute;
          left: 1.5rem;
          top: 50%;
          transform: translateY(-50%);
          font-size: 1.5rem;
        }

        .enhanced-search-bar {
          width: 100%;
          padding: 1.25rem 3.5rem;
          font-size: 1.1rem;
          border: 2px solid #e0e0e0;
          border-radius: 16px;
          transition: all 0.3s;
          background: #f8f9fa;
        }

        .enhanced-search-bar:focus {
          outline: none;
          border-color: #ff6b6b;
          background: white;
          box-shadow: 0 0 0 4px rgba(255, 107, 107, 0.1);
        }

        .clear-search {
          position: absolute;
          right: 1.5rem;
          top: 50%;
          transform: translateY(-50%);
          background: #ff6b6b;
          color: white;
          border: none;
          border-radius: 50%;
          width: 28px;
          height: 28px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .clear-search:hover {
          background: #ff5252;
          transform: translateY(-50%) scale(1.1);
        }

        .filter-controls {
          display: flex;
          gap: 2rem;
          flex-wrap: wrap;
          align-items: flex-end;
        }

        .filter-group {
          flex: 1;
          min-width: 150px;
        }

        .filter-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #333;
        }

        .filter-select {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          background: white;
          font-size: 1rem;
          transition: all 0.2s;
          cursor: pointer;
        }

        .filter-select:hover {
          border-color: #ff6b6b;
        }

        .filter-select:focus {
          outline: none;
          border-color: #ff6b6b;
          box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.1);
        }

        .view-toggle {
          display: flex;
          gap: 0.5rem;
        }

        .view-btn {
          padding: 0.75rem 1rem;
          border: 2px solid #e0e0e0;
          background: white;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 1.2rem;
        }

        .view-btn:hover {
          border-color: #ff6b6b;
          background: #fff5f5;
        }

        .view-btn.active {
          background: #ff6b6b;
          color: white;
          border-color: #ff6b6b;
        }

        .favorites-container {
          padding: 0 2rem;
        }

        .favorites-container.grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 2rem;
        }

        .favorites-container.list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .favorite-card {
          position: relative;
        }

        .remove-btn {
          position: absolute;
          top: 1rem;
          right: 1rem;
          z-index: 10;
          background: white;
          border: 2px solid #ff6b6b;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 1.5rem;
        }

        .remove-btn:hover {
          background: #ff6b6b;
          transform: scale(1.1);
        }

        .favorite-link {
          display: block;
          background: white;
          border-radius: 20px;
          padding: 1.5rem;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
          transition: all 0.3s;
          text-decoration: none;
          color: inherit;
          overflow: hidden;
        }

        .favorite-link:hover {
          transform: translateY(-8px);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.12);
        }

        .pokemon-number {
          font-size: 0.9rem;
          font-weight: 700;
          color: #999;
          margin-bottom: 0.5rem;
        }

        .pokemon-image-container {
          position: relative;
          display: flex;
          justify-content: center;
          margin: 1rem 0;
        }

        .pokemon-image {
          width: 120px;
          height: 120px;
          object-fit: contain;
        }

        .shiny-indicator {
          position: absolute;
          top: 0;
          right: 20%;
          font-size: 1.5rem;
          animation: sparkle 1s ease-in-out infinite;
        }

        @keyframes sparkle {
          0%, 100% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.2) rotate(180deg); }
        }

        .pokemon-name {
          font-size: 1.3rem;
          font-weight: 700;
          text-transform: capitalize;
          text-align: center;
          margin: 1rem 0;
          color: #333;
        }

        .pokemon-types {
          display: flex;
          gap: 0.5rem;
          justify-content: center;
          margin-bottom: 1rem;
        }

        .type-badge {
          padding: 0.4rem 1rem;
          border-radius: 12px;
          color: white;
          font-weight: 600;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        .pokemon-stats {
          margin-top: 1rem;
        }

        .stat-bar-container {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .stat-bar {
          flex: 1;
          height: 8px;
          background: #f0f0f0;
          border-radius: 4px;
          overflow: hidden;
        }

        .stat-bar-fill {
          height: 100%;
          transition: width 0.5s ease;
        }

        .stat-value {
          font-weight: 700;
          color: #333;
          min-width: 40px;
          text-align: right;
        }

        .list .favorite-card {
          position: static;
        }

        .list .favorite-link {
          display: flex;
          align-items: center;
          gap: 2rem;
          position: relative;
        }

        .list .remove-btn {
          position: absolute;
          top: 50%;
          right: 1rem;
          transform: translateY(-50%);
        }

        .list .pokemon-image-container {
          margin: 0;
        }

        .list .pokemon-image {
          width: 80px;
          height: 80px;
        }

        .list .pokemon-name {
          text-align: left;
          margin: 0;
          flex: 1;
        }

        .no-results {
          text-align: center;
          padding: 4rem 2rem;
        }

        .no-results-icon {
          font-size: 4rem;
          display: block;
          margin-bottom: 1rem;
        }

        .no-results h3 {
          color: #333;
          margin: 1rem 0;
        }

        .no-results p {
          color: #666;
        }

        .empty-favorites-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 400px;
        }

        .empty-favorites-content {
          text-align: center;
          padding: 3rem;
          background: white;
          border-radius: 24px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
        }

        .empty-icon {
          font-size: 5rem;
          display: block;
          margin-bottom: 1.5rem;
        }

        .empty-favorites-content h2 {
          color: #333;
          margin-bottom: 1rem;
        }

        .empty-favorites-content p {
          color: #666;
          margin-bottom: 2rem;
          font-size: 1.1rem;
        }

        .browse-btn {
          display: inline-block;
          padding: 1rem 2rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-decoration: none;
          border-radius: 12px;
          font-weight: 600;
          transition: all 0.3s;
        }

        .browse-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
        }

        @media (max-width: 768px) {
          .favorites-title {
            font-size: 2rem;
          }

          .favorites-subtitle {
            font-size: 1.2rem;
          }

          .favorites-actions {
            flex-direction: column;
            gap: 1rem;
          }

          .collection-stats {
            margin-left: 0;
            width: 100%;
            justify-content: center;
          }

          .filter-controls {
            flex-direction: column;
            gap: 1rem;
          }

          .filter-group {
            width: 100%;
          }

          .favorites-container.grid {
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
            gap: 1rem;
            padding: 0 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default EnhancedFavorites;