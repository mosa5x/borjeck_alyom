# Use an official Python runtime as a parent image
FROM python:3.9

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set work directory
WORKDIR /code

# Set time zone
ENV TZ=Asia/Baghdad
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Upgrade pip and install dependencies
COPY requirements.txt /code/
RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . /code/

# Set Python path
ENV PYTHONPATH=/code

# Run the application
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]