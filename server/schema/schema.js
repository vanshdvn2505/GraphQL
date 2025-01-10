import { clients, projects } from "../sampleData.js";
import { GraphQLEnumType, GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLSchema, GraphQLString } from "graphql";
import Client from '../models/Client.js'
import Project from "../models/Project.js";


// We have to define types for different data
const ClientType = new GraphQLObjectType({
    name: 'Client',
    fields: () => ({
        id: {type: GraphQLID},
        name: {type: GraphQLString},
        email: {type: GraphQLString},
        phone: {type: GraphQLString}
    })
})

const ProjectType = new GraphQLObjectType({
    name: 'Project',
    fields: () => ({
        id: {type: GraphQLID},
        name: {type: GraphQLString},
        description: {type: GraphQLString},
        status: {type: GraphQLString},
        client: {
            type: ClientType,
            resolve(parent, args){
                return Client.findById(parent.clientId).exec();
            }
        }
    })
})


// Root query for getting client by id
const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        clients: {
            type: new GraphQLList(ClientType),
            resolve(parent, args){
                return Client.find().exec();
            }
        },
        client: {
            type: ClientType,
            args: {id: {type: GraphQLID}},
            resolve(parent, args){
                // return clients.find(client => client.id == args.id);
                return Client.findById(args.id);
            }
        },

        projects: {
            type: new GraphQLList(ProjectType),
            resolve(parent, args){
                // return projects;
                return Project.find().exec();
            }
        },
        project: {
            type: ProjectType,
            args: {id: {type: GraphQLID}},
            resolve(parent, args){
                // return projects.find(project => project.id == args.id);
                return Project.findById(args.id).exec();
            }
        }
    }
})

const mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        addClient: {
            type: ClientType,
            args: {
                name: {type: new GraphQLNonNull(GraphQLString)},
                email: {type: new GraphQLNonNull(GraphQLString)},
                phone: {type: new GraphQLNonNull(GraphQLString)},
            },
            resolve(parent, args){
                const client = new Client({
                    name: args.name,
                    email: args.email,
                    phone: args.phone
                });
                return client.save();
            }
        },

        deleteClient: {
            type: ClientType,
            args: { id: {type: new GraphQLNonNull(GraphQLID)}},
            resolve(parent, args){
                Project.find({ clientId: args.id }).then((projects) => {
                    projects.forEach((project) => {
                      project.deleteOne();
                    });
                  });
                return Client.findByIdAndDelete(args.id).exec();
            }
        },

        addProject: {
            type: ProjectType,
            args: {
                name: {type: new GraphQLNonNull(GraphQLString)},
                description: {type: new GraphQLNonNull(GraphQLString)},
                status: {
                    type: new GraphQLEnumType({
                        name: 'ProjectStatus',
                        values: {
                            'new' : {value: 'Not Started'},
                            'progress' : {value: 'In Progress'},
                            'completed' : {value: 'Completed'},
                        }
                    }),
                    defaultValue: 'Not Started'
                },
                clientId: {type: new GraphQLNonNull(GraphQLID)}
            },
            resolve(parent, args){
                const project = new Project({
                    name: args.name,
                    description: args.description,
                    status: args.status,
                    clientId: args.clientId,
                });
                return project.save();
            }
        },

        deleteProject: {
            type: ProjectType,
            args: { id: {type: new GraphQLNonNull(GraphQLID)}},
            resolve(parent, args){
                return Project.findByIdAndDelete(args.id).exec();
            }
        },

        updateProject: {
            type: ProjectType,
            args: {
              id: { type: new GraphQLNonNull(GraphQLID) },
              name: { type: GraphQLString },
              description: { type: GraphQLString },
              status: {
                type: new GraphQLEnumType({
                  name: 'ProjectStatusUpdate',
                  values: {
                    new: { value: 'Not Started' },
                    progress: { value: 'In Progress' },
                    completed: { value: 'Completed' },
                  },
                }),
              },
            },
            resolve(parent, args) {
              return Project.findByIdAndUpdate(
                args.id,
                {
                  $set: {
                    name: args.name,
                    description: args.description,
                    status: args.status,
                  },
                },
                { new: true }
              );
            },
        },
    }
})

export const schema = new GraphQLSchema({
    query: RootQuery,
    mutation
})