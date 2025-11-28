from rest_framework import serializers
from .models import Task, TaskProgress
from employees.models import Employee


class TaskSerializer(serializers.ModelSerializer):
    assigned_to_usernames = serializers.SerializerMethodField()
    assigned_to_ids = serializers.SerializerMethodField()

    # Accept employee IDs from frontend
    assigned_to = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Employee.objects.all()
    )

    class Meta:
        model = Task
        fields = [
            "id",
            "title",
            "description",
            "status",
            "priority",
            "due_date",
            "assigned_to",
            "assigned_to_ids",
            "assigned_to_usernames",
            "progress",
            "created_at",
            "updated_at",
        ]

    def get_assigned_to_usernames(self, obj):
        return [emp.user.username for emp in obj.assigned_to.all()]

    def get_assigned_to_ids(self, obj):
        return [emp.id for emp in obj.assigned_to.all()]

    def create(self, validated_data):
        employees = validated_data.pop("assigned_to", [])
        task = Task.objects.create(**validated_data)
        task.assigned_to.set(employees)

        # Create progress records for each employee
        for emp in employees:
            TaskProgress.objects.create(task=task, employee=emp)

        task.calculate_average_progress()
        return task

    def update(self, instance, validated_data):
        employees = validated_data.pop("assigned_to", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()

        if employees is not None:
            instance.assigned_to.set(employees)
            TaskProgress.objects.filter(task=instance).delete()

            for emp in employees:
                TaskProgress.objects.get_or_create(task=instance, employee=emp)

            instance.calculate_average_progress()

        return instance
