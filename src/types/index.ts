export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert'

export interface SummarySection {
  title: string
  content: string
}

export interface Flashcard {
  id: string
  front: string
  back: string
}

interface BaseQuestion {
  id: string
  question: string
  explanation: string
  difficulty: Difficulty
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: 'multiple-choice'
  options: string[]
  answer: number
}

export interface TrueFalseQuestion extends BaseQuestion {
  type: 'true-false'
  answer: boolean
}

export interface ShortAnswerQuestion extends BaseQuestion {
  type: 'short-answer'
  answer: string
  acceptedAnswers: string[]
}

export type Question = MultipleChoiceQuestion | TrueFalseQuestion | ShortAnswerQuestion

export interface Domain {
  id: number
  name: string
  weight: number
  summary: SummarySection[]
  flashcards: Flashcard[]
  questions: Question[]
}

export interface Certification {
  id: string
  name: string
  description: string
  domains: Domain[]
}

export type DomainFilter = 'all' | 'weighted' | 'custom'

export interface QuizSession {
  questions: Question[]
  currentIndex: number
  answers: Record<string, string | number | boolean>
  submitted: Record<string, boolean>
  score: number
  complete: boolean
}
