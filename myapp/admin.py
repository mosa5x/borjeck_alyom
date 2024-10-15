from django.contrib import admin
from .models import HoroscopeSign

@admin.register(HoroscopeSign)
class HoroscopeSignAdmin(admin.ModelAdmin):
    list_display = ('name_en', 'name_ar', 'symbol', 'date', 'professional_percentage', 'financial_percentage', 'emotional_percentage', 'health_percentage')
    list_filter = ('date',)
    search_fields = ('name_en', 'name_ar')
    list_editable = ('professional_percentage', 'financial_percentage', 'emotional_percentage', 'health_percentage')
    date_hierarchy = 'date'
    ordering = ('-date',)