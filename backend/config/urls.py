from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from core.views import brigade_page

urlpatterns = [
    path('admin/', admin.site.urls),
    path('<slug:slug>/', brigade_page, name='brigade_page'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
