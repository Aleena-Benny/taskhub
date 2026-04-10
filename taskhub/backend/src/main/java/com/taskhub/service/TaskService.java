package com.taskhub.service;

import com.taskhub.domain.Task;
import com.taskhub.domain.TaskStatus;
import com.taskhub.repository.TaskRepository;
import com.taskhub.web.dto.TaskRequest;
import com.taskhub.web.dto.TaskResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TaskService {

    private final TaskRepository taskRepository;

    public TaskService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> listAll() {
        return taskRepository.findAll().stream()
                .sorted((a, b) -> b.getUpdatedAt().compareTo(a.getUpdatedAt()))
                .map(TaskResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> listByStatus(TaskStatus status) {
        return taskRepository.findByStatusOrderByUpdatedAtDesc(status).stream()
                .map(TaskResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public TaskResponse getById(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found: " + id));
        return TaskResponse.from(task);
    }

    @Transactional
    public TaskResponse create(TaskRequest request) {
        Task task = new Task();
        applyRequest(task, request);
        Task saved = taskRepository.save(task);
        return TaskResponse.from(saved);
    }

    @Transactional
    public TaskResponse update(Long id, TaskRequest request) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found: " + id));
        applyRequest(task, request);
        return TaskResponse.from(task);
    }

    @Transactional
    public void delete(Long id) {
        if (!taskRepository.existsById(id)) {
            throw new ResourceNotFoundException("Task not found: " + id);
        }
        taskRepository.deleteById(id);
    }

    private static void applyRequest(Task task, TaskRequest request) {
        task.setTitle(request.title().trim());
        task.setDescription(request.description() != null ? request.description().trim() : null);
        task.setStatus(request.status());
    }
}
