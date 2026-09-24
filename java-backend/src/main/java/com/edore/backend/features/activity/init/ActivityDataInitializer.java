package com.edore.backend.features.activity.init;

import com.edore.backend.features.activity.entity.Activity;
import com.edore.backend.features.activity.enums.StepRole;
import com.edore.backend.features.activity.repository.ActivityRepository;
import com.edore.backend.features.script.model.NodeTypeEnum;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Seed 21 activities từ Python prototype activity_pool.py.
 * Chạy sau ScriptDataInitializer (@Order(11)).
 */
@Slf4j
@Component
@Order(11)
@RequiredArgsConstructor
public class ActivityDataInitializer implements CommandLineRunner {

    private final ActivityRepository activityRepository;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        log.info("[Seed] Initializing/updating 21 activities with dedicated step templates...");


        // ── Resolve NodeTypeEnum sets ─────────────────────────────
        Set<NodeTypeEnum> khoidong  = new HashSet<>(Set.of(NodeTypeEnum.KHOI_DONG));
        Set<NodeTypeEnum> hinhthanh = new HashSet<>(Set.of(NodeTypeEnum.HINH_THANH_KIEN_THUC));
        Set<NodeTypeEnum> luyentap  = new HashSet<>(Set.of(NodeTypeEnum.LUYEN_TAP));
        Set<NodeTypeEnum> vandung   = new HashSet<>(Set.of(NodeTypeEnum.VAN_DUNG));
        Set<NodeTypeEnum> tongket   = new HashSet<>(Set.of(NodeTypeEnum.VAN_DUNG));

        // Combined sets
        Set<NodeTypeEnum> kd_ht_lt_vd_tk = new HashSet<>(Set.of(NodeTypeEnum.KHOI_DONG, NodeTypeEnum.HINH_THANH_KIEN_THUC, NodeTypeEnum.LUYEN_TAP, NodeTypeEnum.VAN_DUNG));
        Set<NodeTypeEnum> lt_vd          = new HashSet<>(Set.of(NodeTypeEnum.LUYEN_TAP, NodeTypeEnum.VAN_DUNG));
        Set<NodeTypeEnum> ht_lt          = new HashSet<>(Set.of(NodeTypeEnum.HINH_THANH_KIEN_THUC, NodeTypeEnum.LUYEN_TAP));
        Set<NodeTypeEnum> kd_vd          = new HashSet<>(Set.of(NodeTypeEnum.KHOI_DONG, NodeTypeEnum.VAN_DUNG));
        Set<NodeTypeEnum> kd_lt          = new HashSet<>(Set.of(NodeTypeEnum.KHOI_DONG, NodeTypeEnum.LUYEN_TAP));
        Set<NodeTypeEnum> tk_only        = tongket;
        Set<NodeTypeEnum> lt_only        = luyentap;

        // ── Seed 21 Activities with Specific Step Templates ──────────────────

        seed("KAHOOT_QUIZ", "Trò chơi trắc nghiệm nhanh (Kahoot/Quizizz)",
                "Học sinh sử dụng thiết bị cá nhân để trả lời câu hỏi trắc nghiệm trực tuyến dưới dạng trò chơi đua điểm số.",
                List.of("STANDARD", "COMPUTER_LAB", "ONLINE"),
                List.of("SMARTPHONE", "LAPTOP"),
                List.of("WIFI", "PROJECTOR"),
                List.of("MIN_45", "MIN_90"),
                List.of("MEDIUM", "LARGE"),
                List.of("Thiết bị thông minh cá nhân", "Mạng Wifi ổn định"),
                List.of(
                        "1. Khởi động phòng game & Nhập mã PIN (Giáo viên chiếu mã PIN, học sinh dùng thiết bị cá nhân đăng nhập tên)",
                        "2. Đua trắc nghiệm tương tác (Học sinh đọc câu hỏi trên màn hình chung và bấm đáp án nhanh trên thiết bị)",
                        "3. Phân tích kết quả & Giải đáp câu sai (Giáo viên dừng lại ở các câu hỏi có tỷ lệ sai cao để phân tích kiến thức)",
                        "4. Tổng kết điểm & Vinh danh Top Bảng xếp hạng (Công bố học sinh top đầu và chốt kiến thức cốt lõi)"
                ),
                List.of(StepRole.LOGISTICS, StepRole.PAYLOAD_MAIN, StepRole.PAYLOAD_SECONDARY, StepRole.WRAP_UP),
                union(khoidong, luyentap, tongket));

        seed("THINK_PAIR_SHARE", "Thảo luận đôi (Think - Pair - Share)",
                "Học sinh suy nghĩ cá nhân, trao đổi cặp đôi bên cạnh, sau đó đại diện chia sẻ trước tập thể.",
                List.of("STANDARD", "COMPUTER_LAB", "OUTDOOR", "ONLINE"),
                List.of(), List.of(),
                List.of("MIN_45", "MIN_90"),
                List.of("SMALL", "MEDIUM", "LARGE"),
                List.of("Phiếu thảo luận cặp đôi", "Bút viết"),
                List.of(
                        "1. Suy nghĩ cá nhân (Think - Học sinh đọc câu hỏi/vấn đề và tự ghi chép ý kiến cá nhân ra nháp)",
                        "2. Trao đổi cặp đôi (Pair - Học sinh xoay sang bạn bên cạnh để so sánh, thảo luận và thống nhất ý kiến)",
                        "3. Chia sẻ trước lớp (Share - Giáo viên chỉ định ngẫu nhiên các cặp đôi trình bày kết quả thảo luận)",
                        "4. Kết luận & Chuẩn hóa kiến thức (Giáo viên tổng kết các ý kiến đúng và chốt lại bài học)"
                ),
                List.of(StepRole.PAYLOAD_MAIN, StepRole.PAYLOAD_SECONDARY, StepRole.PAYLOAD_SECONDARY, StepRole.WRAP_UP),
                kd_ht_lt_vd_tk);

        seed("MIND_MAP_RELAY", "Sơ đồ tư duy tiếp sức (Mind Map Relay)",
                "Các nhóm di chuyển luân phiên lên bảng hoặc vẽ chung trên một trang giấy lớn/bảng nhóm để xây dựng sơ đồ tư duy.",
                List.of("STANDARD", "OUTDOOR"),
                List.of(), List.of("WHITEBOARD"),
                List.of("MIN_45", "MIN_90"),
                List.of("MEDIUM", "LARGE"),
                List.of("Giấy A0 / Bảng nhóm", "Bộ bút màu Marker"),
                List.of(
                        "1. Phổ biến chủ đề & Phát học liệu (Phát giấy A0/bảng nhóm và bộ bút màu, giải thích quy tắc tiếp sức)",
                        "2. Vẽ tiếp sức luân phiên (Mỗi thành viên trong nhóm có thời gian ngắn lên vẽ/viết 1 nhánh rồi chuyền bút cho người tiếp theo)",
                        "3. Trưng bày & Thuyết minh sản phẩm (Các nhóm dán sơ đồ lên bảng, đại diện thuyết minh ngắn gọn về cấu trúc sơ đồ)",
                        "4. Nhận xét chéo & Chuẩn hóa (Các nhóm nhận xét lẫn nhau, giáo viên bổ sung và hoàn thiện sơ đồ tư duy chuẩn)"
                ),
                List.of(StepRole.LOGISTICS, StepRole.PAYLOAD_MAIN, StepRole.PAYLOAD_SECONDARY, StepRole.WRAP_UP),
                union(luyentap, vandung, tongket));

        seed("ROLE_PLAY", "Đóng vai xử lý tình huống (Role Play)",
                "Học sinh nhập vai các nhân vật giả định để giải quyết tình huống thực tế.",
                List.of("STANDARD", "OUTDOOR", "ONLINE"),
                List.of(), List.of(),
                List.of("MIN_45", "MIN_90"),
                List.of("MEDIUM", "LARGE"),
                List.of("Kịch bản tình huống giả định", "Đạo cụ nhập vai đơn giản"),
                List.of(
                        "1. Giao kịch bản & Phân vai (Giáo viên phát tình huống giả định, các nhóm phân công nhân vật và chuẩn bị)",
                        "2. Sắm vai diễn xuất (Các nhóm lần lượt lên đóng vai diễn lại tình huống và đưa ra cách xử lý)",
                        "3. Thảo luận & Phản biện (Cả lớp phân tích cách giải quyết của các nhân vật, nêu ưu/nhược điểm)",
                        "4. Rút ra bài học thực tiễn (Giáo viên tổng kết giải pháp tối ưu và bài học ứng dụng)"
                ),
                List.of(StepRole.LOGISTICS, StepRole.PAYLOAD_MAIN, StepRole.PAYLOAD_SECONDARY, StepRole.WRAP_UP),
                lt_vd);

        seed("GUIDED_EXPERIMENT", "Thí nghiệm / Mô phỏng có hướng dẫn",
                "Học sinh thực hiện thao tác trực tiếp trên dụng cụ thí nghiệm, phần mềm giả lập hoặc bộ công cụ thực hành dưới sự hướng dẫn.",
                List.of("STANDARD", "COMPUTER_LAB", "OUTDOOR"),
                List.of("LAB_TOOLKIT"), List.of(),
                List.of("MIN_45", "MIN_90"),
                List.of("MEDIUM", "LARGE"),
                List.of("Bộ dụng cụ thí nghiệm / Thực hành", "Phiếu hướng dẫn thao tác"),
                List.of(
                        "1. Chuyển giao quy trình & Cảnh báo an toàn (Giáo viên hướng dẫn thao tác, quy định an toàn và giao phiếu thực hành)",
                        "2. Tiến hành thí nghiệm / Mô phỏng (Học sinh thao tác trực tiếp trên bộ dụng cụ hoặc phần mềm giả lập theo nhóm)",
                        "3. Ghi chép dữ liệu & Báo cáo hiện tượng (Học sinh quan sát, điền kết quả vào phiếu và giải thích hiện tượng)",
                        "4. Rút ra kết luận khoa học (Giáo viên xác nhận kết quả chuẩn và chốt kiến thức/quy luật)"
                ),
                List.of(StepRole.LOGISTICS, StepRole.PAYLOAD_MAIN, StepRole.PAYLOAD_SECONDARY, StepRole.WRAP_UP),
                ht_lt);

        seed("JIGSAW", "Kỹ thuật mảnh ghép (Jigsaw)",
                "Học sinh học theo nhóm chuyên gia để nắm rõ một phần kiến thức, sau đó quay lại nhóm mảnh ghép để chia sẻ toàn bộ bài học.",
                List.of("STANDARD", "ONLINE"),
                List.of(), List.of(),
                List.of("MIN_45", "MIN_90"),
                List.of("MEDIUM", "LARGE"),
                List.of("Tài liệu nhóm chuyên gia (Phiếu A, B, C, D)", "Bảng tổng hợp mảnh ghép"),
                List.of(
                        "1. Vòng Nhóm Chuyên Gia (Mỗi nhóm nghiên cứu sâu 1 chủ đề/nhiệm vụ riêng biệt và trở thành chuyên gia chủ đề đó)",
                        "2. Vòng Nhóm Mảnh Ghép (Tách nhóm chuyên gia, học sinh di chuyển sang nhóm mới chứa đại diện của tất cả các chủ đề)",
                        "3. Chia sẻ & Ghép nối kiến thức (Lần lượt từng chuyên gia giảng lại phần mình phụ trách cho các thành viên trong nhóm mới)",
                        "4. Tổng hợp & Kiểm tra bao quát (Giáo viên đặt câu hỏi tổng hợp toàn bài để kiểm tra mức độ nắm bắt kiến thức)"
                ),
                List.of(StepRole.PAYLOAD_MAIN, StepRole.LOGISTICS, StepRole.PAYLOAD_SECONDARY, StepRole.CHECKPOINT),
                ht_lt);

        seed("GALLERY_WALK", "Triển lãm tranh (Gallery Walk)",
                "Các nhóm trưng bày sản phẩm học tập lên tường/bàn, học sinh di chuyển xung quanh để tham quan, đánh giá và ghi nhận xét.",
                List.of("STANDARD", "OUTDOOR"),
                List.of(), List.of("WHITEBOARD"),
                List.of("MIN_45", "MIN_90"),
                List.of("MEDIUM", "LARGE"),
                List.of("Sản phẩm học tập của nhóm", "Giấy ghi chú Sticky Note", "Băng dính dán tường"),
                List.of(
                        "1. Trưng bày sản phẩm (Các nhóm dán sản phẩm học tập/poster/sơ đồ lên các vị trí xung quanh phòng học)",
                        "2. Tham quan & Đánh giá (Học sinh di chuyển qua các trạm sản phẩm, quan sát và dán giấy ghi chú Sticky Note nhận xét)",
                        "3. Tổng hợp góp ý (Các nhóm quay về vị trí sản phẩm của mình, đọc và thảo luận các góp ý nhận được)",
                        "4. Báo cáo phản hồi & Giáo viên chốt (Đại diện nhóm phát biểu cảm nghĩ về góp ý và giáo viên chuẩn hóa kiến thức)"
                ),
                List.of(StepRole.LOGISTICS, StepRole.PAYLOAD_MAIN, StepRole.PAYLOAD_SECONDARY, StepRole.WRAP_UP),
                lt_vd);

        seed("KWL_CHART", "Bảng KWL (Biết - Muốn biết - Đã học)",
                "Điền cột K (đã biết) và W (muốn học) lúc mở đầu, sau đó tổng kết cột L (đã học được gì) vào cuối tiết học.",
                List.of("STANDARD", "COMPUTER_LAB", "ONLINE"),
                List.of(), List.of(),
                List.of("MIN_45", "MIN_90"),
                List.of("SMALL", "MEDIUM", "LARGE"),
                List.of("Mẫu bảng KWL cá nhân"),
                List.of(
                        "1. Khai phá cột K - What I Know (Học sinh viết ra những điều đã biết về chủ đề bài học)",
                        "2. Xác định cột W - What I Want to know (Học sinh ghi lại những câu hỏi, điều mong muốn tìm hiểu)",
                        "3. Tìm hiểu bài học & Cập nhật cột L - What I Learned (Trong và sau bài học, học sinh điền các kiến thức mới thu hoạch được vào cột L)",
                        "4. Tổng kết & Đánh giá mục tiêu (Giáo viên cùng học sinh rà soát lại cột W và L để đảm bảo giải đáp hết thắc mắc)"
                ),
                List.of(StepRole.LOGISTICS, StepRole.PAYLOAD_MAIN, StepRole.PAYLOAD_SECONDARY, StepRole.WRAP_UP),
                union(khoidong, tongket));

        seed("FISHBOWL", "Thảo luận bể cá (Fishbowl)",
                "Một nhóm nhỏ ngồi vòng trong thảo luận chủ đề, nhóm lớn hơn ngồi vòng ngoài quan sát, ghi chép và có thể xin đổi chỗ để tham gia thảo luận.",
                List.of("STANDARD", "OUTDOOR"),
                List.of(), List.of(),
                List.of("MIN_45", "MIN_90"),
                List.of("MEDIUM", "LARGE"),
                List.of("Phiếu quan sát và ghi chép nhóm ngoài"),
                List.of(
                        "1. Bố trí không gian & Chọn nhóm bể cá (Một nhóm nhỏ ngồi vòng trong thảo luận chủ đề, cả lớp ngồi vòng ngoài quan sát)",
                        "2. Thảo luận chuyên sâu vòng trong (Nhóm bể cá trao đổi ý kiến, nhóm quan sát ghi chép lập luận và câu hỏi)",
                        "3. Mở rộng thảo luận / Tráo đổi vị trí (Học sinh vòng ngoài có thể giơ tay vào ngồi ghế trống ở vòng trong để đóng góp ý kiến)",
                        "4. Tổng kết & Rút kinh nghiệm (Giáo viên đánh giá chất lượng thảo luận của cả 2 vòng và chốt nội dung)"
                ),
                List.of(StepRole.LOGISTICS, StepRole.PAYLOAD_MAIN, StepRole.PAYLOAD_SECONDARY, StepRole.WRAP_UP),
                ht_lt);

        seed("QUICK_DEBATE", "Tranh luận nhanh (Quick Debate)",
                "Chia lớp thành 2 phe ủng hộ và phản đối về một nhận định cụ thể. Mỗi bên cử đại diện đưa ra lập luận luân phiên trong 2 phút.",
                List.of("STANDARD", "OUTDOOR", "ONLINE"),
                List.of(), List.of(),
                List.of("MIN_45", "MIN_90"),
                List.of("MEDIUM", "LARGE"),
                List.of("Chủ đề và quy tắc tranh luận", "Đồng hồ bấm giờ"),
                List.of(
                        "1. Công bố nhận định & Chia phe (Chia lớp thành 2 phe Ủng hộ - Phản đối và chuẩn bị lập luận trong 3 phút)",
                        "2. Luân phiên đưa ra lập luận (Mỗi bên cử đại diện trình bày luận điểm trong thời gian quy định 1-2 phút)",
                        "3. Tranh luận trực tiếp & Phản biện (Các bên đặt câu hỏi nghi vấn và phản bác lập luận của đối phương)",
                        "4. Trọng tài nhận định & Chốt kiến thức (Giáo viên đánh giá tính logic của các bên và kết luận góc nhìn khoa học đúng)"
                ),
                List.of(StepRole.LOGISTICS, StepRole.PAYLOAD_MAIN, StepRole.PAYLOAD_SECONDARY, StepRole.WRAP_UP),
                lt_vd);

        seed("LEARNING_STATIONS", "Trạm học tập (Learning Stations)",
                "Xây dựng các trạm nhiệm vụ khác nhau quanh phòng học. Các nhóm luân chuyển qua từng trạm để hoàn thành nhiệm vụ theo giới hạn thời gian.",
                List.of("STANDARD", "COMPUTER_LAB"),
                List.of(), List.of(),
                List.of("MIN_90", "MIN_135"),
                List.of("MEDIUM", "LARGE"),
                List.of("Hồ sơ nhiệm vụ tại từng trạm (Trạm 1, 2, 3)", "Phiếu hành trình học tập"),
                List.of(
                        "1. Giới thiệu các trạm & Quy tắc luân chuyển (Giáo viên giới thiệu nhiệm vụ tại Trạm 1, Trạm 2, Trạm 3 và phát phiếu hành trình)",
                        "2. Luân chuyển nhóm qua các trạm (Các nhóm làm việc tại mỗi trạm theo thời gian quy định, sau đó đổi trạm theo chiều kim đồng hồ)",
                        "3. Hoàn thành hồ sơ hành trình (Học sinh tổng hợp kết quả nhiệm vụ từ tất cả các trạm vào phiếu học tập)",
                        "4. Chốt kiến thức các trạm (Giáo viên hệ thống lại đáp án từng trạm và giải đáp thắc mắc)"
                ),
                List.of(StepRole.LOGISTICS, StepRole.PAYLOAD_MAIN, StepRole.PAYLOAD_SECONDARY, StepRole.WRAP_UP),
                lt_vd);

        seed("EXIT_TICKET", "Phiếu xuất phòng (Exit Ticket / 3-2-1)",
                "Trước khi rời lớp, học sinh viết nhanh: 3 điều tâm đắc, 2 điều muốn tìm hiểu thêm, 1 câu hỏi còn thắc mắc lên phiếu nộp cho giáo viên.",
                List.of("STANDARD", "COMPUTER_LAB", "ONLINE"),
                List.of(), List.of(),
                List.of("MIN_45", "MIN_90"),
                List.of("SMALL", "MEDIUM", "LARGE"),
                List.of("Phiếu Exit Ticket (Mẫu 3-2-1)"),
                List.of(
                        "1. Phát phiếu & Đặt câu hỏi tổng kết (Giáo viên phát phiếu 3-2-1 trước khi kết thúc tiết học 5 phút)",
                        "2. Học sinh điền phản hồi cá nhân (Viết 3 điều đã học, 2 điều tâm đắc, 1 câu hỏi còn thắc mắc)",
                        "3. Thu phiếu tại cửa xuất phòng (Học sinh nộp lại phiếu cho giáo viên khi rời khỏi lớp học)",
                        "4. Phân loại & Phản hồi tiết sau (Giáo viên tổng hợp phiếu để nắm mức độ hiểu bài và giải đáp ở đầu tiết tiếp theo)"
                ),
                List.of(StepRole.LOGISTICS, StepRole.CHECKPOINT, StepRole.LOGISTICS, StepRole.WRAP_UP),
                tk_only);

        seed("BRAINWRITING", "Chắp vá ý kiến viết nhanh (Brainwriting)",
                "Viết ý tưởng lên giấy rồi chuyển cho người bên cạnh bổ sung, lặp lại liên tục để thu thập lượng lớn ý tưởng sáng tạo trong thời gian ngắn.",
                List.of("STANDARD"),
                List.of(), List.of(),
                List.of("MIN_45", "MIN_90"),
                List.of("MEDIUM", "LARGE"),
                List.of("Tờ giấy chuyền tay 6-3-5"),
                List.of(
                        "1. Viết ý tưởng cá nhân (Mỗi học sinh viết 3 ý tưởng ban đầu lên tờ giấy nhóm trong 3 phút)",
                        "2. Chuyền giấy luân phiên (Chuyền giấy cho người bên phải, người nhận đọc ý tưởng trước và viết bổ sung 3 ý tưởng mới)",
                        "3. Lặp lại vòng chuyền (Tiếp tục chuyền giấy qua 3-5 người để thu thập tập hợp ý tưởng phong phú)",
                        "4. Sàng lọc & Chọn lọc giải pháp (Nhóm đọc lại toàn bộ ý tưởng trên giấy, phân loại và chọn ra các ý tưởng xuất sắc nhất)"
                ),
                List.of(StepRole.PAYLOAD_MAIN, StepRole.LOGISTICS, StepRole.PAYLOAD_SECONDARY, StepRole.WRAP_UP),
                kd_vd);

        seed("BRAINSTORMING", "Động não tự do (Brainstorming)",
                "Mọi học sinh tự do đưa ra ý kiến, ý tưởng về một vấn đề mà không bị phán xét, giáo viên ghi nhận nhanh toàn bộ lên bảng.",
                List.of("STANDARD", "COMPUTER_LAB", "OUTDOOR", "ONLINE"),
                List.of(), List.of("WHITEBOARD"),
                List.of("MIN_45", "MIN_90"),
                List.of("MEDIUM", "LARGE"),
                List.of("Bảng ghi nhận ý tưởng / Mảnh giấy Sticky note"),
                List.of(
                        "1. Nêu vấn đề & Quy tắc không phán xét (Giáo viên đưa ra câu hỏi/chủ đề và khuyến khích học sinh phát biểu tự do)",
                        "2. Thu thập ý tưởng liên tục (Học sinh xung phong nêu ý kiến ngắn gọn, giáo viên/thư ký ghi nhanh lên bảng)",
                        "3. Phân nhóm & Gộp ý tưởng (Cả lớp cùng phân loại các ý tưởng trên bảng thành các nhóm chủ đề)",
                        "4. Đánh giá & Rút ra kết luận (Đánh giá tính khả thi/chính xác của từng nhóm ý tưởng và chọn giải pháp phù hợp)"
                ),
                List.of(StepRole.LOGISTICS, StepRole.PAYLOAD_MAIN, StepRole.PAYLOAD_SECONDARY, StepRole.WRAP_UP),
                khoidong);

        seed("QUIZ_CARDS", "Thẻ câu hỏi xoay vòng (Quiz Cards)",
                "Sử dụng các thẻ flashcard chứa câu hỏi ôn tập, học sinh hỏi đáp theo cặp hoặc xoay vòng nhóm để tự kiểm tra kiến thức chéo.",
                List.of("STANDARD", "COMPUTER_LAB", "OUTDOOR"),
                List.of(), List.of(),
                List.of("MIN_45", "MIN_90"),
                List.of("SMALL", "MEDIUM"),
                List.of("Bộ thẻ câu hỏi Flashcards ôn tập"),
                List.of(
                        "1. Phát bộ thẻ Flashcard (Phát bộ thẻ gồm câu hỏi ở mặt trước và đáp án/gợi ý ở mặt sau cho các cặp đôi)",
                        "2. Đố nhau theo cặp (Một bạn đọc câu hỏi, bạn kia trả lời; sau đó đối chiếu mặt sau thẻ để kiểm tra)",
                        "3. Đổi vai & Đổi thẻ (Hai bạn đổi vai trò cho nhau hoặc đổi bộ thẻ với cặp đôi khác trong lớp)",
                        "4. Tổng kết các câu hỏi khó (Giáo viên thu thập các câu hỏi học sinh trả lời sai nhiều nhất để chữa chung)"
                ),
                List.of(StepRole.LOGISTICS, StepRole.PAYLOAD_MAIN, StepRole.LOGISTICS, StepRole.CHECKPOINT),
                lt_only);

        seed("LUCKY_DRAW", "Bốc thăm may mắn (Lucky Draw / Cold Calling)",
                "Giáo viên gọi tên ngẫu nhiên học sinh trả lời câu hỏi thông qua que tên, vòng quay may mắn hoặc bốc thăm số thứ tự.",
                List.of("STANDARD", "COMPUTER_LAB", "ONLINE"),
                List.of(), List.of(),
                List.of("MIN_45", "MIN_90"),
                List.of("MEDIUM", "LARGE"),
                List.of("Hộp thăm / Que tên học sinh / Phần mềm quay số"),
                List.of(
                        "1. Đặt câu hỏi suy nghĩ (Giáo viên đưa ra câu hỏi và dành 1 phút cho cả lớp tự suy nghĩ câu trả lời)",
                        "2. Bốc thăm ngẫu nhiên (Giáo viên quay vòng quay/bốc que tên học sinh ngẫu nhiên để gọi trả lời)",
                        "3. Trả lời & Nhận xét (Học sinh được gọi trình bày câu trả lời, giáo viên khuyến khích học sinh khác bổ sung)",
                        "4. Tuyên dương & Chốt đáp án (Giáo viên khen ngợi tinh thần chuẩn bị và chốt đáp án đúng)"
                ),
                List.of(StepRole.LOGISTICS, StepRole.LOGISTICS, StepRole.PAYLOAD_MAIN, StepRole.WRAP_UP),
                kd_lt);

        seed("REFLECTIVE_JOURNAL", "Nhật ký phản hồi nhanh (Reflective Journaling)",
                "Học sinh tự viết phản hồi ngắn vào vở hoặc ứng dụng ghi chú về bài học: điều khó nhất là gì, liên hệ thực tế bản thân ra sao.",
                List.of("STANDARD", "COMPUTER_LAB", "ONLINE"),
                List.of(), List.of(),
                List.of("MIN_45", "MIN_90"),
                List.of("SMALL", "MEDIUM", "LARGE"),
                List.of("Sổ nhật ký học tập / Mẫu phản hồi cá nhân"),
                List.of(
                        "1. Đưa ra câu hỏi gợi mở phản tư (Giáo viên đưa ra câu hỏi: 'Điều gì làm em bất ngờ nhất hôm nay?' hoặc 'Em sẽ áp dụng kiến thức này như thế nào?')",
                        "2. Viết nhật ký cá nhân (Học sinh tự lắng đọng và viết câu trả lời vào sổ nhật ký học tập trong 3-5 phút)",
                        "3. Chia sẻ tự nguyện (Khuyến khích 2-3 học sinh xung phong đọc đoạn phản tư của mình trước lớp)",
                        "4. Giáo viên truyền cảm hứng & Đóng bài (Giáo viên ghi nhận sự tiến bộ và đúc kết giá trị cốt lõi của bài học)"
                ),
                List.of(StepRole.LOGISTICS, StepRole.PAYLOAD_MAIN, StepRole.PAYLOAD_SECONDARY, StepRole.WRAP_UP),
                tk_only);

        seed("CASE_STUDY", "Phân tích tình huống thực tiễn (Case Study)",
                "Các nhóm nhận tài liệu mô tả một vấn đề thực tế đã xảy ra, nghiên cứu và thảo luận đưa ra giải pháp tối ưu phù hợp lý thuyết.",
                List.of("STANDARD", "COMPUTER_LAB", "ONLINE"),
                List.of(), List.of(),
                List.of("MIN_45", "MIN_90"),
                List.of("MEDIUM", "LARGE"),
                List.of("Bộ hồ sơ tình huống thực tế Case Study"),
                List.of(
                        "1. Tiếp nhận hồ sơ tình huống (Cung cấp hồ sơ Case Study chứa dữ liệu thực tế và câu hỏi dẫn dắt cho các nhóm)",
                        "2. Phân tích & Nhận diện vấn đề (Các nhóm đọc tài liệu, xác định nguyên nhân cốt lõi và các mâu thuẫn trong tình huống)",
                        "3. Đề xuất giải pháp & Lập luận (Thảo luận đưa ra các phương án giải quyết dựa trên lý thuyết đã học)",
                        "4. Trình bày & Phản biện giữa các nhóm (Các nhóm chia sẻ giải pháp, tranh luận ưu/nhược điểm và giáo viên chốt đáp án)"
                ),
                List.of(StepRole.LOGISTICS, StepRole.PAYLOAD_MAIN, StepRole.PAYLOAD_SECONDARY, StepRole.WRAP_UP),
                lt_vd);

        seed("DEVILS_ADVOCATE", "Đóng vai phản biện (Devil's Advocate)",
                "Một học sinh hoặc một nhóm nhận nhiệm vụ liên tục đặt câu hỏi nghi vấn, tìm khe hở trong lập luận của nhóm thuyết trình để đẩy sâu tư duy.",
                List.of("STANDARD", "ONLINE"),
                List.of(), List.of(),
                List.of("MIN_45", "MIN_90"),
                List.of("MEDIUM", "LARGE"),
                List.of("Phiếu tiêu chí phản biện và đặt câu hỏi"),
                List.of(
                        "1. Trình bày phương án ban đầu (Nhóm thuyết trình đưa ra quan điểm/giải pháp của bài tập)",
                        "2. Nhóm phản biện đặt câu hỏi nghi vấn (Nhóm 'Chất vấn' đưa ra các câu hỏi xoáy, tìm khe hở và giả định trường hợp thất bại)",
                        "3. Bảo vệ quan điểm & Điều chỉnh (Nhóm thuyết trình lập luận bảo vệ hoặc điều chỉnh phương án để chặt chẽ hơn)",
                        "4. Giáo viên đánh giá tư duy phản biện (Giáo viên nhận xét khả năng tư duy chiều sâu của 2 bên và tổng kết bài học)"
                ),
                List.of(StepRole.PAYLOAD_MAIN, StepRole.PAYLOAD_SECONDARY, StepRole.PAYLOAD_SECONDARY, StepRole.WRAP_UP),
                lt_vd);

        seed("BINGO", "Trò chơi Bingo kiến thức",
                "Học sinh điền từ khóa bài học vào lưới Bingo 3x3 hoặc 4x4. Giáo viên đọc định nghĩa, học sinh gạch chân từ khóa đúng để tạo hàng ngang/dọc.",
                List.of("STANDARD"),
                List.of(), List.of(),
                List.of("MIN_45"),
                List.of("SMALL", "MEDIUM", "LARGE"),
                List.of("Phiếu lưới Bingo 3x3 hoặc 4x4"),
                List.of(
                        "1. Phát lưới Bingo & Điền từ khóa (Học sinh nhận phiếu lưới 3x3 hoặc 4x4 và tự chọn điền các từ khóa bài học vào ô)",
                        "2. Giáo viên đọc định nghĩa/câu hỏi (Giáo viên đọc lần lượt các câu đố/khái niệm, học sinh tìm và gạch từ khóa tương ứng)",
                        "3. Hô BINGO khi hoàn thành hàng (Học sinh gạch đủ 1 hàng ngang/dọc/chéo hô 'BINGO' để giáo viên kiểm tra)",
                        "4. Kiểm tra từ khóa & Trao thưởng (Giáo viên cùng cả lớp đối chiếu kiến thức của các từ khóa chiến thắng)"
                ),
                List.of(StepRole.LOGISTICS, StepRole.PAYLOAD_MAIN, StepRole.CHECKPOINT, StepRole.WRAP_UP),
                lt_only);

        seed("MINUTE_PAPER", "Viết nhanh trong một phút (Minute Paper)",
                "Học sinh viết nhanh ra giấy nháp câu trả lời cho câu hỏi: 'Khái niệm quan trọng nhất bạn vừa học được là gì?' trong vòng đúng 1 phút.",
                List.of("STANDARD", "COMPUTER_LAB", "ONLINE"),
                List.of(), List.of(),
                List.of("MIN_45", "MIN_90"),
                List.of("SMALL", "MEDIUM", "LARGE"),
                List.of("Giấy nháp 1 phút"),
                List.of(
                        "1. Đặt câu hỏi đút kết (Giáo viên chiếu câu hỏi: 'Khái niệm quan trọng nhất em học được hôm nay là gì?')",
                        "2. Viết nhanh trong 60 giây (Học sinh tập trung viết câu trả lời ra giấy nháp trong đúng 1 phút)",
                        "3. Thu bài hoặc tráo đổi nhanh (Học sinh nộp lại nháp hoặc chuyền bạn bên cạnh đọc chéo)",
                        "4. Giáo viên chọn mẫu & Đánh giá (Giáo viên đọc nhanh 3-5 bài nháp để tổng kết bài học)"
                ),
                List.of(StepRole.LOGISTICS, StepRole.PAYLOAD_MAIN, StepRole.LOGISTICS, StepRole.WRAP_UP),
                tk_only);

        seed("DIGITAL_WHITEBOARD", "Bảng trắng số tương tác (Miro/Padlet/Jamboard)",
                "Học sinh cùng truy cập một đường link bảng trắng số để đính kèm note, bình luận hoặc vẽ sơ đồ chung theo thời gian thực.",
                List.of("ONLINE", "COMPUTER_LAB"),
                List.of("SMARTPHONE", "LAPTOP"),
                List.of("WIFI"),
                List.of("MIN_45", "MIN_90"),
                List.of("MEDIUM", "LARGE"),
                List.of("Đường link bảng trắng Padlet/Miro", "Thiết bị kết nối Internet"),
                List.of(
                        "1. Truy cập đường link bảng trắng (Học sinh quét mã QR / bấm link truy cập vào không gian bảng trắng chung)",
                        "2. Đăng bài & Dán Sticky note (Học sinh đính kèm note ý tưởng, hình ảnh hoặc sơ đồ lên không gian làm việc số)",
                        "3. Bình luận & Thả tim tương tác (Học sinh xem bài của bạn khác, thả cảm xúc và để lại nhận xét ngay trên phần mềm)",
                        "4. Tổng hợp màn hình chung (Giáo viên chiếu bảng trắng, gom nhóm các ý tưởng đồng điệu và tổng kết bài giảng)"
                ),
                List.of(StepRole.LOGISTICS, StepRole.PAYLOAD_MAIN, StepRole.PAYLOAD_SECONDARY, StepRole.WRAP_UP),
                kd_ht_lt_vd_tk);

        log.info("[Seed] ActivityDataInitializer completed: 21 activities seeded with specific step templates & default materials.");
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    @SafeVarargs
    private Set<NodeTypeEnum> union(Set<NodeTypeEnum>... sets) {
        Set<NodeTypeEnum> result = new HashSet<>();
        for (Set<NodeTypeEnum> s : sets) result.addAll(s);
        return result;
    }


    private void seed(
            String code,
            String title,
            String content,
            List<String> allowedSpace,
            List<String> requiredDevices,
            List<String> requiredInfrastructure,
            List<String> allowedDuration,
            List<String> allowedClassSize,
            List<String> defaultMaterials,
            List<String> defaultStepTemplate,
            Set<NodeTypeEnum> nodeTypes
    ) {
        seed(code, title, content, allowedSpace, requiredDevices, requiredInfrastructure,
                allowedDuration, allowedClassSize, defaultMaterials, defaultStepTemplate, null, nodeTypes);
    }

    private void seed(
            String code,
            String title,
            String content,
            List<String> allowedSpace,
            List<String> requiredDevices,
            List<String> requiredInfrastructure,
            List<String> allowedDuration,
            List<String> allowedClassSize,
            List<String> defaultMaterials,
            List<String> defaultStepTemplate,
            List<StepRole> stepFieldMapping,
            Set<NodeTypeEnum> nodeTypes
    ) {
        Activity activity = activityRepository.findByCode(code).orElseGet(() -> Activity.builder().code(code).build());
        activity.setTitle(title);
        activity.setContent(content);
        activity.setAllowedSpace(allowedSpace);
        activity.setRequiredDevices(requiredDevices);
        activity.setRequiredInfrastructure(requiredInfrastructure);
        activity.setAllowedDuration(allowedDuration);
        activity.setAllowedClassSize(allowedClassSize);
        activity.setDefaultMaterials(defaultMaterials);
        activity.setDefaultStepTemplate(defaultStepTemplate);
        activity.setStepFieldMapping(stepFieldMapping != null && !stepFieldMapping.isEmpty() 
                ? stepFieldMapping 
                : deriveStepFieldMapping(defaultStepTemplate));
        activity.setNodeTypes(nodeTypes);
        activityRepository.save(activity);
    }

    private List<StepRole> deriveStepFieldMapping(List<String> stepTemplate) {
        if (stepTemplate == null || stepTemplate.isEmpty()) {
            return List.of();
        }
        int size = stepTemplate.size();
        if (size == 1) {
            return List.of(StepRole.PAYLOAD_MAIN);
        }
        if (size == 2) {
            return List.of(StepRole.LOGISTICS, StepRole.PAYLOAD_MAIN);
        }
        if (size == 3) {
            return List.of(StepRole.LOGISTICS, StepRole.PAYLOAD_MAIN, StepRole.WRAP_UP);
        }
        if (size == 4) {
            return List.of(StepRole.LOGISTICS, StepRole.PAYLOAD_MAIN, StepRole.PAYLOAD_SECONDARY, StepRole.WRAP_UP);
        }
        List<StepRole> roles = new java.util.ArrayList<>();
        roles.add(StepRole.LOGISTICS);
        for (int i = 1; i < size - 1; i++) {
            roles.add(i == 1 ? StepRole.PAYLOAD_MAIN : StepRole.PAYLOAD_SECONDARY);
        }
        roles.add(StepRole.WRAP_UP);
        return roles;
    }

}
