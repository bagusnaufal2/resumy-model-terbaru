import { Link } from "react-router-dom";

function SkillTags({ skills = [], emptyLabel }) {
    if (!skills.length) {
        return <p className="empty-result">{emptyLabel}</p>;
    }

    return (
        <div className="skill-tags">
            {skills.map((skill) => (
                <span className="skill-tag" key={skill}>
                    {skill}
                </span>
            ))}
        </div>
    );
}

function DashboardResult({ result }) {
    return (
        <section className="result-dashboard" id="result-dashboard">
            <div className="section-heading result-heading">
                <span className="section-kicker">Analysis Result</span>
                <h2 className="upload-title">Your resume match report</h2>
                <p>
                    Review your ATS match score, CV skills, missing keywords, and next steps
                    before improving your CV.
                </p>
                <Link className="secondary-link result-back-button" to="/">
                    Back to Home
                </Link>
            </div>

            <div className="score-section">
                <h3>ATS Match Score</h3>
                <div
                    className="score-circle"
                    style={{ "--score-value": `${result.score}%` }}
                    aria-label={`ATS match score ${result.score} percent`}
                >
                    <span>{result.score}%</span>
                </div>
                <p>My Result</p>
            </div>

            <div className="result-grid">
                <div className="result-left">
                    <div className="result-card">
                        <h4>Skills you have</h4>
                        <SkillTags
                            skills={result.skillsHave}
                            emptyLabel="No readable technical skills found in the CV."
                        />
                    </div>

                    <div className="result-card">
                        <h4>Skills missing from your CV</h4>
                        <SkillTags
                            skills={result.skillsMissing}
                            emptyLabel="No missing job-description skills found."
                        />
                    </div>
                </div>

                <div className="result-right">
                    <div className="result-card">
                        <h4>What to improve</h4>
                        <ul className="improvement-list">
                            {(result.improvements || []).map((item) => (
                                <li key={item}>{item}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default DashboardResult;
