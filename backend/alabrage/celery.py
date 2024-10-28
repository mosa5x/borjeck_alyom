import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'alabrage.settings')

app = Celery('alabrage')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

app.conf.timezone = 'Asia/Baghdad'

app.conf.beat_schedule = {
    'first-scrape': {
        'task': 'myapp.tasks.first_scrape',
        'schedule': crontab(hour=0, minute=27),  # 1:10 AM Baghdad time
    },
    'second-scrape': {
        'task': 'myapp.tasks.second_scrape',
        'schedule': crontab(hour=4, minute=0),   # 4:00 AM Baghdad time
    },
    'third-scrape': {
        'task': 'myapp.tasks.third_scrape',
        'schedule': crontab(hour=8, minute=10),  # 8:10 AM Baghdad time
    },
}