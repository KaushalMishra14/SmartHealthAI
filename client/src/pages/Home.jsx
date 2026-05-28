import Login from "./Login";
import Register from "./Register";
import { useState } from "react";
import Navbar from "../components/Navbar";
import SymptomForm from "../components/SymptomForm";
import Chatbot from "../components/Chatbot";
import History from "../components/History";

function Home() {
  const [historyRefresh, setHistoryRefresh] = useState(0);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="flex flex-col items-center px-4 py-10">
        <h2 className="text-4xl font-bold text-gray-800 text-center">
          Smart Medical Recommendation System
        </h2>

        <p className="text-gray-600 text-lg mt-4 text-center">
          Predict diseases using symptoms and get AI-powered guidance.
        </p>


        <SymptomForm onPredictionDone={() => setHistoryRefresh((prev) => prev + 1)} />
        <Chatbot />
        <History refreshKey={historyRefresh} />
      </div>
    </div>
  );
}

export default Home;