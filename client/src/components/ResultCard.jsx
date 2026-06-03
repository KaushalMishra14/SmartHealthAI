function ResultCard({ result }) {

  if (!result) return null

  return (

    <div className="bg-white shadow-xl rounded-2xl p-6 mt-8">

      <h2 className="text-3xl font-bold text-gray-800 mb-3">
        Prediction Result
      </h2>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-5">

        <p className="text-gray-700">
          Predicted Disease
        </p>

        <h3 className="text-2xl font-bold text-blue-700">
          {result.disease}
        </h3>

        <p className="text-gray-600 mt-2">
          Confidence: {result.confidence}%
        </p>

      </div>

      <div className="grid md:grid-cols-2 gap-5">

        <div className="bg-green-50 border border-green-200 rounded-xl p-4">

          <h4 className="text-xl font-semibold text-green-700 mb-3">
            Home Remedies
          </h4>

          <ul className="list-disc list-inside text-gray-700 space-y-1">

            {
              result.remedies.home_remedy.map(
                (item, index) => (
                  <li key={index}>
                    {item}
                  </li>
                )
              )
            }

          </ul>

        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">

          <h4 className="text-xl font-semibold text-yellow-700 mb-3">
            Ayurvedic Suggestions
          </h4>
          <ul className="list-disc list-inside text-gray-700 space-y-1">

            {
              result.remedies.ayurvedic.map(
                (item, index) => (
                  <li key={index}>
                    {item}
                  </li>
                )
              )
            }

          </ul>
        </div>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-5">

        <h4 className="text-xl font-semibold text-red-700 mb-2">
          Doctor Advice
        </h4>

        <p className="text-gray-700">
          {result.remedies.doctor_advice}
        </p>
      </div>

      {
        result.remedies.learn_more && (

          <a
            href={result.remedies.learn_more}
            target="_blank"
            rel="noreferrer"
            className="
            inline-block
            mt-5
            text-blue-600
            hover:underline
            font-medium"
          >
            Learn More
          </a>
        )
      }
    </div>

  )
}

export default ResultCard