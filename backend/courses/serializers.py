
from rest_framework import serializers
from .models import Courses, Lesson


class LessonSerializer(serializers.ModelSerializer):
    thumbnail = serializers.ImageField(required=False, allow_null=True)
    course = serializers.PrimaryKeyRelatedField(queryset=Courses.objects.all())

    class Meta:
        model = Lesson
        fields = ['course', 'title', 'description', 'duration', 'lesson_number', 'thumbnail', 'video_url', 'points']       
class CourseSerializer(serializers.ModelSerializer):
    thumbnail = serializers.ImageField(required=False)
    lessons = LessonSerializer(many=True, read_only=True)

    class Meta:
        model = Courses
        fields = ['name', 'user', 'category', 'price', 'offer_percentage', 'description', 'thumbnail', 'points', 'rating', 'lessons']

