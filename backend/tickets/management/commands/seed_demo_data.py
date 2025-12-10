from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.utils import timezone

from backend.tickets.models import Category, Ticket, Comment

class Command(BaseCommand):
    help = "Seed demo data for tickets app"

    def handle(self, *args, **options):
        User = get_user_model()

        # Groups
        tech_group, _ = Group.objects.get_or_create(name="TECHNICIAN")
        admin_group, _ = Group.objects.get_or_create(name="ADMIN")

        # Users
        admin, _ = User.objects.get_or_create(
            username="admin_demo",
            defaults={
                "email": "admin@example.com",
                "is_staff": True,
                "is_superuser": True,
            },
        )
        admin.set_password("admin123")
        admin.save()
        admin.groups.add(admin_group)

        technician, _ = User.objects.get_or_create(
            username="tech_demo",
            defaults={
                "email": "tech@example.com",
                "is_staff": True,
            },
        )
        technician.set_password("tech123")
        technician.save()
        technician.groups.add(tech_group)

        regular_user, _ = User.objects.get_or_create(
            username="user_demo",
            defaults={
                "email": "user@example.com",
                "is_staff": False,
                "is_superuser": False,
            },
        )
        regular_user.set_password("user123")
        regular_user.save()

        # Categories
        categories_data = [
            ("Network", "Issues related to VPN, Wi-Fi, LAN, connectivity."),
            ("Accounts & Access", "Password resets, locked accounts, permissions."),
            ("Hardware", "Laptops, printers, monitors and other devices."),
            ("Security", "Incidents, alerts, suspicious activity."),
            ("Devices", "Mobile devices, peripherals."),
            ("Administration", "Onboarding, offboarding, general IT requests."),
        ]
        categories = []
        for name, desc in categories_data:
            category, _ = Category.objects.get_or_create(name=name, defaults={"description": desc})
            categories.append(category)

        # Tickets
        ticket1, _ = Ticket.objects.get_or_create(
            title="VPN not working",
            defaults={
                "description": "Cannot connect to VPN from home.",
                "status": "OPEN",
                "priority": "HIGH",
                "created_by": regular_user,
                "assigned_to": technician,
                "category": categories[0],
            },
        )
        ticket2, _ = Ticket.objects.get_or_create(
            title="Password reset needed",
            defaults={
                "description": "Forgot my password, need reset.",
                "status": "IN_PROGRESS",
                "priority": "MEDIUM",
                "created_by": regular_user,
                "assigned_to": technician,
                "category": categories[1],
            },
        )
        ticket3, _ = Ticket.objects.get_or_create(
            title="Printer not responding",
            defaults={
                "description": "Office printer is offline.",
                "status": "RESOLVED",
                "priority": "LOW",
                "created_by": technician,
                "assigned_to": admin,
                "category": categories[2],
            },
        )
        ticket4, _ = Ticket.objects.get_or_create(
            title="Suspicious login detected",
            defaults={
                "description": "Alert about suspicious login from unknown location.",
                "status": "OPEN",
                "priority": "CRITICAL",
                "created_by": technician,
                "assigned_to": admin,
                "category": categories[3],
            },
        )

        # Comments
        Comment.objects.get_or_create(
            ticket=ticket1,
            author=regular_user,
            message="I am still experiencing this issue.",
            visibility=Comment.VISIBILITY_PUBLIC,
        )
        Comment.objects.get_or_create(
            ticket=ticket1,
            author=technician,
            message="Checking logs on the VPN gateway.",
            visibility=Comment.VISIBILITY_INTERNAL,
        )
        Comment.objects.get_or_create(
            ticket=ticket2,
            author=regular_user,
            message="Thank you for your help!",
            visibility=Comment.VISIBILITY_PUBLIC,
        )
        Comment.objects.get_or_create(
            ticket=ticket3,
            author=technician,
            message="Printer was restarted and is now online.",
            visibility=Comment.VISIBILITY_PUBLIC,
        )
        Comment.objects.get_or_create(
            ticket=ticket4,
            author=admin,
            message="Please reset your password and enable 2FA.",
            visibility=Comment.VISIBILITY_INTERNAL,
        )

        self.stdout.write(self.style.SUCCESS("Demo data seeded."))
