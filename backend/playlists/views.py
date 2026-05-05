from django.db.models import Count
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Playlist, Song
from .serializers import PlaylistSerializer, SongSerializer


class PlaylistViewSet(viewsets.ModelViewSet):
    serializer_class = PlaylistSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Playlist.objects.select_related('owner').prefetch_related('songs').annotate(songs_count=Count('songs')).order_by('-id')
        search = self.request.query_params.get('search')
        visibility = self.request.query_params.get('visibility')
        owner = self.request.query_params.get('owner')
        if search:
            qs = qs.filter(name__icontains=search)
        if visibility == 'public':
            qs = qs.filter(is_public=True)
        if visibility == 'private':
            qs = qs.filter(is_public=False)
        if owner:
            qs = qs.filter(owner__username__icontains=owner)
        return qs

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=True, methods=['post'], url_path='songs')
    def add_song(self, request, pk=None):
        playlist = self.get_object()
        serializer = SongSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        if not serializer.validated_data.get('position'):
            serializer.validated_data['position'] = playlist.songs.count() + 1
        serializer.save(playlist=playlist)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['delete'], url_path='songs/(?P<song_id>[^/.]+)')
    def delete_song(self, request, pk=None, song_id=None):
        playlist = self.get_object()
        try:
            song = playlist.songs.get(id=song_id)
        except Song.DoesNotExist:
            return Response({'detail': 'Song not found'}, status=status.HTTP_404_NOT_FOUND)
        song.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
