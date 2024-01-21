FROM python:3.11-alpine

WORKDIR /app

COPY requirements.txt requirements.txt

RUN pip install -r requirements.txt --no-cache-dir

COPY . .

CMD ["python", "main.py"]
