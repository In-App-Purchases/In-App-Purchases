const btn = document.querySelector(".btn-toggle");

btn.addEventListener("click", function () { /*when the dark mode button is clicked it toggles the dark theme is toggled on*/
  document.body.classList.toggle("dark-theme");
});

function buttontext() { /*this changes the text on the button that changes the color theme depending on if dark mode is active*/
  if ($('body').hasClass('dark-theme')) {
    document.getElementById("themeswitch").innerHTML="Dark Mode?";
  }
  else {
      document.getElementById("themeswitch").innerHTML="Light Mode?";
  }

}
