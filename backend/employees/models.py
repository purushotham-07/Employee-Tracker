from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL  # safer reference to custom user model


class Department(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name


class Employee(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="employee_profile"   # IMPORTANT for serializer
    )
    department = models.ForeignKey(
        Department,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="employees"
    )
    job_title = models.CharField(max_length=120, blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.job_title or 'No Title'}"
