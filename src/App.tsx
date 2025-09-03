import { Routes, Route } from 'react-router-dom'
import EnhancedHeader from './components/EnhancedHeader'
import EnhancedPokemonList from './components/EnhancedPokemonList'
import PokemonDetail from './components/PokemonDetail'
import EnhancedFavorites from './components/EnhancedFavorites'
import BetterComparison from './components/BetterComparison'
import EnhancedTeams from './components/EnhancedTeams'
import EnhancedCalculator from './components/EnhancedCalculator'

const App = () => {
  return (
    <div className="app">
      <EnhancedHeader />
      <div className="container">
        <Routes>
          <Route path="/" element={<EnhancedPokemonList />} />
          <Route path="/pokemon/:id" element={<PokemonDetail />} />
          <Route path="/favorites" element={<EnhancedFavorites />} />
          <Route path="/comparison" element={<BetterComparison />} />
          <Route path="/teams" element={<EnhancedTeams />} />
          <Route path="/calculator" element={<EnhancedCalculator />} />
        </Routes>
      </div>
    </div>
  )
}

export default App