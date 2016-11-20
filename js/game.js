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
                this.$all_letters = options.all_letters;
                this.$guess = options.guess;
                this.$object = options.object;
                this.$stars = options.stars;

                this.$repeat_button = options.repeat_button
                this.$say_button = options.say_button
                this.$switch_button = options.switch_button
                this.$hint_button = options.hint_button
                this.word = this.pick_word();

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
                // TODO: only if sound is ON
                var word_audio = new Audio(this.word["sound"][this.language]);
                word_audio.play();
            };

            Game.prototype.pick_word = function() {
                return shuffle(WORDS[this.theme])[0];
            };

            Game.prototype.setup_word_letters = function(word) {
                var self = this;
                var letters_shuffled = shuffle(word.split(''));
                letters_shuffled.forEach(function(letter, index) {
                    var $letter = $('<span draggable="true"  class="letter">' + letter + "</span>");
                    self.$all_letters.append($letter);
                    $letter.on("dragstart", function(event) {
                        event.originalEvent.dataTransfer.setData("text", letter + index);
                        event.originalEvent.dataTransfer.effectAllowed = "move";

                    });
                });
            };

            Game.prototype.setup_guess_box = function(word) {
                var self = this;
                word.split('').forEach(function(letter, index) {
                    var $letter = $('<span class="letter" data-expected="' + letter + '">&nbsp;</span>');
                    self.$guess.append($letter);
                    $letter.on("dragover", function(event) {
                        event.preventDefault();
                    });
                    $letter.on("dragenter", function(event) {
                        $(this).addClass("over");
                    });
                    $letter.on("dragleave", function(event) {
                        $(this).removeClass("over");
                    });
                    $letter.on("drop", function(event) {
                        event.preventDefault();
                        var letter_and_index = event.originalEvent.dataTransfer.getData("text");
                        var letter_dropped = letter_and_index[0];
                        var index = parseInt(letter_and_index.slice(1), 10);
                        self.$all_letters.find(":nth(" + index + ")").hide();
                        $(this).html(letter_dropped);
                        $(this).removeClass("over");
                        if (letter_dropped === letter) {
                            $(this).addClass("over-right");
                        } else {
                            $(this).addClass("over-wrong");
                            self.decrement_star();
                        }
                        self.check_if_finished();
                    });
                });
            };

            Game.prototype.setup_coins = function() {
                this.$stars.find(".star").removeClass("off").addClass("on");
            };

            Game.prototype.check_if_finished = function () {
                var guessed_word = this.$guess.text().replace(/\s/g, '');
                var word = this.word["word"][this.language];
                if (guessed_word.length === word.length) {
                    if (guessed_word === word) {
                        this.win();
                    } else {
                        this.lose();
                    }
                }
                if (this.$stars.find(".on").size() === 0) {
                    this.lose();
                }
            };

            Game.prototype.hint = function() {
                if (this._giving_hint) {
                    return;
                }
                this._giving_hint = true;
                this.decrement_star();
                var $all_visible_letters = this.$all_letters.find("*:visible");
                var index = Math.floor(Math.random() * $all_visible_letters.size());
                var $origin = $all_visible_letters.eq(index);
                var letter = $origin.text();
                var $destination = this.$guess.find('*[data-expected="' + letter + '"]').not(".over-right").first();
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
                    $origin.hide();
                    $destination.html(letter).addClass("over-right");
                    self._giving_hint = false;
                    self.check_if_finished();
                });
            };

            Game.prototype.repeat = function() {
                this._reset(this.word);
            };

            Game.prototype.win = function() {
                console.log("win");
                var audio = new Audio("sound/effects/win.mp3");
                audio.play();

            };

            Game.prototype.lose = function() {
                console.log("lose");
                var audio = new Audio("sound/effects/tryagain.mp3");
                audio.play();
            };

            Game.prototype.change_language = function(lang) {
                this.language = lang;
                this._reset();
            };

            Game.prototype.decrement_star = function() {
                this.$stars.find(".on").first().removeClass("on").addClass("off");
            };


            var game = new Game({
                theme: "animals",
                language: "en-us",
                all_letters: $("#all-letters"),
                guess: $("#guess"),
                object: $(".object .item"),
                stars: $("#stars"),

                repeat_button: $(".repeat"),
                say_button: $(".say"),
                switch_button: $(".switch"),
                hint_button: $(".hint"),
            });
            game.start_guess();
