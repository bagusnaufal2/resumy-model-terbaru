export const roadmapMock = {
  job_title: 'Machine Learning Engineer',

  summary:
    'Pelajari deployment dan backend skill yang dibutuhkan untuk posisi Machine Learning Engineer.',

  total_estimated_weeks: 8,

  roadmap: [
    {
      step: 1,
      skill: 'FastAPI',
      priority: 'high',
      estimated_weeks: 2,

      learning_resources: [
        {
          type: 'documentation',
          name: 'FastAPI Docs',
          url: 'https://fastapi.tiangolo.com',
        },
      ],

      milestone: 'Membuat REST API untuk model Machine Learning.',
    },

    {
      step: 2,
      skill: 'Docker',
      priority: 'high',
      estimated_weeks: 2,

      learning_resources: [
        {
          type: 'documentation',
          name: 'Docker Docs',
          url: 'https://docs.docker.com',
        },
      ],

      milestone: 'Containerize aplikasi menggunakan Docker.',
    },

    {
      step: 3,
      skill: 'Kubernetes',
      priority: 'medium',
      estimated_weeks: 4,

      learning_resources: [
        {
          type: 'documentation',
          name: 'Kubernetes Docs',
          url: 'https://kubernetes.io/docs',
        },
      ],

      milestone: 'Deploy aplikasi ke Kubernetes Cluster.',
    },
  ],
};
