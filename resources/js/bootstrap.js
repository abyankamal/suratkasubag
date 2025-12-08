import axios from 'axios';
import { route as ziggyRoute } from 'ziggy-js';
import { Ziggy } from './ziggy';

// Set up axios defaults
window.axios = axios;
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Set up Ziggy route function globally
window.route = ziggyRoute;
window.Ziggy = Ziggy;