const express = require("express");
const fs = require("fs");
const dataRoute = "./pkgs.json";
const jsonData = fs.readFileSync(dataRoute);
const data = JSON.parse(jsonData);
const path = require("path");
const filePath = path.join(`${__dirname}/pkgs.json`);
const fileReaderAsync = require("./fileReader");

const app = express();
const port = 9000;


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + "/../frontend/public"));

app.get("/", (req, res) => {
  res.send("Welcome to PizzaExtra");
});

app.get("/favicon.ico", (req, res) => res.status(204));

app.get("/api/pizza", async (req, res) => {
  const fileData = await fileReaderAsync(filePath);
  const data = JSON.parse(fileData.toString());
  res.json(data.pizza);
});

app.get("/api/allergens", async (req, res) => {
  const fileData = await fileReaderAsync(filePath);
  const data = JSON.parse(fileData.toString());
  res.json(data.allergens);
  //console.log(fileData.toString());
});

app.get("/pizza/list", (req, res) => {
  res.sendFile(path.join(`${__dirname}/../frontend/index.html`));
});

app.get("/pizza/listElement", async (req, res, next) => {
  const fileData = await fileReaderAsync(filePath);
  const data = await JSON.parse(fileData);
  const allergens = req.query.allergens;
  let filteredPizzas = [...data.pizza];
  if (allergens) {
    const allergenIds = allergens.split(",").map((id) => parseInt(id));
    filteredPizzas = data.pizza.filter((pizza) =>
      pizza.allergens.some((allergen) => allergenIds.includes(allergen))
    );
  }
  res.send(
    JSON.stringify({ pizzas: filteredPizzas, allergens: data.allergens })
  );
});

const orders = [];
let orderId = 1;

app.get("/api/order", (req, res)=>{
  res.json(orders);
});


app.post("/api/order", (req, res)=>{
  const now = new Date();
  const order = {
    id: orderId++,
    pizzas: req.body.pizzas,
    date: {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
      hour: now.getHours(),
      minute: now.getMinutes()
    },
    customer: req.body.customer
  };
  orders.push(order);
  res.status(201).json(order);
});

app.listen(port, (_) => console.log(`http://127.0.0.1:${port}`));
