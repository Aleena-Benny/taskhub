package com.taskhub.repository;

import com.taskhub.domain.Task;
import com.taskhub.domain.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByStatusOrderByUpdatedAtDesc(TaskStatus status);
}
