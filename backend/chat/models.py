from django.db import models
from django.contrib.auth.models import User

# Типы сообщений в чате
MESSAGE_TYPES = (
    ("text", "Текстовое сообщение"),
    ("system", "Системное сообщение"),
)


class Profile(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="profile",
    )
    full_name = models.CharField(max_length=255, blank=True)
    is_staff = models.BooleanField(default=False)
    is_doctor = models.BooleanField(default=False)
    avatar_url = models.URLField(blank=True, null=True)

    def __str__(self) -> str:
        return self.full_name or self.user.username


class Instruction(models.Model):
    title = models.CharField(max_length=255)
    short_text = models.TextField(blank=True)
    full_text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return self.title


class Message(models.Model):
    sender = models.ForeignKey(
        Profile,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="sent_messages",
    )
    receiver = models.ForeignKey(
        Profile,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="received_messages",
    )
    instruction = models.ForeignKey(
        Instruction,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="messages",
    )
    text = models.TextField()
    message_type = models.CharField(
        max_length=20,
        choices=MESSAGE_TYPES,
        default="text",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    def __str__(self) -> str:
        return f"Сообщение от {self.sender} ({self.created_at})"
