const express = require('express')
const app = express()
const sqlite3 = require('sqlite3')
const bodyParser = require('body-parser')

const database = "database.sqlite"

// BodyParser Config
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

// GET Usuario que se qualifica com as requisições
app.get('/api/:start_date/:end_date', (req, res) => {
  // Connect to database
  const db = new sqlite3.Database(database);

  db.all(`SELECT usuario.nome, usuario.id, compras.data_compra 
          FROM usuario JOIN compras ON compras.id_usuario = usuario.id 
          WHERE(
            compras.id IN(
                SELECT item_compra.id_compra FROM item_compra
                JOIN produtos ON produtos.id = item_compra.id_produto
                GROUP BY item_compra.id_compra HAVING SUM(price)>=30
            ) 
            AND compras.id IN(
                    SELECT item_compra.id_compra FROM item_compra
                    JOIN produtos ON produtos.id = item_compra.id_produto
                    WHERE produtos.nome LIKE '%Leite%'
                    GROUP BY item_compra.id_compra HAVING COUNT(*)>=3
            ) 
            AND (
              compras.data_compra >= '${req.params.start_date}' 
              AND compras.data_compra <= '${req.params.end_date}'
            )
          )`, 
      (err, row) => {
    if (!row) {
      res.status(404).send({error: "Not Found!"})
      throw err
    } else {
      res.status(200).json(row)
      console.log(row)
    }
  })

  db.close();
})

app.listen(3000);