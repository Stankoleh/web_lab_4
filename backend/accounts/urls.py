from django.urls import path
from .views import LoginView, LogoutView, CurrentUserView, UserListCreateView, UserDetailView

urlpatterns = [
    path('login/', LoginView.as_view()),
    path('logout/', LogoutView.as_view()),
    path('me/', CurrentUserView.as_view()),
    path('users/', UserListCreateView.as_view()),
    path('users/<int:pk>/', UserDetailView.as_view()),
]
