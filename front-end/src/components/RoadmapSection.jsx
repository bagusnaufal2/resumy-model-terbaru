function RoadmapSection({ roadmap }) {
  if (!roadmap) {
    return null;
  }

  if (!roadmap.roadmap || !Array.isArray(roadmap.roadmap)) {
    return null;
  }

  return (
    <div className='roadmap-section'>
      <div className='result-card'>
        <h3>Learning Roadmap</h3>

        <p className='roadmap-summary'>{roadmap.summary}</p>

        <p>
          <strong>Target Role:</strong> {roadmap.jobTitle}
        </p>

        <p>
          <strong>Estimated Duration:</strong> {roadmap.totalEstimatedWeeks}{' '}
          weeks
        </p>
      </div>

      {roadmap.roadmap.map((step) => (
        <div key={step.step} className='result-card roadmap-card'>
          <h4>
            Step {step.step}: {step.skill}
          </h4>

          <p>
            <strong>Priority:</strong> {step.priority}
          </p>

          <p>
            <strong>Estimated Time:</strong> {step.estimatedWeeks} weeks
          </p>

          <p>
            <strong>Milestone:</strong> {step.milestone}
          </p>

          <div>
            <strong>Resources:</strong>

            <ul>
              {(step.learningResources || []).map((resource, index) => (
                <li key={index}>
                  {resource.url && resource.url !== 'N/A' ? (
                    <a href={resource.url} target='_blank' rel='noreferrer'>
                      {resource.name} ({resource.type})
                    </a>
                  ) : (
                    <span>
                      {resource.name} ({resource.type})
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
}

export default RoadmapSection;
