from django.contrib import admin

from .models import Profile, Instruction, IssuedMedicine


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "full_name",
        "employee_id",
        "is_staff",
        "is_doctor",
        "specialty",
        "work_location",
    )
    list_filter = ("is_staff", "is_doctor", "specialty")
    search_fields = ("full_name", "user__username", "user__email", "employee_id")
    ordering = ("id",)


@admin.register(Instruction)
class InstructionAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "created_at")
    search_fields = ("title", "short_text", "full_text")
    ordering = ("-created_at",)


@admin.register(IssuedMedicine)
class IssuedMedicineAdmin(admin.ModelAdmin):
    list_display = ("id", "issued_at", "doctor", "medicine", "quantity")
    list_filter = ("issued_at",)
    search_fields = (
        "doctor__full_name",
        "doctor__employee_id",
        "medicine__name",
        "medicine__article",
    )
    ordering = ("-issued_at",)
    autocomplete_fields = ("doctor", "medicine")
