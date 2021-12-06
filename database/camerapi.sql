CREATE TABLE "camera" (
	"id" INTEGER NOT NULL,
	"name" TEXT UNIQUE NOT NULL,
	"model"	TEXT NOT NULL,
	"ip" TEXT NOT NULL,
	"streaming_port" INTEGER,
	"http_port"	INTEGER NOT NULL,
	"user" TEXT NOT NULL,
	"password" TEXT NOT NULL,
	"width"	INTEGER NOT NULL,
	"height" INTEGER NOT NULL,
	"framerate"	INTEGER NOT NULL,
	PRIMARY KEY("id")
);

CREATE TABLE "temporal_video" (
	"path" TEXT UNIQUE NOT NULL,
	"date" TEXT NOT NULL,
	"camera" INTEGER,
	PRIMARY KEY("path"),
	FOREIGN KEY(camera) REFERENCES camera(id)
);

CREATE TABLE "video" (
	"path" TEXT UNIQUE NOT NULL,
	"date" TEXT NOT NULL,
	"camera" INTEGER,
	PRIMARY KEY("path"),
	FOREIGN KEY(camera) REFERENCES camera(id)
);