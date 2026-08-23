package com.edore.backend.core.mail;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * TEMPORARY DEBUG FILE — delete after diagnosing mail auth issue.
 * Drop this into: src/main/java/com/edore/backend/core/mail/MailDebugConfig.java
 * It will print the resolved mail config on every app startup.
 */
@Slf4j
@Component
public class MailDebugConfig {

    @Value("${spring.mail.host}")
    private String mailHost;

    @Value("${spring.mail.port}")
    private String mailPort;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @Value("${spring.mail.password:}")
    private String mailPassword;

    @PostConstruct
    public void debugMailConfig() {
        log.info("=== MAIL DEBUG START ===");
        log.info("MAIL_HOST resolved to: [{}]", mailHost);
        log.info("MAIL_PORT resolved to: [{}]", mailPort);
        log.info("MAIL_USERNAME resolved to: [{}]", mailUsername.isEmpty() ? "EMPTY" : mailUsername);
        log.info("MAIL_PASSWORD length: [{}]", mailPassword.isEmpty() ? "EMPTY (0 chars)" : mailPassword.length() + " chars");
        log.info("=== MAIL DEBUG END ===");
    }
}