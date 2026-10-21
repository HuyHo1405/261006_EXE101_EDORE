package com.edore.backend.features.lesson.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.poi.xwpf.usermodel.*;
import org.junit.jupiter.api.Test;
import java.io.ByteArrayInputStream;
import java.nio.file.*;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;

class LessonDocumentServiceTest {
    @Test void separateExportsKeepOnlyTheirOwnContentAndQuestionsStartOnFirstPage() throws Exception {
        var service = new LessonDocumentService();
        var request = new LessonDocumentService.Request("Lịch sử và cuộc sống", "Lịch sử 6 KNTT",
                List.of(new LessonDocumentService.Section("Hình thành kiến thức", List.of(
                        new LessonDocumentService.Block("Kiến thức trọng tâm", "**Lịch sử** là những gì đã xảy ra. Năm 1945 là một cột mốc quan trọng.", true)))),
                List.of(new LessonDocumentService.Question("Lịch sử là gì?", List.of("Những gì đã xảy ra", "Dự đoán tương lai"), 1,
                        "", "Lịch sử phản ánh quá khứ."),
                        new LessonDocumentService.Question("Nêu một cột mốc em biết", List.of(), null, "Ngày 2/9/1945", "")));
        byte[] lesson = service.exportLesson(request);
        byte[] questions = service.exportQuestions(request);
        try (var doc = new XWPFDocument(new ByteArrayInputStream(lesson))) {
            String text = doc.getParagraphs().stream().map(XWPFParagraph::getText).reduce("", (a, b) -> a + "\n" + b);
            assertTrue(text.contains("BÀI GIẢNG"));
            assertTrue(text.contains("Hình thành kiến thức"));
            assertTrue(text.contains("Năm 1945"));
            assertFalse(text.contains("Lịch sử là gì?"));
            assertFalse(text.contains("Bộ câu hỏi đầy đủ"));
        }
        try (var doc = new XWPFDocument(new ByteArrayInputStream(questions))) {
            String text = doc.getParagraphs().stream().map(XWPFParagraph::getText).reduce("", (a, b) -> a + "\n" + b);
            assertTrue(text.contains("BỘ CÂU HỎI"));
            assertFalse(text.contains("Hình thành kiến thức"));
            assertFalse(text.contains("Năm 1945"));
            for (var question : request.questions()) {
                assertTrue(text.contains(question.question()));
                for (String option : question.options()) assertTrue(text.contains(option));
            }
            assertTrue(text.contains("Đáp án đúng: A."));
            assertTrue(text.contains("Lịch sử phản ánh quá khứ."));
            assertTrue(text.contains("Hướng dẫn trả lời: Ngày 2/9/1945"));
            assertTrue(doc.getParagraphs().stream().noneMatch(XWPFParagraph::isPageBreak));
            assertTrue(doc.getHeaderList().stream().anyMatch(h -> !h.getAllPictures().isEmpty()));
        }
        assertThrows(com.edore.backend.core.exception.ApiException.class, () -> service.exportQuestions(
                new LessonDocumentService.Request("Chưa có câu hỏi", "", request.sections(), List.of())));
        String preview = System.getProperty("lesson.docx.splitPreview");
        if (preview != null) {
            Files.write(Path.of(preview + "-bai-giang.docx"), lesson);
            Files.write(Path.of(preview + "-bo-cau-hoi.docx"), questions);
        }
    }

    @Test void exportsFullLessonWithPastelPaletteRomanSectionsAndCenteredTitle() throws Exception {
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
                    .allMatch(p -> p.getRuns().stream().allMatch(r -> r.isBold() && List.of("6E86A6", "887E9D").contains(r.getColor()))));
            assertEquals(ParagraphAlignment.CENTER, doc.getParagraphs().stream().filter(p -> "Title".equals(p.getStyle())).findFirst().orElseThrow().getAlignment());
            assertEquals("upperRoman", doc.getNumbering().getAbstractNum(java.math.BigInteger.ZERO).getCTAbstractNum().getLvlArray(0).getNumFmt().getVal().toString());
            assertTrue(doc.getParagraphs().stream().filter(p -> "Heading1".equals(p.getStyle())).allMatch(p -> p.getNumID() != null));
            String xml = doc.getDocument().xmlText();
            assertTrue(xml.contains("E5F1EA")); assertTrue(xml.contains("F7E9D8"));
            assertFalse(xml.contains("yellow")); assertFalse(xml.contains("034CE4"));
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
