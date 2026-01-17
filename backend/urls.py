from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static

from backend.spa import spa_index

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("backend.tickets.urls")),
    path("api-auth/", include("rest_framework.urls")),
]

# SPA fallback – wszystko co nie jest admin/api/static
urlpatterns += [
    re_path(r"^(?!admin/|api/|api-auth/|static/).*$", spa_index),
]

# W trybie DEBUG Django serwuje statyczne pliki (czyli /static/* z frontend_dist)
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.FRONTEND_DIST_DIR)
