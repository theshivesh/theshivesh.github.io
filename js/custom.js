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
