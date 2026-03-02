import shutil
from pathlib import Path
from django.core.management.base import BaseCommand
from django.core.files import File
from django.conf import settings
from django.contrib.auth.models import User
from core.models import (
    Car, Specialization, Position, Skill,
    Project, ProjectPhoto, Installer, Certificate, BrigadePage,
)


ASSETS = Path(settings.BASE_DIR) / 'core' / 'static' / 'core' / 'assets' / 'images'


def copy_to_media(src_filename, dest_subdir):
    """Копирует файл из assets в media и возвращает Django File."""
    src = ASSETS / src_filename
    dest_dir = Path(settings.MEDIA_ROOT) / dest_subdir
    dest_dir.mkdir(parents=True, exist_ok=True)
    dest = dest_dir / src_filename
    shutil.copy2(src, dest)
    return dest_subdir + '/' + src_filename


class Command(BaseCommand):
    help = 'Создаёт демо-контент: бригада #247 как в исходной вёрстке'

    def handle(self, *args, **options):
        self.stdout.write('Creating demo data...')
        
        # ---------- СОЗДАНИЕ АДМИНА ----------
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser('admin', 'admin@mirkli.com', 'admin123')
            self.stdout.write(self.style.SUCCESS('  OK: Admin user created'))
        else:
            # Обновляем пароль если пользователь уже есть
            admin = User.objects.get(username='admin')
            admin.set_password('admin123')
            admin.save()
            self.stdout.write(self.style.SUCCESS('  OK: Admin password updated'))

        # ---------- АВТОМОБИЛЬ ----------
        car, created = Car.objects.get_or_create(
            name='Ford Transit',
            defaults={
                'comment': 'Оснащен всем необходимым',
                'number': 'А123БВ77',
            }
        )
        if created:
            car.image.name = copy_to_media('van-ford-transit.png', 'cars')
            car.country_flag.name = copy_to_media('flag-russia.png', 'flags')
            car.save()
            self.stdout.write(self.style.SUCCESS('  OK: Avtomobil Ford Transit'))
        else:
            self.stdout.write('  SKIP: Avtomobil uzhe est')

        # ---------- СПЕЦИАЛИЗАЦИИ ----------
        specs_data = [
            'Сплит-системы', 'Мульти-сплит', 'VRF системы',
            'Чиллеры', 'Вентиляция', 'Канальные кондиционеры', 'Обслуживание',
        ]
        specs = {}
        for name in specs_data:
            s, _ = Specialization.objects.get_or_create(name=name)
            specs[name] = s
        self.stdout.write(self.style.SUCCESS('  OK: Specializacii'))

        # ---------- ДОЛЖНОСТИ ----------
        positions_data = ['Старший монтажник', 'Монтажник']
        positions = {}
        for name in positions_data:
            p, _ = Position.objects.get_or_create(name=name)
            positions[name] = p
        self.stdout.write(self.style.SUCCESS('  OK: Dolzhnosti'))

        # ---------- СКИЛЛЫ ----------
        skills_data = ['Джуниор', 'Мидл', 'Синьор']
        skills = {}
        for name in skills_data:
            s, _ = Skill.objects.get_or_create(name=name)
            skills[name] = s
        self.stdout.write(self.style.SUCCESS('  OK: Skilly'))

        # ---------- ПРОЕКТЫ ----------
        projects_data = [
            ('БЦ "Северная Башня"',    'Монтаж VRF системы, 180+ блоков',       'project-office.png',      ['project-office.png', 'project-mall.png']),
            ('ТРЦ "Мега Парк"',        'Установка чиллеров и вентиляции',        'project-mall.png',        ['project-mall.png', 'project-residential.png']),
            ('ЖК "Новые Горизонты"',   'Монтаж сплит-систем в 120 квартирах',   'project-residential.png', ['project-residential.png']),
            ('ЛЦ "Cargo Hub"',         'Промышленная вентиляция склада',         'project-warehouse.png',   ['project-warehouse.png', 'project-office.png']),
            ('ЖК "Лесная Поляна"',    'Установка бытовых кондиционеров',        'project-residential.png', ['project-residential.png', 'project-warehouse.png']),
            ('Офис "Технопарк"',       'Монтаж канальных кондиционеров',         'project-office.png',      ['project-office.png']),
            ('Склад "Логистик Центр"', 'Обслуживание вентсистем',               'project-warehouse.png',   ['project-warehouse.png', 'project-mall.png']),
        ]
        projects = {}
        for name, desc, cover_file, gallery_files in projects_data:
            p, created = Project.objects.get_or_create(name=name, defaults={'description': desc})
            if created:
                p.image.name = copy_to_media(cover_file, 'projects')
                p.save()
                for i, img_file in enumerate(gallery_files):
                    ph = ProjectPhoto(project=p, order=i)
                    ph.image.name = copy_to_media(img_file, 'projects/photos')
                    ph.save()
            projects[name] = p
        self.stdout.write(self.style.SUCCESS('  OK: Proekty s foto'))

        # ---------- МОНТАЖНИК 1 — Ломов ----------
        installer1, created = Installer.objects.get_or_create(
            last_name='Ломов',
            first_name='Александр',
            patronymic='Петрович',
            defaults={
                'experience_years': 5,
                'skill': skills['Джуниор'],
                'position': positions['Старший монтажник'],
            }
        )
        Installer.objects.filter(pk=installer1.pk).update(
            skill=skills['Джуниор'], position=positions['Старший монтажник']
        )
        if created:
            installer1.photo.name = copy_to_media('logo-mircli.png', 'installers/photos')
            installer1.save()
            installer1.specializations.set([
                specs['Сплит-системы'], specs['Мульти-сплит'],
                specs['VRF системы'], specs['Чиллеры'], specs['Вентиляция'],
            ])
            installer1.projects.set([
                projects['БЦ "Северная Башня"'],
                projects['ТРЦ "Мега Парк"'],
                projects['ЖК "Новые Горизонты"'],
                projects['ЛЦ "Cargo Hub"'],
            ])
            certs1 = [
                ('cert-hvac.png',       'Монтаж кондиционеров (2019)'),
                ('cert-electrical.png', 'Электробезопасность 3 гр. (2020)'),
                ('cert-hvac.png',       'Холодильное оборудование (2021)'),
                ('cert-electrical.png', 'Работы на высоте (2022)'),
            ]
            for img_file, caption in certs1:
                cert = Certificate(installer=installer1, caption=caption)
                cert.photo.name = copy_to_media(img_file, 'installers/certificates')
                cert.save()
            self.stdout.write(self.style.SUCCESS('  OK: Montazhnik Lomov Aleksandr'))
        else:
            self.stdout.write('  SKIP: Lomov (skill/position updated)')

        # ---------- МОНТАЖНИК 2 — Козлов ----------
        installer2, created = Installer.objects.get_or_create(
            last_name='Козлов',
            first_name='Дмитрий',
            patronymic='Николаевич',
            defaults={
                'experience_years': 3,
                'skill': skills['Мидл'],
                'position': positions['Монтажник'],
            }
        )
        Installer.objects.filter(pk=installer2.pk).update(
            skill=skills['Мидл'], position=positions['Монтажник']
        )
        if created:
            installer2.photo.name = copy_to_media('logo-mircli.png', 'installers/photos')
            installer2.save()
            installer2.specializations.set([
                specs['Сплит-системы'], specs['Канальные кондиционеры'],
                specs['Вентиляция'], specs['Обслуживание'],
            ])
            installer2.projects.set([
                projects['ЖК "Лесная Поляна"'],
                projects['Офис "Технопарк"'],
                projects['Склад "Логистик Центр"'],
            ])
            certs2 = [
                ('cert-hvac.png',       'Монтаж кондиционеров (2021)'),
                ('cert-electrical.png', 'Работа на высоте (2022)'),
            ]
            for img_file, caption in certs2:
                cert = Certificate(installer=installer2, caption=caption)
                cert.photo.name = copy_to_media(img_file, 'installers/certificates')
                cert.save()
            self.stdout.write(self.style.SUCCESS('  OK: Montazhnik Kozlov Dmitriy'))
        else:
            self.stdout.write('  SKIP: Kozlov (skill/position updated)')

        # ---------- СТРАНИЦА БРИГАДЫ ----------
        page, created = BrigadePage.objects.get_or_create(
            slug='brigade-247',
            defaults={
                'brigade_number': '247',
                'rating': '4.8',
                'reviews_count': 127,
                'car': car,
            }
        )
        if created:
            page.installers.set([installer1, installer2])
            self.stdout.write(self.style.SUCCESS('  OK: Stranica brigady #247 -> /brigade-247/'))
        else:
            self.stdout.write('  SKIP: Stranica uzhe est')

        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('DONE! http://127.0.0.1:8000/brigade-247/'))
