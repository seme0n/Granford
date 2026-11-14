 // ===== Мобильное меню (было) =====
  document.getElementById('menu-toggle').addEventListener('click', function () {
    document.getElementById('nav').classList.toggle('open');
  });
  document.querySelectorAll('nav a').forEach(function (a) {
    a.addEventListener('click', function () {
      document.getElementById('nav').classList.remove('open');
    });
  });

  // ===== КОРЗИНА =====
  const CART_KEY = 'steelguard_cart';
  const cartEl = document.getElementById('cart-items');
  const countEl = document.getElementById('cart-count');
  const totalEl = document.querySelector('#cart-total b');
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-overlay');

  let cart = [];

  function loadCart() {
    try { cart = JSON.parse(localStorage.getItem(CART_KEY)) || []; }
    catch (e) { cart = []; }
  }
  function saveCart() {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }

  function formatPrice(n) {
    return n.toLocaleString('ru-RU') + ' ₽';
  }

  // иконка-заглушка товара в корзине
  function itemIcon() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 17h18M5 17l1-5 3-3h6l3 3 1 5"/><circle cx="7.5" cy="17.5" r="2"/><circle cx="16.5" cy="17.5" r="2"/></svg>';
  }

  function renderCart() {
    // счётчик
    const count = cart.reduce((s, i) => s + i.qty, 0);
    countEl.textContent = count;

    // список
    if (!cart.length) {
      cartEl.innerHTML = '<p class="cart-empty">Корзина пуста</p>';
    } else {
      cartEl.innerHTML = cart.map(function (item) {
        return (
          '<div class="cart-item" data-id="' + item.id + '">' +
            '<div class="ci-thumb">' + itemIcon() + '</div>' +
            '<div class="ci-info">' +
              '<h4>' + item.name + '</h4>' +
              '<div class="ci-price">' + formatPrice(item.price) + '</div>' +
              '<div class="ci-qty">' +
                '<button data-action="dec" aria-label="Меньше">−</button>' +
                '<span>' + item.qty + '</span>' +
                '<button data-action="inc" aria-label="Больше">+</button>' +
              '</div>' +
            '</div>' +
            '<button class="ci-remove" data-action="remove" aria-label="Удалить">×</button>' +
          '</div>'
        );
      }).join('');
    }

    // итог
    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
    totalEl.textContent = formatPrice(total);
  }

  function addToCart(id, name, price) {
    const existing = cart.find(function (i) { return i.id === id; });
    if (existing) existing.qty += 1;
    else cart.push({ id: id, name: name, price: price, qty: 1 });
    saveCart();
    renderCart();
    openCart();
  }

  function openCart() {
    drawer.classList.add('open');
    overlay.classList.add('open');
  }
  function closeCart() {
    drawer.classList.remove('open');
    overlay.classList.remove('open');
  }

  // обработчики
  document.querySelectorAll('.add-cart').forEach(function (btn) {
    btn.addEventListener('click', function () {
      addToCart(btn.dataset.id, btn.dataset.name, Number(btn.dataset.price));
      btn.classList.add('added');
      btn.textContent = 'Добавлено ✓';
      setTimeout(function () {
        btn.classList.remove('added');
        btn.textContent = 'В корзину';
      }, 1200);
    });
  });

  // делегирование внутри списка корзины
  cartEl.addEventListener('click', function (e) {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const row = btn.closest('.cart-item');
    const id = row.dataset.id;
    const item = cart.find(function (i) { return i.id === id; });
    if (!item) return;

    if (btn.dataset.action === 'inc') item.qty += 1;
    if (btn.dataset.action === 'dec') {
    if (item.qty <= 1) {
    cart = cart.filter(function (i) { return i.id !== id; }); } 
    else {
    item.qty -= 1;
  }
}
    if (btn.dataset.action === 'remove') cart = cart.filter(function (i) { return i.id !== id; });

    saveCart();
    renderCart();
  });

  document.getElementById('cart-open').addEventListener('click', openCart);
  document.getElementById('cart-close').addEventListener('click', closeCart);
  overlay.addEventListener('click', closeCart);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeCart();
  });

  document.getElementById('cart-checkout').addEventListener('click', async function () {
    if (!cart.length) {
      alert('Корзина пуста — добавьте товары.');
      return;
    }

    // Собираем данные покупателя (можно заменить на модальное окно с полями)
    const name  = prompt('Ваше имя:');
    if (!name) return;
    const phone = prompt('Ваш телефон:');
    if (!phone) return;
    const email = prompt('Email (необязательно):', '') || '';

    const total = cart.reduce(function (s, i) { return s + i.price * i.qty; }, 0);
    const items = cart.map(function (i) {
      return { id: i.id, name: i.name, price: i.price, qty: i.qty };
    });

    try {
      const res = await fetch('save_order.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name, phone: phone, email: email, items: items, total: total })
      });
      const data = await res.json();

      if (data.ok) {
        alert('Заказ №' + data.order_id + ' оформлен!\nМенеджер свяжется с вами.');
        cart = [];
        saveCart();
        renderCart();
        closeCart();
      } else {
        alert('Ошибка: ' + (data.error || 'не удалось сохранить заказ'));
      }
    } catch (err) {
      alert('Ошибка соединения с сервером. Проверьте, что сайт открыт через OpenServer (http://...), а не file://');
      console.error(err);
    }
  });
  
  loadCart();
  renderCart();
  
  document.getElementById('feedback-form')?.addEventListener('submit', async function (e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const payload = Object.fromEntries(fd.entries());

    try {
      const res = await fetch('save_message.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.ok) {
        e.target.innerHTML = '<p style="color:#a5d6a7;font-size:18px">Спасибо! Мы получили ваш запрос и свяжемся с вами в ближайшее время.</p>';
      } else {
        alert('Ошибка: ' + (data.error || 'не удалось отправить'));
      }
    } catch (err) {
      alert('Ошибка соединения с сервером.');
      console.error(err);
    }
  });