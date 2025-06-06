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

    if (target.classList.contains('sell-btn')) {
      let item = items[index];
      if (item.quantity > 0) {
        item.quantity -= 1;
        item.status =
          item.quantity === 0 ? 'Out of Stock' :
          item.quantity <= 20 ? 'Low Stock' :
          'In Stock';
        items[index] = item;
        localStorage.setItem('inventoryItems', JSON.stringify(items));
        renderTable();
      } else {
        alert('Item is out of stock!');
      }
    }
  });

  searchInput.addEventListener('input', function () {
    renderTable(this.value.trim().toLowerCase());
  });

  function renderTable(filter = '') {
    tableBody.innerHTML = '';

    // Sort items alphabetically by name before rendering
    const sortedItems = [...items].sort((a, b) => a.name.localeCompare(b.name));

    sortedItems.forEach((item, index) => {
      if (!item.name.toLowerCase().startsWith(filter)) return;

      const row = document.createElement('tr');
      row.setAttribute('draggable', 'true');
      row.setAttribute('data-index', index);
      row.innerHTML = `
        <td>${item.name}</td>
        <td>${item.quantity}</td>
        <td>${item.status}</td>
        <td>
          <button class="edit-btn">Edit</button>
          <button class="delete-btn">Delete</button>
          <button class="sell-btn">Sell</button>
        </td>
      `;
      tableBody.appendChild(row);
    });

    // Add drag and drop event listeners
    Array.from(tableBody.children).forEach(row => {
      row.addEventListener('dragstart', handleDragStart);
      row.addEventListener('dragover', handleDragOver);
      row.addEventListener('drop', handleDrop);
      row.addEventListener('dragend', handleDragEnd);
    });
  }

  let dragSrcIndex = null;

  function handleDragStart(e) {
    dragSrcIndex = +this.getAttribute('data-index');
    this.style.opacity = '0.5';
  }

  function handleDragOver(e) {
    e.preventDefault();
    this.style.background = '#dbeafe';
  }

  function handleDrop(e) {
    e.preventDefault();
    this.style.background = '';
    const dropIndex = +this.getAttribute('data-index');
    if (dragSrcIndex !== null && dragSrcIndex !== dropIndex) {
      // Rearrange items array
      const sortedItems = [...items].sort((a, b) => a.name.localeCompare(b.name));
      const movedItem = sortedItems.splice(dragSrcIndex, 1)[0];
      sortedItems.splice(dropIndex, 0, movedItem);
      // Save new order to items
      items = sortedItems;
      localStorage.setItem('inventoryItems', JSON.stringify(items));
      renderTable(searchInput.value.trim().toLowerCase());
    }
    dragSrcIndex = null;
  }

  function handleDragEnd(e) {
    this.style.opacity = '';
    Array.from(tableBody.children).forEach(row => row.style.background = '');
  }
});
// maniegs
