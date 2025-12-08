export const Ziggy = {
    url: 'https://suratkasubag.com',
    port: null,
    defaults: {},
    routes: {
        'home': {
            uri: '/',
            methods: ['GET', 'HEAD']
        },
        'login': {
            uri: 'login',
            methods: ['GET', 'HEAD']
        },
        'logout': {
            uri: 'logout',
            methods: ['POST']
        },
        'dashboard': {
            uri: 'dashboard',
            methods: ['GET', 'HEAD']
        },
        'profile': {
            uri: 'profile',
            methods: ['GET', 'HEAD']
        },
        'profile.password.update': {
            uri: 'profile/change-password',
            methods: ['POST']
        },
        'profile.avatar.update': {
            uri: 'profile/avatar',
            methods: ['POST']
        },
        'reports.index': {
            uri: 'reports',
            methods: ['GET', 'HEAD']
        },
        'reports.store': {
            uri: 'reports',
            methods: ['POST']
        },
        'reports.show': {
            uri: 'reports/{report}',
            methods: ['GET', 'HEAD'],
            parameters: ['report']
        },
        'reports.update': {
            uri: 'reports/{report}',
            methods: ['PUT', 'PATCH'],
            parameters: ['report']
        },
        'reports.destroy': {
            uri: 'reports/{report}',
            methods: ['DELETE'],
            parameters: ['report']
        },
        'reports.download': {
            uri: 'reports/{report}/download',
            methods: ['GET', 'HEAD'],
            parameters: ['report']
        },
        'users.index': {
            uri: 'users',
            methods: ['GET', 'HEAD']
        },
        'users.store': {
            uri: 'users',
            methods: ['POST']
        },
        'users.show': {
            uri: 'users/{user}',
            methods: ['GET', 'HEAD'],
            parameters: ['user']
        },
        'users.update': {
            uri: 'users/{user}',
            methods: ['PUT', 'PATCH'],
            parameters: ['user']
        },
        'users.destroy': {
            uri: 'users/{user}',
            methods: ['DELETE'],
            parameters: ['user']
        },
        'departments.index': {
            uri: 'departments',
            methods: ['GET', 'HEAD']
        },
        'departments.store': {
            uri: 'departments',
            methods: ['POST']
        },
        'departments.show': {
            uri: 'departments/{department}',
            methods: ['GET', 'HEAD'],
            parameters: ['department']
        },
        'departments.update': {
            uri: 'departments/{department}',
            methods: ['PUT', 'PATCH'],
            parameters: ['department']
        },
        'departments.destroy': {
            uri: 'departments/{department}',
            methods: ['DELETE'],
            parameters: ['department']
        },
        'positions.index': {
            uri: 'positions',
            methods: ['GET', 'HEAD']
        },
        'positions.store': {
            uri: 'positions',
            methods: ['POST']
        },
        'positions.show': {
            uri: 'positions/{position}',
            methods: ['GET', 'HEAD'],
            parameters: ['position']
        },
        'positions.update': {
            uri: 'positions/{position}',
            methods: ['PUT', 'PATCH'],
            parameters: ['position']
        },
        'positions.destroy': {
            uri: 'positions/{position}',
            methods: ['DELETE'],
            parameters: ['position']
        },
        'register': {
            uri: 'register',
            methods: ['GET', 'HEAD']
        },
        'password.request': {
            uri: 'forgot-password',
            methods: ['GET', 'HEAD']
        },
        'password.email': {
            uri: 'forgot-password',
            methods: ['POST']
        },
        'password.reset': {
            uri: 'reset-password/{token}',
            methods: ['GET', 'HEAD'],
            parameters: ['token']
        },
        'password.store': {
            uri: 'reset-password',
            methods: ['POST']
        },
        'verification.notice': {
            uri: 'verify-email',
            methods: ['GET', 'HEAD']
        },
        'verification.verify': {
            uri: 'verify-email/{id}/{hash}',
            methods: ['GET', 'HEAD'],
            parameters: ['id', 'hash']
        },
        'verification.send': {
            uri: 'email/verification-notification',
            methods: ['POST']
        },
        'password.confirm': {
            uri: 'confirm-password',
            methods: ['GET', 'HEAD']
        }
    }
};

export { route } from 'ziggy-js';