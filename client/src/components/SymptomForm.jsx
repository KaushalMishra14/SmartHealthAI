import { useEffect, useState } from "react"
import { predictDisease, getSymptoms } from "../services/api"
import ResultCard from "./ResultCard"

function SymptomForm({ onPredictionDone }) {
  const [search, setSearch] = useState("")
  const [symptomsData, setSymptomsData] = useState([])
  const [selectedSymptoms, setSelectedSymptoms] = useState([])
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [symptomsLoading, setSymptomsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const loadSymptoms = async () => {
      try {
        const symptoms = await getSymptoms()
        setSymptomsData(symptoms)
      } catch (err) {
        setError("Unable to load symptoms. Make sure backend and ML API are running.")
      } finally {
        setSymptomsLoading(false)
      }
    }

    loadSymptoms()
  }, [])

  const filteredSymptoms = symptomsData.filter(
    (symptom) =>
      symptom.toLowerCase().includes(search.toLowerCase()) &&
      !selectedSymptoms.includes(symptom)
  )

  const addSymptom = (symptom) => {
    setSelectedSymptoms([...selectedSymptoms, symptom])
    setSearch("")
    setResult(null)
    setError("")
  }

  const removeSymptom = (symptom) => {
    setSelectedSymptoms(
      selectedSymptoms.filter((item) => item !== symptom)
    )
    setResult(null)
  }

  const handlePredict = async () => {
    if (selectedSymptoms.length === 0) {
      setError("Please select at least one symptom.")
      return
    }

    try {
      setLoading(true)
      setError("")
      setResult(null)

      const data = await predictDisease(selectedSymptoms)

      if (data.success) {
        setResult(data);
        onPredictionDone && onPredictionDone();
      } else {
        setError(data.message || "Prediction failed.")
      }
    } catch (err) {
      setError("Unable to connect to backend. Make sure Node and ML API are running.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-4xl mt-10">

      <div className="bg-white shadow-xl rounded-2xl p-6">

        <h2 className="text-2xl font-bold mb-5 text-gray-800">
          Select Symptoms
        </h2>

        {symptomsLoading ? (
          <p className="text-gray-500">Loading symptoms...</p>
        ) : (
          <>
            <input
              type="text"
              placeholder="Search symptoms..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />

            {search && (
              <div className="border border-gray-200 rounded-lg mt-2 max-h-52 overflow-y-auto bg-white">
                {filteredSymptoms.length > 0 ? (
                  filteredSymptoms.map((symptom, index) => (
                    <div
                      key={index}
                      onClick={() => addSymptom(symptom)}
                      className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                    >
                      {symptom}
                    </div>
                  ))
                ) : (
                  <p className="px-4 py-3 text-gray-500">
                    No symptom found
                  </p>
                )}
              </div>
            )}
          </>
        )}

        <div className="flex flex-wrap gap-3 mt-6">
          {selectedSymptoms.map((symptom, index) => (
            <div
              key={index}
              className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full flex items-center gap-2"
            >
              <span>{symptom}</span>

              <button
                onClick={() => removeSymptom(symptom)}
                className="text-red-500 font-bold"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        {error && (
          <p className="mt-4 text-red-600 font-medium">
            {error}
          </p>
        )}

        <button
          onClick={handlePredict}
          disabled={loading || symptomsLoading}
          className="mt-8 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-xl font-semibold"
        >
          {loading ? "Predicting..." : "Predict Disease"}
        </button>

      </div>

      <ResultCard result={result} />


    </div>
  )
}

export default SymptomForm