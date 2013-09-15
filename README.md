# Node-Warrior
A 3D multiplayer voxel game with a code gun!
It's a gun that shoots code you wrote into the world!

## Demo
Try it out [here](http://voxel.kumavis.me/)

## Dependencies
First you'll need to make sure you have `git`, `node`, and `grunt` installed.
You can check this by going to your command line and typing `git -v`, `node -v`, `grunt -V`.
If you get a `command not found` message, install the missing tool:

* [Git](http://git-scm.com/)
* [Node.js](http://nodejs.org/)

Install [Grunt](http://gruntjs.com/) with 
`npm install -g grunt-cli`


## Installation
If you want to run your own for you and your friends:

```
git clone https://github.com/kumavis/node-warrior.git
cd node-warrior
npm install
```

To launch the game server (port 8000) and web server (port 8002) run

```
grunt
```

Grunt will now do some work for you and get the server running.
Just go into your web browser and visit `http://localhost:8002/`.

## Controls

* Press the `~` (tilde/backtick) key to toggle the code editor
