$(function () {
    $("#login-btn").click(function (evt) {
        var username = $("#login-form input[name=username]").val();
        var password = $("#login-form input[name=password]").val();

        $.post("/rest/login", JSON.stringify({"username": username, "password": password}), function (data) {
            if(data.status != "SUCCESS") {
                console.debug("An error occurred while logging in")
            } else {
                $.getJSON("/rest/games", function (data) {
                    html = "";
                    for(i in data['games']) {
                        var game = data['games'][i];
                        html += "<div><a href='#' gameToken='" + game.gameToken + "'>" + game.user1 + " + " + game.user2 + "</a></div>";
                    }
                    $("#game-list").append(html);
                    $("#gamesModal ul a").click(function () {
                        initGame(this.getAttribute("gameToken"));
                        $('#registration-form').foundation('reveal', 'close');
                    })
                    $('#gamesModal').foundation('reveal', 'open');
                })

            }
        }, 'json')
    })

    $("#register-btn").click(function () {
        var username = $("#registration-form input[name=username]").val();
        var password = $("#registration-form input[name=password]").val();
        $.post("/rest/login", JSON.stringify({"username": username, "password": password}), function (data) {
            console.debug(data);
        }, 'json')

    })
});