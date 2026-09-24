package com.edore.backend.features.course.init;

import com.edore.backend.features.activity.entity.Activity;
import com.edore.backend.features.activity.repository.ActivityRepository;
import com.edore.backend.features.auth.entity.User;
import com.edore.backend.features.auth.repository.UserRepository;
import com.edore.backend.features.category.entity.Category;
import com.edore.backend.features.category.repository.CategoryRepository;
import com.edore.backend.features.classConfig.model.*;
import com.edore.backend.features.classroom.entity.ClassConfig;
import com.edore.backend.features.classroom.repository.ClassConfigRepository;
import com.edore.backend.features.course.entity.Course;
import com.edore.backend.features.course.entity.CourseStatus;
import com.edore.backend.features.course.repository.CourseRepository;
import com.edore.backend.features.script.entity.NodeType;
import com.edore.backend.features.script.entity.Script;
import com.edore.backend.features.script.entity.ScriptNode;
import com.edore.backend.features.script.entity.Template;
import com.edore.backend.features.script.repository.NodeTypeRepository;
import com.edore.backend.features.script.repository.ScriptNodeRepository;
import com.edore.backend.features.script.repository.ScriptNodeVerificationRepository;
import com.edore.backend.features.script.repository.ScriptRepository;
import com.edore.backend.features.script.repository.TemplateRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Seeds a sample Course + ClassConfig for the default user (user@sba.com),
 * along with initial sample scripts and script nodes for that course.
 * Runs after RbacDataInitializer (@Order(1)), CategoryDataInitializer (@Order(5)),
 * ScriptDataInitializer (@Order(10)) and ActivityDataInitializer (@Order(11)).
 */
@Slf4j
@Component
@Order(12)
@RequiredArgsConstructor
public class CourseDataInitializer implements CommandLineRunner {

    private final UserRepository        userRepository;
    private final ClassConfigRepository classConfigRepository;
    private final CourseRepository      courseRepository;
    private final CategoryRepository    categoryRepository;
    private final ScriptRepository      scriptRepository;
    private final ScriptNodeRepository  scriptNodeRepository;
    private final ScriptNodeVerificationRepository scriptNodeVerificationRepository;
    private final TemplateRepository    templateRepository;
    private final NodeTypeRepository    nodeTypeRepository;
    private final ActivityRepository    activityRepository;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        User user = userRepository.findByEmail("user@sba.com").orElse(null);
        if (user == null) {
            log.warn("[Seed] user@sba.com not found — skipping course seed.");
            return;
        }

        List<Course> existingCourses = courseRepository.findByUserId(user.getId());
        Course course;

        if (!existingCourses.isEmpty()) {
            course = existingCourses.get(0);
            log.info("[Seed] Course already exists for user@sba.com.");
        } else {
            // ── 1. ClassConfig ────────────────────────────────────────────────────
            ClassConfig classConfig = ClassConfig.builder()
                    .user(user)
                    .name("Lớp Lịch sử 6A — HK1 2025")
                    .duration(LessonDuration.MIN_45)
                    .classSize(ClassSizeRange.MEDIUM)
                    .space(ClassroomSpace.STANDARD)
                    .seatingLayout(SeatingLayout.ROWS)
                    .infrastructure(List.of(InfrastructureItem.PROJECTOR, InfrastructureItem.WHITEBOARD))
                    .studentDevices(List.of(StudentDeviceOption.SMARTPHONE))
                    .build();

            classConfigRepository.save(classConfig);

            // ── 2. Resolve categories: HISTORY + GRADE_6 ───────────────────────────
            Set<Category> categories = new HashSet<>();
            categoryRepository.findByCode("HISTORY").ifPresent(categories::add);
            categoryRepository.findByCode("GRADE_6").ifPresent(categories::add);

            // ── 3. Course linked to ClassConfig + categories ──────────────────────
            course = Course.builder()
                    .user(user)
                    .title("Lịch sử và Địa lý 6 — Phần Lịch sử Thế giới và Việt Nam Cổ đại")
                    .description("Khóa học Lịch sử 6 giới thiệu nguồn gốc loài người, các nền văn minh cổ đại và sự hình thành nhà nước Văn Lang, Âu Lạc.")
                    .status(CourseStatus.DRAFT)
                    .classConfig(classConfig)
                    .categories(categories)
                    .build();

            course = courseRepository.save(course);
            log.info("[Seed] CourseDataInitializer completed: 1 course (Lịch sử 6, categories={}) + 1 class config seeded.",
                    categories.stream().map(Category::getCode).toList());
        }

        // ── 4. Seed / Update Scripts & ScriptNodes for sample course ─────────
        seedScriptsForCourse(course);
    }

    private void seedScriptsForCourse(Course course) {
        List<Script> existingScripts = scriptRepository.findByCourseIdOrderByCreatedAtDesc(course.getId());
        if (!existingScripts.isEmpty()) {
            log.info("[Seed] Scripts already exist for course '{}' ({}) — preserving data on rerun.", course.getTitle(), existingScripts.size());
            return;
        }


        Template template4Node = templateRepository.findByCode("4-node").orElse(null);
        Template template3Node = templateRepository.findByCode("3-node").orElse(null);

        // ── Script 1: Bài 1 (4-Node) ──────────────────────────────────────────
        if (template4Node != null) {
            Script script1 = Script.builder()
                    .course(course)
                    .template(template4Node)
                    .title("Kịch bản Bài 1: Nguồn gốc loài người và xã hội nguyên thủy")
                    .status("PUBLISHED")
                    .build();
            script1 = scriptRepository.save(script1);

            seedScriptNode(script1, "4-node_khoi_dong", "BRAINSTORMING", 0, createSettingsMap(
                    "Khởi động — Động não tự do về nguồn gốc loài người",
                    "Kích hoạt kiến thức sẵn có và sự tò mò của học sinh về nguồn gốc xuất hiện của loài người trên Trái Đất.",
                    List.of("Nguồn gốc loài người", "Sự chuyển biến từ Vượn người thành Người tinh khôn"),
                    List.of("Giáo viên chiếu hình ảnh so sánh giữa Vượn người, Người tối cổ và Người tinh khôn.",
                            "Đặt câu hỏi gợi mở: Theo em, con người có nguồn gốc từ đâu và yếu tố nào quyết định sự tiến hóa đó?"),
                    "Động não tự do (Brainstorming)", "BRAINSTORMING", false,
                    5, List.of("Máy chiếu / Tranh ảnh minh họa", "Bảng lớp")
            ));

            seedScriptNode(script1, "4-node_hinh_thanh", "JIGSAW", 1, createSettingsMap(
                    "Hình thành kiến thức — Kỹ thuật mảnh ghép tìm hiểu các giai đoạn tiến hóa",
                    "Học sinh chủ động tìm hiểu các mốc tiến hóa chính từ Vượn người đến Người tinh khôn và đời sống vật chất/tinh thần.",
                    List.of("Vượn người (6 triệu năm)", "Người tối cổ (4 triệu năm)", "Người tinh khôn (15 vạn năm)"),
                    List.of("Nhóm 1: Tìm hiểu về Vượn người và Người tối cổ (địa điểm tìm thấy dấu vết, công cụ lao động đơn sơ).",
                            "Nhóm 2: Tìm hiểu về Người tinh khôn và cuộc cách mạng công cụ đá mài, trồng trọt, chăn nuôi.",
                            "Nhóm 3: Tìm hiểu về sự tan rã của xã hội nguyên thủy và sự xuất hiện công cụ kim khí."),
                    "Kỹ thuật mảnh ghép (Jigsaw)", "JIGSAW", false,
                    15, List.of("Phiếu học tập mảnh ghép A, B, C", "Sách giáo khoa Lịch sử 6")
            ));

            seedScriptNode(script1, "4-node_luyen_tap", "KAHOOT_QUIZ", 2, createSettingsMap(
                    "Luyện tập — Trắc nghiệm nhanh củng cố kiến thức",
                    "Củng cố và kiểm tra mức độ ghi nhớ các mốc thời gian, công cụ lao động và địa điểm phát hiện di tích người cổ.",
                    List.of("Đặc điểm Người tối cổ vs Người tinh khôn", "Vai trò của lao động trong tiến hóa"),
                    List.of("Bộ 5 câu hỏi trắc nghiệm ngắn về dấu vết Người tối cổ ở Việt Nam (Thẩm Khuyến, Thẩm Hai, Núi Đọ).",
                            "So sánh công cụ đá ghè đẽo thô sơ và công cụ đá mài."),
                    "Trò chơi trắc nghiệm nhanh (Kahoot/Quizizz)", "KAHOOT_QUIZ", false,
                    10, List.of("Màn hình máy chiếu", "Phiếu trắc nghiệm / Điện thoại thông minh")
            ));

            seedScriptNode(script1, "4-node_van_dung", "CASE_STUDY", 3, createSettingsMap(
                    "Vận dụng — Phân tích vai trò của lao động đối với sự phát triển con người",
                    "Giúp học sinh liên hệ thực tế về ý nghĩa của lao động và sự phát triển trí tuệ trong xã hội hiện đại.",
                    List.of("Lao động sáng tạo", "Sự phát triển thể chất và tư duy con người"),
                    List.of("Tình huống: Đặt giả định nếu con người nguyên thủy không phát minh ra lửa và không chế tạo công cụ lao động, xã hội con người sẽ phát triển như thế nào?",
                            "Yêu cầu HS viết đoạn văn ngắn 5-7 câu bày tỏ quan điểm."),
                    "Phân tích tình huống thực tiễn (Case Study)", "CASE_STUDY", false,
                    15, List.of("Vở ghi bài", "Phiếu bài tập vận dụng")
            ));

            log.info("[Seed] Seeded Script 1 (4-node, 4 nodes) for course '{}'", course.getTitle());
        }

        // ── Script 2: Bài 2 (3-Node) ──────────────────────────────────────────
        if (template3Node != null) {
            Script script2 = Script.builder()
                    .course(course)
                    .template(template3Node)
                    .title("Kịch bản Bài 2: Các nền văn minh cổ đại phương Đông")
                    .status("DRAFT")
                    .build();
            script2 = scriptRepository.save(script2);

            seedScriptNode(script2, "3-node_khoi_dong", "BRAINSTORMING", 0, createSettingsMap(
                    "Khởi động — Khám phá các dòng sông huyền thoại phương Đông",
                    "Gợi mở sự chú ý của HS về vai trò của các dòng sông lớn đối với sự hình thành nhà nước cổ đại.",
                    List.of("Sông Níl, Sông Tiền & Hằng, Sông Hoàng Hà & Trường Giang"),
                    List.of("GV chiếu bản đồ thế giới cổ đại và hình ảnh sông Níl, sông Hằng.",
                            "Đặt câu hỏi: Tại sao các nền văn minh lớn đều ra đời bên lưu vực các sông lớn?"),
                    "Động não tự do (Brainstorming)", "BRAINSTORMING", false,
                    5, List.of("Bản đồ các nền văn minh cổ đại", "Máy chiếu")
            ));

            seedScriptNode(script2, "3-node_hinh_thanh", "GALLERY_WALK", 1, createSettingsMap(
                    "Hình thành kiến thức — Triển lãm thành tựu văn minh phương Đông",
                    "HS chủ động khám phá các thành tựu chữ viết, toán học, kiến trúc (Kim Tự Tháp, Chữ tượng hình).",
                    List.of("Điều kiện tự nhiên", "Các giai đoạn phát triển", "Thành tựu văn hóa tiêu biểu"),
                    List.of("Trạm 1: Văn minh Ai Cập cổ đại (Kim Tự Tháp, Chữ tượng hình, Lịch pháp).",
                            "Trạm 2: Văn minh Lưỡng Hà (Bộ luật Hammurabi, Vườn treo Babylon).",
                            "Trạm 3: Văn minh Ấn Độ và Trung Quốc (Chữ Phạn, Kim tự tháp, Vạn Lý Trường Thành)."),
                    "Triển lãm tranh (Gallery Walk)", "GALLERY_WALK", false,
                    25, List.of("Poster thông tin các trạm", "Giấy Sticky Note")
            ));

            seedScriptNode(script2, "3-node_luyen_tap", "EXIT_TICKET", 2, createSettingsMap(
                    "Luyện tập & Củng cố — Phiếu thu hoạch 3-2-1",
                    "Tổng kết ngắn gọn kiến thức bài học trước khi kết thúc tiết học.",
                    List.of("Tổng kết thành tựu văn minh phương Đông"),
                    List.of("Viết 3 thành tựu em ấn tượng nhất.",
                            "Viết 2 điều em muốn tìm hiểu thêm.",
                            "Viết 1 câu hỏi còn thắc mắc."),
                    "Phiếu xuất phòng (Exit Ticket / 3-2-1)", "EXIT_TICKET", false,
                    15, List.of("Phiếu Exit Ticket")
            ));

            log.info("[Seed] Seeded Script 2 (3-node, 3 nodes) for course '{}'", course.getTitle());
        }
    }

    private void seedScriptNode(Script script, String nodeTypeCode, String activityCode, int orderIndex, Map<String, Object> settings) {
        NodeType nodeType = resolveNodeType(nodeTypeCode);
        Activity activity = activityCode != null ? activityRepository.findByCode(activityCode).orElse(null) : null;

        List<String> executionSteps = (activity != null && activity.getDefaultStepTemplate() != null)
                ? activity.getDefaultStepTemplate()
                : List.of();
        settings.put("execution_steps", executionSteps);

        if (activity != null && activity.getStepFieldMapping() != null && !activity.getStepFieldMapping().isEmpty()) {
            settings.put("activity_step_roles", activity.getStepFieldMapping().stream().map(Enum::name).toList());
        }

        // Build step_content array aligned 1-1 with execution_steps:
        // Core lesson content from file input is placed in teaching steps (index 1 & 2),
        // while procedural setup steps (index 0) use "" as step title is self-explanatory.
        if (!settings.containsKey("step_content") && !executionSteps.isEmpty()) {
            @SuppressWarnings("unchecked")
            List<String> nodeContent = (List<String>) settings.getOrDefault("node_content", List.of());
            List<String> stepContent = new java.util.ArrayList<>();
            for (int i = 0; i < executionSteps.size(); i++) {
                if (i == 0) {
                    stepContent.add(""); // Procedural setup step (title is sufficient)
                } else if (i - 1 < nodeContent.size()) {
                    stepContent.add(nodeContent.get(i - 1)); // Core teaching step with lesson content
                } else if (!nodeContent.isEmpty()) {
                    stepContent.add(String.join("\n", nodeContent));
                } else {
                    stepContent.add("");
                }
            }
            settings.put("step_content", stepContent);
        }

        ScriptNode node = ScriptNode.builder()
                .script(script)
                .nodeType(nodeType)
                .activity(activity)
                .orderIndex(orderIndex)
                .appliedActivityCode(activityCode)
                .isCustomActivity(false)
                .settings(settings)
                .build();

        scriptNodeRepository.save(node);
    }

    private Map<String, Object> createSettingsMap(
            String title,
            String nodeIntent,
            List<String> mappedKnowledge,
            List<String> nodeContent,
            String appliedActivity,
            String appliedActivityCode,
            boolean isCustomActivity,
            int estimatedTimeMinutes,
            List<String> materialsNeeded
    ) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("title", title);
        map.put("node_intent", nodeIntent);
        map.put("mapped_knowledge", mappedKnowledge);
        map.put("node_content", nodeContent);
        map.put("applied_activity", appliedActivity);
        map.put("applied_activity_code", appliedActivityCode);
        map.put("is_custom_activity", isCustomActivity);
        map.put("estimated_time_minutes", estimatedTimeMinutes);
        map.put("materials_needed", materialsNeeded);
        return map;
    }

    private NodeType resolveNodeType(String nodeTypeCode) {
        if (nodeTypeCode == null) return null;
        if (nodeTypeCode.contains("khoi_dong")) return nodeTypeRepository.findById(com.edore.backend.features.script.model.NodeTypeEnum.KHOI_DONG).orElse(null);
        if (nodeTypeCode.contains("hinh_thanh")) return nodeTypeRepository.findById(com.edore.backend.features.script.model.NodeTypeEnum.HINH_THANH_KIEN_THUC).orElse(null);
        if (nodeTypeCode.contains("luyen_tap")) return nodeTypeRepository.findById(com.edore.backend.features.script.model.NodeTypeEnum.LUYEN_TAP).orElse(null);
        if (nodeTypeCode.contains("van_dung")) return nodeTypeRepository.findById(com.edore.backend.features.script.model.NodeTypeEnum.VAN_DUNG).orElse(null);
        return nodeTypeRepository.findByCode(nodeTypeCode).orElse(null);
    }
}

