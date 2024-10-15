# Generated by Django 5.1.2 on 2024-10-15 08:40

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='HoroscopeSign',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name_ar', models.CharField(max_length=50, unique=True)),
                ('name_en', models.CharField(max_length=50, unique=True)),
                ('symbol', models.CharField(max_length=10)),
                ('date', models.DateField()),
                ('content', models.TextField()),
                ('professional_percentage', models.IntegerField()),
                ('financial_percentage', models.IntegerField()),
                ('emotional_percentage', models.IntegerField()),
                ('health_percentage', models.IntegerField()),
            ],
        ),
    ]
