export interface Comment {
  content: string
  timestamp?: string
  author?: string 
}

export interface Project {
  name: string
  priority?: string
  area?: string[]
  tags?: string[]
}

export interface Action {
  summary: string
  description?: string
  comments?: Comment[]
  project?: Project
  minimumTime?: string
  fullTime?: string
  minimumEnergy?: string
  context?: string[]
  location?: string
  people?: string[]
  tags?: string[]
  status: string,
  type?: string
}

export const actions: Action[] = [{
  summary: 'Zaproponuj wspólną bibliotekę dla demo cars',
  status: 'defined',
  comments:[],
  context: ['wl'],
  description: null,
  fullTime: '1h',
  minimumTime: '15m',
  location: null,
  minimumEnergy: 'high',
  people: ['piotr dybowski','micah żuchowski'],
  project: {
    name: 'Demo Cars',
    area: ['work'],
    priority: 'medium',
    tags: ['tfp','tuatara']
  },
  type: 'discuss'
},{
  summary: 'Przetestuj prisma dla demo cars',
  status: 'defined',
  comments:[],
  context: ['wl'],
  description: null,
  fullTime: '2h',
  minimumTime: '1h',
  location: null,
  minimumEnergy: 'high',
  people: null,
  project: {
    name: 'Demo Cars',
    area: ['work'],
    priority: 'medium',
    tags: ['tfp','tuatara']
  },
  type: 'do'
},{
  summary: 'Ustal jak z dnia na dzień wizualizować bieżącą pracę',
  status: 'defined',
  comments:[],
  context: ['pc'],
  description: null,
  fullTime: '1h',
  minimumTime: '15m',
  location: null,
  minimumEnergy: 'high',
  people: null,
  project: {
    name: 'System improvments',
    area: ['system'],
    priority: 'medium',
    tags: []
  },
  type: 'brainstorm'
}]
