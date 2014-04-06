$(function() {
    $('#footnote').click(function() {
        $(document.body).addClass('showrefs');
    });

    $('#ref-close').click(function() {
        $(document.body).removeClass('showrefs');
    });
})