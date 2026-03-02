from django.shortcuts import render, get_object_or_404
from .models import BrigadePage


def brigade_page(request, slug):
    brigade = get_object_or_404(BrigadePage, slug=slug)
    installers = brigade.installers.prefetch_related(
        'certificates', 'specializations', 'projects', 'projects__photos',
        'skill', 'position',
    ).select_related('skill', 'position').all()
    return render(request, 'core/brigade_page.html', {
        'brigade': brigade,
        'installers': installers,
    })
