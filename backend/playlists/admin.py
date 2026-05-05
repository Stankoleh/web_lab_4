from django.contrib import admin
from .models import Playlist, Song

class SongInline(admin.TabularInline):
    model = Song
    extra = 1

@admin.register(Playlist)
class PlaylistAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner', 'is_public', 'created_at')
    list_filter = ('is_public', 'created_at')
    search_fields = ('name', 'description', 'owner__username')
    inlines = [SongInline]

@admin.register(Song)
class SongAdmin(admin.ModelAdmin):
    list_display = ('title', 'artist', 'playlist', 'duration', 'position')
    search_fields = ('title', 'artist', 'playlist__name')
