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
    if (is_sound_on()) {
        var audio = new Audio("sound/effects/bubble.mp3");
        audio.play();
    }
}

function is_sound_on() {
    return !("spell_game:sound_state" in localStorage) || localStorage.getItem("spell_game:sound_state") == "on";
}

function set_sound_off($elem) {
    console.log("sound off");
    $elem.addClass("sound-off");
    return localStorage.setItem("spell_game:sound_state", "off");
}

function set_sound_on($elem) {
    console.log("sound on");
    $elem.removeClass("sound-off");
    return localStorage.setItem("spell_game:sound_state", "on");
}

function toggle_sound($elem) {
    if ($elem.hasClass('sound-off')) {
        set_sound_on($elem);
    } else {
        set_sound_off($elem);
    }
}

function setup_sound($elem) {
    if (is_sound_on()) {
        set_sound_on($elem);
    } else {
        set_sound_off($elem);
    }
    $elem.on('click', function() {
        toggle_sound($(this));
    });
}
