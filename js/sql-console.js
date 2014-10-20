/*
 * This javascript object controls the majority of console functionality.
 */
var sql_console = {
    /**
    * This is just the mysql prompt text.
    */
    prompt: "mysql> ",

    /**
    * This stores the history of the queries run this session.
    */
    history: Array(),

    /**
     * This tracks users position in history array during cycling.
     */
    history_position: 0,

    /**
    * This is the last run query
    */
    last_sql: '',

    /**
    * This will either be a semi-colon (;) or \G
    */
    terminator: '',

    /**
     * This determines whether output format is normal or stacked.
     */
    format: '',

    /**
     * This is the default theme.
     */
     theme: 'tron',

    /**
    * Store the console dom object instead of looking it up all the time
    */
    console: $('.console'),

    /**
    * URL to post query to
    */
    query_url: 'endpoint.php',

    /**
     * Initialize!
     */
    init: function() {
        // check localStorage for theme setting
        this.theme = (localStorage.getItem('sql-console-theme')) ? localStorage.getItem('sql-console-theme') : this.theme;

        // check localStorage for history and position
        var local_history = JSON.parse(localStorage.getItem('sql-console-history'));
        this.history = (local_history) ? local_history : this.history;
        this.history_position = (localStorage.getItem('sql-console-history_position')) ? localStorage.getItem('sql-console-history_position') : this.history_position;

        // set the theme
        this.change_theme(this.theme);

        // add focus to the prompt
        this.focus_prompt();

        // enable the settings dropdown
        $('.dropdown-toggle').dropdown();
    },

    /**
     * This checks to make sure the console has a terminator to trigger the query.
     * It also sets up a few variables used for history and output format logic.
     *
     * @return bool
     */
    query_ready: function() {
        var text = $(this.console).val().trim();
        if (text.substr(-1) === ';') {
            this.terminator = ';';
            this.last_sql   = text.substr(7).slice(0, -1);
            this.format     = 'normal';
            return true;
        }
        else if (text.substr(-2) === "\\G") {
            this.terminator = "\\G";
            this.last_sql   = text.substr(7).slice(0, -2);
            this.format     = 'stacked';
            return true;
        }
        else if (text.substr(-4) === 'exit') {
            this.last_sql   = text.substr(7);
            this.terminator = '';
            window.location.href = 'index.php?module=Administration&action=index';
            return false;
        }
        else if (text.substr(-5) === 'clear') {
            this.last_sql   = '';
            this.terminator = '';
            this.clear_history();
            return false;
        }
        else {
            this.terminator = '';
            this.format     = '';
            return false;
        }
    },

    /*
     * This will add the query to history and post it to the query_url for execution.
     */
    run_query: function() {
        // make sure we're good to go
        if (this.query_ready()) {
            $(this.console).val("");
            this.update_history();

            $.post(this.query_url, {sql: this.last_sql, format: this.format})
            .done(function(data) {
                sql_console.show_result(data);
                $(sql_console.console).focus().val(sql_console.prompt);
            });
        }
    },

    /*
     * Save the query to the local storage history.
     */
    update_history: function() {
        // add query to the history array, but only if it is different from the last run command
        if (String(this.history[this.history.length - 1]) != String(this.last_sql + this.terminator)) {
            this.history.push(this.last_sql + this.terminator);
        }

        // after we run a command, reset history position to be one step ahead of last array index, which conveniently equals the length
        this.history_position = this.history.length;

        // update localStorage with history and position values
        localStorage.setItem('sql-console-history', JSON.stringify(this.history));
        localStorage.setItem('sql-console-history_position', this.history_position);

        // build the string for display
        var history = this.prompt + this.last_sql + this.terminator + '<br/>';
        $('.history').append(history);
    },

    /*
     * Clears the local storage history out and also clears out the browser window results.
     */
    clear_history: function() {
        // wipe out the sql_console.history array and position values
        this.history = Array();
        this.history_position = 0;

        // clear the localStorage memory of history and position
        localStorage.removeItem('sql-console-history');
        localStorage.removeItem('sql-console-history_position');

        // clear the UI history contents
        $('.history').html('');

        // bring focus back to the prompt
        this.focus_prompt();
    },

    /*
     * Add the results to the browser window history area and scroll to bottom of content.
     */
    show_result: function(data) {
        $('.history').append(data);

        this.scroll_to_bottom();
    },

    /*
     * Animate the scroll to the bottom of the screen contents
     */
    scroll_to_bottom: function() {
        // scroll to the bottom of the page
        $('html, body').animate({scrollTop: $(document).height()-$(window).height()}, 1);
    },

    /*
     * This forces the cursor position such that the mysql> prompt appears to be a prompt.
     */
    cursor_control: function() {
        var pos = $(this.console).getCursorPosition();

        if(pos < 8) {
            $(this.console).setCursorPosition(7);
        }
        else {
            return true;
        }
        return false;
    },

    /*
     * Allows user to cycle through the stored queries in the history using up and down arrow keys.
     */
    cycle_history: function(direction) {
        // this is the last element in the history array
        var end = this.history.length - 1;

        // cycle up through command history
        if (direction == 'up' && (this.history_position >= 0) && (this.history.length > 0)) {
            // if current position is equal to the end we need to decrement first
            if (this.history_position > end) {
                --this.history_position;
            }

            // update the console prompt with history item at designated position
            $(this.console).focus().val(this.prompt + this.history[this.history_position]);

            // decrement the history position
            if (this.history_position > 0) {
                this.history_position--;
            }
        }
        // cycle down through command history
        else if (direction == 'down') {
            // if we are at beginning we don't want to show same command again, skip ahead one
            if (this.history_position == 0) {
                this.history_position++;
            }

            // only allow cycling 'down' when position is less than the end of the array
            if (this.history_position <= end) {
                // update the console prompt with history item at designated position
                $(this.console).focus().val(this.prompt + this.history[this.history_position]);
                // increment the history position
                this.history_position++;
            }
            else if (this.history_position > (end)) {
                // if we are at the end, then reset prompt to be blank
                this.focus_prompt();
            }
        }
    },

    /*
     * Allow the user to change the console theme on the fly.
     * Stores the current theme to local storage so that it will persist beyond current session.
     */
    change_theme: function(theme) {
        // update the UI with new theme
        $('body').removeClass(this.theme).addClass(theme);
        $('.history').removeClass(this.theme).addClass(theme);
        $(this.console).removeClass(this.theme).addClass(theme);

        // update the theme property of this object
        this.theme = theme;

        // store the setting locally so theme will autoload when coming back to or reloading page
        localStorage.setItem('sql-console-theme', theme);

        // if the console already fills the vertical space we need to jump back to bottom
        this.scroll_to_bottom();

        // finally bring focus back to the prompt - possible bug here - if you already started a new query and change the theme
        // this will wipe that out
        this.focus_prompt();
    },

    /*
     * Clears the input area of previous query and resets it only contain the prompt text.
     */
    focus_prompt: function() {
        var txt =
        $(this.console).focus().val(this.prompt);
    },

    /*
     * Allows deleting of 'words' similar to linux console using ctrl + w key combo.
     */
    delete_word: function() {
        var txt = $(this.console).val();

        // get total length of string in prompt
        var len = txt.length;

        // get current position
        var pos = $(this.console).getCursorPosition();

        var i = pos;

        // match any non-whitespace character
        var reg = new RegExp('\\S');

        /**
         * when we first detect a non-whitespace character store its position
         * if the character immediately preceding the cursor position is in fact a space
         * we still set extraction_end_pos to equal that position as it marks the edge
         * of our extraction point
         */
        var extraction_end_pos   = len;
        var extraction_start_pos = pos;

        // gonna step backwards through string looking for the next space character that precedes a non-space character
        // we go until 7 to account for the prompt size 'mysql> '
        while (i > 7) {
            if (reg.test(txt.charAt(i-1))) {
                // only set this if it has not been set yet
                if (!extraction_end_pos) {
                    extraction_end_pos = i;
                }
            }
            else {
                if (i < extraction_end_pos) {
                    extraction_start_pos = i;
                    // found the extraction_start_pos, bust out of while loop
                    break;
                }
                else if (i === len) {
                    extraction_end_pos = i;
                }
            }
            --i;

            // if we made it all the way down to 7, then we need to manually set extraction_start_pos since we will not detect a space otherwise
            if (i == 7) {
                extraction_start_pos = 7;
            }
        }

        // update the console
        $(this.console).focus().val(this.prompt + txt.substring(7, extraction_start_pos) + txt.substring(extraction_end_pos, pos));
        $(this.console).setCursorPosition(extraction_start_pos);
    },
}

// set things up
sql_console.init();

// theme switcher
$('li.theme').click(function(data) {
    sql_console.change_theme($(this).data('theme'));
});

// key command interface
$('.console').keydown(function(event) {

    switch (event.which) {
        //backspace
        case 8:
        case 46:
            return sql_console.cursor_control();

        // enter
        case 13:
            sql_console.run_query();
            return false;

        // up - cycle through history
        case 38:
            sql_console.cycle_history('up');
            return false;

        // down - cycle through history
        case 40:
            sql_console.cycle_history('down');
            return false;

        // left - skip left a word from cursor position
        case 37:
            if (event.ctrlKey) {
                // skip word left
                // not implemented - just use normal OS key combos for this (mac: option + left/right, linux/win: ctrl + left/right)
                return false;
            }
            else {
                // prevent arrow left into mysql> prompt
                return sql_console.cursor_control();
            }

        // right - skip right a word from cursor position
        case 39:
            if (event.ctrlKey) {
                // skip word right
                // not implemented - just use normal OS key combos for this (mac: option + left/right, linux/win: ctrl + left/right)
                return false;
            }
            break;

        // a - skip to beginning
        case 65:
            if (event.ctrlKey) {
                $('.console').setCursorPosition(7);
                return false;
            }
            break;

        // e - skip to end
        case 67:
            if (event.ctrlKey) {
                var end = $('.console').val().length;
                $('.console').setCursorPosition(end);
                return false;
            }
            break;

        // w - delete last word from cursor position
        case 87:
            if (event.ctrlKey) {
                sql_console.delete_word();
                return false;
            }
            break;
    }
});

// borrowed from http://stackoverflow.com/questions/1891444/cursor-position-in-a-textarea-character-index-not-x-y-coordinates
$.fn.getCursorPosition = function() {
    var el = $(this).get(0);
    var pos = 0;
    if('selectionStart' in el) {
        pos = el.selectionStart;
    } else if('selection' in document) {
        el.focus();
        var Sel = document.selection.createRange();
        var SelLength = document.selection.createRange().text.length;
        Sel.moveStart('character', -el.value.length);
        pos = Sel.text.length - SelLength;
    }
    return pos;
}

// borrowed from http://stackoverflow.com/questions/499126/jquery-set-cursor-position-in-text-area
$.fn.setCursorPosition = function(pos) {
    if ($(this).get(0).setSelectionRange) {
        $(this).get(0).setSelectionRange(pos, pos);
    } else if ($(this).get(0).createTextRange) {
        var range = $(this).get(0).createTextRange();
        range.collapse(true);
        range.moveEnd('character', pos);
        range.moveStart('character', pos);
        range.select();
    }
}