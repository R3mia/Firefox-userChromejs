(function () {
  'use strict';

  const CUSTOM_PASSWORD = "123456";

  try {
    const password = { value: "" };
    const result = Services.prompt.promptPassword(
      null,
      "Verify Firefox/Zen password",
      "Please enter your password to continue using Firefox/Zen:",
      password
    );

    if (!result || password.value !== CUSTOM_PASSWORD) {
      Services.startup.quit(Services.startup.eForceQuit);
    }
  } catch {
    Services.startup.quit(Services.startup.eForceQuit);
  }
})();