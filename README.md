#Node-Warrior
A 3D multiplayer voxel game with a code gun!  It's a gun that shoots code you wrote into the world!

##Installation

Right now the server can only hold so much traffic, so you might want to run your own for you and your friends.  First you'll need to make sure you have `git` and `node` installed.

You can check this by going to your command line and typing `git -v` or `node -v` to get the current versions you have installed.  If not, install from one of these links:

Git
Node.js
    $ git clone --recursive https://github.com/kumavis/node-warrior

    $ npm install

There are then two additional build steps.  Navigate to each of the node_modules `voxel-client` and `voxel-server` and `npm install` in each of them.

Now, you should be able to run
    $ grunt --force

Grunt will now do some work for you and get the server running.

It should be running on your port 8082!  Just go into your web browser and visit `http://localhost:8002/`.

This doesn't work for me yet, but it might work for you!  Try it out!  Any extra questions should be directed to [kumavis](https://github.com/kumavis/).