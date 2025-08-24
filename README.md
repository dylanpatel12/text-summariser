Text Summariser

Overview

This project is a web application that allows users to summarize text or articles from a URL. It provides two modes of summarization:
	•	Extractive (fast): Selects the most important sentences from the text.
	•	Abstractive (LLM): Uses a Hugging Face transformer model to rewrite and condense the text into a human-like summary.

The application also provides additional insights such as keywords, sentiment analysis, word count, and estimated reading time.


How It Actually Works :

1. Frontend (React)
	•	The frontend (App.js) provides a simple interface where users can:
	•	Paste text directly.
	•	Enter a URL to fetch article content.
	•	Choose between extractive or abstractive summarization.
	•	Select summary length (short, medium, long).
	•	The frontend sends a POST request to the backend API with the following payload:

{
  "text": "Sample input text...",
  "mode": "abstractive",
  "length": "medium"
}

or

{
  "url": "https://example.com/article",
  "mode": "extractive",
  "length": "short"
}

	•	Results (summary, keywords, sentiment, etc.) are displayed in a styled UI.



2. Backend (FastAPI)
	•	The backend is built with FastAPI and exposes two main endpoints of the API:
	•	/analyze-text for direct text input.
	•	/analyze-url for fetching and analyzing article content from a URL.
	•	Depending on the mode:
	•	Extractive: Uses rake-nltk and traditional NLP techniques to pick out key sentences.
	•	Abstractive: Calls a Hugging Face transformer model (facebook/bart-large-cnn) via the transformers pipeline to generate a rewritten summary.
	•	Additional features:
	•	Keyword extraction: via RAKE (Rapid Automatic Keyword Extraction).
	•	Sentiment analysis: basic polarity scoring.
	•	Word count and reading time: calculated from input text.



3. Model Integration (Hugging Face Transformers)
	•	The abstractive mode uses the facebook/bart-large-cnn model from Hugging Face.
	•	This model is pre-trained for text summarization and fine-tuned on large datasets.
	•	The backend integrates with Hugging Face via the transformers library:

from transformers import pipeline
summarizer = pipeline("summarization", model="facebook/bart-large-cnn")
summary = summarizer(text, max_length=150, min_length=50, do_sample=False)

	•	Summaries are generated based on the selected length parameter, which adjusts the min_length and max_length.


The Tech Stack: 

Frontend:
	•	React (JavaScript)
	•	CSS for styling

Backend:
	•	FastAPI (Python) - First time using it and it was amazing experience
	•	Uvicorn (server)
	•	Hugging Face Transformers
	•	Torch
	•	Newspaper3k (for article scraping)
	•	NLTK + RAKE-NLTK (keywords)
	•	BeautifulSoup4 + Requests (URL parsing)


Running the Application

Prerequisites
	•	Node.js (for frontend)
	•	Python 3.9+ (for backend)

Install Backend Dependencies terminal commands:

pip install -r requirements.txt

Run Backend

uvicorn main:app --reload

Install Frontend Dependencies

cd frontend
npm install

Run Frontend

npm start

The app should be available at http://........ and will communicate with the backend running on http://.......



Summary

This project combines traditional extractive methods with modern transformer-based abstractive summarization to provide flexible, high-quality summaries. It demonstrates how to link a React frontend with a FastAPI backend and integrate Hugging Face models for natural language processing tasks. I really enjoyed this project it took me 2 weeks in total meaning because a while to wrap my head around eveything especially concepts like the website being on the Local Host and the IP address and the different routes from local host to front end to back end or IP address to front end to back end. It was also a bit tough learning about how things link up with the IP address and then free local ports. I watched a good youtube video to grasp the basics. This was my first time connecting front end with back end and my first time using node.js. I really enjoyed this summer project and I would've like to have worked on improving the project more like the key word finder and a couple of other details but commitments to other projects took my time away.




