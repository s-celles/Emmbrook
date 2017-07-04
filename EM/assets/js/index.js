/**
 * Created by qizhang on 7/1/17.
 */

$(document).tooltip({show: null});

$(document).ready(function () {
        $("#pop").on("click", function () {
            $("#img-preview").attr("src", $("#prime-img").attr("src"));
            $("#img-modal").modal("show");
        })
    }
);