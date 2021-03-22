import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Head from './head'

const Home = () => {
  const [counter, setCounterNew] = useState(0)

  return (
    <div>
      <Head title="Hello" />
      <button type="button" onClick={() => setCounterNew(counter + 1)}>
        updateCounter
      </button>
      <div className="flex items-center justify-center h-screen">
        <div className="bg-indigo-800 hover:text-red-500 text-white font-bold rounded-lg border shadow-lg p-10">
          Hello welcome to dashboard {counter}
          <Link to="/"> To root with Link</Link>
          <div>
            <a href="/"> To root with href</a>
          </div>
        </div>
      </div>
    </div>
  )
}

Home.propTypes = {}

export default Home
