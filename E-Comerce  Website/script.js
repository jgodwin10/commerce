const cartBtn = document.querySelector('.car')
const closeCartBtn = document.querySelector('.close-cart')
const clearCartBtn = document.querySelector('.clear-cart')
const cartDOM = document.querySelector('.cart')
const cartOverlay = document.querySelector('.cart-overlay')
const cartItemss = document.querySelector('.car-num')
const cartTotal = document.querySelector('.cart-total')
const cartContent = document.querySelector('.cart-content')
const productsDOM = document.querySelector('.products');

let cart = [];
let buttons = [];

class Products{
 async getProducts(){
    try {
      let response = await fetch('products.json')
      let data = await response.json();
      let products = data.items;

      let product = products.map(item => {
        const {title, price} = item.fields;
        const {id} = item.sys;
        const image = item.fields.image.fields.file.url;
        return {title, id, image, price}
      })
      return product;
    } catch (error) {
      console.log(error);
    }
  }

  
  
}

class Ui{

  displayProducts(product){
    let result = '';
  
    product.forEach(item => {
      result += `<div class="pros">
      <div class="pro">
        <img src=${item.image} alt="">
        <button class="bag-btn" data-id=${item.id}><i class="fas fa-shopping-cart"></i>
        Add to bag
        </button>
      </div>
      <p>${item.title}</p>
        <span>$${item.price}</span>
  </div>`
    })
  
    productsDOM.innerHTML = result;
  }

  getButtons(){
    const button = [...document.querySelectorAll('.bag-btn')];
    buttons = button;

    button.forEach(btn => {
      let id = btn.dataset.id;
      let inCart = cart.find(item => item.id === id);

      if(inCart){
        btn.innerText = 'In Cart';
        btn.disabled = true;
      }
      btn.addEventListener('click', (e) => {
        e.target.innerText = 'In Cart';
        e.target.disabled = true;
        
        let cartItems = {...Storage.getProducts(id), amount: 1};
        cart = [...cart, cartItems];
        
        // SAVE CART
        Storage.saveCart(cart);
        // SET CART VALUES
        this.setCartValues(cart);
        // DISPLAY CART
        this.displayCart(cart);
        // SHOW CART
        this.showCart();
      })
    })
  }

  setCartValues(cart){
    let itemTotal = 0;
    let tempTotal = 0;
    cart.map(item => {
      itemTotal += item.price * item.amount;
      tempTotal += item.amount;
    })
    cartTotal.innerText = parseFloat(itemTotal.toFixed(2))
    cartItemss.innerText = tempTotal;
  }

  displayCart(){
    let result = ''
    cart.map(item => {
      result += `<div class="cart-item">
      <img src=${item.image} alt="">
    <div>
      <h4>${item.title}</h4>
      <h5>${item.price}</h5>
      <span class="remove-item" data-id=${item.id}>remove</span>
    </div>
    <div>
      <i class="fas fa-chevron-up" data-id=${item.id}></i>
      <p class="item-amount">${item.amount}</p>
      <i class="fas fa-chevron-down" data-id=${item.id}></i>
    </div>
    </div>`
    })
    cartContent.innerHTML = result;
  }

  showCart(){
    cartDOM.classList.add('showCart')
    cartOverlay.classList.add('transparentBcg')
  }

  APP(){
    cart = Storage.getCart();
    this.setCartValues(cart);
    this.displayCart(cart);

    cartBtn.addEventListener('click', this.showCart);
    closeCartBtn.addEventListener('click', this.hideCart)
  }

  hideCart(){
    cartDOM.classList.remove('showCart')
    cartOverlay.classList.remove('transparentBcg')
  }

  cartLogic(){
   clearCartBtn.addEventListener('click', () => {
    this.clear();
  })
  
    cartContent.addEventListener('click', e => {
      let id = e.target.dataset.id;

      if (e.target.classList.contains('remove-item')) {
        let remove = e.target;
        this.removeItem(id);
        cartContent.removeChild(remove.parentElement.parentElement)
      } else if(e.target.classList.contains('fa-chevron-up')){
        let addAmount = e.target;
        let tempTotal = cart.find(item => item.id === id)
        tempTotal.amount++;
        this.setCartValues(cart);
        Storage.saveCart(cart);
        addAmount.nextElementSibling.innerText = tempTotal.amount;
      } else if(e.target.classList.contains('fa-chevron-down')){
        let lowerAmount = e.target;
        let tempTotal = cart.find(item => item.id === id)
        tempTotal.amount--;
        if(tempTotal.amount > 0){
          this.setCartValues(cart);
          Storage.saveCart(cart);
          lowerAmount.previousElementSibling.innerText = tempTotal.amount;
        } else{
          this.removeItem(id);
          cartContent.removeChild(lowerAmount.parentElement.parentElement)
        }
      }
    })

}

  clear(){
    let cartItem = cart.map(item => item.id)
    cartItem.forEach(id => this.removeItem(id));

    while(cartContent.children.length > 0){
      cartContent.removeChild(cartContent.children[0])
    }
    this.hideCart()
  }

  removeItem(id){
    cart = cart.filter(item => item.id !== id);
    this.setCartValues(cart);
    Storage.saveCart(cart);
    let button = this.getSingleButton(id);
    button.disabled = false;
    button.innerHTML = `<i class="fas fa-shopping-cart"></i>
    Add to Cart`
  }

  getSingleButton(id){
    return buttons.find(item => item.dataset.id === id)
  }
  
}




class Storage{
  static saveProduct(product){
    localStorage.setItem('products', JSON.stringify(product))
  }

  static getProducts(id){
    let product = JSON.parse(localStorage.getItem('products'))
    return product.find(item => item.id === id)
  }

  static saveCart(cart){
    localStorage.setItem('cart', JSON.stringify(cart));
  }

  static getCart(){
    return localStorage.getItem('cart')? JSON.parse(localStorage.getItem('cart')): [];
  }

}









document.addEventListener('DOMContentLoaded', () =>{
  let products = new Products();
  let ui = new Ui();

  ui.APP();

  products.getProducts().then(product => {
     ui.displayProducts(product);
     Storage.saveProduct(product);
  }).then(() => {
    ui.getButtons();
    ui.cartLogic();
  })

})