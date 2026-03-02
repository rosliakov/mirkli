from django.core.management.base import BaseCommand
from django.contrib.auth.models import User

class Command(BaseCommand):
    help = 'Create admin user'

    def handle(self, *args, **options):
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser('admin', 'admin@mirkli.com', 'admin123')
            self.stdout.write(self.style.SUCCESS('Admin user created successfully'))
        else:
            # Обновляем пароль если пользователь уже есть
            admin = User.objects.get(username='admin')
            admin.set_password('admin123')
            admin.save()
            self.stdout.write(self.style.SUCCESS('Admin password updated'))