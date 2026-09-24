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
      const endpoint = `/api/courses${queryStr ? `?${queryStr}` : ""}`;
      const res = await client<PageResponseDTO<CourseResponseDTO>>(endpoint, { method: "GET" });
      return res.result!;
    },

    async getCourseById(id: string): Promise<CourseDetailResponseDTO> {
      const res = await client<CourseDetailResponseDTO>(`/api/courses/${id}`, { method: "GET" });
      return res.result!;
    },

    async createCourse(payload: CourseCreatePayload): Promise<CourseDetailResponseDTO> {
      const res = await client<CourseDetailResponseDTO>("/api/courses", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return res.result!;
    },

    async updateCourse(id: string, payload: CourseCreatePayload): Promise<CourseDetailResponseDTO> {
      const res = await client<CourseDetailResponseDTO>(`/api/courses/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      return res.result!;
    },

    async deleteCourse(id: string): Promise<void> {
      await client(`/api/courses/${id}`, { method: "DELETE" });
    },

    // Script sub-resource APIs
    async getCourseScripts(courseId: string): Promise<ScriptResponseDTO[]> {
      const res = await client<ScriptResponseDTO[]>(`/api/courses/${courseId}/scripts`, {
        method: "GET",
      });
      return res.result || [];
    },

    async getScriptById(scriptId: string): Promise<ScriptResponseDTO> {
      const res = await client<ScriptResponseDTO>(`/api/scripts/${scriptId}`, {
        method: "GET",
      });
      return res.result!;
    },

    async getScriptNodes(scriptId: string): Promise<ScriptNodeResponseDTO[]> {
      const res = await client<ScriptNodeResponseDTO[]>(`/api/scripts/${scriptId}/nodes`, {
        method: "GET",
      });
      return res.result || [];
    },

    async createScript(courseId: string, payload?: ScriptCreatePayload): Promise<ScriptResponseDTO> {
      const res = await client<ScriptResponseDTO>(`/api/courses/${courseId}/scripts`, {
        method: "POST",
        body: JSON.stringify(payload || {}),
      });
      return res.result!;
    },

    async updateScript(scriptId: string, payload: ScriptUpdatePayload): Promise<ScriptResponseDTO> {
      const res = await client<ScriptResponseDTO>(`/api/scripts/${scriptId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      return res.result!;
    },

    async deleteScript(scriptId: string): Promise<void> {
      await client(`/api/scripts/${scriptId}`, { method: "DELETE" });
    },

    async generateScriptWithAi(formData: FormData): Promise<any> {
      const { useAuthStore } = await import("@/features/auth/stores/useAuthStore");
      const token = useAuthStore.getState().accessToken;
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const res = await fetch(`${baseUrl}/api/ai/pedagogy`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Sinh kịch bản AI thất bại (${res.status}): ${text}`);
      }
      const data = await res.json();
      return data.result;
    },

    // Category APIs
    async getCategories(type?: string): Promise<CategoryResponseDTO[]> {
      const queryStr = type ? `?type=${type}` : "";
      const res = await client<CategoryResponseDTO[]>(`/api/categories${queryStr}`, {
        method: "GET",
      });
      return res.result || [];
    },
  };
}

export type CourseService = ReturnType<typeof createCourseService>;
export const courseService = createCourseService();
