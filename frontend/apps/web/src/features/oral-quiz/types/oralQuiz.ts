export interface LessonQuestionDTO {
  id: string;
  lessonId?: string;
  lessonCode?: string;
  questionText: string;
  options: string[];
  correctAnswer: number; // 1-indexed (1, 2, 3, 4)
  timeLimit: number; // in seconds, default 30
  stageTag?: string;
  difficulty?: string;
  explanation?: string;
}

export interface StudentRecord {
  stt: number;
  name?: string;
  calledCount: number;
  lastResult?: 'correct' | 'incorrect' | 'skipped';
}

export type QuizStage = 'setup' | 'spinning' | 'question_ready' | 'answer_revealed';
