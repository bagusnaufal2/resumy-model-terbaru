import { useState } from 'react';
import CVForm from './CVForm';
import CVPreview from './CVPreview';

function CVBuilder() {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState('');
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

  const handleDownloadCV = async () => {
    try {
      setIsDownloading(true);
      setDownloadError('');

      const html2pdfModule = await import('html2pdf.js');
      const html2pdf = html2pdfModule.default || html2pdfModule;
      const element = document.getElementById('cv-preview');

      if (!element) {
        throw new Error('CV preview is not ready yet.');
      }

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

      await html2pdf().set(opt).from(element).save();
    } catch {
      setDownloadError('PDF could not be generated. Please try again.');
    } finally {
      setIsDownloading(false);
    }
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
            {downloadError && (
              <p className='cv-download-error' aria-live='polite'>
                {downloadError}
              </p>
            )}
            <button
              type='button'
              onClick={handleDownloadCV}
              disabled={isDownloading}
              aria-busy={isDownloading}
            >
              {isDownloading ? 'Generating PDF...' : 'Download CV'}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default CVBuilder;
