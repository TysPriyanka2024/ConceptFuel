'use strict';
var notify = $.notify('<i class="fas fa-bell"></i></i><strong>Loading</strong> page Do not close this page...', {
    type: 'theme',
    allow_dismiss: true,
    delay: 4000,
    showProgressbar: true,
    timer: 300,
    // timer: 555555500,
    animate: {
        enter: 'animated fadeInDown',
        exit: 'animated fadeOutUp'
    }
});

const errorData = '<%= error %>';

setTimeout(function () {
    notify.update('message', '<i class="fas fa-bell"></i></i><strong>Loading</strong>' + errorData);
}, 1000);