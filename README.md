How to set up the Screeps Control Codebase

1. Go to %appdata%/Locale/Screeps/scripts/default
2. Execute git clone <HTTPS link>
3. Move all files including the hidden .git folder to default (or the game won't read any code from the screeps folder
4. It status to confirm all is ok
5. Hover over require in main and enable Node.js 
6. Hover over lodash for a npm install shortcut.

happy coding.

Note on installing Labs:
              8
              9
             10
              7  
            _____
 4 | 6 | 3 | CCC | 2 | 5 | 1 |

Special emphasis on the vertical positioning. Reasons are that the engine
finds labs as first build first found. Thus 7 and 8 will recieve materials, while 9 and 10 will produce.
To preserve the pattern: 2 sides produce in the center, it has to be based in that build order.

Note.js Not installed: then download, install and go to settings of PHP storm, point it (C:ProgramFiles/Nodejs/node.exe). also set npm by finding its exe. (can happen automatically)

Version 1.0.0 - Project for now is ended. This version is stable and has all functionality operational.
    - TODO: Automated Trade Manager
            Further resolution in Manager Stogarge Clear/Restock. Including but not limited to dinamic Storage management based on demand
Version 2.0.0 - to be planned. Potentially may include OOP if platform allows this. else move on to different project
V2 should have improved Memory usage in support of reduced CPU usage.