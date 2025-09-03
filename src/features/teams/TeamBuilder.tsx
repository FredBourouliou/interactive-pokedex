import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  ListItemSecondaryAction,
  Tooltip,
  Badge,
  Fab,
  Divider,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Share as ShareIcon,
  ContentCopy as CopyIcon,
  Download as DownloadIcon,
  CloudUpload as ImportIcon,
  DragIndicator as DragIcon,
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { motion, AnimatePresence } from 'framer-motion';
import { RootState } from '../../store/store';
import {
  createTeam,
  updateTeam,
  deleteTeam,
  addPokemonToTeam,
  removePokemonFromTeam,
  reorderTeamPokemon,
} from '../../store/slices/teamsSlice';
import { Team, TeamPokemon, Pokemon } from '../../core/types';
import { getAnimatedSprite, getTypeColor } from '../../infrastructure/api/pokemonApi';

const NATURES = [
  'Hardy', 'Lonely', 'Brave', 'Adamant', 'Naughty',
  'Bold', 'Docile', 'Relaxed', 'Impish', 'Lax',
  'Timid', 'Hasty', 'Serious', 'Jolly', 'Naive',
  'Modest', 'Mild', 'Quiet', 'Bashful', 'Rash',
  'Calm', 'Gentle', 'Sassy', 'Careful', 'Quirky',
];

const TeamBuilder: React.FC = () => {
  const dispatch = useDispatch();
  const { teams } = useSelector((state: RootState) => state.teams);
  const { showShinySprites } = useSelector((state: RootState) => state.settings);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editPokemonDialog, setEditPokemonDialog] = useState<{
    open: boolean;
    teamId: string;
    pokemonIndex: number;
    pokemon: TeamPokemon | null;
  }>({ open: false, teamId: '', pokemonIndex: -1, pokemon: null });
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDescription, setNewTeamDescription] = useState('');
  const [tabValue, setTabValue] = useState(0);

  const handleCreateTeam = () => {
    if (newTeamName.trim()) {
      dispatch(createTeam({
        name: newTeamName,
        description: newTeamDescription,
        pokemon: [],
        tags: [],
        format: 'singles',
      }));
      setNewTeamName('');
      setNewTeamDescription('');
      setCreateDialogOpen(false);
    }
  };

  const handleDeleteTeam = (teamId: string) => {
    if (window.confirm('Are you sure you want to delete this team?')) {
      dispatch(deleteTeam(teamId));
      if (selectedTeam?.id === teamId) {
        setSelectedTeam(null);
      }
    }
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination || !selectedTeam) return;

    dispatch(reorderTeamPokemon({
      teamId: selectedTeam.id,
      fromIndex: result.source.index,
      toIndex: result.destination.index,
    }));
  };

  const exportTeam = (team: Team) => {
    const teamData = team.pokemon.map(p => ({
      pokemon: p.pokemon.name,
      nickname: p.nickname || '',
      level: p.level,
      nature: p.nature?.name || '',
      ability: p.ability || '',
      item: p.item || '',
      moves: p.moves.join(', '),
      evs: p.evs ? `HP:${p.evs.hp} Atk:${p.evs.attack} Def:${p.evs.defense} SpA:${p.evs.specialAttack} SpD:${p.evs.specialDefense} Spe:${p.evs.speed}` : '',
      shiny: p.shiny ? 'Yes' : 'No',
    }));

    const showdownFormat = team.pokemon.map(p => {
      let output = p.nickname ? `${p.nickname} (${p.pokemon.name})` : p.pokemon.name;
      if (p.item) output += ` @ ${p.item}`;
      output += '\n';
      if (p.ability) output += `Ability: ${p.ability}\n`;
      output += `Level: ${p.level}\n`;
      if (p.shiny) output += 'Shiny: Yes\n';
      if (p.evs) {
        const evStrings = [];
        if (p.evs.hp) evStrings.push(`${p.evs.hp} HP`);
        if (p.evs.attack) evStrings.push(`${p.evs.attack} Atk`);
        if (p.evs.defense) evStrings.push(`${p.evs.defense} Def`);
        if (p.evs.specialAttack) evStrings.push(`${p.evs.specialAttack} SpA`);
        if (p.evs.specialDefense) evStrings.push(`${p.evs.specialDefense} SpD`);
        if (p.evs.speed) evStrings.push(`${p.evs.speed} Spe`);
        if (evStrings.length > 0) output += `EVs: ${evStrings.join(' / ')}\n`;
      }
      if (p.nature) output += `${p.nature.name} Nature\n`;
      p.moves.forEach(move => {
        output += `- ${move}\n`;
      });
      return output;
    }).join('\n');

    const blob = new Blob([showdownFormat], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${team.name.replace(/\s+/g, '_')}_team.txt`;
    link.click();
  };

  const copyToClipboard = (team: Team) => {
    const showdownFormat = team.pokemon.map(p => {
      let output = p.nickname ? `${p.nickname} (${p.pokemon.name})` : p.pokemon.name;
      if (p.item) output += ` @ ${p.item}`;
      output += '\n';
      if (p.ability) output += `Ability: ${p.ability}\n`;
      output += `Level: ${p.level}\n`;
      if (p.shiny) output += 'Shiny: Yes\n';
      if (p.nature) output += `${p.nature.name} Nature\n`;
      p.moves.forEach(move => {
        output += `- ${move}\n`;
      });
      return output;
    }).join('\n');

    navigator.clipboard.writeText(showdownFormat);
  };

  const calculateTeamTypesCoverage = (team: Team) => {
    const types = new Set<string>();
    team.pokemon.forEach(p => {
      p.pokemon.types.forEach(t => types.add(t.type.name));
    });
    return Array.from(types);
  };

  const calculateTeamStats = (team: Team) => {
    if (team.pokemon.length === 0) return null;
    
    const totalStats = {
      hp: 0,
      attack: 0,
      defense: 0,
      specialAttack: 0,
      specialDefense: 0,
      speed: 0,
    };

    team.pokemon.forEach(p => {
      totalStats.hp += p.pokemon.stats[0].base_stat;
      totalStats.attack += p.pokemon.stats[1].base_stat;
      totalStats.defense += p.pokemon.stats[2].base_stat;
      totalStats.specialAttack += p.pokemon.stats[3].base_stat;
      totalStats.specialDefense += p.pokemon.stats[4].base_stat;
      totalStats.speed += p.pokemon.stats[5].base_stat;
    });

    const count = team.pokemon.length;
    return {
      hp: Math.round(totalStats.hp / count),
      attack: Math.round(totalStats.attack / count),
      defense: Math.round(totalStats.defense / count),
      specialAttack: Math.round(totalStats.specialAttack / count),
      specialDefense: Math.round(totalStats.specialDefense / count),
      speed: Math.round(totalStats.speed / count),
    };
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Team Builder
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Create New Team
          </Button>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                My Teams ({teams.length})
              </Typography>
              <List>
                {teams.map((team) => (
                  <ListItem
                    key={team.id}
                    button
                    selected={selectedTeam?.id === team.id}
                    onClick={() => setSelectedTeam(team)}
                  >
                    <ListItemAvatar>
                      <Badge badgeContent={team.pokemon.length} color="primary">
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {team.name[0].toUpperCase()}
                        </Avatar>
                      </Badge>
                    </ListItemAvatar>
                    <ListItemText
                      primary={team.name}
                      secondary={team.description || `${team.pokemon.length}/6 Pokémon`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTeam(team.id);
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
              {teams.length === 0 && (
                <Alert severity="info">
                  No teams yet. Create your first team!
                </Alert>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} md={8}>
            {selectedTeam ? (
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h5">
                    {selectedTeam.name}
                  </Typography>
                  <Box>
                    <IconButton onClick={() => copyToClipboard(selectedTeam)}>
                      <Tooltip title="Copy to Clipboard">
                        <CopyIcon />
                      </Tooltip>
                    </IconButton>
                    <IconButton onClick={() => exportTeam(selectedTeam)}>
                      <Tooltip title="Export Team">
                        <DownloadIcon />
                      </Tooltip>
                    </IconButton>
                    <IconButton>
                      <Tooltip title="Share Team">
                        <ShareIcon />
                      </Tooltip>
                    </IconButton>
                  </Box>
                </Box>

                {selectedTeam.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {selectedTeam.description}
                  </Typography>
                )}

                <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ mb: 2 }}>
                  <Tab label="Team Members" />
                  <Tab label="Type Coverage" />
                  <Tab label="Team Stats" />
                </Tabs>

                {tabValue === 0 && (
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="team-pokemon">
                      {(provided) => (
                        <Grid
                          container
                          spacing={2}
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                        >
                          {selectedTeam.pokemon.map((teamPokemon, index) => (
                            <Draggable
                              key={`${teamPokemon.pokemon.id}-${index}`}
                              draggableId={`${teamPokemon.pokemon.id}-${index}`}
                              index={index}
                            >
                              {(provided) => (
                                <Grid
                                  item
                                  xs={12}
                                  sm={6}
                                  md={4}
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                >
                                  <Card>
                                    <Box sx={{ display: 'flex', alignItems: 'center', p: 1 }}>
                                      <div {...provided.dragHandleProps}>
                                        <DragIcon />
                                      </div>
                                      <Typography variant="caption" sx={{ ml: 1 }}>
                                        Slot {index + 1}
                                      </Typography>
                                    </Box>
                                    <CardMedia
                                      component="img"
                                      height="100"
                                      image={getAnimatedSprite(teamPokemon.pokemon, teamPokemon.shiny || showShinySprites)}
                                      alt={teamPokemon.pokemon.name}
                                      sx={{ objectFit: 'contain', bgcolor: 'grey.100' }}
                                    />
                                    <CardContent>
                                      <Typography variant="h6">
                                        {teamPokemon.nickname || teamPokemon.pokemon.name}
                                      </Typography>
                                      {teamPokemon.nickname && (
                                        <Typography variant="caption" color="text.secondary">
                                          ({teamPokemon.pokemon.name})
                                        </Typography>
                                      )}
                                      <Box sx={{ display: 'flex', gap: 0.5, mt: 1 }}>
                                        {teamPokemon.pokemon.types.map((type) => (
                                          <Chip
                                            key={type.type.name}
                                            label={type.type.name}
                                            size="small"
                                            sx={{
                                              bgcolor: getTypeColor(type.type.name),
                                              color: 'white',
                                            }}
                                          />
                                        ))}
                                      </Box>
                                      <Typography variant="body2" sx={{ mt: 1 }}>
                                        Level: {teamPokemon.level}
                                      </Typography>
                                      {teamPokemon.ability && (
                                        <Typography variant="body2">
                                          Ability: {teamPokemon.ability}
                                        </Typography>
                                      )}
                                      {teamPokemon.item && (
                                        <Typography variant="body2">
                                          Item: {teamPokemon.item}
                                        </Typography>
                                      )}
                                    </CardContent>
                                    <CardActions>
                                      <IconButton
                                        size="small"
                                        onClick={() => setEditPokemonDialog({
                                          open: true,
                                          teamId: selectedTeam.id,
                                          pokemonIndex: index,
                                          pokemon: teamPokemon,
                                        })}
                                      >
                                        <EditIcon />
                                      </IconButton>
                                      <IconButton
                                        size="small"
                                        onClick={() => dispatch(removePokemonFromTeam({
                                          teamId: selectedTeam.id,
                                          pokemonIndex: index,
                                        }))}
                                      >
                                        <DeleteIcon />
                                      </IconButton>
                                    </CardActions>
                                  </Card>
                                </Grid>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                          {selectedTeam.pokemon.length < 6 && (
                            <Grid item xs={12} sm={6} md={4}>
                              <Card
                                sx={{
                                  height: '100%',
                                  minHeight: 250,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  border: '2px dashed',
                                  borderColor: 'divider',
                                  cursor: 'pointer',
                                }}
                              >
                                <CardContent>
                                  <IconButton color="primary" size="large">
                                    <AddIcon fontSize="large" />
                                  </IconButton>
                                  <Typography variant="body2" color="text.secondary">
                                    Add Pokémon
                                  </Typography>
                                </CardContent>
                              </Card>
                            </Grid>
                          )}
                        </Grid>
                      )}
                    </Droppable>
                  </DragDropContext>
                )}

                {tabValue === 1 && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Type Coverage
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                      {calculateTeamTypesCoverage(selectedTeam).map((type) => (
                        <Chip
                          key={type}
                          label={type}
                          sx={{
                            bgcolor: getTypeColor(type),
                            color: 'white',
                          }}
                        />
                      ))}
                    </Box>
                    <Alert severity="info">
                      Type effectiveness and weakness analysis coming soon!
                    </Alert>
                  </Box>
                )}

                {tabValue === 2 && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Average Team Stats
                    </Typography>
                    {calculateTeamStats(selectedTeam) ? (
                      <Grid container spacing={2}>
                        {Object.entries(calculateTeamStats(selectedTeam)!).map(([stat, value]) => (
                          <Grid item xs={12} sm={6} key={stat}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography sx={{ minWidth: 100 }}>
                                {stat.replace(/([A-Z])/g, ' $1').trim()}:
                              </Typography>
                              <Box sx={{ flexGrow: 1, mx: 2 }}>
                                <Slider
                                  value={value}
                                  max={255}
                                  disabled
                                  sx={{ color: value > 100 ? 'success.main' : 'primary.main' }}
                                />
                              </Box>
                              <Typography>{value}</Typography>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    ) : (
                      <Alert severity="info">
                        Add Pokémon to see team statistics
                      </Alert>
                    )}
                  </Box>
                )}
              </Paper>
            ) : (
              <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary">
                  Select or create a team to get started
                </Typography>
              </Paper>
            )}
          </Grid>
        </Grid>
      </Paper>

      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Team</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Team Name"
            fullWidth
            variant="outlined"
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description (optional)"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={newTeamDescription}
            onChange={(e) => setNewTeamDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateTeam} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TeamBuilder;