document.addEventListener('DOMContentLoaded', () => {
  const itemSelect = document.getElementById('posItemSelect');
  const posForm = document.getElementById('posForm');
  const posQuantity = document.getElementById('posQuantity');
  const cartTableBody = document.querySelector('#cartTable tbody');
  const checkoutBtn = document.getElementById('checkoutBtn');
  const receiptModal = document.getElementById('receiptModal');
  const receiptDiv = document.getElementById('receipt');
  const closeReceiptModal = document.getElementById('closeReceiptModal');

  let inventory = JSON.parse(localStorage.getItem('inventoryItems')) || [];
  let cart = [];

  function populateSelect() {
    itemSelect.innerHTML = '';
    // Sort inventory alphabetically by name
    const sortedInventory = [...inventory].sort((a, b) => a.name.localeCompare(b.name));
    sortedInventory.forEach((item, idx) => {
      if (item.quantity > 0) {
        const option = document.createElement('option');
        // Find the original index for cart operations
        option.value = inventory.findIndex(inv => inv.name === item.name && inv.quantity === item.quantity);
        option.textContent = `${item.name} (In stock: ${item.quantity})`;
        itemSelect.appendChild(option);
      }
    });
  }

  function renderCart() {
    cartTableBody.innerHTML = '';
    cart.forEach((cartItem, i) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${cartItem.name}</td>
        <td>${cartItem.quantity}</td>
        <td><button class="remove-btn" data-index="${i}">Remove</button></td>
      `;
      cartTableBody.appendChild(row);
    });
  }

  posForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const idx = parseInt(itemSelect.value);
    const qty = parseInt(posQuantity.value);
    if (isNaN(idx) || isNaN(qty) || qty < 1) return;
    if (qty > inventory[idx].quantity) {
      alert('Not enough stock!');
      return;
    }
    // Check if already in cart
    const cartIdx = cart.findIndex(ci => ci.idx === idx);
    if (cartIdx > -1) {
      if (cart[cartIdx].quantity + qty > inventory[idx].quantity) {
        alert('Not enough stock!');
        return;
      }
      cart[cartIdx].quantity += qty;
    } else {
      cart.push({ idx, name: inventory[idx].name, quantity: qty });
    }
    renderCart();
    posForm.reset();
    populateSelect();
  });

  cartTableBody.addEventListener('click', function(e) {
    if (e.target.classList.contains('remove-btn')) {
      const i = parseInt(e.target.dataset.index);
      cart.splice(i, 1);
      renderCart();
    }
  });

  checkoutBtn.addEventListener('click', function() {
    if (cart.length === 0) {
      alert('Cart is empty!');
      return;
    }
    // Update inventory
    cart.forEach(cartItem => {
      inventory[cartItem.idx].quantity -= cartItem.quantity;
      inventory[cartItem.idx].status =
        inventory[cartItem.idx].quantity === 0 ? 'Out of Stock' :
        inventory[cartItem.idx].quantity <= 20 ? 'Low Stock' :
        'In Stock';
    });
    localStorage.setItem('inventoryItems', JSON.stringify(inventory));
    // Show receipt in modal
    let receiptHTML = `<ul style='margin-bottom:12px;'>`;
    cart.forEach(item => {
      receiptHTML += `<li>${item.name} x ${item.quantity}</li>`;
    });
    receiptHTML += `</ul><p>Date: ${new Date().toLocaleString()}</p>`;
    receiptDiv.innerHTML = receiptHTML;
    receiptModal.classList.add('active');
    cart = [];
    renderCart();
    populateSelect();
  });

  closeReceiptModal.addEventListener('click', function() {
    receiptModal.classList.remove('active');
  });

  // Optional: Close modal on outside click
  receiptModal.addEventListener('click', function(e) {
    if (e.target === receiptModal) {
      receiptModal.classList.remove('active');
    }
  });

  populateSelect();
  renderCart();
});
// manniegs