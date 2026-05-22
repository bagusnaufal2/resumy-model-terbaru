import { useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import UploadSection from "./components/UploadSection";
import DashboardResult from "./components/ResultDashboard";
import CVBuilder from "./cv-builder/CVBuilder";

import "./styles/style.css";

const RESULT_STORAGE_KEY = "analysis-result";
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000";

function App() {
  const [result, setResult] = useState(() => {
    const savedResult = sessionStorage.getItem(RESULT_STORAGE_KEY);
    return savedResult ? JSON.parse(savedResult) : null;
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState("");
  const navigate = useNavigate();

  async function handleAnalyze(file, jobDescription) {
    if (!file || !jobDescription) return;

    try {
      setIsAnalyzing(true);
      setAnalyzeError("");

     const formData = new FormData();
     formData.append("resume", file);
     formData.append("jobDescription", jobDescription);

     const response = await fetch(`${API_BASE_URL}/api/analyze`, {
        method: "POST",
        body: formData,
     });

     const result = await response.json();

     if (!response.ok) {
        throw new Error(result.message || "Analysis failed.");
     }

     setResult(result.data);
     sessionStorage.setItem(RESULT_STORAGE_KEY, JSON.stringify(result.data));
     navigate("/result");
     window.scrollTo({top:0, behavior: "smooth"});

    } catch (error) {
      setAnalyzeError(error.message);
    } finally {
      setIsAnalyzing(false);
    }}

  return (
    <div className="App">
      <div className="container">
        <Navbar />
        <Routes>
          <Route
            path="/"
            element={(
              <>
                <HeroSection />
                <UploadSection
                  onAnalyze={handleAnalyze}
                  isAnalyzing={isAnalyzing}
                  analyzeError={analyzeError}
                />
              </>
            )}
          />
          <Route
            path="/cv-builder"
            element={<CVBuilder />}
          />
          <Route
            path="/result"
            element={
              result ? (
                <main className="result-page">
                  <DashboardResult result={result} />
                </main>
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
        </Routes>
      </div>
    </div>
  );
}

export default App;
