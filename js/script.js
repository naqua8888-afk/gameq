window.onscroll = function() {scrollFunction()};
window.onload = function() {scrollFunction()};

function scrollFunction() {
    if (document.body.scrollTop > 50 || document.documentElement.scrollTop > 50) {
        document.querySelector(".nav-header").classList.add("scrolled");
        MenuElement.classList.remove('fold')
    } else {
        document.querySelector(".nav-header").classList.remove("scrolled");
    }
}

var MenuElement = document.querySelector('.nav-header');

function toggleMenu() {
    MenuElement.classList.toggle('fold')
}

document.addEventListener('click', function(event) {
    var isClickInsideElement = MenuElement.contains(event.target);
    if (!isClickInsideElement) {
        MenuElement.classList.remove('fold')
    }
});