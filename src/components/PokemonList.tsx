import { useState, useEffect } from 'react'
import { getPokemonByGeneration, getPokemonDetails, GENERATIONS, Pokemon } from '../services/pokemonService'
import PokemonCard from './PokemonCard'
import SearchBar from './SearchBar'
import Loading from './Loading'
import GenerationSelector from './GenerationSelector'
import { motion, AnimatePresence } from 'framer-motion'

const PokemonList = () => {
  const [pokemon, setPokemon] = useState<Pokemon[]>([])
  const [filteredPokemon, setFilteredPokemon] = useState<Pokemon[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [currentGeneration, setCurrentGeneration] = useState<number>(1)
  const [searchTerm, setSearchTerm] = useState<string>('')

  useEffect(() => {
    const fetchPokemon = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Récupérer les Pokémon de la génération sélectionnée
        const pokemonList = await getPokemonByGeneration(currentGeneration)
        
        // Fetch details for each Pokémon
        const pokemonData = await Promise.all(
          pokemonList.map(async (pokemon) => {
            return await getPokemonDetails(pokemon.id)
          })
        )
        
        setPokemon(pokemonData)
        setFilteredPokemon(pokemonData)
      } catch (err) {
        setError(`Failed to fetch Generation ${currentGeneration} Pokémon data. Please try again later.`)
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchPokemon()
  }, [currentGeneration])

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    
    if (!term.trim()) {
      setFilteredPokemon(pokemon)
      return
    }

    const filtered = pokemon.filter(p => 
      p.name.toLowerCase().includes(term.toLowerCase()) || 
      p.id.toString() === term
    )
    
    setFilteredPokemon(filtered)
  }

  const handleGenerationChange = (genId: number) => {
    setCurrentGeneration(genId)
    setSearchTerm('')
  }

  if (loading) return <Loading />

  if (error) return <div className="error-message">{error}</div>

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  }

  const currentGenInfo = GENERATIONS.find(gen => gen.id === currentGeneration);

  return (
    <div>
      <motion.div
        key={`header-${currentGeneration}`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="generation-header"
      >
        <h2 className="generation-title">
          {currentGenInfo?.name} - {currentGenInfo?.region} Region
          <span className="pokemon-count-badge">
            {currentGenInfo?.limit} Pokémon
          </span>
        </h2>
      </motion.div>

      <GenerationSelector 
        onSelectGeneration={handleGenerationChange} 
        currentGeneration={currentGeneration} 
      />

      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <SearchBar onSearch={handleSearch} initialValue={searchTerm} />
      </motion.div>
      
      <motion.div
        key={`grid-${currentGeneration}-${searchTerm}`}
        className="pokemon-grid"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <AnimatePresence mode="wait">
          {filteredPokemon.length > 0 ? (
            filteredPokemon.map((pokemon, index) => (
              <motion.div
                key={pokemon.id}
                variants={item}
                layoutId={`pokemon-${pokemon.id}`}
              >
                <PokemonCard pokemon={pokemon} />
              </motion.div>
            ))
          ) : (
            <motion.div 
              className="error-message"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              No Pokémon found matching your search.
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

export default PokemonList 