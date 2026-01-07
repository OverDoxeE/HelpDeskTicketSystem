from __future__ import annotations

from rest_framework.permissions import BasePermission, SAFE_METHODS

from .models import Ticket, Comment


def user_in_groups(user, group_names: list[str]) -> bool:
    if not user.is_authenticated:
        return False
    return user.groups.filter(name__in=group_names).exists()


def get_user_role(user) -> str:
    """Option A: single effective role derived from groups.

    Priority:
      1) ADMIN (group ADMIN or superuser)
      2) TECHNICIAN (group TECHNICIAN)
      3) USER (default)
    """

    if not user or not getattr(user, "is_authenticated", False):
        return "ANON"
    if getattr(user, "is_superuser", False) or user_in_groups(user, ["ADMIN"]):
        return "ADMIN"
    if user_in_groups(user, ["TECHNICIAN"]):
        return "TECHNICIAN"
    return "USER"


def is_admin_user(user) -> bool:
    return get_user_role(user) == "ADMIN"


def is_technician_user(user) -> bool:
    return get_user_role(user) == "TECHNICIAN"


def is_support_or_admin(user) -> bool:
    return get_user_role(user) in ("TECHNICIAN", "ADMIN")


def can_view_ticket(user, ticket: Ticket) -> bool:
    """Visibility rules:

    - ADMIN: sees all
    - TECHNICIAN: sees only tickets assigned to them OR unassigned
    - USER: sees only their own (created_by)
    """

    role = get_user_role(user)
    if role == "ADMIN":
        return True
    if role == "TECHNICIAN":
        return ticket.assigned_to_id in (None, user.id)
    if role == "USER":
        return ticket.created_by_id == user.id
    return False


def can_edit_ticket(user, ticket: Ticket) -> bool:
    """Who can edit ticket core fields (title/description/etc.).

    - ADMIN: yes
    - Ticket owner: yes
    - TECHNICIAN: no (they use status/assign endpoints)
    """

    if is_admin_user(user):
        return True
    return ticket.created_by_id == user.id


def can_delete_ticket(user, ticket: Ticket) -> bool:
    return is_admin_user(user)


def can_change_ticket_status(user, ticket: Ticket) -> bool:
    """Status changes:

    - ADMIN: always
    - TECHNICIAN: only if ticket is assigned to them
    """

    if is_admin_user(user):
        return True
    return is_technician_user(user) and ticket.assigned_to_id == user.id


def can_assign_ticket(user, ticket: Ticket, new_assignee_id: int | None) -> bool:
    """Assignment rules:

    - ADMIN: can assign/unassign to any TECHNICIAN/ADMIN
    - TECHNICIAN: can ONLY assign tickets to themselves, and ONLY if:
        * ticket is unassigned, OR
        * ticket is already assigned to them
      (No unassigning by technicians.)
    """

    if is_admin_user(user):
        return True

    if not is_technician_user(user):
        return False

    # Technician cannot unassign
    if new_assignee_id is None:
        return False

    # Technician can only assign to themselves
    if new_assignee_id != user.id:
        return False

    # Ticket must be unassigned or already assigned to the technician
    return ticket.assigned_to_id in (None, user.id)


class IsTicketVisible(BasePermission):
    """Object-level permission: can the user see the ticket?"""

    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        if isinstance(obj, Ticket):
            return can_view_ticket(request.user, obj)
        return False


class CanManageComment(BasePermission):
    """Comment permissions.

    - Read (SAFE) allowed if the view returns the comment in queryset.
    - Update allowed for comment author or admin.
    - Delete allowed only for admin.
    """

    def has_object_permission(self, request, view, obj):
        user = request.user
        if not user.is_authenticated:
            return False

        if request.method in SAFE_METHODS:
            return True

        if request.method == "DELETE":
            return is_admin_user(user)

        if isinstance(obj, Comment):
            if obj.author_id == user.id:
                return True
            return is_admin_user(user)

        return False
