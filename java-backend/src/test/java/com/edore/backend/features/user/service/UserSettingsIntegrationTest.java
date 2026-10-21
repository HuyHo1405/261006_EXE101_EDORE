package com.edore.backend.features.user.service;

import com.edore.backend.core.exception.ApiException;
import com.edore.backend.features.auth.entity.User;
import com.edore.backend.features.auth.repository.UserRepository;
import com.edore.backend.features.user.code.UserResponseCode;
import com.edore.backend.features.user.controller.UserController;
import com.edore.backend.features.user.dto.request.UserSettingsUpdateRequest;
import com.edore.backend.features.user.entity.UserSettings;
import com.edore.backend.features.user.repository.UserSettingsRepository;
import jakarta.persistence.EntityManagerFactory;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.*;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.support.JpaRepositoryFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.orm.jpa.*;
import org.springframework.orm.jpa.vendor.HibernateJpaVendorAdapter;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;
import org.springframework.transaction.support.TransactionTemplate;

import javax.sql.DataSource;
import java.util.*;
import java.util.concurrent.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;

@SpringJUnitConfig(UserSettingsIntegrationTest.Config.class)
class UserSettingsIntegrationTest {
    @Autowired UserSettingsService service;
    @Autowired UserRepository users;
    @Autowired UserSettingsRepository settings;
    @Autowired PlatformTransactionManager transactions;
    @Autowired DataSource dataSource;

    private UUID newUser() {
        String unique = UUID.randomUUID().toString();
        return new TransactionTemplate(transactions).execute(status -> users.saveAndFlush(User.builder()
                .username(unique).email(unique + "@example.test").phone(unique).password("test-only").build()).getId());
    }

    @Test void getCreatesDefaultsWithMapsIdAndRepeatedGetPreservesExistingSettings() {
        UUID id = newUser();
        var controller = new UserController(mock(UserService.class), service);
        var first = controller.getUserSettings(id);
        assertEquals(200, first.getStatusCode().value());
        assertEquals(UserResponseCode.GET_PROFILE_SUCCESS.getCode(), first.getBody().getCode());
        var response = first.getBody().getResult();
        assertEquals(id, response.getUserId());
        assertTrue(response.getEnableFactCheckVerification());
        assertEquals("light", response.getTheme());
        assertEquals("vi", response.getLanguage());
        controller.updateUserSettings(id, new UserSettingsUpdateRequest(false, "dark", "en"));
        var existing = controller.getUserSettings(id).getBody().getResult();
        assertFalse(existing.getEnableFactCheckVerification());
        assertEquals("dark", existing.getTheme());
        assertEquals("en", existing.getLanguage());
        assertEquals(1, rowCount(id));
    }

    @Test void firstPatchCreatesLinkedSettingsAndPartialPatchesPreserveUnspecifiedFields() {
        UUID id = newUser();
        var controller = new UserController(mock(UserService.class), service);
        var response = controller.updateUserSettings(id, new UserSettingsUpdateRequest(false, null, "en"));
        assertEquals(200, response.getStatusCode().value());
        assertEquals(UserResponseCode.UPDATE_PROFILE_SUCCESS.getCode(), response.getBody().getCode());
        assertEquals(id, response.getBody().getResult().getUserId());
        assertEquals("light", response.getBody().getResult().getTheme());
        service.update(id, new UserSettingsUpdateRequest(null, "dark", null));
        service.update(id, new UserSettingsUpdateRequest());
        var saved = service.get(id);
        assertFalse(saved.getEnableFactCheckVerification());
        assertEquals("dark", saved.getTheme());
        assertEquals("en", saved.getLanguage());
        assertEquals(1, rowCount(id));
    }

    @Test void missingUserReturnsDomainErrorWithoutCreatingOrphanSettings() {
        UUID id = UUID.randomUUID();
        assertEquals(UserResponseCode.USER_NOT_FOUND, assertThrows(ApiException.class, () -> service.get(id)).getResponseCode());
        assertEquals(UserResponseCode.USER_NOT_FOUND, assertThrows(ApiException.class,
                () -> service.update(id, new UserSettingsUpdateRequest())).getResponseCode());
        assertEquals(0, rowCount(id));
    }

    @Test void concurrentFirstGetAndPatchCreateOneRowWithoutResettingUpdates() throws Exception {
        UUID id = newUser();
        var start = new CountDownLatch(1);
        try (var pool = Executors.newFixedThreadPool(8)) {
            List<Future<?>> calls = new ArrayList<>();
            for (int i = 0; i < 8; i++) {
                boolean update = i % 2 == 0;
                calls.add(pool.submit(() -> {
                    assertTrue(start.await(10, TimeUnit.SECONDS));
                    if (update) service.update(id, new UserSettingsUpdateRequest(false, "dark", "en"));
                    else service.get(id);
                    return null;
                }));
            }
            start.countDown();
            for (Future<?> call : calls) call.get(20, TimeUnit.SECONDS);
        }
        assertEquals(1, rowCount(id));
        var result = service.get(id);
        assertFalse(result.getEnableFactCheckVerification());
        assertEquals("dark", result.getTheme());
        assertEquals("en", result.getLanguage());
    }

    @Test void oldUuidOnlyCreationReproducesHibernateFailureButServiceCreationSucceeds() {
        UUID id = newUser();
        RuntimeException error = assertThrows(RuntimeException.class, () -> new TransactionTemplate(transactions)
                .execute(status -> settings.saveAndFlush(UserSettings.builder().userId(id).build())));
        Throwable root = error;
        while (root.getCause() != null) root = root.getCause();
        assertInstanceOf(org.hibernate.id.IdentifierGenerationException.class, root);
        assertEquals(id, service.get(id).getUserId());
        assertEquals(1, rowCount(id));
    }

    @Test void settingsHttpEndpointsCreateReadAndPatchPersistedValues() throws Exception {
        var currentId = new java.util.concurrent.atomic.AtomicReference<>(newUser());
        var currentUser = new org.springframework.web.method.support.HandlerMethodArgumentResolver() {
            @Override public boolean supportsParameter(org.springframework.core.MethodParameter parameter) {
                return parameter.hasParameterAnnotation(com.edore.backend.core.security.CurrentUser.class);
            }
            @Override public Object resolveArgument(org.springframework.core.MethodParameter parameter,
                    org.springframework.web.method.support.ModelAndViewContainer container,
                    org.springframework.web.context.request.NativeWebRequest request,
                    org.springframework.web.bind.support.WebDataBinderFactory binder) { return currentId.get(); }
        };
        var http = org.springframework.test.web.servlet.setup.MockMvcBuilders
                .standaloneSetup(new UserController(mock(UserService.class), service))
                .setCustomArgumentResolvers(currentUser).build();
        http.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get("/api/v1/users/me/settings"))
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.status().isOk())
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath("$.result.userId").value(currentId.get().toString()))
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath("$.result.theme").value("light"));
        // First request for this second user is PATCH, without a preceding GET.
        currentId.set(newUser());
        http.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch("/api/v1/users/me/settings")
                        .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                        .content("{\"enableFactCheckVerification\":false,\"theme\":\"dark\"}"))
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.status().isOk())
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath("$.result.enableFactCheckVerification").value(false));
        http.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get("/api/v1/users/me/settings"))
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.status().isOk())
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath("$.result.theme").value("dark"))
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath("$.result.language").value("vi"));
        assertEquals(1, rowCount(currentId.get()));
    }

    private int rowCount(UUID id) {
        return new JdbcTemplate(dataSource).queryForObject("select count(*) from user_settings where user_id = ?", Integer.class, id);
    }

    @Configuration
    @EnableTransactionManagement
    @EnableJpaAuditing
    static class Config {
        @Bean DataSource dataSource() {
            return new DriverManagerDataSource("jdbc:h2:mem:user-settings-tests;MODE=PostgreSQL;DB_CLOSE_DELAY=-1;LOCK_TIMEOUT=10000", "sa", "");
        }
        @Bean LocalContainerEntityManagerFactoryBean entityManagerFactory(DataSource dataSource) {
            var factory = new LocalContainerEntityManagerFactoryBean();
            factory.setDataSource(dataSource);
            factory.setPackagesToScan("com.edore.backend.features.auth.entity", "com.edore.backend.features.user.entity");
            factory.setJpaVendorAdapter(new HibernateJpaVendorAdapter());
            factory.setJpaPropertyMap(Map.of("hibernate.hbm2ddl.auto", "create-drop"));
            return factory;
        }
        @Bean PlatformTransactionManager transactionManager(EntityManagerFactory factory) { return new JpaTransactionManager(factory); }
        @Bean UserRepository users(EntityManagerFactory factory) {
            return new JpaRepositoryFactory(SharedEntityManagerCreator.createSharedEntityManager(factory)).getRepository(UserRepository.class);
        }
        @Bean UserSettingsRepository settings(EntityManagerFactory factory) {
            return new JpaRepositoryFactory(SharedEntityManagerCreator.createSharedEntityManager(factory)).getRepository(UserSettingsRepository.class);
        }
        @Bean UserSettingsService service(UserRepository users, UserSettingsRepository settings) {
            return new UserSettingsService(users, settings);
        }
    }
}
