package com.edore.backend.features.vector.init;

import com.edore.backend.features.vector.config.VectorMatchProperties;
import com.edore.backend.features.vector.service.VectorBatchImportService;
import com.edore.backend.features.vector.service.VectorMatchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.File;
import java.util.Map;

/**
 * Boot seeder for initializing reference vector collections when Qdrant is available.
 * Placed in com.edore.backend.features.vector.init per Package-by-Feature architecture.
 */
@Slf4j
@Component
@Order(15)
@RequiredArgsConstructor
public class ReferenceCollectionSeeder implements CommandLineRunner {

    private final VectorMatchService       vectorMatchService;
    private final VectorBatchImportService vectorBatchImportService;
    private final VectorMatchProperties    vectorMatchProperties;

    @Override
    public void run(String... args) throws Exception {
        if (!vectorMatchService.isAvailable()) {
            log.info("[VectorSeeder] Qdrant is disabled or offline — skipping reference collection seeder.");
            return;
        }

        String collection = vectorMatchProperties.collectionCurriculum();
        long existingPoints = vectorMatchService.countPoints(collection);
        if (existingPoints > 0) {
            log.info("[VectorSeeder] Qdrant collection '{}' already contains {} points — skipping auto-indexing.", collection, existingPoints);
            return;
        }

        log.info("[VectorSeeder] Initializing sample curriculum reference dataset in Qdrant...");

        vectorMatchService.indexDocument(
                "ref-math-10",
                "Chương trình giáo dục phổ thông môn Toán lớp 10. Mệnh đề, tập hợp, hàm số bậc hai, phương trình và bất phương trình.",
                Map.of("subject", "MATH", "grade", "GRADE_10"),
                collection
        );

        // Auto-index PDF files from data/ directory if present
        File dataDir = new File("data");
        if (!dataDir.exists()) {
            dataDir = new File("../data");
        }

        if (dataDir.exists() && dataDir.isDirectory()) {
            log.info("[VectorSeeder] Auto-indexing curriculum PDF files from '{}' into Qdrant...", dataDir.getAbsolutePath());
            Map<String, Object> importResult = vectorBatchImportService.indexDirectory(
                    dataDir.getAbsolutePath(),
                    "HISTORY",
                    "GRADE_6",
                    collection
            );
            log.info("[VectorSeeder] Batch PDF import completed: {}/{} files processed, {} total chunks indexed.",
                    importResult.get("filesProcessed"), importResult.get("totalFiles"), importResult.get("totalChunksIndexed"));
        }

        log.info("[VectorSeeder] ReferenceCollectionSeeder finished successfully.");
    }
}
