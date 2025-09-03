import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Pokemon, getTypeColor, getAnimatedSprite } from '../services/pokemonService';
import EnhancedPokemonCard from './EnhancedPokemonCard';

const SimpleComparison: React.FC = () => {
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon[]>([]);
  const maxSelection = 6;

  const addToComparison = (pokemon: Pokemon) => {
    if (selectedPokemon.find(p => p.id === pokemon.id)) {
      // Remove if already selected
      setSelectedPokemon(selectedPokemon.filter(p => p.id !== pokemon.id));
    } else if (selectedPokemon.length < maxSelection) {
      // Add if not at max
      setSelectedPokemon([...selectedPokemon, pokemon]);
    }
  };

  const removeFromComparison = (pokemonId: number) => {
    setSelectedPokemon(selectedPokemon.filter(p => p.id !== pokemonId));
  };

  const clearComparison = () => {
    setSelectedPokemon([]);
  };

  const calculateTotal = (pokemon: Pokemon): number => {
    return pokemon.stats.reduce((sum, stat) => sum + stat.base_stat, 0);
  };

  return (
    <div className="comparison-container">
      <div className="comparison-header">
        <h2>Pokémon Comparison</h2>
        <div className="comparison-actions">
          <span className="selection-count">
            {selectedPokemon.length} / {maxSelection} selected
          </span>
          <button 
            onClick={clearComparison} 
            disabled={selectedPokemon.length === 0}
            className="clear-btn"
          >
            Clear All
          </button>
        </div>
      </div>

      {selectedPokemon.length === 0 ? (
        <div className="empty-comparison">
          <h3>No Pokémon selected for comparison</h3>
          <p>Go back to the Pokédex and click the ⚖️ button on Pokémon cards to add them here.</p>
        </div>
      ) : (
        <div className="comparison-content">
          <div className="pokemon-comparison-grid">
            {selectedPokemon.map((pokemon) => (
              <motion.div
                key={pokemon.id}
                className="comparison-card"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <button 
                  className="remove-btn"
                  onClick={() => removeFromComparison(pokemon.id)}
                >
                  ✕
                </button>
                <img 
                  src={getAnimatedSprite(pokemon)} 
                  alt={pokemon.name}
                  className="pokemon-image"
                />
                <h3>{pokemon.name}</h3>
                <div className="pokemon-types">
                  {pokemon.types.map((type) => (
                    <span
                      key={type.type.name}
                      className="type-badge"
                      style={{ backgroundColor: getTypeColor(type.type.name) }}
                    >
                      {type.type.name}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="stats-comparison">
            <h3>Stats Comparison</h3>
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Stat</th>
                  {selectedPokemon.map(p => (
                    <th key={p.id}>{p.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {['HP', 'Attack', 'Defense', 'Sp. Attack', 'Sp. Defense', 'Speed'].map((statName, index) => (
                  <tr key={statName}>
                    <td className="stat-name">{statName}</td>
                    {selectedPokemon.map(pokemon => {
                      const value = pokemon.stats[index].base_stat;
                      const maxValue = Math.max(...selectedPokemon.map(p => p.stats[index].base_stat));
                      const isMax = value === maxValue;
                      return (
                        <td key={pokemon.id} className={isMax ? 'stat-value max' : 'stat-value'}>
                          {value}
                          <div className="stat-bar">
                            <div 
                              className="stat-fill"
                              style={{ 
                                width: `${(value / 255) * 100}%`,
                                backgroundColor: isMax ? '#4caf50' : '#1a73e8'
                              }}
                            />
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
                <tr className="total-row">
                  <td className="stat-name"><strong>Total</strong></td>
                  {selectedPokemon.map(pokemon => {
                    const total = calculateTotal(pokemon);
                    const maxTotal = Math.max(...selectedPokemon.map(p => calculateTotal(p)));
                    const isMax = total === maxTotal;
                    return (
                      <td key={pokemon.id} className={isMax ? 'stat-value max' : 'stat-value'}>
                        <strong>{total}</strong>
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>

          <div className="physical-comparison">
            <h3>Physical Attributes</h3>
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Attribute</th>
                  {selectedPokemon.map(p => (
                    <th key={p.id}>{p.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Height</td>
                  {selectedPokemon.map(p => (
                    <td key={p.id}>{(p.height / 10).toFixed(1)} m</td>
                  ))}
                </tr>
                <tr>
                  <td>Weight</td>
                  {selectedPokemon.map(p => (
                    <td key={p.id}>{(p.weight / 10).toFixed(1)} kg</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      <style jsx>{`
        .comparison-container {
          padding: 20px;
        }
        .comparison-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }
        .comparison-header h2 {
          font-size: 28px;
          color: #333;
        }
        .comparison-actions {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .selection-count {
          color: #666;
          font-weight: 500;
        }
        .clear-btn {
          padding: 8px 16px;
          background: #f44336;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
        }
        .clear-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
        .empty-comparison {
          text-align: center;
          padding: 60px 20px;
          color: #666;
        }
        .pokemon-comparison-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }
        .comparison-card {
          background: white;
          border-radius: 12px;
          padding: 15px;
          text-align: center;
          position: relative;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .comparison-card .remove-btn {
          position: absolute;
          top: 5px;
          right: 5px;
          background: #f44336;
          color: white;
          border: none;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          cursor: pointer;
        }
        .comparison-card .pokemon-image {
          width: 80px;
          height: 80px;
          object-fit: contain;
        }
        .comparison-card h3 {
          margin: 10px 0;
          text-transform: capitalize;
        }
        .stats-comparison, .physical-comparison {
          background: white;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 20px;
        }
        .comparison-table {
          width: 100%;
          border-collapse: collapse;
        }
        .comparison-table th,
        .comparison-table td {
          padding: 12px;
          text-align: center;
          border-bottom: 1px solid #eee;
        }
        .comparison-table th {
          background: #f5f5f5;
          font-weight: 600;
          text-transform: capitalize;
        }
        .stat-name {
          text-align: left !important;
          font-weight: 500;
        }
        .stat-value {
          position: relative;
        }
        .stat-value.max {
          color: #4caf50;
          font-weight: bold;
        }
        .stat-bar {
          position: relative;
          height: 4px;
          background: #eee;
          border-radius: 2px;
          margin-top: 4px;
          overflow: hidden;
        }
        .stat-fill {
          position: absolute;
          height: 100%;
          left: 0;
          top: 0;
          transition: width 0.3s;
        }
        .total-row {
          background: #f9f9f9;
        }
        .total-row td {
          font-weight: bold;
          border-top: 2px solid #ddd;
        }
        .pokemon-types {
          display: flex;
          gap: 5px;
          justify-content: center;
          margin-top: 10px;
        }
        .type-badge {
          padding: 4px 8px;
          border-radius: 4px;
          color: white;
          font-size: 12px;
        }
      `}</style>
    </div>
  );
};

export default SimpleComparison;