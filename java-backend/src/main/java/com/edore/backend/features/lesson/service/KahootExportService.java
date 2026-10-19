package com.edore.backend.features.lesson.service;

import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import jakarta.validation.constraints.*;
import java.io.*;
import java.util.*;
import com.edore.backend.core.exception.ApiException;
import com.edore.backend.core.response.CommonResponseCode;

@Service
public class KahootExportService {
    public record Question(@NotBlank @Size(max = 120) String question,
                           @NotNull @Size(min = 2, max = 4) List<@NotNull @Size(max = 75) String> options,
                           @NotNull @Min(1) @Max(4) Integer correct_answer,
                           @NotNull Integer time_limit) {}

    public byte[] export(List<Question> questions) throws IOException {
        try (var input = new ClassPathResource("export/kahoot-template.xlsx").getInputStream();
             var workbook = new XSSFWorkbook(input);
             var output = new ByteArrayOutputStream()) {
            var sheet = workbook.getSheetAt(0);
            // Remove example and numbered placeholder rows, keeping official headers/layout.
            for (int i = sheet.getLastRowNum(); i >= 8; i--) {
                var row = sheet.getRow(i);
                if (row != null) sheet.removeRow(row);
            }
            for (int i = 0; i < questions.size(); i++) {
                Question q = questions.get(i);
                if (q.options().get(0).isBlank() || q.options().get(1).isBlank()
                        || q.correct_answer() > q.options().size()
                        || q.options().get(q.correct_answer() - 1).isBlank()
                        || !Set.of(5, 10, 20, 30, 60, 120).contains(q.time_limit())) {
                    throw new ApiException(CommonResponseCode.VALIDATION_FAILED, "Câu " + (i + 1) + ": kiểm tra lựa chọn, đáp án đúng và thời gian.");
                }
                var row = sheet.createRow(i + 8);
                row.createCell(0).setCellValue(i + 1);
                row.createCell(1).setCellValue(q.question());
                for (int j = 0; j < 4; j++) row.createCell(j + 2).setCellValue(j < q.options().size() ? q.options().get(j) : "");
                row.createCell(6).setCellValue(q.time_limit());
                row.createCell(7).setCellValue(q.correct_answer().toString());
                row.setHeightInPoints(60);
            }
            workbook.write(output);
            return output.toByteArray();
        }
    }
}
