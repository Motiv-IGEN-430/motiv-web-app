function BluetoothSetup({ updateReps }) {
  let last5Angles = []
  let averageAngle
  let last3AverageAngles = []
  let aboveThreshold = false
  let halfReps = 0
  let prevFullReps = 0
  let fullReps = 0
  let newMaxAngle = 0
  let maxAngle = 0

  function handleClick() {
    console.log("HandleClick ran")
    navigator.bluetooth.requestDevice({ filters: [{ 
      name: ['Motiv_Sensor_Master'] 
    }],
    optionalServices: ['4fafc201-1fb5-459e-8fcc-c5c9c331914b'] // Required to access service later.
    })
    .then(device => device.gatt.connect())
    .then(server => {
      // Getting  Service…
      return server.getPrimaryService('4fafc201-1fb5-459e-8fcc-c5c9c331914b');
    })
    .then(service => {
      // Getting Characteristic…
      return Promise.all([
        service.getCharacteristic('beb5483e-36e1-4688-b7f5-ea07361b26a8')
          .then(handleCharacteristic)
      ])
    })
  }

  function handleCharacteristic(characteristic) {
    setInterval(() => {
      //console.log("handleChar ran")
      
      return characteristic.readValue()
      .then(value => {
        //const [angle, setAngle] = useState(0)
        
        let angle = value.getInt8(0); 
        
       /*  if(angle > 255/2){  //getting signed angles from unsigned int value
            angle = angle - 255; 
        } */

        if(last5Angles.length < 5) {//change to accept positive or negative angles
          last5Angles.push(angle)
        }
        else {
          last5Angles.unshift(angle)
          last5Angles.pop()
  
          let sum = last5Angles.reduce((a, b) => a + b, 0);
          averageAngle = sum / last5Angles.length
  
          console.log(averageAngle)
          
          if(last3AverageAngles.length < 3){
            last3AverageAngles.push(averageAngle)
          }
          else {
            last3AverageAngles.unshift(averageAngle)
            last3AverageAngles.pop()
            if(last3AverageAngles[0] > 45 &&
               last3AverageAngles[1] > 45 &&
               last3AverageAngles[2] > 45) {
                 if(!aboveThreshold){
                   aboveThreshold = true
                   halfReps += 1
                 }
               }
            if(last3AverageAngles[0] < 45 &&
            last3AverageAngles[1] < 45 &&
            last3AverageAngles[2] < 45) {
              if(aboveThreshold){
                aboveThreshold = false
                halfReps += 1
              }
            }
  
            prevFullReps = fullReps
            fullReps = Math.floor(halfReps / 2)
  
            if(fullReps > prevFullReps) {
              updateReps()
            }
  
            newMaxAngle = Math.max.apply(Math, last3AverageAngles)
            if(newMaxAngle > maxAngle){
              maxAngle = newMaxAngle
            }
            console.log(`max angle IMU: ${maxAngle}`)
          
            }
          }
        //IMUToData(angle)//to be compared with CV angle and/or then used in rep counting or try angle.onchange ??? 
      })
    }, 500)
  }

  return (
    <div>
      <div style={styles.button} onClick={handleClick}>Connect to Bluetooth</div>
    </div>
  );
}

export default BluetoothSetup;

const styles = {
    button: {
        height: '3rem',
        width: '16rem',
        backgroundColor: '#a3dfff',
        borderRadius: 20,
        border: '1px solid #4f4f4f',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#4f4f4f',
        fontSize: '1.25rem',
        fontWeight: '600',
        cursor: 'pointer',
        margin: '1rem'
    }
}