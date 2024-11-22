const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// Serve static files (index.html) from the root directory
app.use(express.static(path.join(__dirname)));

// Middleware to parse JSON body
app.use(express.json());

// Function to load the CSV file (this assumes the CSV is formatted as a JSON object)
function loadCSV(filePath) {
  const rawData = fs.readFileSync(filePath, 'utf8');
  const lines = rawData.split('\n').map(line => line.split(','));
  const headers = lines[0];
  return lines.slice(1).map(line => {
    let obj = {};
    line.forEach((value, index) => {
      obj[headers[index]] = value;
    });
    return obj;
  });
}

// Function to clean and tokenize text
function tokenize(text) {
  if (typeof text === 'string') {
    return text.toLowerCase().match(/\b\w+\b/g) || [];
  }
  return [];
}

// Function to calculate match percentage
function calculateMatchPercentage(commentTokens, comparisonTokens) {
  let matchCount = commentTokens.filter(token => comparisonTokens.includes(token)).length;
  return comparisonTokens.length > 0 ? (matchCount / comparisonTokens.length) * 100 : 0;
}

// Function to classify comments based on match percentage
function classifyComment(comment, hateSpeechData) {
  const commentTokens = tokenize(comment);
  
  for (let row of hateSpeechData) {
    const hateSpeechTokens = tokenize(row['Hate Speech']);
    const offensiveTokens = tokenize(row['Offensive language']);

    // Calculate match percentages for hate speech and offensive language
    const hateSpeechMatch = calculateMatchPercentage(commentTokens, hateSpeechTokens);
    const offensiveMatch = calculateMatchPercentage(commentTokens, offensiveTokens);

    // Determine classification based on thresholds
    if (hateSpeechTokens.length === 1 && hateSpeechMatch >= 95) {
      return 'Hate Speech';
    } else if (hateSpeechTokens.length === 2 && hateSpeechMatch >= 90) {
      return 'Hate Speech';
    } else if (hateSpeechTokens.length === 3 && hateSpeechMatch >= 80) {
      return 'Hate Speech';
    } else if (hateSpeechTokens.length === 4 && hateSpeechMatch >= 70) {
      return 'Hate Speech';
    } else if (hateSpeechTokens.length >= 5 && hateSpeechMatch >= 50) {
      return 'Hate Speech';
    } else if (offensiveTokens.length === 1 && offensiveMatch >= 95) {
      return 'Offensive';
    } else if (offensiveTokens.length === 2 && offensiveMatch >= 90) {
      return 'Offensive';
    } else if (offensiveTokens.length === 3 && offensiveMatch >= 80) {
      return 'Offensive';
    } else if (offensiveTokens.length === 4 && offensiveMatch >= 70) {
      return 'Offensive';
    } else if (offensiveTokens.length >= 5 && offensiveMatch >= 50) {
      return 'Offensive';
    }
  }
  return 'Neutral';
}

// Load hate speech data
const hateSpeechData = loadCSV(path.join(__dirname, 'hate_speech_data.csv'));

// POST endpoint to classify comment
app.post('/classify', (req, res) => {
  const { comment } = req.body;
  const result = classifyComment(comment, hateSpeechData);
  res.json({ classification: result });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
