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

На обычном PHP-хостинге браузер отправляет заявку в `POST /api/booking.php`. Обработчик проверяет обязательные поля, передает JSON в Google Apps Script и возвращает форме подтвержденный результат записи.

Payload содержит поля `name`, `phone`, `model`, `rentalTerm`, `rentalPurpose`, `fromBashkortostanCity`, `city`, `comment`, `consent`, `source`, `submittedAt`.

1. Замените код Apps Script на содержимое `google-apps-script/booking.gs`.
2. Разверните Apps Script как Web App и скопируйте URL `/exec`.
3. В `api/booking.php` укажите URL Apps Script `/exec` в `GOOGLE_APPS_SCRIPT_URL`.
4. Проверьте тестовую заявку на опубликованном сайте.

Apps Script пишет в таблицу с ID `1NRYYeSLX6UH2dXW2GS5DxMLblYqTwDzLXednwVExYgs`, в текущий лист `Лист1`. Если в первой строке нет полного набора колонок, скрипт заполнит заголовки:

`Дата получения`, `Имя`, `Телефон`, `Модель`, `Срок аренды`, `Цель`, `Из другого города РБ`, `Город`, `Комментарий`, `Согласие`, `Источник`, `Дата с сайта`.

Обычный локальный `python -m http.server` показывает статику, но не исполняет `/api/booking.php`. Для проверки API нужен PHP-сервер или опубликованный PHP-хостинг.

## Изображения

- Hero: замените `assets/img/hero/hero-main.webp` и `assets/img/hero/hero-main.jpg`.
- Фото booking-блока с памятником Салавату Юлаеву: замените `assets/img/booking/ufa-salavat-booking.webp` и `assets/img/booking/ufa-salavat-booking.jpg`.
- Фото моделей: положите финальные WebP/JPG в `assets/img/models` и обновите пути `image` и `imageFallback` в `data.models.js`.
- Логотипы лежат в `assets/img/logo`.

Сейчас карточки моделей используют переданные фото H8, H10 и U5 из `assets/img/models`. При замене сохраните тот же набор WebP/JPG или обновите пути в `data.models.js`. Файлы, которые не подключены из HTML, CSS или data/config JS, не попадают в интерфейс и могут быть исключены из production-пакета.

## Карта и аналитика

- Для iframe карты заполните `mapEmbedUrl`.
- Для кнопки внешней карты заполните `mapExternalUrl`; если поле пустое, fallback строит ссылку на поиск адреса в Яндекс Картах.
- Для Яндекс Метрики заполните `yandexMetrikaId`. При пустом ID счетчик не подключается, а вызовы `trackEvent` остаются безопасными.

## SEO

Canonical, Open Graph URL, `robots.txt` и `sitemap.xml` настроены на production-домен `https://www.ponyride.ru/`. При переносе сайта на другой домен обновите эти значения вместе.

## Деплой

### REG.RU PHP-хостинг

1. Привяжите домен к услуге хостинга и создайте сайт в панели REG.RU.
2. Загрузите содержимое корня проекта в корневую папку сайта, сохранив папки `api`, `assets` и `google-apps-script`.
3. Убедитесь, что хостинг исполняет PHP и что доступен `POST /api/booking.php`.
4. Подключите SSL для домена и проверьте финальный URL без VPN.
5. После публикации проверьте форму, карту, OG и Lighthouse.

### Vercel

Файл `api/booking.js` сохранен как прежний Vercel Function. Он не нужен для REG.RU, но может использоваться для отдельного preview/deploy на Vercel с env var `GOOGLE_APPS_SCRIPT_URL`.

## QA

Проверьте header, CTA, автоподстановку модели в форме, checkbox другого города РБ, ошибки имени/телефона/согласия, сбой `/api/booking.php`, fallback карты и отображение на ширинах 360, 390, 768, 1024, 1366 и 1440 px.
