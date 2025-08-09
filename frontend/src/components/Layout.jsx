import React from 'react'
import Navbar from './Navbar'

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-x-hidden">
      <Navbar />
      <main className="pt-16 overflow-x-hidden">
        {children}
      </main>
    </div>
  )
}

export default Layout
