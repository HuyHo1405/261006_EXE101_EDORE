package com.edore.backend.features.lesson.service;

import com.edore.backend.core.exception.ApiException;
import com.edore.backend.core.response.CommonResponseCode;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.apache.poi.util.Units;
import org.apache.poi.wp.usermodel.HeaderFooterType;
import org.apache.poi.xwpf.usermodel.*;
import org.openxmlformats.schemas.wordprocessingml.x2006.main.*;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.*;
import java.math.BigInteger;
import java.util.List;
import java.util.regex.Pattern;

@Service
public class LessonDocumentService {
    private static final String BLUE = "034CE4";
    private static final Pattern EMPHASIS = Pattern.compile("\\*\\*(.+?)\\*\\*");
    private static final Pattern MILESTONE = Pattern.compile(
            "(?iu)(?:ngày\\s+\\d{1,2}(?:\\s*[–—/-]\\s*\\d{1,2})?(?:\\s*[–—/-]\\s*\\d{2,4})?"
            + "|\\b\\d{1,2}[/–-]\\d{1,2}[/–-]\\d{3,4}\\b"
            + "|(?:năm|tháng)\\s+\\d{1,4}(?:\\s*(?:TCN|SCN|trước Công nguyên|sau Công nguyên))?"
            + "|thế\\s+k[ỉỷ]\\s+[IVXLCDM\\d]+(?:\\s*(?:TCN|SCN))?"
            + "|\\b(?:1[0-9]{3}|20[0-9]{2})(?:\\s*(?:TCN|SCN))?\\b)");

    public record Block(@Size(max = 300) String label, @NotNull @Size(max = 50000) String text, boolean important) {}
    public record Section(@NotBlank @Size(max = 500) String title,
                          @NotNull @Size(max = 500) List<@NotNull @Valid Block> blocks) {}
    public record Question(@NotBlank @Size(max = 20000) String question,
                           @NotNull @Size(max = 10) List<@NotNull @Size(max = 20000) String> options,
                           @Min(1) @Max(10) Integer correctAnswer,
                           @Size(max = 20000) String answer, @Size(max = 20000) String explanation) {}
    public record Request(@NotBlank @Size(max = 500) String title, @Size(max = 500) String subtitle,
                          @NotNull @Size(max = 100) List<@NotNull @Valid Section> sections,
                          @NotNull @Size(max = 1000) List<@NotNull @Valid Question> questions) {}

    public byte[] export(Request request) throws IOException {
        long length = request.sections().stream().flatMap(s -> s.blocks().stream()).mapToLong(b -> b.text().length()).sum()
                + request.questions().stream().mapToLong(q -> q.question().length() + q.options().stream().mapToInt(String::length).sum()
                + value(q.answer()).length() + value(q.explanation()).length()).sum();
        if (length > 1_000_000) throw new ApiException(CommonResponseCode.VALIDATION_FAILED, "Bài học quá lớn để xuất Word trong một lần.");
        try (var document = new XWPFDocument(); var output = new ByteArrayOutputStream()) {
            configure(document);
            var title = document.createParagraph();
            title.setStyle("Title"); title.setSpacingAfter(180);
            var titleRun = title.createRun(); base(titleRun); titleRun.setFontSize(22); titleRun.setBold(true); titleRun.setColor(BLUE); titleRun.setText(clean(request.title()));
            if (!value(request.subtitle()).isBlank()) paragraph(document, request.subtitle(), false);
            for (Section section : request.sections()) {
                heading(document, section.title(), 1);
                String previousLabel = "";
                for (Block block : section.blocks()) {
                    if (block.text().isBlank()) continue;
                    if (!value(block.label()).isBlank() && !block.label().equals(previousLabel)) heading(document, block.label(), 2);
                    paragraphs(document, block.text(), block.important());
                    previousLabel = value(block.label());
                }
            }
            if (!request.questions().isEmpty()) {
                var appendix = heading(document, "Bộ câu hỏi đầy đủ", 1);
                appendix.setPageBreak(true);
                int i = 0;
                for (Question q : request.questions()) {
                    var question = heading(document, "Câu " + (++i), 2);
                    question.setKeepNext(true);
                    paragraphs(document, q.question(), false);
                    for (int j = 0; j < q.options().size(); j++) if (!q.options().get(j).isBlank())
                        paragraphs(document, (char) ('A' + j) + ". " + q.options().get(j), false);
                    if (q.correctAnswer() != null && q.correctAnswer() <= q.options().size()
                            && !q.options().get(q.correctAnswer() - 1).isBlank()) {
                        paragraph(document, "Đáp án đúng: " + (char) ('A' + q.correctAnswer() - 1) + ". " + q.options().get(q.correctAnswer() - 1), true);
                        if (!value(q.answer()).isBlank() && !q.answer().strip().equals(q.options().get(q.correctAnswer() - 1).strip()))
                            paragraphs(document, "Hướng dẫn giải bổ sung: " + q.answer(), false);
                    } else if (!value(q.answer()).isBlank()) paragraph(document, "Đáp án / hướng dẫn giải: " + q.answer(), true);
                    if (!value(q.explanation()).isBlank()) paragraphs(document, "Giải thích: " + q.explanation(), false);
                }
            }
            document.write(output);
            return output.toByteArray();
        }
    }

    private void configure(XWPFDocument document) throws IOException {
        document.getProperties().getCoreProperties().setCreator("EDORE");
        var sect = document.getDocument().getBody().addNewSectPr();
        var size = sect.addNewPgSz(); size.setW(BigInteger.valueOf(11906)); size.setH(BigInteger.valueOf(16838));
        var margins = sect.addNewPgMar();
        margins.setTop(BigInteger.valueOf(1134)); margins.setBottom(BigInteger.valueOf(1134));
        margins.setLeft(BigInteger.valueOf(1134)); margins.setRight(BigInteger.valueOf(1134));
        margins.setHeader(BigInteger.valueOf(400)); margins.setFooter(BigInteger.valueOf(500));
        var styles = document.createStyles();
        for (String name : List.of("Title", "Heading1", "Heading2")) {
            CTStyle ct = CTStyle.Factory.newInstance(); ct.setStyleId(name); ct.setType(STStyleType.PARAGRAPH);
            ct.addNewName().setVal(name); ct.addNewRPr().addNewColor().setVal(BLUE);
            ct.getRPr().addNewB().setVal(true);
            if (!name.equals("Title")) ct.addNewPPr().addNewOutlineLvl().setVal(BigInteger.valueOf(name.equals("Heading1") ? 0 : 1));
            styles.addStyle(new XWPFStyle(ct));
        }
        var header = document.createHeader(HeaderFooterType.DEFAULT).createParagraph();
        header.setSpacingAfter(120);
        var logo = header.createRun();
        try (var input = new ClassPathResource("export/edore-logo.png").getInputStream()) {
            logo.addPicture(input, Document.PICTURE_TYPE_PNG, "EDORE", Units.toEMU(22), Units.toEMU(28));
        } catch (org.apache.poi.openxml4j.exceptions.InvalidFormatException e) { throw new IOException("Invalid EDORE logo", e); }
        var brand = header.createRun(); base(brand); brand.setText("  EDORE"); brand.setBold(true); brand.setColor(BLUE); brand.setFontSize(16);
        var footer = document.createFooter(HeaderFooterType.DEFAULT).createParagraph();
        footer.setAlignment(ParagraphAlignment.RIGHT);
        var foot = footer.createRun(); base(foot); foot.setFontSize(9); foot.setColor(BLUE); foot.setText("EDORE  |  Trang ");
        var field = footer.getCTP().addNewFldSimple(); field.setInstr("PAGE"); field.addNewR().addNewT().setStringValue("1");
    }

    private XWPFParagraph heading(XWPFDocument document, String text, int level) {
        var p = document.createParagraph(); p.setStyle("Heading" + level); p.setKeepNext(true);
        p.setSpacingBefore(level == 1 ? 240 : 130); p.setSpacingAfter(80);
        var run = p.createRun(); base(run); run.setColor(BLUE); run.setBold(true); run.setFontSize(level == 1 ? 15 : 11);
        run.setText(clean(text).replace("**", "")); return p;
    }

    private void paragraphs(XWPFDocument document, String text, boolean important) {
        for (String line : clean(text).replace("\\n", "\n").split("\\R")) {
            if (line.isBlank()) continue;
            if (line.matches("^#{1,6}\\s+.*")) heading(document, line.replaceFirst("^#{1,6}\\s+", ""), 2);
            else paragraph(document, line.replaceFirst("^\\s*[-*•]\\s+", "– "), important);
        }
    }

    private XWPFParagraph paragraph(XWPFDocument document, String text, boolean important) {
        var p = document.createParagraph(); p.setSpacingAfter(90); p.setSpacingBetween(1.15);
        String line = clean(text);
        var bold = EMPHASIS.matcher(line); int start = 0;
        while (bold.find()) {
            runs(p, line.substring(start, bold.start()), false, important);
            runs(p, bold.group(1), true, true); start = bold.end();
        }
        runs(p, line.substring(start), false, important); return p;
    }

    private void runs(XWPFParagraph p, String text, boolean bold, boolean important) {
        if (important && text.length() > 220) {
            var firstStatement = Pattern.compile("^.{25,220}?[.!?](?=\\s|$)").matcher(text);
            if (firstStatement.find()) {
                runs(p, firstStatement.group(), bold, true);
                runs(p, text.substring(firstStatement.end()), bold, false);
                return;
            }
        }
        var dates = MILESTONE.matcher(text); int start = 0;
        // Highlight compact core statements, not entire long explanatory paragraphs.
        boolean highlight = important && text.length() <= 220;
        while (dates.find()) {
            run(p, text.substring(start, dates.start()), bold, highlight);
            run(p, dates.group(), true, true); start = dates.end();
        }
        run(p, text.substring(start), bold, highlight);
    }

    private void run(XWPFParagraph p, String text, boolean bold, boolean highlight) {
        if (text.isEmpty()) return;
        var run = p.createRun(); base(run); run.setBold(bold); run.setText(text);
        if (highlight) run.setTextHighlightColor("yellow");
    }
    private void base(XWPFRun run) { run.setFontFamily("Arial"); run.setFontSize(11); run.setColor("172033"); }
    private static String value(String s) { return s == null ? "" : s; }
    private String clean(String s) {
        return value(s).replaceAll("[\\x{1F000}-\\x{1FAFF}\\x{2600}-\\x{27BF}\\uFE0F\\u200D]", "")
                .replaceAll("[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F]", "").strip();
    }
}
