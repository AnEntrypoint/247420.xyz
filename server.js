require('./index.js')

const express = require('express')
const app = express()
const port = process.env.port||8082

app.get('/', (req, res) => res.redirect('./index.html'))

app.use(express.static('./dist/client'))

app.listen(port, () =>
  console.log(`Example app listening at http://localhost:${port}`)
)
