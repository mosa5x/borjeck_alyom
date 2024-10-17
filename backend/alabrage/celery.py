
import os
from celery import Celery
from celery.schedules import crontab

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'alabrage.settings')

app = Celery('alabrage')

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django app configs.
app.autodiscover_tasks()

app.conf.timezone = 'Asia/Baghdad'

app.conf.beat_schedule = {
    'scrape-and-process-daily': {
        'task': 'myapp.tasks.scrape_and_process',
        'schedule': crontab(hour=17, minute=5),  # Run at 2:00 AM
    },
}