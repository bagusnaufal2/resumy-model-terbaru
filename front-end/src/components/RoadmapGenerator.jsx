import { useState } from 'react';
import { API_BASE_URL } from '../config/api';

const LOADING_DELAY_MS = 400;

function RoadmapStep({ item, showStepLabel = true }) {
  const resources = Array.isArray(item.learning_resources)
    ? item.learning_resources
    : [];
  const normalizedPriority = String(item.priority || 'medium')
    .trim()
    .toLowerCase();
  const priority = ['high', 'medium', 'low'].includes(normalizedPriority)
    ? normalizedPriority
    : 'medium';

  return (
    <article className='roadmap-step-card'>
      {showStepLabel ? (
        <div className='roadmap-step-header'>
          <span className='roadmap-step-number'>Step {item.step}</span>
        </div>
      ) : null}

      <div className='roadmap-step-title-row'>
        <h3>{item.skill}</h3>
        <span className={`roadmap-priority roadmap-priority-${priority}`}>
          {priority.toUpperCase()} PRIORITY
        </span>
      </div>

      <p className='roadmap-step-weeks'>
        Estimated time: {item.estimated_weeks} week
        {item.estimated_weeks > 1 ? 's' : ''}
      </p>
      <p className='roadmap-step-milestone'>{item.milestone}</p>

      {resources.length > 0 ? (
        <div className='roadmap-resources'>
          <h4>Learning Resources</h4>
          <ul>
            {resources.map((resource, index) => (
              <li key={`${resource.name}-${index}`}>
                {resource.url && resource.url !== 'N/A' ? (
                  <a href={resource.url} target='_blank' rel='noopener noreferrer'>
                    {resource.name}
                  </a>
                ) : (
                  <span>{resource.name}</span>
                )}
                <span className='roadmap-resource-type'>{resource.type}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </article>
  );
}

function RoadmapGenerator() {
  const [targetRole, setTargetRole] = useState('');
  const [roadmapResult, setRoadmapResult] = useState(null);
  const [roadmapError, setRoadmapError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showLoading, setShowLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    const normalizedRole = targetRole.trim();

    if (!normalizedRole || isGenerating) {
      return;
    }

    let loadingTimer;

    try {
      setIsGenerating(true);
      setRoadmapError('');
      setRoadmapResult(null);
      loadingTimer = setTimeout(() => {
        setShowLoading(true);
      }, LOADING_DELAY_MS);

      const response = await fetch(`${API_BASE_URL}/api/generate-roadmap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          target_role: normalizedRole,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || result.detail || 'Roadmap generation failed.',
        );
      }

      setRoadmapResult(result.data);
    } catch (error) {
      setRoadmapResult(null);
      setRoadmapError(error.message || 'Roadmap generation failed.');
    } finally {
      clearTimeout(loadingTimer);
      setShowLoading(false);
      setIsGenerating(false);
    }
  }

  return (
    <main className='roadmap-page'>
      <section className='roadmap-generator-section'>
        <div className='section-heading roadmap-heading'>
          <span className='section-kicker'>Roadmap Generator</span>
          <h2 className='upload-title'>Generate a learning roadmap for your job role</h2>
          <p>
            Enter the job role you want to pursue and get a step-by-step learning plan
            with milestones and study resources.
          </p>
        </div>

        <form className='roadmap-form' onSubmit={handleSubmit}>
          <label htmlFor='target-role'>Job role</label>
          <div className='roadmap-form-row'>
            <input
              id='target-role'
              type='text'
              value={targetRole}
              onChange={(event) => setTargetRole(event.target.value)}
              placeholder='Example: Frontend Developer'
            />
            <button className='primary-button' type='submit' disabled={!targetRole.trim() || isGenerating}>
              {showLoading ? 'Generating...' : 'Generate Roadmap'}
            </button>
          </div>
        </form>

        {roadmapError ? <p className='form-message error-message'>{roadmapError}</p> : null}

        {showLoading ? (
          <section className='roadmap-loading' aria-live='polite' aria-busy='true'>
            <div className='roadmap-loading-card'>
              <span className='roadmap-loading-spinner' aria-hidden='true' />
              <h3>Generating roadmap...</h3>
              <p>Please wait 1-2 minutes.</p>
            </div>
          </section>
        ) : null}

        {roadmapResult ? (
          <section className='roadmap-result roadmap-result-enter'>
            <div className='roadmap-summary-card'>
              <p className='roadmap-target-role'>{roadmapResult.target_role}</p>
              <h3>Your Learning Plan</h3>
              <p>{roadmapResult.summary}</p>
              <div className='roadmap-summary-meta'>
                <span>{roadmapResult.total_estimated_weeks} total weeks</span>
                <span>{roadmapResult.roadmap?.length || 0} learning steps</span>
              </div>
            </div>

            <div className='roadmap-timeline'>
              {(roadmapResult.roadmap || []).map((item) => (
                <div className='roadmap-timeline-item' key={`${item.step}-${item.skill}`}>
                  <div className='roadmap-timeline-marker' aria-hidden='true'>
                    <span>{item.step}</span>
                  </div>
                  <RoadmapStep item={item} showStepLabel={false} />
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </section>
    </main>
  );
}

export default RoadmapGenerator;
