'use client'

import { useEffect, useState } from 'react'

export default function TestPage() {
  const [mounted, setMounted] = useState(false)
  const [count, setCount] = useState(0)

  useEffect(() => {
    console.log('🔥 Test page useEffect triggered!')
    setMounted(true)
  }, [])

  const handleClick = () => {
    setCount(prev => prev + 1)
    console.log('🔥 Button clicked! Count:', count + 1)
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Page</h1>
      <div className="mb-4">
        <p>Mounted: {mounted ? 'true' : 'false'}</p>
        <p>Count: {count}</p>
      </div>
      <button 
        onClick={handleClick}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Click me
      </button>
      <div className="mt-4 text-sm text-gray-600">
        If this button works and the count increases, then client-side JavaScript is working.
      </div>
    </div>
  )
}