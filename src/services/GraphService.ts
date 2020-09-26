import { gql } from '@apollo/client';

export interface IGraphService {

}

export interface IEnterpriseBlock {
    name: string,
    tasks: ITask[]
}

export interface ITask {
    date: string;
    employee: string;
    type: string;
    hours: number;
    tractorHours?: number;
}

export class GraphService {

    public static readonly Mutations = {
        POST: gql`
            mutation ($tasks: [TaskInput!]!, $enterprise: String!) {
                post(tasks: $tasks, enterprise: $enterprise) {
                    id
                }
            }
        `,

        RESET_DATABASE: gql`
            mutation {
                resetDatabase
            }
        `
    };

}