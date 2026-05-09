const express = require('express');
const app = express();
app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'application/pdf');
  res.send(Buffer.from('hello'));
});
const server = app.listen(0, async () => {
  const port = server.address().port;
  const fetch = (await import('node-fetch')).default || require('node-fetch');
  const response = await fetch(`http://localhost:${port}/`);
  console.log('Headers:', response.headers.raw());
  process.exit(0);
});
