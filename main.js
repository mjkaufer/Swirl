var fs = require('fs'),
    PNG = require('pngjs').PNG;

fs.createReadStream('cat.png')
    .pipe(new PNG({
        filterType: 4
    }))
    .on('parsed', function() {

        var pixelMap = {}

        var width = this.width
        var height = this.height

        var usedCoordinates = []

        for (var y = 0; y < height; y++) {
            for (var x = 0; x < width; x++) {
                var idx = (width * y + x) << 2;

                pixelMap[JSON.stringify({x: x, y: y})] = {
                    r: this.data[idx],
                    g: this.data[idx + 1],
                    b: this.data[idx + 2]
                }
                // // and reduce opacity
                // this.data[idx+3] = this.data[idx+3] >> 1;
            }
        }


        var maxRadius = 100
        for(var r = 0 ; r < maxRadius; r++)
            cycle(width/2, height/2, maxRadius - r, parseInt(r / 2))    

        


        for (var y = 0; y < height; y++) {
            for (var x = 0; x < width; x++) {
                var idx = (width * y + x) << 2;

                var pixel = pixelMap[JSON.stringify({x: x, y: y})]
                this.data[idx] = pixel.r;
                this.data[idx+1] = pixel.g;
                this.data[idx+2] = pixel.b;
                // console.log(this.data[idx], this.data[idx + 1], this.data[idx + 2])
            }
        }



        function cycle(startX, startY, radius, shiftAmount){
            console.log("Cycling at (", startX, ",", startY, ") with radius", radius, "by shift", shiftAmount)
            var coordinates = []

            // console.log("ay")
            // for(var y = 0; y < height; y++){
            //     for(var x = 0; x < width; x++){//maybe this isn't the most effective way (ok, I'm positive it isn't), but I'm on a time budget
            //         var d = Math.sqrt(Math.pow(startX - x, 2) + Math.pow(startY - y, 2))
            //         var positionString = JSON.stringify({x: x, y: y})

            //         if(Math.abs(radius - d) < 0.5 && usedCoordinates.indexOf(positionString) == -1){
            //             coordinates.push({x: x, y: y})
                        
            //         }
                    
            //         console.log((x + y * width),"/", (height * width))

            //         usedCoordinates.indexOf(positionString) == -1 && usedCoordinates.push(positionString)
            //     }
            // }

            for(var theta = 0; theta < 360; theta += 0.25){
                var thetaRad = Math.PI * theta / 180
                var x = parseInt(Math.cos(thetaRad) * radius + startX)
                var y = parseInt(Math.sin(thetaRad) * radius + startY)

                var positionString = JSON.stringify({x: x, y: y})

                usedCoordinates.indexOf(positionString) == -1 && coordinates.push(positionString) && usedCoordinates.push(positionString)// && console.log(pixelMap[{x: x, y: y}])

            }
            

            var values = []

            for(var i = 0; i < coordinates.length; i++){
                var rgb = pixelMap[coordinates[i]]
                values.push(JSON.stringify(rgb))
                // console.log(values[i])
            }

            for(var i = 0; i < coordinates.length; i++){

                pixelMap[coordinates[i]] = JSON.parse(values[(i + shiftAmount) % values.length])
                // for(var key in pixelMap[coordinates[i]])
                //     pixelMap[coordinates[i]][key] = 255-pixelMap[coordinates[i]][key]


            }


            


            
        }

        

        this.pack().pipe(fs.createWriteStream('out.png'));
    });