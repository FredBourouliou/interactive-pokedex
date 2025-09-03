import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Pokemon } from '../types/pokemon';
import { fetchPokemonList, fetchPokemonDetails } from '../services/api';
import { TYPE_COLORS } from '../constants/typeColors';

const GENERATIONS = [
  { id: 1, name: 'Kanto', range: [1, 151], color: '#FF6B6B' },
  { id: 2, name: 'Johto', range: [152, 251], color: '#4ECDC4' },
  { id: 3, name: 'Hoenn', range: [252, 386], color: '#45B7D1' },
  { id: 4, name: 'Sinnoh', range: [387, 493], color: '#96CEB4' },
  { id: 5, name: 'Unova', range: [494, 649], color: '#FFEAA7' },
  { id: 6, name: 'Kalos', range: [650, 721], color: '#DDA0DD' },
  { id: 7, name: 'Alola', range: [722, 809], color: '#FFA07A' },
  { id: 8, name: 'Galar', range: [810, 905], color: '#98D8C8' },
  { id: 9, name: 'Paldea', range: [906, 1025], color: '#FFB6C1' }
];

const EnhancedPokemonList: React.FC = () => {
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGeneration, setSelectedGeneration] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'id' | 'name' | 'type'>('id');
  const [showShiny, setShowShiny] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const handleShinyToggle = (e: CustomEvent) => {
      setShowShiny(e.detail);
    };
    window.addEventListener('shinyToggle', handleShinyToggle as EventListener);
    return () => window.removeEventListener('shinyToggle', handleShinyToggle as EventListener);
  }, []);

  useEffect(() => {
    loadPokemon();
  }, [selectedGeneration]);

  const loadPokemon = async () => {
    setLoading(true);
    try {
      const gen = selectedGeneration ? GENERATIONS[selectedGeneration - 1] : null;
      const [start, end] = gen ? gen.range : [1, 151];
      
      const list = await fetchPokemonList(end - start + 1, start - 1);
      const detailedPokemon = await Promise.all(
        list.results.map(p => fetchPokemonDetails(p.url))
      );
      setPokemonList(detailedPokemon);
    } catch (error) {
      console.error('Error loading Pokemon:', error);
    }
    setLoading(false);
  };

  const filteredAndSortedPokemon = useMemo(() => {
    let filtered = pokemonList.filter(pokemon => {
      const matchesSearch = pokemon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           pokemon.id.toString().includes(searchTerm);
      const matchesType = selectedType === 'all' || 
                         pokemon.types.some(t => t.type.name === selectedType);
      return matchesSearch && matchesType;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'type':
          return a.types[0].type.name.localeCompare(b.types[0].type.name);
        default:
          return a.id - b.id;
      }
    });

    return filtered;
  }, [pokemonList, searchTerm, selectedType, sortBy]);

  const allTypes = useMemo(() => {
    const types = new Set<string>();
    pokemonList.forEach(p => p.types.forEach(t => types.add(t.type.name)));
    return Array.from(types).sort();
  }, [pokemonList]);

  return (
    <div className="enhanced-pokemon-list">
      {/* Hero Section */}
      <motion.div 
        className="hero-section"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="hero-title">
          Pokédex Explorer
          <span className="hero-subtitle">
            {selectedGeneration ? GENERATIONS[selectedGeneration - 1].name : 'All'} Region
          </span>
        </h1>
        <p className="hero-description">
          Discover and explore {filteredAndSortedPokemon.length} Pokémon
        </p>
      </motion.div>

      {/* Filters Section */}
      <motion.div 
        className="filters-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {/* Search Bar */}
        <div className="search-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="enhanced-search-bar"
            placeholder="Search by name or ID..."
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

        {/* Filter Controls */}
        <div className="filter-controls">
          <div className="filter-group">
            <label>Type</label>
            <select 
              value={selectedType} 
              onChange={(e) => setSelectedType(e.target.value)}
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
              onChange={(e) => setSortBy(e.target.value as 'id' | 'name' | 'type')}
              className="filter-select"
            >
              <option value="id">Number</option>
              <option value="name">Name</option>
              <option value="type">Type</option>
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

      {/* Generation Selector */}
      <motion.div 
        className="generation-selector-enhanced"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <button
          className={`gen-btn ${!selectedGeneration ? 'active' : ''}`}
          onClick={() => setSelectedGeneration(null)}
          style={{ background: !selectedGeneration ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '' }}
        >
          All Regions
        </button>
        {GENERATIONS.map((gen) => (
          <button
            key={gen.id}
            className={`gen-btn ${selectedGeneration === gen.id ? 'active' : ''}`}
            onClick={() => setSelectedGeneration(gen.id)}
            style={{ 
              background: selectedGeneration === gen.id ? gen.color : '',
              borderColor: gen.color
            }}
          >
            <span className="gen-name">{gen.name}</span>
            <span className="gen-range">#{gen.range[0]}-{gen.range[1]}</span>
          </button>
        ))}
      </motion.div>

      {/* Pokemon Grid/List */}
      {loading ? (
        <div className="loading-container-enhanced">
          <div className="loading-pokeball"></div>
          <p>Loading Pokémon...</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div 
            className={`pokemon-container ${viewMode}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {filteredAndSortedPokemon.map((pokemon, index) => (
              <motion.div
                key={pokemon.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.01 }}
              >
                <Link to={`/pokemon/${pokemon.id}`} className="pokemon-card-enhanced">
                  <div className="pokemon-number">#{String(pokemon.id).padStart(3, '0')}</div>
                  <div className="pokemon-image-container">
                    <img
                      src={showShiny ? pokemon.sprites.front_shiny : pokemon.sprites.front_default}
                      alt={pokemon.name}
                      className="pokemon-image"
                      loading="lazy"
                    />
                    {showShiny && <span className="shiny-indicator">✨</span>}
                  </div>
                  <h3 className="pokemon-name">{pokemon.name}</h3>
                  <div className="pokemon-types">
                    {pokemon.types.map((type) => (
                      <span
                        key={type.type.name}
                        className="type-badge-enhanced"
                        style={{ backgroundColor: TYPE_COLORS[type.type.name] }}
                      >
                        {type.type.name}
                      </span>
                    ))}
                  </div>
                  <div className="pokemon-stats-preview">
                    <div className="stat-preview">
                      <span className="stat-label">HP</span>
                      <span className="stat-value">{pokemon.stats[0].base_stat}</span>
                    </div>
                    <div className="stat-preview">
                      <span className="stat-label">ATK</span>
                      <span className="stat-value">{pokemon.stats[1].base_stat}</span>
                    </div>
                    <div className="stat-preview">
                      <span className="stat-label">DEF</span>
                      <span className="stat-value">{pokemon.stats[2].base_stat}</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      <style jsx>{`
        .enhanced-pokemon-list {
          padding: 2rem 0;
          min-height: 100vh;
        }

        .hero-section {
          text-align: center;
          padding: 3rem 2rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 24px;
          margin-bottom: 3rem;
          color: white;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }

        .hero-title {
          font-size: 3rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .hero-subtitle {
          font-size: 1.5rem;
          font-weight: 400;
          opacity: 0.9;
        }

        .hero-description {
          font-size: 1.2rem;
          opacity: 0.8;
          margin-top: 1rem;
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
          border-color: #667eea;
          background: white;
          box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
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
          border-color: #667eea;
        }

        .filter-select:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
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
          border-color: #667eea;
          background: #f8f9fa;
        }

        .view-btn.active {
          background: #667eea;
          color: white;
          border-color: #667eea;
        }

        .generation-selector-enhanced {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          justify-content: center;
          padding: 2rem;
          background: white;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
          margin-bottom: 3rem;
        }

        .gen-btn {
          padding: 1rem 1.5rem;
          border: 2px solid #e0e0e0;
          border-radius: 16px;
          background: white;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
        }

        .gen-btn:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
        }

        .gen-btn.active {
          color: white;
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
        }

        .gen-name {
          font-weight: 700;
          font-size: 1rem;
        }

        .gen-range {
          font-size: 0.8rem;
          opacity: 0.8;
        }

        .loading-container-enhanced {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          gap: 2rem;
        }

        .loading-pokeball {
          width: 80px;
          height: 80px;
          background: linear-gradient(180deg, #ff6b6b 50%, white 50%);
          border-radius: 50%;
          border: 4px solid #333;
          position: relative;
          animation: spin 1s linear infinite;
        }

        .loading-pokeball::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 20px;
          height: 20px;
          background: white;
          border: 3px solid #333;
          border-radius: 50%;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .pokemon-container {
          padding: 0 2rem;
        }

        .pokemon-container.grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 2rem;
        }

        .pokemon-container.list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .pokemon-card-enhanced {
          background: white;
          border-radius: 20px;
          padding: 1.5rem;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
          transition: all 0.3s;
          text-decoration: none;
          color: inherit;
          display: block;
          position: relative;
          overflow: hidden;
        }

        .pokemon-card-enhanced::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #667eea, #764ba2);
          transform: scaleX(0);
          transition: transform 0.3s;
        }

        .pokemon-card-enhanced:hover {
          transform: translateY(-8px);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.12);
        }

        .pokemon-card-enhanced:hover::before {
          transform: scaleX(1);
        }

        .pokemon-number {
          position: absolute;
          top: 1rem;
          right: 1rem;
          font-size: 0.9rem;
          font-weight: 700;
          color: #999;
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

        .type-badge-enhanced {
          padding: 0.4rem 1rem;
          border-radius: 12px;
          color: white;
          font-weight: 600;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        .pokemon-stats-preview {
          display: flex;
          justify-content: space-around;
          padding-top: 1rem;
          border-top: 1px solid #f0f0f0;
        }

        .stat-preview {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
        }

        .stat-label {
          font-size: 0.75rem;
          color: #666;
          font-weight: 600;
        }

        .stat-value {
          font-size: 1.1rem;
          font-weight: 700;
          color: #333;
        }

        .list .pokemon-card-enhanced {
          display: flex;
          align-items: center;
          gap: 2rem;
          padding: 1.5rem 2rem;
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

        .list .pokemon-stats-preview {
          border-top: none;
          border-left: 1px solid #f0f0f0;
          padding-left: 2rem;
          padding-top: 0;
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 2rem;
          }

          .hero-subtitle {
            font-size: 1.2rem;
          }

          .filter-controls {
            flex-direction: column;
            gap: 1rem;
          }

          .filter-group {
            width: 100%;
          }

          .pokemon-container.grid {
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
            gap: 1rem;
            padding: 0 1rem;
          }

          .generation-selector-enhanced {
            padding: 1rem;
          }

          .gen-btn {
            padding: 0.75rem 1rem;
            font-size: 0.9rem;
          }
        }
      `}</style>
    </div>
  );
};

export default EnhancedPokemonList;