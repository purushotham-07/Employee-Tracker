from rest_framework import serializers
from .models import User
from employees.models import Department, Employee

class UserSerializer(serializers.ModelSerializer):
    department_name = serializers.SerializerMethodField()
    job_title = serializers.CharField(source="employee.job_title", read_only=True)

    class Meta:
        model = User
        fields = ["id", "username", "email", "role", "department_name", "job_title"]

    def get_department_name(self, obj):
        return obj.employee.department.name if hasattr(obj, "employee") and obj.employee.department else None


class RegisterSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(write_only=True)
    department = serializers.CharField(write_only=True)
    job_title = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["username", "email", "password", "password2", "role", "department", "job_title"]
        extra_kwargs = {"password": {"write_only": True}}

    def validate(self, attrs):
        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError("Passwords do not match")
        return attrs

    def create(self, validated_data):
        dept_name = validated_data.pop("department")
        job_title = validated_data.pop("job_title")
        validated_data.pop("password2")

        # create user
        user = User.objects.create_user(**validated_data)

        # get or create department from string
        department, _ = Department.objects.get_or_create(name=dept_name)

        # create employee profile only if role is employee
        if user.role == "employee":
            Employee.objects.create(user=user, department=department, job_title=job_title)

        return user
