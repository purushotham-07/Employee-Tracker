from django.contrib import admin
from .models import Task

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ("title", "priority", "status", "due_date")
    list_filter = ("status", "priority")
    search_fields = ("title",)
    
    def get_assigned_users(self, obj):
        return ", ".join([emp.user.username for emp in obj.assigned_to.all()])
    get_assigned_users.short_description = "Assigned Employees"
