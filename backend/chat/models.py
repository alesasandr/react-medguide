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
    specialty = models.CharField(max_length=255, blank=True, default="Терапевт")
    work_location = models.CharField(max_length=255, blank=True)
    employee_id = models.CharField(max_length=50, unique=True, blank=True, null=True)

    def __str__(self) -> str:
        return self.full_name or self.user.username


class Instruction(models.Model):
    title = models.CharField(max_length=255)
    short_text = models.TextField(blank=True)
    full_text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return self.title


class IssuedMedicine(models.Model):
    """История выданных препаратов"""
    doctor = models.ForeignKey(
        Profile,
        on_delete=models.CASCADE,
        related_name="issued_medicines",
    )
    medicine = models.ForeignKey(
        "medicines.Medicine",
        on_delete=models.SET_NULL,
        null=True,
        related_name="issued_records",
    )
    quantity = models.IntegerField()
    issued_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.medicine.name if self.medicine else 'N/A'} x{self.quantity} by {self.doctor.full_name} at {self.issued_at}"
