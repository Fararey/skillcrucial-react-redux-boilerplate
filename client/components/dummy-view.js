import axios from 'axios'
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Head from './head'

const Dummy = () => {
  const [text, setText] = useState('')
  const [textFromServer, setTextFromServer] = useState('')

  const OnClick = () => {
    axios.post('/api/v1/input', { input: text }).then(({ data }) => setTextFromServer(data.result))
  }

  return (
    <div>
      <Head title="Hello" />
      <div className="flex items-center justify-center h-screen">
        <div className="bg-indigo-800 text-white font-bold rounded-lg border shadow-lg p-10">
          This is Dummy-view
          <div>
            <Link to="/dashboard/">Go to dashboard to see Homework</Link>
          </div>
        </div>
        <div className="bg-indigo-800 text-white font-bold rounded-lg border shadow-lg p-10">
          <div>Enter your text: </div>
          <div className="text-black">
            <input type="text" onChange={(event) => setText(event.target.value)} value={text} />
          </div>
          <div>
            <button type="button" onClick={OnClick}>
              Send
            </button>
          </div>
          <div>{textFromServer}</div>
        </div>
      </div>
    </div>
  )
}

Dummy.propTypes = {}

export default React.memo(Dummy)
