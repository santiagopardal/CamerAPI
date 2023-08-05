BEGIN;

INSERT INTO
    camera (id, name, model, ip, streaming_port, http_port, user, password, width, height, framerate, node)
VALUES
    (1, 'Front Yard', 'FI9803PV3', '192.168.0.131', 554, 80, 'admin', '*{-4s#aG*_>2', 1280, 720, 23, 1);

INSERT INTO
    camera (id, name, model, ip, streaming_port, http_port, user, password, width, height, framerate, node)
VALUES
    (2, 'Back Yard', 'FI9803PV3', '192.168.0.132', 554, 80, 'admin', '*{-4s#aG*_>2', 1280, 720, 23, 1);

INSERT INTO
    camera (id, name, model, ip, streaming_port, http_port, user, password, width, height, framerate, node)
VALUES
    (3, 'Back Yard 2', 'FI9803PV3', '192.168.0.130', 554, 80, 'admin', '*{-4s#aG*_>2', 1280, 720, 23, 1);

INSERT INTO
    camera (id, name, model, ip, streaming_port, http_port, user, password, width, height, framerate, node)
VALUES
    (4, 'Front Yard 2', 'FI89182', '192.168.0.133', NULL, 80, 'admin', '*{-4s#aG*_>2', 640, 480, 15, 1);

INSERT INTO cameraConfigurations (camera, recording, sensitivity) VALUES (1, 0, 0.5);
INSERT INTO cameraConfigurations (camera, recording, sensitivity) VALUES (2, 0, 0.5);
INSERT INTO cameraConfigurations (camera, recording, sensitivity) VALUES (3, 0, 0.5);
INSERT INTO cameraConfigurations (camera, recording, sensitivity) VALUES (4, 0, 0.5);
COMMIT;