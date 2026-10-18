import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Pokemon } from '../types/pokemon';
import { fetchPokemonById, fetchPokemonIndex, fetchTypeMembers, spriteUrl, PokemonIndexEntry } from '../services/api';
import { TYPE_COLORS } from '../constants/typeColors';
import { GENERATIONS, MAX_POKEMON_ID } from '../constants/generations';

/** Cards rendered per page; details are only fetched for rendered cards. */
const PAGE_SIZE = 48;
/** Concurrent detail requests per batch. */
const DETAIL_BATCH = 16;
const ALL_TYPES = Object.keys(TYPE_COLORS).sort();

const EnhancedPokemonList: React.FC = () => {
  const [index, setIndex] = useState<PokemonIndexEntry[]>([]);
  const [details, setDetails] = useState<Record<number, Pokemon>>({});
  const [typeMembers, setTypeMembers] = useState<Record<string, Map<number, number>>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGeneration, setSelectedGeneration] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'id' | 'name' | 'type'>('id');
  const [showShiny, setShowShiny] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const indexCache = useRef(new Map<number, PokemonIndexEntry[]>());
  const requestedDetails = useRef(new Set<number>());
  const requestedTypes = useRef(new Set<string>());

  useEffect(() => {
    const handleShinyToggle = (e: CustomEvent) => {
      setShowShiny(e.detail);
    };
    window.addEventListener('shinyToggle', handleShinyToggle as EventListener);
    return () => window.removeEventListener('shinyToggle', handleShinyToggle as EventListener);
  }, []);

  // Lightweight index (id + name) of the selected region, or of every generation for "All Regions".
  useEffect(() => {
    let cancelled = false;
    const key = selectedGeneration ?? 0;
    const cached = indexCache.current.get(key);
    setError(null);
    if (cached) {
      setIndex(cached);
      setLoading(false);
      return;
    }
    setLoading(true);
    const [start, end] = selectedGeneration ? GENERATIONS[selectedGeneration - 1].range : [1, MAX_POKEMON_ID];
    fetchPokemonIndex(end - start + 1, start - 1)
      .then((list) => {
        indexCache.current.set(key, list);
        if (!cancelled) setIndex(list);
      })
      .catch((err) => {
        console.error('Error loading Pokemon:', err);
        if (!cancelled) setError('Failed to load the Pokémon list. Please try again later.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedGeneration]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [selectedGeneration, searchTerm, selectedType, sortBy]);

  // Type data comes from /type/{name} (one request per type) so filtering and sorting
  // by type work on the whole index without fetching every Pokémon's details.
  const neededTypes = useMemo(
    () => (sortBy === 'type' ? ALL_TYPES : selectedType !== 'all' ? [selectedType] : []),
    [sortBy, selectedType],
  );

  useEffect(() => {
    for (const type of neededTypes) {
      if (requestedTypes.current.has(type)) continue;
      requestedTypes.current.add(type);
      fetchTypeMembers(type)
        .then((members) => setTypeMembers((prev) => ({ ...prev, [type]: members })))
        .catch((err) => {
          console.error(`Error loading type ${type}:`, err);
          requestedTypes.current.delete(type);
          setError('Failed to load type data. Please try again later.');
        });
    }
  }, [neededTypes]);

  const typesReady = neededTypes.every((type) => typeMembers[type]);

  const filteredAndSortedPokemon = useMemo(() => {
    if (!typesReady) return [];
    const term = searchTerm.trim().toLowerCase();
    const members = selectedType === 'all' ? null : typeMembers[selectedType];
    const filtered = index.filter(
      (p) => (p.name.includes(term) || p.id.toString().includes(term)) && (!members || members.has(p.id)),
    );

    if (sortBy === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'type') {
      const primaryType = new Map<number, string>();
      for (const type of ALL_TYPES) {
        typeMembers[type]?.forEach((slot, id) => {
          if (slot === 1) primaryType.set(id, type);
        });
      }
      filtered.sort(
        (a, b) => (primaryType.get(a.id) ?? '').localeCompare(primaryType.get(b.id) ?? '') || a.id - b.id,
      );
    } else {
      filtered.sort((a, b) => a.id - b.id);
    }
    return filtered;
  }, [index, searchTerm, selectedType, sortBy, typeMembers, typesReady]);

  const visiblePokemon = useMemo(
    () => filteredAndSortedPokemon.slice(0, visibleCount),
    [filteredAndSortedPokemon, visibleCount],
  );

  // Details (types, stats) only for the cards on screen, in small batches, cached across filters.
  useEffect(() => {
    const missing = visiblePokemon.filter((p) => !requestedDetails.current.has(p.id));
    if (missing.length === 0) return;
    missing.forEach((p) => requestedDetails.current.add(p.id));

    (async () => {
      for (let i = 0; i < missing.length; i += DETAIL_BATCH) {
        const batch = missing.slice(i, i + DETAIL_BATCH);
        const results = await Promise.allSettled(batch.map((p) => fetchPokemonById(p.id)));
        const loaded: Record<number, Pokemon> = {};
        results.forEach((result, j) => {
          if (result.status === 'fulfilled') loaded[batch[j].id] = result.value;
          else requestedDetails.current.delete(batch[j].id);
        });
        setDetails((prev) => ({ ...prev, ...loaded }));
      }
    })();
  }, [visiblePokemon]);

  const busy = loading || !typesReady;
  const remaining = filteredAndSortedPokemon.length - visiblePokemon.length;

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
            {selectedGeneration ? `${GENERATIONS[selectedGeneration - 1].region} Region` : 'All Regions'}
          </span>
        </h1>
        <p className="hero-description">
          {busy ? 'Loading Pokémon...' : `Discover and explore ${filteredAndSortedPokemon.length} Pokémon`}
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
              {ALL_TYPES.map(type => (
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
            <span className="gen-name">{gen.region}</span>
            <span className="gen-range">#{gen.range[0]}-{gen.range[1]}</span>
          </button>
        ))}
      </motion.div>

      {/* Pokemon Grid/List */}
      {error ? (
        <div className="error-message">{error}</div>
      ) : busy ? (
        <div className="loading-container-enhanced">
          <div className="loading-pokeball"></div>
          <p>Loading Pokémon...</p>
        </div>
      ) : (
        <>
          <AnimatePresence mode="wait">
            <motion.div 
              className={`pokemon-container ${viewMode}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {visiblePokemon.map((entry, index) => {
                const pokemon = details[entry.id];
                const sprite = (showShiny ? pokemon?.sprites.front_shiny : pokemon?.sprites.front_default)
                  || spriteUrl(entry.id, showShiny);
                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: (index % PAGE_SIZE) * 0.01 }}
                  >
                    <Link to={`/pokemon/${entry.id}`} className="pokemon-card-enhanced">
                      <div className="pokemon-number">#{String(entry.id).padStart(3, '0')}</div>
                      <div className="pokemon-image-container">
                        <img
                          src={sprite}
                          alt={entry.name}
                          className="pokemon-image"
                          loading="lazy"
                        />
                        {showShiny && <span className="shiny-indicator">✨</span>}
                      </div>
                      <h3 className="pokemon-name">{entry.name}</h3>
                      <div className="pokemon-types">
                        {pokemon ? (
                          pokemon.types.map((type) => (
                            <span
                              key={type.type.name}
                              className="type-badge-enhanced"
                              style={{ backgroundColor: TYPE_COLORS[type.type.name] }}
                            >
                              {type.type.name}
                            </span>
                          ))
                        ) : (
                          <span className="type-badge-enhanced type-badge-placeholder" aria-hidden="true">
                            &nbsp;
                          </span>
                        )}
                      </div>
                      <div className="pokemon-stats-preview">
                        {(['HP', 'ATK', 'DEF'] as const).map((label, i) => (
                          <div className="stat-preview" key={label}>
                            <span className="stat-label">{label}</span>
                            <span className="stat-value">{pokemon ? pokemon.stats[i].base_stat : '–'}</span>
                          </div>
                        ))}
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>

          {remaining > 0 && (
            <div className="load-more-wrapper">
              <p className="load-more-status">
                Showing {visiblePokemon.length} of {filteredAndSortedPokemon.length}
              </p>
              <button className="load-more-btn" onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}>
                Load {Math.min(PAGE_SIZE, remaining)} more
              </button>
            </div>
          )}
        </>
      )}

      <style>{`
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

        .type-badge-placeholder {
          min-width: 4.5rem;
          background: #e9ecef;
          box-shadow: none;
        }

        .load-more-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          margin-top: 3rem;
        }

        .load-more-status {
          color: #666;
          font-weight: 600;
        }

        .load-more-btn {
          padding: 1rem 2.5rem;
          border: none;
          border-radius: 16px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          font-size: 1.1rem;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .load-more-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.35);
        }

        .load-more-btn:focus-visible {
          outline: 3px solid #764ba2;
          outline-offset: 3px;
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