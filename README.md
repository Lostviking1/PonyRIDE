# Pony RIDE

Статический одностраничный сайт аренды электровелосипедов Pony RIDE в Уфе. Проект открывается без сборки: `index.html` подключает один CSS-файл, основной JS и data/config-файлы из `assets`.

## Локальный просмотр

- Откройте `index.html` в браузере.
- Для проверки `fetch`, sitemap и поведения сайта в режиме обычного web-origin можно поднять любой статический сервер, например через расширение редактора или хостинг preview.

## Где менять данные

- Контакты, реквизиты, endpoint формы, карту, Метрику и `source`: `assets/js/config.js`.
- Модели, цены и только подтвержденные характеристики: `assets/js/data.models.js`.
- FAQ и JSON-LD FAQPage: `assets/js/data.faq.js`.
- Файлы `assets/js/data.reviews.js` и `assets/js/data.services.js` сохранены как заготовки, но соответствующие секции сейчас не выводятся на странице.

Характеристики моделей меняются в `assets/js/data.models.js`. Для текущей версии значения H8, H10 и U5 взяты из переданной инфографики; новые пробеги, вес, нагрузку и длительность смены добавляйте только с подтвержденным источником. Пока отзывов с разрешением на публикацию нет, оставьте `PONY_RIDE_REVIEWS` пустым.

## Форма

Укажите Google Apps Script endpoint в `formEndpoint`:

```js
formEndpoint: "https://script.google.com/macros/s/REPLACE_ME/exec"
```

Сайт отправляет JSON payload с полями `name`, `phone`, `model`, `rentalTerm`, `rentalPurpose`, `fromBashkortostanCity`, `city`, `comment`, `consent`, `source`, `submittedAt`.

Если endpoint пустой, `fetch` не запускается и пользователь видит сообщение с предложением написать в Telegram или позвонить.

## Изображения

- Hero: замените `assets/img/hero/hero-main.webp` и `assets/img/hero/hero-main.jpg`.
- Фото booking-блока с памятником Салавату Юлаеву: замените `assets/img/booking/ufa-salavat-booking.webp` и `assets/img/booking/ufa-salavat-booking.jpg`.
- Фото моделей: положите финальные WebP/JPG в `assets/img/models` и обновите пути `image` и `imageFallback` в `data.models.js`.
- Логотипы лежат в `assets/img/logo`.

Сейчас карточки моделей используют переданные фото H8, H10 и U5 из `assets/img/models`. При замене сохраните тот же набор WebP/JPG или обновите пути в `data.models.js`.

## Карта и аналитика

- Для iframe карты заполните `mapEmbedUrl`.
- Для кнопки внешней карты заполните `mapExternalUrl`; если поле пустое, fallback строит ссылку на поиск адреса в Яндекс Картах.
- Для Яндекс Метрики заполните `yandexMetrikaId`. При пустом ID счетчик не подключается, а вызовы `trackEvent` остаются безопасными.

## SEO перед публикацией

В шаблоне используется placeholder-домен `https://ponyride.example/`. Перед деплоем замените его в:

- canonical и Open Graph URL в `index.html`, `privacy.html`, `consent.html`;
- `og:image` в `index.html`;
- `robots.txt`;
- `sitemap.xml`.

## Деплой

### Vercel

1. Импортируйте папку как статический проект.
2. Build command оставьте пустым.
3. Output directory оставьте корнем проекта.
4. После публикации замените placeholder URL и проверьте форму, карту, OG и Lighthouse.

### GitHub Pages

1. Опубликуйте содержимое корня проекта из выбранной ветки.
2. Убедитесь, что `index.html`, `privacy.html`, `consent.html`, `assets`, `robots.txt` и `sitemap.xml` доступны по финальному URL.
3. Замените placeholder URL на production-домен.

## QA

Проверьте header, CTA, автоподстановку модели в форме, checkbox другого города РБ, ошибки имени/телефона/согласия, пустой endpoint, fallback карты и отображение на ширинах 360, 390, 768, 1024, 1366 и 1440 px.
