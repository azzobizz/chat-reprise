import { InquirerFrontend } from './frontends/inquirer/index';

const frontend = new InquirerFrontend();
frontend.start().catch(console.error);