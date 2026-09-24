/**
 * Course & Script DTOs & ViewModels — @edore/types
 */

export interface PageResponseDTO<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  isLast: boolean;
  isFirst: boolean;
}

export interface CategorySummary {
  id: number;
  name: string;
}

export interface CategoryResponseDTO {
  id: number;
  type: "SUBJECT" | "GRADE" | "PURPOSE" | "OTHER";
  code: string;
  name: string;
  description?: string;
}

export interface CourseScriptSummary {
  id: string;
  title: string;
}

export interface CourseResponseDTO {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  status: string;
  categories: CategorySummary[];
  scriptCount: number;
  scripts?: CourseScriptSummary[];
  createdAt: string;
  updatedAt: string | null;
}

export interface CourseDetailResponseDTO {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  status: string;
  categories: CategorySummary[];
  classConfig?: unknown;
  scriptCount: number;
  scripts?: CourseScriptSummary[];
  createdAt: string;
  updatedAt: string | null;
}

export interface CourseFilterParams {
  searchTitle?: string;
  status?: string;
  categoryId?: number;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  ascending?: boolean;
  include?: string;
}

export interface ClassConfigRequestPayload {
  name: string;
  duration?: string;
  classSize?: string;
  space?: string;
  seatingLayout?: string;
  infrastructure?: string[];
  studentDevices?: string[];
}

export interface CourseCreatePayload {
  title: string;
  description?: string;
  status?: string;
  categoryIds?: number[];
  classConfigId?: string;
  classConfigRequest?: ClassConfigRequestPayload;
}

export interface ScriptResponseDTO {
  id: string;
  courseId: string;
  courseTitle: string | null;
  title: string;
  status: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface ScriptCreatePayload {
  title?: string;
}

export interface ScriptUpdatePayload {
  title?: string;
  status?: string;
}

export interface ScriptNodeResponseDTO {
  id: number;
  scriptId: string;
  nodeTypeCode?: string;
  nodeTypeName?: string;
  activityId?: number;
  activityTitle?: string;
  activityStepTemplate?: string[];
  activityStepRoles?: string[];
  activityMaterials?: string[];
  orderIndex: number;
  appliedActivityCode?: string;
  isCustomActivity?: boolean;
  settings?: Record<string, any>;
}



// ── ViewModels (Factory Outputs) ────────────────────────────────────────────

export interface CourseCardViewModel {
  id: string;
  title: string;
  description: string;
  status: string;
  statusLabel: string;
  categoryNames: string[];
  scriptCount: number;
  updatedText: string;
  displayColor: string;
  raw: CourseResponseDTO;
}

export interface ScriptCardViewModel {
  id: string;
  courseId: string;
  courseTitle: string;
  title: string;
  status: string;
  statusLabel: string;
  updatedText: string;
  raw: ScriptResponseDTO;
}
