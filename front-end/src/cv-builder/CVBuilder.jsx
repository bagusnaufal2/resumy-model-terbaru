import { useState } from 'react';
import CVForm from './CVForm';
import CVPreview from './CVPreview';

function CVBuilder() {
    const [cvData, setCvData] = useState({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    github: "",
    jobTitle: "",
    summary: "",
    skills: [
        {
            name: "",
            description: "",
        },
    ],
    certifications: [
        {
            name: "",
            startDate: "",
            endDate: "",
            isCurrent: false,
            description: "",
        },
    ],
    experience: [
        {
            company: "",
            role: "",
            startDate: "",
            endDate: "",
            isCurrent: false,
            description: "",
        },
    ],
    education: [
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
});

const handleDownloadCV = () => {
    window.print();
};


    return (
        <div className="cv-builder-page">
            <div className='cv-builder-layout'>
            <section className="cv-builder-form-panel">
                <CVForm cvData={cvData} setCvData={setCvData} />
            </section>

            <section className="cv-builder-preview-panel">
                <CVPreview cvData={cvData} />
                <div className="cv-preview-actions">
                <button type="button" onClick={handleDownloadCV}>
                    Download CV
                </button>
            </div>
            </section>
            </div>    
        </div>

    );
}

export default CVBuilder;
