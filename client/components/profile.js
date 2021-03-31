import React from 'react'
import { Link, useParams } from 'react-router-dom'
import Head from './head'
import Header from './header'

const Profile = () => {
  const { profileId } = useParams()
  return (
    <div>
      <Head title="dashboard Profile 4b9ae8bc-25a4-4b8f-9bcb-953a5b83e3df" />
      <Header />
      <div className="flex items-center justify-center h-screen">
        <div
          id="title"
          className="bg-indigo-800 hover:text-red-500 text-white font-bold rounded-lg border shadow-lg p-10"
        >
          Profile
        </div>
        <div id="username">{profileId}</div>
        <div className="bg-indigo-800 hover:text-red-500 text-white font-bold rounded-lg border shadow-lg p-10">
          <Link to="/dashboard">Go to Root</Link>
        </div>
        <div className="bg-indigo-800 hover:text-red-500 text-white font-bold rounded-lg border shadow-lg p-10">
          <Link to="/dashboard/main">Go to Main</Link>
        </div>
      </div>
    </div>
  )
}

Profile.propTypes = {}

export default Profile
