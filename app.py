from flask import Flask, request, render_template_string
import pandas as pd
import re

app = Flask(__name__)

# Load the CSV file
data = pd.read_csv('/content/my 3mtt september hate speeh detection.csv')

# Function to clean and tokenize text
def tokenize(text):
    if isinstance(text, str):
        return re.findall(r'\b\w+\b', text.lower())
    else:
        return []  # Return an empty list if the text is not a string

# Function to calculate match percentage
def calculate_match_percentage(comment_tokens, comparison_tokens):
    match_count = sum(1 for token in comment_tokens if token in comparison_tokens)
    return (match_count / len(comparison_tokens)) * 100 if comparison_tokens else 0

# Function to classify comments based on match percentage
def classify_comment(comment, hate_speech_data):
    comment_tokens = tokenize(comment)
    for index, row in hate_speech_data.iterrows():
        hate_speech_tokens = tokenize(row['Hate Speech'])
        offensive_tokens = tokenize(row['Offensive language'])
        
        # Calculate match percentages for hate speech and offensive language
        hate_speech_match = calculate_match_percentage(comment_tokens, hate_speech_tokens)
        offensive_match = calculate_match_percentage(comment_tokens, offensive_tokens)
        
        # Determine classification based on thresholds
        if len(hate_speech_tokens) == 1 and hate_speech_match >= 95:
            return 'Hate Speech'
        elif len(hate_speech_tokens) == 2 and hate_speech_match >= 90:
            return 'Hate Speech'
        elif len(hate_speech_tokens) == 3 and hate_speech_match >= 80:
            return 'Hate Speech'
        elif len(hate_speech_tokens) == 4 and hate_speech_match >= 70:
            return 'Hate Speech'
        elif len(hate_speech_tokens) >= 5 and hate_speech_match >= 50:
            return 'Hate Speech'
        elif len(offensive_tokens) == 1 and offensive_match >= 95:
            return 'Offensive'
        elif len(offensive_tokens) == 2 and offensive_match >= 90:
            return 'Offensive'
        elif len(offensive_tokens) == 3 and offensive_match >= 80:
            return 'Offensive'
        elif len(offensive_tokens) == 4 and offensive_match >= 70:
            return 'Offensive'
        elif len(offensive_tokens) >= 5 and offensive_match >= 50:
            return 'Offensive'
    
    return 'Neutral'

@app.route("/", methods=["GET", "POST"])
def index():
    classification = ""
    
    if request.method == "POST":
        user_comment = request.form.get("comment")
        classification = classify_comment(user_comment, data)
    
    return render_template_string("""
        <html>
            <head>
                <title>Comment Classification</title>
            </head>
            <body>
                <h1>Enter a comment to classify</h1>
                <form method="POST">
                    <textarea name="comment" rows="4" cols="50"></textarea><br><br>
                    <input type="submit" value="Classify">
                </form>
                {% if classification %}
                    <h2>Classification: {{ classification }}</h2>
                {% endif %}
            </body>
        </html>
    """, classification=classification)

if __name__ == "__main__":
    app.run(debug=True)
