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
        });
    }).catch(function(error) {
        console.log(error);
    });
}

function setup_coins() {
    var uid = firebase.auth().currentUser.uid;            
    database.ref("users/" + uid + "/coins").on('value', function(result) {
        $("#usercoins .coins").html(result.val());
    });
}