from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework import viewsets, status
from rest_framework.decorators import action
from chat.models import Profile, IssuedMedicine
from chat.serializers import ProfileSerializer, IssuedMedicineSerializer
from medicines.models import Medicine


@api_view(["POST"])
def login_view(request):
    email = request.data.get("email")
    password = request.data.get("password")

    if not email or not password:
        return Response({"detail": "Email и пароль обязательны"}, status=400)

    # если при регистрации username = email:
    user = authenticate(username=email, password=password)

    if user is None:
        return Response({"detail": "Неверные данные"}, status=400)

    return Response({
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.first_name or "",
            "is_staff": user.is_staff,
            "avatar_url": None,
        }
    })
@csrf_exempt
def register_view(request):
    if request.method != "POST":
        return JsonResponse({"detail": "Method not allowed"}, status=405)

    try:
        data = json.loads(request.body.decode("utf-8"))
    except json.JSONDecodeError:
        return JsonResponse({"detail": "Invalid JSON"}, status=400)

    full_name = data.get("full_name", "").strip()
    email = data.get("email", "").strip()
    password = data.get("password", "").strip()
    is_staff = bool(data.get("is_staff", False))

    if not email or not password:
        return JsonResponse(
            {"detail": "Email и пароль обязательны"}, status=400
        )

    if User.objects.filter(username=email).exists():
        return JsonResponse(
            {"detail": "Пользователь с таким email уже существует"}, status=400
        )

    user = User.objects.create_user(
        username=email,
        email=email,
        password=password,
    )
    user.first_name = full_name
    user.is_staff = is_staff
    user.save()

    return JsonResponse(
        {
            "user": {
                "id": user.id,
                "full_name": user.first_name,
                "email": user.email,
                "is_staff": user.is_staff,
            }
        }
    )


@csrf_exempt
def login_view(request):
    if request.method != "POST":
        return JsonResponse({"detail": "Method not allowed"}, status=405)

    try:
        data = json.loads(request.body.decode("utf-8"))
    except json.JSONDecodeError:
        return JsonResponse({"detail": "Invalid JSON"}, status=400)

    email = data.get("email", "").strip()
    password = data.get("password", "").strip()

    if not email or not password:
        return JsonResponse(
            {"detail": "Email и пароль обязательны"}, status=400
        )

    user = authenticate(request, username=email, password=password)
    if user is None:
        return JsonResponse({"detail": "Неверные логин или пароль"}, status=400)

    return JsonResponse(
        {
            "user": {
                "id": user.id,
                "full_name": user.first_name,
                "email": user.email,
                "is_staff": user.is_staff,
            }
        }
    )
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
@csrf_exempt
def instructions_list(request):
    if request.method != "GET":
        return JsonResponse({"detail": "Method not allowed"}, status=405)

    # Простейший мок-список инструкций, чтобы фронт не падал
    data = [
        {
            "id": 1,
            "title": "Пример инструкции",
            "short_text": "Краткое описание...",
            "full_text": "Полный текст инструкции...",
        }
    ]
    return JsonResponse({"results": data})


@csrf_exempt
def instruction_detail(request, pk):
    if request.method != "GET":
        return JsonResponse({"detail": "Method not allowed"}, status=405)

    # Простейшая заглушка по id
    data = {
        "id": pk,
        "title": f"Инструкция #{pk}",
        "full_text": "Полный текст инструкции (заглушка).",
    }
    return JsonResponse(data)


class ProfileViewSet(viewsets.ModelViewSet):
    """API для профилей пользователей"""
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer

    @action(detail=False, methods=['get'])
    def me(self, request):
        """Получить профиль текущего пользователя"""
        if not request.user.is_authenticated:
            return Response({'error': 'Не авторизован'}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            profile = request.user.profile
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        except Profile.DoesNotExist:
            return Response({'error': 'Профиль не найден'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['put', 'patch'])
    def update_me(self, request):
        """Обновить профиль текущего пользователя"""
        if not request.user.is_authenticated:
            return Response({'error': 'Не авторизован'}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            profile = request.user.profile
        except Profile.DoesNotExist:
            profile = Profile.objects.create(user=request.user)
        
        serializer = self.get_serializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class IssuedMedicineViewSet(viewsets.ModelViewSet):
    """API для истории выданных препаратов"""
    queryset = IssuedMedicine.objects.all()
    serializer_class = IssuedMedicineSerializer

    @action(detail=False, methods=['get'])
    def my_issued(self, request):
        """Получить список выданных препаратов текущего пользователя"""
        if not request.user.is_authenticated:
            return Response({'error': 'Не авторизован'}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            profile = request.user.profile
            issued = IssuedMedicine.objects.filter(doctor=profile).order_by('-issued_at')
            serializer = self.get_serializer(issued, many=True)
            return Response(serializer.data)
        except Profile.DoesNotExist:
            return Response({'error': 'Профиль не найден'}, status=status.HTTP_404_NOT_FOUND)

    def perform_create(self, serializer):
        """При создании записи автоматически привязываем к профилю текущего пользователя"""
        if not self.request.user.is_authenticated:
            raise Response({'error': 'Не авторизован'}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            profile = self.request.user.profile
        except Profile.DoesNotExist:
            profile = Profile.objects.create(user=self.request.user)
        
        serializer.save(doctor=profile)
