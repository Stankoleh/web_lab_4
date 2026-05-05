from rest_framework import serializers
from .models import Playlist, Song


class SongSerializer(serializers.ModelSerializer):
    class Meta:
        model = Song
        fields = ['id', 'title', 'artist', 'duration', 'url', 'position', 'created_at']
        read_only_fields = ['id', 'created_at']


class PlaylistSerializer(serializers.ModelSerializer):
    owner_username = serializers.CharField(source='owner.username', read_only=True)
    isPublic = serializers.BooleanField(source='is_public', required=False)
    coverUrl = serializers.URLField(source='cover_url', required=False, allow_blank=True)
    songs = SongSerializer(many=True, read_only=True)
    songs_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Playlist
        fields = [
            'id', 'name', 'description', 'coverUrl', 'isPublic',
            'owner', 'owner_username', 'songs_count', 'songs', 'created_at'
        ]
        read_only_fields = ['owner', 'owner_username', 'songs_count', 'songs', 'created_at']
