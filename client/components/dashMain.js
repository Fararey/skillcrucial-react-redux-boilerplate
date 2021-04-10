import React from 'react'
import { Link } from 'react-router-dom'
import Head from './head'

const Main = () => {
  return (
    <div>
      <Head title="Dashboard Main" />
      <div className="flex items-center justify-center h-screen">
        <div
          id="title"
          className="bg-red-800 text-white font-bold rounded-lg border shadow-lg p-10"
        >
          Main
        </div>
        <div className="bg-indigo-800 hover:text-red-500 text-white font-bold rounded-lg border shadow-lg p-10">
          <Link to="/dashboard">Go to Root</Link>
        </div>
        <div className="bg-indigo-800 hover:text-red-500 text-white font-bold rounded-lg border shadow-lg p-10">
          <Link to="/dashboard/profile/4b9ae8bc-25a4-4b8f-9bcb-953a5b83e3df">Go to Profile</Link>
        </div>
      </div>
    </div>
  )
}

Main.propTypes = {}

export default Main
