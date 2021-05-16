var weather = require('./routes/dbfunctions');

module.exports = function (socket) {
    socket.on('join', function (data) {
        socket.emit('send data', { id: socket.id, username: data.username });

        const weatherData = weather.getActualConditions('OpenWeather');
        weatherData.then(function (result) {
            socket.emit("actual condition data", { weatherData: result });
        })
    });

    socket.on('get actual conditions', function (data) {
        console.log('Recived actual condition request');
        console.log(data.service);
        console.log(data.days);
        console.log(data.email);

        const weatherData = weather.getActualConditions(data.service);
        weatherData.then(function (result) {
            socket.emit("actual condition data", { weatherData: result });
        })
    });

    socket.on('get avarage', function (data) {
        console.log('Recived avarage request');
        console.log(data.service);
        console.log(data.days);
        console.log(data.email);

        const weatherData = weather.getAvgDaysService(data.days, data.service);
        weatherData.then(function (result) {
            socket.emit("avarage data", { weatherData: result });
        })
    });

    socket.on('get standard deviataion', function (data) {
        console.log('Recived standard deviataion request');
        console.log(data.city);
        console.log(data.days);
        console.log(data.email);

        const wData = weather.getStandardDev(data.city, data.days);
        wData.then(function (result) {
            socket.emit("standard deviataion data", { weatherData: result });
        })
    });

    socket.on('disconnect', function () {
        console.log('Client disconnected');
    });
}