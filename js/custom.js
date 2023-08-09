// const cricle = document.getElementById("cursor");
// const circleStyle = cricle.style;

// document.addEventListener("mousemove", (e) => {
//     circleStyle.top = `${e.clientY - cricle.offsetHeight / 2}px`;
//     circleStyle.left = `${e.clientX - cricle.offsetWidth / 2}px`;
// });

$(window).mousemove(function (e) {
    $(".cursor").css({
        left: e.pageX,
        top: e.pageY,
    });
});

$("a")
    .on("mouseenter", function () {
        $(".cursor").addClass("focus");
    })
    .on("mouseleave", function () {
        $(".cursor").removeClass("focus");
    });

$(".button")
    .on("mouseenter", function () {
        $(".cursor").addClass("focused-button");
    })
    .on("mouseleave", function () {
        $(".cursor").removeClass("focused-button");
    });

// function setTransform(el, transf) {
//     el.css("transform", transf);
//     el.css("-moz-transform", transf);
//     el.css("-webkit-transform", transf);
//     el.css("-o-transform", transf);
//     el.css("-ms-transform", transf);
// }

// $(function () {
//     var el = $(".intro"),
//         mac = $("#mac"),
//         offset = mac.offset(),
//         windowHeight = $(window).height();

//     $(window).on("scroll", function () {
//         $("h1").fadeOut(500);

//         var windowTop = $(window).scrollTop(),
//             scrollPercent = (offset.top - windowTop) / offset.top,
//             scale = "scale(" + scrollPercent + ")";

//         setTransform(el, scale);

//         if (windowTop >= 940) {
//             el.hide();
//         } else {
//             el.show();
//         }
//     });
// });
