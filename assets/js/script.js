(() => {
  "use strict";

  const config = window.PONY_RIDE_CONFIG || {};
  const models = Array.isArray(window.PONY_RIDE_MODELS) ? window.PONY_RIDE_MODELS : [];
  const faq = Array.isArray(window.PONY_RIDE_FAQ) ? window.PONY_RIDE_FAQ : [];
  const reviews = Array.isArray(window.PONY_RIDE_REVIEWS) ? window.PONY_RIDE_REVIEWS : [];
  const scenarios = Array.isArray(window.PONY_RIDE_RENTER_SCENARIOS) ? window.PONY_RIDE_RENTER_SCENARIOS : [];
  const services = Array.isArray(window.PONY_RIDE_SERVICES) ? window.PONY_RIDE_SERVICES : [];
  const namePattern = /^[A-Za-zА-Яа-яЁё\s-]{2,50}$/;
  document.documentElement.classList.add("js-ready");

  const create = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) {
      node.className = className;
    }
    if (typeof text === "string") {
      node.textContent = text;
    }
    return node;
  };

  const price = (value) => new Intl.NumberFormat("ru-RU").format(value);
  const money = (value) => `${price(value)} ₽`;

  window.trackEvent = function trackEvent(eventName, params = {}) {
    if (window.ym && config.yandexMetrikaId) {
      window.ym(config.yandexMetrikaId, "reachGoal", eventName, params);
    }
  };

  const setConfigText = () => {
    document.querySelectorAll("[data-config-text]").forEach((node) => {
      const value = config[node.dataset.configText];
      if (value) {
        node.textContent = value;
      }
    });

    document.querySelectorAll("[data-contact='phone']").forEach((link) => {
      if (config.phoneHref) {
        link.href = config.phoneHref;
      }
    });

    document.querySelectorAll("[data-contact='telegram']").forEach((link) => {
      if (config.telegramHref) {
        link.href = config.telegramHref;
      }
    });

    document.querySelectorAll("a[href^='mailto:']").forEach((link) => {
      if (config.emailHref) {
        link.href = config.emailHref;
      }
    });

    document.querySelectorAll("[data-map-link='yandex']").forEach((link) => {
      if (config.mapExternalUrl) {
        link.href = config.mapExternalUrl;
      }
    });
  };

  const appendSpec = (list, label, value) => {
    if (!value) {
      return;
    }
    const row = create("div");
    row.append(create("dt", "", label), create("dd", "", value));
    list.append(row);
  };

  const renderModels = () => {
    const grid = document.querySelector("#model-grid");
    if (!grid) {
      return;
    }
    grid.replaceChildren();

    models.forEach((model) => {
      const card = create("article", `model-card reveal${model.premium ? " is-premium" : ""}`);
      const media = create("div", "model-media");
      const image = document.createElement("img");
      image.src = model.image;
      image.dataset.fallback = model.imageFallback || model.image;
      image.width = 960;
      image.height = 720;
      image.loading = "lazy";
      image.alt = `Изображение ${model.name}`;
      image.addEventListener("error", () => {
        if (image.src.endsWith(image.dataset.fallback)) {
          return;
        }
        image.src = image.dataset.fallback;
        image.alt = `Фото ${model.name} временно недоступно`;
      });
      media.append(image);

      const body = create("div", "model-body");
      body.append(create("h3", "", model.name));
      body.append(create("p", "model-highlight", model.highlight));
      body.append(create("p", "model-fit", `Для чего: ${model.bestFor}.`));

      const priceRow = create("div", "price-row");
      priceRow.append(create("strong", "", `${price(model.weeklyPrice)} ₽`), create("span", "", `${price(model.dailyPrice)} ₽ в день`));
      body.append(priceRow);

      const specs = create("dl", "spec-list");
      appendSpec(specs, "Мощность", model.power);
      appendSpec(specs, "АКБ", model.battery);
      appendSpec(specs, "Количество АКБ", String(model.batteryCount));
      const specLabels = {
        brakes: "Тормоза",
        weight: "Вес",
        shiftDuration: "Смена без подзарядки",
        maxLoad: "Нагрузка",
        range: "Пробег"
      };
      Object.entries(model.confirmedSpecs || {}).forEach(([key, value]) => {
        appendSpec(specs, specLabels[key] || key, value);
      });
      body.append(specs);
      const reviewBox = create("div", "model-reviews");
      reviewBox.append(create("p", "model-review-title", "Видеообзоры моделей"));
      [
        ["youtube", "YouTube", "assets/img/icons/youtube.png"],
        ["vk", "VK", "assets/img/icons/vk.png"]
      ].forEach(([key, label, iconPath]) => {
        const href = model.reviewLinks && model.reviewLinks[key];
        if (!href) {
          return;
        }
        const reviewNode = create("a", "review-link");
        reviewNode.href = href;
        reviewNode.target = "_blank";
        reviewNode.rel = "noreferrer";
        const icon = document.createElement("img");
        icon.src = iconPath;
        icon.width = 24;
        icon.height = 24;
        icon.alt = "";
        reviewNode.append(icon, create("b", "", label), create("em", "", "Смотреть"));
        reviewBox.append(reviewNode);
      });
      body.append(reviewBox);

      const button = create("button", "button", "Забронировать эту модель");
      button.type = "button";
      button.dataset.model = model.id;
      button.addEventListener("click", () => bookModel(model.id));
      body.append(button);
      card.append(media, body);
      grid.append(card);
    });
    observeReveal(grid.querySelectorAll(".reveal"));
  };

  const renderServices = () => {
    const grid = document.querySelector("#service-grid");
    if (!grid) {
      return;
    }
    grid.replaceChildren();
    services.forEach((service) => {
      const card = create("article", `service-card reveal${service.priority ? " is-priority" : ""}`);
      card.append(create("h3", "", service.title), create("p", "", service.text));
      grid.append(card);
    });
    observeReveal(grid.querySelectorAll(".reveal"));
  };

  const renderFaq = () => {
    const list = document.querySelector("#faq-list");
    if (!list) {
      return;
    }
    list.replaceChildren();
    faq.forEach((item, index) => {
      const details = create("details", "faq-item reveal");
      details.open = index === 0;
      details.append(create("summary", "", item.question), create("p", "faq-answer", item.answer));
      list.append(details);
    });
    observeReveal(list.querySelectorAll(".reveal"));
  };

  const renderReviewArea = () => {
    const grid = document.querySelector("#review-grid");
    const title = document.querySelector("#reviews-title");
    if (!grid || !title) {
      return;
    }
    grid.replaceChildren();

    if (!reviews.length) {
      title.textContent = "Как выбрать и забронировать";
      scenarios.forEach((scenario) => {
        const card = create("article", "review-card reveal");
        card.append(create("h3", "", scenario.title), create("p", "", scenario.text));
        grid.append(card);
      });
      observeReveal(grid.querySelectorAll(".reveal"));
      return;
    }

    title.textContent = "Отзывы наших клиентов";
    reviews.forEach((review) => {
      const card = create("article", "review-card reveal");
      const head = create("div", "review-head");
      if (review.avatar) {
        const avatar = document.createElement("img");
        avatar.className = "review-avatar";
        avatar.src = review.avatar;
        avatar.alt = "";
        avatar.width = 48;
        avatar.height = 48;
        avatar.loading = "lazy";
        head.append(avatar);
      }
      const meta = create("div");
      meta.append(create("h3", "", review.name || "Клиент"), create("p", "", review.date || ""));
      head.append(meta);
      const stars = create("p", "stars", "★".repeat(Math.max(0, Math.min(5, Number(review.rating) || 0))));
      stars.setAttribute("aria-label", `Оценка ${Number(review.rating) || 0} из 5`);
      card.append(head, stars, create("p", "", review.text || ""));
      grid.append(card);
    });
    observeReveal(grid.querySelectorAll(".reveal"));
  };

  const bookModel = (modelId) => {
    const select = document.querySelector("#model");
    const nameInput = document.querySelector("#name");
    const booking = document.querySelector("#booking");
    if (select) {
      select.value = modelId;
      clearError(select);
    }
    window.trackEvent("click_model_book", { model: modelId });
    if (booking) {
      booking.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    window.setTimeout(() => {
      if (nameInput) {
        nameInput.focus();
      }
    }, 260);
  };

  const focusBookingName = () => {
    const nameInput = document.querySelector("#name");
    window.setTimeout(() => {
      if (nameInput) {
        nameInput.focus();
      }
    }, 260);
  };

  const scrollToBooking = () => {
    const booking = document.querySelector("#booking");
    if (booking) {
      booking.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const startTestDrive = () => {
    const form = document.querySelector("#booking-form");
    if (!form) {
      return;
    }

    if (form.elements.model && !form.elements.model.value) {
      form.elements.model.value = "consultation";
      clearError(form.elements.model);
    }
    if (form.elements.rentalPurpose) {
      form.elements.rentalPurpose.value = "test_drive";
      clearError(form.elements.rentalPurpose);
    }
    if (form.elements.comment && !form.elements.comment.value.trim()) {
      form.elements.comment.value = "Хочу бесплатный тест-драйв";
    }

    window.trackEvent("click_test_drive");
    scrollToBooking();
    focusBookingName();
  };

  const setupTestDriveCtas = () => {
    document.querySelectorAll("[data-test-drive]").forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        startTestDrive();
      });
    });
  };

  const setupCalculator = () => {
    const ORDER_PRICE = 200;
    const TRANSPORT = {
      maikaolin: { ordersPerHour: 3.8, dailyExpense: 700, hourlyExpense: 0 },
      bike: { ordersPerHour: 2.2, dailyExpense: 0, hourlyExpense: 0 },
      car: { ordersPerHour: 3.0, dailyExpense: 0, hourlyExpense: 150 },
      walk: { ordersPerHour: 1.5, dailyExpense: 0, hourlyExpense: 0 }
    };

    const hoursSlider = document.querySelector("#work-hours");
    const daysSlider = document.querySelector("#work-days");
    const hoursOutput = document.querySelector("#work-hours-output");
    const daysOutput = document.querySelector("#work-days-output");
    const resultNodes = {
      maikaolin: document.querySelector("[data-result='maikaolin-period']"),
      bike: document.querySelector("[data-result='bike-period']"),
      car: document.querySelector("[data-result='car-period']"),
      walk: document.querySelector("[data-result='walk-period']"),
      carExpense: document.querySelector("[data-result='car-expense']")
    };
    if (!hoursSlider || !daysSlider || !hoursOutput || !daysOutput || Object.values(resultNodes).some((node) => !node)) {
      return;
    }

    const setRangeProgress = (range) => {
      const min = Number(range.min) || 0;
      const max = Number(range.max) || 100;
      const value = Number(range.value) || min;
      const progress = ((value - min) / (max - min)) * 100;
      range.style.setProperty("--progress", `${progress}%`);
    };

    const calculate = (transport, hours, workDays) => {
      const grossDaily = hours * transport.ordersPerHour * ORDER_PRICE;
      const expenseDaily = transport.dailyExpense + (hours * transport.hourlyExpense);
      const netDaily = grossDaily - expenseDaily;
      return {
        expenseDaily,
        netPeriod: Math.round(netDaily * workDays)
      };
    };

    const updateValue = (node, value) => {
      node.textContent = money(value);
      node.classList.remove("is-updating");
      window.requestAnimationFrame(() => node.classList.add("is-updating"));
    };

    const update = () => {
      const hours = Number(hoursSlider.value) || 8;
      const workDays = Number(daysSlider.value) || 22;
      const maikaolin = calculate(TRANSPORT.maikaolin, hours, workDays);
      const bike = calculate(TRANSPORT.bike, hours, workDays);
      const car = calculate(TRANSPORT.car, hours, workDays);
      const walk = calculate(TRANSPORT.walk, hours, workDays);

      hoursOutput.textContent = String(hours);
      daysOutput.textContent = String(workDays);
      setRangeProgress(hoursSlider);
      setRangeProgress(daysSlider);
      updateValue(resultNodes.maikaolin, maikaolin.netPeriod);
      updateValue(resultNodes.bike, bike.netPeriod);
      updateValue(resultNodes.car, car.netPeriod);
      updateValue(resultNodes.walk, walk.netPeriod);
      resultNodes.carExpense.textContent = `Учтены расходы на бензин и обслуживание: ${money(car.expenseDaily)}/день.`;
    };

    [hoursSlider, daysSlider].forEach((slider) => {
      slider.addEventListener("input", update);
    });
    [hoursSlider, daysSlider].forEach((slider) => {
      slider.addEventListener("change", () => {
        window.trackEvent("calculator_change", {
          hours: Number(hoursSlider.value) || 8,
          workDays: Number(daysSlider.value) || 22
        });
      });
    });
    update();
  };

  const setupFloatingTelegram = () => {
    const link = document.querySelector("[data-floating-telegram]");
    if (!link) {
      return;
    }
    link.addEventListener("click", () => window.trackEvent("click_floating_telegram"));
  };

  const buildSchemas = () => {
    const businessNode = document.querySelector("#local-business-schema");
    const faqNode = document.querySelector("#faq-schema");
    const pageUrl = document.querySelector("link[rel='canonical']")?.href || window.location.href;

    if (businessNode) {
      businessNode.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": ["LocalBusiness", "Store"],
        name: config.companyName,
        legalName: config.legalName,
        telephone: config.phoneDisplay,
        email: config.email,
        url: pageUrl,
        sameAs: config.telegramHref ? [config.telegramHref] : [],
        areaServed: [config.city, config.region].filter(Boolean),
        address: {
          "@type": "PostalAddress",
          addressLocality: config.city,
          addressRegion: config.region,
          streetAddress: config.address,
          addressCountry: "RU"
        }
      });
    }

    if (faqNode) {
      faqNode.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faq.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer
          }
        }))
      });
    }
  };

  const renderMap = () => {
    const panel = document.querySelector("#map-panel");
    if (!panel) {
      return;
    }
    panel.replaceChildren();

    if (config.mapEmbedUrl) {
      const frame = document.createElement("iframe");
      frame.src = config.mapEmbedUrl;
      frame.loading = "lazy";
      frame.title = "Карта проезда к Pony RIDE";
      frame.referrerPolicy = "no-referrer-when-downgrade";
      panel.append(frame);
      return;
    }

    const fallback = create("div", "map-fallback");
    fallback.append(create("h3", "", "Карта пока не настроена"));
    fallback.append(create("p", "", config.address || "Адрес выдачи уточняется."));
    const link = create("a", "button", "Открыть карту");
    link.target = "_blank";
    link.rel = "noreferrer";
    link.href = config.mapExternalUrl || `https://yandex.ru/maps/?text=${encodeURIComponent(config.address || "Pony RIDE Уфа")}`;
    fallback.append(link);
    panel.append(fallback);
  };

  const status = (message, type = "") => {
    const node = document.querySelector("#form-status");
    if (!node) {
      return;
    }
    node.textContent = message;
    node.className = "form-status";
    if (type) {
      node.classList.add(`is-${type}`);
    }
  };

  const getErrorNode = (field) => {
    const ids = (field.getAttribute("aria-describedby") || "").split(/\s+/).filter(Boolean);
    return ids.map((id) => document.getElementById(id)).find((node) => node && node.classList.contains("field-error"));
  };

  const showError = (field, message) => {
    const node = getErrorNode(field);
    field.setAttribute("aria-invalid", "true");
    if (node) {
      node.textContent = message;
    }
  };

  const clearError = (field) => {
    const node = getErrorNode(field);
    field.removeAttribute("aria-invalid");
    if (node) {
      node.textContent = "";
    }
  };

  const digitsOnly = (value) => value.replace(/\D/g, "");

  const normalizedPhoneDigits = (value) => {
    const digits = digitsOnly(value);
    return digits.length === 11 && (digits.startsWith("7") || digits.startsWith("8")) ? digits : "";
  };

  const formatPhone = (digits) => {
    const normalized = digits.startsWith("8") ? `7${digits.slice(1)}` : digits;
    return `+${normalized[0]} ${normalized.slice(1, 4)} ${normalized.slice(4, 7)}-${normalized.slice(7, 9)}-${normalized.slice(9)}`;
  };

  const toggleCityField = () => {
    const checkbox = document.querySelector("#from-region");
    const cityField = document.querySelector("#city-field");
    const city = document.querySelector("#city");
    if (!checkbox || !cityField || !city) {
      return;
    }
    cityField.hidden = !checkbox.checked;
    city.required = checkbox.checked;
    if (!checkbox.checked) {
      city.value = "";
      clearError(city);
    }
  };

  const validateForm = (form) => {
    const name = form.elements.name;
    const phone = form.elements.phone;
    const model = form.elements.model;
    const term = form.elements.rentalTerm;
    const purpose = form.elements.rentalPurpose;
    const city = form.elements.city;
    const consent = form.elements.consent;
    const fields = [name, phone, model, term, purpose, city, consent];
    fields.forEach((field) => clearError(field));
    let valid = true;

    if (!namePattern.test(name.value.trim())) {
      showError(name, "Введите имя: 2-50 букв, пробел или дефис.");
      valid = false;
    }
    if (!normalizedPhoneDigits(phone.value)) {
      showError(phone, "Введите российский номер из 11 цифр, начиная с 7 или 8.");
      valid = false;
    }
    if (!model.value) {
      showError(model, "Выберите модель или консультацию.");
      valid = false;
    }
    if (!term.value) {
      showError(term, "Выберите срок аренды.");
      valid = false;
    }
    if (!purpose.value) {
      showError(purpose, "Выберите цель обращения.");
      valid = false;
    }
    if (form.elements.fromBashkortostanCity.checked && !city.value.trim()) {
      showError(city, "Укажите город.");
      valid = false;
    }
    if (!consent.checked) {
      showError(consent, "Подтвердите согласие на обработку данных.");
      valid = false;
    }
    if (!valid) {
      fields.find((field) => field.getAttribute("aria-invalid") === "true")?.focus();
    }
    return valid;
  };

  const payloadFromForm = (form) => {
    const digits = normalizedPhoneDigits(form.elements.phone.value);
    return {
      name: form.elements.name.value.trim(),
      phone: formatPhone(digits),
      model: form.elements.model.value,
      rentalTerm: form.elements.rentalTerm.value,
      rentalPurpose: form.elements.rentalPurpose.value,
      fromBashkortostanCity: form.elements.fromBashkortostanCity.checked,
      city: form.elements.city.value.trim(),
      comment: form.elements.comment.value.trim(),
      consent: form.elements.consent.checked,
      source: config.source || "ponyride_landing",
      submittedAt: new Date().toISOString()
    };
  };

  const setupForm = () => {
    const form = document.querySelector("#booking-form");
    const phone = document.querySelector("#phone");
    const fromRegion = document.querySelector("#from-region");
    const submitButton = document.querySelector("#submit-button");
    if (!form || !phone || !fromRegion || !submitButton) {
      return;
    }

    phone.addEventListener("input", () => {
      phone.value = phone.value.replace(/[^\d+()\s-]/g, "");
      clearError(phone);
    });

    form.querySelectorAll("input, select, textarea").forEach((field) => {
      field.addEventListener("change", () => clearError(field));
    });

    fromRegion.addEventListener("change", toggleCityField);
    toggleCityField();

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      status("");
      if (!validateForm(form)) {
        return;
      }

      submitButton.disabled = true;
      submitButton.textContent = "Отправляем...";
      status("Отправляем заявку...", "pending");

      try {
        const response = await fetch("/api/booking.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payloadFromForm(form))
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok || !result.ok) {
          throw new Error(result.error || `HTTP ${response.status}`);
        }
        form.reset();
        toggleCityField();
        status("Заявка отправлена. Мы свяжемся с вами для уточнения модели и времени выдачи.", "success");
        window.trackEvent("form_submit_success");
      } catch (error) {
        status("Не удалось записать заявку. Проверьте соединение и попробуйте еще раз или напишите нам в Telegram.", "error");
        window.trackEvent("form_submit_error", { reason: "network_or_server" });
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = "Забронировать";
      }
    });
  };

  const setupNavigation = () => {
    const header = document.querySelector(".site-header");
    const menu = document.querySelector(".menu-toggle");
    const nav = document.querySelector("#site-nav");
    if (!header || !menu || !nav) {
      return;
    }
    const setOpen = (open) => {
      header.classList.toggle("is-open", open);
      document.body.classList.toggle("nav-open", open);
      menu.setAttribute("aria-expanded", String(open));
      menu.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
    };
    menu.addEventListener("click", () => setOpen(menu.getAttribute("aria-expanded") !== "true"));
    nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setOpen(false)));
  };

  const setupTracking = () => {
    document.querySelectorAll("[data-track]").forEach((link) => {
      link.addEventListener("click", () => window.trackEvent(link.dataset.track));
    });
    document.querySelectorAll("[data-contact='phone']").forEach((link) => {
      link.addEventListener("click", () => window.trackEvent("click_phone"));
    });
    document.querySelectorAll("[data-contact='telegram']").forEach((link) => {
      link.addEventListener("click", () => window.trackEvent("click_telegram"));
    });
  };

  const loadMetrika = () => {
    if (!config.yandexMetrikaId) {
      return;
    }
    const script = document.createElement("script");
    script.textContent = `(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,"script","https://mc.yandex.ru/metrika/tag.js","ym");ym(${JSON.stringify(config.yandexMetrikaId)},"init",{clickmap:true,trackLinks:true,accurateTrackBounce:true});`;
    document.head.append(script);
  };

  let revealObserver;
  const observeReveal = (nodes) => {
    if (!nodes.length) {
      return;
    }
    if (!("IntersectionObserver" in window)) {
      nodes.forEach((node) => node.classList.add("is-visible"));
      return;
    }
    if (!revealObserver) {
      revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 });
    }
    nodes.forEach((node) => revealObserver.observe(node));
  };

  setConfigText();
  renderModels();
  renderServices();
  renderReviewArea();
  renderFaq();
  buildSchemas();
  renderMap();
  setupForm();
  setupTestDriveCtas();
  setupCalculator();
  setupFloatingTelegram();
  setupNavigation();
  setupTracking();
  loadMetrika();
  observeReveal(document.querySelectorAll(".reveal"));
})();
