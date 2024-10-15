import os
import sys
import django
import pandas as pd
import re
from datetime import datetime

# Add the project directory to the Python path
project_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(project_dir)

# Set up Django environment
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "alabrage.settings")
django.setup()

from myapp.models import HoroscopeSign

def extract_horoscope_data(content):
    zodiac_map = {
        'الحمل': ('Aries', '♈'),
        'الثور': ('Taurus', '♉'),
        'الجوزاء': ('Gemini', '♊'),
        'السرطان': ('Cancer', '♋'),
        'الأسد': ('Leo', '♌'),
        'العذراء': ('Virgo', '♍'),
        'الميزان': ('Libra', '♎'),
        'العقرب': ('Scorpio', '♏'),
        'القوس': ('Sagittarius', '♐'),
        'الجدي': ('Capricorn', '♑'),
        'الدلو': ('Aquarius', '♒'),
        'الحوت': ('Pisces', '♓'),
    }

    horoscopes = []

    for arabic_name, (english_name, symbol) in zodiac_map.items():
        pattern = rf"#{arabic_name}\s*{symbol}(.*?)(#|$)"
        match = re.search(pattern, content, re.DOTALL)
        if match:
            horoscope_text = match.group(1).strip()
            
            # Extract percentages and trim content
            percentages_match = re.search(r'◾النسبة المئوية.*?(\d+)%.*?(\d+)%.*?(\d+)%.*?(\d+)%', horoscope_text, re.DOTALL)
            if percentages_match:
                percentages = percentages_match.groups()
                end_index = horoscope_text.index(percentages_match.group(0)) + len(percentages_match.group(0))
                horoscope_text = horoscope_text[:end_index].strip()
                
                horoscopes.append({
                    'name_ar': arabic_name,
                    'name_en': english_name,
                    'symbol': symbol,
                    'content': horoscope_text,
                    'professional_percentage': int(percentages[0]),
                    'financial_percentage': int(percentages[1]),
                    'emotional_percentage': int(percentages[2]),
                    'health_percentage': int(percentages[3]),
                })

    return horoscopes

def process_horoscopes(csv_file):
    df = pd.read_csv(csv_file)
    
    for _, row in df.iterrows():
        content = row['Content']
        date_str = row['Date']
        
        horoscopes = extract_horoscope_data(content)
        for horoscope in horoscopes:
            date = datetime.strptime(date_str, '%Y-%m-%d %H:%M:%S').date()
            
            HoroscopeSign.objects.update_or_create(
                name_ar=horoscope['name_ar'],
                defaults={
                    'name_en': horoscope['name_en'],
                    'symbol': horoscope['symbol'],
                    'date': date,
                    'content': horoscope['content'],
                    'professional_percentage': horoscope['professional_percentage'],
                    'financial_percentage': horoscope['financial_percentage'],
                    'emotional_percentage': horoscope['emotional_percentage'],
                    'health_percentage': horoscope['health_percentage'],
                }
            )
            print(f"Processed horoscope for {horoscope['name_en']}")

if __name__ == "__main__":
    process_horoscopes('scraped_data.csv')