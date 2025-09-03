import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  Slider,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  OutlinedInput,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  FormGroup,
  FormControlLabel,
  Switch,
  Badge,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { RootState } from '../../store/store';
import {
  setTypeFilter,
  setGenerationFilter,
  setStatsFilter,
  setAbilitiesFilter,
  setHeightFilter,
  setWeightFilter,
  setLegendaryFilter,
  setMythicalFilter,
  setBabyFilter,
  setGenderDifferencesFilter,
  setEggGroupsFilter,
  setColorsFilter,
  clearAllFilters,
} from '../../store/slices/filtersSlice';
import { getTypeColor } from '../../infrastructure/api/pokemonApi';

const POKEMON_TYPES = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
];

const POKEMON_COLORS = [
  'black', 'blue', 'brown', 'gray', 'green',
  'pink', 'purple', 'red', 'white', 'yellow'
];

const EGG_GROUPS = [
  'monster', 'water1', 'water2', 'water3', 'bug', 'flying',
  'ground', 'fairy', 'plant', 'humanshape', 'mineral',
  'amorphous', 'ditto', 'dragon', 'no-eggs'
];

const STAT_NAMES = [
  { key: 'hp', label: 'HP' },
  { key: 'attack', label: 'Attack' },
  { key: 'defense', label: 'Defense' },
  { key: 'specialAttack', label: 'Sp. Attack' },
  { key: 'specialDefense', label: 'Sp. Defense' },
  { key: 'speed', label: 'Speed' },
  { key: 'total', label: 'Total' },
];

const AdvancedFilters: React.FC = () => {
  const dispatch = useDispatch();
  const filters = useSelector((state: RootState) => state.filters);
  const [expandedPanels, setExpandedPanels] = React.useState<string[]>(['types']);

  const handlePanelChange = (panel: string) => (_: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedPanels(prev =>
      isExpanded
        ? [...prev, panel]
        : prev.filter(p => p !== panel)
    );
  };

  const handleTypeChange = (event: any) => {
    dispatch(setTypeFilter(event.target.value));
  };

  const handleGenerationChange = (event: any) => {
    dispatch(setGenerationFilter(event.target.value));
  };

  const handleEggGroupChange = (event: any) => {
    dispatch(setEggGroupsFilter(event.target.value));
  };

  const handleColorChange = (event: any) => {
    dispatch(setColorsFilter(event.target.value));
  };

  const handleStatChange = (stat: string, values: number[]) => {
    dispatch(setStatsFilter({
      ...filters.stats,
      [stat]: { min: values[0], max: values[1] }
    }));
  };

  const handleClearAll = () => {
    dispatch(clearAllFilters());
  };

  return (
    <Paper elevation={3} sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterIcon />
          <Typography variant="h6">Advanced Filters</Typography>
          {filters.activeFiltersCount > 0 && (
            <Badge badgeContent={filters.activeFiltersCount} color="primary">
              <span />
            </Badge>
          )}
        </Box>
        <Button
          variant="outlined"
          color="error"
          startIcon={<ClearIcon />}
          onClick={handleClearAll}
          disabled={filters.activeFiltersCount === 0}
        >
          Clear All
        </Button>
      </Box>

      <Accordion
        expanded={expandedPanels.includes('types')}
        onChange={handlePanelChange('types')}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Types {filters.types && filters.types.length > 0 && `(${filters.types.length})`}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <FormControl fullWidth>
            <InputLabel>Select Types</InputLabel>
            <Select
              multiple
              value={filters.types || []}
              onChange={handleTypeChange}
              input={<OutlinedInput label="Select Types" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip
                      key={value}
                      label={value}
                      size="small"
                      sx={{
                        bgcolor: getTypeColor(value),
                        color: 'white',
                      }}
                    />
                  ))}
                </Box>
              )}
            >
              {POKEMON_TYPES.map((type) => (
                <MenuItem key={type} value={type}>
                  <Checkbox checked={(filters.types || []).indexOf(type) > -1} />
                  <ListItemText primary={type} />
                  <Chip
                    label={type}
                    size="small"
                    sx={{
                      bgcolor: getTypeColor(type),
                      color: 'white',
                      ml: 1,
                    }}
                  />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </AccordionDetails>
      </Accordion>

      <Accordion
        expanded={expandedPanels.includes('stats')}
        onChange={handlePanelChange('stats')}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Stats Range</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            {STAT_NAMES.map((stat) => (
              <Grid item xs={12} sm={6} key={stat.key}>
                <Typography gutterBottom>{stat.label}</Typography>
                <Slider
                  value={[
                    filters.stats?.[stat.key as keyof typeof filters.stats]?.min || 0,
                    filters.stats?.[stat.key as keyof typeof filters.stats]?.max || (stat.key === 'total' ? 780 : 255)
                  ]}
                  onChange={(_, value) => handleStatChange(stat.key, value as number[])}
                  valueLabelDisplay="auto"
                  min={0}
                  max={stat.key === 'total' ? 780 : 255}
                  marks={[
                    { value: 0, label: '0' },
                    { value: stat.key === 'total' ? 780 : 255, label: stat.key === 'total' ? '780' : '255' }
                  ]}
                />
              </Grid>
            ))}
          </Grid>
        </AccordionDetails>
      </Accordion>

      <Accordion
        expanded={expandedPanels.includes('physical')}
        onChange={handlePanelChange('physical')}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Physical Attributes</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography gutterBottom>Height (m)</Typography>
              <Slider
                value={[filters.height?.min || 0, filters.height?.max || 20]}
                onChange={(_, value) => {
                  const [min, max] = value as number[];
                  dispatch(setHeightFilter({ min, max }));
                }}
                valueLabelDisplay="auto"
                min={0}
                max={20}
                step={0.1}
                marks={[
                  { value: 0, label: '0m' },
                  { value: 20, label: '20m' }
                ]}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography gutterBottom>Weight (kg)</Typography>
              <Slider
                value={[filters.weight?.min || 0, filters.weight?.max || 1000]}
                onChange={(_, value) => {
                  const [min, max] = value as number[];
                  dispatch(setWeightFilter({ min, max }));
                }}
                valueLabelDisplay="auto"
                min={0}
                max={1000}
                marks={[
                  { value: 0, label: '0kg' },
                  { value: 1000, label: '1000kg' }
                ]}
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      <Accordion
        expanded={expandedPanels.includes('categories')}
        onChange={handlePanelChange('categories')}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Special Categories</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={filters.isLegendary || false}
                  onChange={(e) => dispatch(setLegendaryFilter(e.target.checked ? true : undefined))}
                />
              }
              label="Legendary Pokémon"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={filters.isMythical || false}
                  onChange={(e) => dispatch(setMythicalFilter(e.target.checked ? true : undefined))}
                />
              }
              label="Mythical Pokémon"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={filters.isBaby || false}
                  onChange={(e) => dispatch(setBabyFilter(e.target.checked ? true : undefined))}
                />
              }
              label="Baby Pokémon"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={filters.hasGenderDifferences || false}
                  onChange={(e) => dispatch(setGenderDifferencesFilter(e.target.checked ? true : undefined))}
                />
              }
              label="Has Gender Differences"
            />
          </FormGroup>
        </AccordionDetails>
      </Accordion>

      <Accordion
        expanded={expandedPanels.includes('breeding')}
        onChange={handlePanelChange('breeding')}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Breeding & Groups</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Egg Groups</InputLabel>
                <Select
                  multiple
                  value={filters.eggGroups || []}
                  onChange={handleEggGroupChange}
                  input={<OutlinedInput label="Egg Groups" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {EGG_GROUPS.map((group) => (
                    <MenuItem key={group} value={group}>
                      <Checkbox checked={(filters.eggGroups || []).indexOf(group) > -1} />
                      <ListItemText primary={group} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      <Accordion
        expanded={expandedPanels.includes('appearance')}
        onChange={handlePanelChange('appearance')}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Appearance</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <FormControl fullWidth>
            <InputLabel>Colors</InputLabel>
            <Select
              multiple
              value={filters.colors || []}
              onChange={handleColorChange}
              input={<OutlinedInput label="Colors" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip
                      key={value}
                      label={value}
                      size="small"
                      sx={{
                        bgcolor: value === 'white' ? '#f0f0f0' : value,
                        color: ['yellow', 'white'].includes(value) ? 'black' : 'white',
                        border: value === 'white' ? '1px solid #ccc' : 'none',
                      }}
                    />
                  ))}
                </Box>
              )}
            >
              {POKEMON_COLORS.map((color) => (
                <MenuItem key={color} value={color}>
                  <Checkbox checked={(filters.colors || []).indexOf(color) > -1} />
                  <ListItemText primary={color} />
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      bgcolor: color === 'white' ? '#f0f0f0' : color,
                      border: color === 'white' ? '1px solid #ccc' : 'none',
                      borderRadius: '50%',
                      ml: 1,
                    }}
                  />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </AccordionDetails>
      </Accordion>

      <Accordion
        expanded={expandedPanels.includes('generations')}
        onChange={handlePanelChange('generations')}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Generations {filters.generations && filters.generations.length > 0 && `(${filters.generations.length})`}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <FormControl fullWidth>
            <InputLabel>Select Generations</InputLabel>
            <Select
              multiple
              value={filters.generations || []}
              onChange={handleGenerationChange}
              input={<OutlinedInput label="Select Generations" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={`Gen ${value}`} size="small" />
                  ))}
                </Box>
              )}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((gen) => (
                <MenuItem key={gen} value={gen}>
                  <Checkbox checked={(filters.generations || []).indexOf(gen) > -1} />
                  <ListItemText primary={`Generation ${gen}`} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </AccordionDetails>
      </Accordion>

      <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          startIcon={<SearchIcon />}
          color="primary"
        >
          Apply Filters ({filters.activeFiltersCount})
        </Button>
      </Box>
    </Paper>
  );
};

export default AdvancedFilters;