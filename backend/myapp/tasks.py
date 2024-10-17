from celery import shared_task
from asgiref.sync import async_to_sync
from telethon import TelegramClient
from telethon.errors import SessionPasswordNeededError
import asyncio
import pandas as pd
from datetime import datetime, timezone, timedelta
import time
import re
from django.apps import apps
from django.conf import settings
import logging
import os
import re
from datetime import datetime
from myapp.models import HoroscopeSign

logger = logging.getLogger(__name__)

# Your API credentials
api_id = '23070779'
api_hash = '4c836dc6445dac64290261600f685eb5'
phone_number = '+9647735875881'

# Scraping parameters
channels = ['A_Nl8']
key_search = ''  # Keyword to search
max_t_index = 1000000  # Maximum number of messages to scrape
time_limit = 6 * 60 * 60  # Timeout in seconds

def remove_unsupported_characters(text):
    valid_xml_chars = (
        "[^\u0009\u000A\u000D\u0020-\uD7FF\uE000-\uFFFD"
        "\U00010000-\U0010FFFF]"
    )
    return re.sub(valid_xml_chars, '', str(text))

async def scrape_channel(client, channel, start_date, end_date):
    data = []
    t_index = 0
    start_time = time.time()

    try:
        entity = await client.get_entity(channel)
    except ValueError:
        logger.error(f"Could not find entity for {channel}. Skipping...")
        return data

    async for message in client.iter_messages(entity, search=key_search):
        if t_index >= max_t_index or time.time() - start_time > time_limit:
            break

        if start_date < message.date <= end_date:
            media = 'True' if message.media else 'False'
            date_time = message.date.strftime('%Y-%m-%d %H:%M:%S')
            cleaned_content = remove_unsupported_characters(message.text)

            data.append({
                'Group': channel,
                'Author ID': message.sender_id,
                'Content': cleaned_content,
                'Date': date_time,
                'Message ID': message.id,
                'Media': media,
            })

            t_index += 1
            if t_index % 100 == 0:  # Log progress every 100 messages
                logger.info(f"Scraped {t_index} messages from {channel}")

        elif message.date < start_date:
            break

    return data

async def main(start_date, end_date):
    client = TelegramClient('the_alabrage_session', api_id, api_hash)
    
    try:
        await client.start()
        logger.info("Client Created")
        # Ensure you're authorized
        if not await client.is_user_authorized():
            await client.send_code_request(phone_number)
            try:
                await client.sign_in(phone_number, input('Enter the code: '))
            except SessionPasswordNeededError:
                await client.sign_in(password=input('Password: '))
        
        all_data = []
        for channel in channels:
            logger.info(f"Scraping channel: {channel}")
            channel_data = await scrape_channel(client, channel, start_date, end_date)
            all_data.extend(channel_data)
            logger.info(f"Finished scraping {channel}. Total messages: {len(channel_data)}")

        df = pd.DataFrame(all_data)
        logger.info("\nSample of scraped data:")
        logger.info(df.head())
        logger.info(f"\nTotal messages scraped: {len(df)}")

        # Save to file
        csv_filename = f'scraped_data_{start_date.date()}.csv'
        df.to_csv(csv_filename, index=False)
        logger.info(f"Data saved to {csv_filename}")

        return csv_filename

    except Exception as e:
        logger.error(f"An error occurred: {e}")
        raise
    finally:
        await client.disconnect()

import re
from datetime import datetime


logger = logging.getLogger(__name__)




def clean_horoscope_content(content):
    # Remove lines starting with ':-' or containing '@'
    lines = content.split('\n')
    cleaned_lines = [line for line in lines if not line.strip().startswith(':-') and '@' not in line]
    return '\n'.join(cleaned_lines).strip()

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
            cleaned_horoscope_text = clean_horoscope_content(horoscope_text)
            logger.debug(f"Found horoscope for {english_name}: {cleaned_horoscope_text[:100]}...")
            
            # Extract percentages with a more flexible pattern
            percentages_match = re.search(r'●مهنيا.*?(\d+).*?●ماليا.*?(\d+).*?●عاطفيا.*?(\d+).*?●صحيا.*?(\d+)', cleaned_horoscope_text, re.DOTALL)
            if percentages_match:
                percentages = percentages_match.groups()
                logger.debug(f"Extracted percentages for {english_name}: {percentages}")
                
                horoscopes.append({
                    'name_ar': arabic_name,
                    'name_en': english_name,
                    'symbol': symbol,
                    'content': cleaned_horoscope_text,
                    'professional_percentage': int(percentages[0]),
                    'financial_percentage': int(percentages[1]),
                    'emotional_percentage': int(percentages[2]),
                    'health_percentage': int(percentages[3]),
                })
            else:
                logger.warning(f"Could not extract percentages for {english_name}. Horoscope text: {cleaned_horoscope_text}")
        else:
            logger.warning(f"Could not find horoscope for {english_name}")

    return horoscopes

def process_horoscopes(csv_file):
    df = pd.read_csv(csv_file)
    
    for _, row in df.iterrows():
        content = row['Content']
        date_str = row['Date']
        
        logger.info(f"Processing content from {date_str}")
        logger.debug(f"Content: {content}")  # Log the full content
        
        horoscopes = extract_horoscope_data(content)
        if horoscopes:
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
                logger.info(f"Processed horoscope for {horoscope['name_en']} on {date}")
        else:
            logger.warning(f"No horoscope data found in message from {date_str}")

@shared_task(name='myapp.tasks.scrape_and_process')
def scrape_and_process():
    logger.info("Starting scrape_and_process task")
    # Ensure Django is fully loaded before accessing models
    if not apps.ready:
        apps.populate(settings.INSTALLED_APPS)
    
    try:
        today = datetime.now(timezone.utc)
        start_date = today.replace(hour=0, minute=0, second=0, microsecond=0)
        end_date = start_date + timedelta(days=1)
        
        logger.info(f"Scraping data from {start_date} to {end_date}")
        
        # Run the scraping process
        csv_filename = async_to_sync(main)(start_date, end_date)
        
        # Process the scraped data
        process_horoscopes(csv_filename)
        
        # Optionally, remove the CSV file after processing
        os.remove(csv_filename)
        logger.info(f"Removed temporary file: {csv_filename}")
        
        logger.info("Finished scrape_and_process task successfully")
    except Exception as e:
        logger.error(f"An error occurred during scrape_and_process: {str(e)}")
        raise  # Re-raise the exception so Celery knows the task failed