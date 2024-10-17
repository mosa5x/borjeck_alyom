from rest_framework import viewsets
from .models import HoroscopeSign
from .serializers import HoroscopeSignSerializer

class HoroscopeSignViewSet(viewsets.ModelViewSet):
       queryset = HoroscopeSign.objects.all()
       serializer_class = HoroscopeSignSerializer
# Create your views here.