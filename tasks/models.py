from django.db import models
import json

class AssignedUser(models.Model):
    gender = models.CharField(max_length=10)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    picture_large = models.URLField()
    picture_medium = models.URLField()
    picture_thumbnail = models.URLField()

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

class Task(models.Model):
    title = models.CharField(max_length=100)
    created_at = models.DateField()
    expired_at = models.DateField()
    description = models.TextField()
    tags = models.JSONField()  # To store an array of colors in JSON format
    assigned_user = models.ForeignKey(AssignedUser, on_delete=models.CASCADE)
    board = models.CharField(max_length=100)

    def __str__(self):
        return self.title
