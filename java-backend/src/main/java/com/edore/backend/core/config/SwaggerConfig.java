package com.edore.backend.core.config;

import com.edore.backend.core.security.CurrentUser;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
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
                // Security scheme is registered here, but NOT added as a global requirement.
                // APIs requiring auth will use @SecurityRequirement(name = "Bearer Authentication") individually.
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
}
