
var enableEdit = false;
var showMenu = true;
var isFirst = true;

var picturesNum = 1;

$('#menu').click(function () {
    showMenu = !showMenu;
    $('#control-panel').css('display', (showMenu ? '' : 'none'));
});


(function dialogs() {

    $('#greetings-dialog').dialog({
        autoOpen: false,
        modal: true,
        width: 800

    });

    $('#bomb-dialog').dialog({
        autoOpen: false,
        modal: true,
        width: 635

    });

    $('#joke-dialog').dialog({
        autoOpen: false,
        modal: true,
        width: 735,
        close: function myfunction() {
            openJokeDialog();
        }

    });

    $('#timer-dialog').dialog({
        autoOpen: false,
        //modal: true,
        width: 320,
        height: 415,
        close: function (ev, ui) {
            picturesNum += 1;
            if (picturesNum >= 7) {
                picturesNum = 1;
            }
            var folderNum = Number($('#folder').val()),
                src = 'imgs/' + folderNum + '/' + picturesNum + '.jpg';
            $('#timer-pictures').attr('src', src);
        }
    });

}());


$(document).ready(function () {

    $('#generate-crossword').click(function () {
        var x = parseInt($('#control-panel input[type="number"]').eq(0).val()),
            y = parseInt($('#control-panel input[type="number"]').eq(2).val());

        x = x > 30 ? 30 : (x < 5 ? 5 : x);
        y = y > 10 ? 10 : (y < 3 ? 3 : y);
        generateCrossword(x, y);

    });

    //Edit font-size
    document.querySelector('#font-size').addEventListener('input', function () {
        $('span').css('font-size', Number(this.value));
    });

    //Spinning wheel animation;
    $('#wheel-image').css('margin-left', window.innerWidth / 2 - 400);
    $('#arrow').css('margin-left', 400 - 36);
    $('#kuci-img').click(function () {
        var prevStyle = this.style['-webkit-transform'],
            prevDeg = Number(prevStyle.substring(7, (prevStyle.lastIndexOf(')') - 3)));
        this.removeAttribute('style');

        var deg = 500 + Math.round(Math.random() * 499),
            easeOut = Math.round(deg / 100);
        deg += prevDeg;
        var css = '-webkit-transform: rotate(' + deg + 'deg); -webkit-transition: -webkit-transform ' + easeOut + 's ease-out;';

        this.setAttribute('style', css);
    });

    $('#save-template').click(function () {
        var rows = $('.row'),
            arr = [];
        for (var i = 0; i < rows.length; i++) {
            arr[i] = [];
            var letters = rows[i].querySelectorAll('span');

            for (var j = 0; j < letters.length; j++) {
                arr[i].push(letters[j].textContent);
            }
        };

        var blob = new Blob([JSON.stringify(arr)], {
            type: "application/json"
        }),
            url = URL.createObjectURL(blob),
            aLink = document.getElementById('save-link');

        aLink.download = 'crossword.txt';
        aLink.href = url;
        aLink.click();
    });

    document.getElementById('load-template').addEventListener('change', function (e) {
        var file = e.target.files[0],
            reader = new FileReader();
        reader.onload = function (event) {

            var contents = event.target.result,
				arr = JSON.parse(contents);
            generateCrossword(arr[0].length, arr.length, arr);
        };
        reader.readAsText(file);
    }, false);

});

var showWheel = false;
$('#wheel').click(function () {
    showWheel = !showWheel;
    $('#wheel-image').css('display', (showWheel ? 'block' : 'none'));
});

function generateCrossword(x, y, arr) {
    if ($('#crossword-wrapper')) {
        $('#crossword-wrapper').remove();
    }
    enableEdit = false;
    var $prevLetter = $();

    $(document.body).append('<div id="crossword-wrapper"></div>');

    $('#crossword-wrapper').append('<table id="crossword-puzzle"></table>');

    $('table').css('height', window.innerHeight);
    $('table').append(generateFirstRow(x));

    var indexer = 0,
		letters = 'АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪьЮЯ';

    for (var a = 0; a < y; a++) {
        var row = $('<tr class="row">');

        for (var b = 0; b <= x; b++) {
            if (b === 0) {
                row.append('<td class="num-indexer">' + letters[indexer] + '</td>');
                indexer++;
            } else {
                var letter = arr ? arr[a][b - 1] : '';
                row.append('<td><span>' + letter + '</span></td>');
            }
        }
        $('table').append(row);
    }
    var rowHeight = $('tr').eq(1).css('height');
    console.log(rowHeight);

    $('td').css('width', ($('table').width() / $('tr:nth-child(1) td').length) - 40);
    $('.num-indexer').css('width', '2%');

    $('table span:not(.speacial-span)').css('font-size', Number($('#font-size').val()));

    $('td').click(function (ev) {
        if (enableEdit || this.className.indexOf('indexer') != -1) {
            return;
        }

        if (this.className === 'selected-letter') {

            if (this.textContent == '*' || this.textContent == '💣') {
                shakeScreen();
                $('#bomb-dialog').dialog('open');
                this.innerHTML = '<span>&#128163;</span>';
                this.style.color = 'red';
                this.style.fontSize = '70px';
                this.style.height = rowHeight;
                isFirst = false;
            }

            if (this.textContent == '!' || this.textContent == '☺') {
                $('#joke-dialog').dialog('open');
                this.innerHTML = '<span>&#9786;</span>';
                this.style.color = 'green';
                this.style.fontSize = '79px';
                this.style.height = rowHeight;
                isFirst = false;
            }
            if (isFirst) {
                $('#greetings-dialog').dialog('open');
                isFirst = false;
            }

            $(this).find('span').animate({
                'opacity': 1
            }, 1000);
            $(this).addClass('revealed-letter');

            $(this).removeClass('selected-letter');
            $prevLetter = $();

            return;
        } else if ($prevLetter.length !== 0) {
            $prevLetter.removeClass('selected-letter');
        }

        $(this).addClass('selected-letter');
        $prevLetter = $(this);
    });

    $('#edit-crossword').click(function () {
        if (!enableEdit) {
            $('td:not(.indexer):not(.num-indexer)').attr('class', '');
            $('table span').attr('class', 'edit-letter');
            $('.edit-letter').attr('contenteditable', 'true');
        }
        enableEdit = true;
        $('#clear-crossword').attr('disabled', false);
    });

    $('#clear-crossword').click(function () {
        $('table span').html('');
    });

    $('#start-game').click(function () {
        enableEdit = false;
        $('table span').attr('class', '');
        $('table span').attr('contenteditable', 'false');
        $('#clear-crossword').attr('disabled', true);
    });

    $('.disabled').removeAttr('disabled');
    $('#clear-crossword').attr('disabled', true);
    setHeights();
}

function shakeScreen() {
    counter = 0;
    document.body.className = 'shake shake-hard';
    var interval = setInterval(function shake() {
        if (counter === 1) {
            document.body.className = '';
            clearInterval(interval);
            return;
        }
        document.body.className = 'shake';
        counter++;
    }, 1200);

}

$(document.body).keydown(function (ev) {
    if (ev.ctrlKey && ev.keyCode === 81) {
        activateTimer();
    }
});

function activateTimer() {
    var start = 10,
		text = $('#timer-dialog p');

    picturesNum += 1;
    if (picturesNum >= 7) {
        picturesNum = 1;
    }
    var folderNum = Number($('#folder').val()),
        src = 'imgs/' + folderNum + '/' + picturesNum + '.jpg';

    text.html('10.0');
    $('#timer-dialog').dialog('open');
    var interval = setInterval(function () {
        start -= 0.1;
        text.html(start.toFixed(1));
        if (start <= 0) {
            clearInterval(interval);
            $('#timer-pictures').attr('src', src);
            text.html('Седи си');
        }
    }, 100)
};

function generateFirstRow(len) {
    var result = '<td class="indexer"></td>';
    for (var i = 1; i <= len; i++) {
        result += '<td class="indexer">' + i + '</td>';
    }
    return '<tr>' + result + '</tr>';
}

function setHeights() {
    var height = $('td').height();
    $('table span').css('height', height);
}

$('#folder').keyup(function () {
    var folderNum = Number($('#folder').val()),
        src = 'imgs/' + folderNum + '/' + picturesNum + '.jpg';
    $('#timer-pictures').attr('src', src);
});

var jokeNum = 1;
$('#joke-nums').keyup(function () {
    var num = Number($(this).val());
    jokeNum += num;
    if (jokeNum >= 7) {
        jokeNum = 1;
    }
    var src = 'imgs/' + jokeNum + '.jpg';
    $('#joke-image').attr('src', src);
});

function openJokeDialog() {
    jokeNum += 1;
    if (jokeNum > 4) {
        jokeNum = 1;
    }
    var src = 'imgs/' + jokeNum + '.jpg';
    $('#joke-image').attr('src', src);
}


