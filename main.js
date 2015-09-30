var fs = require('fs'),
	PNG = require('pngjs').PNG,
	readline = require('readline')

var rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

rl.question("Input file: ", function(file){
    fs.createReadStream(file)
        .pipe(new PNG({
            filterType: 4
        }))
        .on('parsed', function() {

            var pixelMap = {}

            var self = this
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

            rl.question("x position: ", function(x0){
                rl.question("y position: ", function(y0){
                    rl.question("radius: ", function(maxRadius){
                        x0 = parseInt(x0)
                        y0 = parseInt(y0)
                        maxRadius = parseInt(maxRadius)


                        for(var r = 0 ; r < maxRadius; r++)
                            cycle(x0, y0, maxRadius - r, parseInt(r / 2))    

                        for (var y = 0; y < height; y++) {
                            for (var x = 0; x < width; x++) {
                                var idx = (width * y + x) << 2;

                                var pixel = pixelMap[JSON.stringify({x: x, y: y})]
                                self.data[idx] = pixel.r;
                                self.data[idx+1] = pixel.g;
                                self.data[idx+2] = pixel.b;
                                // console.log(this.data[idx], this.data[idx + 1], this.data[idx + 2])
                            }
                        }

                        self.pack().pipe(fs.createWriteStream('out-' + file));
                        rl.close()
                        
                    })
                })
            })





            function cycle(startX, startY, radius, shiftAmount){
                console.log("Cycling at (", startX, ",", startY, ") with radius", radius, "by shift", shiftAmount)
                var coordinates = []

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

                for(var i = 0; i < coordinates.length; i++)
                    pixelMap[coordinates[i]] = JSON.parse(values[(i + shiftAmount) % values.length])

            }            

        });    
    // rl.close()
})

