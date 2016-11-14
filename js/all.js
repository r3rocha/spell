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
            current_level: "easy"
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






/* sound effects */
function play_bubble() {
    // assume `sound` is a global var
    if (sound.is_on()) {
        var audio = new Audio("sound/effects/bubble.mp3");
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
