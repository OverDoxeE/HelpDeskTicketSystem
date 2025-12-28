from django.urls import path
from .views import (
    HealthCheckView,
    TicketListCreateAPIView,
    TicketRetrieveUpdateDestroyAPIView,
    CategoryListCreateAPIView,
    CategoryRetrieveUpdateDestroyAPIView,
    CommentListCreateAPIView,
    CommentRetrieveUpdateDestroyAPIView,
    TicketChangeStatusAPIView,
    TicketStatsAPIView,
)
from .auth_views import LoginView, MeView, LogoutView


urlpatterns = [
    # health
    path("health/", HealthCheckView.as_view(), name="health-check"),

    # auth
    path("auth/login/", LoginView.as_view(), name="api-login"),
    path("auth/me/", MeView.as_view(), name="api-me"),
    path("auth/logout/", LogoutView.as_view(), name="api-logout"),

    # tickets
    path("tickets/", TicketListCreateAPIView.as_view(), name="ticket-list-create"),
    path("tickets/<int:pk>/", TicketRetrieveUpdateDestroyAPIView.as_view(), name="ticket-detail"),
    path("tickets/<int:pk>/status/", TicketChangeStatusAPIView.as_view(), name="ticket-change-status"),
    path("tickets/stats/", TicketStatsAPIView.as_view(), name="ticket-stats"),

    # categories
    path("categories/", CategoryListCreateAPIView.as_view(), name="category-list-create"),
    path("categories/<int:pk>/", CategoryRetrieveUpdateDestroyAPIView.as_view(), name="category-detail"),

    # comments
    path("tickets/<int:ticket_id>/comments/", CommentListCreateAPIView.as_view(), name="comment-list-create"),
    path("comments/<int:pk>/", CommentRetrieveUpdateDestroyAPIView.as_view(), name="comment-detail"),
]
