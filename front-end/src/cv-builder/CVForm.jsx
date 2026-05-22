import { useState } from "react";

function CVForm({ cvData, setCvData }) {
    const [activeSection, setActiveSection] = useState("personal");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCvData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSkillChange = (index, field, value) => {
        const newSkills = [...cvData.skills];
        newSkills[index] = {
            ...newSkills[index],
            [field]: value,
        };

        setCvData((prevData) => ({
            ...prevData,
            skills: newSkills,
        }));
    };

    const addSkill = () => {
        setCvData((prevData) => ({
            ...prevData,
            skills: [
                ...prevData.skills,
                {
                    name: "",
                    description: "",
                },
            ],
        }));
    };

    const handleCertificationChange = (index, field, value) => {
        const newCertifications = [...cvData.certifications];
        newCertifications[index] = {
            ...newCertifications[index],
            [field]: value,
        };

        setCvData((prevData) => ({
            ...prevData,
            certifications: newCertifications,
        }));
    };

    const addCertification = () => {
        setCvData((prevData) => ({
            ...prevData,
            certifications: [
                ...prevData.certifications,
                {
                    name: "",
                    startDate: "",
                    endDate: "",
                    isCurrent: false,
                    description: "",
                },
            ],
        }));
    };

    const handleExperienceChange = (index, field, value) => {
        const newExperience = [...cvData.experience];
        newExperience[index] = {
            ...newExperience[index],
            [field]: value,
        };

        setCvData((prevData) => ({
            ...prevData,
            experience: newExperience,
        }));
    };

    const addExperience = () => {
        setCvData((prevData) => ({
            ...prevData,
            experience: [
                ...prevData.experience,
                {
                    company: "",
                    role: "",
                    startDate: "",
                    endDate: "",
                    isCurrent: false,
                    description: "",
                },
            ],
        }));
    };

    const handleEducationChange = (index, field, value) => {
        const newEducation = [...cvData.education];
        newEducation[index] = {
            ...newEducation[index],
            [field]: value,
        };

        setCvData((prevData) => ({
            ...prevData,
            education: newEducation,
        }));
    };

    const addEducation = () => {
        setCvData((prevData) => ({
            ...prevData,
            education: [
                ...prevData.education,
                {
                    school: "",
                    major: "",
                    gpa: "",
                    startDate: "",
                    endDate: "",
                    isCurrent: false,
                    description: "",
                },
            ],
        }));
    };

    return (
        <div className="cv-form">
            <h2>Build your CV</h2>

            <div className="cv-form-tabs">
                <button
                    type="button"
                    className={activeSection === "personal" ? "active-tab" : ""}
                    onClick={() => setActiveSection("personal")}
                >
                    Personal Info
                </button>
                <button
                    type="button"
                    className={activeSection === "summary" ? "active-tab" : ""}
                    onClick={() => setActiveSection("summary")}
                >
                    Summary
                </button>
                <button
                    type="button"
                    className={activeSection === "experience" ? "active-tab" : ""}
                    onClick={() => setActiveSection("experience")}
                >
                    Experience <span className="cv-form-optional">(Optional)</span>
                </button>
                <button
                    type="button"
                    className={activeSection === "education" ? "active-tab" : ""}
                    onClick={() => setActiveSection("education")}
                >
                    Education
                </button>
                <button
                    type="button"
                    className={activeSection === "skills" ? "active-tab" : ""}
                    onClick={() => setActiveSection("skills")}
                >
                    Skills
                </button>
                <button
                    type="button"
                    className={activeSection === "certifications" ? "active-tab" : ""}
                    onClick={() => setActiveSection("certifications")}
                >
                    Certifications <span className="cv-form-optional">(Optional)</span>
                </button>
            </div>

            {activeSection === "personal" && (
                <section className="cv-form-section">

                    <label>Full Name:</label>
                    <input type="text" name="fullName" value={cvData.fullName} onChange={handleChange} />

                    <label>Job Title:</label>
                    <input type="text" name="jobTitle" value={cvData.jobTitle} onChange={handleChange} />

                    <label>Location:</label>
                    <input type="text" name="location" value={cvData.location} onChange={handleChange} />

                    <label>Email:</label>
                    <input type="email" name="email" value={cvData.email} onChange={handleChange} />

                    <label>Phone:</label>
                    <input type="tel" name="phone" value={cvData.phone} onChange={handleChange} />

                    <label>LinkedIn:</label>
                    <input type="url" name="linkedin" value={cvData.linkedin} onChange={handleChange} />

                    <label>Github <span className="cv-form-optional">(Optional)</span>:</label>
                    <input type="url" name="github" value={cvData.github} onChange={handleChange} />
                </section>
            )}

            {activeSection === "summary" && (
                <section className="cv-form-section">
                    <label>Summary:</label>
                    <textarea name="summary" value={cvData.summary} onChange={handleChange} />
                </section>
            )}

            {activeSection === "experience" && (
                <section className="cv-form-section">
                    {cvData.experience.map((exp, index) => (
                        <div key={index} className="cv-form-subsection">
                            <h4>Experience {index + 1}</h4>
                            <input
                                type="text"
                                placeholder="Company"
                                value={exp.company}
                                onChange={(e) => handleExperienceChange(index, "company", e.target.value)}
                            />
                            <input
                                type="text"
                                placeholder="Role"
                                value={exp.role}
                                onChange={(e) => handleExperienceChange(index, "role", e.target.value)}
                            />
                            <input
                                type="date"
                                value={exp.startDate}
                                onChange={(e) => handleExperienceChange(index, "startDate", e.target.value)}
                            />
                            <input
                                type="date"
                                value={exp.endDate}
                                disabled={exp.isCurrent}
                                onChange={(e) => handleExperienceChange(index, "endDate", e.target.value)}
                            />
                            <label>
                                <input
                                    type="checkbox"
                                    checked={exp.isCurrent}
                                    onChange={(e) => handleExperienceChange(index, "isCurrent", e.target.checked)}
                                />
                                Present
                            </label>
                            <textarea
                                placeholder="Description (Optional)"
                                value={exp.description}
                                onChange={(e) => handleExperienceChange(index, "description", e.target.value)}
                            />
                        </div>
                    ))}

                    <button type="button" onClick={addExperience}>
                        Add Experience
                    </button>
                </section>
            )}

            {activeSection === "education" && (
                <section className="cv-form-section">
                    {cvData.education.map((edu, index) => (
                        <div key={index} className="cv-form-subsection">
                            <h4>Education {index + 1}</h4>
                            <input
                                type="text"
                                placeholder="School"
                                value={edu.school}
                                onChange={(e) => handleEducationChange(index, "school", e.target.value)}
                            />
                            <input
                                type="text"
                                placeholder="Major"
                                value={edu.major}
                                onChange={(e) => handleEducationChange(index, "major", e.target.value)}
                            />
                            <input
                                type="text"
                                placeholder="GPA"
                                value={edu.gpa}
                                onChange={(e) => handleEducationChange(index, "gpa", e.target.value)}
                            />
                            <input
                                type="date"
                                value={edu.startDate}
                                onChange={(e) => handleEducationChange(index, "startDate", e.target.value)}
                            />
                            <input
                                type="date"
                                value={edu.endDate}
                                disabled={edu.isCurrent}
                                onChange={(e) => handleEducationChange(index, "endDate", e.target.value)}
                            />
                            <label>
                                <input
                                    type="checkbox"
                                    checked={edu.isCurrent}
                                    onChange={(e) => handleEducationChange(index, "isCurrent", e.target.checked)}
                                />
                                Present
                            </label>
                            <textarea
                                placeholder="Description (Optional)"
                                value={edu.description}
                                onChange={(e) => handleEducationChange(index, "description", e.target.value)}
                            />
                        </div>
                    ))}

                    <button type="button" onClick={addEducation}>
                        Add Education
                    </button>
                </section>
            )}

            {activeSection === "skills" && (
                <section className="cv-form-section">
                    {cvData.skills.map((skill, index) => (
                        <div key={index} className="cv-form-subsection">
                            <h4>Skill {index + 1}</h4>
                            <input
                                type="text"
                                placeholder="Skill Name"
                                value={skill.name}
                                onChange={(e) => handleSkillChange(index, "name", e.target.value)}
                            />
                            <textarea
                                placeholder="Description (Optional)"
                                value={skill.description}
                                onChange={(e) => handleSkillChange(index, "description", e.target.value)}
                            />
                        </div>
                    ))}

                    <button type="button" onClick={addSkill}>
                        Add Skill
                    </button>
                </section>
            )}

            {activeSection === "certifications" && (
                <section className="cv-form-section">
                    
                    {cvData.certifications.map((certificate, index) => (
                        <div key={index} className="cv-form-subsection">
                            <h4>Certification {index + 1}</h4>
                            <input
                                type="text"
                                placeholder="Certificate Name"
                                value={certificate.name}
                                onChange={(e) => handleCertificationChange(index, "name", e.target.value)}
                            />
                            <input
                                type="date"
                                value={certificate.startDate}
                                onChange={(e) => handleCertificationChange(index, "startDate", e.target.value)}
                            />
                            <input
                                type="date"
                                value={certificate.endDate}
                                disabled={certificate.isCurrent}
                                onChange={(e) => handleCertificationChange(index, "endDate", e.target.value)}
                            />
                            <label>
                                <input
                                    type="checkbox"
                                    checked={certificate.isCurrent}
                                    onChange={(e) => handleCertificationChange(index, "isCurrent", e.target.checked)}
                                />
                                Present
                            </label>
                            <textarea
                                placeholder="Description (Optional)"
                                value={certificate.description}
                                onChange={(e) => handleCertificationChange(index, "description", e.target.value)}
                            />
                        </div>
                    ))}

                    <button type="button" onClick={addCertification}>
                        Add Certification
                    </button>
                </section>
            )}
        </div>
    );
}

export default CVForm;
