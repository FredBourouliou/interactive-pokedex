import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TYPE_COLORS } from '../constants/typeColors';

interface TeamPokemon {
  id: number;
  name: string;
  sprite: string;
  types: string[];
}

interface Team {
  id: string;
  name: string;
  description: string;
  pokemon: TeamPokemon[];
  createdAt: Date;
}

const TEAM_TEMPLATES = [
  { name: 'Rain Team', icon: '🌧️', types: ['water', 'electric'] },
  { name: 'Sun Team', icon: '☀️', types: ['fire', 'grass'] },
  { name: 'Sandstorm', icon: '🏜️', types: ['rock', 'ground', 'steel'] },
  { name: 'Hail Team', icon: '❄️', types: ['ice', 'water'] },
  { name: 'Trick Room', icon: '🎭', types: ['psychic', 'ghost'] },
  { name: 'Balanced', icon: '⚖️', types: [] }
];

const EnhancedTeams: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [teamDescription, setTeamDescription] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  useEffect(() => {
    const savedTeams = localStorage.getItem('pokemonTeams');
    if (savedTeams) {
      setTeams(JSON.parse(savedTeams));
    }
  }, []);

  const saveTeams = (newTeams: Team[]) => {
    localStorage.setItem('pokemonTeams', JSON.stringify(newTeams));
    setTeams(newTeams);
  };

  const createTeam = () => {
    if (!teamName) return;

    const newTeam: Team = {
      id: Date.now().toString(),
      name: teamName,
      description: teamDescription,
      pokemon: [],
      createdAt: new Date()
    };

    saveTeams([...teams, newTeam]);
    setTeamName('');
    setTeamDescription('');
    setIsCreating(false);
    setSelectedTeam(newTeam);
  };

  const deleteTeam = (teamId: string) => {
    saveTeams(teams.filter(t => t.id !== teamId));
    if (selectedTeam?.id === teamId) {
      setSelectedTeam(null);
    }
  };

  const exportTeam = (team: Team) => {
    const dataStr = JSON.stringify(team, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${team.name.replace(/\s+/g, '_')}_team.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importTeam = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const team = JSON.parse(e.target?.result as string);
        team.id = Date.now().toString(); // New ID for imported team
        saveTeams([...teams, team]);
      } catch (error) {
        console.error('Error importing team:', error);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="enhanced-teams">
      {/* Hero Section */}
      <motion.div 
        className="teams-hero"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="teams-title">
          Team Builder
          <span className="teams-subtitle">Create your perfect team</span>
        </h1>
        <p className="teams-description">
          Build, manage, and share your Pokémon teams for competitive battles
        </p>
      </motion.div>

      {/* Actions Bar */}
      <motion.div 
        className="teams-actions"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <button 
          className="action-btn primary"
          onClick={() => setIsCreating(true)}
        >
          <span className="btn-icon">➕</span>
          New Team
        </button>
        <label className="action-btn secondary">
          <span className="btn-icon">📥</span>
          Import Team
          <input 
            type="file" 
            accept=".json"
            onChange={importTeam}
            style={{ display: 'none' }}
          />
        </label>
        <div className="teams-count">
          <span className="count-number">{teams.length}</span>
          <span className="count-label">Teams Created</span>
        </div>
      </motion.div>

      {/* Team Templates */}
      {isCreating && (
        <motion.div 
          className="team-templates"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <h3>Choose a Template (Optional)</h3>
          <div className="templates-grid">
            {TEAM_TEMPLATES.map((template) => (
              <button
                key={template.name}
                className={`template-btn ${selectedTemplate === template.name ? 'selected' : ''}`}
                onClick={() => setSelectedTemplate(template.name)}
              >
                <span className="template-icon">{template.icon}</span>
                <span className="template-name">{template.name}</span>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Create Team Form */}
      <AnimatePresence>
        {isCreating && (
          <motion.div 
            className="create-team-form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <h3>Create New Team</h3>
            <div className="form-group">
              <label>Team Name</label>
              <input
                type="text"
                placeholder="Enter team name..."
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                placeholder="Describe your team strategy..."
                value={teamDescription}
                onChange={(e) => setTeamDescription(e.target.value)}
                className="form-textarea"
                rows={3}
              />
            </div>
            <div className="form-actions">
              <button 
                className="action-btn secondary"
                onClick={() => {
                  setIsCreating(false);
                  setTeamName('');
                  setTeamDescription('');
                  setSelectedTemplate(null);
                }}
              >
                Cancel
              </button>
              <button 
                className="action-btn primary"
                onClick={createTeam}
                disabled={!teamName}
              >
                Create Team
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Teams Grid */}
      <div className="teams-container">
        <div className="teams-sidebar">
          <h3>Your Teams</h3>
          {teams.length === 0 ? (
            <div className="empty-teams">
              <span className="empty-icon">📋</span>
              <p>No teams created yet</p>
              <p className="empty-hint">Click "New Team" to get started!</p>
            </div>
          ) : (
            <div className="teams-list">
              {teams.map((team) => (
                <motion.div
                  key={team.id}
                  className={`team-card ${selectedTeam?.id === team.id ? 'selected' : ''}`}
                  onClick={() => setSelectedTeam(team)}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="team-card-header">
                    <h4>{team.name}</h4>
                    <span className="team-size">{team.pokemon.length}/6</span>
                  </div>
                  <p className="team-card-description">{team.description || 'No description'}</p>
                  <div className="team-card-pokemon">
                    {team.pokemon.slice(0, 3).map((p) => (
                      <img key={p.id} src={p.sprite} alt={p.name} className="mini-sprite" />
                    ))}
                    {team.pokemon.length > 3 && (
                      <span className="more-pokemon">+{team.pokemon.length - 3}</span>
                    )}
                  </div>
                  <div className="team-card-actions">
                    <button 
                      className="card-action-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        exportTeam(team);
                      }}
                      title="Export Team"
                    >
                      📤
                    </button>
                    <button 
                      className="card-action-btn delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTeam(team.id);
                      }}
                      title="Delete Team"
                    >
                      🗑️
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div className="team-detail">
          {selectedTeam ? (
            <>
              <div className="team-detail-header">
                <h2>{selectedTeam.name}</h2>
                <p>{selectedTeam.description}</p>
                <div className="team-stats">
                  <div className="stat-item">
                    <span className="stat-label">Created</span>
                    <span className="stat-value">
                      {new Date(selectedTeam.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Members</span>
                    <span className="stat-value">{selectedTeam.pokemon.length}/6</span>
                  </div>
                </div>
              </div>

              <div className="team-pokemon-grid">
                {[...Array(6)].map((_, index) => {
                  const pokemon = selectedTeam.pokemon[index];
                  return (
                    <motion.div 
                      key={index}
                      className="team-slot"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      {pokemon ? (
                        <>
                          <img src={pokemon.sprite} alt={pokemon.name} className="slot-sprite" />
                          <h4>{pokemon.name}</h4>
                          <div className="slot-types">
                            {pokemon.types.map(type => (
                              <span 
                                key={type}
                                className="type-badge"
                                style={{ backgroundColor: TYPE_COLORS[type] }}
                              >
                                {type}
                              </span>
                            ))}
                          </div>
                        </>
                      ) : (
                        <div className="empty-slot">
                          <span className="empty-slot-icon">➕</span>
                          <p>Add Pokémon</p>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              <div className="team-analysis">
                <h3>Team Analysis</h3>
                <div className="analysis-grid">
                  <div className="analysis-card">
                    <h4>Type Coverage</h4>
                    <p className="analysis-hint">Add Pokémon to see type coverage analysis</p>
                  </div>
                  <div className="analysis-card">
                    <h4>Weaknesses</h4>
                    <p className="analysis-hint">Team weaknesses will appear here</p>
                  </div>
                  <div className="analysis-card">
                    <h4>Recommendations</h4>
                    <p className="analysis-hint">Suggestions for team improvement</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="no-team-selected">
              <span className="no-team-icon">👈</span>
              <h3>Select a Team</h3>
              <p>Choose a team from the sidebar or create a new one</p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .enhanced-teams {
          padding: 2rem 0;
          min-height: 100vh;
        }

        .teams-hero {
          text-align: center;
          padding: 3rem 2rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 24px;
          margin-bottom: 3rem;
          color: white;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }

        .teams-title {
          font-size: 3rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .teams-subtitle {
          font-size: 1.5rem;
          font-weight: 400;
          opacity: 0.9;
        }

        .teams-description {
          font-size: 1.2rem;
          opacity: 0.8;
          margin-top: 1rem;
        }

        .teams-actions {
          display: flex;
          gap: 1.5rem;
          align-items: center;
          padding: 2rem;
          background: white;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
          margin-bottom: 2rem;
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.5rem;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .action-btn.primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .action-btn.primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
        }

        .action-btn.secondary {
          background: #f8f9fa;
          color: #333;
          border: 2px solid #e0e0e0;
        }

        .action-btn.secondary:hover {
          background: white;
          border-color: #667eea;
        }

        .btn-icon {
          font-size: 1.2rem;
        }

        .teams-count {
          margin-left: auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0.75rem 1.5rem;
          background: #f8f9fa;
          border-radius: 12px;
        }

        .count-number {
          font-size: 1.8rem;
          font-weight: 700;
          color: #667eea;
        }

        .count-label {
          font-size: 0.9rem;
          color: #666;
        }

        .team-templates {
          padding: 2rem;
          background: white;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
          margin-bottom: 2rem;
        }

        .team-templates h3 {
          margin-bottom: 1.5rem;
          color: #333;
        }

        .templates-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 1rem;
        }

        .template-btn {
          padding: 1rem;
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          background: white;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .template-btn:hover {
          border-color: #667eea;
          background: #f8f9fa;
        }

        .template-btn.selected {
          border-color: #667eea;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
        }

        .template-icon {
          font-size: 2rem;
        }

        .template-name {
          font-weight: 600;
          color: #333;
        }

        .create-team-form {
          padding: 2rem;
          background: white;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
          margin-bottom: 2rem;
        }

        .create-team-form h3 {
          margin-bottom: 1.5rem;
          color: #333;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #333;
        }

        .form-input,
        .form-textarea {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          font-size: 1rem;
          transition: all 0.2s;
        }

        .form-input:focus,
        .form-textarea:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
        }

        .teams-container {
          display: grid;
          grid-template-columns: 350px 1fr;
          gap: 2rem;
          margin-top: 2rem;
        }

        .teams-sidebar {
          background: white;
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
          height: fit-content;
          max-height: 70vh;
          overflow-y: auto;
        }

        .teams-sidebar h3 {
          margin-bottom: 1.5rem;
          color: #333;
        }

        .empty-teams {
          text-align: center;
          padding: 3rem 1rem;
        }

        .empty-icon {
          font-size: 4rem;
          display: block;
          margin-bottom: 1rem;
        }

        .empty-teams p {
          color: #666;
          margin: 0.5rem 0;
        }

        .empty-hint {
          font-size: 0.9rem;
          color: #999;
        }

        .teams-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .team-card {
          padding: 1.25rem;
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
          background: white;
        }

        .team-card:hover {
          border-color: #667eea;
          background: #f8f9fa;
        }

        .team-card.selected {
          border-color: #667eea;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
        }

        .team-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .team-card-header h4 {
          margin: 0;
          color: #333;
        }

        .team-size {
          padding: 0.25rem 0.5rem;
          background: #667eea;
          color: white;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .team-card-description {
          color: #666;
          font-size: 0.9rem;
          margin: 0.5rem 0;
        }

        .team-card-pokemon {
          display: flex;
          gap: 0.5rem;
          align-items: center;
          margin: 1rem 0;
        }

        .mini-sprite {
          width: 40px;
          height: 40px;
        }

        .more-pokemon {
          padding: 0.25rem 0.5rem;
          background: #f0f0f0;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          color: #666;
        }

        .team-card-actions {
          display: flex;
          gap: 0.5rem;
        }

        .card-action-btn {
          padding: 0.5rem;
          border: none;
          background: #f0f0f0;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .card-action-btn:hover {
          background: #e0e0e0;
          transform: translateY(-1px);
        }

        .card-action-btn.delete:hover {
          background: #ff6b6b;
        }

        .team-detail {
          background: white;
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
        }

        .team-detail-header {
          border-bottom: 2px solid #f0f0f0;
          padding-bottom: 1.5rem;
          margin-bottom: 2rem;
        }

        .team-detail-header h2 {
          margin: 0 0 0.5rem 0;
          color: #333;
        }

        .team-detail-header p {
          color: #666;
          margin: 0.5rem 0;
        }

        .team-stats {
          display: flex;
          gap: 2rem;
          margin-top: 1rem;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
        }

        .stat-label {
          font-size: 0.85rem;
          color: #999;
          margin-bottom: 0.25rem;
        }

        .stat-value {
          font-size: 1.1rem;
          font-weight: 600;
          color: #333;
        }

        .team-pokemon-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .team-slot {
          padding: 1.5rem;
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          text-align: center;
          background: #f8f9fa;
        }

        .slot-sprite {
          width: 80px;
          height: 80px;
          margin-bottom: 0.5rem;
        }

        .team-slot h4 {
          margin: 0.5rem 0;
          text-transform: capitalize;
          color: #333;
        }

        .slot-types {
          display: flex;
          gap: 0.5rem;
          justify-content: center;
        }

        .type-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 8px;
          color: white;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .empty-slot {
          padding: 2rem 1rem;
          color: #999;
        }

        .empty-slot-icon {
          font-size: 2rem;
          display: block;
          margin-bottom: 0.5rem;
        }

        .empty-slot p {
          margin: 0;
          font-size: 0.9rem;
        }

        .team-analysis {
          margin-top: 2rem;
        }

        .team-analysis h3 {
          margin-bottom: 1.5rem;
          color: #333;
        }

        .analysis-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }

        .analysis-card {
          padding: 1.5rem;
          background: #f8f9fa;
          border-radius: 12px;
          border: 2px solid #e0e0e0;
        }

        .analysis-card h4 {
          margin: 0 0 0.5rem 0;
          color: #333;
        }

        .analysis-hint {
          color: #999;
          font-size: 0.9rem;
        }

        .no-team-selected {
          text-align: center;
          padding: 4rem 2rem;
        }

        .no-team-icon {
          font-size: 4rem;
          display: block;
          margin-bottom: 1rem;
        }

        .no-team-selected h3 {
          color: #333;
          margin: 1rem 0;
        }

        .no-team-selected p {
          color: #666;
        }

        @media (max-width: 1024px) {
          .teams-container {
            grid-template-columns: 1fr;
          }

          .teams-sidebar {
            max-height: none;
          }
        }

        @media (max-width: 768px) {
          .teams-title {
            font-size: 2rem;
          }

          .teams-subtitle {
            font-size: 1.2rem;
          }

          .teams-actions {
            flex-direction: column;
          }

          .teams-count {
            margin-left: 0;
            width: 100%;
          }

          .team-pokemon-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .analysis-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default EnhancedTeams;