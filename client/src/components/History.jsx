import { useEffect, useState } from "react";
import { clearHistory, deleteHistory, getHistory } from "../services/api";

function History({ refreshKey }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await getHistory();
      setHistory(data.history || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [refreshKey]);

  const handleDelete = async (id) => {
    await deleteHistory(id);
    setHistory(history.filter((item) => item._id !== id));
  };

  const handleClearAll = async () => {
    if (!window.confirm("Clear all history?")) return;
    await clearHistory();
    setHistory([]);
  };

  if (loading) return <p className="mt-6 text-gray-500">Loading history...</p>;

  return (
    <div className="bg-white shadow-xl rounded-2xl p-6 mt-8 w-full max-w-4xl">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-2xl font-bold">Search History</h2>

        <div className="flex gap-3">
          <button
            onClick={loadHistory}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Refresh
          </button>

          <button
            onClick={handleClearAll}
            className="bg-red-600 text-white px-4 py-2 rounded-lg"
          >
            Clear All
          </button>
        </div>
      </div>

      {history.length === 0 ? (
        <p className="text-gray-500">No history found.</p>
      ) : (
        <div className="space-y-4">
          {history.map((item) => (
            <div key={item._id} className="border rounded-xl p-4">
              <div className="flex justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-blue-700">
                    {item.disease}
                  </h3>
                  <p className="text-gray-600">Confidence: {item.confidence}%</p>
                </div>

                <button
                  onClick={() => handleDelete(item._id)}
                  className="text-red-600 font-semibold"
                >
                  Delete
                </button>
              </div>

              <div className="flex gap-2 flex-wrap mt-3">
                {item.symptoms.map((symptom, index) => (
                  <span key={index} className="bg-blue-100 px-3 py-1 rounded-full">
                    {symptom}
                  </span>
                ))}
              </div>

              <p className="text-gray-500 mt-2">
                {new Date(item.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default History;