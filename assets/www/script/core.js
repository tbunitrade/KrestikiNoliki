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

        MyApp.utils.addListener(this.board, 'cellclick', this._cellClickHandler, this);

    },

    _lastOperation: false,

    _cellClickHandler: function(o){

        var sign = this._lastOperation ? 0 : 1;
        this._lastOperation = sign;
        var text = sign ? 'x' : 'o';
        this.board.setCellContent(o.col, o.row, text);
    }
};

MyApp.controls = {


    Board: function(x, y){
        var that = this;

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

                MyApp.utils.fireEvent(that, 'cellclick', {col: column, row: row});
            });

        };

        this.renderTo = function(parentId){
            var html = getHtml();

            $('#' + parentId).append(html);
            this._table = $('table');
            initEvents(this._table);
        };

        this.setCellContent = function(col, row, text){
            console.log(text);
            if (!this._table){
                return;
            }

            var rowEl = $(this._table.find('TR')[row]);
            var cellEl = $(rowEl.children()[col]);
            cellEl.html(text);
        };

    }

};

MyApp.utils = {

    _events: [],

    fireEvent: function(sender, eventName, args){
        var eventObj = null;

        for (var i = 0, l = this._events.length; i < l; i++){
            if (this._events[i].sender === sender){
                eventObj = this._events[i];
                break;
            }
        }

        if (!eventObj){
            console.log('Sender is null');
            return;
        }

        var e = eventObj.events[eventName];

        if (!e){
            console.log('Event does not exist or no listeners ' + eventName);
            return;
        }

        for (var i = 0, l = e.length; i < l; i++){
            var o = e[i];
            o.callback.call(o.scope || this, args);
        }
    },

    addListener: function(sender, eventName, callback, scope){
        var eventObj = null;
        for (var i = 0, l = this._events.length; i < l; i++){
            if (this._events[i].sender === sender){
                eventObj = this._events[i];
                break;
            }
        }

        if (eventObj){
            var e = eventObj.events[eventName];

            if (e){
                var callbackFound = false;

                for (var i = 0, l = e.length; i < l; i++){
                    if (e[i].callback === callback && e[i].scope === scope){
                        callbackFound = true;
                        break;
                    }
                }

                if (!callbackFound){
                    e.push({
                        callback: callback,
                        scope: scope
                    });
                }

            } else {
                e[eventName] = [{
                    callback: callback,
                    scope: scope
                }];
            }

        } else {
            // event foes not exists. Adding.

            var events = {};
            events[eventName] = [{
                callback: callback,
                scope: scope
            }];
            this._events.push({
                sender: sender,
                events: events
            });
        }



    }

};