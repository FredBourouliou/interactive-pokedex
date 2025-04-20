import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Pokemon, getTypeColor, getAnimatedSprite } from '../services/pokemonService'

interface PokemonCardProps {
  pokemon: Pokemon
}

const PokemonCard = ({ pokemon }: PokemonCardProps) => {
  // Utiliser le GIF animé plutôt que l'image statique
  const animatedImageUrl = getAnimatedSprite(pokemon);
  const staticImageUrl = pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default;

  return (
    <motion.div
      className="pokemon-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      whileHover={{ 
        y: -5,
        boxShadow: '0 10px 20px rgba(0, 0, 0, 0.15)' 
      }}
    >
      <Link to={`/pokemon/${pokemon.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className="pokemon-id">#{pokemon.id.toString().padStart(3, '0')}</div>
        <div className="pokemon-image-container">
          <img
            src={animatedImageUrl}
            alt={pokemon.name}
            className="pokemon-image animated"
            onError={(e) => {
              // Fallback à l'image statique si le GIF ne charge pas
              (e.target as HTMLImageElement).src = staticImageUrl;
              (e.target as HTMLImageElement).classList.remove('animated');
            }}
          />
        </div>
        <div className="pokemon-info">
          <h2 className="pokemon-name">{pokemon.name}</h2>
          <div className="pokemon-types">
            {pokemon.types.map((typeInfo, index) => (
              <motion.div
                key={index}
                className="pokemon-type"
                style={{ backgroundColor: getTypeColor(typeInfo.type.name) }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ 
                  scale: 1.1,
                  transition: { duration: 0.2 }
                }}
              >
                {typeInfo.type.name}
              </motion.div>
            ))}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export default PokemonCard 