// Baimuru Primary School — App tools
// These tools build a ready-made text prompt from a form, for the
// teacher to copy and paste into an external AI assistant (Claude,
// ChatGPT, etc). No AI runs on this site — it's all done in the
// teacher's own AI account, which keeps this free static site simple
// and avoids exposing any API key.

function toolCopy(textareaId, btnId) {
  var el = document.getElementById(textareaId);
  var btn = document.getElementById(btnId);
  el.select();
  el.setSelectionRange(0, 999999);
  navigator.clipboard.writeText(el.value).then(function () {
    var original = btn.textContent;
    btn.textContent = "Copied!";
    setTimeout(function () { btn.textContent = original; }, 1800);
  }).catch(function () {
    // Fallback for browsers without clipboard API permission
    document.execCommand("copy");
  });
}

function toolShowOutput(outputWrapId) {
  document.getElementById(outputWrapId).style.display = "block";
  document.getElementById(outputWrapId).scrollIntoView({ behavior: "smooth", block: "start" });
}
