from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from django.utils import timezone
from django.contrib.auth import get_user_model

from .models import Category, Ticket, Comment
from .permissions import is_support_or_admin, get_user_role

class UserBriefSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        fields = ["id", "username", "email"]

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "description", "created_at"]
        read_only_fields = ["id", "created_at"]



class TicketSerializer(serializers.ModelSerializer):
    category = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        allow_null=True,
        required=False,
    )

    created_by_user = UserBriefSerializer(source="created_by", read_only=True)
    assigned_to_user = UserBriefSerializer(source="assigned_to", read_only=True)

    class Meta:
        model = Ticket
        fields = [
            "id",
            "title",
            "description",
            "status",
            "priority",
            "created_at",
            "updated_at",
            "created_by",
            "created_by_user",
            "assigned_to",
            "assigned_to_user",
            "category",
            "due_date",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
            "created_by",
            "assigned_to",
        ]

    # ---- Business validators ----

    def validate_title(self, value):
        if len(value.strip()) < 5:
            raise ValidationError("Title must be at least 5 characters long.")
        return value

    def validate_description(self, value):
        if len(value.strip()) < 10:
            raise ValidationError("Description must be at least 10 characters long.")
        return value

    def validate_due_date(self, value):
        if value and value < timezone.now().date():
            raise ValidationError("Due date cannot be in the past.")
        return value

    def validate_status(self, value):
        if self.instance is not None:
            if self.instance.status == "CLOSED" and value != "CLOSED":
                raise ValidationError("Closed ticket cannot be reopened.")
        return value

class TicketAssignSerializer(serializers.Serializer):
    assigned_to = serializers.IntegerField(required=False, allow_null=True)

    def validate_assigned_to(self, value):
        if value is None:
            return None

        User = get_user_model()

        try:
            user = User.objects.get(pk=value)
        except User.DoesNotExist:
            raise ValidationError("User with this id does not exist.")

        if not is_support_or_admin(user):
            raise ValidationError("User is not a technician or admin.")

        return value


class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ["id", "ticket", "author", "message", "visibility", "created_at"]
        read_only_fields = ["id", "created_at", "author", "ticket"]

    def validate_message(self, value):
        if len(value.strip()) < 3:
            raise ValidationError("Comment message is too short.")
        return value


class AdminUserSerializer(serializers.ModelSerializer):

    ROLE_CHOICES = (
        ("USER", "USER"),
        ("TECHNICIAN", "TECHNICIAN"),
        ("ADMIN", "ADMIN"),
    )

    class RoleField(serializers.Field):

        def to_representation(self, user_obj):
            return get_user_role(user_obj)

        def to_internal_value(self, data):
            value = (str(data or "").upper()).strip()
            if value not in {"USER", "TECHNICIAN", "ADMIN"}:
                raise ValidationError("Invalid role.")
            return {"role": value}

    role = RoleField(source='*')
    password = serializers.CharField(write_only=True, required=False, allow_blank=False)

    class Meta:
        model = get_user_model()
        fields = ["id", "username", "email", "role", "is_active", "password"]
        read_only_fields = ["id"]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data.pop("password", None)
        return data

    def _set_role(self, user_obj, role: str):
        from django.contrib.auth.models import Group

        if user_obj.is_superuser and role != "ADMIN":
            raise ValidationError("Superuser must remain ADMIN.")

        tech_group, _ = Group.objects.get_or_create(name="TECHNICIAN")
        admin_group, _ = Group.objects.get_or_create(name="ADMIN")

        user_obj.groups.remove(tech_group)
        user_obj.groups.remove(admin_group)

        if role == "TECHNICIAN":
            user_obj.groups.add(tech_group)
            user_obj.is_staff = False
        elif role == "ADMIN":
            user_obj.groups.add(admin_group)
            user_obj.is_staff = True if not user_obj.is_superuser else user_obj.is_staff
        else:
            user_obj.is_staff = False

    
    def create(self, validated_data):
        role = validated_data.pop("role", "USER")
        password = validated_data.pop("password", None)

        if not password:
            raise ValidationError({"password": "Password is required."})

        user_obj = self.Meta.model(**validated_data)
        user_obj.set_password(password)

        user_obj.save()

        self._set_role(user_obj, role)
        user_obj.save()

        return user_obj

    def update(self, instance, validated_data):
        role = validated_data.pop("role", None)
        password = validated_data.pop("password", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if password:
            instance.set_password(password)

        if role is not None:
            self._set_role(instance, role)

        instance.save()
        return instance
