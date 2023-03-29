import { component } from 'riot';
import Taxonomy from './tags/taxonomy.riot';

const createApp = component(Taxonomy);

for (let i = 0; i < document.getElementsByTagName('taxonomy').length; i++) {
  createApp(document.getElementsByTagName('taxonomy').item(i));
}
