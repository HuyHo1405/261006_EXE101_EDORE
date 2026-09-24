package com.edore.backend.features.ai.helper;

import com.edore.backend.features.activity.entity.Activity;
import com.edore.backend.features.activity.service.ActivityScoringService;
import com.edore.backend.features.category.entity.CategoryType;
import com.edore.backend.features.classConfig.model.InfrastructureItem;
import com.edore.backend.features.classConfig.model.StudentDeviceOption;
import com.edore.backend.features.classroom.entity.ClassConfig;
import com.edore.backend.features.course.entity.Course;
import com.edore.backend.features.script.entity.NodeType;
import com.edore.backend.features.vector.dto.GroundingLevel;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Helper component responsible for assembling pedagogical System and User prompts.
 */
@Component
@RequiredArgsConstructor
public class AiPromptBuilder {

    private final ActivityScoringService activityScoringService;

    private static final int MAX_CONTEXT_CHARS_PER_NODE = 6000;

    public String buildSystemPrompt(List<NodeType> nodes, ClassConfig cfg, String learningOutcome, GroundingLevel groundingLevel) {
        String expectedStructure = nodes.stream()
                .map(n -> "'" + n.getName() + "'")
                .collect(Collectors.joining(" -> "));

        String nodeTypesStr = nodes.stream()
                .map(n -> "'" + n.getName() + "'")
                .collect(Collectors.joining(", "));

        String perNodeSchemas = nodes.stream()
                .map(n -> "Node '%s' (enumType=%s):\n%s".formatted(
                        n.getName(),
                        n.getId() != null ? n.getId().name() : "UNKNOWN",
                        n.getId() != null ? n.getId().getJsonSchema() : "{}"))
                .collect(Collectors.joining("\n\n"));

        String schema = """
                {
                  "node_type": "string — Bắt buộc phải là một trong: %s",
                  "title": "string — TIÊU ĐỀ SIÊU NGẮN (chỉ từ 1 đến 3 từ, tối đa ≤ 20 ký tự, ví dụ: 'Khởi động', 'Tìm hiểu Phục hưng', 'Luyện tập', 'Vận dụng')",
                  "node_intent": "string — Mục tiêu sư phạm của node",
                  "mapped_knowledge": ["string"],
                  "node_content": ["string — Nội dung kiến thức tổng quan của node, dạng Markdown, giữ nguyên 100%% số liệu từ file input"],
                  "applied_activity": "string — GIỮ NGUYÊN 100%% tên phương pháp gốc từ danh sách gợi ý (Ví dụ: 'Thảo luận đôi (Think - Pair - Share)')",
                  "applied_activity_code": "string — Mã activity_code tương ứng từ gợi ý (Ví dụ: 'THINK_PAIR_SHARE')",
                  "is_custom_activity": "boolean — false nếu dùng phương pháp từ gợi ý DB, true nếu buộc phải tự tạo mới",
                  "interaction_flow": ["string — Quy trình tương tác GV-HS bám theo step_template của activity đã chọn"],
                  "node_payload": "object — BẮT BUỘC đúng shape tương ứng theo enumType của node này, xem chi tiết bên dưới",
                  "estimated_time_minutes": "number — Thời gian ước tính (phút)",
                  "materials_needed": ["string — Gồm đồ dùng mặc định của hoạt động cộng thêm học liệu bài học cụ thể"]
                }""".formatted(nodeTypesStr);

        String groundingGuidance = switch (groundingLevel) {
            case STRONG -> "Tài liệu đầu vào BÁM SÁT 100%% chuẩn chương trình tham chiếu. Hãy thiết kế bài giảng chính xác tuyệt đối theo tài liệu.";
            case WEAK -> "Tài liệu đầu vào có độ khớp vừa phải với chuẩn tham chiếu. Được phép bổ sung ví dụ minh hoạ nhưng phải đảm bảo tính khoa học.";
            case NONE -> "Tài liệu đầu vào không thuộc ngân hàng chuẩn có sẵn. Được phép sáng tạo cấu trúc bài giảng dựa trên nội dung được cung cấp.";
        };

        return """
                Bạn là AI Sư phạm chuyên nghiệp, thiết kế kịch bản giảng dạy bám sát thực tế lớp học.
                Nhiệm vụ: Tạo TOÀN BỘ kịch bản giảng dạy cho %d node theo thứ tự: %s.

                ĐỊNH HƯỚNG TRI THỨC (GROUNDING HINT):
                %s

                SCHEMA CHUNG:
                %s

                SCHEMA node_payload THEO TỪNG NODE (BẮT BUỘC TUÂN THỦ ĐÚNG SHAPE, KHÔNG TỰ Ý ĐỔI CẤU TRÚC):
                %s

                CRITICAL RULES:
                1. title: BẮT BUỘC SIÊU NGẮN CHỈ TỪ 1 ĐẾN 3 TỪ (≤ 20 ký tự). Dùng làm nhãn Stepper Navigation trên UI.
                2. applied_activity: BẮT BUỘC giữ nguyên 100%% tên phương pháp gốc từ gợi ý (Ví dụ: 'Thảo luận đôi (Think - Pair - Share)').
                3. interaction_flow: Khi chọn phương pháp từ gợi ý DB (is_custom_activity = false), BẮT BUỘC bám theo khung các bước 'step_template' của phương pháp đó.
                4. materials_needed: BẮT BUỘC bao gồm các đồ dùng mặc định ('default_materials') của phương pháp đã chọn.
                5. is_custom_activity: Trả về false khi chọn phương pháp từ gợi ý DB, trả về true nếu tự thiết kế phương pháp hoàn toàn mới.
                6. node_type trong mỗi object PHẢI KHỚP CHÍNH XÁC theo template — không tự sửa hay dịch tên node.
                7. Chỉ trả về một JSON array duy nhất.
                8. node_payload PHẢI đúng 100%% cấu trúc field đã quy định cho enumType của node đó — không thêm/bớt field, không dùng shape của node khác.
                9. Với HINH_THANH_KIEN_THUC: BẮT BUỘC chia tài liệu gốc thành nhiều knowledge_units theo từng đề mục/ý chính (I, II, III... hoặc heading trong file input), KHÔNG gộp toàn bộ tài liệu vào 1 unit trừ khi tài liệu thực sự chỉ có 1 ý.
                10. Với LUYEN_TAP: exercises phải là đề bài cụ thể trích/dựa theo phần "Luyện tập" của tài liệu gốc nếu có, answer phải là đáp án xác định, không mô tả hoạt động.
                11. Với VAN_DUNG: scenario phải là tình huống MỚI hoặc bài tập mở rộng, không lặp lại nguyên văn ví dụ đã dạy ở knowledge_units.
                """.formatted(nodes.size(), expectedStructure, groundingGuidance, schema, perNodeSchemas);
    }

    public String buildUserContent(List<NodeType> nodes, Map<String, String> contextPerNode,
                                   ClassConfig cfg, String learningOutcome, String keyFacts,
                                   Course course) {
        StringBuilder sb = new StringBuilder();

        // Subject & Grade context from course categories
        if (course != null && course.getCategories() != null && !course.getCategories().isEmpty()) {
            sb.append("THÔNG TIN MÔN HỌC & KHỐI LỚP:\n");
            course.getCategories().stream()
                    .filter(c -> c.getType() == CategoryType.SUBJECT)
                    .findFirst()
                    .ifPresent(c -> sb.append("- Môn học: ").append(c.getName())
                            .append(" (").append(c.getCode()).append(")\n"));
            course.getCategories().stream()
                    .filter(c -> c.getType() == CategoryType.GRADE)
                    .findFirst()
                    .ifPresent(c -> sb.append("- Khối lớp: ").append(c.getName())
                            .append(" (").append(c.getCode()).append(")\n"));
            course.getCategories().stream()
                    .filter(c -> c.getType() == CategoryType.PURPOSE)
                    .forEach(c -> sb.append("- Mục đích: ").append(c.getName()).append("\n"));
            sb.append("\n");
        }

        // Classroom context block
        sb.append("THÔNG TIN LỚP HỌC:\n");
        if (cfg.getDuration() != null) sb.append("- Thời lượng: ").append(cfg.getDuration().getDescription()).append("\n");
        if (cfg.getClassSize() != null) sb.append("- Sĩ số: ").append(cfg.getClassSize().getDescription()).append("\n");
        if (cfg.getSpace() != null) sb.append("- Không gian: ").append(cfg.getSpace().getDescription()).append("\n");
        if (cfg.getSeatingLayout() != null) sb.append("- Bố trí chỗ ngồi: ").append(cfg.getSeatingLayout().getDescription()).append("\n");

        if (cfg.getInfrastructure() != null && !cfg.getInfrastructure().isEmpty())
            sb.append("- Cơ sở vật chất: ").append(cfg.getInfrastructure().stream().map(InfrastructureItem::getDescription).collect(Collectors.joining(", "))).append("\n");
        if (cfg.getStudentDevices() != null && !cfg.getStudentDevices().isEmpty())
            sb.append("- Thiết bị học sinh: ").append(cfg.getStudentDevices().stream().map(StudentDeviceOption::getDescription).collect(Collectors.joining(", "))).append("\n");

        if (learningOutcome != null && !learningOutcome.isBlank())
            sb.append("- Mục tiêu bài học: ").append(learningOutcome).append("\n");

        // Key facts anchor
        if (keyFacts != null && !keyFacts.isBlank()) {
            sb.append("\n").append(keyFacts).append("\n");
        }

        // Per-node context + activity hints
        sb.append("\nCHI TIẾT CONTEXT & HOẠT ĐỘNG THEO TỪNG NODE:\n");
        for (NodeType node : nodes) {
            String ctx = contextPerNode.getOrDefault(node.getCode(), "");
            if (ctx.length() > MAX_CONTEXT_CHARS_PER_NODE) {
                ctx = ctx.substring(0, MAX_CONTEXT_CHARS_PER_NODE);
            }

            List<Activity> topEntities = activityScoringService
                    .getTopActivityEntities(node, cfg, node.getDescription(), 5);

            StringBuilder hintsBuilder = new StringBuilder();
            for (Activity act : topEntities) {
                hintsBuilder.append("  * ").append(act.getTitle())
                        .append(" (code: ").append(act.getCode() != null ? act.getCode() : "CUSTOM").append(")\n");
                if (act.getDefaultMaterials() != null && !act.getDefaultMaterials().isEmpty()) {
                    hintsBuilder.append("    - Đồ dùng mặc định: ").append(String.join(", ", act.getDefaultMaterials())).append("\n");
                }
                if (act.getDefaultStepTemplate() != null && !act.getDefaultStepTemplate().isEmpty()) {
                    hintsBuilder.append("    - Khung bước mẫu (step_template):\n");
                    for (String step : act.getDefaultStepTemplate()) {
                        hintsBuilder.append("      + ").append(step).append("\n");
                    }
                }
            }

            sb.append("\n=== CONTEXT FOR NODE '").append(node.getName()).append("' ===\n");
            sb.append("MỤC TIÊU SƯ PHẠM: ").append(node.getDescription()).append("\n");
            sb.append("DANH SÁCH KHUNG PHƯƠNG PHÁP DẠY HỌC GỢI Ý (RAG TEMPLATES):\n").append(hintsBuilder).append("\n");
            sb.append("NỘI DUNG TÀI LIỆU GỐC:\n").append(ctx).append("\n");
        }

        sb.append("\nHãy sinh ra JSON array chứa chính xác ")
          .append(nodes.size()).append(" objects tương ứng.");

        return sb.toString();
    }
}
