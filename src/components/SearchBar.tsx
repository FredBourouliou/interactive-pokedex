import { useState, useEffect } from 'react'

interface SearchBarProps {
  onSearch: (searchTerm: string) => void;
  initialValue?: string;
}

const SearchBar = ({ onSearch, initialValue = '' }: SearchBarProps) => {
  const [searchTerm, setSearchTerm] = useState(initialValue)

  useEffect(() => {
    setSearchTerm(initialValue);
  }, [initialValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(searchTerm)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Recherche automatique après un court délai
    if (value.trim() === '') {
      onSearch(value); // Réinitialiser immédiatement si vide
    }
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <input
        type="text"
        className="search-input"
        data-testid="search-input"
        placeholder="Search Pokémon by name or ID..."
        value={searchTerm}
        onChange={handleChange}
      />
      <button type="submit" className="search-button" data-testid="search-button">
        Search
      </button>
    </form>
  )
}

export default SearchBar 