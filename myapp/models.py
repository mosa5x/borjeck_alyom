from django.db import models

class HoroscopeSign(models.Model):
    name_ar = models.CharField(max_length=50, unique=True)
    name_en = models.CharField(max_length=50, unique=True)
    symbol = models.CharField(max_length=10)
    date = models.DateField()
    content = models.TextField()
    professional_percentage = models.IntegerField()
    financial_percentage = models.IntegerField()
    emotional_percentage = models.IntegerField()
    health_percentage = models.IntegerField()

    def __str__(self):
        return f"{self.name_en} ({self.name_ar})"