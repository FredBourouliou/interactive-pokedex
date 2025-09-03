import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  Grid,
  IconButton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Tooltip,
  Button,
  Card,
  CardMedia,
  CardContent,
  LinearProgress,
  Fab,
} from '@mui/material';
import {
  Close as CloseIcon,
  Compare as CompareIcon,
  Clear as ClearIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { RootState } from '../../store/store';
import { removeFromComparison, clearComparison, setComparisonMode } from '../../store/slices/comparisonSlice';
import { getTypeColor, getAnimatedSprite } from '../../infrastructure/api/pokemonApi';
import { Pokemon } from '../../core/types';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const PokemonComparison: React.FC = () => {
  const dispatch = useDispatch();
  const { selectedPokemon, comparisonMode } = useSelector((state: RootState) => state.comparison);
  const { showShinySprites } = useSelector((state: RootState) => state.settings);
  const [tabValue, setTabValue] = React.useState(0);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleRemovePokemon = (pokemonId: number) => {
    dispatch(removeFromComparison(pokemonId));
  };

  const handleClearAll = () => {
    dispatch(clearComparison());
  };

  const getStatData = () => {
    const statNames = ['HP', 'Attack', 'Defense', 'Sp. Atk', 'Sp. Def', 'Speed'];
    return statNames.map((statName, index) => {
      const dataPoint: any = { stat: statName };
      selectedPokemon.forEach(pokemon => {
        dataPoint[pokemon.name] = pokemon.stats[index].base_stat;
      });
      return dataPoint;
    });
  };

  const calculateTotal = (pokemon: Pokemon): number => {
    return pokemon.stats.reduce((sum, stat) => sum + stat.base_stat, 0);
  };

  const exportComparison = () => {
    const data = selectedPokemon.map(pokemon => ({
      name: pokemon.name,
      types: pokemon.types.map(t => t.type.name).join(', '),
      total: calculateTotal(pokemon),
      hp: pokemon.stats[0].base_stat,
      attack: pokemon.stats[1].base_stat,
      defense: pokemon.stats[2].base_stat,
      spAttack: pokemon.stats[3].base_stat,
      spDefense: pokemon.stats[4].base_stat,
      speed: pokemon.stats[5].base_stat,
      height: pokemon.height / 10,
      weight: pokemon.weight / 10,
      abilities: pokemon.abilities.map(a => a.ability.name).join(', '),
    }));

    const csvContent = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'pokemon-comparison.csv';
    link.click();
  };

  if (selectedPokemon.length < 2) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <CompareIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          Select at least 2 Pokémon to compare
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Click the compare button on Pokémon cards to add them to comparison
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Pokémon Comparison
          </Typography>
          <Box>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={exportComparison}
              sx={{ mr: 2 }}
            >
              Export CSV
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<ClearIcon />}
              onClick={handleClearAll}
            >
              Clear All
            </Button>
          </Box>
        </Box>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          {selectedPokemon.map((pokemon) => (
            <Grid item xs={12} sm={6} md={4} lg={2} key={pokemon.id}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <Card sx={{ position: 'relative' }}>
                  <IconButton
                    size="small"
                    sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}
                    onClick={() => handleRemovePokemon(pokemon.id)}
                  >
                    <CloseIcon />
                  </IconButton>
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
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
          <Tab label="Stats" />
          <Tab label="Physical" />
          <Tab label="Abilities" />
          <Tab label="Types" />
          <Tab label="Moves" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Stats Comparison Table
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Stat</TableCell>
                      {selectedPokemon.map((pokemon) => (
                        <TableCell key={pokemon.id} align="center">
                          {pokemon.name}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {['HP', 'Attack', 'Defense', 'Sp. Atk', 'Sp. Def', 'Speed'].map((statName, index) => (
                      <TableRow key={statName}>
                        <TableCell>{statName}</TableCell>
                        {selectedPokemon.map((pokemon) => (
                          <TableCell key={pokemon.id} align="center">
                            <Box>
                              {pokemon.stats[index].base_stat}
                              <LinearProgress
                                variant="determinate"
                                value={(pokemon.stats[index].base_stat / 255) * 100}
                                sx={{ mt: 0.5, height: 6, borderRadius: 1 }}
                              />
                            </Box>
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell><strong>Total</strong></TableCell>
                      {selectedPokemon.map((pokemon) => (
                        <TableCell key={pokemon.id} align="center">
                          <strong>{calculateTotal(pokemon)}</strong>
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Stats Radar Chart
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={getStatData()}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="stat" />
                  <PolarRadiusAxis angle={90} domain={[0, 255]} />
                  {selectedPokemon.map((pokemon, index) => (
                    <Radar
                      key={pokemon.id}
                      name={pokemon.name}
                      dataKey={pokemon.name}
                      stroke={`hsl(${(360 / selectedPokemon.length) * index}, 70%, 50%)`}
                      fill={`hsl(${(360 / selectedPokemon.length) * index}, 70%, 50%)`}
                      fillOpacity={0.3}
                    />
                  ))}
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Attribute</TableCell>
                  {selectedPokemon.map((pokemon) => (
                    <TableCell key={pokemon.id} align="center">
                      {pokemon.name}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Height</TableCell>
                  {selectedPokemon.map((pokemon) => (
                    <TableCell key={pokemon.id} align="center">
                      {(pokemon.height / 10).toFixed(1)} m
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell>Weight</TableCell>
                  {selectedPokemon.map((pokemon) => (
                    <TableCell key={pokemon.id} align="center">
                      {(pokemon.weight / 10).toFixed(1)} kg
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell>Base Experience</TableCell>
                  {selectedPokemon.map((pokemon) => (
                    <TableCell key={pokemon.id} align="center">
                      {pokemon.base_experience || 'N/A'}
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Pokémon</TableCell>
                  <TableCell>Abilities</TableCell>
                  <TableCell>Hidden Ability</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedPokemon.map((pokemon) => (
                  <TableRow key={pokemon.id}>
                    <TableCell sx={{ textTransform: 'capitalize' }}>{pokemon.name}</TableCell>
                    <TableCell>
                      {pokemon.abilities
                        .filter(a => !a.is_hidden)
                        .map(a => a.ability.name)
                        .join(', ')}
                    </TableCell>
                    <TableCell>
                      {pokemon.abilities
                        .filter(a => a.is_hidden)
                        .map(a => a.ability.name)
                        .join(', ') || 'None'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>
            Type Effectiveness Comparison
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Coming soon: Type matchup charts and damage calculations
          </Typography>
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
          <Typography variant="h6" gutterBottom>
            Move Pool Comparison
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Coming soon: Shared moves, unique moves, and move type distribution
          </Typography>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default PokemonComparison;