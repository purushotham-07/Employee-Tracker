from django.db import models
from django.db.models import Count
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Task, TaskProgress
from .serializers import TaskSerializer
from accounts.permissions import IsAdmin
from employees.models import Employee


class TaskListCreateView(generics.ListCreateAPIView):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Task.objects.prefetch_related("assigned_to", "assigned_to__user")
        status_param = self.request.query_params.get("status")
        employee_id = self.request.query_params.get("employee_id")

        if status_param:
            queryset = queryset.filter(status=status_param)
        if employee_id:
            queryset = queryset.filter(assigned_to__id=employee_id)

        return queryset.order_by("-created_at")

    def perform_create(self, serializer):
        assigned_list = self.request.data.get("assigned_to", [])
        task = serializer.save()
        task.assigned_to.set(assigned_list)

        # Avoid duplicate progress objects
        for emp_id in assigned_list:
            emp = Employee.objects.get(id=emp_id)
            TaskProgress.objects.get_or_create(employee=emp, task=task)

        task.calculate_average_progress()

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAdmin()]
        return [permissions.IsAuthenticated()]


class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Task.objects.prefetch_related("assigned_to", "assigned_to__user")
    serializer_class = TaskSerializer

    def get_permissions(self):
        if self.request.method == "DELETE":
            return [IsAdmin()]
        return [permissions.IsAuthenticated()]

    def update(self, request, *args, **kwargs):
        task = self.get_object()
        user = request.user

        # Employee update: can only modify progress
        if user.role == "employee":
            try:
                emp = Employee.objects.get(user=user)
            except Employee.DoesNotExist:
                return Response({"detail": "Employee not found"}, status=400)

            if not task.assigned_to.filter(id=emp.id).exists():
                return Response({"detail": "Unauthorized"}, status=403)

            progress_val = request.data.get("progress")
            if progress_val is not None:
                progress_obj, _ = TaskProgress.objects.get_or_create(task=task, employee=emp)
                progress_obj.progress = int(progress_val)
                progress_obj.save()
                task.calculate_average_progress()
                return Response(TaskSerializer(task).data)

            return Response({"detail": "Only progress can be updated"}, status=400)

        # Admin update: employee assignment & due date
        assigned_list = request.data.get("assigned_to")
        response = super().update(request, *args, **kwargs)

        if assigned_list is not None:
            task.assigned_to.set(assigned_list)

            TaskProgress.objects.filter(task=task).delete()
            for emp_id in assigned_list:
                emp = Employee.objects.get(id=emp_id)
                TaskProgress.objects.get_or_create(employee=emp, task=task)

            task.calculate_average_progress()

        return response


class DashboardSummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        tasks = Task.objects.all()
        total_tasks = tasks.count()

        avg_progress = round(tasks.aggregate(models.Avg("progress"))["progress__avg"] or 0, 2)
        completed_tasks = tasks.filter(progress=100).count()
        pending_tasks = tasks.exclude(progress=100).count()

        status_counts = tasks.values("status").annotate(count=Count("id"))
        tasks_by_status = {item["status"]: item["count"] for item in status_counts}

        tasks_per_employee = (
            Employee.objects.select_related("user")
            .annotate(task_count=Count("tasks"))
            .values("id", "user__username", "task_count")
        )

        return Response({
            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks,
            "pending_tasks": pending_tasks,
            "completion_rate": avg_progress,
            "tasks_by_status": tasks_by_status,
            "tasks_per_employee": list(tasks_per_employee),
        })
