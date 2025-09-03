import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  ArrowForward as ArrowIcon,
  TrendingUp as LevelUpIcon,
  WbSunny as DayIcon,
  NightsStay as NightIcon,
  Favorite as HappinessIcon,
  LocationOn as LocationIcon,
  SwapHoriz as TradeIcon,
  Extension as ItemIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { EvolutionChain as EvolutionChainType, EvolutionDetail, Pokemon } from '../../core/types';
import { getAnimatedSprite, getPokemonDetails, getTypeColor } from '../../infrastructure/api/pokemonApi';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

interface EvolutionNodeProps {
  evolution: EvolutionDetail;
  level: number;
  onPokemonClick: (name: string) => void;
}

const EvolutionNode: React.FC<EvolutionNodeProps> = ({ evolution, level, onPokemonClick }) => {
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [loading, setLoading] = useState(true);
  const { showShinySprites } = useSelector((state: RootState) => state.settings);

  useEffect(() => {
    const fetchPokemon = async () => {
      try {
        const pokemonId = evolution.species.url.split('/').filter(Boolean).pop();
        const data = await getPokemonDetails(pokemonId!);
        setPokemon(data);
      } catch (error) {
        console.error('Failed to fetch pokemon:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPokemon();
  }, [evolution]);

  const getEvolutionMethodIcon = (details: any) => {
    if (!details || details.length === 0) return null;
    const detail = details[0];
    
    if (detail.min_level) return <LevelUpIcon />;
    if (detail.time_of_day === 'day') return <DayIcon />;
    if (detail.time_of_day === 'night') return <NightIcon />;
    if (detail.min_happiness) return <HappinessIcon />;
    if (detail.location) return <LocationIcon />;
    if (detail.trade_species || detail.trigger?.name === 'trade') return <TradeIcon />;
    if (detail.item) return <ItemIcon />;
    return <ArrowIcon />;
  };

  const getEvolutionMethodText = (details: any) => {
    if (!details || details.length === 0) return 'Natural Evolution';
    const detail = details[0];
    
    const methods = [];
    if (detail.min_level) methods.push(`Level ${detail.min_level}`);
    if (detail.item) methods.push(`Use ${detail.item.name}`);
    if (detail.held_item) methods.push(`Hold ${detail.held_item.name}`);
    if (detail.min_happiness) methods.push(`Happiness ${detail.min_happiness}+`);
    if (detail.time_of_day) methods.push(`During ${detail.time_of_day}`);
    if (detail.location) methods.push(`At ${detail.location.name}`);
    if (detail.known_move) methods.push(`Knows ${detail.known_move.name}`);
    if (detail.trade_species) methods.push(`Trade with ${detail.trade_species.name}`);
    if (detail.trigger?.name === 'trade' && !detail.trade_species) methods.push('Trade');
    if (detail.min_beauty) methods.push(`Beauty ${detail.min_beauty}+`);
    if (detail.min_affection) methods.push(`Affection ${detail.min_affection}+`);
    if (detail.needs_overworld_rain) methods.push('During rain');
    if (detail.turn_upside_down) methods.push('Turn upside down');
    
    return methods.join(', ') || 'Special Evolution';
  };

  if (loading) {
    return <LinearProgress />;
  }

  if (!pokemon) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      {evolution.evolution_details.length > 0 && level > 0 && (
        <Box sx={{ mx: 2, textAlign: 'center' }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: level * 0.2 }}
          >
            {getEvolutionMethodIcon(evolution.evolution_details)}
            <Typography variant="caption" display="block">
              {getEvolutionMethodText(evolution.evolution_details)}
            </Typography>
          </motion.div>
        </Box>
      )}
      
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: level * 0.1 }}
      >
        <Card
          sx={{
            cursor: 'pointer',
            transition: 'transform 0.2s',
            '&:hover': { transform: 'scale(1.05)' },
          }}
          onClick={() => onPokemonClick(pokemon.name)}
        >
          <CardMedia
            component="img"
            height="120"
            image={getAnimatedSprite(pokemon, showShinySprites)}
            alt={pokemon.name}
            sx={{ objectFit: 'contain', bgcolor: 'grey.100' }}
          />
          <CardContent>
            <Typography variant="h6" align="center">
              #{pokemon.id.toString().padStart(3, '0')}
            </Typography>
            <Typography variant="body1" align="center" sx={{ textTransform: 'capitalize' }}>
              {pokemon.name}
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center', mt: 1 }}>
              {pokemon.types.map((type) => (
                <Chip
                  key={type.type.name}
                  label={type.type.name}
                  size="small"
                  sx={{
                    bgcolor: getTypeColor(type.type.name),
                    color: 'white',
                    fontSize: '0.7rem',
                  }}
                />
              ))}
            </Box>
            {evolution.is_baby && (
              <Chip
                label="Baby"
                size="small"
                color="secondary"
                sx={{ mt: 1, width: '100%' }}
              />
            )}
          </CardContent>
        </Card>
      </motion.div>

      {evolution.evolves_to.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, ml: 2 }}>
          {evolution.evolves_to.map((evo, index) => (
            <EvolutionNode
              key={`${evo.species.name}-${index}`}
              evolution={evo}
              level={level + 1}
              onPokemonClick={onPokemonClick}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

interface EvolutionChainProps {
  evolutionChain: EvolutionChainType | null;
  onPokemonClick?: (name: string) => void;
}

const EvolutionChain: React.FC<EvolutionChainProps> = ({ evolutionChain, onPokemonClick = () => {} }) => {
  if (!evolutionChain) {
    return (
      <Alert severity="info">
        No evolution data available for this Pokémon.
      </Alert>
    );
  }

  return (
    <Paper elevation={2} sx={{ p: 3, overflow: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        Evolution Chain
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
        <EvolutionNode
          evolution={evolutionChain.chain}
          level={0}
          onPokemonClick={onPokemonClick}
        />
      </Box>
    </Paper>
  );
};

export default EvolutionChain;