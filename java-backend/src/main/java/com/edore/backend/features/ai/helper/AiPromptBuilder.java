package com.edore.backend.features.ai.helper;

import com.edore.backend.features.activity.entity.Activity;
import com.edore.backend.features.activity.service.ActivityScoringService;
import com.edore.backend.features.category.entity.CategoryType;
import com.edore.backend.features.classConfig.model.InfrastructureItem;
import com.edore.backend.features.classConfig.model.StudentDeviceOption;
import com.edore.backend.features.classroom.entity.ClassConfig;
import com.edore.backend.features.course.entity.Course;
import com.edore.backend.features.script.entity.NodeType;
import com.edore.backend.features.script.model.NodeTypeEnum;
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
                  "nodes": [
                    {
                      "node_type": "string — Bắt buộc phải là một trong: %s",
                      "title": "string — TIÊU ĐỀ SIÊU NGẮN (chỉ từ 1 đến 3 từ, tối đa ≤ 20 ký tự, ví dụ: 'Khởi động', 'Tìm hiểu Phục hưng', 'Khám phá')",
                      "node_intent": "string — Mục tiêu sư phạm của node",
                      "mapped_knowledge": ["string"],
                      "node_content": ["string — Nội dung kiến thức tổng quan của node, dạng Markdown, giữ nguyên 100%% số liệu từ file input"],
                      "applied_activity": "string — GIỮ NGUYÊN 100%% tên phương pháp gốc từ danh sách gợi ý (Ví dụ: 'Thảo luận đôi (Think - Pair - Share)')",
                      "applied_activity_code": "string — Mã activity_code tương ứng từ gợi ý (Ví dụ: 'THINK_PAIR_SHARE')",
                      "is_custom_activity": "boolean — false nếu dùng phương pháp từ gợi ý DB, true nếu buộc phải tự tạo mới",
                      "interaction_flow": ["string — Quy trình tương tác GV-HS bám theo step_template của activity đã chọn"],
                      "node_payload": "object — BẮT BUỘC đúng shape tương ứng theo enumType của node này, xem chi tiết bên dưới",
                      "estimated_time_minutes": "number — Thời gian ước tính (phút)",
                      "materials_needed": ["string — Chỉ liệt kê học liệu ĐẶC THÙ (Flashcards, Sticky note, Hình ảnh cụ thể...). TUYỆT ĐỐI KHÔNG liệt kê thiết bị cơ bản của lớp học (Máy chiếu, TV, Bảng phấn, Bút dạ)"]
                    }
                  ]
                }""".formatted(nodeTypesStr);

        String groundingGuidance = switch (groundingLevel) {
            case STRONG -> "Tài liệu đầu vào BÁM SÁT 100%% chuẩn chương trình tham chiếu. Hãy thiết kế bài giảng chính xác tuyệt đối theo tài liệu.";
            case WEAK -> "Tài liệu đầu vào có độ khớp vừa phải với chuẩn tham chiếu. Được phép bổ sung ví dụ minh hoạ nhưng phải đảm bảo tính khoa học.";
            case NONE -> "Tài liệu đầu vào không thuộc ngân hàng chuẩn có sẵn. Được phép sáng tạo cấu trúc bài giảng dựa trên nội dung được cung cấp.";
        };

        String prompt = """
                Bạn là AI Sư phạm chuyên nghiệp, thiết kế kịch bản giảng dạy bám sát thực tế lớp học.
                Nhiệm vụ: Tạo TOÀN BỘ kịch bản giảng dạy cho %d node theo thứ tự: %s.

                ĐỊNH HƯỚNG TRI THỨC (GROUNDING HINT):
                %s

                SCHEMA CHUNG:
                %s

                SCHEMA node_payload THEO TỪNG NODE (BẮT BUỘC TUÂN THỦ ĐÚNG SHAPE, KHÔNG TỰ Ý ĐỔI CẤU TRÚC):
                %s

                CRITICAL RULES:
                NGUYÊN TẮC PHỤ THUỘC GIỮA CÁC FIELD (DEPENDENCY CONSISTENCY):
                Nhiều field trong schema không độc lập — field này ĐẶT RA yêu cầu, field kia BẮT BUỘC phải trả lời đúng cấu trúc của yêu cầu đó. Trước khi sinh nội dung, LUÔN xác định rõ field nào là "câu hỏi/khung" và field nào là "câu trả lời", rồi đối chiếu để đảm bảo khớp nhau. TUYỆT ĐỐI KHÔNG viết 2 field này như thể chúng độc lập với nhau.

                1. title: BẮT BUỘC SIÊU NGẮN CHỈ TỪ 1 ĐẾN 3 TỪ (≤ 20 ký tự). Dùng làm nhãn Stepper Navigation trên UI (VD: 'Khởi động', 'Khám phá').
                2. applied_activity: BẮT BUỘC giữ nguyên 100%% tên phương pháp gốc từ gợi ý. Tuy nhiên, RIÊNG HINH_THANH_KIEN_THUC BẮT BUỘC trả về null cho cả `applied_activity` và `applied_activity_code` vì nút này dạy học linh hoạt không gò bó.
                3. interaction_flow: Khi chọn phương pháp từ gợi ý DB (is_custom_activity = false), BẮT BUỘC bám theo khung các bước 'step_template' của phương pháp đó.
                4. materials_needed: CHỈ liệt kê học liệu đặc thù cần chuẩn bị: giữ các món đặc thù trong 'default_materials' của phương pháp (nếu có) và bỏ mọi thiết bị hạ tầng/cơ bản (máy chiếu, bảng phấn, TV, wifi, thiết bị cá nhân của học sinh). Mỗi phần tử là MỘT món, viết ngắn gọn, không chứa dấu phẩy ngăn cách nhiều món. Nếu không có học liệu đặc thù thì trả mảng rỗng.
                5. is_custom_activity: Trả về false khi chọn phương pháp từ gợi ý DB, trả về true nếu tự thiết kế phương pháp hoàn toàn mới.
                6. node_type trong mỗi object PHẢI KHỚP CHÍNH XÁC theo template — không tự sửa hay dịch tên node.
                7. Chỉ trả về một JSON object duy nhất, trong đó CÓ ĐÚNG MỘT KHÓA `nodes`. Mảng `nodes` BẮT BUỘC sinh đủ số lượng nodes như yêu cầu. KHÔNG TRẢ VỀ `lesson_meta`.
                8. node_payload PHẢI đúng 100%% cấu trúc field đã quy định cho enumType của node đó — không thêm/bớt field, không dùng shape của node khác.
                9. Với HINH_THANH_KIEN_THUC: BẮT BUỘC chia tài liệu gốc thành nhiều knowledge_units theo từng đề mục/ý chính (I, II, III... hoặc heading trong tài liệu), KHÔNG gộp toàn bộ tài liệu vào 1 unit trừ khi bài học quá ngắn.
                10. MẢNG JSON BẮT BUỘC PHẢI SINH 'Hình thành kiến thức' TRƯỚC 'Khởi động' (dù cấu trúc học là Khởi động trước).
                11. KHOI_DONG: BẮT BUỘC map `activity_type` dựa trên `pedagogical_approach` của HINH_THANH_KIEN_THUC theo bảng: INDUCTIVE -> QUESTION_BASED, DEDUCTIVE -> VISUAL_TEASER, PROBLEM_BASED -> PROBLEM_SITUATION. Đồng thời thiết kế câu dẫn dắt (hook) tạo bối cảnh hấp dẫn, KHÔNG kiểm tra bài mới khi học sinh chưa học.
                12. HINH_THANH_KIEN_THUC: BẮT BUỘC các phần tử trong mảng knowledge_units không được trùng lặp visual_example.item, visual_example.title, hay core_content giữa các unit.
                13. ĐẢM BẢO JSON HỢP LỆ: TUYỆT ĐỐI KHÔNG bấm Enter xuống dòng thực sự trong chuỗi JSON, dùng escape `\\n`.
                14. HINH_THANH_KIEN_THUC: BẮT BUỘC chọn `pedagogical_approach`: DEDUCTIVE (lý thuyết/khái niệm tuần tự), INDUCTIVE (nhiều ví dụ rút ra quy luật), PROBLEM_BASED (tình huống/mâu thuẫn cần giải quyết).
                15. HINH_THANH_KIEN_THUC: Nếu danh sách ảnh có sẵn, mỗi knowledge_unit chọn ít nhất 1 ảnh phù hợp nhất đưa vào `used_image_ids`.
                16. HINH_THANH_KIEN_THUC: `teacher_explanation` là mảng các đối tượng {label, content}. Với Lịch sử dùng các nhãn chuẩn: "Nguyên nhân", "Diễn biến", "Kết quả/Ý nghĩa", "Tính chất/Đặc điểm".
                17. KHOI_DONG: `quick_connection` PHẢI là câu trả lời/phản xạ suy ra trực tiếp từ `visual_action`.
                18. KHOI_DONG: `bridge_question` BẮT BUỘC dẫn thẳng vào chủ đề cốt lõi của bài học.
                19. ĐỐI VỚI MÔN LỊCH SỬ / ĐỊA LÍ: BẮT BUỘC chèn thêm câu hỏi phản biện (Critical thinking) vào phần `node_content`.
                """.formatted(nodes.size(), expectedStructure, groundingGuidance, schema, perNodeSchemas);
        return prompt;
    }

    public String buildUserContent(List<NodeType> nodes, Map<String, String> contextPerNode,
                                   ClassConfig cfg, String learningOutcome, String keyFacts,
                                   Course course, String availableImagesJson, String chapterContext) {
        StringBuilder sb = new StringBuilder();

        if (availableImagesJson != null && !availableImagesJson.isBlank()) {
            sb.append("DANH SÁCH ẢNH/TƯ LIỆU CÓ SẴN (Vui lòng sử dụng các ID này đưa vào `used_image_ids`):\n");
            sb.append(availableImagesJson).append("\n\n");
        }

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

        if (chapterContext != null && !chapterContext.isBlank()) {
            sb.append("THÔNG TIN CHƯƠNG (CHAPTER CỦA BÀI HỌC):\n");
            sb.append(chapterContext).append("\n\n");
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

        // Single shared lesson content (eliminates duplicate raw text per node)
        String mainLessonContent = "";
        for (NodeType node : nodes) {
            String ctx = contextPerNode.getOrDefault(node.getCode(), "");
            if (ctx.length() > mainLessonContent.length()) {
                mainLessonContent = ctx;
            }
        }
        if (mainLessonContent.length() > MAX_CONTEXT_CHARS_PER_NODE) {
            mainLessonContent = mainLessonContent.substring(0, MAX_CONTEXT_CHARS_PER_NODE);
        }

        sb.append("\nNỘI DUNG TÀI LIỆU BÀI HỌC:\n");
        sb.append(mainLessonContent).append("\n\n");

        // Per-node intent & activity recommendations
        sb.append("CHI TIẾT YÊU CẦU THEO TỪNG NODE:\n");
        for (NodeType node : nodes) {
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

            sb.append("\n=== NODE '").append(node.getName()).append("' ===\n");
            sb.append("- MỤC TIÊU SƯ PHẠM: ").append(node.getDescription()).append("\n");
            if (!hintsBuilder.isEmpty()) {
                sb.append("- DANH SÁCH KHUNG PHƯƠNG PHÁP GỢI Ý (RAG TEMPLATES):\n").append(hintsBuilder).append("\n");
            }
        }

        sb.append("\nChỉ trả về một JSON object có khóa `nodes`. Mảng `nodes` chứa chính xác ")
          .append(nodes.size()).append(" objects tương ứng. Không trả JSON array ở cấp gốc.");

        return sb.toString();
    }
}
