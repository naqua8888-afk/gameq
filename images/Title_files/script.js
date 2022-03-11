window.onscroll = function() {scrollFunction()};

function scrollFunction() {
    if (document.body.scrollTop > 50 || document.documentElement.scrollTop > 50) {
        document.querySelector(".nav-header").classList.add("scrolled")
    } else {
        document.querySelector(".nav-header").classList.remove("scrolled");
    }
}