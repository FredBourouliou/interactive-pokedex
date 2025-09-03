import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PokemonCard from './PokemonCard';
import { getPokemonDetails } from '../services/pokemonService';
import type { Pokemon } from '../services/pokemonService';
import Loading from './Loading';

const Favorites: React.FC = () => {
  const [favorites, setFavorites] = useState<number[]>([]);
  const [favoritePokemon, setFavoritePokemon] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load favorites from localStorage
    const savedFavorites = JSON.parse(localStorage.getItem('favoritePokemon') || '[]');
    setFavorites(savedFavorites);
  }, []);

  useEffect(() => {
    const loadFavoritePokemon = async () => {
      if (favorites.length === 0) {
        setFavoritePokemon([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const pokemonData = await Promise.all(
          favorites.map(id => getPokemonDetails(id))
        );
        setFavoritePokemon(pokemonData);
      } catch (error) {
        console.error('Error loading favorite Pokémon:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFavoritePokemon();
  }, [favorites]);

  // Listen for favorite updates
  useEffect(() => {
    const handleFavoriteUpdate = () => {
      const savedFavorites = JSON.parse(localStorage.getItem('favoritePokemon') || '[]');
      setFavorites(savedFavorites);
    };

    window.addEventListener('favoriteUpdated', handleFavoriteUpdate);
    return () => window.removeEventListener('favoriteUpdated', handleFavoriteUpdate);
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="favorites-container">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="generation-header"
      >
        <h2 className="generation-title">
          Your Favorite Pokémon
          <span className="pokemon-count-badge">
            {favorites.length} Pokémon
          </span>
        </h2>
      </motion.div>

      {favoritePokemon.length === 0 ? (
        <div className="empty-favorites">
          <h3>No favorite Pokémon yet!</h3>
          <p>Click the heart icon on Pokémon cards to add them to your favorites.</p>
        </div>
      ) : (
        <motion.div
          className="pokemon-grid"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {favoritePokemon.map((pokemon) => (
            <motion.div
              key={pokemon.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
            >
              <PokemonCard pokemon={pokemon} />
            </motion.div>
          ))}
        </motion.div>
      )}

      <style jsx>{`
        .favorites-container {
          padding: 20px;
        }
        .empty-favorites {
          text-align: center;
          padding: 60px 20px;
          color: #666;
        }
        .empty-favorites h3 {
          font-size: 24px;
          margin-bottom: 10px;
        }
        .empty-favorites p {
          font-size: 16px;
        }
      `}</style>
    </div>
  );
};

export default Favorites;