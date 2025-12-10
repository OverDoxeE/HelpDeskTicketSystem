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

urlpatterns = [
    path("health/", HealthCheckView.as_view(), name="health-check"),
    path("tickets/", TicketListCreateAPIView.as_view(), name="ticket-list-create"),
    path("tickets/<int:pk>/", TicketRetrieveUpdateDestroyAPIView.as_view(), name="ticket-detail"),
    path("categories/", CategoryListCreateAPIView.as_view(), name="category-list-create"),
    path("categories/<int:pk>/", CategoryRetrieveUpdateDestroyAPIView.as_view(), name="category-detail"),
    path("tickets/<int:ticket_id>/comments/", CommentListCreateAPIView.as_view(), name="comment-list-create"),
    path("comments/<int:pk>/", CommentRetrieveUpdateDestroyAPIView.as_view(), name="comment-detail"),
    path("tickets/<int:pk>/status/", TicketChangeStatusAPIView.as_view(), name="ticket-change-status"),
    path("tickets/stats/", TicketStatsAPIView.as_view(), name="ticket-stats"),
]
