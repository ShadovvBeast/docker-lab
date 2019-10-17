
import {model, Schema, Document} from 'mongoose';

export interface ILab extends Document {
    canonical_name: string;
    title?: string;
    docker_image: string;
    docker_port: string;
    docker_env?: string[];
}

const LabSchema = new Schema({
    canonical_name: {
        type: String,
        required: true
    },
    title: {
        type: String
    },
    docker_image: {
        type: String,
        required: true
    },
    docker_port: {
        type: String,
        required: true
    },
    docker_env: {
        type: Array,
        of: String
    }
});

export const Lab = model<ILab>('Lab', LabSchema);