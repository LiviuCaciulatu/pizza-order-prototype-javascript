const loadEvent = (_) => {
  const root = document.querySelector("#root");

  const fullMenu = document.createElement("div");
  fullMenu.classList.add("full-menu");

  const filter = document.createElement("label");
  filter.setAttribute("for", "allergen-filter");
  filter.classList.add("filter");
  filter.innerText = "Filter by allergen:";

  const select = document.createElement("select");
  select.setAttribute("id", "allergen-filter");
  const allOption = document.createElement("option");
  allOption.setAttribute("value", "");
  allOption.innerText = "All";
  select.appendChild(allOption);
  filter.appendChild(select);

  const btn = document.createElement("button");
  btn.setAttribute("type", "button");
  btn.classList.add("place-order");
  btn.classList.add("btn");
  btn.classList.add("btn-success");
  btn.innerText = "Place Order";

  const form = document.createElement("div");
  form.classList.add("form");

  const placeName = document.createElement("input");
  placeName.setAttribute("type", "text");
  placeName.classList.add("customerName");
  placeName.placeholder = "Name";

  const email = document.createElement("input");
  email.setAttribute("type", "text");
  email.classList.add("email");
  email.placeholder = "e-mail";

  const city = document.createElement("input");
  city.setAttribute("type", "text");
  city.classList.add("city");
  city.placeholder = "Your City";

  const street = document.createElement("input");
  street.setAttribute("type", "text");
  street.classList.add("address");
  street.placeholder = "Your Street";

  const menu = document.createElement("div");
  menu.classList.add("menu");

  fullMenu.appendChild(filter);
  fullMenu.appendChild(btn);
  form.appendChild(placeName);
  form.appendChild(email);
  form.appendChild(city);
  form.appendChild(street);
  fullMenu.appendChild(form);
  fullMenu.appendChild(menu);

  root.appendChild(fullMenu);

  let card = (pizza) => {
    return `
  <div class="card" style="width: 18rem;">
  <img src="${pizza.img}" class="card-img-top" alt="Picture not found">
  <div class="card-body">
    <h5 class="card-title">${pizza.name}</h5>
  </div>
  <ul class="list-group list-group-flush">
    <li class="list-group-item">${pizza.ingredients}</li>
    <li class="list-group-item">${pizza.price} RON</li>
    <li class="list-group-item">${pizza.allergens}</li>
  </ul>
    <div class="card-body">
      <div class="quantity-card">
       <button type="button" class="btn btn-primary less" data-card="${pizza.id}">-</button>
       <div class="quantityClass" id="quantity-${pizza.id}">0</div>
       <button type="button" class="btn btn-primary more" data-card="${pizza.id}">+</button>
       <button type="button" class="btn btn-primary add-to-order" data-card="${pizza.id}">Add to Order</div>
    </div>
    </div>`;
  };


  const pizzaListData = async () => {
    const response = await fetch("/api/pizza");
    const pizzas = await response.json();
    const response2 = await fetch("/api/allergens");
    const allergens = await response2.json();

    pizzas.forEach((pizza) => {
      const allergenNames = pizza.allergens.map((id) => {
        const allergen = allergens.find((a) => a.id === id);
        return allergen ? allergen.name : "";
      });
      const algNames = allergenNames.filter(alg=>alg.length>0)
      pizza.allergens = algNames;
    });

    const allAllergens = [];
    pizzas.forEach((pizza) => {
      pizza.allergens.forEach((allergen) => {
        if (!allAllergens.includes(allergen)) {
          allAllergens.push(allergen);
        }
      });
    });

    const allergenFilter = document.querySelector("#allergen-filter");
    allAllergens.forEach((allergen) => {
      const option = document.createElement("option");
      option.value = allergen.toLowerCase();
      option.textContent = allergen;
      allergenFilter.appendChild(option);
    });

    allergenFilter.addEventListener("change", () => {
      const selectedAllergen = allergenFilter.value;

      const cards = document.querySelectorAll(".card");

      cards.forEach((card) => {
        const allergens = card
          .querySelector(".list-group-item:last-child")
          .textContent.split(",");

        if (allergens.includes(selectedAllergen)) {
          card.classList.add("withAllergen");
        } else {
          card.classList.remove("withAllergen");
        }
      });
    });

    pizzas.forEach((pizza) => {
      menu.insertAdjacentHTML("beforeend", card(pizza));
    });

    document.querySelectorAll(".more, .less").forEach((btn) => {
      btn.addEventListener("click", () => {
        const cardId = btn.dataset.card;

        const quantityEl = document.querySelector(`#quantity-${cardId}`);

        let quantity = parseInt(quantityEl.innerText);

        if (btn.classList.contains("more") && quantity < 99) {
          quantity++;
        }
        if (btn.classList.contains("less") && quantity > 0) {
          quantity--;
        }
        quantityEl.innerText = quantity;
      });
    });

    
    const placeOrder = document.querySelector(".place-order");
    const addToOrder = document.querySelectorAll(".add-to-order")
    const pizzaList = []
    
    addToOrder.forEach((btn)=>{
      btn.addEventListener("click", ()=> {
        const cardId = btn.dataset.card;
        const quantityEl = document.querySelector(`#quantity-${cardId}`);
        let quantity = parseInt(quantityEl.innerText);
        if(quantity!==0){
          pizzaList.push({
            id: cardId,
            amount: quantity
          })
        form.style.visibility="visible"
        console.log(pizzaList)
      } else if (quantity===0){
        const index = pizzaList.findIndex(pizza => pizza.id === cardId);
      pizzaList.splice(index, 1);
      console.log(pizzaList);
      }
      if (pizzaList.length===0){
        form.style.visibility="hidden"
      }
    })
  })
  
  placeOrder.addEventListener("click", () => {
    

    const order = {
      id: "",
      pizzas: [],
      date: {},
      customer: {
        name: "",
        email: "",
        address: {
          city: "",
          street: "",
        },
      },
    };
    order.customer.name = placeName.value;
    order.customer.email = email.value;
    order.customer.address.city = city.value;
    order.customer.address.street = street.value;
    order.pizzas.push(pizzaList)
        if(order.customer.name.length>0&&order.customer.email.length>0)
        fetch("/api/order", {
          method: "POST",
          headers: {
            "Content-Type": "application/json; charset=UTF-8",
          },
          body: JSON.stringify(order),
        })
          .then((response) => response.json())
          .catch((error) => {
            console.error("Error", error);
          });
      });
      
      console.log(order);
    };
  pizzaListData();
};

window.addEventListener("load", loadEvent);
