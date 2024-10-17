from django.contrib import admin
from .models import HoroscopeSign

@admin.register(HoroscopeSign)
class HoroscopeSignAdmin(admin.ModelAdmin):
    list_display = ('name_en', 'name_ar', 'date')
    fields = ('name_en', 'name_ar', 'symbol', 'date', 'content', 
              'professional_percentage', 'financial_percentage', 
              'emotional_percentage', 'health_percentage',
              'icon_image', 'post_image')