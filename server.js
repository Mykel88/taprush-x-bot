const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const DEFAULT_PAIRING_CODE = "TAPRUSHX";

app.get('/', (req, res) => {
  res.send(`
    <form action="/pair" method="POST">
      <label>Enter WhatsApp Number:</label><br>
      <input name="number" placeholder="e.g. 09165331115" required />
      <button type="submit">Get Pairing Code</button>
    </form>
  `);
});

app.post('/pair', (req, res) => {
  const number = req.body.number;
  // Log it for now (in future: use to trigger WhatsApp message)
  console.log("User wants to pair:", number);
  res.send(`Hello! Your default pairing code is <b>${DEFAULT_PAIRING_CODE}</b><br><br>
  Go to WhatsApp > Linked Devices > Link new device and paste the code.`);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});￼Enter
