from django.urls import path
from .views import TaskListCreateView, TaskDetailView, DashboardSummaryView

urlpatterns = [
    path('', TaskListCreateView.as_view(), name='task-list-create'),
    path('<int:pk>/', TaskDetailView.as_view(), name='task-detail'),
    path('dashboard/summary/', DashboardSummaryView.as_view(), name='dashboard-summary'),
]
