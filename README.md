# CamerAPI

CamerAPI is the restful API designed for [CamerAI](https://github.com/santiagopardal/CamerAI). Built in NodeJS with ExpressJS and Prisma.

The idea for this API is that whoever that does not like this implementation can still use the rest of the project, this is, [CamerAI](https://github.com/santiagopardal/CamerAI) and [CamerAPP](https://github.com/santiagopardal/CamerAPP) and implementing their own API as they please, that is the reason for it being a submodule and the entire project, different microservices.

Although the project has grown a lot, there are still many things to improve, some of which are mentioned in the TODO list below.

## TODO's:

- [ ] Add authentication with JWT, both for nodes and users for [CamerAPP](https://github.com/santiagopardal/CamerAPP).
- [ ] Find a way of encrypting each camera's password in the DB.
- [ ] Create documentation for the API using Swagger.
- [ ] Integrate with AWS S3 and other storing services.
- [ ] Enable livestreaming for all the cameras, serving as a proxy to decouple the logic of the cameras from other integrations.