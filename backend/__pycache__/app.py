from fastapi import FastAPI
from pydantic import BaseModel
from nltk.tokenize import sent_tokenize, word_tokenize
from nltk.corpus import stopwords
from collections import Counter
import nltk

# Download NLTK data
nltk.download('punkt')
nltk.download('stopwords')

app = FastAPI()

# Input model
class TextInput(BaseModel):
    text: str

stop_words = set(stopwords.words('english'))

# Summariser function
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
        score = sum(freq.get(w,0) for w in s_words)
        sentence_scores[s] = score
    top_sentences = sorted(sentence_scores, key=sentence_scores.get, reverse=True)[:n_sentences]
    return " ".join(top_sentences)

# Root route
@app.get("/")
def read_root():
    return {"message": "Revision Assistant API is running 🚀"}

# Analyze text
@app.post("/analyze-text")
def analyze_text(data: TextInput):
    text = data.text
    summary = summarize_text(text, n_sentences=2)
    word_count = len(text.split())
    return {"word_count": word_count, "summary": summary, "original_text": text}


