from django.contrib import admin
from .models import Task, AssignedUser

@admin.register(AssignedUser)
class AssignedUserAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name', 'gender')  # Поля, отображаемые в списке
    search_fields = ('first_name', 'last_name')  # Поля для поиска
    list_filter = ('gender',)  # Фильтры

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'created_at', 'expired_at', 'board')  # Поля для отображения
    search_fields = ('title', 'description')  # Поля для поиска
    list_filter = ('board',)  # Фильтры
    date_hierarchy = 'created_at'  # Иерархия по дате
