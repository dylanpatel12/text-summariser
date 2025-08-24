# app.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from nltk.tokenize import sent_tokenize, word_tokenize
from nltk.corpus import stopwords
from collections import Counter
import nltk
import requests
from bs4 import BeautifulSoup
from typing import List

# NLTK downloads
nltk.download('punkt')
nltk.download('stopwords')

app = FastAPI()

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://192.168.1.83:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Input models
class TextInput(BaseModel):
    text: str
    mode: str = "extractive"
    length: str = "medium"

class URLInput(BaseModel):
    url: str
    mode: str = "extractive"
    length: str = "medium"

stop_words = set(stopwords.words('english'))

# Extractive summarizer
def summarize_text(text, n_sentences=2):
    sentences = sent_tokenize(text)
    if len(sentences) <= n_sentences:
        return text
    words = word_tokenize(text.lower())
    words = [w for w in words if w.isalnum() and w not in stop_words]
    freq = Counter(words)
    sentence_scores = {}
    for s in sentences:
        s_words = word_tokenize(s.lower())
        score = sum(freq.get(w, 0) for w in s_words)
        sentence_scores[s] = score
    top_sentences = sorted(sentence_scores, key=sentence_scores.get, reverse=True)[:n_sentences]
    return " ".join(top_sentences)

# Simple keyword extraction
def extract_keywords(text, n=5):
    words = [w for w in word_tokenize(text.lower()) if w.isalnum() and w not in stop_words]
    freq = Counter(words)
    return [word for word, _ in freq.most_common(n)]

# Dummy sentiment (positive/negative/neutral based on simple words)
def analyze_sentiment(text):
    text_lower = text.lower()
    if any(w in text_lower for w in ["good","happy","great","love","excellent"]):
        return "positive"
    elif any(w in text_lower for w in ["bad","sad","terrible","hate","awful"]):
        return "negative"
    else:
        return "neutral"

# Root route
@app.get("/")
def read_root():
    return {"message": "AI Summarizer API running- Dylans"}

# Analyze text
@app.post("/analyze-text")
def analyze_text(data: TextInput):
    text = data.text
    length_map = {"short": 1, "medium": 2, "long": 4}
    n_sentences = length_map.get(data.length, 2)
    summary = summarize_text(text, n_sentences=n_sentences)
    keywords = extract_keywords(text)
    sentiment = analyze_sentiment(text)
    word_count = len(text.split())
    reading_time = round(word_count / 200, 2)  # 200 wpm
    return {
        "summary": summary,
        "keywords": keywords,
        "sentiment": sentiment,
        "word_count": word_count,
        "reading_time_minutes": reading_time
    }

# Analyze URL
@app.post("/analyze-url")
def analyze_url(data: URLInput):
    try:
        resp = requests.get(data.url)
        soup = BeautifulSoup(resp.text, "html.parser")
        paragraphs = soup.find_all("p")
        text = " ".join(p.get_text() for p in paragraphs)
        if not text.strip():
            return {"error": "No text found on URL"}
        length_map = {"short": 1, "medium": 2, "long": 4}
        n_sentences = length_map.get(data.length, 2)
        summary = summarize_text(text, n_sentences=n_sentences)
        keywords = extract_keywords(text)
        sentiment = analyze_sentiment(text)
        word_count = len(text.split())
        reading_time = round(word_count / 200, 2)
        return {
            "summary": summary,
            "keywords": keywords,
            "sentiment": sentiment,
            "word_count": word_count,
            "reading_time_minutes": reading_time
        }
    except Exception as e:
        return {"error": str(e)}
