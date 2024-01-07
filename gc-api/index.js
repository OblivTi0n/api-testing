const express = require('express');
const app = express();
const port = 8080; // You can choose any available port

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}/`);
});
