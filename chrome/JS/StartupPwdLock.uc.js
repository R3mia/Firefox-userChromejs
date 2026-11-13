// ==UserScript==
// @name        Startup Password Lock
// @version     2.0.1
// ==/UserScript==

const CUSTOM_PASSWORD = "123456";
const MAX_ATTEMPTS = 3;
const DIALOG_URL = "chrome://global/content/commonDialog.xhtml";
const BROWSER_URL = "chrome://browser/content/browser.xhtml";
const OWNER_TOPIC = "remia-startup-pwd-lock-owner";
let started = false;

function checkPassword() {
  const args = Cc["@mozilla.org/hash-property-bag;1"]
    .createInstance(Ci.nsIWritablePropertyBag2);
  args.setPropertyAsAString("promptType", "promptPassword");
  args.setPropertyAsAString("title", "Unlock Zen");
  args.setPropertyAsAString("text", "Enter your password to unlock Zen.");
  args.setPropertyAsAString("pass", "");
  args.setPropertyAsBool("useTitle", true);
  args.setPropertyAsBool("ok", false);
  args.setPropertyAsBool(OWNER_TOPIC, true);

  let remaining = MAX_ATTEMPTS;

  function onDialogLoaded(popup) {
    const doc = popup.document;
    if (doc.documentURI !== DIALOG_URL) return;
    const params = popup.arguments?.[0]?.QueryInterface(Ci.nsIPropertyBag2);
    if (!params?.hasKey(OWNER_TOPIC)) return;

    const dialog = doc.getElementById("commonDialog");
    const input = doc.getElementById("password1Textbox");
    const message = doc.getElementById("infoBody");
    const ok = dialog.getButton("accept");
    const cancel = dialog.getButton("cancel");

    function updateOK() {
      ok.disabled = input.value === "";
    }

    function stop(event) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }

    function handleEnter(event) {
      if (event.key !== "Enter" || event.isComposing) return;
      if (event.composedPath().includes(cancel) || cancel.matches(":focus")) return;
      if (input.value !== "" && !event.repeat) return;
      stop(event);
      if (input.value === "" && remaining === MAX_ATTEMPTS) {
        message.textContent = "Please enter your password.";
      }
      input.focus();
    }

    updateOK();
    input.addEventListener("input", updateOK);
    popup.addEventListener("keydown", handleEnter, true);
    popup.addEventListener("keypress", handleEnter, true);
    popup.addEventListener("dialogaccept", event => {
      if (input.value !== "" && input.value === CUSTOM_PASSWORD) return;
      stop(event);
      if (input.value !== "") {
        input.value = "";
        updateOK();
        if (--remaining === 0) {
          dialog.cancelDialog();
          return;
        }
        const unit = remaining === 1 ? "attempt" : "attempts";
        message.textContent = `Incorrect password. You have ${remaining} ${unit} left.`;
      }
      input.focus();
    }, true);

    function focusPassword() {
      popup.focus();
      Services.focus.setFocus(input, Ci.nsIFocusManager.FLAG_RAISE);
    }
    popup.addEventListener("MozAfterPaint", focusPassword, { once: true });
    focusPassword();
  }

  Services.obs.addObserver(onDialogLoaded, "common-dialog-loaded");
  try {
    Services.ww.openWindow(null, DIALOG_URL, "_blank", "chrome,dialog,modal,centerscreen", args);
    return args.getPropertyAsBool("ok") &&
      args.getPropertyAsAString("pass") === CUSTOM_PASSWORD;
  } finally {
    Services.obs.removeObserver(onDialogLoaded, "common-dialog-loaded");
  }
}

function onStartup(subject, topic) {
  if (started) return;
  if (topic === "document-element-inserted" && subject.documentURI !== BROWSER_URL) return;
  started = true;
  Services.obs.removeObserver(onStartup, "final-ui-startup");
  Services.obs.removeObserver(onStartup, "document-element-inserted");
  try {
    if (checkPassword()) return;
  } catch (error) {
    console.error("StartupPwdLock", error);
  }
  Services.startup.quit(Ci.nsIAppStartup.eForceQuit);
}

function install() {
  if (Services.appinfo.processType !== Ci.nsIXULRuntime.PROCESS_TYPE_DEFAULT) return;
  if (Cc["@mozilla.org/backgroundtasks;1"]?.getService(Ci.nsIBackgroundTasks).isBackgroundTaskMode) return;

  // All module copies in this process share the same observer service.
  if (Array.from(Services.obs.enumerateObservers(OWNER_TOPIC)).length) return;
  Services.obs.addObserver({ observe() {} }, OWNER_TOPIC);
  Services.obs.addObserver(onStartup, "final-ui-startup");
  Services.obs.addObserver(onStartup, "document-element-inserted");
  if (!Services.startup.startingUp) onStartup(null, "final-ui-startup");
}

install();
