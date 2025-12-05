from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.conf import settings
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.authtoken.models import Token
from chat.models import Profile, IssuedMedicine
from chat.serializers import ProfileSerializer, IssuedMedicineSerializer
from medicines.models import Medicine


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

    # Создаем или получаем токен для пользователя
    token, created = Token.objects.get_or_create(user=user)

    return JsonResponse(
        {
            "user": {
                "id": user.id,
                "full_name": user.first_name,
                "email": user.email,
                "is_staff": user.is_staff,
            },
            "token": token.key,  # Возвращаем токен для аутентификации
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

    @action(detail=False, methods=['get'], permission_classes=[])
    def me(self, request):
        """Получить профиль текущего пользователя"""
        # Проверяем аутентификацию вручную, так как permission_classes=[] отключает проверку
        if not request.user.is_authenticated:
            return Response({'error': 'Не авторизован'}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            # Пытаемся получить профиль
            profile = Profile.objects.get(user=request.user)
        except Profile.DoesNotExist:
            # Если профиль не существует, создаем его с базовыми данными
            import uuid
            import time
            # Генерируем уникальный employee_id
            employee_id = f"DOC-{request.user.id}-{int(time.time())}-{uuid.uuid4().hex[:6]}"
            profile = Profile.objects.create(
                user=request.user,
                full_name=request.user.first_name or request.user.email or "",
                is_staff=request.user.is_staff,
                is_doctor=request.user.is_staff,  # Считаем staff врачами
                employee_id=employee_id,
            )
        
        try:
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        except Exception as e:
            # Логируем ошибку для отладки
            import traceback
            print(f"Error serializing profile: {e}")
            print(traceback.format_exc())
            return Response(
                {'error': 'Ошибка при получении профиля', 'detail': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

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
        """При создании записи автоматически привязываем к профилю текущего пользователя и обновляем остаток"""
        if not self.request.user.is_authenticated:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Не авторизован')
        
        try:
            profile = self.request.user.profile
        except Profile.DoesNotExist:
            profile = Profile.objects.create(user=self.request.user)
        
        # Сохраняем запись о выдаче
        issued_medicine = serializer.save(doctor=profile)
        
        # Обновляем остаток препарата на складе
        if issued_medicine.medicine:
            medicine = issued_medicine.medicine
            # Уменьшаем остаток на количество выданного
            new_stock = max(0, medicine.stock - issued_medicine.quantity)
            medicine.stock = new_stock
        # Пересчитываем diff
        medicine.diff = max(0, medicine.min_stock - new_stock)
        medicine.save(update_fields=['stock', 'diff'])


@csrf_exempt
def reset_password_request(request):
    """Запрос на восстановление пароля - отправка email с токеном"""
    if request.method != "POST":
        return JsonResponse({"detail": "Method not allowed"}, status=405)

    try:
        data = json.loads(request.body.decode("utf-8"))
    except json.JSONDecodeError:
        return JsonResponse({"detail": "Invalid JSON"}, status=400)

    email = data.get("email", "").strip()

    if not email:
        return JsonResponse({"detail": "Email обязателен"}, status=400)

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        # Для безопасности не сообщаем, что пользователь не найден
        return JsonResponse({
            "message": "Если пользователь с таким email существует, на почту отправлена ссылка для восстановления пароля."
        })

    # Генерируем токен восстановления
    token = default_token_generator.make_token(user)
    uid = urlsafe_base64_encode(force_bytes(user.pk))

    # Формируем ссылку для восстановления
    # В production замените на реальный URL вашего frontend
    frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:8081')
    reset_url = f"{frontend_url}/reset-password-confirm/{uid}/{token}/"

    # Отправляем email
    try:
        subject = "Восстановление пароля - MedGuide"
        message = f"""
Здравствуйте!

Вы запросили восстановление пароля для вашего аккаунта в MedGuide.

Для восстановления пароля перейдите по ссылке:
{reset_url}

Если вы не запрашивали восстановление пароля, просто проигнорируйте это письмо.

Ссылка действительна в течение 24 часов.

С уважением,
Команда MedGuide
"""
        
        from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@medguide.com')
        send_mail(
            subject,
            message,
            from_email,
            [user.email],
            fail_silently=False,
        )
    except Exception as e:
        # Логируем ошибку, но не раскрываем её пользователю
        print(f"Ошибка отправки email: {e}")
        return JsonResponse({
            "detail": "Ошибка отправки email. Попробуйте позже."
        }, status=500)

    return JsonResponse({
        "message": "Если пользователь с таким email существует, на почту отправлена ссылка для восстановления пароля."
    })


@csrf_exempt
def reset_password_confirm(request):
    """Подтверждение восстановления пароля - установка нового пароля"""
    if request.method != "POST":
        return JsonResponse({"detail": "Method not allowed"}, status=405)

    try:
        data = json.loads(request.body.decode("utf-8"))
    except json.JSONDecodeError:
        return JsonResponse({"detail": "Invalid JSON"}, status=400)

    uid = data.get("uid", "").strip()
    token = data.get("token", "").strip()
    new_password = data.get("password", "").strip()

    if not uid or not token or not new_password:
        return JsonResponse({
            "detail": "UID, токен и новый пароль обязательны"
        }, status=400)

    if len(new_password) < 6:
        return JsonResponse({
            "detail": "Пароль должен быть не менее 6 символов"
        }, status=400)

    try:
        # Декодируем UID
        user_id = force_str(urlsafe_base64_decode(uid))
        user = User.objects.get(pk=user_id)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        return JsonResponse({
            "detail": "Неверная ссылка восстановления"
        }, status=400)

    # Проверяем токен
    if not default_token_generator.check_token(user, token):
        return JsonResponse({
            "detail": "Ссылка восстановления недействительна или истекла"
        }, status=400)

    # Устанавливаем новый пароль
    user.set_password(new_password)
    user.save()

    return JsonResponse({
        "message": "Пароль успешно изменен"
    })
