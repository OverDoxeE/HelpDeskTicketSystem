from django.db.models import Q

class TicketFilter:
    def __init__(self, params, user):
        self.params = params
        self.user = user

    def apply(self, queryset):
        status_val = self.params.get("status")
        priority_val = self.params.get("priority")
        category_val = self.params.get("category")
        assigned_to_val = self.params.get("assigned_to")
        created_by_val = self.params.get("created_by")
        search_val = self.params.get("search")

        if status_val:
            queryset = queryset.filter(status=status_val)

        if priority_val:
            queryset = queryset.filter(priority=priority_val)

        if category_val:
            queryset = queryset.filter(category_id=category_val)

        if assigned_to_val:
            queryset = queryset.filter(assigned_to_id=assigned_to_val)

        if created_by_val == "me":
            queryset = queryset.filter(created_by=self.user)
        elif created_by_val:
            queryset = queryset.filter(created_by_id=created_by_val)

        if search_val:
            queryset = queryset.filter(
                Q(title__icontains=search_val)
                | Q(description__icontains=search_val)
            )

        return queryset
