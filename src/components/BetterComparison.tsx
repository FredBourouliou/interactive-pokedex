import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pokemon, getTypeColor, getAnimatedSprite, getPokemonDetails, getPokemonList } from '../services/pokemonService';

const BetterComparison: React.FC = () => {
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon[]>([]);
  const [availablePokemon, setAvailablePokemon] = useState<Pokemon[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSelector, setShowSelector] = useState(false);
  const maxSelection = 6;

  useEffect(() => {
    loadPokemonList();
  }, []);

  const loadPokemonList = async () => {
    setLoading(true);
    try {
      const list = await getPokemonList(151, 0); // Load Gen 1 for demo
      const details = await Promise.all(
        list.slice(0, 20).map(p => getPokemonDetails(p.id))
      );
      setAvailablePokemon(details);
    } catch (error) {
      console.error('Error loading Pokémon:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToComparison = (pokemon: Pokemon) => {
    if (!selectedPokemon.find(p => p.id === pokemon.id) && selectedPokemon.length < maxSelection) {
      setSelectedPokemon([...selectedPokemon, pokemon]);
      setShowSelector(false);
      setSearchTerm('');
    }
  };

  const removeFromComparison = (pokemonId: number) => {
    setSelectedPokemon(selectedPokemon.filter(p => p.id !== pokemonId));
  };

  const calculateTotal = (pokemon: Pokemon): number => {
    return pokemon.stats.reduce((sum, stat) => sum + stat.base_stat, 0);
  };

  const getStatColor = (value: number, max: number): string => {
    const percentage = (value / max) * 100;
    if (percentage >= 80) return '#4caf50';
    if (percentage >= 60) return '#2196f3';
    if (percentage >= 40) return '#ff9800';
    return '#f44336';
  };

  return (
    <div className="better-comparison">
      <div className="comparison-hero">
        <motion.h1 
          className="comparison-title"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Pokémon Comparison Tool
        </motion.h1>
        <motion.p 
          className="comparison-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Compare stats, types, and abilities of up to 6 Pokémon
        </motion.p>
      </div>

      <div className="comparison-toolbar">
        <div className="toolbar-left">
          <span className="selection-indicator">
            <span className="selection-count">{selectedPokemon.length}</span>
            <span className="selection-max">/ {maxSelection}</span>
            <span className="selection-label">Pokémon selected</span>
          </span>
        </div>
        <div className="toolbar-right">
          <motion.button 
            className="add-pokemon-btn"
            onClick={() => setShowSelector(true)}
            disabled={selectedPokemon.length >= maxSelection}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="btn-icon">➕</span>
            Add Pokémon
          </motion.button>
          <motion.button 
            className="clear-all-btn"
            onClick={() => setSelectedPokemon([])}
            disabled={selectedPokemon.length === 0}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="btn-icon">🗑️</span>
            Clear All
          </motion.button>
        </div>
      </div>

      {selectedPokemon.length === 0 ? (
        <motion.div 
          className="empty-state"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="empty-icon">⚖️</div>
          <h3>Start Comparing Pokémon</h3>
          <p>Click "Add Pokémon" to select Pokémon for comparison</p>
        </motion.div>
      ) : (
        <div className="comparison-grid">
          <AnimatePresence>
            {selectedPokemon.map((pokemon, index) => (
              <motion.div
                key={pokemon.id}
                className="comparison-pokemon-card"
                initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.8, rotate: 10 }}
                transition={{ delay: index * 0.1 }}
              >
                <button 
                  className="remove-pokemon-btn"
                  onClick={() => removeFromComparison(pokemon.id)}
                >
                  ✕
                </button>
                <div className="pokemon-header">
                  <img 
                    src={getAnimatedSprite(pokemon)} 
                    alt={pokemon.name}
                    className="pokemon-sprite"
                  />
                  <h3 className="pokemon-name">{pokemon.name}</h3>
                  <div className="pokemon-number">#{pokemon.id.toString().padStart(3, '0')}</div>
                </div>
                <div className="pokemon-types">
                  {pokemon.types.map((type) => (
                    <span
                      key={type.type.name}
                      className="type-chip"
                      style={{ background: getTypeColor(type.type.name) }}
                    >
                      {type.type.name}
                    </span>
                  ))}
                </div>
                <div className="pokemon-stats">
                  {pokemon.stats.map((stat, statIndex) => (
                    <div key={stat.stat.name} className="stat-row">
                      <span className="stat-label">
                        {stat.stat.name.replace('-', ' ')}
                      </span>
                      <span className="stat-value">{stat.base_stat}</span>
                      <div className="stat-bar-container">
                        <motion.div 
                          className="stat-bar-fill"
                          initial={{ width: 0 }}
                          animate={{ width: `${(stat.base_stat / 255) * 100}%` }}
                          transition={{ delay: 0.3 + (statIndex * 0.1) }}
                          style={{ 
                            background: getStatColor(stat.base_stat, 255)
                          }}
                        />
                      </div>
                    </div>
                  ))}
                  <div className="stat-row total">
                    <span className="stat-label">Total</span>
                    <span className="stat-value">{calculateTotal(pokemon)}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Pokemon Selector Modal */}
      <AnimatePresence>
        {showSelector && (
          <motion.div 
            className="selector-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSelector(false)}
          >
            <motion.div 
              className="selector-modal"
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3>Select Pokémon</h3>
              <input 
                type="text"
                placeholder="Search Pokémon..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="selector-search"
              />
              <div className="selector-grid">
                {availablePokemon
                  .filter(p => p.name.includes(searchTerm.toLowerCase()))
                  .map((pokemon) => (
                    <motion.div
                      key={pokemon.id}
                      className="selector-pokemon"
                      onClick={() => addToComparison(pokemon)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <img src={pokemon.sprites.front_default} alt={pokemon.name} />
                      <span>{pokemon.name}</span>
                    </motion.div>
                  ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .better-comparison {
          padding: 2rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        .comparison-hero {
          text-align: center;
          margin-bottom: 3rem;
          padding: 3rem 2rem;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
          border-radius: 24px;
        }

        .comparison-title {
          font-size: 3rem;
          font-weight: 800;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 1rem;
        }

        .comparison-subtitle {
          font-size: 1.2rem;
          color: #666;
        }

        .comparison-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding: 1.5rem;
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .toolbar-left {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .selection-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
          border-radius: 12px;
        }

        .selection-count {
          font-size: 2rem;
          font-weight: bold;
          color: #667eea;
        }

        .selection-max {
          font-size: 1.5rem;
          color: #999;
        }

        .selection-label {
          margin-left: 0.5rem;
          color: #666;
        }

        .toolbar-right {
          display: flex;
          gap: 1rem;
        }

        .add-pokemon-btn,
        .clear-all-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .add-pokemon-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .add-pokemon-btn:hover:not(:disabled) {
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
        }

        .add-pokemon-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .clear-all-btn {
          background: #f44336;
          color: white;
        }

        .clear-all-btn:hover:not(:disabled) {
          box-shadow: 0 6px 20px rgba(244, 67, 54, 0.3);
        }

        .clear-all-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-icon {
          font-size: 1.2rem;
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          background: white;
          border-radius: 24px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
        }

        .empty-icon {
          font-size: 5rem;
          margin-bottom: 1rem;
        }

        .empty-state h3 {
          font-size: 1.8rem;
          color: #333;
          margin-bottom: 0.5rem;
        }

        .empty-state p {
          color: #666;
          font-size: 1.1rem;
        }

        .comparison-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }

        .comparison-pokemon-card {
          background: white;
          border-radius: 20px;
          padding: 2rem;
          position: relative;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
          transition: all 0.3s;
        }

        .comparison-pokemon-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
        }

        .remove-pokemon-btn {
          position: absolute;
          top: 1rem;
          right: 1rem;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #f44336;
          color: white;
          border: none;
          cursor: pointer;
          font-size: 1.2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .remove-pokemon-btn:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(244, 67, 54, 0.3);
        }

        .pokemon-header {
          text-align: center;
          margin-bottom: 1.5rem;
        }

        .pokemon-sprite {
          width: 100px;
          height: 100px;
          object-fit: contain;
          margin-bottom: 0.5rem;
        }

        .pokemon-name {
          font-size: 1.4rem;
          font-weight: 700;
          text-transform: capitalize;
          color: #333;
          margin: 0.5rem 0;
        }

        .pokemon-number {
          color: #999;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .pokemon-types {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }

        .type-chip {
          padding: 0.4rem 0.8rem;
          border-radius: 8px;
          color: white;
          font-size: 0.85rem;
          font-weight: 600;
          text-transform: uppercase;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .pokemon-stats {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .stat-row {
          display: grid;
          grid-template-columns: 80px 40px 1fr;
          align-items: center;
          gap: 0.75rem;
        }

        .stat-row.total {
          margin-top: 0.75rem;
          padding-top: 0.75rem;
          border-top: 2px solid #f0f0f0;
          font-weight: bold;
        }

        .stat-label {
          font-size: 0.85rem;
          color: #666;
          text-transform: capitalize;
        }

        .stat-value {
          font-weight: 600;
          color: #333;
          text-align: right;
        }

        .stat-bar-container {
          height: 8px;
          background: #f0f0f0;
          border-radius: 4px;
          overflow: hidden;
        }

        .stat-bar-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.5s ease;
        }

        .selector-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
        }

        .selector-modal {
          background: white;
          border-radius: 24px;
          padding: 2rem;
          width: 90%;
          max-width: 600px;
          max-height: 80vh;
          overflow-y: auto;
        }

        .selector-modal h3 {
          margin-bottom: 1rem;
          font-size: 1.5rem;
          color: #333;
        }

        .selector-search {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          margin-bottom: 1rem;
          font-size: 1rem;
        }

        .selector-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
          gap: 1rem;
        }

        .selector-pokemon {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0.5rem;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .selector-pokemon:hover {
          background: #f5f5f5;
        }

        .selector-pokemon img {
          width: 60px;
          height: 60px;
        }

        .selector-pokemon span {
          font-size: 0.8rem;
          text-transform: capitalize;
          margin-top: 0.25rem;
        }

        @media (max-width: 768px) {
          .comparison-title {
            font-size: 2rem;
          }

          .comparison-toolbar {
            flex-direction: column;
            gap: 1rem;
          }

          .comparison-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default BetterComparison;