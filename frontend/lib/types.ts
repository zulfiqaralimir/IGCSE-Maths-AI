export type Difficulty = 'easy' | 'medium' | 'hard'

export interface SimilarQuestion {
  id: string
  question_text: string
  difficulty: Difficulty
  subtopic: string | null
}

export interface ChatResponseData {
  explanation: string
  steps: string[]
  diagram_url: string | null
  similar_questions: SimilarQuestion[]
  audio_url: string | null
  tool_used: string
  marks: number | null
  feedback: string | null
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  data?: ChatResponseData
}

export interface Question {
  id: string
  question_text: string
  topic: string
  subtopic: string | null
  difficulty: Difficulty
  source: string
  year: number | null
  paper: number | null
  variant: number | null
  diagram_required: boolean
}

export interface TagSuggestion {
  topic: string
  subtopic: string
  concept_tags: string[]
  difficulty: Difficulty
  diagram_required: boolean
}

export interface AdminQuestionCreate {
  question_text: string
  correct_answer: string
  mark_scheme: string
  topic: string
  subtopic?: string
  concept_tags: string[]
  difficulty: Difficulty
  diagram_required: boolean
  year?: number | null
  paper?: number | null
  variant?: number | null
  source: string
}
