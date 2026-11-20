import rawDataset from "./teacherFeedback.json";

export type TeacherGradeLevel = "THCS" | "THPT" | "Khác";

export interface TeacherFeedbackRatings {
  ai: number;
  export: number;
  wheel: number;
}

export interface TeacherFeedbackDetails {
  aiFeedback: string;
  exportFeedback: string;
  priorityProposal: string;
  exportFormats: string[];
}

/**
 * Dữ liệu phản hồi chi tiết của từng giáo viên được chọn lọc từ khảo sát thực tế.
 */
export interface TeacherFeedbackItem {
  id: string;
  featured: boolean;
  teacherName: string;
  gradeLevel: TeacherGradeLevel;
  subject: string;
  traditionalPrepTime: string;
  timeSaved: string;
  editRatio: string;
  nps: number;
  usefulFeatures: string[];
  ratings: TeacherFeedbackRatings;
  quote: string;
  details: TeacherFeedbackDetails;
}

export interface SurveyGroupScore {
  id: string;
  label: string;
  score: number;
  maxScore: number;
}

export interface SurveyCriterionScore {
  group: string;
  criterion: string;
  score: number;
  responses: number;
}

export interface SurveyImprovementPriority {
  id: string;
  title: string;
  description: string;
}

export interface SurveyReportSummary {
  surveyPeriod: string;
  reportDate: string;
  totalResponses: number;
  uniqueTeachers: number;
  npsScore: number;
  averageNps: number;
  timeSavedOver50Percent: number;
  timeSaved30To50Percent: number;
  groupScores: SurveyGroupScore[];
  criteriaScores: SurveyCriterionScore[];
  improvementPriorities: SurveyImprovementPriority[];
}

export interface TeacherFeedbackDataset {
  summary: SurveyReportSummary;
  items: TeacherFeedbackItem[];
}

export const TEACHER_FEEDBACK_DATASET = rawDataset as TeacherFeedbackDataset;

export const TEACHER_FEEDBACK_ALL_LIST: TeacherFeedbackItem[] =
  TEACHER_FEEDBACK_DATASET.items;

export const TEACHER_FEEDBACK_LIST: TeacherFeedbackItem[] =
  TEACHER_FEEDBACK_DATASET.items.filter((item) => item.featured);

/**
 * Lấy 2 chữ cái viết tắt từ họ tên giáo viên để hiển thị avatar.
 */
export function getTeacherInitials(teacherName: string): string {
  const cleaned = teacherName.replace(/^(Cô|Thầy)\s+/i, "").trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "GV";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}
