from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User
from django.contrib.auth import authenticate


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

