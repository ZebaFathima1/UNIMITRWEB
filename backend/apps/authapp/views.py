from rest_framework import generics, permissions
from rest_framework.response import Response
from django.contrib.auth.models import User
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .serializers import SignupSerializer, UserSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    # Use username as the primary login field; map email -> username for convenience
    username_field = 'username'
    
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['email'] = user.email
        token['username'] = user.username
        token['is_staff'] = user.is_staff
        return token

    def validate(self, attrs):
        # Accept either email or username. If a user exists without a usable password,
        # set the provided password once and continue (helps accounts created without password).
        raw_identifier = attrs.get('email') or attrs.get('username')
        password = attrs.get('password')

        # Try to resolve the user by email first, then by username
        user = None
        if raw_identifier:
            try:
                user = User.objects.get(email=raw_identifier)
            except User.DoesNotExist:
                try:
                    user = User.objects.get(username=raw_identifier)
                except User.DoesNotExist:
                    user = None

        if user is not None:
            # If the user has no usable password (e.g., created via compat), set it now
            if password and not user.has_usable_password():
                user.set_password(password)
                user.save(update_fields=['password'])
            # Ensure SimpleJWT authenticates using the username
            attrs['username'] = user.username

        data = super().validate(attrs)
        data['user'] = UserSerializer(self.user).data
        return data

class LoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class SignupView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = SignupSerializer
    permission_classes = [permissions.AllowAny]

class UsersListView(generics.ListAPIView):
    queryset = User.objects.all().order_by('-last_login', '-date_joined')
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]

class MeView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    def get_object(self):
        return self.request.user

from rest_framework.views import APIView
from django.utils import timezone
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken

class SimpleLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        role = request.data.get('role')
        name = request.data.get('name')
        # Optional fields from the current frontend payload
        _student_id = request.data.get('studentId')
        _phone = request.data.get('phone')

        if not email or role not in ['student', 'admin']:
            return Response({'detail': 'email and role are required'}, status=400)

        username = email
        user, created = User.objects.get_or_create(username=username, defaults={'email': email})

        # Update basic fields
        if name:
            parts = name.split()
            user.first_name = parts[0]
            if len(parts) > 1:
                user.last_name = ' '.join(parts[1:])
        if not user.email:
            user.email = email

        # Grant staff for admin role so IsAdminUser permissions pass
        if role == 'admin' and not user.is_staff:
            user.is_staff = True

        # Touch last_login for auditing purposes
        user.last_login = timezone.now()
        user.save()

        refresh = RefreshToken.for_user(user)
        data = {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data
        }
        return Response(data)
