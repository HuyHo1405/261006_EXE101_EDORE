export type StepRole = 'LOGISTICS' | 'PAYLOAD_MAIN' | 'PAYLOAD_SECONDARY' | 'CHECKPOINT' | 'WRAP_UP';

export interface EnrichedContent {
  type: 'hook' | 'list' | 'text' | 'chips' | 'units' | 'exercises' | 'scenario' | 'rubric';
  data: any;
}

export type Extractor = (payload: any) => EnrichedContent | null;

export function normalizeNodeType(nodeTypeCode?: string): string {
  if (!nodeTypeCode) return '';
  const map: Record<string, string> = {
    '4-node_khoi_dong': 'KHOI_DONG',
    '3-node_khoi_dong': 'KHOI_DONG',
    '4-node_hinh_thanh': 'HINH_THANH_KIEN_THUC',
    '3-node_hinh_thanh': 'HINH_THANH_KIEN_THUC',
    '4-node_luyen_tap': 'LUYEN_TAP',
    '3-node_luyen_tap': 'LUYEN_TAP',
    '4-node_van_dung': 'VAN_DUNG',
    '3-node_van_dung': 'VAN_DUNG',
  };
  if (map[nodeTypeCode]) return map[nodeTypeCode];
  const s = nodeTypeCode.toLowerCase();
  if (s.includes('khoi_dong') || s.includes('khởi động')) return 'KHOI_DONG';
  if (s.includes('hinh_thanh') || s.includes('hình thành') || s.includes('lý thuyết')) return 'HINH_THANH_KIEN_THUC';
  if (s.includes('luyen_tap') || s.includes('luyện tập') || s.includes('thực hành')) return 'LUYEN_TAP';
  if (s.includes('van_dung') || s.includes('vận dụng')) return 'VAN_DUNG';
  return nodeTypeCode.toUpperCase();
}

export const ENRICHMENT_REGISTRY: Record<string, Partial<Record<StepRole, Extractor>>> = {
  'KHOI_DONG': {
    PAYLOAD_MAIN:      (p) => p?.hook ? { type: 'hook', data: p.hook } : null,
    PAYLOAD_SECONDARY: (p) => p?.expected_responses?.length ? { type: 'list', data: p.expected_responses } : null,
    WRAP_UP:           (p) => p?.transition_line ? { type: 'text', data: p.transition_line } : null,
  },
  'HINH_THANH_KIEN_THUC': {
    PAYLOAD_MAIN: (p) => p?.knowledge_units?.length ? { type: 'units', data: p.knowledge_units } : null,
    CHECKPOINT:   (p) => {
      const q = p?.knowledge_units?.map((u: any) => u.checkpoint_question).filter(Boolean);
      return q?.length ? { type: 'list', data: q } : null;
    },
    WRAP_UP:      (p) => p?.synthesis ? { type: 'text', data: p.synthesis } : null,
  },
  'LUYEN_TAP': {
    PAYLOAD_MAIN:      (p) => p?.exercises?.length ? { type: 'exercises', data: p.exercises } : null,
    PAYLOAD_SECONDARY: (p) => {
      const filtered = p?.exercises?.filter((e: any) => e.level !== 'nhan_biet');
      return filtered?.length ? { type: 'exercises', data: filtered } : null;
    },
  },
  'VAN_DUNG': {
    PAYLOAD_MAIN:      (p) => (p?.scenario || p?.task_requirement) ? { type: 'scenario', data: { scenario: p.scenario, task: p.task_requirement } } : null,
    PAYLOAD_SECONDARY: (p) => p?.rubric?.length ? { type: 'rubric', data: p.rubric } : null,
    WRAP_UP:           (p) => p?.expected_output_form ? { type: 'text', data: p.expected_output_form } : null,
  },
};

export function mergeStepsWithPayload(
  nodeTypeCode: string | undefined,
  executionSteps: string[],
  stepRoles: string[] | undefined,
  materials: string[],
  payload: any
): { stepText: string; enrichment: EnrichedContent | null }[] {
  if (!executionSteps || !Array.isArray(executionSteps)) return [];

  const roleOccurrenceCount: Record<string, number> = {};
  const normalizedKey = normalizeNodeType(nodeTypeCode);

  return executionSteps.map((stepText, i) => {
    const role = stepRoles?.[i];
    if (!role) return { stepText, enrichment: null };
    
    // 1. LOGISTICS handling
    if (role === 'LOGISTICS') {
      return { stepText, enrichment: materials?.length ? { type: 'chips', data: materials } : null };
    }

    const occurrenceIndex = roleOccurrenceCount[role] ?? 0;
    roleOccurrenceCount[role] = occurrenceIndex + 1;
    const totalOccurrences = stepRoles!.filter(r => r === role).length;

    const extractor = (nodeTypeCode ? ENRICHMENT_REGISTRY[nodeTypeCode]?.[role as StepRole] : null) 
      ?? ENRICHMENT_REGISTRY[normalizedKey]?.[role as StepRole];
    
    let enrichment = extractor ? extractor(payload) : null;

    // 2. Chunking logic for repeated roles across multiple steps
    if (enrichment && Array.isArray(enrichment.data) && totalOccurrences > 1) {
      const chunkSize = Math.ceil(enrichment.data.length / totalOccurrences);
      const chunk = enrichment.data.slice(occurrenceIndex * chunkSize, (occurrenceIndex + 1) * chunkSize);
      enrichment = chunk.length ? { ...enrichment, data: chunk } : null;
    }

    return { stepText, enrichment };
  });
}
