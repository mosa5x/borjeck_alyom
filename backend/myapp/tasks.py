from celery import shared_task
from asgiref.sync import async_to_sync
from telethon import TelegramClient
from telethon.errors import SessionPasswordNeededError
import asyncio
import pandas as pd
from datetime import datetime, timedelta
import time
import re
from django.apps import apps
from django.conf import settings
from django.utils import timezone
import logging
import os
from myapp.models import HoroscopeSign

logger = logging.getLogger(__name__)

# API credentials
api_id = '23070779'
api_hash = '4c836dc6445dac64290261600f685eb5'
phone_number = '+9647735875881'

# Scraping parameters
channels = ['A_Nl8']
key_search = ''  # Keyword to search
max_t_index = 1000000  # Maximum number of messages to scrape
time_limit = 6 * 60 * 60  # Timeout in seconds (6 hours)

def remove_unsupported_characters(text):
    valid_xml_chars = (
        "[^\u0009\u000A\u000D\u0020-\uD7FF\uE000-\uFFFD"
        "\U00010000-\U0010FFFF]"
    )
    return re.sub(valid_xml_chars, '', str(text))

def clean_horoscope_content(content):
    # Remove lines starting with ':-' or containing '@' or 'TELE' or 'http'
    lines = content.split('\n')
    cleaned_lines = [line for line in lines if not (
        line.strip().startswith(':-') or 
        '@' in line or 
        'TELE' in line or 
        'http' in line or
        'لطلب التمويل' in line
    )]
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
            
            # Try both patterns for percentages
            percentages_match = re.search(
                r'[●◾]مهنيا.*?(\d+).*?[●◾]ماليا.*?(\d+).*?[●◾]عاطفيا.*?(\d+)(?:.*?[●◾]صحيا.*?(\d+))?|'
                r'مهنيا%(\d+).*?ماليا%(\d+).*?عاطفيا%(\d+)(?:.*?صحيا%(\d+))?',
                cleaned_horoscope_text, 
                re.DOTALL
            )
            
            if percentages_match:
                # Get all groups and use the first non-None set
                groups = percentages_match.groups()
                if groups[0] is not None:
                    percentages = groups[:4]
                else:
                    percentages = groups[4:]
                
                logger.debug(f"Extracted percentages for {english_name}: {percentages}")
                
                # Handle case where health percentage is not present
                health_percentage = int(percentages[3]) if percentages[3] is not None else None
                
                horoscopes.append({
                    'name_ar': arabic_name,
                    'name_en': english_name,
                    'symbol': symbol,
                    'content': cleaned_horoscope_text,
                    'professional_percentage': int(percentages[0]),
                    'financial_percentage': int(percentages[1]),
                    'emotional_percentage': int(percentages[2]),
                    'health_percentage': health_percentage,
                })
            else:
                logger.warning(f"Could not extract percentages for {english_name}. Horoscope text: {cleaned_horoscope_text}")
        else:
            logger.warning(f"Could not find horoscope for {english_name}")

    return horoscopes

def clean_horoscope_content(content):
    # Remove unwanted content
    lines = content.split('\n')
    cleaned_lines = [line for line in lines if not (
        line.strip().startswith(':-') or 
        '@' in line or 
        'TELE' in line or 
        'http' in line or
        'لطلب التمويل' in line or
        line.strip() == ''  # Remove empty lines
    )]
    return '\n'.join(cleaned_lines).strip()

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
        # Convert message date to Baghdad timezone
        message_date = message.date.astimezone(timezone.get_current_timezone())
        
        if t_index >= max_t_index or time.time() - start_time > time_limit:
            break

        if start_date < message_date <= end_date:
            media = 'True' if message.media else 'False'
            date_time = message_date.strftime('%Y-%m-%d %H:%M:%S')
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
            if t_index % 100 == 0:
                logger.info(f"Scraped {t_index} messages from {channel}")

        elif message_date < start_date:
            break

    return data

async def main(start_date, end_date):
    client = TelegramClient('the_alabrage_session', api_id, api_hash)
    
    try:
        await client.start()
        logger.info("Client Created")
        
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
        if not df.empty:
            logger.info("\nSample of scraped data:")
            logger.info(df.head())
            logger.info(f"\nTotal messages scraped: {len(df)}")

            csv_filename = f'scraped_data_{start_date.date()}.csv'
            df.to_csv(csv_filename, index=False)
            logger.info(f"Data saved to {csv_filename}")
            return csv_filename
        else:
            logger.warning("No data was scraped")
            return None

    except Exception as e:
        logger.error(f"An error occurred: {e}")
        raise
    finally:
        await client.disconnect()

def process_horoscopes(csv_file):
    if not csv_file or not os.path.exists(csv_file):
        logger.error("CSV file does not exist")
        return False

    df = pd.read_csv(csv_file)
    success = False
    
    for _, row in df.iterrows():
        content = row['Content']
        date_str = row['Date']
        
        logger.info(f"Processing content from {date_str}")
        
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
                success = True

    return success

@shared_task(name='myapp.tasks.first_scrape')
def first_scrape():
    logger.info("Starting first scrape attempt at 1:10 AM")
    
    try:
        # Get current time in Baghdad timezone
        now = timezone.localtime()
        start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
        end_date = start_date + timedelta(days=1)
        
        # Run the scraping process
        csv_filename = async_to_sync(main)(start_date, end_date)
        
        if csv_filename:
            # Process the horoscopes and check success
            if process_horoscopes(csv_filename):
                logger.info("First scrape successful, setting flag to skip later scrapes")
                from django.core.cache import cache
                cache.set('successful_scrape_today', True, 24*60*60)  # expires in 24 hours
                
                # Clean up
                os.remove(csv_filename)
                return True
        
        logger.info("First scrape didn't find data, will try second scrape")
        return False
        
    except Exception as e:
        logger.error(f"Error in first scrape: {str(e)}")
        return False

@shared_task(name='myapp.tasks.second_scrape')
def second_scrape():
    from django.core.cache import cache
    
    if cache.get('successful_scrape_today'):
        logger.info("Skipping second scrape as first scrape was successful")
        return True
    
    logger.info("Starting second scrape attempt at 4:00 AM")
    
    try:
        now = timezone.localtime()
        start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
        end_date = start_date + timedelta(days=1)
        
        csv_filename = async_to_sync(main)(start_date, end_date)
        
        if csv_filename:
            if process_horoscopes(csv_filename):
                logger.info("Second scrape successful, setting flag to skip third scrape")
                cache.set('successful_scrape_today', True, 24*60*60)
                os.remove(csv_filename)
                return True
        
        logger.info("Second scrape didn't find data, will try third scrape")
        return False
        
    except Exception as e:
        logger.error(f"Error in second scrape: {str(e)}")
        return False

@shared_task(name='myapp.tasks.third_scrape')
def third_scrape():
    from django.core.cache import cache
    
    if cache.get('successful_scrape_today'):
        logger.info("Skipping third scrape as previous scrape was successful")
        return True
    
    logger.info("Starting final scrape attempt at 8:10 AM")
    
    try:
        now = timezone.localtime()
        start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
        end_date = start_date + timedelta(days=1)
        
        csv_filename = async_to_sync(main)(start_date, end_date)
        
        if csv_filename:
            if process_horoscopes(csv_filename):
                logger.info("Third scrape successful")
                os.remove(csv_filename)
                return True
            
        logger.warning("All scraping attempts failed to find data today")
        return False
        
    except Exception as e:
        logger.error(f"Error in third scrape: {str(e)}")
        return False