# Pokédex Application Flow

This document provides a detailed explanation of the application's flow and architecture.

## Component Hierarchy

```
App
├── Header
├── Routes
    ├── PokemonList
    │   ├── GenerationSelector
    │   ├── SearchBar
    │   └── PokemonCard (multiple)
    └── PokemonDetail
        ├── StatsChart
        └── Type Distribution Chart
```

## Data Flow

1. **App Initialization**:
   - The application initializes with the default Generation I (Kanto) Pokémon.
   - Service layer fetches data from the PokéAPI.
   - Loading component is displayed during data retrieval.

2. **Generation Selection**:
   - User selects a generation from the GenerationSelector component.
   - Selection triggers a state change in the PokemonList component.
   - New API requests are sent to fetch Pokémon from the selected generation.
   - The UI updates to display the new set of Pokémon.

3. **Pokémon Filtering**:
   - User enters a search term in the SearchBar.
   - The PokemonList component filters the current generation's Pokémon.
   - Filtered results are displayed immediately without new API requests.

4. **Pokémon Detail View**:
   - User clicks on a PokemonCard component.
   - React Router navigates to the PokemonDetail route with the Pokémon's ID.
   - PokemonDetail component fetches detailed data for the specific Pokémon.
   - StatsChart and Type Distribution components render visualizations.

5. **Navigation**:
   - Back button in the detail view returns to the previous list view.
   - Header link returns to the homepage with default settings.

## API Integration

The application interacts with PokéAPI through the following service functions:

- `getPokemonList`: Retrieves a paginated list of Pokémon
- `getPokemonByGeneration`: Fetches Pokémon specific to a generation
- `getPokemonDetails`: Retrieves comprehensive data about a specific Pokémon
- `getPokemonSpecies`: Fetches species-specific information
- `getAnimatedSprite`: Determines the best animated sprite source

## Animation Strategy

Framer Motion is used throughout the application for smooth transitions:

- List items animate in with staggered delays
- Detail views use coordinated animations for a cohesive experience
- Interactive elements have hover and tap animations
- Generation changes trigger smooth transitions between views

## Responsive Design Approach

The application adapts to different screen sizes through:

- CSS Grid with auto-fit for dynamic column count
- Percentage-based dimensions for flexible layouts
- Media queries for specific layout adjustments
- Touch-friendly hit areas for mobile users

## Performance Considerations

To maintain optimal performance:

- Pokémon data is loaded only when needed
- Images use appropriate sizing and loading strategies
- Animations are hardware-accelerated
- Search functionality operates on client-side data to minimize API calls

## Author

**Frédéric Bourouliou** 