from django.db import models
from employees.models import Employee


STATUS_CHOICES = [
    ("new", "New"),
    ("in_progress", "In Progress"),
    ("completed", "Completed"),
]


class Task(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    priority = models.IntegerField(default=3)
    due_date = models.DateField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="new")

    assigned_to = models.ManyToManyField(Employee, related_name="tasks")
    progress = models.IntegerField(default=0)  # average progress

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def calculate_average_progress(self):
        progresses = self.progress_records.values_list("progress", flat=True)
        self.progress = sum(progresses) / len(progresses) if progresses else 0
        self.save()

    def __str__(self):
        return self.title


class TaskProgress(models.Model):
    task = models.ForeignKey(Task, related_name="progress_records", on_delete=models.CASCADE)
    employee = models.ForeignKey(Employee, related_name="progress_records", on_delete=models.CASCADE)
    progress = models.IntegerField(default=0)

    class Meta:
        unique_together = ("task", "employee")

    def __str__(self):
        return f"{self.employee.user.username} – {self.task.title}: {self.progress}%"
