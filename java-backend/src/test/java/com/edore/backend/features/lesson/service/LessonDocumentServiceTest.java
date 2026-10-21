package com.edore.backend.features.lesson.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.poi.xwpf.usermodel.*;
import org.junit.jupiter.api.Test;
import java.io.ByteArrayInputStream;
import java.nio.file.*;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;

class LessonDocumentServiceTest {
    @Test void exportsFullLessonAndQuestionsWithLogoBlueHeadingsAndHighlightedMilestones() throws Exception {
        var service = new LessonDocumentService();
        var request = new LessonDocumentService.Request("Lịch sử và cuộc sống", "Lịch sử 6 KNTT",
                List.of(new LessonDocumentService.Section("Hình thành kiến thức", List.of(
                        new LessonDocumentService.Block("Kiến thức trọng tâm", "**Lịch sử** là những gì đã xảy ra. Ngày 2/9/1945 đánh dấu sự ra đời của nước Việt Nam Dân chủ Cộng hòa. ✨", true),
                        new LessonDocumentService.Block("Nội dung đầy đủ", "Nội dung cuối bài vẫn được xuất trọn vẹn.", false)))),
                List.of(new LessonDocumentService.Question("Câu hỏi rất dài ".repeat(15), List.of("Lựa chọn dài ".repeat(15), "B", "C", "D"), 1,
                        "", "Giải thích đầy đủ cho câu hỏi."), new LessonDocumentService.Question("Câu tự luận", List.of(), null, "Hướng dẫn giải tự luận", "")));
        String fixture = System.getProperty("lesson.docx.fixture");
        if (fixture != null) request = new ObjectMapper().readValue(Files.readString(Path.of(fixture)), LessonDocumentService.Request.class);
        byte[] bytes = service.export(request);
        String preview = System.getProperty("lesson.docx.preview");
        if (preview != null) Files.write(Path.of(preview), bytes);
        try (var doc = new XWPFDocument(new ByteArrayInputStream(bytes))) {
            String text = doc.getParagraphs().stream().map(XWPFParagraph::getText).reduce("", (a, b) -> a + "\n" + b);
            assertTrue(doc.getHeaderList().stream().anyMatch(h -> !h.getAllPictures().isEmpty()));
            assertTrue(doc.getHeaderList().stream().anyMatch(h -> h.getText().contains("EDORE")));
            assertTrue(doc.getParagraphs().stream().filter(p -> p.getStyle() != null && (p.getStyle().startsWith("Heading") || p.getStyle().equals("Title")))
                    .allMatch(p -> p.getRuns().stream().allMatch(r -> r.isBold() && "034CE4".equals(r.getColor()))));
            assertTrue(doc.getParagraphs().stream().flatMap(p -> p.getRuns().stream()).anyMatch(r -> r.getTextHighlightColor() != null && r.getTextHighlightColor().toString().equals("yellow")));
            assertFalse(text.contains("✨")); assertFalse(text.contains("**"));
            for (var question : request.questions()) {
                assertTrue(text.contains(question.question().strip()));
                for (var option : question.options()) if (!option.isBlank()) assertTrue(text.contains(option.strip()));
            }
            assertTrue(text.indexOf("Bộ câu hỏi đầy đủ") > text.indexOf(request.sections().getLast().title()));
            if (fixture == null) {
                assertTrue(text.contains("Nội dung cuối bài vẫn được xuất trọn vẹn."));
                assertTrue(text.contains("Giải thích đầy đủ cho câu hỏi."));
                assertTrue(text.contains("Hướng dẫn giải tự luận"));
            }
        }
    }
}
