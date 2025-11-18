# backend/chat/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path("auth/register/", views.register_view, name="register"),
    path("auth/login/", views.login_view, name="login"),

    # если нужны инструкции для экранов InstructionsList / InstructionDetails:
    path("instructions/", views.instructions_list, name="instructions_list"),
    path("instructions/<int:pk>/", views.instruction_detail, name="instruction_detail"),
]
