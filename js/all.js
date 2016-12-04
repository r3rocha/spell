function get_email(user) {
    var email = user + "@example.com";
    return email;
}

function get_password(pass) {
    var password = "passwordprefix+" + pass;
    return password;
}

function signup_user(user, pass, secret) {
    var email = get_email(user);
    var password = get_password(pass);
    console.log("signup user", user);
    firebase.auth().createUserWithEmailAndPassword(email, password).then(function(result) {
        console.log(result, result.uid);
        console.log("set password recovery");
        database.ref("/password_recovery/" + user + secret).set(password);
        database.ref("/users/" + result.uid).set({
            username: user,
            coins: 0,
            current_level: "easy",
            avatar: "01.svg",
        });
    }).catch(function(error) {
        console.log(error);
    });
}

function setup_coins($elem) {
    var uid = firebase.auth().currentUser.uid;            
    database.ref("/users/" + uid + "/coins").on('value', function(result) {
        $elem.html(result.val());
    });
}

function setup_locked_coins($elems) {
    // disable click on every element from $elems
    $elems.each(function() {
        $(this).on('click', function(event) {
            event.preventDefault();
        });
    });
    // get coins value from database
    var uid = firebase.auth().currentUser.uid;
    database.ref("/users/" + uid + "/coins").on('value', function(result) {
        var user_coins = result.val();
        $elems.each(function() {
            var minimum_coins = parseInt($(this).data('minimum-coins'), 10);
            // check if this category is unlocked
            if (user_coins >= minimum_coins) {
                // hide locker box
                $(this).find(".unlock-coins-box").hide();
                // remove click disable
                $(this).unbind('click');
            }
            // change opacity afterwards to avoid visual flicker
            $(this).css('opacity', 1);
        });
    });
}

function setup_avatar($elem, prefix) {
    var uid = firebase.auth().currentUser.uid;
    database.ref("/users/" + uid + "/avatar").on('value', function(result) {
        $elem.attr("src", prefix + "/" + result.val());
    });
}

function setup_change_avatar($avatars, $next, callback) {
    $avatars.on('click', function() {
        $(".avatar-selected").removeClass("avatar-selected");
        $(this).addClass("avatar-selected");
    });
    $next.on('click', function() {
        var src = $(".avatar-selected img").attr("src");
        var avatar = src.split("/").reverse()[0];
        console.log('changing avatar to', avatar);
        change_avatar(avatar);
        callback();
    });
}

function change_avatar(value) {
    var uid = firebase.auth().currentUser.uid;
    database.ref("/users/" + uid + "/avatar").set(value);
}

function setup_level($elems) {
    get_current_level(function (current_level) {
        console.log("current_level", current_level);
        var $current_level = $elems.filter("[data-level=" + current_level + "]");
        select_level($current_level, $elems);
    });
    $elems.on('click', function() {
        select_level($(this), $elems);
        var level = $(this).attr("data-level");
        save_level(level);
    });
}

function select_level($elem, $elems) {
    $elems.removeClass("active");
    $elems.addClass("inactive");
    $elem.removeClass("inactive").addClass("active");
}

function save_level(level) {
    var uid = firebase.auth().currentUser.uid;
    database.ref("/users/" + uid + "/current_level").set(level);
}

function get_current_level(callback) {
    var uid = firebase.auth().currentUser.uid;
    database.ref("/users/" + uid + "/current_level").once('value', function(result) {
        callback(result.val());
    });
}

function remember_password(user, code, callback) {
    database.ref("/password_recovery/" + user + code).once('value', function(r) {
        callback(r.val());
    });
}

function load_old_users($old_users) {
    if (localStorage["spell_game:users"]) {
        var old_users = JSON.parse(localStorage["spell_game:users"]);
        console.log(old_users);
        old_users.forEach(function(user, index) {
            $old_users.append('<button class="button" type="button"><img class="avatar" src="images/avatar/' + user.avatar + '" alt="player" data-pass="' + user.pass + '"><span>' + user.user + '</span></button>');
        });
    }
}


/* sound effects */
function play_bubble() {
    // assume `sound` is a global var
    if (sound.is_on()) {
        var audio = new Audio("sound/effects/bubble.mp3");
        audio.play();
    }
}

function play_click() {
    // assume `sound` is a global var
    if (sound.is_on()) {
        var audio = new Audio("sound/effects/click.mp3");
        audio.play();
    }
}

function play_pop() {
    // assume `sound` is a global var
    if (sound.is_on()) {
        var audio = new Audio("sound/effects/bubble-pop.mp3");
        audio.play();
    }
}

function play_reload() {
    // assume `sound` is a global var
    if (sound.is_on()) {
        var audio = new Audio("sound/effects/reload.mp3");
        audio.play();
    }
}

function play_pop2() {
    // assume `sound` is a global var
    if (sound.is_on()) {
        var audio = new Audio("sound/effects/pop.mp3");
        audio.play();
    }
}

/* sound */

OnOffState = function(name, $elem) {
    this.name = name;
    this.local_storage_name = "spell_game:" + this.name + "_state";
    this.$elem = $elem;
}
OnOffState.prototype.is_on = function() {
    return (!(this.local_storage_name in localStorage) ||
            localStorage.getItem(this.local_storage_name) == "on");

}
OnOffState.prototype.turn_off = function() {
    console.log(this.name, "off");
    this.$elem.addClass(this.name + "-off");
    return localStorage.setItem(this.local_storage_name, "off");
}
OnOffState.prototype.turn_on = function() {
    console.log(this.name, "on");
    this.$elem.removeClass(this.name + "-off");
    return localStorage.setItem(this.local_storage_name, "on");
}
OnOffState.prototype.toggle = function() {
    if (this.is_on()) {
        this.turn_off();
    } else {
        this.turn_on();
    }
}
OnOffState.prototype.setup_click = function() {
    var self = this;
    this.$elem.on('click', function() {
        self.toggle();
    });
}
OnOffState.prototype.setup_initial_state = function() {
    if (this.is_on()) {
        this.turn_on();
    } else {
        this.turn_off();
    }

}
function setup_sound($elem) {
    var sound = new OnOffState("sound", $elem);
    sound.setup_initial_state();
    sound.setup_click();
    return sound;
}

function setup_music($elem) {
    var music = new OnOffState("music", $elem);
    music.setup_initial_state();
    music.setup_click();
    return music;
}
