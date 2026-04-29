import type { AdminQuestionCreate, ChatResponseData, Question, TagSuggestion } from './types'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

export async function sendChat(
  message: string,
  topic = 'Sets',
  questionId?: string,
): Promise<ChatResponseData> {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, topic, question_id: questionId ?? null }),
  })
  if (!res.ok) throw new Error(`Chat failed: ${res.status}`)
  return res.json()
}

export async function fetchQuestions(
  topic?: string,
  difficulty?: string,
): Promise<Question[]> {
  const params = new URLSearchParams()
  if (topic) params.set('topic', topic)
  if (difficulty) params.set('difficulty', difficulty)
  const res = await fetch(`${API_BASE}/admin/questions?${params}`)
  if (!res.ok) throw new Error(`Fetch questions failed: ${res.status}`)
  return res.json()
}

export async function generateTags(
  questionText: string,
  markScheme: string,
): Promise<TagSuggestion> {
  const params = new URLSearchParams({ question_text: questionText, mark_scheme: markScheme })
  const res = await fetch(`${API_BASE}/admin/questions/generate-tags?${params}`, {
    method: 'POST',
  })
  if (!res.ok) throw new Error(`Tag generation failed: ${res.status}`)
  return res.json()
}

export async function createQuestion(data: AdminQuestionCreate): Promise<Question> {
  const res = await fetch(`${API_BASE}/admin/questions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`Create question failed: ${res.status}`)
  return res.json()
}

export async function deleteQuestion(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/admin/questions/${id}`, { method: 'DELETE' })
  if (!res.ok && res.status !== 204) throw new Error(`Delete failed: ${res.status}`)
}
