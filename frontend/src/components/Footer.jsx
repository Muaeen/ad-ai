import React from 'react'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="mt-auto py-4 text-center text-white/80">
      <Link 
        to="/contact" 
        className="hover:text-white transition-colors duration-200 cursor-pointer underline decoration-dotted hover:decoration-solid"
      >
        Hello world
      </Link>
    </footer>
  )
}

export default Footer 