'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import { createQuestion, generateTags } from '@/lib/api'
import type { Difficulty, TagSuggestion } from '@/lib/types'

const EMPTY_TAGS: TagSuggestion = {
  topic: 'Sets',
  subtopic: '',
  concept_tags: [],
  difficulty: 'medium',
  diagram_required: false,
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

const TA = 'w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 resize-none transition-all'
const INPUT = 'w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all'
const SELECT = 'border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all bg-white'

export default function NewQuestionPage() {
  const router = useRouter()

  // Content fields
  const [questionText, setQuestionText] = useState('')
  const [correctAnswer, setCorrectAnswer] = useState('')
  const [markScheme, setMarkScheme] = useState('')
  const [source, setSource] = useState<'past_paper' | 'generated'>('past_paper')
  const [year, setYear] = useState('')
  const [paper, setPaper] = useState('')
  const [variant, setVariant] = useState('')

  // Tag fields (pre-filled by AI, user must review)
  const [tags, setTags] = useState<TagSuggestion>(EMPTY_TAGS)
  const [tagsReviewed, setTagsReviewed] = useState(false)
  const [conceptTagsText, setConceptTagsText] = useState('')

  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [genError, setGenError] = useState('')
  const [saveError, setSaveError] = useState('')

  const canGenerate = questionText.trim().length > 10 && markScheme.trim().length > 5

  async function handleGenerateTags() {
    setGenerating(true)
    setGenError('')
    setTagsReviewed(false)
    try {
      const result = await generateTags(questionText, markScheme)
      setTags(result)
      setConceptTagsText(result.concept_tags.join(', '))
      setTagsReviewed(false)
    } catch {
      setGenError('Tag generation failed. Check that the backend is running.')
    } finally {
      setGenerating(false)
    }
  }

  async function handleSave() {
    if (!tagsReviewed) {
      setSaveError('Please review and confirm the AI-generated tags before saving.')
      return
    }
    if (!questionText.trim() || !correctAnswer.trim() || !markScheme.trim()) {
      setSaveError('Question text, correct answer, and mark scheme are required.')
      return
    }

    setSaving(true)
    setSaveError('')
    try {
      await createQuestion({
        question_text: questionText.trim(),
        correct_answer: correctAnswer.trim(),
        mark_scheme: markScheme.trim(),
        topic: tags.topic,
        subtopic: tags.subtopic || undefined,
        concept_tags: conceptTagsText.split(',').map((t) => t.trim()).filter(Boolean),
        difficulty: tags.difficulty,
        diagram_required: tags.diagram_required,
        year: year ? parseInt(year) : null,
        paper: paper ? parseInt(paper) : null,
        variant: variant ? parseInt(variant) : null,
        source,
      })
      router.push('/admin')
    } catch {
      setSaveError('Save failed. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="px-6 py-4 border-b border-slate-200 bg-white shrink-0 flex items-center gap-4">
          <Link href="/admin" className="text-slate-400 hover:text-slate-600 transition-colors text-sm">
            ← Back
          </Link>
          <div>
            <h2 className="text-base font-semibold text-slate-800">Add New Question</h2>
            <p className="text-xs text-slate-500">Generate tags with AI, then review before saving</p>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto chat-scroll">
          <div className="max-w-2xl mx-auto px-6 py-8 space-y-8">

            {/* ── Section 1: Question content ── */}
            <section className="space-y-5">
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                Question Content
              </h3>

              <Field label="Question Text" required>
                <textarea
                  rows={5}
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Type the full question here, including sub-parts (a), (b)…"
                  className={TA}
                />
              </Field>

              <Field label="Correct Answer" required>
                <textarea
                  rows={3}
                  value={correctAnswer}
                  onChange={(e) => setCorrectAnswer(e.target.value)}
                  placeholder="e.g. (a) {6}  (b) {1, 3, 5, 7, 9}"
                  className={TA}
                />
              </Field>

              <Field label="Mark Scheme" required>
                <textarea
                  rows={4}
                  value={markScheme}
                  onChange={(e) => setMarkScheme(e.target.value)}
                  placeholder="e.g. (a) {6} [B1]  (b) {1, 3, 5, 7, 9} [B1]"
                  className={TA}
                />
              </Field>

              {/* Source + metadata */}
              <div className="grid grid-cols-2 gap-4">
                <Field label="Source">
                  <select
                    value={source}
                    onChange={(e) => setSource(e.target.value as 'past_paper' | 'generated')}
                    className={`${SELECT} w-full`}
                  >
                    <option value="past_paper">Past Paper</option>
                    <option value="generated">Generated</option>
                  </select>
                </Field>
                <Field label="Year">
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    placeholder="e.g. 2023"
                    min={2000}
                    max={2030}
                    className={INPUT}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Paper">
                  <select value={paper} onChange={(e) => setPaper(e.target.value)} className={`${SELECT} w-full`}>
                    <option value="">—</option>
                    <option value="2">Paper 2</option>
                    <option value="4">Paper 4</option>
                  </select>
                </Field>
                <Field label="Variant">
                  <select value={variant} onChange={(e) => setVariant(e.target.value)} className={`${SELECT} w-full`}>
                    <option value="">—</option>
                    <option value="1">Variant 1</option>
                    <option value="2">Variant 2</option>
                    <option value="3">Variant 3</option>
                  </select>
                </Field>
              </div>
            </section>

            {/* ── Section 2: AI Tags ── */}
            <section className="border border-slate-200 rounded-2xl p-5 space-y-4 bg-slate-50">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                  AI Tags
                </h3>
                <button
                  onClick={handleGenerateTags}
                  disabled={!canGenerate || generating}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-colors flex items-center gap-2"
                >
                  {generating ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Generating…
                    </>
                  ) : (
                    '✨ Generate Tags'
                  )}
                </button>
              </div>

              {!canGenerate && (
                <p className="text-xs text-slate-400">
                  Fill in Question Text and Mark Scheme first to enable tag generation.
                </p>
              )}

              {genError && (
                <p className="text-xs text-red-500">{genError}</p>
              )}

              <div className="grid grid-cols-2 gap-4">
                <Field label="Topic">
                  <input
                    value={tags.topic}
                    onChange={(e) => setTags((t) => ({ ...t, topic: e.target.value }))}
                    className={INPUT}
                  />
                </Field>
                <Field label="Subtopic">
                  <input
                    value={tags.subtopic}
                    onChange={(e) => setTags((t) => ({ ...t, subtopic: e.target.value }))}
                    placeholder="e.g. Venn Diagrams — Two Sets"
                    className={INPUT}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Difficulty">
                  <select
                    value={tags.difficulty}
                    onChange={(e) => setTags((t) => ({ ...t, difficulty: e.target.value as Difficulty }))}
                    className={`${SELECT} w-full`}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </Field>
                <Field label="Diagram Required?">
                  <div className="flex items-center gap-3 h-[42px]">
                    <input
                      type="checkbox"
                      id="diagram"
                      checked={tags.diagram_required}
                      onChange={(e) => setTags((t) => ({ ...t, diagram_required: e.target.checked }))}
                      className="w-4 h-4 accent-indigo-600"
                    />
                    <label htmlFor="diagram" className="text-sm text-slate-600">
                      Yes, this question needs a diagram
                    </label>
                  </div>
                </Field>
              </div>

              <Field label="Concept Tags (comma-separated)">
                <input
                  value={conceptTagsText}
                  onChange={(e) => setConceptTagsText(e.target.value)}
                  placeholder="e.g. intersection, union, two-set venn"
                  className={INPUT}
                />
              </Field>

              {/* Review confirmation */}
              {!tagsReviewed ? (
                <button
                  onClick={() => setTagsReviewed(true)}
                  className="w-full py-2.5 border-2 border-indigo-300 hover:border-indigo-500 text-indigo-600 text-sm font-medium rounded-xl transition-colors"
                >
                  ✅ I have reviewed these tags — confirm
                </button>
              ) : (
                <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5">
                  Tags confirmed. You can now save the question.
                </p>
              )}
            </section>

            {/* ── Save / error ── */}
            {saveError && (
              <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                {saveError}
              </p>
            )}

            <div className="flex gap-3 pb-8">
              <Link
                href="/admin"
                className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-medium rounded-xl transition-colors"
              >
                Cancel
              </Link>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving…
                  </>
                ) : (
                  'Save Question'
                )}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
