// taken from http://stackoverflow.com/a/2450976/565999
// adapted to create new array
function shuffle(arr) {
  var array = arr.slice();
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function Game(options) {
    this.theme = options.theme;
    this.language = options.language;
    this.level = options.level;
    this.$all_letters = options.all_letters;
    this.$guess = options.guess;
    this.$object = options.object;
    this.$stars = options.stars;
    this.$win_box = options.win_box;
    this.$try_again_box = options.try_again_box;

    this.$repeat_button = options.repeat_button
    this.$say_button = options.say_button
    this.$switch_button = options.switch_button
    this.$hint_button = options.hint_button
    this.word = this.pick_word();

    this.win = options.on_win;
    this.try_again = options.on_try_again;

    this._giving_hint = false;
    this._bind_buttons();
}

Game.prototype._bind_buttons = function() {
    var self = this;
    this.$repeat_button.on('click', function() {
        self.repeat();
    });
    this.$say_button.on('click', function() {
        self.play_word();
    });
    this.$switch_button.on('click', function() {
        self.reset();
    });
    this.$hint_button.on('click', function() {
        self.hint();
    });
};

Game.prototype.start_guess = function() {
    this.setup_word_letters(this.word["word"][this.language]);
    this.setup_guess_box(this.word["word"][this.language]);
    this.setup_image_box();
    this.setup_coins();
    this.setup_win_box(this.word["word"][this.language]);
    this.setup_try_again_box(this.word["word"][this.language]);
};

Game.prototype.reset = function() {
    // avoid resetting to the same word
    var word = this.pick_word();
    while (word == this.word) {
        word = this.pick_word()
    }
    this.word = word;
    this._reset();
};

Game.prototype._reset = function() {
    this.$all_letters.html('');
    this.$guess.html('');
    this.start_guess();
};

Game.prototype.setup_image_box = function() {
    this.$object.attr("src", this.word["image"]).attr("alt", this.word["alt"]);
};
Game.prototype.play_word = function() {
    var word_audio = new Audio(this.word["sound"][this.language]);
    var self = this;

    // decrement star after playing word
    word_audio.onended = function() {
        self.decrement_star();
        self.check_if_finished();
    };

    word_audio.play();
};

Game.prototype.pick_word = function() {
    return shuffle(WORDS[this.theme])[0];
};

Game.prototype.setup_word_letters = function(word) {
    var self = this;
    var letters = word.split('').concat(this.random_letters_based_on_level());
    var letters_shuffled = shuffle(letters);
    letters_shuffled.forEach(function(letter, index) {
        var $letter = $('<span class="letter">' + letter + "</span>");
        self.$all_letters.append($letter);
        $letter.draggable({
            stack: "#guess .letter",
            cursor: "move",
            revert: true,
            opacity: 0.5,
            snap: "#guess .letter",
            snapMode: "inner",
            start: play_bubble,
        });
    });
    var handleDrop = function(event, ui) {
        ui.draggable.draggable( 'option', 'revert', false );
        ui.draggable.removeClass("over-wrong").removeClass("over-right");
        ui.draggable.css("left", 0);
        ui.draggable.css("top", 0);
    };
    var handleOut = function(event, ui) {
        ui.draggable.draggable( 'option', 'revert', true);
    };
    self.$all_letters.droppable({
        classes: {"ui-droppable-hover": "drop-over"},
        drop: handleDrop,
        accept: "#all-letters .letter.over-right, #all-letters .letter.over-wrong",
        out: handleOut,
    });
};

Game.prototype.random_letters_based_on_level = function() {
    var extra_letters = [];
    var alphabet = shuffle("abcdefghijklmnopqrstuvwxyz".split(''));
    if (this.level === "easy") {
        // dont add letters
    } else if (this.level === "medium") {
        // add one extra letter
        extra_letters.push(alphabet[0]);

    } else if (this.level === "hard") {
        // add two extra letters
        extra_letters.push(alphabet[0]);
        extra_letters.push(alphabet[1]);
    }
    return extra_letters;
};

Game.prototype.setup_guess_box = function(word) {
    var self = this;
    word.split('').forEach(function(letter, index) {
        var $letter = $('<span class="letter" data-expected="' + letter + '">&nbsp;</span>');
        self.$guess.append($letter);
        var handleDrop = function(event, ui) {
            ui.draggable.draggable( 'option', 'revert', false );
            ui.draggable.position({of: $(this), my: 'left top', at: 'left top'});
            var got = ui.draggable.text();
            var expected = $(this).data( 'expected' );
            console.log(expected, got);
            if (got === expected) {
                ui.draggable.removeClass("over-wrong").addClass("over-right");
            } else {
                ui.draggable.removeClass("over-right").addClass("over-wrong");
                self.decrement_star();
            }
            $(this).html(got);
            self.check_if_finished();
        };
        var handleOut = function(event, ui) {
            ui.draggable.draggable( 'option', 'revert', true);
            $(this).html('&nbsp;');
        };
        $letter.droppable({
            accept: "#all-letters .letter",
            drop: handleDrop,
            out: handleOut,
            classes: {"ui-droppable-hover": "over"}
        });
    });
};

Game.prototype.setup_coins = function() {
    this.$stars.find(".star").removeClass("off").addClass("on");
};

Game.prototype.setup_win_box = function(word) {
    var self = this;
    self.$win_box.html('');
    word.split('').forEach(function(letter, index) {
        self.$win_box.append($('<span class="win-letter">' + letter + "</span>"));
    });
};

Game.prototype.setup_try_again_box = function(word) {
    var self = this;
    self.$try_again_box.html('');
    word.split('').forEach(function(letter, index) {
        if (Math.random() < 0.5) {
            self.$try_again_box.append($('<span class="try-letter">*</span>"'));
        } else {
            self.$try_again_box.append($('<span class="try-letter">' + letter + "</span>"));
        }
    });
};

Game.prototype.check_if_finished = function () {
    var guessed_word = this.$guess.text().replace(/\s/g, '');
    var word = this.word["word"][this.language];
    var positive_coins = this.$stars.find(".on").size();
    if (guessed_word.length === word.length) {
        if (guessed_word === word) {
            var points = positive_coins * this.get_level_points();
            this.win(positive_coins, points);
        } else {
            this.try_again();
        }
    } else if (positive_coins === 0) {
        this.try_again();
    }
};

Game.prototype.get_level_points = function() {
    if (this.level === "easy") {
        return 10;
    } else if (this.level === "medium") {
        return 20;
    } else if (this.level === "hard") {
        return 30;
    } else {
        // ERROR, there should only be the options above
        return 0;
    }
};

Game.prototype.hint = function() {
    if (this._giving_hint) {
        return;
    }
    this._giving_hint = true;

    // wait 1 second and then decrement a star (and play sound)
    var self = this;
    setTimeout(function() {
        self.decrement_star();
    }, 1000);

    var $all_visible_letters = this.$all_letters.find("*:not(.over-right):not(.over-wrong)");
    var index = Math.floor(Math.random() * $all_visible_letters.size());
    var $origin = $all_visible_letters.eq(index);
    var letter = $origin.text();
    var $destination = this.$guess.find('*').filter(function() {
        return $(this).data('expected') === letter && $(this).html() === "&nbsp;";
    }).first();
    var origin_pos = $origin.offset();
    var destination_pos = $destination.offset();
    if (!destination_pos || !origin_pos) {
        console.log("here")
    }
    var destination_coords = {
        top: destination_pos.top - origin_pos.top,
        left: destination_pos.left - origin_pos.left
    };
    var self = this;
    $origin.css('opacity', '0.5').animate(destination_coords, 1000, function() {
        $origin.css('opacity', '1').addClass("over-right");
        $destination.html(letter);
        self._giving_hint = false;
        self.check_if_finished();
    });
};

Game.prototype.repeat = function() {
    this._reset(this.word);
};

Game.prototype.change_language = function(lang) {
    this.language = lang;
    this._reset();
};

Game.prototype.decrement_star = function() {
    this.$stars.find(".on").first().removeClass("on").addClass("off");
    play_boing();
};
