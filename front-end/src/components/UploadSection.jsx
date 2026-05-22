import { useState } from "react";
import { FaCloudUploadAlt, FaNodeJs, FaPython, FaReact } from "react-icons/fa";
import { SiPostgresql } from "react-icons/si";

const ALLOWED_EXTENSIONS = [".pdf", ".docx"];
const MAX_FILE_SIZE = 2 * 1024 * 1024;

const techList = [
  {
    icon: <FaReact />,
    label: "React",
    description: "Builds a responsive and interactive user interface.",
  },
  {
    icon: <FaNodeJs />,
    label: "Node.js",
    description: "Handles backend logic and service communication.",
  },
  {
    icon: <FaPython />,
    label: "Python",
    description: "Supports parsing and intelligent resume analysis.",
  },
  {
    icon: <SiPostgresql />,
    label: "PostgreSQL",
    description: "Stores structured resume and scoring data securely.",
  },
];

function UploadSection({ onAnalyze, isAnalyzing, analyzeError }) {
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  function handleFileChange(event) {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      setFile(null);
      setFileError("");
      return;
    }

    const fileName = selectedFile.name.toLowerCase();
    const hasValidExtension = ALLOWED_EXTENSIONS.some((extension) =>
      fileName.endsWith(extension)
    );

    if (!hasValidExtension) {
      setFile(null);
      setFileError("Please upload a PDF or DOCX file.");
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setFile(null);
      setFileError("File size must be 2 MB or smaller.");
      return;
    }

    setFile(selectedFile);
    setFileError("");
  }

  function handleAnalyzeClick() {
    if (file && jobDescription.trim() && !fileError && !isAnalyzing) {
      onAnalyze(file, jobDescription.trim());
    }
  }

  return (
    <section className="upload-section" id="upload-cv">
      <div className="section-heading">
        <span className="section-kicker">Resume Upload</span>
        <h2 className="upload-title">
          Upload your resume and get a match report
        </h2>
        <p className="upload-subtitle">
          Drop a PDF or DOCX file, match it with a job description, and review
          the skill gaps before your next revision.
        </p>
      </div>

      <label className="upload-box">
        <input
          type="file"
          accept=".pdf,.docx"
          onChange={handleFileChange}
          hidden
        />
        <div className="upload-icon">
          <FaCloudUploadAlt />
        </div>
        <p>
          <strong>Click to Upload</strong>{" "}
        </p>
        <br />
        Input your CV or select it from your computer.
        <br />
        PDF or DOCX up to 2 MB.
        {file && <span className="file-name">{file.name}</span>}
      </label>
      <div className="job-description-field">
        <label htmlFor="job-description">Job description</label>
        <textarea
          id="job-description"
          value={jobDescription}
          onChange={(event) => setJobDescription(event.target.value)}
          placeholder="Paste the target job description"
        />
      </div>
      {fileError && <p className="form-message error-message">{fileError}</p>}
      {analyzeError && (
        <p className="form-message error-message">{analyzeError}</p>
      )}
      <div className="upload-actions">
        <button
          className="primary-button"
          type="button"
          onClick={handleAnalyzeClick}
          disabled={
            !file ||
            !jobDescription.trim() ||
            Boolean(fileError) ||
            isAnalyzing
          }
        >
          {isAnalyzing ? "Analyzing..." : "Analyze Your CV"}
        </button>
      </div>

      <div className="tech-strip" id="tech">
        <p className="tech-strip-description">
          Built with a modern stack for lightning-fast analysis and seamless
          resume processing.
        </p>
        <div className="tech-logos">
          {techList.map((tech) => (
            <div
              className="tech-logo-item"
              key={tech.label}
              aria-label={tech.label}
              title={tech.label}
            >
              <span className="tech-logo-icon">{tech.icon}</span>
              <div className="tech-logo-copy">
                <span className="tech-logo-text">{tech.label}</span>
                <span className="tech-logo-description">
                  {tech.description}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default UploadSection;
