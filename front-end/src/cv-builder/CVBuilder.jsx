import { useState } from 'react';
import CVForm from './CVForm';
import CVPreview from './CVPreview';
import html2pdf from 'html2pdf.js';

function CVBuilder() {
  const [cvData, setCvData] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    jobTitle: '',
    summary: '',
    skills: [
      {
        name: '',
        description: '',
      },
    ],

    certifications: [
      {
        name: '',
        issuingOrganization: '',
        certificateLink: '',
        startDate: '',
        endDate: '',
        isCurrent: false,
        description: '',
      },
    ],
    experience: [
      {
        company: '',
        role: '',
        startDate: '',
        endDate: '',
        isCurrent: false,
        description: '',
      },
    ],
    education: [
      {
        school: '',
        major: '',
        gpa: '',
        startDate: '',
        endDate: '',
        isCurrent: false,
        description: '',
      },
    ],
  });

  const handleDownloadCV = () => {
    const element = document.getElementById('cv-preview');

    const opt = {
      margin: 0.5,
      filename: 'my-cv.pdf',
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { scale: 2 },
      jsPDF: {
        unit: 'in',
        format: 'a4',
        orientation: 'portrait',
      },
      enableLinks: true,
    };

    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className='cv-builder-page'>
      <div className='cv-builder-layout'>
        <section className='cv-builder-form-panel'>
          <CVForm cvData={cvData} setCvData={setCvData} />
        </section>

        <section className='cv-builder-preview-panel'>
          <CVPreview cvData={cvData} />
          <div className='cv-preview-actions'>
            <button type='button' onClick={handleDownloadCV}>
              Download CV
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default CVBuilder;
