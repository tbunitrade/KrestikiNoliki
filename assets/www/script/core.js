var MyApp = {

    init: function(){
        // region handlebars helpers

        Handlebars.registerHelper('repeat', function(n, options) {
            for (var out = '', i = 0; i < n ; i++){
                out += options.fn ? options.fn() : options || '';
            }
            return new Handlebars.SafeString(out);
        });

        // endregion

    },



    start: function(){
        this.init();

        this.viewPort = $('#viewport');

        this.board = new MyApp.controls.Board(3, 3);

        this.board.renderTo('viewport');



    },

    beep: function(number){
        navigator.notification.beep(number || 2);
    },

    vibrate: function(duration){
        navigator.notification.vibrate(duration || 1000);
    }
};

MyApp.controls = {


    Board: function(x, y){

        this._x = x || 3;
        this._y = y || 3;

        var getHtml = function(){
            var tplText =
                '<table class="board">' +
                    '{{#repeat ' + x + '}}' +
                        '<tr>' +
                            '{{repeat ' + y + ' "<td>z</td>"}}' +
                        '</tr>' +

                    '{{/repeat}}' +
                '</table>';

            var tpl = Handlebars.compile(tplText);

            var html = tpl({x: x, y: y});
            return html;
        };

        var initEvents = function(table){
            table.on('click', function(e){
                var target = e.target;

                if (!(target && target.tagName === 'TD')){
                    return;
                }

                var targetWrap = $(target);
                var column = targetWrap.parent().children().index(target);
                var row = targetWrap.parent().parent().children().index(target.parentNode);

                alert('column: ' + column + '; row: ' + row);
            });

        };

        this.getTargetCell = function(e){

        };

        this.renderTo = function(parentId){
            var html = getHtml();

            var table = $('#' + parentId).append(html);
            initEvents(table);
        };

















    }

};