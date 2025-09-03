import React, { useState } from 'react';
import { motion } from 'framer-motion';

const TYPE_EFFECTIVENESS: { [key: string]: { [key: string]: number } } = {
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
  fairy: { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 }
};

const WEATHER_MODIFIERS = [
  { name: 'None', icon: '☀️', fire: 1, water: 1 },
  { name: 'Harsh Sunlight', icon: '🌞', fire: 1.5, water: 0.5 },
  { name: 'Rain', icon: '🌧️', fire: 0.5, water: 1.5 },
  { name: 'Sandstorm', icon: '🏜️', rock: 1.5, ground: 1.5, steel: 1.5 },
  { name: 'Hail', icon: '❄️', ice: 1.5 }
];

const TERRAIN_MODIFIERS = [
  { name: 'None', icon: '🌍' },
  { name: 'Electric', icon: '⚡', electric: 1.3 },
  { name: 'Grassy', icon: '🌿', grass: 1.3 },
  { name: 'Misty', icon: '🌫️', dragon: 0.5, fairy: 1.5 },
  { name: 'Psychic', icon: '🔮', psychic: 1.3 }
];

const EnhancedCalculator: React.FC = () => {
  const [attackerLevel, setAttackerLevel] = useState(50);
  const [attackerAttack, setAttackerAttack] = useState(100);
  const [defenderDefense, setDefenderDefense] = useState(100);
  const [defenderHP, setDefenderHP] = useState(200);
  const [movePower, setMovePower] = useState(80);
  const [moveType, setMoveType] = useState('normal');
  const [defenderType1, setDefenderType1] = useState('normal');
  const [defenderType2, setDefenderType2] = useState('none');
  const [isPhysical, setIsPhysical] = useState(true);
  const [isCritical, setIsCritical] = useState(false);
  const [isSTAB, setIsSTAB] = useState(false);
  const [weather, setWeather] = useState(0);
  const [terrain, setTerrain] = useState(0);
  const [calculatedDamage, setCalculatedDamage] = useState<{ min: number; max: number } | null>(null);

  const calculateDamage = () => {
    // Base damage formula
    const levelFactor = (2 * attackerLevel / 5 + 2);
    const attackStat = isPhysical ? attackerAttack : attackerAttack;
    const defenseStat = isPhysical ? defenderDefense : defenderDefense;
    
    let damage = (levelFactor * movePower * (attackStat / defenseStat)) / 50 + 2;
    
    // Apply STAB
    if (isSTAB) damage *= 1.5;
    
    // Apply critical hit
    if (isCritical) damage *= 1.5;
    
    // Apply type effectiveness
    let effectiveness = 1;
    if (TYPE_EFFECTIVENESS[moveType]?.[defenderType1]) {
      effectiveness *= TYPE_EFFECTIVENESS[moveType][defenderType1];
    }
    if (defenderType2 !== 'none' && TYPE_EFFECTIVENESS[moveType]?.[defenderType2]) {
      effectiveness *= TYPE_EFFECTIVENESS[moveType][defenderType2];
    }
    damage *= effectiveness;
    
    // Apply weather modifier
    const weatherMod = WEATHER_MODIFIERS[weather];
    if (weatherMod[moveType as keyof typeof weatherMod]) {
      damage *= weatherMod[moveType as keyof typeof weatherMod] as number;
    }
    
    // Apply terrain modifier
    const terrainMod = TERRAIN_MODIFIERS[terrain];
    if (terrainMod[moveType as keyof typeof terrainMod]) {
      damage *= terrainMod[moveType as keyof typeof terrainMod] as number;
    }
    
    // Random factor (85-100%)
    const minDamage = Math.floor(damage * 0.85);
    const maxDamage = Math.floor(damage);
    
    setCalculatedDamage({ min: minDamage, max: maxDamage });
  };

  const getEffectivenessText = () => {
    let effectiveness = 1;
    if (TYPE_EFFECTIVENESS[moveType]?.[defenderType1]) {
      effectiveness *= TYPE_EFFECTIVENESS[moveType][defenderType1];
    }
    if (defenderType2 !== 'none' && TYPE_EFFECTIVENESS[moveType]?.[defenderType2]) {
      effectiveness *= TYPE_EFFECTIVENESS[moveType][defenderType2];
    }
    
    if (effectiveness === 0) return { text: 'No Effect', color: '#666' };
    if (effectiveness === 0.25) return { text: '0.25x - Very Weak', color: '#ff4444' };
    if (effectiveness === 0.5) return { text: '0.5x - Not Very Effective', color: '#ff8844' };
    if (effectiveness === 1) return { text: '1x - Normal Damage', color: '#666' };
    if (effectiveness === 2) return { text: '2x - Super Effective!', color: '#44ff44' };
    if (effectiveness === 4) return { text: '4x - Extremely Effective!', color: '#00ff00' };
    return { text: `${effectiveness}x`, color: '#666' };
  };

  const types = Object.keys(TYPE_EFFECTIVENESS);

  return (
    <div className="enhanced-calculator">
      {/* Hero Section */}
      <motion.div 
        className="calculator-hero"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="calculator-title">
          Damage Calculator
          <span className="calculator-subtitle">Advanced Battle Simulator</span>
        </h1>
        <p className="calculator-description">
          Calculate precise damage for competitive battles
        </p>
      </motion.div>

      <div className="calculator-container">
        {/* Attacker Section */}
        <motion.div 
          className="calc-section attacker-section"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h3 className="section-title">
            <span className="section-icon">⚔️</span>
            Attacker
          </h3>
          
          <div className="input-group">
            <label>Level</label>
            <input
              type="number"
              value={attackerLevel}
              onChange={(e) => setAttackerLevel(Number(e.target.value))}
              min="1"
              max="100"
              className="calc-input"
            />
            <input
              type="range"
              value={attackerLevel}
              onChange={(e) => setAttackerLevel(Number(e.target.value))}
              min="1"
              max="100"
              className="calc-slider"
            />
          </div>

          <div className="input-group">
            <label>{isPhysical ? 'Attack' : 'Sp. Attack'}</label>
            <input
              type="number"
              value={attackerAttack}
              onChange={(e) => setAttackerAttack(Number(e.target.value))}
              min="1"
              max="999"
              className="calc-input"
            />
            <input
              type="range"
              value={attackerAttack}
              onChange={(e) => setAttackerAttack(Number(e.target.value))}
              min="1"
              max="400"
              className="calc-slider"
            />
          </div>

          <div className="modifiers-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={isSTAB}
                onChange={(e) => setIsSTAB(e.target.checked)}
              />
              <span>STAB Bonus</span>
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={isCritical}
                onChange={(e) => setIsCritical(e.target.checked)}
              />
              <span>Critical Hit</span>
            </label>
          </div>
        </motion.div>

        {/* Move Section */}
        <motion.div 
          className="calc-section move-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h3 className="section-title">
            <span className="section-icon">💥</span>
            Move
          </h3>

          <div className="input-group">
            <label>Move Power</label>
            <input
              type="number"
              value={movePower}
              onChange={(e) => setMovePower(Number(e.target.value))}
              min="1"
              max="250"
              className="calc-input"
            />
            <input
              type="range"
              value={movePower}
              onChange={(e) => setMovePower(Number(e.target.value))}
              min="1"
              max="250"
              className="calc-slider"
            />
          </div>

          <div className="input-group">
            <label>Move Type</label>
            <select 
              value={moveType} 
              onChange={(e) => setMoveType(e.target.value)}
              className="calc-select"
            >
              {types.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="category-toggle">
            <button 
              className={`category-btn ${isPhysical ? 'active' : ''}`}
              onClick={() => setIsPhysical(true)}
            >
              💪 Physical
            </button>
            <button 
              className={`category-btn ${!isPhysical ? 'active' : ''}`}
              onClick={() => setIsPhysical(false)}
            >
              ✨ Special
            </button>
          </div>
        </motion.div>

        {/* Defender Section */}
        <motion.div 
          className="calc-section defender-section"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h3 className="section-title">
            <span className="section-icon">🛡️</span>
            Defender
          </h3>

          <div className="input-group">
            <label>HP</label>
            <input
              type="number"
              value={defenderHP}
              onChange={(e) => setDefenderHP(Number(e.target.value))}
              min="1"
              max="999"
              className="calc-input"
            />
            <input
              type="range"
              value={defenderHP}
              onChange={(e) => setDefenderHP(Number(e.target.value))}
              min="1"
              max="500"
              className="calc-slider"
            />
          </div>

          <div className="input-group">
            <label>{isPhysical ? 'Defense' : 'Sp. Defense'}</label>
            <input
              type="number"
              value={defenderDefense}
              onChange={(e) => setDefenderDefense(Number(e.target.value))}
              min="1"
              max="999"
              className="calc-input"
            />
            <input
              type="range"
              value={defenderDefense}
              onChange={(e) => setDefenderDefense(Number(e.target.value))}
              min="1"
              max="400"
              className="calc-slider"
            />
          </div>

          <div className="type-selects">
            <div className="input-group">
              <label>Type 1</label>
              <select 
                value={defenderType1} 
                onChange={(e) => setDefenderType1(e.target.value)}
                className="calc-select"
              >
                {types.map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label>Type 2</label>
              <select 
                value={defenderType2} 
                onChange={(e) => setDefenderType2(e.target.value)}
                className="calc-select"
              >
                <option value="none">None</option>
                {types.map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Environment Section */}
        <motion.div 
          className="calc-section environment-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h3 className="section-title">
            <span className="section-icon">🌍</span>
            Environment
          </h3>

          <div className="environment-options">
            <div className="env-group">
              <label>Weather</label>
              <div className="env-buttons">
                {WEATHER_MODIFIERS.map((w, idx) => (
                  <button
                    key={idx}
                    className={`env-btn ${weather === idx ? 'active' : ''}`}
                    onClick={() => setWeather(idx)}
                    title={w.name}
                  >
                    {w.icon}
                  </button>
                ))}
              </div>
            </div>

            <div className="env-group">
              <label>Terrain</label>
              <div className="env-buttons">
                {TERRAIN_MODIFIERS.map((t, idx) => (
                  <button
                    key={idx}
                    className={`env-btn ${terrain === idx ? 'active' : ''}`}
                    onClick={() => setTerrain(idx)}
                    title={t.name}
                  >
                    {t.icon}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Calculate Button */}
        <motion.div 
          className="calculate-section"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <button 
            className="calculate-btn"
            onClick={calculateDamage}
          >
            <span className="calc-btn-icon">⚡</span>
            Calculate Damage
          </button>
        </motion.div>

        {/* Results Section */}
        {calculatedDamage && (
          <motion.div 
            className="results-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="results-title">Battle Results</h3>
            
            <div className="effectiveness-display">
              <span style={{ color: getEffectivenessText().color }}>
                {getEffectivenessText().text}
              </span>
            </div>

            <div className="damage-range">
              <div className="damage-value">
                <span className="damage-label">Min Damage</span>
                <span className="damage-number">{calculatedDamage.min}</span>
                <span className="damage-percent">
                  ({((calculatedDamage.min / defenderHP) * 100).toFixed(1)}% HP)
                </span>
              </div>
              <div className="damage-value">
                <span className="damage-label">Max Damage</span>
                <span className="damage-number">{calculatedDamage.max}</span>
                <span className="damage-percent">
                  ({((calculatedDamage.max / defenderHP) * 100).toFixed(1)}% HP)
                </span>
              </div>
            </div>

            <div className="hp-bar-container">
              <div className="hp-bar-background">
                <div 
                  className="hp-bar-damage"
                  style={{ 
                    width: `${Math.min(100, (calculatedDamage.max / defenderHP) * 100)}%`,
                    background: 'linear-gradient(90deg, #ff6b6b, #ff4444)'
                  }}
                />
                <div 
                  className="hp-bar-remaining"
                  style={{ 
                    width: `${Math.max(0, 100 - (calculatedDamage.max / defenderHP) * 100)}%`,
                    background: 'linear-gradient(90deg, #4ecdc4, #44a1a0)'
                  }}
                />
              </div>
              <span className="hp-label">
                {Math.max(0, defenderHP - calculatedDamage.max)} / {defenderHP} HP
              </span>
            </div>

            <div className="ko-chance">
              {calculatedDamage.min >= defenderHP && (
                <span className="ko-guaranteed">Guaranteed OHKO!</span>
              )}
              {calculatedDamage.max >= defenderHP && calculatedDamage.min < defenderHP && (
                <span className="ko-possible">Possible OHKO</span>
              )}
              {calculatedDamage.max * 2 >= defenderHP && calculatedDamage.max < defenderHP && (
                <span className="ko-2hit">Guaranteed 2HKO</span>
              )}
            </div>
          </motion.div>
        )}
      </div>

      <style jsx>{`
        .enhanced-calculator {
          padding: 2rem 0;
          min-height: 100vh;
        }

        .calculator-hero {
          text-align: center;
          padding: 3rem 2rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 24px;
          margin-bottom: 3rem;
          color: white;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }

        .calculator-title {
          font-size: 3rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .calculator-subtitle {
          font-size: 1.5rem;
          font-weight: 400;
          opacity: 0.9;
        }

        .calculator-description {
          font-size: 1.2rem;
          opacity: 0.8;
          margin-top: 1rem;
        }

        .calculator-container {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          padding: 0 2rem;
        }

        .calc-section {
          background: white;
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.3rem;
          font-weight: 700;
          color: #333;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #f0f0f0;
        }

        .section-icon {
          font-size: 1.5rem;
        }

        .input-group {
          margin-bottom: 1.5rem;
        }

        .input-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #555;
          font-size: 0.9rem;
        }

        .calc-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          font-size: 1rem;
          transition: all 0.2s;
          margin-bottom: 0.5rem;
        }

        .calc-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .calc-slider {
          width: 100%;
          -webkit-appearance: none;
          height: 8px;
          border-radius: 4px;
          background: #e0e0e0;
          outline: none;
          transition: all 0.2s;
        }

        .calc-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          cursor: pointer;
          transition: all 0.2s;
        }

        .calc-slider::-webkit-slider-thumb:hover {
          transform: scale(1.2);
        }

        .calc-select {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          font-size: 1rem;
          transition: all 0.2s;
          cursor: pointer;
          background: white;
        }

        .calc-select:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .modifiers-group {
          display: flex;
          gap: 1.5rem;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
        }

        .checkbox-label input[type="checkbox"] {
          width: 20px;
          height: 20px;
          cursor: pointer;
        }

        .checkbox-label span {
          font-weight: 500;
          color: #555;
        }

        .category-toggle {
          display: flex;
          gap: 1rem;
        }

        .category-btn {
          flex: 1;
          padding: 0.75rem 1rem;
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          background: white;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .category-btn:hover {
          border-color: #667eea;
          background: #f8f9fa;
        }

        .category-btn.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-color: transparent;
        }

        .type-selects {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .environment-options {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .env-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #555;
          font-size: 0.9rem;
        }

        .env-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .env-btn {
          width: 45px;
          height: 45px;
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          background: white;
          font-size: 1.5rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .env-btn:hover {
          border-color: #667eea;
          background: #f8f9fa;
          transform: translateY(-2px);
        }

        .env-btn.active {
          border-color: #667eea;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
        }

        .calculate-section {
          grid-column: 1 / -1;
          text-align: center;
        }

        .calculate-btn {
          padding: 1.25rem 3rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 16px;
          font-size: 1.2rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s;
          display: inline-flex;
          align-items: center;
          gap: 1rem;
          box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
        }

        .calculate-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 40px rgba(102, 126, 234, 0.4);
        }

        .calc-btn-icon {
          font-size: 1.5rem;
        }

        .results-section {
          grid-column: 1 / -1;
          background: white;
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
        }

        .results-title {
          text-align: center;
          font-size: 1.5rem;
          font-weight: 700;
          color: #333;
          margin-bottom: 2rem;
        }

        .effectiveness-display {
          text-align: center;
          font-size: 1.3rem;
          font-weight: 700;
          margin-bottom: 2rem;
        }

        .damage-range {
          display: flex;
          justify-content: space-around;
          margin-bottom: 2rem;
        }

        .damage-value {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .damage-label {
          font-size: 0.9rem;
          color: #666;
          font-weight: 600;
        }

        .damage-number {
          font-size: 2.5rem;
          font-weight: 800;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .damage-percent {
          font-size: 1rem;
          color: #999;
        }

        .hp-bar-container {
          margin: 2rem 0;
        }

        .hp-bar-background {
          height: 30px;
          background: #f0f0f0;
          border-radius: 15px;
          overflow: hidden;
          display: flex;
          position: relative;
        }

        .hp-bar-damage,
        .hp-bar-remaining {
          height: 100%;
          transition: width 0.5s ease;
        }

        .hp-label {
          display: block;
          text-align: center;
          margin-top: 0.5rem;
          font-weight: 600;
          color: #555;
        }

        .ko-chance {
          text-align: center;
          font-size: 1.2rem;
          font-weight: 700;
        }

        .ko-guaranteed {
          color: #ff4444;
        }

        .ko-possible {
          color: #ff8844;
        }

        .ko-2hit {
          color: #44aaff;
        }

        @media (max-width: 768px) {
          .calculator-title {
            font-size: 2rem;
          }

          .calculator-subtitle {
            font-size: 1.2rem;
          }

          .calculator-container {
            grid-template-columns: 1fr;
            padding: 0 1rem;
          }

          .type-selects {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default EnhancedCalculator;