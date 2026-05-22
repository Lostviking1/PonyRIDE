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

Браузер отправляет заявку в Vercel Function `POST /api/booking`. Она проверяет обязательные поля, передает JSON в Google Apps Script и возвращает форме подтвержденный результат записи.

Payload содержит поля `name`, `phone`, `model`, `rentalTerm`, `rentalPurpose`, `fromBashkortostanCity`, `city`, `comment`, `consent`, `source`, `submittedAt`.

1. Замените код Apps Script на содержимое `google-apps-script/booking.gs`.
2. Разверните Apps Script как Web App и скопируйте URL `/exec`.
3. В Vercel задайте env var `GOOGLE_APPS_SCRIPT_URL` с этим URL. Шаблон есть в `.env.example`.
4. Проверьте тестовую заявку на опубликованном preview/production URL.

Apps Script пишет в таблицу с ID `1NRYYeSLX6UH2dXW2GS5DxMLblYqTwDzLXednwVExYgs`, в текущий лист `Лист1`. Если в первой строке нет полного набора колонок, скрипт заполнит заголовки:

`Дата получения`, `Имя`, `Телефон`, `Модель`, `Срок аренды`, `Цель`, `Из другого города РБ`, `Город`, `Комментарий`, `Согласие`, `Источник`, `Дата с сайта`.

Обычный локальный `python -m http.server` показывает статику, но не исполняет `/api/booking`. Для проверки API используйте Vercel preview/deploy или локальный runtime Vercel.

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

### Vercel

1. Импортируйте папку как статический проект.
2. Build command оставьте пустым.
3. Output directory оставьте корнем проекта.
4. Добавьте `GOOGLE_APPS_SCRIPT_URL` в Environment Variables.
5. После публикации проверьте форму, карту, OG и Lighthouse.

### GitHub Pages

1. Опубликуйте содержимое корня проекта из выбранной ветки.
2. Убедитесь, что `index.html`, `privacy.html`, `consent.html`, `assets`, `robots.txt` и `sitemap.xml` доступны по финальному URL.
3. Проверьте production-домен в canonical, Open Graph, `robots.txt` и `sitemap.xml`.
4. Для бронирования подключите внешний backend с тем же контрактом `POST /api/booking`: сам GitHub Pages Vercel Function не исполняет.

## QA

Проверьте header, CTA, автоподстановку модели в форме, checkbox другого города РБ, ошибки имени/телефона/согласия, сбой `/api/booking`, fallback карты и отображение на ширинах 360, 390, 768, 1024, 1366 и 1440 px.
