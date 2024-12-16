from django.urls import path
from . import views

urlpatterns = [
    path('', views.hello, name='hello'),
    path('api/addTask/', views.add_task, name='add_task'),
	path('api/getTasks/', views.get_tasks, name='get_tasks'),
	path('api/delete-task/', views.delete_task, name='delete-task'),
]

