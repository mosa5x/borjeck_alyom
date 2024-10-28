from django.db import models

class HoroscopeSign(models.Model):
    name_ar = models.CharField(max_length=50, unique=True)
    name_en = models.CharField(max_length=50, unique=True)
    symbol = models.CharField(max_length=10)
    date = models.DateField()
    content = models.TextField()
    professional_percentage = models.IntegerField(null=True)
    financial_percentage = models.IntegerField(null=True)
    emotional_percentage = models.IntegerField(null=True)
    health_percentage = models.IntegerField(null=True)
    icon_image = models.ImageField(upload_to='horoscope_images/', null=True, blank=True)
    post_image = models.ImageField(upload_to='horoscope_images/', null=True, blank=True)
    characteristics_of_thehorscope = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"{self.name_en} ({self.name_ar})"