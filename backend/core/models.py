from django.db import models


class Car(models.Model):
    name = models.CharField('Название', max_length=200)
    comment = models.CharField('Комментарий', max_length=500)
    image = models.ImageField('Фото автомобиля', upload_to='cars/', blank=True, null=True)
    country_flag = models.ImageField('Флаг страны', upload_to='flags/', blank=True, null=True)
    number = models.CharField('Номер автомобиля', max_length=20)

    class Meta:
        verbose_name = 'Автомобиль'
        verbose_name_plural = 'Автомобили'

    def __str__(self):
        return f'{self.name} ({self.number})'


class Specialization(models.Model):
    name = models.CharField('Название специализации', max_length=200)

    class Meta:
        verbose_name = 'Специализация'
        verbose_name_plural = 'Специализации'

    def __str__(self):
        return self.name


class Position(models.Model):
    name = models.CharField('Название должности', max_length=200)

    class Meta:
        verbose_name = 'Должность'
        verbose_name_plural = 'Должности'

    def __str__(self):
        return self.name


class Skill(models.Model):
    name = models.CharField('Название скилла', max_length=100)

    class Meta:
        verbose_name = 'Скилл'
        verbose_name_plural = 'Скиллы'

    def __str__(self):
        return self.name


class Project(models.Model):
    name = models.CharField('Название проекта', max_length=300)
    description = models.CharField('Краткое описание', max_length=300, blank=True)
    image = models.ImageField('Обложка (превью)', upload_to='projects/', blank=True, null=True)

    class Meta:
        verbose_name = 'Проект'
        verbose_name_plural = 'Проекты'

    def __str__(self):
        return self.name


class ProjectPhoto(models.Model):
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name='photos',
        verbose_name='Проект',
    )
    image = models.ImageField('Фото', upload_to='projects/photos/')
    order = models.PositiveSmallIntegerField('Порядок', default=0)

    class Meta:
        ordering = ['order', 'id']
        verbose_name = 'Фото проекта'
        verbose_name_plural = 'Фотографии проекта'

    def __str__(self):
        return f'{self.project.name} — фото #{self.order or self.pk}'


class Installer(models.Model):
    last_name = models.CharField('Фамилия', max_length=100)
    first_name = models.CharField('Имя', max_length=100)
    patronymic = models.CharField('Отчество', max_length=100, blank=True)
    photo = models.ImageField('Фотография', upload_to='installers/photos/')
    experience_years = models.PositiveIntegerField('Лет опыта')
    skill = models.ForeignKey(
        Skill,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name='Скилл',
        related_name='installers',
    )
    position = models.ForeignKey(
        Position,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name='Должность',
        related_name='installers',
    )
    specializations = models.ManyToManyField(
        Specialization,
        verbose_name='Специализации',
        blank=True,
    )
    projects = models.ManyToManyField(
        Project,
        verbose_name='Опыт работы (проекты)',
        blank=True,
    )

    class Meta:
        verbose_name = 'Монтажник'
        verbose_name_plural = 'Монтажники'

    def __str__(self):
        return f'{self.last_name} {self.first_name} {self.patronymic}'.strip()


class Certificate(models.Model):
    installer = models.ForeignKey(
        Installer,
        on_delete=models.CASCADE,
        related_name='certificates',
        verbose_name='Монтажник',
    )
    photo = models.ImageField('Фото сертификата', upload_to='installers/certificates/')
    caption = models.CharField('Подпись', max_length=300)

    class Meta:
        verbose_name = 'Сертификат'
        verbose_name_plural = 'Сертификаты'

    def __str__(self):
        return f'{self.installer} — {self.caption}'


class BrigadePage(models.Model):
    slug = models.SlugField('Уникальная ссылка', unique=True, max_length=100)
    brigade_number = models.CharField('Номер бригады', max_length=50)
    rating = models.DecimalField('Рейтинг', max_digits=3, decimal_places=1)
    reviews_count = models.PositiveIntegerField('Количество отзывов')
    car = models.ForeignKey(
        Car,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name='Автомобиль',
    )
    installers = models.ManyToManyField(
        Installer,
        verbose_name='Монтажники',
    )

    class Meta:
        verbose_name = 'Страница бригады'
        verbose_name_plural = 'Страницы бригад'

    def __str__(self):
        return f'Бригада №{self.brigade_number} ({self.slug})'
