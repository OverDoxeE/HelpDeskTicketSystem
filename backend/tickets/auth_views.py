from django.contrib.auth import authenticate, get_user_model
from rest_framework import permissions, status
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.views import APIView

User = get_user_model()


def _user_payload(user, token=None):
    groups = list(user.groups.values_list("name", flat=True))
    return {
        "token": token.key if token else None,
        "user": {
            "id": user.id,
            "username": user.get_username(),
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "groups": groups,
            "is_staff": user.is_staff,
            "is_superuser": user.is_superuser,
        },
    }


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        email = request.data.get("email")
        username = request.data.get("username")
        password = request.data.get("password")

        if not password:
            return Response(
                {"detail": "Missing password"}, status=status.HTTP_400_BAD_REQUEST
            )

        if email and not username:
            try:
                user_obj = User.objects.get(email=email)
                username = user_obj.get_username()
            except User.DoesNotExist:
                return Response(
                    {"detail": "Invalid credentials"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        if not username:
            return Response(
                {"detail": "Provide username or email"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = authenticate(request, username=username, password=password)
        if not user:
            return Response(
                {"detail": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST
            )

        token, _ = Token.objects.get_or_create(user=user)
        return Response(_user_payload(user, token), status=status.HTTP_200_OK)


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        token = Token.objects.filter(user=request.user).first()
        return Response(_user_payload(request.user, token), status=status.HTTP_200_OK)


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        Token.objects.filter(user=request.user).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
