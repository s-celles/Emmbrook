/**
 * Created by Qi on 5/20/17.
 */

$(document).tooltip({show: null});

$(document).ready(function () {
        $("#pop").on("click", function () {
            $("#img-preview").attr("src", $("#prime-img").attr("src"));
            $("#img-modal").modal("show");
        })
    }
);