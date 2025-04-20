import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import PokemonList from './components/PokemonList'
import PokemonDetail from './components/PokemonDetail'

const App = () => {
  return (
    <div className="app">
      <Header />
      <div className="container">
        <Routes>
          <Route path="/" element={<PokemonList />} />
          <Route path="/pokemon/:id" element={<PokemonDetail />} />
        </Routes>
      </div>
    </div>
  )
}

export default App 