from django.contrib.auth.models import Group
from rest_framework.permissions import BasePermission, SAFE_METHODS
from .models import Ticket

def user_in_groups(user, group_names):
    if not user.is_authenticated:
        return False
    return user.groups.filter(name__in=group_names).exists()

def is_support_or_admin(user):
    if not user.is_authenticated:
        return False
    if user.is_superuser or user.is_staff:
        return True
    return user_in_groups(user, ["TECHNICIAN", "ADMIN"])

class IsTicketOwnerOrSupportOrAdmin(BasePermission):
    """
    Allow access to:
    - ticket owner (created_by)
    - users in TECHNICIAN or ADMIN group
    - staff / superuser
    """

    def has_object_permission(self, request, view, obj):
        user = request.user
        if not user.is_authenticated:
            return False

        if is_support_or_admin(user):
            return True

        if isinstance(obj, Ticket):
            return obj.created_by_id == user.id

        return False
