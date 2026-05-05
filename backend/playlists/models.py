from django.conf import settings
from django.db import models


class Playlist(models.Model):
    name = models.CharField(max_length=120)
    description = models.TextField(blank=True)
    cover_url = models.URLField(blank=True)
    is_public = models.BooleanField(default=True)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='playlists')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Song(models.Model):
    playlist = models.ForeignKey(Playlist, on_delete=models.CASCADE, related_name='songs')
    title = models.CharField(max_length=160)
    artist = models.CharField(max_length=120, blank=True)
    duration = models.CharField(max_length=20, blank=True, help_text='Наприклад: 03:45')
    url = models.URLField(blank=True)
    position = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['position', 'id']

    def __str__(self):
        return f'{self.artist} - {self.title}' if self.artist else self.title
