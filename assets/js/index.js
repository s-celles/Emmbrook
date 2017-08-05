/**
 * Created by Qi on 6/7/17.
 */

$(document)
    .ready(function () {
        var scroll_start = 0;
        // Position where background color start to change
        var startchange = $('#preview');
        var offset = startchange.offset();
        if (startchange.length) {
            $(document)
                .scroll(function () {
                    scroll_start = $(this)
                        .scrollTop();
                    if (scroll_start > offset.top) {
                        $('.navbar-light')
                            .css('background-color', '#f0f0f0');
                    } else {
                        $('.navbar-light')
                            .css('background-color', 'transparent');
                    }
                });
        }
    });
