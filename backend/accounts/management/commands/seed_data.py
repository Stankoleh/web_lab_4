from django.contrib.auth.models import User
from django.core.management.base import BaseCommand
from rest_framework.authtoken.models import Token

from playlists.models import Playlist, Song


class Command(BaseCommand):
    help = 'Create demo users, playlists and songs'

    def handle(self, *args, **kwargs):
        admin, _ = User.objects.get_or_create(username='admin', defaults={'is_staff': True, 'is_superuser': True})
        admin.set_password('admin')
        admin.is_staff = True
        admin.is_superuser = True
        admin.save()

        anna, _ = User.objects.get_or_create(username='anna')
        anna.set_password('anna')
        anna.save()

        for user in (admin, anna):
            Token.objects.get_or_create(user=user)

        study, _ = Playlist.objects.get_or_create(
            name='Study playlist', owner=admin,
            defaults={'description': 'Music for studying and coding', 'cover_url': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f', 'is_public': True}
        )
        gym, _ = Playlist.objects.get_or_create(
            name='Gym energy', owner=anna,
            defaults={'description': 'Fast tracks for training', 'cover_url': 'https://images.unsplash.com/photo-1511379938547-c1f69419868d', 'is_public': False}
        )

        demo_songs = [
            (study, 'Midnight Focus', 'LoFi Room', '03:12', 1),
            (study, 'Clean Code Mood', 'Soft Beats', '02:58', 2),
            (gym, 'Power Run', 'Neon Pulse', '03:40', 1),
            (gym, 'Last Set', 'Iron Wave', '04:05', 2),
        ]
        for playlist, title, artist, duration, position in demo_songs:
            Song.objects.get_or_create(playlist=playlist, title=title, defaults={'artist': artist, 'duration': duration, 'position': position})

        self.stdout.write(self.style.SUCCESS('Demo data created. Login: admin / admin'))
