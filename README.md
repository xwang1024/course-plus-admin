# course-plus-admin

This is a admin system for Course+

### Dependency
* node.js 4.5.0+
* npm 2.15.9+
* mysql
* bower (global)
* gulp (global)
* pm2 (global, optional)
* LiveReload (Browser plugin, optional)

### How to development

First, you should open two terminal, one for frontend and another for backend.

##### Create database

You can make a custom name, and you should config it in next step.

##### Set up your config

1. open file `lib/config.js` and `front/scripts/base/constants.js`.
2. check all attributes in these file and set your own.

##### Build frontend and start file watch thread.

1. git pull
1. cd course-plus-admin/front
1. npm install
1. bower install
1. gulp

##### Start Server.

1. open another terminal
1. cd course-plus-admin
1. npm install
1. npm start

##### Open browser.
