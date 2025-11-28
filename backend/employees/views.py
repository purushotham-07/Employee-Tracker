from rest_framework import generics, permissions
from .models import Employee, Department
from .serializers import EmployeeSerializer, DepartmentSerializer
from accounts.permissions import IsAdmin


class EmployeeListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/employees/
    POST /api/employees/
    - All authenticated users can VIEW employees
    - Only ADMIN can CREATE employee entries
    """
    queryset = Employee.objects.select_related("user", "department").all()
    serializer_class = EmployeeSerializer

    def get_permissions(self):
        if self.request.method == "GET":
            return [permissions.IsAuthenticated()]   # Employees & Admin can view
        return [IsAdmin()]  # Only Admin can create employees


class EmployeeDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET /api/employees/<id>/
    PUT/PATCH/DELETE /api/employees/<id>/
    - Only Admin can update or delete
    - Employees can GET their own profile if needed (future extension)
    """
    queryset = Employee.objects.select_related("user", "department").all()
    serializer_class = EmployeeSerializer
    permission_classes = [IsAdmin]


class DepartmentListCreateView(generics.ListCreateAPIView):
    """
    GET /api/employees/departments/
    POST /api/employees/departments/
    - View allowed for all authenticated
    - Add allowed for ADMIN only
    """
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer

    def get_permissions(self):
        if self.request.method == "GET":
            return [permissions.IsAuthenticated()]
        return [IsAdmin()]
class EmployeeListCreateView(generics.ListCreateAPIView):
    queryset = Employee.objects.select_related('user', 'department').all()
    serializer_class = EmployeeSerializer
    permission_classes = [permissions.IsAuthenticated]
