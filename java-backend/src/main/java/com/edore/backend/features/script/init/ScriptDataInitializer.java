package com.edore.backend.features.script.init;

import com.edore.backend.features.script.entity.NodeType;
import com.edore.backend.features.script.entity.Template;
import com.edore.backend.features.script.model.NodeTypeEnum;
import com.edore.backend.features.script.repository.NodeTypeRepository;
import com.edore.backend.features.script.repository.TemplateRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@Order(10)
@RequiredArgsConstructor
public class ScriptDataInitializer implements CommandLineRunner {

    private final TemplateRepository templateRepository;
    private final NodeTypeRepository nodeTypeRepository;

    @Override
    @Transactional
    public void run(String... args) throws Exception {

        // ── 1. Master NodeTypes ──────────────────────────────────────────────
        NodeType ntKhoiDong  = seedNodeType(NodeTypeEnum.KHOI_DONG);
        NodeType ntHinhThanh = seedNodeType(NodeTypeEnum.HINH_THANH_KIEN_THUC);
        NodeType ntLuyenTap  = seedNodeType(NodeTypeEnum.LUYEN_TAP);
        NodeType ntVanDung   = seedNodeType(NodeTypeEnum.VAN_DUNG);

        // ── 2. Template 1: 3-Node (default) ──────────────────────────────────
        Template t3 = templateRepository.findByCode("3-node").orElseGet(() -> {
            Template t = Template.builder()
                    .code("3-node")
                    .name("Khung 3 Node")
                    .description("Kịch bản giảng dạy gồm 3 node: Khởi động → Hình thành kiến thức → Luyện tập")
                    .build();
            log.info("[Seed] Template '3-node' created");
            return t;
        });
        if (t3.getNodeTypes() == null) {
            t3.setNodeTypes(new java.util.ArrayList<>());
        } else {
            t3.getNodeTypes().clear();
        }
        t3.getNodeTypes().addAll(java.util.List.of(ntKhoiDong, ntHinhThanh, ntLuyenTap));
        templateRepository.save(t3);

        // ── 3. Template 2: 4-Node (extended) ──────────────────────────────────
        Template t4 = templateRepository.findByCode("4-node").orElseGet(() -> {
            Template t = Template.builder()
                    .code("4-node")
                    .name("Khung 4 Node")
                    .description("Kịch bản giảng dạy gồm 4 node: Khởi động → Hình thành kiến thức → Luyện tập → Vận dụng")
                    .build();
            log.info("[Seed] Template '4-node' created");
            return t;
        });
        if (t4.getNodeTypes() == null) {
            t4.setNodeTypes(new java.util.ArrayList<>());
        } else {
            t4.getNodeTypes().clear();
        }
        t4.getNodeTypes().addAll(java.util.List.of(ntKhoiDong, ntHinhThanh, ntLuyenTap, ntVanDung));
        templateRepository.save(t4);

        log.info("[Seed] ScriptDataInitializer completed: 2 templates linked with NodeTypes");
    }

    private NodeType seedNodeType(NodeTypeEnum enumType) {
        return nodeTypeRepository.findById(enumType).orElseGet(() -> {
            NodeType nt = NodeType.builder()
                    .id(enumType)
                    .code(enumType.name().toLowerCase())
                    .name(enumType.getTitle())
                    .description(enumType.getIntent())
                    .build();
            log.info("[Seed] Master NodeType '{}' created", enumType.name());
            return nodeTypeRepository.save(nt);
        });
    }
}
