import { apiClient } from "@/lib/fetcher";
import type {
  ApiResponse,
  CategoryResponseDTO,
  CourseCreatePayload,
  CourseDetailResponseDTO,
  CourseFilterParams,
  CourseResponseDTO,
  PageResponseDTO,
  ScriptCreatePayload,
  ScriptNodeResponseDTO,
  ScriptResponseDTO,
  ScriptUpdatePayload,
  LessonSummaryDTO,
  LessonFilterParams,
} from "@edore/types";

type ApiClientFn = <T = void>(endpoint: string, options?: RequestInit) => Promise<ApiResponse<T>>;

export function createCourseService(client: ApiClientFn = apiClient) {
  return {
    async getMyCourses(params?: CourseFilterParams): Promise<PageResponseDTO<CourseResponseDTO>> {
      const queryParams = new URLSearchParams();
      if (params?.searchTitle) queryParams.set("searchTitle", params.searchTitle);
      if (params?.status) queryParams.set("status", params.status);
      if (params?.categoryId) queryParams.set("categoryId", String(params.categoryId));
      if (params?.pageNumber !== undefined) queryParams.set("pageNumber", String(params.pageNumber));
      if (params?.pageSize !== undefined) queryParams.set("pageSize", String(params.pageSize));
      if (params?.sortBy) queryParams.set("sortBy", params.sortBy);
      if (params?.ascending !== undefined) queryParams.set("ascending", String(params.ascending));
      if (params?.include) queryParams.set("include", params.include);

      const queryStr = queryParams.toString();
      const endpoint = `/api/v1/courses${queryStr ? `?${queryStr}` : ""}`;
      const res = await client<PageResponseDTO<CourseResponseDTO>>(endpoint, { method: "GET" });
      return res.result!;
    },

    async getCourseById(id: string): Promise<CourseDetailResponseDTO> {
      const res = await client<CourseDetailResponseDTO>(`/api/v1/courses/${id}`, { method: "GET" });
      return res.result!;
    },

    async createCourse(payload: CourseCreatePayload): Promise<CourseDetailResponseDTO> {
      const res = await client<CourseDetailResponseDTO>("/api/v1/courses", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return res.result!;
    },

    async updateCourse(id: string, payload: CourseCreatePayload): Promise<CourseDetailResponseDTO> {
      const res = await client<CourseDetailResponseDTO>(`/api/v1/courses/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      return res.result!;
    },

    async deleteCourse(id: string): Promise<void> {
      await client(`/api/v1/courses/${id}`, { method: "DELETE" });
    },

    // Script sub-resource APIs
    async getCourseScripts(courseId: string): Promise<ScriptResponseDTO[]> {
      const res = await client<ScriptResponseDTO[]>(`/api/v1/courses/${courseId}/scripts`, {
        method: "GET",
      });
      return res.result || [];
    },

    async getScriptById(scriptId: string): Promise<ScriptResponseDTO> {
      const res = await client<ScriptResponseDTO>(`/api/v1/scripts/${scriptId}`, {
        method: "GET",
      });
      return res.result!;
    },

    async getScriptNodes(scriptId: string): Promise<ScriptNodeResponseDTO[]> {
      const res = await client<ScriptNodeResponseDTO[]>(`/api/v1/scripts/${scriptId}/nodes`, {
        method: "GET",
      });
      return res.result || [];
    },

    async createScript(courseId: string, payload?: ScriptCreatePayload): Promise<ScriptResponseDTO> {
      const res = await client<ScriptResponseDTO>(`/api/v1/courses/${courseId}/scripts`, {
        method: "POST",
        body: JSON.stringify(payload || {}),
      });
      return res.result!;
    },

    async updateScript(scriptId: string, payload: ScriptUpdatePayload): Promise<ScriptResponseDTO> {
      const res = await client<ScriptResponseDTO>(`/api/v1/scripts/${scriptId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      return res.result!;
    },

    async deleteScript(scriptId: string): Promise<void> {
      await client(`/api/v1/scripts/${scriptId}`, { method: "DELETE" });
    },

    async getLessons(params?: LessonFilterParams): Promise<PageResponseDTO<LessonSummaryDTO>> {
      const queryParams = new URLSearchParams();
      if (params?.keyword) queryParams.set("keyword", params.keyword);
      if (params?.gradeCode) queryParams.set("gradeCode", params.gradeCode);
      if (params?.subjectCode) queryParams.set("subjectCode", params.subjectCode);
      if (params?.textbookCode) queryParams.set("textbookCode", params.textbookCode);
      if (params?.chapterId) queryParams.set("chapterId", params.chapterId);
      if (params?.orderInChapter !== undefined) queryParams.set("orderInChapter", String(params.orderInChapter));
      if (params?.page !== undefined) queryParams.set("page", String(params.page));
      if (params?.size !== undefined) queryParams.set("size", String(params.size));
      if (params?.sortBy) queryParams.set("sortBy", params.sortBy);
      if (params?.sortDirection) queryParams.set("sortDirection", params.sortDirection);

      const queryStr = queryParams.toString();
      const endpoint = `/api/v1/lessons${queryStr ? `?${queryStr}` : ""}`;
      const res = await client<PageResponseDTO<LessonSummaryDTO>>(endpoint, { method: "GET" });
      return res.result!;
    },

    async generateScriptWithAi(payload: {
      lessonId: string;
      courseId: string;
      templateId?: number | string;
      scriptTitle?: string;
      learningOutcome?: string;
      enableFactCheck?: boolean;
    } | FormData): Promise<any> {
      const { useAuthStore } = await import("@/features/auth/stores/useAuthStore");
      const token = useAuthStore.getState().accessToken;

      let body: BodyInit;
      if (payload instanceof FormData) {
        body = payload;
      } else {
        const fd = new FormData();
        fd.append("lessonId", payload.lessonId);
        fd.append("courseId", payload.courseId);
        fd.append("templateId", String(payload.templateId === "extended-4-node" || String(payload.templateId) === "2" ? 2 : 1));
        if (payload.scriptTitle) {
          fd.append("scriptTitle", payload.scriptTitle);
          fd.append("title", payload.scriptTitle);
        }
        if (payload.learningOutcome) {
          fd.append("learningOutcome", payload.learningOutcome);
        }
        if (payload.enableFactCheck !== undefined) {
          fd.append("enableFactCheck", String(payload.enableFactCheck));
        }
        body = fd;
      }

      // Dùng relative URL → đi qua vercel.json rewrite → tới https://api.edore.id.vn
      const res = await fetch(`/api/v1/ai/pedagogy`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: body,
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Sinh kịch bản AI thất bại (${res.status}): ${text}`);
      }
      const data = await res.json();
      return data.result || data.data; // Backend mới trả về ApiResponse.of(...)
    },

    async getAiJobStatus(jobId: string): Promise<any> {
      const { useAuthStore } = await import("@/features/auth/stores/useAuthStore");
      const token = useAuthStore.getState().accessToken;
      // Dùng relative URL → đi qua vercel.json rewrite → tới https://api.edore.id.vn
      const res = await fetch(`/api/v1/ai/jobs/${jobId}/status`, {
        method: "GET",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Kiểm tra trạng thái job thất bại (${res.status}): ${text}`);
      }
      const data = await res.json();
      return data.result || data.data;
    },

    // Category APIs
    async getCategories(type?: string): Promise<CategoryResponseDTO[]> {
      const queryStr = type ? `?type=${type}` : "";
      const res = await client<CategoryResponseDTO[]>(`/api/v1/categories${queryStr}`, {
        method: "GET",
      });
      return res.result || [];
    },
  };
}

export type CourseService = ReturnType<typeof createCourseService>;
export const courseService = createCourseService();
