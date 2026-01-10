import { Sprout } from 'lucide-react'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-leaf-50 to-soil-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <Sprout className="w-16 h-16 text-leaf-600" />
          </div>
          <h1 className="text-5xl font-bold text-soil-900 mb-4">
            HortiLogic
          </h1>
          <p className="text-xl text-soil-700 mb-8">
            Parametric Garden Planner
          </p>
          <div className="bg-white rounded-lg shadow-lg p-8 text-left">
            <h2 className="text-2xl font-semibold text-soil-800 mb-4">
              Getting Started
            </h2>
            <p className="text-soil-600 mb-4">
              Welcome to HortiLogic, your desktop-first garden planning tool using Square Foot Gardening principles.
            </p>
            <div className="space-y-2 text-soil-600">
              <p>✓ React + Vite + TypeScript configured</p>
              <p>✓ Tailwind CSS with custom garden theme</p>
              <p>✓ Lucide icons ready to use</p>
              <p>✓ Ready to build The Grid!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
