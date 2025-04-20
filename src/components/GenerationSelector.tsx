import { useState } from 'react';
import { GENERATIONS } from '../services/pokemonService';
import { motion } from 'framer-motion';

interface GenerationSelectorProps {
  onSelectGeneration: (generationId: number) => void;
  currentGeneration: number;
}

const GenerationSelector = ({ onSelectGeneration, currentGeneration }: GenerationSelectorProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleGenerationClick = (genId: number) => {
    onSelectGeneration(genId);
    setIsExpanded(false);
  };

  return (
    <div className="generation-selector">
      <motion.button 
        className="generation-current-btn"
        onClick={() => setIsExpanded(!isExpanded)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {GENERATIONS.find(gen => gen.id === currentGeneration)?.name || 'Select Generation'} 
        <span className="region-name">
          ({GENERATIONS.find(gen => gen.id === currentGeneration)?.region})
        </span>
        <span className={`arrow ${isExpanded ? 'up' : 'down'}`}>▼</span>
      </motion.button>

      {isExpanded && (
        <motion.div 
          className="generation-dropdown"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          {GENERATIONS.map((gen) => (
            <motion.button
              key={gen.id}
              className={`generation-option ${gen.id === currentGeneration ? 'active' : ''}`}
              onClick={() => handleGenerationClick(gen.id)}
              whileHover={{ 
                backgroundColor: gen.id === currentGeneration ? '' : 'rgba(26, 115, 232, 0.1)',
                x: 5
              }}
            >
              <span className="gen-name">{gen.name}</span>
              <span className="region-name">({gen.region})</span>
              <span className="pokemon-count">{gen.limit} Pokémon</span>
            </motion.button>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default GenerationSelector; 