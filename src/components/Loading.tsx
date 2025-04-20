import { motion } from 'framer-motion'

const Loading = () => {
  return (
    <div className="loading">
      <div className="pokeball-loading">
        <img 
          src="https://i.gifer.com/GZSY.gif" 
          alt="Loading" 
          className="pokeball-gif"
        />
      </div>
      <motion.div
        className="loading-text"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        Loading Pokémon...
      </motion.div>
    </div>
  )
}

export default Loading 