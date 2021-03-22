import React from 'react'
import { Link, useParams } from 'react-router-dom'
import Head from './head'

const Planets = () => {
  const { planetId } = useParams()
  return (
    <div>
      <Head title="Hello" />
      <div className="flex items-center justify-center h-screen">
        <div className="bg-indigo-800 hover:text-red-500 text-white font-bold rounded-lg border shadow-lg p-10">
          HELLO YOU ARE ON PLANET:{planetId}
          <Link to="/"> To root with Link</Link>
          <div>
            <a href="/"> To root with href</a>
          </div>
        </div>
      </div>
    </div>
  )
}

Planets.propTypes = {}

export default Planets
