from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from django.http import HttpResponseRedirect
from core.views import brigade_page

def home_redirect(request):
    return HttpResponseRedirect('/brigade-247/')

urlpatterns = [
    path('', home_redirect, name='home'),
    path('admin/', admin.site.urls),
    path('<slug:slug>/', brigade_page, name='brigade_page'),
]

# Всегда добавляем медиа-файлы (WhiteNoise обработает их в production)
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
