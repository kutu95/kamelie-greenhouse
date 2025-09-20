export default function TestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 flex items-center justify-center">
      <div className="text-center text-white">
        <h1 className="text-6xl font-bold mb-4">TEST PAGE</h1>
        <p className="text-2xl">If you see this with a green gradient background, styling is working!</p>
        <div className="mt-8 p-8 bg-white/20 rounded-lg backdrop-blur-sm">
          <p className="text-lg">This should have a semi-transparent white background</p>
        </div>
      </div>
    </div>
  )
}
