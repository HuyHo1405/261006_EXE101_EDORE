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
    private static final String BLUE = "6E86A6";
    private static final String LILAC = "887E9D";
    private static final String MINT = "E5F1EA";
    private static final String PEACH = "F7E9D8";
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
        return export(request, "NỘI DUNG BÀI HỌC");
    }

    public byte[] exportLesson(Request request) throws IOException {
        return export(new Request(request.title(), request.subtitle(), request.sections(), List.of()), "BÀI GIẢNG");
    }

    public byte[] exportQuestions(Request request) throws IOException {
        if (request.questions().isEmpty())
            throw new ApiException(CommonResponseCode.VALIDATION_FAILED, "Bài học chưa có câu hỏi để xuất Word.");
        return export(new Request(request.title(), request.subtitle(), List.of(), request.questions()), "BỘ CÂU HỎI DÀNH CHO GIÁO VIÊN");
    }

    public byte[] exportStudentQuestions(Request request) throws IOException {
        if (request.questions().isEmpty())
            throw new ApiException(CommonResponseCode.VALIDATION_FAILED, "Bài học chưa có câu hỏi để xuất Word.");
        // Remove the answer key before rendering so it cannot enter the student document.
        var questions = request.questions().stream().map(q -> new Question(q.question(), q.options(), null, "", "")).toList();
        return export(new Request(request.title(), request.subtitle(), List.of(), questions), "PHIẾU CÂU HỎI DÀNH CHO HỌC SINH", false);
    }

    private byte[] export(Request request, String documentLabel) throws IOException {
        return export(request, documentLabel, true);
    }

    private byte[] export(Request request, String documentLabel, boolean includeAnswers) throws IOException {
        long length = request.sections().stream().flatMap(s -> s.blocks().stream()).mapToLong(b -> b.text().length()).sum()
                + request.questions().stream().mapToLong(q -> q.question().length() + q.options().stream().mapToInt(String::length).sum()
                + value(q.answer()).length() + value(q.explanation()).length()).sum();
        if (length > 1_000_000) throw new ApiException(CommonResponseCode.VALIDATION_FAILED, "Bài học quá lớn để xuất Word trong một lần.");
        try (var document = new XWPFDocument(); var output = new ByteArrayOutputStream()) {
            configure(document);
            BigInteger sectionNumbering = document.getNumbering().addNum(BigInteger.ZERO);
            var kicker = document.createParagraph(); kicker.setAlignment(ParagraphAlignment.CENTER);
            kicker.setSpacingBefore(160); kicker.setSpacingAfter(100); kicker.setKeepNext(true);
            var kickerRun = kicker.createRun(); base(kickerRun); kickerRun.setFontSize(9); kickerRun.setColor("8C9EAE"); kickerRun.setText(documentLabel);
            var title = document.createParagraph();
            title.setStyle("Title"); title.setAlignment(ParagraphAlignment.CENTER); title.setKeepNext(true); title.setSpacingAfter(220);
            var titleRun = title.createRun(); base(titleRun); titleRun.setFontSize(23); titleRun.setBold(true); titleRun.setColor(BLUE); titleRun.setText(clean(request.title()));
            if (!value(request.subtitle()).isBlank()) {
                var subtitle = paragraph(document, request.subtitle(), false);
                subtitle.setAlignment(ParagraphAlignment.CENTER); subtitle.setSpacingAfter(240);
                subtitle.getRuns().forEach(r -> { r.setFontSize(10); r.setColor("8392A0"); });
            }
            if (!includeAnswers) {
                paragraph(document, "Họ và tên: ................................................  Lớp: ................", false);
                var instructions = paragraph(document, "Với câu trắc nghiệm, ghi chữ cái của lựa chọn. Với câu tự luận, viết câu trả lời vào phần trống dưới mỗi câu.", false);
                instructions.setSpacingAfter(180);
                instructions.getRuns().forEach(r -> r.setFontSize(10));
            }
            for (Section section : request.sections()) {
                var sectionHeading = heading(document, section.title(), 1);
                sectionHeading.setNumID(sectionNumbering); sectionHeading.setNumILvl(BigInteger.ZERO);
                BigInteger unitNumbering = document.getNumbering().addNum(BigInteger.ONE);
                String previousLabel = "";
                for (Block block : section.blocks()) {
                    if (block.text().isBlank()) continue;
                    if (value(block.label()).equals("Đơn vị kiến thức")) {
                        var unit = heading(document, block.text(), 2);
                        unit.setNumID(unitNumbering); unit.setNumILvl(BigInteger.ZERO);
                    } else {
                        String label = value(block.label());
                        boolean generic = List.of("Tiêu đề", "Mô tả", "Diễn giải", "Nội dung bổ sung").contains(label);
                        paragraphs(document, block.text(), block.important(), generic || label.equals(previousLabel) ? "" : label);
                    }
                    previousLabel = value(block.label());
                }
            }
            if (!request.questions().isEmpty()) {
                var appendix = heading(document, "Bộ câu hỏi đầy đủ", 1);
                appendix.setNumID(sectionNumbering); appendix.setNumILvl(BigInteger.ZERO);
                appendix.setPageBreak(!request.sections().isEmpty());
                int i = 0;
                for (Question q : request.questions()) {
                    var question = paragraph(document, q.question(), false, "Câu " + (++i));
                    question.setSpacingBefore(200);
                    question.setKeepNext(true);
                    boolean hasOptions = q.options().stream().anyMatch(o -> !o.isBlank());
                    for (int j = 0; j < q.options().size(); j++) if (!q.options().get(j).isBlank())
                        {
                            var p = paragraph(document, (char) ('A' + j) + ". " + q.options().get(j), false);
                            p.setIndentationLeft(300); p.setIndentationHanging(240); p.setSpacingAfter(65);
                            if (!includeAnswers) p.setKeepNext(true);
                        }
                    if (!includeAnswers) {
                        var response = paragraph(document, hasOptions ? "................" : "................................................................................................", false, "Đáp án của bạn là");
                        response.setAlignment(ParagraphAlignment.LEFT); response.setSpacingBefore(100); response.setSpacingAfter(140);
                        response.setKeepNext(!hasOptions);
                        if (!hasOptions) for (int line = 0; line < 2; line++) {
                            var space = paragraph(document, "........................................................................................................................", false);
                            space.setSpacingAfter(100);
                            space.setKeepNext(line == 0);
                        }
                        continue;
                    }
                    if (q.correctAnswer() != null && q.correctAnswer() <= q.options().size()
                            && !q.options().get(q.correctAnswer() - 1).isBlank()) {
                        paragraph(document, (char) ('A' + q.correctAnswer() - 1) + ". " + q.options().get(q.correctAnswer() - 1), false, "Đáp án đúng");
                        if (!value(q.answer()).isBlank() && !q.answer().strip().equals(q.options().get(q.correctAnswer() - 1).strip()))
                            paragraphs(document, "Hướng dẫn giải bổ sung: " + q.answer(), false);
                    } else if (!value(q.answer()).isBlank()) paragraphs(document, q.answer(), false, "Hướng dẫn trả lời");
                    if (!value(q.explanation()).isBlank()) paragraphs(document, q.explanation(), false, "Giải thích");
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
        margins.setLeft(BigInteger.valueOf(1247)); margins.setRight(BigInteger.valueOf(1247));
        margins.setHeader(BigInteger.valueOf(400)); margins.setFooter(BigInteger.valueOf(500));
        var styles = document.createStyles();
        for (String name : List.of("Title", "Heading1", "Heading2")) {
            CTStyle ct = CTStyle.Factory.newInstance(); ct.setStyleId(name); ct.setType(STStyleType.PARAGRAPH);
            ct.addNewName().setVal(name); ct.addNewRPr().addNewColor().setVal(name.equals("Heading2") ? LILAC : BLUE);
            ct.getRPr().addNewB().setVal(true);
            if (!name.equals("Title")) ct.addNewPPr().addNewOutlineLvl().setVal(BigInteger.valueOf(name.equals("Heading1") ? 0 : 1));
            styles.addStyle(new XWPFStyle(ct));
        }
        var numbering = document.createNumbering();
        for (int i = 0; i < 2; i++) {
            var abstractNum = CTAbstractNum.Factory.newInstance(); abstractNum.setAbstractNumId(BigInteger.valueOf(i));
            var level = abstractNum.addNewLvl(); level.setIlvl(BigInteger.ZERO);
            level.addNewStart().setVal(BigInteger.ONE);
            level.addNewNumFmt().setVal(i == 0 ? STNumberFormat.UPPER_ROMAN : STNumberFormat.DECIMAL);
            level.addNewLvlText().setVal("%1.");
            level.addNewLvlJc().setVal(STJc.LEFT);
            var ind = level.addNewPPr().addNewInd(); ind.setLeft(BigInteger.ZERO); ind.setHanging(BigInteger.ZERO);
            var numberStyle = level.addNewRPr(); numberStyle.addNewColor().setVal(i == 0 ? BLUE : LILAC); numberStyle.addNewB().setVal(true);
            numberStyle.addNewSz().setVal(BigInteger.valueOf(i == 0 ? 28 : 24));
            var numberFont = numberStyle.addNewRFonts(); numberFont.setAscii("Arial"); numberFont.setHAnsi("Arial");
            numbering.addAbstractNum(new XWPFAbstractNum(abstractNum));
        }
        var header = document.createHeader(HeaderFooterType.DEFAULT).createParagraph();
        header.setSpacingAfter(80);
        var logo = header.createRun();
        try (var input = new ClassPathResource("export/edore-logo.png").getInputStream()) {
            logo.addPicture(input, Document.PICTURE_TYPE_PNG, "EDORE", Units.toEMU(14), Units.toEMU(18));
        } catch (org.apache.poi.openxml4j.exceptions.InvalidFormatException e) { throw new IOException("Invalid EDORE logo", e); }
        var brand = header.createRun(); base(brand); brand.setText("  EDORE"); brand.setBold(true); brand.setColor(BLUE); brand.setFontSize(11);
        var footer = document.createFooter(HeaderFooterType.DEFAULT).createParagraph();
        footer.setAlignment(ParagraphAlignment.RIGHT);
        var foot = footer.createRun(); base(foot); foot.setFontSize(9); foot.setColor("8398AC"); foot.setText("EDORE  |  Trang ");
        var field = footer.getCTP().addNewFldSimple(); field.setInstr("PAGE"); field.addNewR().addNewT().setStringValue("1");
    }

    private XWPFParagraph heading(XWPFDocument document, String text, int level) {
        var p = document.createParagraph(); p.setStyle("Heading" + level); p.setKeepNext(true);
        p.setSpacingBefore(level == 1 ? 260 : 170); p.setSpacingAfter(level == 1 ? 130 : 100);
        var run = p.createRun(); base(run); run.setColor(level == 1 ? BLUE : LILAC); run.setBold(true); run.setFontSize(level == 1 ? 14 : 12);
        run.setText(clean(text).replace("**", "")); return p;
    }

    private void paragraphs(XWPFDocument document, String text, boolean important) {
        paragraphs(document, text, important, "");
    }

    private void paragraphs(XWPFDocument document, String text, boolean important, String label) {
        boolean first = true;
        for (String line : clean(text).replace("\\n", "\n").split("\\R")) {
            if (line.isBlank()) continue;
            if (line.matches("^#{1,6}\\s+.*")) heading(document, line.replaceFirst("^#{1,6}\\s+", ""), 2);
            else paragraph(document, line.replaceFirst("^\\s*[-*•]\\s+", "– "), important, first ? label : "");
            first = false;
        }
    }

    private XWPFParagraph paragraph(XWPFDocument document, String text, boolean important) {
        return paragraph(document, text, important, "");
    }

    private XWPFParagraph paragraph(XWPFDocument document, String text, boolean important, String label) {
        var p = document.createParagraph(); p.setSpacingAfter(100); p.setSpacingBetween(1.22); p.setAlignment(ParagraphAlignment.BOTH);
        if (!value(label).isBlank()) {
            var lead = p.createRun(); base(lead); lead.setBold(true); lead.setColor(LILAC); lead.setText(clean(label) + ": ");
        }
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
            var milestone = run(p, dates.group(), true, false);
            shade(milestone, PEACH); start = dates.end();
        }
        run(p, text.substring(start), bold, highlight);
    }

    private XWPFRun run(XWPFParagraph p, String text, boolean bold, boolean highlight) {
        if (text.isEmpty()) return null;
        var run = p.createRun(); base(run); run.setBold(bold);
        String[] lines = text.split("\\R", -1);
        for (int i = 0; i < lines.length; i++) { if (i > 0) run.addBreak(); run.setText(lines[i]); }
        if (highlight) shade(run, MINT);
        return run;
    }
    private void shade(XWPFRun run, String fill) {
        var properties = run.getCTR().isSetRPr() ? run.getCTR().getRPr() : run.getCTR().addNewRPr();
        var shade = properties.sizeOfShdArray() == 0 ? properties.addNewShd() : properties.getShdArray(0);
        shade.setVal(STShd.CLEAR); shade.setFill(fill);
    }
    private void base(XWPFRun run) { run.setFontFamily("Arial"); run.setFontSize(11); run.setColor("414C5A"); }
    private static String value(String s) { return s == null ? "" : s; }
    private String clean(String s) {
        return value(s).replaceAll("[\\x{1F000}-\\x{1FAFF}\\x{2600}-\\x{27BF}\\uFE0F\\u200D]", "")
                .replaceAll("[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F]", "").strip();
    }
}
