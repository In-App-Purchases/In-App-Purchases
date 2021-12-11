const btn = document.querySelector(".btn-toggle");

btn.addEventListener("click", function () {
  document.body.classList.toggle("dark-theme");
});

function buttontext() {
  if ($('body').hasClass('dark-theme')) {
    document.getElementById("themeswitch").innerHTML="Dark Mode?";
  }
  else {
      document.getElementById("themeswitch").innerHTML="Light Mode?";
  }

}
