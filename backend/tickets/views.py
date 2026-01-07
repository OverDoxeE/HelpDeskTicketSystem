from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.db.models import Count, Q
from django.utils import timezone

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import generics, permissions, status
from rest_framework.exceptions import PermissionDenied

from .permissions import (
    is_support_or_admin,
    is_admin_user,
    is_technician_user,
    can_edit_ticket,
    can_delete_ticket,
    can_change_ticket_status,
    can_assign_ticket,
    CanManageComment,
)
from .models import Ticket, Category, Comment
from .serializers import (
    TicketSerializer,
    CategorySerializer,
    CommentSerializer,
    UserBriefSerializer,
    TicketAssignSerializer,
    AdminUserSerializer,
)
from .services import ChangeTicketStatusCommand
from .filters import TicketFilter


def _visible_ticket_qs(user):
    """Base queryset limited to tickets visible for given user."""

    qs = Ticket.objects.select_related("created_by", "assigned_to", "category").order_by(
        "-created_at"
    )

    if is_admin_user(user):
        return qs
    if is_technician_user(user):
        return qs.filter(Q(assigned_to=user) | Q(assigned_to__isnull=True))
    return qs.filter(created_by=user)


def _get_visible_ticket_or_404(user, pk: int) -> Ticket:
    return get_object_or_404(_visible_ticket_qs(user), pk=pk)


# =========================
# USER MANAGEMENT (ADMIN)
# =========================


class UserListCreateAPIView(generics.ListCreateAPIView):
    """Admin-only: list users and create a new user."""

    serializer_class = AdminUserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if not is_admin_user(self.request.user):
            raise PermissionDenied("Only admin can manage users.")
        User = get_user_model()
        return User.objects.all().order_by("username")

    def create(self, request, *args, **kwargs):
        if not is_admin_user(request.user):
            raise PermissionDenied("Only admin can manage users.")
        return super().create(request, *args, **kwargs)


class UserRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    """Admin-only: update role / basic fields, or delete user."""

    serializer_class = AdminUserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if not is_admin_user(self.request.user):
            raise PermissionDenied("Only admin can manage users.")
        User = get_user_model()
        return User.objects.all().order_by("username")

    def update(self, request, *args, **kwargs):
        if not is_admin_user(request.user):
            raise PermissionDenied("Only admin can manage users.")
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        if not is_admin_user(request.user):
            raise PermissionDenied("Only admin can manage users.")
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        if not is_admin_user(request.user):
            raise PermissionDenied("Only admin can manage users.")
        obj = self.get_object()
        if obj.id == request.user.id:
            return Response(
                {"detail": "You cannot delete your own account."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return super().destroy(request, *args, **kwargs)


class HealthCheckView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({"status": "ok"})


class TechnicianListAPIView(generics.ListAPIView):
    """
    Returns list of technicians/admins for assignment dropdown.
    Access: TECHNICIAN / ADMIN only.
    """
    serializer_class = UserBriefSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not is_support_or_admin(user):
            raise PermissionDenied("Only support or admin can view technicians list.")

        User = get_user_model()

        # Technicians can only assign to themselves – return only current user
        if is_technician_user(user):
            return User.objects.filter(id=user.id)

        # Admin: list technicians + admins (plus superusers)
        return (
            User.objects.filter(
                Q(groups__name__in=["TECHNICIAN", "ADMIN"]) | Q(is_superuser=True)
            )
            .distinct()
            .order_by("username")
        )

class TicketListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = TicketSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        base_qs = Ticket.objects.select_related("created_by", "assigned_to", "category").order_by(
            "-created_at"
        )

        filters = TicketFilter(self.request.query_params, self.request.user)
        queryset = filters.apply(base_qs)

        user = self.request.user
        # Apply visibility rules LAST (prevents leaking by query params)
        if is_admin_user(user):
            return queryset
        if is_technician_user(user):
            return queryset.filter(Q(assigned_to=user) | Q(assigned_to__isnull=True))
        return queryset.filter(created_by=user)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class TicketRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TicketSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return _visible_ticket_qs(self.request.user)

    def update(self, request, *args, **kwargs):
        ticket = self.get_object()
        if not can_edit_ticket(request.user, ticket):
            raise PermissionDenied("You do not have permission to edit this ticket.")
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        ticket = self.get_object()
        if not can_edit_ticket(request.user, ticket):
            raise PermissionDenied("You do not have permission to edit this ticket.")
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        ticket = self.get_object()
        if not can_delete_ticket(request.user, ticket):
            raise PermissionDenied("Only admin can delete tickets.")
        return super().destroy(request, *args, **kwargs)


class TicketChangeStatusAPIView(generics.UpdateAPIView):
    serializer_class = TicketSerializer
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        ticket = _get_visible_ticket_or_404(request.user, pk)
        new_status = request.data.get("status")

        if not new_status:
            return Response({"error": "Missing status"}, status=status.HTTP_400_BAD_REQUEST)

        if not can_change_ticket_status(request.user, ticket):
            raise PermissionDenied("You do not have permission to change status for this ticket.")

        command = ChangeTicketStatusCommand(
            ticket=ticket,
            new_status=new_status,
            performed_by=request.user,
        )

        updated_ticket = command.execute()
        serializer = TicketSerializer(updated_ticket)
        return Response(serializer.data, status=status.HTTP_200_OK)


class TicketAssignAPIView(generics.UpdateAPIView):
    """
    Assign or unassign ticket to technician/admin.
    PATCH /api/tickets/{id}/assign/
    Body: { "assigned_to": <user_id or null> }

    Access: TECHNICIAN / ADMIN only.
    """
    queryset = Ticket.objects.select_related("created_by", "assigned_to", "category").all()
    serializer_class = TicketAssignSerializer
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        user = request.user

        # Ticket must be visible to the requester (technician sees only own/unassigned)
        ticket = _get_visible_ticket_or_404(user, pk)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        assigned_to_id = serializer.validated_data.get("assigned_to", None)

        if not can_assign_ticket(user, ticket, assigned_to_id):
            raise PermissionDenied("You do not have permission to (re)assign this ticket.")

        if assigned_to_id is None:
            # Only admin can reach here (technician blocked by can_assign_ticket)
            ticket.assigned_to = None
        else:
            User = get_user_model()
            new_assignee = get_object_or_404(User, pk=assigned_to_id)
            # Admin can assign only to TECHNICIAN/ADMIN (or superuser)
            if is_admin_user(user) and not is_support_or_admin(new_assignee):
                return Response(
                    {"detail": "Assignee must be TECHNICIAN or ADMIN."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            ticket.assigned_to = new_assignee

        ticket.save(update_fields=["assigned_to"])
        return Response(TicketSerializer(ticket).data, status=status.HTTP_200_OK)


class CategoryListCreateAPIView(generics.ListCreateAPIView):
    queryset = Category.objects.all().order_by("name")
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        if not is_admin_user(request.user):
            raise PermissionDenied("Only admin can create categories.")
        return super().create(request, *args, **kwargs)


class CategoryRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def update(self, request, *args, **kwargs):
        if not is_admin_user(request.user):
            raise PermissionDenied("Only admin can update categories.")
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        if not is_admin_user(request.user):
            raise PermissionDenied("Only admin can update categories.")
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        if not is_admin_user(request.user):
            raise PermissionDenied("Only admin can delete categories.")
        return super().destroy(request, *args, **kwargs)


class CommentListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        ticket_id = self.kwargs.get("ticket_id")
        ticket = _get_visible_ticket_or_404(self.request.user, ticket_id)

        qs = (
            Comment.objects
            .filter(ticket=ticket)
            .select_related("ticket", "author")
            .order_by("-created_at")
        )

        user = self.request.user
        if is_support_or_admin(user):
            return qs

        return qs.filter(visibility=Comment.VISIBILITY_PUBLIC)

    def perform_create(self, serializer):
        ticket_id = self.kwargs.get("ticket_id")
        ticket = _get_visible_ticket_or_404(self.request.user, ticket_id)

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
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated, CanManageComment]

    def get_queryset(self):
        user = self.request.user
        qs = Comment.objects.select_related("ticket", "author").all()

        if is_admin_user(user):
            return qs

        if is_technician_user(user):
            return qs.filter(Q(ticket__assigned_to=user) | Q(ticket__assigned_to__isnull=True))

        # Regular users: only comments for their tickets AND only public
        return qs.filter(ticket__created_by=user, visibility=Comment.VISIBILITY_PUBLIC)


# =========================
# STATS
# =========================

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
        # Admin: stats for all tickets, Technician: stats only for visible (own/unassigned)
        qs = _visible_ticket_qs(user)

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
