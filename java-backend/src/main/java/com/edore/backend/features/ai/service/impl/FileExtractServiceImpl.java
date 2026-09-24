package com.edore.backend.features.ai.service.impl;

import com.edore.backend.core.config.LlmProperties;
import com.edore.backend.core.exception.ApiException;
import com.edore.backend.features.ai.code.AiResponseCode;
import com.edore.backend.features.ai.service.FileExtractService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.apache.poi.xwpf.usermodel.XWPFTable;
import org.apache.poi.xwpf.usermodel.XWPFTableRow;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class FileExtractServiceImpl implements FileExtractService {

    private final LlmProperties llmProperties;

    @Override
    public String extract(MultipartFile file) {
        validateFile(file);
        String filename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "";
        try {
            return extractFromStream(file.getInputStream(), filename);
        } catch (IOException e) {
            log.error("[FileExtract] Failed to read stream for '{}': {}", filename, e.getMessage(), e);
            throw new ApiException(AiResponseCode.FILE_EXTRACT_ERROR);
        }
    }

    @Override
    public String extractFromFile(File file) {
        if (file == null || !file.exists()) {
            throw new ApiException(AiResponseCode.NO_FILE_PROVIDED);
        }
        try (InputStream is = new FileInputStream(file)) {
            return extractFromStream(is, file.getName());
        } catch (IOException e) {
            log.error("[FileExtract] Failed to read file '{}': {}", file.getName(), e.getMessage(), e);
            throw new ApiException(AiResponseCode.FILE_EXTRACT_ERROR);
        }
    }

    @Override
    public String extractFromStream(InputStream inputStream, String fileName) {
        String filenameLower = fileName != null ? fileName.toLowerCase() : "";
        long start = System.currentTimeMillis();
        String text;

        try {
            byte[] bytes = inputStream.readAllBytes();
            if (filenameLower.endsWith(".pdf")) {
                text = extractPdf(bytes);
            } else if (filenameLower.endsWith(".docx") || filenameLower.endsWith(".doc")) {
                text = extractDocx(bytes);
            } else if (filenameLower.endsWith(".txt") || filenameLower.endsWith(".md")) {
                text = new String(bytes, StandardCharsets.UTF_8);
            } else {
                throw new ApiException(AiResponseCode.UNSUPPORTED_FILE_TYPE);
            }
        } catch (ApiException e) {
            throw e;
        } catch (Exception e) {
            log.error("[FileExtract] Failed to extract stream '{}': {}", fileName, e.getMessage(), e);
            throw new ApiException(AiResponseCode.FILE_EXTRACT_ERROR);
        }

        log.info("[FileExtract] '{}' extracted in {}ms, {} chars",
                fileName, System.currentTimeMillis() - start, text.length());
        return text.strip();
    }

    // ── PDF ──────────────────────────────────────────────────────────────────

    private String extractPdf(byte[] bytes) throws IOException {
        try (PDDocument doc = Loader.loadPDF(bytes)) {
            PDFTextStripper stripper = new PDFTextStripper();
            String raw = stripper.getText(doc);

            if (raw == null || raw.isBlank()) {
                log.warn("[FileExtract] PDF yielded no text — may be image-based.");
                return "";
            }
            return normalizePdfText(raw);
        }
    }

    private String normalizePdfText(String raw) {
        String[] lines = raw.split("\n");
        long nonEmpty = 0;
        long totalLen = 0;
        for (String l : lines) {
            String trimmed = l.strip();
            if (!trimmed.isEmpty()) {
                nonEmpty++;
                totalLen += trimmed.length();
            }
        }
        double avgLineLen = nonEmpty > 0 ? (double) totalLen / nonEmpty : 0;

        if (avgLineLen < 4.0) {
            return raw
                    .replaceAll("(?<!\n)\n(?!\n)", " ")
                    .replaceAll("[ \t]{2,}", " ")
                    .replaceAll("\n{3,}", "\n\n");
        } else {
            return raw
                    .replaceAll("[ \t]+$", "")
                    .replaceAll("\n{3,}", "\n\n");
        }
    }

    // ── DOCX ─────────────────────────────────────────────────────────────────

    private String extractDocx(byte[] bytes) throws IOException {
        try (InputStream is = java.io.ByteArrayInputStream.class.getConstructor(byte[].class).newInstance((Object) bytes);
             XWPFDocument doc = new XWPFDocument(is)) {

            List<String> lines = new ArrayList<>();
            for (XWPFParagraph para : doc.getParagraphs()) {
                String text = para.getText().strip();
                if (text.isEmpty()) continue;

                String styleName = para.getStyle() != null ? para.getStyle() : "";
                if (styleName.startsWith("Heading") || styleName.startsWith("heading")) {
                    String levelStr = styleName.replaceAll("[^0-9]", "");
                    int level = levelStr.isEmpty() ? 1 : Integer.parseInt(levelStr);
                    lines.add("#".repeat(Math.min(level, 6)) + " " + text);
                } else {
                    lines.add(text);
                }
            }

            for (XWPFTable table : doc.getTables()) {
                for (XWPFTableRow row : table.getRows()) {
                    List<String> cells = row.getTableCells().stream()
                            .map(cell -> cell.getText().strip())
                            .filter(s -> !s.isEmpty())
                            .toList();
                    if (!cells.isEmpty()) {
                        lines.add(String.join(" | ", cells));
                    }
                }
            }

            return String.join("\n", lines);
        } catch (Exception e) {
            throw new IOException("Failed to parse DOCX bytes", e);
        }
    }

    // ── Validation ────────────────────────────────────────────────────────────

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ApiException(AiResponseCode.NO_FILE_PROVIDED);
        }

        long maxBytes = (long) llmProperties.maxFileSizeKb() * 1024;
        if (file.getSize() > maxBytes) {
            throw new ApiException(AiResponseCode.FILE_TOO_LARGE);
        }

        String name = file.getOriginalFilename() != null
                ? file.getOriginalFilename().toLowerCase()
                : "";
        if (!name.endsWith(".pdf") && !name.endsWith(".docx")
                && !name.endsWith(".doc") && !name.endsWith(".txt")
                && !name.endsWith(".md")) {
            throw new ApiException(AiResponseCode.UNSUPPORTED_FILE_TYPE);
        }
    }
}
