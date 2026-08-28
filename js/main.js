const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const mobileNav = document.querySelector("[data-mobile-nav]");
const overlay = document.querySelector("[data-overlay]");
const dialog = document.querySelector("[data-dialog]");
const panels = {
  trial: document.querySelector('[data-panel="trial"]'),
  call: document.querySelector('[data-panel="call"]'),
};
const successes = {
  trial: document.querySelector('[data-success="trial"]'),
  call: document.querySelector('[data-success="call"]'),
};
const forms = {
  trial: document.querySelector("#trial-form"),
  call: document.querySelector("#call-form"),
};

const DEMO_CONFIRM_MESSAGE = "Подтвердите, что проект демонстрационный.";

const demoConfirmOf = (form) => form?.querySelector('[name="isDemoConfirmed"]');

const setDemoConfirmState = (form) => {
  const input = demoConfirmOf(form);
  const label = input?.closest(".demo-confirmation");
  const error = label?.querySelector(".demo-confirmation-error");
  if (!input) return true;

  const ok = input.checked;
  input.setCustomValidity(ok ? "" : DEMO_CONFIRM_MESSAGE);
  input.setAttribute("aria-invalid", ok ? "false" : "true");
  label?.classList.toggle("is-error", !ok);
  if (error) {
    error.hidden = ok;
    if (ok) error.removeAttribute("role");
    else error.setAttribute("role", "alert");
  }
  return ok;
};

const resetDemoConfirm = (form) => {
  const input = demoConfirmOf(form);
  const label = input?.closest(".demo-confirmation");
  const error = label?.querySelector(".demo-confirmation-error");
  if (!input) return;

  input.checked = false;
  input.setCustomValidity(DEMO_CONFIRM_MESSAGE);
  input.setAttribute("aria-invalid", "false");
  label?.classList.remove("is-error");
  if (error) {
    error.hidden = true;
    error.removeAttribute("role");
  }
};

const bindDemoConfirm = (form) => {
  const input = demoConfirmOf(form);
  if (!form || !input) return;
  input.addEventListener("change", () => setDemoConfirmState(form));
};

const setScrolled = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 8);
};

const closeMenu = () => {
  if (!mobileNav || !menuToggle) return;
  mobileNav.hidden = true;
  mobileNav.classList.remove("is-open");
  menuToggle.setAttribute("aria-expanded", "false");
  document.body.classList.remove("menu-open");
};

const openMenu = () => {
  if (!mobileNav || !menuToggle) return;
  mobileNav.hidden = false;
  mobileNav.classList.add("is-open");
  menuToggle.setAttribute("aria-expanded", "true");
  document.body.classList.add("menu-open");
};

menuToggle?.addEventListener("click", () => {
  const open = menuToggle.getAttribute("aria-expanded") === "true";
  if (open) closeMenu();
  else openMenu();
});

mobileNav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeMenu);
});

const hideDialogParts = () => {
  Object.values(panels).forEach((panel) => {
    if (panel) panel.hidden = true;
  });
  Object.values(successes).forEach((panel) => {
    if (panel) panel.hidden = true;
  });
};

const openDialog = (intent = "trial", plan) => {
  closeMenu();
  if (!overlay) return;
  const mode = intent === "call" ? "call" : "trial";
  hideDialogParts();
  const activeForm = forms[mode];
  if (activeForm) {
    const selectedPlan = plan || activeForm.elements.plan?.value;
    activeForm.reset();
    resetDemoConfirm(activeForm);
    if (selectedPlan && activeForm.elements.plan) {
      activeForm.elements.plan.value = selectedPlan;
    }
  }
  if (panels[mode]) panels[mode].hidden = false;
  overlay.hidden = false;
  overlay.classList.add("is-open");
  document.body.classList.add("orient-open");
  document.body.style.overflow = "hidden";
  const title = panels[mode]?.querySelector("h2");
  if (title && dialog) {
    document.getElementById("dialog-title")?.removeAttribute("id");
    title.id = "dialog-title";
    dialog.setAttribute("aria-labelledby", "dialog-title");
  }
  window.setTimeout(() => forms[mode]?.elements.name?.focus(), 30);
};

const closeDialog = () => {
  if (!overlay) return;
  overlay.hidden = true;
  overlay.classList.remove("is-open");
  document.body.classList.remove("orient-open");
  document.body.style.overflow = "";
};

document.querySelectorAll("[data-open-trial], [data-open-orient]").forEach((el) => {
  el.addEventListener("click", () => openDialog("trial", el.dataset.plan));
});

document.querySelectorAll("[data-open-call]").forEach((el) => {
  el.addEventListener("click", () => openDialog("call", el.dataset.plan));
});

document.querySelectorAll("[data-close-dialog], [data-close-orient]").forEach((el) => {
  el.addEventListener("click", closeDialog);
});

overlay?.addEventListener("click", (event) => {
  if (event.target === overlay) closeDialog();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeDialog();
    closeMenu();
  }
});

const applyForm = document.querySelector("#apply-form");
const applySuccess = document.querySelector("[data-apply-success]");

bindDemoConfirm(applyForm);
bindDemoConfirm(forms.trial);
bindDemoConfirm(forms.call);
resetDemoConfirm(applyForm);
resetDemoConfirm(forms.trial);
resetDemoConfirm(forms.call);

applyForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  setDemoConfirmState(applyForm);
  if (!applyForm.reportValidity()) return;
  applyForm.hidden = true;
  applyForm.closest(".apply")?.classList.add("is-sent");
  if (applySuccess) applySuccess.hidden = false;
});

Object.entries(forms).forEach(([intent, form]) => {
  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    setDemoConfirmState(form);
    if (!form.reportValidity()) return;
    hideDialogParts();
    if (successes[intent]) successes[intent].hidden = false;
  });
});

document.querySelectorAll("[data-accordion] details").forEach((item) => {
  item.addEventListener("toggle", () => {
    if (!item.open) return;
    item.closest("[data-accordion]")
      ?.querySelectorAll("details[open]")
      .forEach((other) => {
        if (other !== item) other.open = false;
      });
  });
});

const demoLog = document.querySelector("#demo-log");
const demoForm = document.querySelector("#demo-form");
const demoInput = document.querySelector("#demo-input");
const demoStage = document.querySelector(".demo-stage");
const demoChips = document.querySelector("#demo-chips");
let demoTurns = 0;

const escapeText = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const addBubble = (role, html) => {
  if (!demoLog) return null;
  const wrap = document.createElement("div");
  wrap.className = `bubble bubble-${role}`;
  wrap.innerHTML = html;
  demoLog.append(wrap);
  demoLog.scrollTop = demoLog.scrollHeight;
  return wrap;
};

const reflect = (raw) => {
  const text = raw.trim();
  const lower = text.toLowerCase();
  if (/сон|ноч|кроват|бессон|подушк|sleep|night|bed|insomnia|pillow/.test(lower)) {
    return "День всё ещё лежит с вами в постели. Положите ладонь на грудь. Удлините следующий выдох, пока плечи не опустятся хоть на сантиметр.";
  }
  if (/почт|работ|встреч|дедлайн|письм|inbox|work|meeting|slack|job|deadline/.test(lower)) {
    return "Почта подождёт девяносто секунд. Почувствуйте стопы на полу. Один медленный выдох — и вернитесь к одной следующей вещи.";
  }
  if (/разговор|слуша|присутств|люди|бесед|talk|conversation|present|listen|people/.test(lower)) {
    return "Вы уже пишете следующую фразу. Вернитесь к той, которую произносят. Слушайте только последнее слово.";
  }
  if (/срыв|броса|привычк|сда|серия|burn|quit|streak|stop|give up|start/.test(lower)) {
    return "Пропущенный день — не обвал. Завтра те же пятнадцать минут. Без перезапуска. Просто продолжаете.";
  }
  if (/груд|челюст|плеч|тело|напряж|голов|chest|jaw|shoulder|body|tension|head/.test(lower)) {
    return "Назовите место — и перестаньте называть. Три дыхания с ощущением. Двигается — идите за ним. Стоит — останьтесь.";
  }
  return "Спасибо. Оставьте эту фразу полежать. Выдох чуть длиннее вдоха — это и есть первый ход.";
};

const finishDemo = () => {
  if (!demoStage || !demoForm) return;
  demoStage.classList.add("is-complete");
  demoInput.disabled = true;
  const close = document.createElement("div");
  close.className = "demo-done";
  const note = document.createElement("p");
  note.textContent = "Вот так выглядит сессия. Ничего не отправлено.";
  const cta = document.createElement("button");
  cta.className = "btn btn-primary";
  cta.type = "button";
  cta.textContent = "Начать 21 день";
  cta.addEventListener("click", () => openDialog("trial", "group"));
  close.append(note, cta);
  demoStage.append(close);
};

const replyTo = async (text) => {
  const typing = addBubble(
    "guide",
    '<p class="bubble-typing" aria-hidden="true"><span></span><span></span><span></span></p>'
  );
  const wait = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? 0
    : 700;
  await new Promise((resolve) => window.setTimeout(resolve, wait));
  typing?.remove();
  addBubble("guide", `<p>${escapeText(reflect(text))}</p>`);
  demoTurns += 1;
  if (demoTurns >= 2) finishDemo();
};

demoForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!demoInput || demoInput.disabled) return;
  const text = demoInput.value.trim();
  if (!text) return;
  addBubble("user", `<p>${escapeText(text)}</p>`);
  demoInput.value = "";
  demoForm.querySelector("button[type='submit']").disabled = true;
  replyTo(text).finally(() => {
    if (demoTurns < 2 && demoForm.querySelector("button[type='submit']")) {
      demoForm.querySelector("button[type='submit']").disabled = false;
      demoInput.focus();
    }
  });
});

demoChips?.querySelectorAll("[data-fill]").forEach((chip) => {
  chip.addEventListener("click", () => {
    if (!demoInput || demoInput.disabled) return;
    demoInput.value = chip.dataset.fill;
    demoInput.focus();
  });
});

const motionOk = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (motionOk && "IntersectionObserver" in window) {
  const items = document.querySelectorAll(".reveal");
  document.documentElement.classList.add("js-motion");
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      }
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0.08 }
  );
  items.forEach((el) => {
    const top = el.getBoundingClientRect().top;
    if (top < window.innerHeight - 48) el.classList.add("is-in");
    else io.observe(el);
  });
}

setScrolled();
window.addEventListener("scroll", setScrolled, { passive: true });
