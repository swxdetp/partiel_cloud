const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Sert les fichiers statiques depuis le dossier actuel
app.use(express.static(path.join(__dirname)));

app.listen(port, () => {
  console.log(`App running at http://localhost:${port}`);
});
