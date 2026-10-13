// Получаем модальное окно по id.
const orderDialog = document.getElementById('order-dialog');

// Получаем все кнопки заказа в карточках товаров.
const orderButtons = document.querySelectorAll('.product-card__button');

// Получаем кнопку закрытия модального окна.
const closeDialogButton = document.getElementById('close-order-dialog');

// Получаем скрытое поле, в которое будет записан выбранный товар.
const selectedProductInput = document.getElementById('selected-product');

// Перебираем все кнопки «Заказать».
orderButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const productName = button.dataset.product;
    selectedProductInput.value = productName;
    orderDialog.showModal();
  });
});

// Закрываем модальное окно по кнопке «Закрыть».
if (closeDialogButton && orderDialog) {
  closeDialogButton.addEventListener('click', () => {
    orderDialog.close();
  });
}

// Получаем форму заявки.
const orderForm = document.getElementById('order-form');

// Получаем сообщение об успешной отправке.
const successMessage = document.getElementById('success-message');

// Обрабатываем отправку формы.
if (orderForm) {
  orderForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const formElements = Array.from(orderForm.elements);

    formElements.forEach((element) => {
      if (element.willValidate) {
        element.removeAttribute('aria-invalid');
      }
    });

    if (!orderForm.checkValidity()) {
      formElements.forEach((element) => {
        if (element.willValidate && !element.checkValidity()) {
          element.setAttribute('aria-invalid', 'true');
        }
      });

      orderForm.reportValidity();
      return;
    }

    successMessage.hidden = false;
    orderForm.reset();
    orderDialog.close();
  });
}

async function loadRates() {
  try {
    const res = await fetch('https://www.cbr-xml-daily.ru/daily_json.js');
    if (!res.ok) throw new Error('Ошибка загрузки курсов');
    const data = await res.json();
    return {
      CNY: data.Valute.CNY.Value,
      JPY: data.Valute.JPY.Value / 100
    };
  } catch (e) {
    console.error('Не удалось загрузить курсы:', e);
    return { CNY: 12.5, JPY: 0.54 };
  }
}

async function updatePrices() {
  const rates = await loadRates();

  document.querySelectorAll('.product-card').forEach(card => {
    const price = parseFloat(card.dataset.price);
    const currency = card.dataset.currency;
    const rate = rates[currency];

    if (rate) {
      const rub = Math.round(price * rate);
      const rubEl = card.querySelector('.product-card__price-rub');
      if (rubEl) rubEl.textContent = ` (~${rub} ₽)`;
    }
  });
}

updatePrices();