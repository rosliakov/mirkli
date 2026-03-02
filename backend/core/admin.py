from django.contrib import admin
from django.utils.html import format_html
from .models import (
    Car, Specialization, Position, Skill,
    Project, ProjectPhoto, Installer, Certificate, BrigadePage,
)


@admin.register(Car)
class CarAdmin(admin.ModelAdmin):
    list_display = ('name', 'number', 'country_flag_preview', 'comment')
    search_fields = ('name', 'number')

    def country_flag_preview(self, obj):
        if obj.country_flag:
            return format_html('<img src="{}" style="height:20px;"/>', obj.country_flag.url)
        return '—'
    country_flag_preview.short_description = 'Флаг'


@admin.register(Specialization)
class SpecializationAdmin(admin.ModelAdmin):
    list_display = ('name',)


@admin.register(Position)
class PositionAdmin(admin.ModelAdmin):
    list_display = ('name',)


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ('name',)


class ProjectPhotoInline(admin.TabularInline):
    model = ProjectPhoto
    extra = 1
    fields = ('image', 'order', 'preview')
    readonly_fields = ('preview',)

    def preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="height:60px;border-radius:4px;"/>', obj.image.url)
        return '—'
    preview.short_description = 'Превью'


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'description', 'cover_preview', 'photos_count')
    search_fields = ('name',)
    inlines = [ProjectPhotoInline]

    def cover_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="height:50px;border-radius:4px;"/>', obj.image.url)
        return '—'
    cover_preview.short_description = 'Обложка'

    def photos_count(self, obj):
        count = obj.photos.count()
        return count if count else '—'
    photos_count.short_description = 'Фото в галерее'


class CertificateInline(admin.TabularInline):
    model = Certificate
    extra = 1
    fields = ('photo', 'caption', 'preview')
    readonly_fields = ('preview',)

    def preview(self, obj):
        if obj.photo:
            return format_html('<img src="{}" style="height:60px;"/>', obj.photo.url)
        return '—'
    preview.short_description = 'Превью'


@admin.register(Installer)
class InstallerAdmin(admin.ModelAdmin):
    list_display = ('last_name', 'first_name', 'patronymic', 'position', 'skill', 'experience_years', 'photo_preview')
    list_filter = ('skill', 'position')
    search_fields = ('last_name', 'first_name', 'patronymic')
    filter_horizontal = ('specializations', 'projects')
    inlines = [CertificateInline]

    fieldsets = (
        ('Личные данные', {
            'fields': ('last_name', 'first_name', 'patronymic', 'photo'),
        }),
        ('Профессиональные данные', {
            'fields': ('position', 'skill', 'experience_years'),
        }),
        ('Специализации и проекты', {
            'fields': ('specializations', 'projects'),
        }),
    )

    def photo_preview(self, obj):
        if obj.photo:
            return format_html('<img src="{}" style="height:50px;border-radius:4px;"/>', obj.photo.url)
        return '—'
    photo_preview.short_description = 'Фото'


@admin.register(BrigadePage)
class BrigadePageAdmin(admin.ModelAdmin):
    list_display = ('brigade_number', 'slug', 'rating', 'reviews_count', 'car')
    search_fields = ('brigade_number', 'slug')
    filter_horizontal = ('installers',)

    fieldsets = (
        ('Основное', {
            'fields': ('slug', 'brigade_number', 'rating', 'reviews_count'),
        }),
        ('Состав бригады', {
            'fields': ('car', 'installers'),
        }),
    )
