document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('addForm');
  const tableBody = document.querySelector('#inventoryTable tbody');
  const formButton = document.getElementById('formButton');
  const searchInput = document.getElementById('searchInput');

  let currentEditIndex = null;

  // Load from localStorage
  let items = JSON.parse(localStorage.getItem('inventoryItems')) || [];
  renderTable();

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const name = document.getElementById('itemName').value.trim();
    const quantity = parseInt(document.getElementById('itemQuantity').value);

    if (!name || isNaN(quantity)) {
      alert('Please fill in all fields.');
      return;
    }

    const status =
      quantity === 0 ? 'Out of Stock' :
      quantity <= 20 ? 'Low Stock' :
      'In Stock';

    const item = { name, quantity, status };

    if (currentEditIndex !== null) {
      items[currentEditIndex] = item;
      currentEditIndex = null;
      formButton.textContent = 'Add Item';
    } else {
      items.push(item);
    }

    localStorage.setItem('inventoryItems', JSON.stringify(items));
    form.reset();
    renderTable();
  });

  tableBody.addEventListener('click', function (e) {
    const target = e.target;
    const row = target.closest('tr');
    const index = Array.from(tableBody.children).indexOf(row);

    if (target.classList.contains('delete-btn')) {
      items.splice(index, 1);
      localStorage.setItem('inventoryItems', JSON.stringify(items));
      renderTable();
    }

    if (target.classList.contains('edit-btn')) {
      const item = items[index];
      document.getElementById('itemName').value = item.name;
      document.getElementById('itemQuantity').value = item.quantity;
      formButton.textContent = 'Update Item';
      currentEditIndex = index;
    }
  });

  searchInput.addEventListener('input', function () {
    renderTable(this.value.trim().toLowerCase());
  });

  function renderTable(filter = '') {
    tableBody.innerHTML = '';

    items.forEach((item, index) => {
      if (!item.name.toLowerCase().startsWith(filter)) return;

      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${item.name}</td>
        <td>${item.quantity}</td>
        <td>${item.status}</td>
        <td>
          <button class="edit-btn">Edit</button>
          <button class="delete-btn">Delete</button>
        </td>
      `;
      tableBody.appendChild(row);
    });
  }
});

