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
                  "title": "string — TIÊU ĐỀ SIÊU NGẮN (chỉ từ 1 đến 3 từ, ví dụ: 'Khởi động', 'Khám phá', 'Luyện tập', 'Vận dụng')",
                  "node_intent": "string — Mục tiêu sư phạm (VD: Hook tạo hứng thú, Hình thành kiến thức mới, Củng cố thực hành...)",
                  "mapped_knowledge": ["string"],
                  "node_content": ["string — Nội dung kiến thức tổng quan của node, dạng Markdown, dựa trên SGK gốc (Grounding)"],
                  "applied_activity": "string — GIỮ NGUYÊN 100%% tên phương pháp gốc từ danh sách gợi ý",
                  "applied_activity_code": "string — Mã activity_code tương ứng",
                  "is_custom_activity": "boolean — false nếu dùng phương pháp DB, true nếu tự tạo",
                  "interaction_flow": ["string — Quy trình tương tác GV-HS"],
                  "node_payload": "object — BẮT BUỘC đúng shape tương ứng theo enumType của node này",
                  "estimated_time_minutes": "number — Thời gian ước tính (phút, VD: Khởi động 5p, Khám phá 15p, Luyện tập 10p...)",
                  "materials_needed": ["string — Gồm đồ dùng giảng dạy cần thiết"]
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

                CRITICAL RULES (ĐẶC THÙ SƯ PHẠM GDPT 2018):
                1. title: BẮT BUỘC SIÊU NGẮN CHỈ TỪ 1 ĐẾN 3 TỪ (VD: Khởi động, Khám phá, Luyện tập, Vận dụng, Đánh giá).
                2. interaction_flow: Luôn phân định rõ "Hoạt động của Giáo viên" và "Hoạt động của Học sinh".
                3. ĐỐI VỚI MÔN LỊCH SỬ / ĐỊA LÍ: BẮT BUỘC chèn thêm CÂU HỎI PHẢN BIỆN (Critical thinking) vào phần 'node_content' hoặc 'exercises' (Ví dụ: "Em có đồng ý với nhận định X không? Tại sao?", "Hãy so sánh...", "Liên hệ thực tế...").
                4. Nếu tạo phiếu học tập (worksheet_payload), phải có câu hỏi phân hóa từ Dễ đến Khó.
                5. node_payload PHẢI đúng 100%% cấu trúc field đã quy định cho enumType của node đó.
                6. Với node LUYEN_TAP: Không chỉ nhắc lại lý thuyết, phải có bài tập tình huống hoặc câu hỏi tư duy.
                7. Với node VAN_DUNG: Yêu cầu học sinh liên hệ kiến thức Lịch sử/Địa lí vừa học vào thực tiễn cuộc sống hiện nay.
                8. CHỈ trả về JSON array, không markdown gạch ngang, không text thừa.
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
