import { videoTools } from './tools/video';
import { imageTools } from './tools/image';
import { audioTools } from './tools/audio';
import { documentTools } from './tools/document';

export const toolContent = {
    ...videoTools,
    ...imageTools,
    ...audioTools,
    ...documentTools
};
