CREATE TABLE node (
    id INTEGER NOT NULL,
    ip TEXT NOT NULL,
    port INTEGER NOT NULL,
    last_request TEXT NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE camera (
	id INTEGER NOT NULL,
	name TEXT UNIQUE NOT NULL,
	model TEXT NOT NULL,
	ip TEXT NOT NULL,
	streaming_port INTEGER,
	http_port INTEGER NOT NULL,
	user TEXT NOT NULL,
	password TEXT NOT NULL,
	width INTEGER NOT NULL,
	height INTEGER NOT NULL,
	framerate INTEGER NOT NULL,
	node INTEGER NOT NULL,
	PRIMARY KEY (id),
	FOREIGN KEY (node) REFERENCES node(id)
);

CREATE TABLE cameraConfigurations (
    camera INTEGER NOT NULL UNIQUE,
    recording INTEGER NOT NULL,
    sensitivity FLOAT NOT NULL,
    PRIMARY KEY (camera),
    FOREIGN KEY (camera) REFERENCES camera(id)
);

CREATE TABLE video (
    id INTEGER NOT NULL,
	path TEXT UNIQUE NOT NULL,
	date TEXT NOT NULL,
	camera INTEGER NOT NULL,
	node INTEGER NOT NULL,
	is_temporal TINYINT NOT NULL DEFAULT 1,
	is_in_node TINYINT NOT NULL,
	PRIMARY KEY (id),
	FOREIGN KEY (camera) REFERENCES camera(id) ON DELETE CASCADE,
	FOREIGN KEY (node) REFERENCES node(id) ON DELETE CASCADE
);

CREATE TABLE connection(
    id INTEGER NOT NULL,
    camera INTEGER NOT NULL,
    message TEXT NOT NULL,
    date DATE NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (camera) REFERENCES camera(id) ON DELETE CASCADE
);
