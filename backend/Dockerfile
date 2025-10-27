# Use an official Python runtime as a parent image
FROM python:3.12

# Set the working directory in the container
WORKDIR /app

# System deps (opcjonalnie, jeśli potrzebne np. psycopg[binary] to można pominąć)
# RUN apt-get update && apt-get install -y --no-install-recommends build-essential && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app files
COPY alembic.ini .
COPY server.py .
# Jeśli masz podkatalog z kodem:
COPY app ./app

# Expose the port that the app runs on
EXPOSE 8000

# For dev run (jak w Twoim przykładzie)
CMD ["python", "server.py", "--dev"]
