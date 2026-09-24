package com.edore.backend.core.config;

import com.edore.backend.core.security.CurrentUser;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.Operation;
import io.swagger.v3.oas.models.PathItem;
import io.swagger.v3.oas.models.Paths;
import org.springdoc.core.customizers.OpenApiCustomizer;
import org.springdoc.core.utils.SpringDocUtils;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

@Configuration
public class SwaggerConfig {

    static {
        // Automatically hide security principal annotations from Swagger UI input forms
        SpringDocUtils.getConfig()
                .addAnnotationsToIgnore(CurrentUser.class, AuthenticationPrincipal.class);
    }

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new io.swagger.v3.oas.models.info.Info()
                        .title("Edore Backend API")
                        .version("1.0")
                        .description("API specification with selective Bearer token authentication"))
                .components(new Components()
                        .addSecuritySchemes("Bearer Authentication",
                                new io.swagger.v3.oas.models.security.SecurityScheme()
                                        .type(io.swagger.v3.oas.models.security.SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Enter JWT Bearer token **_only_** (without 'Bearer ' prefix)")
                        )
                );
    }

    @Bean
    public OpenApiCustomizer sortOperationsBySummaryCustomizer() {
        return openApi -> {
            Paths paths = openApi.getPaths();
            if (paths != null) {
                Paths sortedPaths = new Paths();
                paths.entrySet().stream()
                        .sorted((e1, e2) -> compareSummaries(
                                getFirstOperationSummary(e1.getValue()),
                                getFirstOperationSummary(e2.getValue())
                        ))
                        .forEach(entry -> {
                            // Xóa tiền tố số đếm "1. ", "2. "... để hiển thị tiêu đề chữ sạch đẹp trên Swagger UI
                            entry.getValue().readOperations().forEach(op -> {
                                if (op.getSummary() != null) {
                                    op.setSummary(stripNumberPrefix(op.getSummary()));
                                }
                            });
                            sortedPaths.addPathItem(entry.getKey(), entry.getValue());
                        });
                openApi.setPaths(sortedPaths);
            }
        };
    }

    private String stripNumberPrefix(String summary) {
        if (summary == null) return null;
        return summary.replaceFirst("^\\d+(\\.\\d+)*\\.?\\s*", "");
    }

    private String getFirstOperationSummary(PathItem pathItem) {
        if (pathItem == null || pathItem.readOperations() == null || pathItem.readOperations().isEmpty()) {
            return "";
        }
        Operation operation = pathItem.readOperations().get(0);
        return operation.getSummary() != null ? operation.getSummary() : "";
    }

    private int compareSummaries(String s1, String s2) {
        if (s1 == null) s1 = "";
        if (s2 == null) s2 = "";

        String[] parts1 = s1.split("(?<=\\D)(?=\\d)|(?<=\\d)(?=\\D)");
        String[] parts2 = s2.split("(?<=\\D)(?=\\d)|(?<=\\d)(?=\\D)");

        int minLength = Math.min(parts1.length, parts2.length);
        for (int i = 0; i < minLength; i++) {
            String p1 = parts1[i];
            String p2 = parts2[i];

            if (p1.matches("\\d+") && p2.matches("\\d+")) {
                try {
                    int num1 = Integer.parseInt(p1);
                    int num2 = Integer.parseInt(p2);
                    if (num1 != num2) {
                        return Integer.compare(num1, num2);
                    }
                } catch (NumberFormatException ignored) {
                }
            }
            int res = p1.compareToIgnoreCase(p2);
            if (res != 0) {
                return res;
            }
        }
        return Integer.compare(parts1.length, parts2.length);
    }
}

