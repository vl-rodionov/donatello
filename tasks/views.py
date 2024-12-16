from django.shortcuts import render
from django.http import JsonResponse
from django.http import HttpResponse
from django.template import loader
from django.views.decorators.csrf import csrf_exempt
from django.utils.dateparse import parse_date
import json
from .models import Task, AssignedUser

def hello(request):
  template = loader.get_template('index.html')
  return HttpResponse(template.render())

@csrf_exempt  
def add_task(request):
    if request.method == 'POST':
        try:
            # Парсим JSON-данные из запроса
            data = json.loads(request.body)
            
            # Сохраняем данные пользователя
            user_data = data.get('assigned_user', {})
            user, _ = AssignedUser.objects.get_or_create(
                gender=user_data.get('gender'),
                first_name=user_data.get('name', {}).get('first'),
                last_name=user_data.get('name', {}).get('last'),
                picture_large=user_data.get('picture', {}).get('large'),
                picture_medium=user_data.get('picture', {}).get('medium'),
                picture_thumbnail=user_data.get('picture', {}).get('thumbnail'),
            )

            # Сохраняем задачу
            task = Task.objects.create(
                title=data.get('title'),
                created_at=parse_date(data.get('created_at')),
                expired_at=parse_date(data.get('expired_at')),
                description=data.get('description'),
                tags=data.get('tags'),
                assigned_user=user,
                board=data.get('board'),
            )

            return JsonResponse({'message': 'Task created successfully!', 'task_id': task.id}, status=201)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    return JsonResponse({'error': 'Invalid request method'}, status=405)


def get_tasks(request):
    tasks = Task.objects.all()

    task_list = []
    for task in tasks:
        task_list.append({
            "title": task.title,
            "created_at": task.created_at.strftime('%Y-%m-%d'),
            "expired_at": task.expired_at.strftime('%Y-%m-%d'),
            "description": task.description,
            "tags": task.tags,
            "assigned_user": {
                "gender": task.assigned_user.gender,
                "name": {
                    "title": "Mr" if task.assigned_user.gender == "male" else "Ms",
                    "first": task.assigned_user.first_name,
                    "last": task.assigned_user.last_name,
                },
                "picture": {
                    "large": task.assigned_user.picture_large,
                    "medium": task.assigned_user.picture_medium,
                    "thumbnail": task.assigned_user.picture_thumbnail,
                }
            },
            "board": task.board,
        })

    return JsonResponse(task_list, safe=False)


@csrf_exempt
def delete_task(request):
    if request.method == 'DELETE':
        try:
            # Разбор тела запроса
            import json
            body = json.loads(request.body)

            # Извлечение данных задачи
            title = body.get('title')
            description = body.get('description')
            board = body.get('board')

            if not (title and description and board):
                return JsonResponse({'success': False, 'message': 'Invalid task data'}, status=400)

            # Поиск задачи по всем переданным параметрам
            task = Task.objects.get(title=title, description=description, board=board)

            # Удаление задачи
            task.delete()
            return JsonResponse({'success': True, 'message': 'Task deleted successfully'})

        except Task.DoesNotExist:
            return JsonResponse({'success': False, 'message': 'Task not found'}, status=404)
    return JsonResponse({'success': False, 'message': 'Invalid request method'}, status=405)
