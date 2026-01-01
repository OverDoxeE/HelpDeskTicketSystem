from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import generics, permissions, status
from django.shortcuts import get_object_or_404
from .permissions import is_support_or_admin, is_admin_user, IsTicketOwnerOrSupportOrAdmin, CanManageComment
from .models import Ticket, Category, Comment
from .serializers import TicketSerializer, CategorySerializer, CommentSerializer, UserBriefSerializer
from django.contrib.auth import get_user_model
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied

# Technician = user in TECHNICIAN or ADMIN group, or is_staff/superuser
class TechnicianListAPIView(generics.ListAPIView):
    serializer_class = UserBriefSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not is_support_or_admin(user):
            raise PermissionDenied("Only support or admin can view technicians list.")
        User = get_user_model()
        # Technicians: users in TECHNICIAN or ADMIN group, or is_staff/superuser
        return User.objects.filter(
            Q(groups__name__in=["TECHNICIAN", "ADMIN"]) | Q(is_staff=True) | Q(is_superuser=True)
        ).distinct().order_by("username")
from .services import ChangeTicketStatusCommand
from .filters import TicketFilter
from django.db.models import Count, Q
from django.utils import timezone

class HealthCheckView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({"status": "ok"})

class TicketListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = TicketSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        base_qs = (
            Ticket.objects
            .select_related("created_by", "assigned_to", "category")
            .order_by("-created_at")
        )
        filters = TicketFilter(self.request.query_params, self.request.user)
        queryset = filters.apply(base_qs)
        user = self.request.user
        if is_support_or_admin(user):
            return queryset
        return queryset.filter(created_by=user)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class TicketRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Ticket.objects.select_related("created_by", "assigned_to", "category").all()
    serializer_class = TicketSerializer
    permission_classes = [permissions.IsAuthenticated, IsTicketOwnerOrSupportOrAdmin]

class CategoryListCreateAPIView(generics.ListCreateAPIView):
    queryset = Category.objects.all().order_by("name")
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

class CategoryRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

class CommentListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        ticket_id = self.kwargs.get("ticket_id")
        ticket = get_object_or_404(Ticket, pk=ticket_id)

        qs = Comment.objects.filter(ticket=ticket).select_related("ticket", "author").order_by("-created_at")

        user = self.request.user
        if is_support_or_admin(user):
            return qs
        return qs.filter(visibility=Comment.VISIBILITY_PUBLIC)

    def perform_create(self, serializer):
        ticket_id = self.kwargs.get("ticket_id")
        ticket = get_object_or_404(Ticket, pk=ticket_id)

        user = self.request.user
        visibility = serializer.validated_data.get("visibility", Comment.VISIBILITY_PUBLIC)

        if not is_support_or_admin(user):
            visibility = Comment.VISIBILITY_PUBLIC

        serializer.save(
            author=user,
            ticket=ticket,
            visibility=visibility,
        )

class CommentRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Comment.objects.select_related("ticket", "author").all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated, CanManageComment]

class TicketChangeStatusAPIView(generics.UpdateAPIView):
    queryset = Ticket.objects.all()
    serializer_class = TicketSerializer
    permission_classes = [permissions.IsAuthenticated, IsTicketOwnerOrSupportOrAdmin]

    def patch(self, request, pk):
        ticket = get_object_or_404(Ticket, pk=pk)
        new_status = request.data.get("status")

        if not new_status:
            return Response({"error": "Missing status"}, status=status.HTTP_400_BAD_REQUEST)

        command = ChangeTicketStatusCommand(
            ticket=ticket,
            new_status=new_status,
            performed_by=request.user,
        )

        updated_ticket = command.execute()
        serializer = TicketSerializer(updated_ticket)
        return Response(serializer.data, status=status.HTTP_200_OK)

class TicketStatsAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        if not is_support_or_admin(user):
            return Response(
                {"detail": "You do not have permission to view stats."},
                status=status.HTTP_403_FORBIDDEN,
            )

        now = timezone.now()
        qs = Ticket.objects.all()
        total = qs.count()
        by_status = qs.values("status").annotate(count=Count("id")).order_by("status")
        by_priority = qs.values("priority").annotate(count=Count("id")).order_by("priority")

        open_tickets = qs.filter(status="OPEN").count()
        in_progress_tickets = qs.filter(status="IN_PROGRESS").count()
        resolved_tickets = qs.filter(status="RESOLVED").count()
        closed_tickets = qs.filter(status="CLOSED").count()

        overdue_tickets = qs.filter(
            due_date__isnull=False,
            due_date__lt=now.date(),
        ).exclude(status__in=["RESOLVED", "CLOSED"]).count()

        data = {
            "total": total,
            "by_status": list(by_status),
            "by_priority": list(by_priority),
            "counters": {
                "open": open_tickets,
                "in_progress": in_progress_tickets,
                "resolved": resolved_tickets,
                "closed": closed_tickets,
                "overdue": overdue_tickets,
            },
        }

        return Response(data, status=status.HTTP_200_OK)
