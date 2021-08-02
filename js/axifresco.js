function send_request(data, endpoint) {
    let r = new XMLHttpRequest();
    r.open("POST", "http://127.0.0.1:5000/" + endpoint, true);
    r.onreadystatechange = function () {
        if (r.readyState != 4 || r.status != 200) return;
    };
    r.send(JSON.stringify(data));
}


function axi_draw(shapes) {
    buffer = [];
    for (let i = 0; i < shapes.length; i++) {
        buffer.push(shapes[i].toJSON());
    }
    send_request(shapes, "draw");
    console.log('Sent shapes to draw by axidraw');
}

function axi_config(config) {
    send_request(shapes, "config");
    console.log('Sent config to axidraw');
}

function axi_canvas_size(width, height) {
    send_request({w: width, h: height}, 'canvas_size')

    print('Sent canvas size to axidraw')
}