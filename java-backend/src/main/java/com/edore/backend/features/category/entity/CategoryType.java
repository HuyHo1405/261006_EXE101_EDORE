package com.edore.backend.features.category.entity;

/**
 * Classifies a Category by its semantic role in the system.
 *
 * SUBJECT  — môn học (Toán, Lý, Hóa, Sinh, Văn, Anh, ...)
 * GRADE    — khối lớp (Lớp 10, Lớp 11, Lớp 12)
 * PURPOSE  — mục đích sử dụng (Ôn thi, Chuyên đề, ...)
 * OTHER    — tự do, không ràng buộc
 *
 * The `code` field on Category maps to Qdrant payload keys:
 *   SUBJECT → payload key "subject" (e.g. "MATH", "PHYSICS")
 *   GRADE   → payload key "grade"   (e.g. "GRADE_10", "GRADE_11")
 */
public enum CategoryType {
    SUBJECT,
    GRADE,
    PURPOSE,
    OTHER
}
