// Baimuru Primary School — site script
// Kept deliberately small and dependency-free.

document.addEventListener("DOMContentLoaded", function () {
  // Mobile nav toggle
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".nav-inner");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      nav.classList.toggle("open");
      var expanded = nav.classList.contains("open");
      toggle.setAttribute("aria-expanded", expanded ? "true" : "false");
    });
  }

  // Highlight the current page in the nav
  var links = document.querySelectorAll(".nav-inner a");
  var here = window.location.pathname.split("/").pop() || "index.html";
  links.forEach(function (link) {
    var target = link.getAttribute("href");
    if (target === here) {
      link.setAttribute("aria-current", "page");
    }
  });
});
