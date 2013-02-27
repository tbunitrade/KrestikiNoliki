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
        this.x = 3;
        this.y = 3;


        this.init();

        this.viewPort = $('#viewport');
        this.board = new MyApp.controls.Board(this.x , this.y);
        this.board.renderTo('viewport');
        MyApp.utils.addListener(this.board, 'cellclick', this._cellClickHandler, this);

        this.label = new MyApp.controls.Label();
        this.label.renderTo('viewport');
        this.label.dom.css('display', 'block');

        this.startButton = new MyApp.controls.Button({
            text: 'Start new game'
        });
        this.startButton.renderTo('viewport');
        MyApp.utils.addListener(this.startButton, 'click', this.gameStart, this);



    },

    _data: null,
    _lastOperation: 'O',

    gameStart: function(){
        this.resetBoard();
        this._lastOperation = 'O';     // starting with "X"

        var op = this._lastOperation === 'O' ? 'O' : 'X';
        this.label.setText(op + ' - Make your move');
    },

    resetBoard: function(){
        this._data = [];
        this.label.setText('');
        this.board.clearCells();
    },

    _cellClickHandler: function(o){

        if (this._moveAvailable(o.row, o.col)){

            var sign = this._lastOperation === 'X' ? 'O' : 'X';
            this._updateData(o.row, o.col, sign);

            this._lastOperation = sign;
            var text = sign === 'X' ? 'x' : 'o';
            this.board.setCellContent(o.row, o.col, text);

            var res = this._checkLineReady();
            if (res){
                alert(res.sign + ' is the winner.');
            }

        } else {
            this.board.showCellDirty(o.row, o.col);
        }

    },

    _moveAvailable: function(row, col){
        return this._data[row]
                    ? this._data[row][col] === undefined
                    : true;
    },

    _updateData: function(row, col, sign){
        if (!this._data[row]){
            this._data[row] = [];
        }

        this._data[row][col] = sign;
    },

    _checkLineReady: function(){
        var res = {};

        // check horizontals
        for (var i = 0, l = this._data.length; i < l; i++){
            var line = this._data[i];

            if (!line){
                continue;
            }

            var s = {
                x: 0,
                o: 0
            };
            for (var j = 0, k = line.length; j < k; j++){
                var v = line[j];
                if (v === 'X'){
                    s.x++;
                } else if (v === 'O'){
                    s.o++;
                }
            }

            if (s.x === this.x || s.o === this.x){
                res.finished = true;
                res.line = i;
                res.sign = line[0];
                break;
            }
        }

        if (res.finished){
            return res;
        }

        // check verticals
        for (var i = 0; i < this.y; i++){
            var s = {
                x: 0,
                o: 0
            };

            for (var j = 0; j < this.x; j++){
                var line = this._data[j];
                if (!line){
                    continue;
                }

                var v = line[i];
                if (v === 'X'){
                    s.x++;
                } else if (v === 'O'){
                    s.o++;
                }
            }

            if (s.x === this.y || s.o === this.y){
                res.finished = true;
                res.col = i;
                res.sign = this._data[0][i];
                break;
            }
        }

        if (res.finished){
            return res;
        }

        // check first diagonal
        var s = {
            x: 0,
            o: 0
        };

        for (var i = 0; i < this.x; i++){
            if (this._data[i] && this._data[i][i]){
                var v = this._data[i][i];

                if (v === 'X'){
                    s.x++;
                } else if (v === 'O'){
                    s.o++;
                }
            }
        }

        if (s.x === this.y || s.o === this.y){
            res.finished = true;
            res.col = i;
            res.sign = this._data[0][0];
        }

        if (res.finished){
            return res;
        }

        // check second diagonal
        var s = {
            x: 0,
            o: 0
        }

        for (var i = 0; i < this.x; i++){
            if (this._data[i] && this._data[i][this.x - 1 - i]){
                var v = this._data[i][this.x - 1 - i];

                if (v === 'X'){
                    s.x++;
                } else if (v === 'O'){
                    s.o++;
                }
            }
        }

        if (s.x === this.y || s.o === this.y){
            res.finished = true;
            res.col = i;
            res.sign = this._data[0][this.x - 1];
        }

        if (res.finished){
            return res;
        }

        return null;
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

        this.setCellContent = function(row, col, text){
            console.log(text);
            if (!this._table){
                return;
            }

            var rowEl = $(this._table.find('TR')[row]);
            var cellEl = $(rowEl.children()[col]);
            cellEl.html(text);
        };

        this.clearCells = function(){
            this._table.find('TD').html('&nbsp');
        };

        this.showCellDirty = function(row, col){

        };

    },

    Label: function(){
        // TODO remove hardcode
        var id = 'label';

        var getHtml = function(){
            // TODO
            return '<span id="' + id + '" style="textlabel">Dummy</span>';
        };

        this.renderTo = function(parentId){
            $('#' + parentId).append(getHtml());
            this.dom = $('#' + id);
        };

        this.setText = function(text){
            if (this.dom){
                this.dom.html(text);
            }
        };
    },

    Button: function(cfg){
        cfg = cfg || {};


        var id = cfg.id || 'button';

        var getHtml = function(){
            return '<button id="' + id + '">' + cfg.text + '</button>';
        };

        var that = this;

        var initEvents = function(button){

            button.on('click', function(e){
                e.stopPropagation();
                MyApp.utils.fireEvent(that, 'click');
            });

        };

        this.renderTo = function(parentId){
            $('#' + parentId).append(getHtml());

            this.dom = $('#' + id);
            initEvents(this.dom);

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
            console.log('Sender is null or no listeners');
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