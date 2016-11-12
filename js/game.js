// taken from http://stackoverflow.com/a/2450976/565999
            function shuffle(array) {
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

            function Game(words, $all_letters, $guess) {
                this.words = words;
                this.$all_letters = $all_letters;
                this.$guess = $guess;
            }

            Game.prototype.start_guess = function() {
                var word = this.pick_word();
                this.setup_word_letters(word);
                this.setup_guess_box(word);
            };

            Game.prototype.pick_word = function() {
                return shuffle(this.words)[0];
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
                        }


                    });
                });
            };

            var game = new Game(["turtle", "hello"], $("#all-letters"), $("#guess"));
            game.start_guess();