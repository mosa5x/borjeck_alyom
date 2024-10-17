from rest_framework import serializers
from .models import HoroscopeSign

class HoroscopeSignSerializer(serializers.ModelSerializer):
       class Meta:
           model = HoroscopeSign
           fields = '__all__'