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
  key?: string
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
  status: string
  type?: string
  actionable: boolean
  priority: string
}
