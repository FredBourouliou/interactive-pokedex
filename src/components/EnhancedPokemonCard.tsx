import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Pokemon, getTypeColor, getAnimatedSprite } from '../services/pokemonService';

interface EnhancedPokemonCardProps {
  pokemon: Pokemon;
  showComparison?: boolean;
  onCompare?: (pokemon: Pokemon) => void;
}

const EnhancedPokemonCard = ({ pokemon, showComparison = false, onCompare }: EnhancedPokemonCardProps) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [showShiny, setShowShiny] = useState(false);
  const [isComparing, setIsComparing] = useState(false);

  useEffect(() => {
    // Check if this Pokemon is in favorites
    const favorites = JSON.parse(localStorage.getItem('favoritePokemon') || '[]');
    setIsFavorite(favorites.includes(pokemon.id));

    // Check shiny preference
    const shinyPref = localStorage.getItem('showShiny') === 'true';
    setShowShiny(shinyPref);

    // Listen for shiny toggle
    const handleShinyToggle = (e: any) => {
      setShowShiny(e.detail);
    };
    window.addEventListener('shinyToggle', handleShinyToggle);
    return () => window.removeEventListener('shinyToggle', handleShinyToggle);
  }, [pokemon.id]);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const favorites = JSON.parse(localStorage.getItem('favoritePokemon') || '[]');
    let newFavorites;
    
    if (isFavorite) {
      newFavorites = favorites.filter((id: number) => id !== pokemon.id);
    } else {
      newFavorites = [...favorites, pokemon.id];
    }
    
    localStorage.setItem('favoritePokemon', JSON.stringify(newFavorites));
    setIsFavorite(!isFavorite);
    
    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent('favoriteUpdated'));
  };

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsComparing(!isComparing);
    if (onCompare) {
      onCompare(pokemon);
    }
  };

  const animatedImageUrl = getAnimatedSprite(pokemon);
  const shinyImageUrl = pokemon.sprites.front_shiny || animatedImageUrl;
  const displayImageUrl = showShiny && shinyImageUrl ? shinyImageUrl : animatedImageUrl;

  return (
    <motion.div
      className="pokemon-card enhanced"
      data-testid="pokemon-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      whileHover={{ 
        y: -5,
        boxShadow: '0 10px 20px rgba(0, 0, 0, 0.15)' 
      }}
    >
      <div className="card-actions">
        <button 
          className={`favorite-btn ${isFavorite ? 'active' : ''}`}
          onClick={toggleFavorite}
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          {isFavorite ? '❤️' : '🤍'}
        </button>
        {showComparison && (
          <button 
            className={`compare-btn ${isComparing ? 'active' : ''}`}
            onClick={handleCompare}
            title="Compare this Pokémon"
          >
            ⚖️
          </button>
        )}
        {showShiny && (
          <span className="shiny-indicator" title="Shiny">✨</span>
        )}
      </div>

      <Link to={`/pokemon/${pokemon.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className="pokemon-id">#{pokemon.id.toString().padStart(3, '0')}</div>
        <div className="pokemon-image-container">
          <img
            src={displayImageUrl}
            alt={pokemon.name}
            className="pokemon-image animated"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = pokemon.sprites.front_default;
            }}
          />
        </div>
        <h3 className="pokemon-name">{pokemon.name}</h3>
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
      </Link>

      <style jsx>{`
        .pokemon-card.enhanced {
          position: relative;
        }
        .card-actions {
          position: absolute;
          top: 5px;
          right: 5px;
          display: flex;
          gap: 5px;
          z-index: 10;
        }
        .favorite-btn, .compare-btn {
          background: white;
          border: 2px solid #ddd;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          cursor: pointer;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .favorite-btn:hover, .compare-btn:hover {
          transform: scale(1.1);
          border-color: #1a73e8;
        }
        .favorite-btn.active {
          background: #ffe5e5;
          border-color: #ff4444;
        }
        .compare-btn.active {
          background: #e5f3ff;
          border-color: #1a73e8;
        }
        .shiny-indicator {
          position: absolute;
          top: 5px;
          left: 5px;
          font-size: 20px;
        }
      `}</style>
    </motion.div>
  );
};

export default EnhancedPokemonCard;