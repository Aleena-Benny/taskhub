package com.taskhub.config;

import com.taskhub.domain.Task;
import com.taskhub.domain.TaskStatus;
import com.taskhub.repository.TaskRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner seedTasks(TaskRepository tasks) {
        return args -> {
            if (tasks.count() > 0) {
                return;
            }
            Task t1 = new Task();
            t1.setTitle("Review API design");
            t1.setDescription("Check REST conventions and DTO usage.");
            t1.setStatus(TaskStatus.IN_PROGRESS);
            tasks.save(t1);

            Task t2 = new Task();
            t2.setTitle("Wire React client");
            t2.setDescription("Connect forms to Spring Boot endpoints.");
            t2.setStatus(TaskStatus.TODO);
            tasks.save(t2);

            Task t3 = new Task();
            t3.setTitle("Smoke test H2 console");
            t3.setDescription("Optional: inspect data at /h2-console");
            t3.setStatus(TaskStatus.DONE);
            tasks.save(t3);
        };
    }
}
