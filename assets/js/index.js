/**
 * Created by Qi on 6/7/17.
 */

$(document)
    .ready(function () {
        let scroll_start = 0;
        // Position where background color start to change
        let startchange = $('#preview');
        let offset = startchange.offset();
        if (startchange.length) {
            $(document)
                .scroll(function () {
                    scroll_start = $(this)
                        .scrollTop();
                    if (scroll_start > offset.top - 62.5) {
                        $('.navbar-light')
                            .css('background-color', '#f0f0f0');
                    } else {
                        $('.navbar-light')
                            .css('background-color', 'transparent');
                    }
                });
        }
    });

$(document)
    .ready(function () {
        // Add smooth scrolling to all links in navbar + footer link
        $(".navbar a, footer a[href='#page-top'], .btn-lg")
            .on('click', function (event) {

                // Make sure this.hash has a value before overriding default behavior
                if (this.hash !== '') {

                    // Prevent default anchor click behavior
                    event.preventDefault();

                    // Store hash
                    let hash = this.hash;

                    // Using jQuery's animate() method to add smooth page scroll
                    // The optional number (900) specifies the number of milliseconds it takes to scroll to the specified area
                    $('html, body').animate({
                        scrollTop: $(hash).offset().top
                    }, 900, function () {

                        // Add hash (#) to URL when done scrolling (default click behavior)
                        window.location.hash = hash;
                    });
                }  // End if
            });
    });