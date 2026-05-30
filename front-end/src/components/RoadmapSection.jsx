function RoadmapSection({ roadmap }) {
  if (!roadmap) return null;

  return (
    <div className='roadmap-section'>
      <div className='result-card'>
        <h3>Learning Roadmap</h3>

        <p className='roadmap-summary'>{roadmap.summary}</p>

        <p>
          <strong>Target Role:</strong> {roadmap.job_title}
        </p>

        <p>
          <strong>Estimated Duration:</strong> {roadmap.total_estimated_weeks}{' '}
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
            <strong>Estimated Time:</strong> {step.estimated_weeks} weeks
          </p>

          <p>
            <strong>Milestone:</strong> {step.milestone}
          </p>

          <div>
            <strong>Resources:</strong>

            <ul>
              {step.learning_resources.map((resource, index) => (
                <li key={index}>
                  <a href={resource.url} target='_blank' rel='noreferrer'>
                    {resource.name}
                  </a>
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
