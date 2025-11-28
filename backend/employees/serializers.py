from rest_framework import serializers
from .models import Employee, Department
from accounts.serializers import UserSerializer


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ["id", "name"]


class EmployeeSerializer(serializers.ModelSerializer):
    # Nested user details
    user = UserSerializer(read_only=True)

    # Readable department name
    department_name = serializers.CharField(source="department.name", read_only=True)

    # allow writing department ID when creating or updating an employee
    department = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(),
        required=False
    )

    class Meta:
        model = Employee
        fields = [
            "id",
            "user",                  # includes username, email, role
            "department",
            "department_name",
            "job_title",
        ]
        read_only_fields = ["id", "department_name"]
