from whitenoise import WhiteNoise
from django.conf import settings
import os

class WhiteNoiseStaticFilesHandler(WhiteNoise):
    """
    Расширяем WhiteNoise для обработки медиа-файлов в production
    """
    def __init__(self, application):
        super().__init__(application)
        # Добавляем медиа-файлы
        if hasattr(settings, 'MEDIA_ROOT') and hasattr(settings, 'MEDIA_URL'):
            media_root = str(settings.MEDIA_ROOT)
            media_url = settings.MEDIA_URL.rstrip('/')
            if os.path.exists(media_root):
                self.add_files(media_root, prefix=media_url)