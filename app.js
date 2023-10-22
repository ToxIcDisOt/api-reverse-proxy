const express = require('express');
const axios = require('axios');
const cors = require('cors');
const rateLimit = require('express-rate-limit'); // Import the rate limiting package
const app = express();
const port = 3000;

// Use the cors middleware to enable CORS for your app
app.use(cors());

app.use(express.json());

// Apply rate limiting to the route
const limiter = rateLimit({
  windowMs: 100 * 60 * 1000, // 15 minutes
  max: 3700000000, // Max 100 requests per IP in 15 minutes
});

// Apply the rate limiter to your route
app.use('/:word', limiter);

// Define a route to fetch and simplify data from the external API
app.get('/:word', async (req, res) => {
  try {
    const word = req.params.word;
    // Make a request to the external API
    const apiResponse = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    const data = apiResponse.data[0]; // Assuming you want data for the first entry

    // Simplify the data
    const simplifiedData = {
      word,
      definitions: data.meanings.map((meaning) => meaning.definitions.map((def) => def.definition)),
      partOfSpeech: data.meanings.map((meaning) => meaning.partOfSpeech),
      phonetics: data.phonetics.map((phonetic) => phonetic.text),
      synonyms: data.meanings.map((meaning) => meaning.synonyms),
      examples: data.meanings.map((meaning) => meaning.definitions.map((def) => def.example)),
    };

    res.json(simplifiedData);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Error fetching data');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
