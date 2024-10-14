const express = require('express');
const fs = require('fs');
const { parse } = require('csv-parse');

const app = express();
const port = 3000;
app.use(express.static('public'));

app.get('/api/bookings', (req, res) => {
  const bookings = [];
  fs.createReadStream('hotel_bookings_1000.csv')
    .pipe(parse({ columns: true }))
    .on('data', (row) => {
      bookings.push(row);
    })
    .on('end', () => {
      res.json(bookings); 
    })
    .on('error', (err) => {
      console.error('Error reading the CSV file:', err);
      res.status(500).send('Error reading the CSV file');
    });
});


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
