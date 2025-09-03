import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Card,
  CardContent,
  Slider,
  Switch,
  FormControlLabel,
  Chip,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Autocomplete,
  ToggleButton,
  ToggleButtonGroup,
  LinearProgress,
} from '@mui/material';
import {
  Calculate as CalculateIcon,
  SwapHoriz as SwapIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { Pokemon, Move, Type } from '../../core/types';
import { getTypeColor } from '../../infrastructure/api/pokemonApi';

interface DamageResult {
  minDamage: number;
  maxDamage: number;
  minPercent: number;
  maxPercent: number;
  effectiveness: number;
  critMinDamage: number;
  critMaxDamage: number;
  critMinPercent: number;
  critMaxPercent: number;
  description: string;
  kills: number; // Number of hits to KO
}

const DamageCalculator: React.FC = () => {
  const [attacker, setAttacker] = useState<Pokemon | null>(null);
  const [defender, setDefender] = useState<Pokemon | null>(null);
  const [selectedMove, setSelectedMove] = useState<Move | null>(null);
  const [attackerLevel, setAttackerLevel] = useState(50);
  const [defenderLevel, setDefenderLevel] = useState(50);
  const [attackerStats, setAttackerStats] = useState({
    hp: 0, attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0
  });
  const [defenderStats, setDefenderStats] = useState({
    hp: 0, attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0
  });
  const [attackerEVs, setAttackerEVs] = useState({
    hp: 0, attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0
  });
  const [defenderEVs, setDefenderEVs] = useState({
    hp: 0, attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0
  });
  const [attackerIVs, setAttackerIVs] = useState({
    hp: 31, attack: 31, defense: 31, specialAttack: 31, specialDefense: 31, speed: 31
  });
  const [defenderIVs, setDefenderIVs] = useState({
    hp: 31, attack: 31, defense: 31, specialAttack: 31, specialDefense: 31, speed: 31
  });
  const [attackerNature, setAttackerNature] = useState('Adamant');
  const [defenderNature, setDefenderNature] = useState('Bold');
  const [weather, setWeather] = useState<'none' | 'sun' | 'rain' | 'sand' | 'hail'>('none');
  const [terrain, setTerrain] = useState<'none' | 'electric' | 'grassy' | 'misty' | 'psychic'>('none');
  const [screens, setScreens] = useState({ reflect: false, lightScreen: false, auroraVeil: false });
  const [attackerBoosts, setAttackerBoosts] = useState({ attack: 0, specialAttack: 0 });
  const [defenderBoosts, setDefenderBoosts] = useState({ defense: 0, specialDefense: 0 });
  const [isCritical, setIsCritical] = useState(false);
  const [isBurned, setIsBurned] = useState(false);
  const [damageResult, setDamageResult] = useState<DamageResult | null>(null);

  const NATURE_MODIFIERS: Record<string, { plus: string; minus: string }> = {
    Adamant: { plus: 'attack', minus: 'specialAttack' },
    Bold: { plus: 'defense', minus: 'attack' },
    Brave: { plus: 'attack', minus: 'speed' },
    Calm: { plus: 'specialDefense', minus: 'attack' },
    Careful: { plus: 'specialDefense', minus: 'specialAttack' },
    Gentle: { plus: 'specialDefense', minus: 'defense' },
    Hasty: { plus: 'speed', minus: 'defense' },
    Impish: { plus: 'defense', minus: 'specialAttack' },
    Jolly: { plus: 'speed', minus: 'specialAttack' },
    Lax: { plus: 'defense', minus: 'specialDefense' },
    Lonely: { plus: 'attack', minus: 'defense' },
    Mild: { plus: 'specialAttack', minus: 'defense' },
    Modest: { plus: 'specialAttack', minus: 'attack' },
    Naive: { plus: 'speed', minus: 'specialDefense' },
    Naughty: { plus: 'attack', minus: 'specialDefense' },
    Quiet: { plus: 'specialAttack', minus: 'speed' },
    Rash: { plus: 'specialAttack', minus: 'specialDefense' },
    Relaxed: { plus: 'defense', minus: 'speed' },
    Sassy: { plus: 'specialDefense', minus: 'speed' },
    Timid: { plus: 'speed', minus: 'attack' },
    Hardy: { plus: '', minus: '' },
    Docile: { plus: '', minus: '' },
    Serious: { plus: '', minus: '' },
    Bashful: { plus: '', minus: '' },
    Quirky: { plus: '', minus: '' },
  };

  const calculateStat = (
    base: number,
    iv: number,
    ev: number,
    level: number,
    nature: string,
    statName: string,
    isHP: boolean = false
  ): number => {
    const natureModifier = NATURE_MODIFIERS[nature];
    let natureMult = 1;
    if (natureModifier.plus === statName) natureMult = 1.1;
    if (natureModifier.minus === statName) natureMult = 0.9;

    if (isHP) {
      if (base === 1) return 1; // Shedinja
      return Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + level + 10;
    }
    return Math.floor((Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + 5) * natureMult);
  };

  const getTypeEffectiveness = (moveType: string, defenderTypes: string[]): number => {
    const typeChart: Record<string, Record<string, number>> = {
      normal: { rock: 0.5, ghost: 0, steel: 0.5 },
      fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
      water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
      electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
      grass: { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
      ice: { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
      fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
      poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
      ground: { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
      flying: { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
      psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
      bug: { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
      rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
      ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
      dragon: { dragon: 2, steel: 0.5, fairy: 0 },
      dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
      steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
      fairy: { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 },
    };

    let effectiveness = 1;
    defenderTypes.forEach(defType => {
      const modifier = typeChart[moveType]?.[defType];
      if (modifier !== undefined) {
        effectiveness *= modifier;
      }
    });
    return effectiveness;
  };

  const calculateDamage = (): DamageResult | null => {
    if (!attacker || !defender || !selectedMove) return null;

    const attackStat = selectedMove.damage_class.name === 'physical' 
      ? calculateStat(attacker.stats[1].base_stat, attackerIVs.attack, attackerEVs.attack, attackerLevel, attackerNature, 'attack')
      : calculateStat(attacker.stats[3].base_stat, attackerIVs.specialAttack, attackerEVs.specialAttack, attackerLevel, attackerNature, 'specialAttack');
    
    const defenseStat = selectedMove.damage_class.name === 'physical'
      ? calculateStat(defender.stats[2].base_stat, defenderIVs.defense, defenderEVs.defense, defenderLevel, defenderNature, 'defense')
      : calculateStat(defender.stats[4].base_stat, defenderIVs.specialDefense, defenderEVs.specialDefense, defenderLevel, defenderNature, 'specialDefense');

    const defenderHP = calculateStat(defender.stats[0].base_stat, defenderIVs.hp, defenderEVs.hp, defenderLevel, defenderNature, 'hp', true);

    const power = selectedMove.power || 0;
    if (power === 0) {
      return {
        minDamage: 0,
        maxDamage: 0,
        minPercent: 0,
        maxPercent: 0,
        effectiveness: 1,
        critMinDamage: 0,
        critMaxDamage: 0,
        critMinPercent: 0,
        critMaxPercent: 0,
        description: 'This move does not deal direct damage',
        kills: 0,
      };
    }

    const effectiveness = getTypeEffectiveness(
      selectedMove.type.name,
      defender.types.map(t => t.type.name)
    );

    let STAB = 1;
    if (attacker.types.some(t => t.type.name === selectedMove.type.name)) {
      STAB = 1.5;
    }

    const weatherMod = weather === 'sun' && selectedMove.type.name === 'fire' ? 1.5 :
                       weather === 'sun' && selectedMove.type.name === 'water' ? 0.5 :
                       weather === 'rain' && selectedMove.type.name === 'water' ? 1.5 :
                       weather === 'rain' && selectedMove.type.name === 'fire' ? 0.5 : 1;

    const burnMod = isBurned && selectedMove.damage_class.name === 'physical' ? 0.5 : 1;
    
    const screenMod = (screens.reflect && selectedMove.damage_class.name === 'physical') ||
                      (screens.lightScreen && selectedMove.damage_class.name === 'special') ||
                      screens.auroraVeil ? 0.5 : 1;

    const critMod = isCritical ? 1.5 : 1;

    const boostMod = selectedMove.damage_class.name === 'physical' 
      ? Math.pow(2, Math.max(-6, Math.min(6, attackerBoosts.attack))) / Math.pow(2, Math.max(-6, Math.min(6, defenderBoosts.defense)))
      : Math.pow(2, Math.max(-6, Math.min(6, attackerBoosts.specialAttack))) / Math.pow(2, Math.max(-6, Math.min(6, defenderBoosts.specialDefense)));

    const baseDamage = Math.floor(
      Math.floor(
        Math.floor(
          Math.floor(2 * attackerLevel / 5 + 2) * power * (attackStat * boostMod) / (defenseStat)
        ) / 50
      ) + 2
    );

    const minDamage = Math.floor(baseDamage * 0.85 * STAB * effectiveness * weatherMod * burnMod * screenMod * critMod);
    const maxDamage = Math.floor(baseDamage * STAB * effectiveness * weatherMod * burnMod * screenMod * critMod);
    
    const critMinDamage = Math.floor(baseDamage * 0.85 * STAB * effectiveness * weatherMod * burnMod * screenMod * 1.5);
    const critMaxDamage = Math.floor(baseDamage * STAB * effectiveness * weatherMod * burnMod * screenMod * 1.5);

    const minPercent = Math.round((minDamage / defenderHP) * 1000) / 10;
    const maxPercent = Math.round((maxDamage / defenderHP) * 1000) / 10;
    const critMinPercent = Math.round((critMinDamage / defenderHP) * 1000) / 10;
    const critMaxPercent = Math.round((critMaxDamage / defenderHP) * 1000) / 10;

    const kills = maxDamage >= defenderHP ? 1 : 
                  maxDamage * 2 >= defenderHP ? 2 :
                  maxDamage * 3 >= defenderHP ? 3 :
                  maxDamage * 4 >= defenderHP ? 4 : 5;

    let description = `${minDamage}-${maxDamage} (${minPercent}% - ${maxPercent}%)`;
    if (effectiveness > 1) description = `Super effective! ${description}`;
    if (effectiveness < 1) description = `Not very effective... ${description}`;
    if (effectiveness === 0) description = `No effect!`;

    return {
      minDamage,
      maxDamage,
      minPercent,
      maxPercent,
      effectiveness,
      critMinDamage,
      critMaxDamage,
      critMinPercent,
      critMaxPercent,
      description,
      kills,
    };
  };

  const swapPokemon = () => {
    setAttacker(defender);
    setDefender(attacker);
    setAttackerLevel(defenderLevel);
    setDefenderLevel(attackerLevel);
    setAttackerStats(defenderStats);
    setDefenderStats(attackerStats);
    setAttackerEVs(defenderEVs);
    setDefenderEVs(attackerEVs);
    setAttackerIVs(defenderIVs);
    setDefenderIVs(attackerIVs);
    setAttackerNature(defenderNature);
    setDefenderNature(attackerNature);
    setAttackerBoosts({ attack: 0, specialAttack: 0 });
    setDefenderBoosts({ defense: 0, specialDefense: 0 });
  };

  useEffect(() => {
    const result = calculateDamage();
    setDamageResult(result);
  }, [
    attacker, defender, selectedMove, attackerLevel, defenderLevel,
    attackerStats, defenderStats, attackerEVs, defenderEVs,
    attackerIVs, defenderIVs, attackerNature, defenderNature,
    weather, terrain, screens, attackerBoosts, defenderBoosts,
    isCritical, isBurned
  ]);

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Damage Calculator
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Attacker
                </Typography>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Pokémon</InputLabel>
                  <Select value={attacker?.name || ''}>
                    <MenuItem value="">Select Pokémon</MenuItem>
                  </Select>
                </FormControl>
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      label="Level"
                      type="number"
                      value={attackerLevel}
                      onChange={(e) => setAttackerLevel(Number(e.target.value))}
                      fullWidth
                      inputProps={{ min: 1, max: 100 }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <FormControl fullWidth>
                      <InputLabel>Nature</InputLabel>
                      <Select
                        value={attackerNature}
                        onChange={(e) => setAttackerNature(e.target.value)}
                      >
                        {Object.keys(NATURE_MODIFIERS).map(nature => (
                          <MenuItem key={nature} value={nature}>{nature}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                  Stat Boosts
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption">Attack</Typography>
                    <Slider
                      value={attackerBoosts.attack}
                      onChange={(_, v) => setAttackerBoosts({ ...attackerBoosts, attack: v as number })}
                      min={-6}
                      max={6}
                      marks
                      valueLabelDisplay="auto"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption">Sp. Attack</Typography>
                    <Slider
                      value={attackerBoosts.specialAttack}
                      onChange={(_, v) => setAttackerBoosts({ ...attackerBoosts, specialAttack: v as number })}
                      min={-6}
                      max={6}
                      marks
                      valueLabelDisplay="auto"
                    />
                  </Grid>
                </Grid>

                <FormControlLabel
                  control={<Switch checked={isBurned} onChange={(e) => setIsBurned(e.target.checked)} />}
                  label="Burned"
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={2} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Box sx={{ textAlign: 'center' }}>
              <IconButton onClick={swapPokemon} color="primary" size="large">
                <SwapIcon fontSize="large" />
              </IconButton>
              <Typography variant="caption" display="block">
                Swap
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={5}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Defender
                </Typography>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Pokémon</InputLabel>
                  <Select value={defender?.name || ''}>
                    <MenuItem value="">Select Pokémon</MenuItem>
                  </Select>
                </FormControl>
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      label="Level"
                      type="number"
                      value={defenderLevel}
                      onChange={(e) => setDefenderLevel(Number(e.target.value))}
                      fullWidth
                      inputProps={{ min: 1, max: 100 }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <FormControl fullWidth>
                      <InputLabel>Nature</InputLabel>
                      <Select
                        value={defenderNature}
                        onChange={(e) => setDefenderNature(e.target.value)}
                      >
                        {Object.keys(NATURE_MODIFIERS).map(nature => (
                          <MenuItem key={nature} value={nature}>{nature}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                  Stat Boosts
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption">Defense</Typography>
                    <Slider
                      value={defenderBoosts.defense}
                      onChange={(_, v) => setDefenderBoosts({ ...defenderBoosts, defense: v as number })}
                      min={-6}
                      max={6}
                      marks
                      valueLabelDisplay="auto"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption">Sp. Defense</Typography>
                    <Slider
                      value={defenderBoosts.specialDefense}
                      onChange={(_, v) => setDefenderBoosts({ ...defenderBoosts, specialDefense: v as number })}
                      min={-6}
                      max={6}
                      marks
                      valueLabelDisplay="auto"
                    />
                  </Grid>
                </Grid>

                <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                  Screens
                </Typography>
                <Box>
                  <FormControlLabel
                    control={<Switch checked={screens.reflect} onChange={(e) => setScreens({ ...screens, reflect: e.target.checked })} />}
                    label="Reflect"
                  />
                  <FormControlLabel
                    control={<Switch checked={screens.lightScreen} onChange={(e) => setScreens({ ...screens, lightScreen: e.target.checked })} />}
                    label="Light Screen"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Field Conditions
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth>
                      <InputLabel>Weather</InputLabel>
                      <Select value={weather} onChange={(e) => setWeather(e.target.value as any)}>
                        <MenuItem value="none">None</MenuItem>
                        <MenuItem value="sun">Harsh Sunlight</MenuItem>
                        <MenuItem value="rain">Rain</MenuItem>
                        <MenuItem value="sand">Sandstorm</MenuItem>
                        <MenuItem value="hail">Hail</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth>
                      <InputLabel>Terrain</InputLabel>
                      <Select value={terrain} onChange={(e) => setTerrain(e.target.value as any)}>
                        <MenuItem value="none">None</MenuItem>
                        <MenuItem value="electric">Electric Terrain</MenuItem>
                        <MenuItem value="grassy">Grassy Terrain</MenuItem>
                        <MenuItem value="misty">Misty Terrain</MenuItem>
                        <MenuItem value="psychic">Psychic Terrain</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ pt: 2 }}>
                      <FormControlLabel
                        control={<Switch checked={isCritical} onChange={(e) => setIsCritical(e.target.checked)} />}
                        label="Critical Hit"
                      />
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {damageResult && (
            <Grid item xs={12}>
              <Card sx={{ bgcolor: damageResult.effectiveness > 1 ? 'success.light' : damageResult.effectiveness < 1 ? 'warning.light' : 'background.paper' }}>
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    Damage Result
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="h6">
                        {damageResult.minDamage} - {damageResult.maxDamage} HP
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        {damageResult.minPercent}% - {damageResult.maxPercent}%
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={damageResult.maxPercent}
                        sx={{ mt: 1, height: 10 }}
                        color={damageResult.maxPercent >= 100 ? 'error' : damageResult.maxPercent >= 50 ? 'warning' : 'success'}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body1">
                        <strong>Critical Hit:</strong> {damageResult.critMinDamage} - {damageResult.critMaxDamage} HP
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {damageResult.critMinPercent}% - {damageResult.critMaxPercent}%
                      </Typography>
                      <Typography variant="body1" sx={{ mt: 1 }}>
                        <strong>KO in:</strong> {damageResult.kills === 1 ? 'OHKO' : `${damageResult.kills} hits`}
                      </Typography>
                    </Grid>
                  </Grid>
                  <Alert severity={damageResult.effectiveness > 1 ? 'success' : damageResult.effectiveness < 1 ? 'warning' : 'info'} sx={{ mt: 2 }}>
                    {damageResult.description}
                  </Alert>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </Paper>
    </Box>
  );
};

export default DamageCalculator;