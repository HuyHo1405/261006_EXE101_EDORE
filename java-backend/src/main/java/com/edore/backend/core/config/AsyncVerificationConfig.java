package com.edore.backend.core.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;
import java.util.concurrent.ThreadPoolExecutor;

/**
 * Dedicated thread pool for the async fact-check verification pipeline (Phase 2).
 *
 * <p>Kept separate from the default Spring async executor and from HTTP worker threads
 * to prevent slow LLM calls from starving the request pool.</p>
 *
 * <h3>Pool sizing rationale:</h3>
 * <ul>
 *   <li>Core = 2: always-on threads for background verification jobs</li>
 *   <li>Max = 5: burst capacity when multiple scripts are generated simultaneously</li>
 *   <li>Queue = 50: sufficient buffer for batch uploads; drops gracefully beyond that</li>
 * </ul>
 */
@Configuration
@EnableAsync
public class AsyncVerificationConfig {

    public static final String VERIFICATION_EXECUTOR = "verificationExecutor";
    public static final String GENERATION_EXECUTOR   = "generationExecutor";

    @Bean(name = VERIFICATION_EXECUTOR)
    public Executor verificationExecutor() {
        ThreadPoolTaskExecutor exec = new ThreadPoolTaskExecutor();
        exec.setCorePoolSize(2);
        exec.setMaxPoolSize(5);
        exec.setQueueCapacity(50);
        exec.setThreadNamePrefix("verify-");
        exec.setWaitForTasksToCompleteOnShutdown(true);   // graceful shutdown
        exec.setAwaitTerminationSeconds(60);
        exec.initialize();
        return exec;
    }

    /**
     * Dedicated bounded pool for Phase 1 AI generation jobs.
     *
     * <p>Pool sizing rationale:
     * <ul>
     *   <li>Core = 2: matches the LLM semaphore permit count</li>
     *   <li>Max  = 4: short burst headroom</li>
     *   <li>Queue = 20: explicit backpressure — beyond this the caller gets 503 immediately
     *       rather than waiting indefinitely</li>
     * </ul>
     * AbortPolicy is intentional: fail-fast is better than silent queuing that masks overload.
     */
    @Bean(name = GENERATION_EXECUTOR)
    public Executor generationExecutor() {
        ThreadPoolTaskExecutor exec = new ThreadPoolTaskExecutor();
        exec.setCorePoolSize(2);
        exec.setMaxPoolSize(4);
        exec.setQueueCapacity(20);
        exec.setThreadNamePrefix("gen-");
        exec.setRejectedExecutionHandler(new ThreadPoolExecutor.AbortPolicy());
        exec.setWaitForTasksToCompleteOnShutdown(true);
        exec.setAwaitTerminationSeconds(120);
        exec.initialize();
        return exec;
    }
}
