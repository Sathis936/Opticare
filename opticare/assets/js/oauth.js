/**
 * OptiCare OAuth Configuration — Google & Apple Sign In
 *
 * Replace the empty string values below with your actual OAuth credentials.
 *
 * Google:  https://console.cloud.google.com/apis/credentials
 * Apple:   https://developer.apple.com/account/resources/identifiers/list
 *
 * In production, use a server-side proxy — never expose secrets client-side.
 */
(function () {
  var oauthConfig = {
    google: {
      clientId: "",
      redirectUri: "",
      scope: "openid email profile"
    },
    apple: {
      clientId: "",
      redirectUri: "",
      scope: "name email",
      state: ""
    }
  };

  function buildGoogleUrl() {
    var c = oauthConfig.google;
    if (!c.clientId) return "#";
    return "https://accounts.google.com/o/oauth2/v2/auth"
      + "?client_id=" + encodeURIComponent(c.clientId)
      + "&redirect_uri=" + encodeURIComponent(c.redirectUri)
      + "&response_type=code"
      + "&scope=" + encodeURIComponent(c.scope)
      + "&prompt=select_account";
  }

  function buildAppleUrl() {
    var c = oauthConfig.apple;
    if (!c.clientId) return "#";
    var state = c.state || Math.random().toString(36).substring(2, 15);
    return "https://appleid.apple.com/auth/authorize"
      + "?client_id=" + encodeURIComponent(c.clientId)
      + "&redirect_uri=" + encodeURIComponent(c.redirectUri)
      + "&response_type=code id_token"
      + "&scope=" + encodeURIComponent(c.scope)
      + "&response_mode=form_post"
      + "&state=" + encodeURIComponent(state);
  }

  var builders = { google: buildGoogleUrl, apple: buildAppleUrl };

  var warned = {};

  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-oauth-provider]");
    if (!btn) return;

    var provider = btn.getAttribute("data-oauth-provider");
    var build = builders[provider];
    if (!build) return;

    var url = build();

    if (url === "#") {
      e.preventDefault();
      if (!warned[provider]) {
        warned[provider] = true;
        console.warn(
          "[OptiCare] " + provider.charAt(0).toUpperCase() + provider.slice(1) +
          " Sign-In is not configured. Set credentials in assets/js/oauth.js."
        );
      }
      alert(
        provider.charAt(0).toUpperCase() + provider.slice(1) +
        " Sign-In is not yet configured.\n\n" +
        "Please set your OAuth credentials in:\nassets/js/oauth.js"
      );
      return;
    }

    btn.href = url;
  }, false);
})();
