(function () {
  var events = [];

  function remember(type, payload) {
    var event = {
      type: type,
      payload: payload || {},
      at: new Date().toISOString()
    };
    events.push(event);
    window.__localTrackingEvents = events;
    try {
      localStorage.setItem("playrwdzLocalTracking", JSON.stringify(events.slice(-50)));
    } catch (error) {}
  }

  window.trackOfferClick = function (url) {
    remember("offer-click", { url: url });
    setTimeout(function () {
      window.location.href = url;
    }, 100);
  };

  remember("view", {
    path: window.location.pathname,
    search: window.location.search,
    templateId: window.__tpl || null
  });
})();
