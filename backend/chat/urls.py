# backend/chat/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'profiles', views.ProfileViewSet)
router.register(r'issued-medicines', views.IssuedMedicineViewSet)

urlpatterns = [
    path("", include(router.urls)),
    path("auth/register/", views.register_view, name="register"),
    path("auth/login/", views.login_view, name="login"),
    path("auth/reset-password/", views.reset_password_request, name="reset_password_request"),
    path("auth/reset-password-confirm/", views.reset_password_confirm, name="reset_password_confirm"),
    path("instructions/", views.instructions_list, name="instructions_list"),
    path("instructions/<int:pk>/", views.instruction_detail, name="instruction_detail"),
]
