from django.urls import path
from .views import (
    HealthCheckView,
    TicketListCreateAPIView,
    TicketRetrieveUpdateDestroyAPIView,
    CategoryListCreateAPIView,
    CategoryRetrieveUpdateDestroyAPIView,
)

urlpatterns = [
    path("health/", HealthCheckView.as_view(), name="health-check"),
    path("tickets/", TicketListCreateAPIView.as_view(), name="ticket-list-create"),
    path("tickets/<int:pk>/", TicketRetrieveUpdateDestroyAPIView.as_view(), name="ticket-detail"),
    path("categories/", CategoryListCreateAPIView.as_view(), name="category-list-create"),
    path("categories/<int:pk>/", CategoryRetrieveUpdateDestroyAPIView.as_view(), name="category-detail"),
]
