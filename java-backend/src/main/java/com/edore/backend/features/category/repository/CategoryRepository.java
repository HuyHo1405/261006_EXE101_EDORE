package com.edore.backend.features.category.repository;

import com.edore.backend.features.category.entity.Category;
import com.edore.backend.features.category.entity.CategoryType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    List<Category> findByType(CategoryType type);

    Optional<Category> findByCode(String code);

    boolean existsByCode(String code);
}
