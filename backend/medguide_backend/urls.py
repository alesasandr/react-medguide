from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    # Needed for admin language switcher (Jazzmin uses set_language)
    path("i18n/", include("django.conf.urls.i18n")),
    path("admin/", admin.site.urls),
    path("api/", include("chat.urls")),
    path("api/", include("medicines.urls")),
]
