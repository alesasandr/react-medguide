from django.contrib import admin

from .models import Medicine


@admin.register(Medicine)
class MedicineAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "name",
        "mnn",
        "form",
        "dosage",
        "article",
        "stock",
        "min_stock",
        "diff",
        "stock_per_pack",
    )
    list_filter = ("form",)
    search_fields = ("name", "mnn", "article")
    ordering = ("name",)

