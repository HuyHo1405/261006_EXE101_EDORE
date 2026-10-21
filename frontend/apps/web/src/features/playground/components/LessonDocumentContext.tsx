'use client'

import { createContext } from 'react'
import type { LessonDocumentRequest } from '../utils/lessonDocument'

export const LessonDocumentContext = createContext<LessonDocumentRequest | null>(null)
