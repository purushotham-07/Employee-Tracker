from django.contrib import admin
from .models import Employee

@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "department", "job_title")
    search_fields = ("user__username", "department__name", "job_title")
