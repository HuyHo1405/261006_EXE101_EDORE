import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CourseCreatePayload, CourseFilterParams, ScriptCreatePayload, ScriptResponseDTO, ScriptUpdatePayload } from "@edore/types";
import { courseService, CourseService } from "../api/courseService";
import { toast } from "@/components/ui/toast";

// ── Query Keys Factory ──────────────────────────────────────────────────────
export const courseKeys = {
  all: ["courses"] as const,
  lists: () => [...courseKeys.all, "list"] as const,
  list: (params?: CourseFilterParams) => [...courseKeys.lists(), params ?? {}] as const,
  details: () => [...courseKeys.all, "detail"] as const,
  detail: (id: string) => [...courseKeys.details(), id] as const,
  scripts: (courseId: string) => [...courseKeys.detail(courseId), "scripts"] as const,
  scriptDetail: (scriptId: string) => [...courseKeys.all, "scriptDetail", scriptId] as const,
  scriptNodes: (scriptId: string) => [...courseKeys.all, "scriptNodes", scriptId] as const,
  categories: (type?: string) => ["categories", type ?? "all"] as const,
};

// ── Query Options Factory ───────────────────────────────────────────────────
export function createCourseQueryOptions(service: CourseService = courseService) {
  return {
    list: (params?: CourseFilterParams) =>
      queryOptions({
        queryKey: courseKeys.list(params),
        queryFn: () => service.getMyCourses(params),
      }),

    detail: (id: string) =>
      queryOptions({
        queryKey: courseKeys.detail(id),
        queryFn: () => service.getCourseById(id),
        enabled: Boolean(id),
      }),

    scripts: (courseId: string) =>
      queryOptions({
        queryKey: courseKeys.scripts(courseId),
        queryFn: () => service.getCourseScripts(courseId),
        enabled: Boolean(courseId),
      }),

    scriptDetail: (scriptId: string) =>
      queryOptions({
        queryKey: courseKeys.scriptDetail(scriptId),
        queryFn: () => service.getScriptById(scriptId),
        enabled: Boolean(scriptId),
      }),

    scriptNodes: (scriptId: string) =>
      queryOptions({
        queryKey: courseKeys.scriptNodes(scriptId),
        queryFn: () => service.getScriptNodes(scriptId),
        enabled: Boolean(scriptId),
      }),

    categories: (type?: string) =>
      queryOptions({
        queryKey: courseKeys.categories(type),
        queryFn: () => service.getCategories(type),
        staleTime: 1000 * 60 * 10, // Categories don't change often
      }),
  };
}

export const courseQueryOptions = createCourseQueryOptions();

// ── Custom Hooks ────────────────────────────────────────────────────────────

export function useMyCourses(params?: CourseFilterParams) {
  return useQuery(courseQueryOptions.list(params));
}

export function useCourseDetail(id: string) {
  return useQuery(courseQueryOptions.detail(id));
}

export function useCourseScripts(courseId: string) {
  return useQuery(courseQueryOptions.scripts(courseId));
}

export function useScriptDetail(scriptId: string) {
  return useQuery(courseQueryOptions.scriptDetail(scriptId));
}

export function useScriptNodes(scriptId: string) {
  return useQuery(courseQueryOptions.scriptNodes(scriptId));
}

export function useCategories(type?: string) {
  return useQuery(courseQueryOptions.categories(type));
}

// ── Mutations ──────────────────────────────────────────────────────────────

export function useCreateCourseMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CourseCreatePayload) => courseService.createCourse(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
      toast.success(`Tạo khóa học "${data.title}" thành công!`);
    },
    onError: (err: any) => {
      toast.error(err.message || "Tạo khóa học thất bại.");
    },
  });
}

export function useDeleteCourseMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => courseService.deleteCourse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
      toast.success("Đã xóa khóa học thành công!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Xóa khóa học thất bại.");
    },
  });
}

export function useUpdateCourseMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CourseCreatePayload }) =>
      courseService.updateCourse(id, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(variables.id) });
      toast.success(`Cập nhật khóa học "${data.title}" thành công!`);
    },
    onError: (err: any) => {
      toast.error(err.message || "Cập nhật khóa học thất bại.");
    },
  });
}

export function useCreateScriptMutation(
  courseId: string,
  options?: { onCreated?: (data: ScriptResponseDTO) => void }
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload?: ScriptCreatePayload) => courseService.createScript(courseId, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: courseKeys.scripts(courseId) });
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
      toast.success(`Tạo kịch bản "${data.title}" thành công!`);
      options?.onCreated?.(data);
    },
    onError: (err: any) => {
      toast.error(err.message || "Tạo kịch bản thất bại.");
    },
  });
}

export function useUpdateScriptMutation(courseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ scriptId, payload }: { scriptId: string; payload: ScriptUpdatePayload }) =>
      courseService.updateScript(scriptId, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: courseKeys.scripts(courseId) });
      queryClient.invalidateQueries({ queryKey: courseKeys.scriptDetail(data.id) });
      toast.success("Cập nhật kịch bản thành công!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Cập nhật kịch bản thất bại.");
    },
  });
}

export function useDeleteScriptMutation(courseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (scriptId: string) => courseService.deleteScript(scriptId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.scripts(courseId) });
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
      toast.success("Đã xóa kịch bản thành công!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Xóa kịch bản thất bại.");
    },
  });
}

export function useGenerateScriptWithAiMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => courseService.generateScriptWithAi(formData),
    onSuccess: (data) => {
      if (data?.courseId) {
        queryClient.invalidateQueries({ queryKey: courseKeys.scripts(data.courseId) });
      }
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
      toast.success(`AI đã sinh kịch bản "${data?.title || 'mới'}" thành công!`);
    },
    onError: (err: any) => {
      toast.error(err.message || "Sinh kịch bản bằng AI thất bại.");
    },
  });
}
