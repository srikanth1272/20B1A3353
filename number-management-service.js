const express = require('express');
const axios = require('axios');

const app = express();
const port = 8008;

app.get('/numbers', async (req, res) => {
  const urls = req.query.url;

  if (!urls || !Array.isArray(urls)) {
    return res.status(400).json({ error: 'Invalid URLs provided' });
  }

  const np = urls.map(async (url) => {
    try {
      const response = await axios.get(url);
      const data = response.data;

      if (data.numbers && Array.isArray(data.numbers)) {
        return data.numbers;
      } else {
        throw new Error('Invalid JSON structure');
      }
    } catch (error) {
      console.error(`Error fetching data from ${url}: ${error.message}`);
      return [];
    }
  });

  try {
    const num = await Promise.all(np);
    const ans= merge(num);
    const jsonResponse = `{"numbers":[${ans.join(',')}]}`;
    res.set('Content-Type', 'application/json');
    res.send(jsonResponse);
  } catch (error) {
    console.error(`Error processing responses: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

function merge(arrays) {
  const set = new Set();
  const mnum = [];

  arrays.forEach((numArray) => {
    numArray.forEach((num) => {
      if (!set.has(num)) {
        set.add(num);
        sortArray(mnum, num);
      }
    });
  });

  return mnum;
}

function sortArray(arr, num) {
  let i = 0;
  while (i < arr.length && arr[i] < num) {
    i++;
  }
  arr.splice(i, 0, num);
}

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
