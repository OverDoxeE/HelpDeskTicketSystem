from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import generics, permissions, status
from django.shortcuts import get_object_or_404
from .permissions import is_support_or_admin, is_admin_user, IsTicketOwnerOrSupportOrAdmin, CanManageComment
from .models import Ticket, Category, Comment
from .serializers import TicketSerializer, CategorySerializer, CommentSerializer
from .services import ChangeTicketStatusCommand
from .filters import TicketFilter

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
