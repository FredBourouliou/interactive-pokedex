import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getPokemonDetails, getPokemonSpecies, getTypeColor, getAnimatedSprite, GENERATIONS, Pokemon, PokemonSpecies } from '../services/pokemonService'
import Loading from './Loading'
import StatsChart from './StatsChart'
import { motion, AnimatePresence } from 'framer-motion'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

interface RouteParams {
  id: string
  [key: string]: string
}

const PokemonDetail = () => {
  const { id } = useParams<RouteParams>()
  const navigate = useNavigate()
  const [pokemon, setPokemon] = useState<Pokemon | null>(null)
  const [species, setSpecies] = useState<PokemonSpecies | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [useAnimated, setUseAnimated] = useState<boolean>(true)

  useEffect(() => {
    const fetchPokemonData = async () => {
      try {
        setLoading(true)
        const pokemonData = await getPokemonDetails(id as string)
        setPokemon(pokemonData)

        const speciesData = await getPokemonSpecies(id as string)
        setSpecies(speciesData)
      } catch (err) {
        setError('Failed to fetch Pokémon data. Please try again later.')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchPokemonData()
  }, [id])

  if (loading) return <Loading />
  if (error) return <div className="error-message">{error}</div>
  if (!pokemon) return <div className="error-message">Pokémon not found</div>

  const getEnglishFlavorText = () => {
    if (!species) return 'No description available.'
    
    const englishEntry = species.flavor_text_entries.find(
      entry => entry.language.name === 'en'
    )
    
    return englishEntry 
      ? englishEntry.flavor_text.replace(/\\f|\\n/g, ' ') 
      : 'No description available.'
  }

  const getEnglishGenus = () => {
    if (!species) return ''
    
    const englishGenus = species.genera.find(
      g => g.language.name === 'en'
    )
    
    return englishGenus ? englishGenus.genus : ''
  }

  const getGenerationInfo = () => {
    if (!species) return null;
    
    const genName = species.generation.name; // format: "generation-i"
    const genId = parseInt(genName.split('-')[1].replace('i', '1').replace('v', '5').replace('x', '10'), 10);
    
    return GENERATIONS.find(gen => gen.id === genId);
  }

  const generationInfo = getGenerationInfo();

  const stats = pokemon.stats.map(stat => ({
    name: stat.stat.name,
    value: stat.base_stat
  }))

  // Data for type distribution pie chart
  const typeData = pokemon.types.map(typeInfo => ({
    name: typeInfo.type.name,
    value: 1
  }))

  // Animation variants for content
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  }

  const animatedImageUrl = getAnimatedSprite(pokemon);
  const staticImageUrl = pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default;

  const handleImageError = () => {
    setUseAnimated(false);
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="pokemon-detail"
    >
      <div 
        className="detail-header"
        style={{
          background: pokemon.types.length > 1
            ? `linear-gradient(90deg, ${getTypeColor(pokemon.types[0].type.name)}, ${getTypeColor(pokemon.types[1].type.name)})`
            : getTypeColor(pokemon.types[0].type.name)
        }}
      >
        <motion.button 
          className="back-button" 
          onClick={() => navigate(-1)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          ←
        </motion.button>
        <motion.h1 
          className="detail-name"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {pokemon.name}
        </motion.h1>
        <motion.div 
          className="detail-id"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          #{pokemon.id.toString().padStart(3, '0')}
        </motion.div>
        <div className="pokemon-types">
          <AnimatePresence>
            {pokemon.types.map((typeInfo, index) => (
              <motion.div
                key={index}
                className="pokemon-type"
                style={{ 
                  backgroundColor: getTypeColor(typeInfo.type.name),
                  fontSize: '1rem',
                  padding: '0.3rem 1rem'
                }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.4 + (index * 0.1) }}
                whileHover={{ scale: 1.1 }}
              >
                {typeInfo.type.name}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        {generationInfo && (
          <motion.div
            className="generation-badge"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.6 }}
          >
            {generationInfo.name} ({generationInfo.region})
          </motion.div>
        )}
      </div>

      <div className="detail-image-container">
        <img
          src={useAnimated ? animatedImageUrl : staticImageUrl}
          alt={pokemon.name}
          className={`detail-image ${useAnimated ? 'animated' : ''}`}
          onError={handleImageError}
        />
      </div>

      <div className="detail-content">
        <motion.div 
          className="detail-section"
          variants={itemVariants}
        >
          <h3 className="detail-section-title">Description</h3>
          <p>{getEnglishFlavorText()}</p>
          {getEnglishGenus() && <p><i>{getEnglishGenus()}</i></p>}
        </motion.div>

        <div className="detail-info">
          <motion.div 
            className="detail-section"
            variants={itemVariants}
          >
            <h3 className="detail-section-title">Details</h3>
            <div className="detail-property">
              <span className="property-label">Height:</span>
              <span>{(pokemon.height / 10).toFixed(1)} m</span>
            </div>
            <div className="detail-property">
              <span className="property-label">Weight:</span>
              <span>{(pokemon.weight / 10).toFixed(1)} kg</span>
            </div>
            <div className="detail-property">
              <span className="property-label">Abilities:</span>
              <span>
                {pokemon.abilities.map((ability, index) => (
                  <span key={index}>
                    {index > 0 && ', '}
                    {ability.ability.name.replace('-', ' ')}
                  </span>
                ))}
              </span>
            </div>
            {generationInfo && (
              <div className="detail-property">
                <span className="property-label">Generation:</span>
                <span>
                  {generationInfo.name} - {generationInfo.region}
                </span>
              </div>
            )}
          </motion.div>

          <motion.div 
            className="detail-section"
            variants={itemVariants}
          >
            <h3 className="detail-section-title">Type Distribution</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={typeData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label={({ name }) => name}
                  labelLine={false}
                  animationDuration={1000}
                  animationBegin={200}
                >
                  {typeData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={getTypeColor(entry.name)} 
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [name, '']} />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        <StatsChart stats={stats} />
      </div>
    </motion.div>
  )
}

export default PokemonDetail 