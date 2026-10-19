package com.edore.backend.features.lesson.service;

import com.edore.backend.core.exception.ApiException;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.Test;
import java.io.ByteArrayInputStream;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;

class KahootExportServiceTest {
    @Test void preservesOfficialHeadersAndExportsUnicodeAndCorrectAnswerWithoutExampleRows() throws Exception {
        var q = new KahootExportService.Question("Lịch sử là gì?", List.of("Quá khứ", "Tương lai", "", ""), 1, 20);
        byte[] bytes = new KahootExportService().export(List.of(q));
        try (var workbook = new XSSFWorkbook(new ByteArrayInputStream(bytes))) {
            var sheet = workbook.getSheetAt(0);
            assertEquals("Question - 120 max length", sheet.getRow(7).getCell(1).getStringCellValue());
            assertEquals("Lịch sử là gì?", sheet.getRow(8).getCell(1).getStringCellValue());
            assertEquals("Quá khứ", sheet.getRow(8).getCell(2).getStringCellValue());
            assertEquals(20, sheet.getRow(8).getCell(6).getNumericCellValue());
            assertEquals("1", sheet.getRow(8).getCell(7).getStringCellValue());
            assertEquals(8, sheet.getLastRowNum());
        }
    }

    @Test void rejectsMissingCorrectOptionAndUnsupportedTime() {
        var exporter = new KahootExportService();
        assertThrows(ApiException.class, () -> exporter.export(List.of(
                new KahootExportService.Question("Question", List.of("A", "B", ""), 3, 20))));
        assertThrows(ApiException.class, () -> exporter.export(List.of(
                new KahootExportService.Question("Question", List.of("A", "B"), 1, 45))));
    }
}
